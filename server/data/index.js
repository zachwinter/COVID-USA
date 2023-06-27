import fs from 'fs';
import path from 'path';
import * as url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const [collection, days, map, population, states, stats, usa] = [
  './data.collection.json',
  './data.days.json',
  './data.map.json',
  './data.population.json',
  './data.states.json',
  './data.stats.json',
  './data.usa.json',
].map(p => {
  return JSON.parse(
    fs.readFileSync(path.join(__dirname, p), { encoding: 'utf-8' })
  );
});

export default {
  collection,
  days,
  map,
  population,
  states,
  stats,
  usa,
};
