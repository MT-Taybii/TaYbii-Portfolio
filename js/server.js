/**
 * Minimal Express + MongoDB backend for the portfolio view counter.
 *
 * Endpoints:
 *   GET  /api/views            -> { views: number }            (read only, no increment)
 *   POST /api/views/increment  -> { views: number }             (increments and returns new count)
 *
 * Setup:
 *   1. cd server
 *   2. npm install
 *   3. copy .env.example to .env and fill in MONGODB_URI + ALLOWED_ORIGIN
 *   4. npm start
 *
 * Deploy anywhere that runs Node (Render, Railway, Fly.io, etc.) and a
 * MongoDB Atlas free-tier cluster. Then set API_BASE in js/script.js
 * to this server's public URL.
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'portfolio';
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';

if (!MONGODB_URI) {
  console.error('Missing MONGODB_URI in environment. See .env.example.');
  process.exit(1);
}

const app = express();
app.use(cors({ origin: ALLOWED_ORIGIN }));
app.use(express.json());

let statsCollection;

async function start() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(DB_NAME);
  statsCollection = db.collection('stats');

  // Ensure a single counter document exists.
  await statsCollection.updateOne(
    { _id: 'portfolio_views' },
    { $setOnInsert: { views: 0 } },
    { upsert: true }
  );

  app.get('/api/views', async (req, res) => {
    const doc = await statsCollection.findOne({ _id: 'portfolio_views' });
    res.json({ views: doc?.views || 0 });
  });

  app.post('/api/views/increment', async (req, res) => {
    const result = await statsCollection.findOneAndUpdate(
      { _id: 'portfolio_views' },
      { $inc: { views: 1 } },
      { returnDocument: 'after', upsert: true }
    );
    res.json({ views: result.value.views });
  });

  app.listen(PORT, () => {
    console.log(`View counter API listening on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
