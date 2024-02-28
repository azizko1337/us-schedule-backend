import sqlite3 from 'sqlite3'
import { open } from 'sqlite'

async function openDb() {
    const db = await open({
      filename: './db/cache.db',
      driver: sqlite3.Database
    })
    return db;
}

export default openDb;