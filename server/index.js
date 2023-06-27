import { config } from 'dotenv';
import express from 'express';
import path from 'path';
import * as url from 'url';
import fallback from 'express-history-api-fallback';
import monitor from 'express-status-monitor';

config();

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const app = express();
const root = path.resolve(__dirname, '../dist');

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(root));
  app.use(fallback('index.html', { root }));
}

const port = process.env.VITE_SERVER_PORT || process.env.PORT || 3333;

app.listen(port, () => console.log(`server • listening on port ${port}`));
