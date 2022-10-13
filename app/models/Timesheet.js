const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = class TimeSheet {

    static checkDaysLecture(slug, monthInt) {
        return poolConnection.then(pool => {
            return pool.request()
                .input('monthInt', sql.Int, monthInt)
                .query(`SELECT CONVERT(NVARCHAR, CONVERT(DATE, date_str, 103), 23) AS dateStr FROM [${slug}].timesheet WHERE active = 1 AND date_str IN (SELECT date_str FROM [${slug}].timesheet WHERE month_int = @monthInt) GROUP BY date_str`)
        })
    }

    static SimulatedData(slug, date) {
        return poolConnection.then(pool => {
            return pool.request()
                .input('Date', sql.NVarChar(20), date)
                .query(`SELECT  ts.*, et.abbr as event_type_name FROM [${slug}].timesheet ts
                        INNER JOIN event_types et ON et.id = ts.event_type_lid
                        WHERE date_str = CONVERT(VARCHAR(10), CAST(@Date AS DATETIME), 103) AND active = 1`)
        })
    }

    static SimulatedBreakData(slug, dayLid) {
        return poolConnection.then(pool => {
            return pool.request()
                .input('dayLid', sql.Int, dayLid)
                .query(`SELECT room_lid, day_lid, event_lid, is_break, break_id, MIN(slot_lid) AS start_slot, MAX(slot_lid) AS end_slot
                FROM [${slug}].event_bookings
                WHERE day_lid = @dayLid AND (active = 1 OR is_break = 1)
                GROUP BY room_lid, day_lid, event_lid, is_break, break_id
				having is_break = 1`)
        })
    }

    static getMinMaxTime(slug) {
        return poolConnection.then(pool => {
            return pool.request()
                .query(`SELECT  Min(ts.start_time_lid) as start_time_lid, MAX(ts.end_time_lid) as end_time_lid FROM [${slug}].timesheet ts
                        INNER JOIN event_types et ON et.id = ts.event_type_lid
                        WHERE active = 1`)
        })
    }
}