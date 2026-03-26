require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

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

// Serve built React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) =>
    res.sendFile(path.join(__dirname, '../client/dist/index.html'))
  );
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`SDR Tool running on http://localhost:${PORT}`);
});
