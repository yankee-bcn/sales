const express = require('express');
const router = express.Router();
const { fetchContacts } = require('../services/hubspot');
const { getDemoContacts } = require('../services/demo');

router.get('/', async (req, res) => {
  const useDemo = process.env.DEMO_MODE === 'true' || !process.env.HUBSPOT_ACCESS_TOKEN;

  if (useDemo) {
    if (!process.env.HUBSPOT_ACCESS_TOKEN) {
      console.warn('HUBSPOT_ACCESS_TOKEN not set — serving demo contacts. Set DEMO_MODE=false and add your token to use live CRM data.');
    }
    return res.json(getDemoContacts());
  }

  try {
    const limit = parseInt(req.query.limit) || 50;
    const contacts = await fetchContacts(limit);
    res.json(contacts);
  } catch (error) {
    console.error('HubSpot fetch error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch contacts from HubSpot',
      details: error.response?.data?.message || error.message,
    });
  }
});

module.exports = router;
