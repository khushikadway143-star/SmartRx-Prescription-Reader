"""
SmartRx Assist API (FastAPI).
  * POST /v1/ocr/handwriting  : page image -> text lines, using the trained CRNN (ONNX)
  * POST /v1/records, GET /v1/records, GET /v1/records/summary : the patient's record log
  * GET  /v1/scans            : recent OCR results
Storage is SQLite (a real DBMS, zero setup). Point DB_PATH at a file, or swap sqlite3 for psycopg for PostgreSQL.
Run:  uvicorn app:app --host 0.0.0.0 --port 8000
Env:  MODEL_DIR (folder with crnn.onnx + charset.json), DB_PATH, API_TOKEN (optional bearer token)

Deliberately NOT implemented: /v1/alerts/sms, /v1/escalations. Those must call Twilio and run a timer worker;
a stub that returns "ok" without sending would make the phone think a guardian was alerted when none was.
"""
import base64
import os
import sqlite3
import time
from typing import List, Optional

import cv2
import numpy as np
from fastapi import Depends, FastAPI, Header, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from ocr_core import OnnxRecognizer

MODEL_DIR = os.getenv("MODEL_DIR", "artifacts")
DB_PATH = os.getenv("DB_PATH", "smartrx.db")
API_TOKEN = os.getenv("API_TOKEN", "")

SCHEMA = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "schema.sql")).read()

app = FastAPI(title="SmartRx Assist API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
_recognizer: Optional[OnnxRecognizer] = None


def db() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


with db() as _c:
    _c.executescript(SCHEMA)


def auth(authorization: str = Header(default="")):
    if API_TOKEN and authorization != f"Bearer {API_TOKEN}":
        raise HTTPException(401, "Invalid or missing bearer token")


def recognizer() -> OnnxRecognizer:
    global _recognizer
    if _recognizer is None:
        model, charset = f"{MODEL_DIR}/crnn.onnx", f"{MODEL_DIR}/charset.json"
        if not (os.path.exists(model) and os.path.exists(charset)):
            raise HTTPException(503, f"Model files not found in '{MODEL_DIR}'. Train with the Colab notebook first.")
        _recognizer = OnnxRecognizer(model, charset)
    return _recognizer


# ------------------------------------------------------------------ models
class OcrRequest(BaseModel):
    format: str                      # 'gray8' (raw pre-processed pixels) or 'encoded' (PNG/JPEG bytes)
    data: str                        # base64
    width: Optional[int] = None      # gray8 only
    height: Optional[int] = None     # gray8 only
    mime: Optional[str] = None


class RecordIn(BaseModel):
    id: str
    ts: str
    type: str
    doseId: Optional[str] = None
    drug: Optional[str] = None
    detail: Optional[str] = None


class RecordsIn(BaseModel):
    records: List[RecordIn]


# ------------------------------------------------------------------ routes
@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": os.path.exists(f"{MODEL_DIR}/crnn.onnx"), "time": time.time()}


@app.post("/v1/ocr/handwriting", dependencies=[Depends(auth)])
def ocr(req: OcrRequest):
    raw = base64.b64decode(req.data)
    if req.format == "gray8":
        if not (req.width and req.height) or len(raw) != req.width * req.height:
            raise HTTPException(400, "gray8 needs width and height matching the byte count")
        img = np.frombuffer(raw, np.uint8).reshape(req.height, req.width)
    elif req.format == "encoded":
        img = cv2.imdecode(np.frombuffer(raw, np.uint8), cv2.IMREAD_COLOR)
        if img is None:
            raise HTTPException(400, "Could not decode image (PNG / JPEG expected)")
    else:
        raise HTTPException(400, "format must be 'gray8' or 'encoded'")

    lines = recognizer().read_page(img)
    now = time.strftime("%Y-%m-%dT%H:%M:%S")
    with db() as c:
        c.executemany("INSERT INTO scans(created_at, source, text, confidence) VALUES (?,?,?,?)",
                      [(now, req.format, l["text"], l["confidence"]) for l in lines])
    return {"lines": lines}


@app.post("/v1/records", dependencies=[Depends(auth)])
def save_records(body: RecordsIn):
    """Idempotent: re-sending the same record id is ignored, so the phone can safely retry."""
    with db() as c:
        c.executemany(
            "INSERT OR IGNORE INTO records(id, ts, month, type, dose_id, drug, detail) VALUES (?,?,?,?,?,?,?)",
            [(r.id, r.ts, r.ts[:7], r.type, r.doseId, r.drug, r.detail) for r in body.records])
    return {"saved": len(body.records)}


@app.get("/v1/records", dependencies=[Depends(auth)])
def list_records(month: str = Query(..., pattern=r"^\d{4}-\d{2}$")):
    with db() as c:
        rows = c.execute("SELECT * FROM records WHERE month = ? ORDER BY ts", (month,)).fetchall()
    return {"month": month, "records": [dict(r) for r in rows]}


@app.get("/v1/records/summary", dependencies=[Depends(auth)])
def summary(month: str = Query(..., pattern=r"^\d{4}-\d{2}$")):
    with db() as c:
        counts = {r["type"]: r["n"] for r in c.execute(
            "SELECT type, COUNT(*) AS n FROM records WHERE month = ? GROUP BY type", (month,))}
    taken, missed = counts.get("dose_taken", 0), counts.get("dose_missed", 0)
    return {"month": month, "taken": taken, "missed": missed, "scans": counts.get("scan", 0), "sos": counts.get("sos", 0),
            "adherence_pct": round(100 * taken / (taken + missed)) if taken + missed else None}


@app.get("/v1/scans", dependencies=[Depends(auth)])
def recent_scans(limit: int = 20):
    with db() as c:
        rows = c.execute("SELECT * FROM scans ORDER BY id DESC LIMIT ?", (min(limit, 200),)).fetchall()
    return {"scans": [dict(r) for r in rows]}
