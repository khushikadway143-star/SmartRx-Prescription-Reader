# SmartRx: Real-Time Prescription Reader & Reminder System

An end-to-end handwriting OCR and medication adherence web application built with **React**, **FastAPI**, and a custom **CRNN + BiLSTM + CTC** deep learning model exported to **ONNX**.

## Live Demo
- **Frontend Web App:** [Add your Vercel/Netlify Live Demo URL here]
- **GitHub Repository:** https://github.com/khushikadway143-star/SmartRx-Prescription-Reader

## Project Structure
- `smartrx/web/` — React + Vite frontend with Canvas image preprocessing, Tesseract.js fallback, Doctor Verification, Flash Reminder alerts, and Digital Prescription PDF export
- `smartrx/backend/` — FastAPI REST API (`app.py`, `ocr_core.py`), ONNX Runtime inference engine, and SQLite adherence database (`schema.sql`)
- `smartrx/ml/` — Google Colab training notebook (`SmartRx_Handwriting_OCR_Colab.ipynb`) for CRNN + BiLSTM + CTC handwriting recognition
- `smartrx/SmartRxAssist/` — Mobile companion application module
- `smartrx/docs/` — Setup and execution guide (`RUNNING.md`)

## How to Run Locally

### 1. Start the Backend (FastAPI)
```bash
cd smartrx/backend
pip install -r requirements.txt
uvicorn app:app --reload --port 8000

### 2. Start the Frontend (React + Vite)
cd smartrx/web
npm install
npm run dev

### Login Page
<img width="867" height="427" alt="image" src="https://github.com/user-attachments/assets/b069a70b-646b-4738-9d8d-651a2bdaff80" />

### Home Page
<img width="1920" height="1020" alt="image" src="https://github.com/user-attachments/assets/dbc67175-c152-4cc4-a60c-54c7b460a8b4" />

