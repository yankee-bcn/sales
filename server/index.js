require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { initDb } = require('./db');
const contactsRouter = require('./routes/contacts');
const aiRouter = require('./routes/ai');
const callsRouter = require('./routes/calls');

const app = express();
app.use(cors());
app.use(express.json());

initDb();

app.use('/api/contacts', contactsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/calls', callsRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`SDR Tool server running on http://localhost:${PORT}`);
  console.log(`Mode: ${process.env.DEMO_MODE === 'true' ? 'DEMO' : 'LIVE (HubSpot)'}`);
});
