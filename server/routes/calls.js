const express = require('express');
const router = express.Router();
const { logCall, getCallHistory, getAllCallLogs } = require('../db');

const VALID_OUTCOMES = new Set([
  'connected_interested',
  'connected_not_interested',
  'connected_callback',
  'voicemail',
  'no_answer',
  'wrong_number',
  'do_not_call',
]);

router.post('/log', (req, res) => {
  const { contact_id, contact_name, company_name, role, outcome, notes, duration_seconds } = req.body;

  if (!contact_id || !outcome) {
    return res.status(400).json({ error: 'contact_id and outcome are required' });
  }
  if (!VALID_OUTCOMES.has(outcome)) {
    return res.status(400).json({ error: `Invalid outcome. Valid values: ${[...VALID_OUTCOMES].join(', ')}` });
  }

  try {
    const result = logCall({ contact_id, contact_name, company_name, role, outcome, notes, duration_seconds });
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ error: 'Failed to log call', details: error.message });
  }
});

router.get('/history/:contactId', (req, res) => {
  try {
    const history = getCallHistory(req.params.contactId);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch call history' });
  }
});

router.get('/all', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const logs = getAllCallLogs(limit);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch call logs' });
  }
});

module.exports = router;
