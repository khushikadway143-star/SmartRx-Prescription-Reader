# How to run SmartRx Assist

## 0. The big picture (and the honest status of the deep learning)

```
 PHONE APP (React Native)                BACKEND (backend/app.py)                COLAB NOTEBOOK (ml/)
 camera / gallery photo  --Otsu-->  POST /v1/ocr/handwriting  --ONNX CRNN-->   trains + tests + exports
 reads results aloud     <-- text lines + confidence --'                         crnn.onnx + charset.json
 saves records on phone                    |  RxNorm + OpenFDA checks happen in the app
                                           '-> SQLite/PostgreSQL (scans, records)

 WEBSITE (web/): guardian dashboard
```

* **The phone app contains no neural network.** It sends the photo to `/v1/ocr/handwriting`.
* **The model is trained in the Colab notebook** (`ml/SmartRx_Handwriting_OCR_Colab.ipynb`): CRNN (CNN + Bi-LSTM) with CTC loss, on the IAM words dataset fetched through the Kaggle API.
* **The backend runs the exported model** (`crnn.onnx`) with ONNX Runtime.
* Until you train once and copy the two model files into `backend/artifacts/`, the OCR endpoint answers `503 Model files not found`. That is intentional: it never invents text.
* **Nothing here has been trained by me.** I had no GPU or internet, so no accuracy figure exists yet. The notebook computes it on a held-out test set when you run it.

---

## 1. Train the model (Google Colab, ~30-60 min on a free T4)

1. Open `ml/SmartRx_Handwriting_OCR_Colab.ipynb` in Colab (File > Upload notebook). Runtime > Change runtime type > **T4 GPU**.
2. Kaggle API token (once, free): kaggle.com > Settings > *Create New Token*. In Colab click the key icon (Secrets) and add `KAGGLE_USERNAME` and `KAGGLE_KEY`, with notebook access on. The notebook downloads the dataset **through the API** by itself.
   * No Kaggle account? Set `USE_SYNTHETIC = True` in Step 3. The whole notebook runs on generated images; the accuracy then says nothing about handwriting.
3. Runtime > **Run all**. Read the outputs top to bottom (the step table at the top explains each one).
4. Download `smartrx_artifacts.zip` (last cell). Unzip, and put these in `backend/artifacts/`:
   `crnn.onnx`, `charset.json` (plus `metrics.json` for your report).

Accuracy is printed in **Step 10** (word accuracy, character error rate, and a confidence-threshold table).

