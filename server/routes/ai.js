const express = require('express');
const router = express.Router();
const { generateCallContent } = require('../services/claude');
const { getCachedContent, cacheContent } = require('../db');

router.post('/generate', async (req, res) => {
  const { contact } = req.body;
  if (!contact) return res.status(400).json({ error: 'contact data required' });

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(400).json({ error: 'ANTHROPIC_API_KEY is not configured on the server.' });
  }

  const cached = getCachedContent(contact.id);
  if (cached) {
    return res.json({
      script: cached.script,
      objection_handling: JSON.parse(cached.objection_handling),
      cached: true,
    });
  }

  try {
    const content = await generateCallContent(contact);
    cacheContent(contact.id, content);
    res.json({ ...content, cached: false });
  } catch (error) {
    console.error('AI generation error:', error.message);
    res.status(500).json({ error: 'Failed to generate content', details: error.message });
  }
});

router.post('/regenerate', async (req, res) => {
  const { contact } = req.body;
  if (!contact) return res.status(400).json({ error: 'contact data required' });

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(400).json({ error: 'ANTHROPIC_API_KEY is not configured on the server.' });
  }

  try {
    const content = await generateCallContent(contact);
    cacheContent(contact.id, content);
    res.json({ ...content, cached: false });
  } catch (error) {
    console.error('AI regeneration error:', error.message);
    res.status(500).json({ error: 'Failed to regenerate content', details: error.message });
  }
});

module.exports = router;
