const Database = require('better-sqlite3');
const path = require('path');

let db;

function initDb() {
  db = new Database(path.join(__dirname, '../../calls.db'));
  db.exec(`
    CREATE TABLE IF NOT EXISTS call_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      contact_id TEXT NOT NULL,
      contact_name TEXT NOT NULL,
      company_name TEXT NOT NULL,
      role TEXT,
      outcome TEXT NOT NULL,
      notes TEXT,
      duration_seconds INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS generated_content (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      contact_id TEXT UNIQUE NOT NULL,
      pain_points TEXT NOT NULL,
      script TEXT NOT NULL,
      objection_handling TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  return db;
}

function getDb() {
  if (!db) initDb();
  return db;
}

function logCall(data) {
  const stmt = getDb().prepare(`
    INSERT INTO call_logs (contact_id, contact_name, company_name, role, outcome, notes, duration_seconds)
    VALUES (@contact_id, @contact_name, @company_name, @role, @outcome, @notes, @duration_seconds)
  `);
  return stmt.run(data);
}

function getCallHistory(contactId) {
  return getDb()
    .prepare('SELECT * FROM call_logs WHERE contact_id = ? ORDER BY created_at DESC')
    .all(contactId);
}

function getAllCallLogs(limit = 100) {
  return getDb()
    .prepare('SELECT * FROM call_logs ORDER BY created_at DESC LIMIT ?')
    .all(limit);
}

function getCachedContent(contactId) {
  return getDb()
    .prepare('SELECT * FROM generated_content WHERE contact_id = ?')
    .get(contactId);
}

function cacheContent(contactId, content) {
  const stmt = getDb().prepare(`
    INSERT OR REPLACE INTO generated_content (contact_id, pain_points, script, objection_handling)
    VALUES (@contact_id, @pain_points, @script, @objection_handling)
  `);
  return stmt.run({
    contact_id: contactId,
    pain_points: JSON.stringify(content.pain_points),
    script: content.script,
    objection_handling: JSON.stringify(content.objection_handling),
  });
}

module.exports = { initDb, getDb, logCall, getCallHistory, getAllCallLogs, getCachedContent, cacheContent };