## 2. Run the backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
MODEL_DIR=artifacts DB_PATH=smartrx.db uvicorn app:app --host 0.0.0.0 --port 8000
```
Open http://localhost:8000/health (`model_loaded: true` once the files are in place) and http://localhost:8000/docs for interactive API docs.
Optional: `API_TOKEN=somesecret` makes every `/v1/*` call require `Authorization: Bearer somesecret`.

## 3. Test the API with Postman

Postman > Import > `backend/postman_collection.json`. Collection variables: `baseUrl` (default `http://localhost:8000`) and `token` (empty unless you set `API_TOKEN`). Each request has a "status is 200" test. Run the folder with the Collection Runner.

## 4. Run on the website (guardian dashboard)

```bash
cd web
npm install
cp .env.example .env     # leave VITE_WS_URL empty for demo data
npm run dev              # http://localhost:5173
npm run build            # static files in web/dist to host anywhere
```
* **Demo data works immediately.** After ~2.5 s a missed-dose alert appears.
* **Live data needs a WebSocket server** at `VITE_WS_URL` that relays the phone's events (`dose_taken`, `dose_missed`, `sos`, `heartbeat`, ...). **`backend/app.py` does not include that server yet**, so the live link is not usable until one is written.
* **The patient app does not run on a website.** It uses the native camera, biometric lock, Keychain/Keystore, local alarms and Bluetooth, none of which exist in a browser. The website is the guardian view only.

## 5. Run on a phone

Needs Node 18+, JDK 17 + Android Studio (Android), or Xcode + CocoaPods (iPhone, Mac only). **Expo Go will not work**: the app uses native modules.

```bash
npx @react-native-community/cli init SmartRxAssist --version 0.74.5   # any recent version
cd SmartRxAssist
# copy mobile/App.tsx, mobile/index.js and mobile/src/ into this folder (replace the generated App.tsx / index.js)
npm i @react-navigation/native @react-navigation/native-stack react-native-screens react-native-safe-area-context \
  react-native-keychain react-native-quick-crypto buffer @react-native-async-storage/async-storage react-native-biometrics \
  react-native-push-notification react-native-tts @react-native-voice/voice react-native-device-info \
  @react-native-community/geolocation react-native-vision-camera vision-camera-resize-plugin react-native-worklets-core \
  react-native-image-picker jpeg-js
```
1. `babel.config.js`: `module.exports = { presets: ['module:@react-native/babel-preset'], plugins: [['react-native-worklets-core/plugin']] };`
2. **Permissions.**
   * Android `AndroidManifest.xml`: `CAMERA`, `RECORD_AUDIO`, `VIBRATE`, `POST_NOTIFICATIONS`, `USE_BIOMETRIC`, `ACCESS_FINE_LOCATION`, `SCHEDULE_EXACT_ALARM`.
   * iOS `Info.plist`: `NSCameraUsageDescription`, `NSMicrophoneUsageDescription`, `NSSpeechRecognitionUsageDescription`, `NSFaceIDUsageDescription`, `NSLocationWhenInUseUsageDescription`.
3. **Point the app at your backend**: edit `src/config/env.ts` (`API_BASE`, `OCR_ENDPOINT`, `WS_URL`).
   * Android emulator reaching your PC: `http://10.0.2.2:8000`.
   * Real phone: your PC's LAN address, e.g. `http://192.168.1.20:8000` (same Wi-Fi), or a tunnel (`cloudflared tunnel --url http://localhost:8000`) which gives an https address.
   * Plain `http://` needs `android:usesCleartextTraffic="true"` on Android during development; use https in production.
4. iPhone only: `cd ios && pod install && cd ..`
5. Run: `npx react-native run-android` or `npx react-native run-ios` (phone in developer mode, USB). Emulators do not vibrate and have no real biometrics or camera of interest, so test on a real phone.

**Unit tests:** `npx jest` runs `mobile/__tests__/logic.test.ts` (parser, month summary, voice commands, next dose).

---

## 6. Where is the data saved?

| Place | What | Why |
|---|---|---|
| **Phone, encrypted vault** (AES-256-GCM, key in Keychain/Keystore) | doses, preferences, guardians, the records log (one list per month) | works offline; private |
| **Backend DBMS** (`backend/smartrx.db`, SQLite; PostgreSQL in production) | `scans` (OCR results), `records` (synced log, indexed by month) | guardians and doctors can see it; survives a lost phone |
| **Postman** | nothing | it is only a tool that *sends requests* to the API to test it |

**Current wiring, stated plainly:** the phone app saves records locally. It does **not yet upload them** to `POST /v1/records` (the endpoint and table exist and work in Colab), and it does not call a guardian WebSocket server because none exists yet. Both are small, separate pieces of work.

Not implemented on purpose: `/v1/alerts/sms` and `/v1/escalations`. They must really send SMS (Twilio) and run a timer worker; a fake "ok" would tell the phone a guardian was alerted when nobody was. Until they exist, the app falls back to opening the phone's SMS composer.

## 7. What has been verified, and what has not

| Verified by running it here | Not run (no GPU / no internet / no device available to me) |
|---|---|
| Shared OCR module: preprocessing, CTC decoding, edit distance / CER, word accuracy | **Model training and every accuracy number** |
| Word segmentation: exact on 24 of 24 typed-font test pages (4 fonts x 6 sizes). **Typed text, not handwriting** | The Kaggle download and the real IAM dataset layout (the label parser was tested on a mock file in the standard IAM format) |
| Notebook: all 24 Python cells parse; all cells that need no PyTorch/network execute; split has no form in two sets | PyTorch cells (parse-checked only), ONNX export, live RxNorm/OpenFDA calls |
| SQLite schema and the month/adherence SQL queries | FastAPI server (compiles; never started here) |
| Postman collection generated; JSON valid | App on a real phone or emulator, native modules, Vite build |
| 6 unit tests for app logic pass; the app's TypeScript imports/exports are consistent | |
