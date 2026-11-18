CREATE TABLE IF NOT EXISTS scans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL,
  source TEXT,
  text TEXT NOT NULL,
  confidence REAL
);
CREATE TABLE IF NOT EXISTS records (
  id TEXT PRIMARY KEY,
  ts TEXT NOT NULL,
  month TEXT NOT NULL,          -- 'YYYY-MM', indexed for the month/year screens
  type TEXT NOT NULL,           -- started | dose_added | dose_taken | dose_missed | scan | sos
  dose_id TEXT,
  drug TEXT,
  detail TEXT
);
CREATE INDEX IF NOT EXISTS idx_records_month ON records(month);
