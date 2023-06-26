import { config } from 'dotenv';
import express from 'express';
import data from './data/index.js';
import path from 'path';
import * as url from 'url';
import fallback from 'express-history-api-fallback';

config();

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const app = express();
const root = path.resolve(__dirname, '../dist');

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});

app.get('/api/data', async (req, res) => {
  try {
    res.send({ success: true, data });
  } catch (e) {
    res.send({ success: false, error: e });
  }
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(root));
  app.use(fallback('index.html', { root }));
}

app.listen(process.env.VITE_SERVER_PORT || process.env.PORT || 3333, () =>
  console.log('listening')
);
