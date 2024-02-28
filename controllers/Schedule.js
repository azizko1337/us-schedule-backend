import ical from "ical";
import openDb from "../db/openDb.js";

class Schedule{
    static async getByGroup(id, week){
        const res = await fetch(`http://plan.ii.us.edu.pl/plan.php?type=0&id=${id}&cvsfile=true&w=${week}`, {
            method: "GET",
        })
        const textSchedule = await res.text()
        
        let schedule = Object.values(ical.parseICS(textSchedule))

        //remove unnecessary events
        schedule = schedule.filter(event => event.uid.length == 14)
        
        //keep only important data
        schedule = schedule.map(event => {
            return {
                id: event.uid,
                start: (new Date(event.start)).getTime(),
                end: (new Date(event.end)).getTime(),
                summary: event.summary
            }
        })

        //cache to db
        const db = await openDb();
        
        //remove old caches
        const removeUid = (await db.get('SELECT uid FROM caches WHERE groupId = ? AND week = ?', id, week))?.uid;
        await db.run('DELETE FROM caches WHERE uid = ?', removeUid);
        await db.run('DELETE FROM events WHERE groupId = ?', removeUid);

        //add new cache "title"
        await db.run(                                      
            'INSERT INTO caches (groupId, week, updatedAt) VALUES (?, ?, ?)',
            id,
            week,
            Date.now()
        );
        const addUid = (await db.get('SELECT uid FROM caches WHERE groupId = ? AND week = ?', id, week)).uid;
        
        schedule.forEach(async event => {
            await db.run(
                'INSERT INTO events (id, start, end, summary, groupId) VALUES (?, ?, ?, ?, ?)',
                event.id,
                event.start,
                event.end,
                event.summary,
                addUid
            );
        
        })

        await db.close();

        return schedule;
    }
}

export default Schedule;