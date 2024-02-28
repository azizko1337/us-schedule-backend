import Schedule from "../controllers/Schedule.js";
import parseParams from "../utils/parseParams.js";
import openDb from "../db/openDb.js";

import config from "../config.js";
const { CACHE_TTL } = config;

async function getByGroupRoute(req, res) {
  let schedule = [];
  let errorOccured = false;

  try{
    const params = parseParams(req.url);
    const {id, week} = params;

    const db = await openDb();
    const group = await db.get('SELECT * FROM caches WHERE groupId = ? AND week = ?', id, week);
    if(group && Date.now() - group.updatedAt < CACHE_TTL){
      //cache exists and is valid, we can use it
      schedule = await db.all('SELECT id, start, end, summary FROM events WHERE groupId = ?', group.uid);
    }else{
      //no cache, we have to fetch from plan.ii.us.edu.pl
      schedule = await Schedule.getByGroup(id, week);
    }
  }catch(error){
    errorOccured = true;
  }
  
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({errorOccured, schedule}));
}

export default getByGroupRoute;