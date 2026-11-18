"""
ocr_core.py: the pipeline shared by the training notebook and the live server.
Pure OpenCV / NumPy (+ onnxruntime for inference), so training and serving can never drift apart.

Pipeline:  page image -> Otsu binarise -> find word boxes -> crop -> resize to 32x128 -> CRNN -> CTC decode
"""
import json
import cv2
import numpy as np

IMG_H, IMG_W = 32, 128  # every word crop is resized to this
BLANK = 0               # CTC blank index; charset[i] is class i + 1


# ---------------------------------------------------------------- pre-processing
def to_gray(img: np.ndarray) -> np.ndarray:
    if img.ndim == 3:
        return cv2.cvtColor(img, cv2.COLOR_BGR2GRAY if img.shape[2] == 3 else cv2.COLOR_BGRA2GRAY)
    return img


def otsu(gray: np.ndarray) -> np.ndarray:
    """Otsu threshold. Returns ink = 0 (black) on paper = 255 (white), whatever the input polarity."""
    _, b = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    if (b == 0).mean() > 0.5:  # more black than white means we picked up an inverted page
        b = 255 - b
    return b


def preprocess_word(img: np.ndarray, use_otsu: bool = True) -> np.ndarray:
    """One word image -> float32 array (1, 32, 128) in [0, 1], white background = 1."""
    g = to_gray(img)
    if use_otsu:
        g = otsu(g)
    h, w = g.shape[:2]
    new_w = int(min(IMG_W, max(1, round(w * IMG_H / max(h, 1)))))
    r = cv2.resize(g, (new_w, IMG_H), interpolation=cv2.INTER_AREA)
    canvas = np.full((IMG_H, IMG_W), 255, np.uint8)
    canvas[:, :new_w] = r
    return (canvas.astype(np.float32) / 255.0)[None]


# ---------------------------------------------------------------- word segmentation
def _runs(flags: np.ndarray, min_gap: int):
    """Runs of True in a 1-D bool array; runs separated by fewer than `min_gap` False values are merged."""
    runs, start, gap = [], None, 0
    for i, f in enumerate(flags):
        if f:
            if start is None:
                start = i
            gap = 0
            end = i
        elif start is not None:
            gap += 1
            if gap >= min_gap:
                runs.append((start, end + 1))
                start = None
    if start is not None:
        runs.append((start, end + 1))
    return runs


def _word_gap_threshold(strips, med: float) -> float:
    """
    Learns how wide a blank gap must be to separate words. Pools every gap on the page and splits them into
    'between letters' vs 'between words' (1-D two-means). Falls back to 0.45 x writing height when the gaps
    are not clearly bimodal (for example a page with a single word per line).
    """
    gaps = []
    for strip in strips:
        runs = _runs(strip.any(axis=0), 1)
        gaps += [runs[i + 1][0] - runs[i][1] for i in range(len(runs) - 1)]
    fallback = max(3.0, 0.45 * med)
    if len(gaps) < 4:
        return fallback
    g = np.sort(np.array(gaps, dtype=np.float64))
    best, thr = -1.0, fallback
    for cut in np.unique(g)[:-1]:
        lo, hi = g[g <= cut], g[g > cut]
        score = len(lo) * len(hi) * (hi.mean() - lo.mean()) ** 2  # between-class variance
        if score > best:
            best, thr = score, (lo.mean() + hi.mean()) / 2
    lo, hi = g[g <= thr], g[g > thr]
    return float(thr) if len(hi) and len(lo) and hi.mean() / max(lo.mean(), 1) >= 1.7 else fallback


def segment_lines(img: np.ndarray):
    """
    Projection-profile segmentation for a page of horizontal text:
    split lines at blank rows, then split words at wide blank column runs.
    Returns (binary_page, lines); each line is a list of (x, y, w, h) word boxes, left to right.
    Works on clean, roughly level text. Rotated or touching lines need a real text detector (CRAFT, Document AI).
    """
    b = otsu(to_gray(img))
    ink = b == 0
    n, _, stats, _ = cv2.connectedComponentsWithStats((255 - b), connectivity=8)
    heights = [stats[i, cv2.CC_STAT_HEIGHT] for i in range(1, n) if stats[i, cv2.CC_STAT_AREA] >= 15]
    if not heights:
        return b, []
    med = float(np.median(heights))  # roughly the x-height of the writing
    spans = [(y0, y1) for y0, y1 in _runs(ink.any(axis=1), max(2, int(0.25 * med))) if ink[y0:y1].sum() >= 30]
    strips = [ink[y0:y1] for y0, y1 in spans]
    gap = _word_gap_threshold(strips, med)
    lines = []
    for (y0, _), strip in zip(spans, strips):
        boxes = []
        for x0, x1 in _runs(strip.any(axis=0), max(2, int(round(gap)))):
            rows = np.where(strip[:, x0:x1].any(axis=1))[0]
            h = rows[-1] - rows[0] + 1
            if (x1 - x0) * h >= max(60.0, med * med * 0.3):
                boxes.append((x0, y0 + int(rows[0]), x1 - x0, int(h)))
        if boxes:
            lines.append(boxes)
    return b, lines


def crop(binary: np.ndarray, box, pad: int = 3) -> np.ndarray:
    x, y, w, h = box
    H, W = binary.shape[:2]
    return binary[max(0, y - pad): min(H, y + h + pad), max(0, x - pad): min(W, x + w + pad)]


# ---------------------------------------------------------------- CTC decoding + metrics
def ctc_greedy(probs: np.ndarray, charset: list):
    """probs: (T, C) softmax output. Returns (text, confidence). Best-path decoding: collapse repeats, drop blanks."""
    best = probs.argmax(axis=1)
    out, prev, kept = [], BLANK, []
    for t, k in enumerate(best):
        if k != prev and k != BLANK:
            out.append(charset[k - 1])
        if k != BLANK:
            kept.append(probs[t, k])
        prev = k
    return "".join(out), float(np.mean(kept)) if kept else 0.0


def edit_distance(a: str, b: str) -> int:
    prev = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        cur = [i]
        for j, cb in enumerate(b, 1):
            cur.append(min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (ca != cb)))
        prev = cur
    return prev[-1]


def cer(preds, truths) -> float:
    """Character error rate = total edit distance / total reference characters."""
    return sum(edit_distance(p, t) for p, t in zip(preds, truths)) / max(1, sum(len(t) for t in truths))


def word_accuracy(preds, truths) -> float:
    return float(np.mean([p == t for p, t in zip(preds, truths)])) if truths else 0.0


# ---------------------------------------------------------------- ONNX inference
class OnnxRecognizer:
    def __init__(self, model_path: str, charset_path: str):
        import onnxruntime as ort
        self.sess = ort.InferenceSession(model_path, providers=["CPUExecutionProvider"])
        self.charset = json.load(open(charset_path))

    def predict(self, word_images, use_otsu: bool = True):
        if not word_images:
            return []
        x = np.stack([preprocess_word(w, use_otsu) for w in word_images])
        probs = self.sess.run(None, {"image": x})[0]  # (B, T, C)
        return [ctc_greedy(p, self.charset) for p in probs]

    def read_page(self, img: np.ndarray):
        """Full page -> [{'text': 'Amoxicillin 500mg', 'confidence': 0.91}, ...] (the contract the phone app expects)."""
        binary, lines = segment_lines(img)
        result = []
        for boxes in lines:
            preds = self.predict([crop(binary, b) for b in boxes], use_otsu=False)  # already binary
            if preds:
                result.append({"text": " ".join(t for t, _ in preds), "confidence": float(np.mean([c for _, c in preds]))})
        return result
