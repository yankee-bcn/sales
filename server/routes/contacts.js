const express = require('express');
const router = express.Router();
const { fetchContacts } = require('../services/gsheets');

router.get('/', async (req, res) => {
  if (!process.env.GOOGLE_SHEET_CSV_URL) {
    return res.status(400).json({
      error: 'GOOGLE_SHEET_CSV_URL is not set. Publish your Google Sheet to web (File → Share → Publish to web → CSV) and add the URL to .env.',
    });
  }

  try {
    const contacts = await fetchContacts();
    res.json(contacts);
  } catch (error) {
    console.error('Google Sheets fetch error:', error.message);
    res.status(500).json({ error: 'Failed to fetch contacts from Google Sheets', details: error.message });
  }
});

module.exports = router;
