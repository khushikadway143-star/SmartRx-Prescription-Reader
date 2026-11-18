# SmartRx Assist

**Start with `docs/RUNNING.md`**: how to run it on the website and on a phone, how the deep learning fits in, and where data is saved.

```
mobile/    React Native patient app  (screens, styles, api, services, ocr, records, accessibility ... one concern per file)
web/       Vite + React guardian dashboard
backend/   FastAPI server: serves the trained model, stores scans and records in a database, Postman collection
ml/        Google Colab notebook: data (Kaggle API) -> train -> test -> accuracy -> predict -> export -> API -> database
docs/      RUNNING.md
```

Full tree:

```
backend/
  app.py
  ocr_core.py
  postman_collection.json
  requirements.txt
  schema.sql
docs/
  RUNNING.md
ml/
  SmartRx_Handwriting_OCR_Colab.ipynb
mobile/
  App.tsx
  __tests__/
    logic.test.ts
  index.js
  src/
    accessibility/
      index.ts
      native.ts
      recognition.ts
      speech.ts
      status.ts
      vibration.ts
      vibrationLibrary.ts
      voiceCommands.ts
    api/
      auth.ts
      backend.api.ts
      http.ts
      ocr.api.ts
      openfda.api.ts
      rxnorm.api.ts
    components/
      BigButton.tsx
      BiometricGate.tsx
      ChoiceGroup.tsx
      PillButton.tsx
      RecordsCard.tsx
      ScanResults.tsx
      SwitchRow.tsx
      VibrationPicker.tsx
    config/
      env.ts
    context/
      AccessibilityContext.tsx
      DosesContext.tsx
      ServicesContext.tsx
    hooks/
      useCameraCapture.ts
      useOcrPipeline.ts
      useSosCountdown.ts
      useThemedStyles.ts
      useVoiceCommands.ts
    navigation/
      RootNavigator.tsx
      types.ts
    ocr/
      parser.ts
      preprocess.ts
      resolver.ts
    records/
      index.ts
      recordLabels.ts
      recordsStore.ts
      recordsSummary.ts
    screens/
      HistoryScreen.tsx
      HomeScreen.tsx
      ScanScreen.tsx
      SettingsScreen.tsx
    services/
      biometrics.service.ts
      eventBus.ts
      guardianLink.service.ts
      guardianSms.service.ts
      imagePicker.service.ts
      location.service.ts
      notifications.service.ts
    storage/
      vault.ts
    styles/
      common.styles.ts
      history.styles.ts
      home.styles.ts
      scanner.styles.ts
      settings.styles.ts
    theme/
      palettes.ts
    types/
      index.ts
web/
  .env.example
  demo/
    guardian-dashboard-demo.html
  index.html
  package.json
  src/
    WebDashboard.jsx
    components/
      AlertBanner.jsx
      DashboardHeader.jsx
      DevicesPanel.jsx
      NowPanel.jsx
      TodayTimeline.jsx
      WeekChart.jsx
    hooks/
      useAlertCues.js
      useGuardianFeed.js
      useNow.js
    main.jsx
    services/
      guardianSocket.js
    state/
      dashboardReducer.js
      demoData.js
    styles/
      dashboard.css
    utils/
      format.js
  vite.config.js
```

## Where to change things

| I want to change...                          | Edit this                                             |
|----------------------------------------------|-------------------------------------------------------|
| A server URL, emergency number, thresholds   | `mobile/src/config/env.ts`                            |
| Colours (day / night / contrast), text sizes | `mobile/src/theme/palettes.ts`                        |
| How a phone screen looks                     | `mobile/src/styles/<screen>.styles.ts`                |
| Vibration patterns patients can choose from  | `mobile/src/accessibility/vibrationLibrary.ts`        |
| RxNorm / OpenFDA / OCR / backend calls       | `mobile/src/api/*.api.ts`                             |
| Handwriting parsing rules (doses, 1-0-1)     | `mobile/src/ocr/parser.ts`                            |
| What gets saved as a record                  | `mobile/src/records/`                                 |
| Missed-dose and SOS rules                    | `mobile/src/services/guardianSms.service.ts`          |
| Model input size, preprocessing, decoding    | `backend/ocr_core.py` (the notebook writes the same file) |
| API routes / database tables                 | `backend/app.py`, `backend/schema.sql`                |
| Guardian dashboard layout / CSS              | `web/src/components/`, `web/src/styles/dashboard.css` |

## Not built yet
Guardian WebSocket relay server, phone-to-server record upload, Twilio SMS + escalation worker, Google Drive/iCloud sync, Bluetooth LE pairing, calendar sync, a dose-time editor, and a model fine-tuned on real prescription handwriting.
