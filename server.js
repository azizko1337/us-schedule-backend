import http from 'http';

//routes
import getByGroupRoute from './routes/getByGroupRoute.js';
import notFoundRoute from './routes/notFoundRoute.js';

import openDb from './db/openDb.js';
import config from './config.js';

const { PORT, FRONT_END_URL } = config;

const db = await openDb();

await db.exec(`DROP TABLE IF EXISTS caches`);
await db.exec(`DROP TABLE IF EXISTS events`);

await db.exec(`
  CREATE TABLE IF NOT EXISTS caches (
    uid INTEGER PRIMARY KEY NOT NULL,
    groupId INTEGER NOT NULL,
    week INTEGER NOT NULL,
    updatedAt BIGINT NOT NULL
  );
`);
await db.exec(`
  CREATE TABLE IF NOT EXISTS events (
    uid INTEGER PRIMARY KEY NOT NULL,
    id TEXT NOT NULL,
    start BIGINT NOT NULL,
    end BIGINT NOT NULL,
    summary TEXT NOT NULL,
    groupId INTEGER NOT NULL
  );
`);

await db.close();

const server = http.createServer((req, res) => {
  try{
    if (req.method === 'GET') {
      // Set CORS headers
      res.setHeader('Access-Control-Allow-Origin', FRONT_END_URL);
      res.setHeader('Access-Control-Allow-Methods', 'GET');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      if (req.url.startsWith('/byGroup')) {
        getByGroupRoute(req, res);
        return;
      } 
    }
    notFoundRoute(req, res);
  
  }
  catch(error){}
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});