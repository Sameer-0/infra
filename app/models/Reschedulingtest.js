const {
    pool, MAX
} = require('mssql');
const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = class RoomStatus {

    static getAvailableRoomForTimeRange(slug, body) {
        return poolConnection.then(pool => {
            console.log('date:::>>>>', body.date)
            return pool.request()
            // .input('toDate', sql.NVarChar(sql.MAX), body.date)
            // .input('startSlot', sql.Int, body.startTimeLid)
            // .input('endSlot', sql.Int, body.endTimeLid)
            // .input('startDate', sql.NVarChar(sql.MAX), body.startDate)
            // .input('endDate', sql.NVarChar(sql.MAX), body.endDate)
            .input('roomId', sql.NVarChar(sql.MAX), body.roomId)
            .query(`SELECT sit.id,sit.start_time as start_time_str,_sit.end_time as end_time_str FROM [${slug}].room_transaction_details rtd
            INNER JOIN dbo.slot_interval_timings sit ON sit.id = rtd.start_time_id
            INNER JOIN dbo.slot_interval_timings _sit ON _sit.id = rtd.end_time_id WHERE rtd.active = 1 AND rtd.room_lid = @roomId`)
        })
    }

    static getBookedRooms(slug, body) {
        return poolConnection.then(pool => {
            console.log('date:::>>>>', body.date)
            return pool.request()
            .input('startDate', sql.NVarChar(sql.MAX), body.startDate)
            .input('endDate', sql.NVarChar(sql.MAX), body.endDate)
            .input('roomId', sql.NVarChar(sql.MAX), body.roomId)
            .query(`SELECT * FROM [${slug}].timesheet WHERE (date BETWEEN CONVERT(date, @startDate, 111)
            AND CONVERT(date, @endDate, 111)) AND room_lid = @roomId AND active = 1`)
        })
    }

    static fetchFacultyByModule(slug, moduleLid) {
        console.log("MODULELID>>>>>>>", moduleLid)
        return poolConnection.then(pool => {
            return pool.request()
            .input('module_lid', sql.NVarChar(sql.MAX), moduleLid)
            .query(`SELECT f.id,f.faculty_id,f.faculty_name FROM [${slug}].faculty_works fw INNER JOIN dbo.faculties f ON fw.faculty_lid = f.id WHERE fw.module_lid = @module_lid`)
        })
    }

    static getSessionHours(slug, moduleLid) {
        console.log("MODULELID>>>>>>>", moduleLid)
        return poolConnection.then(pool => {
            return pool.request()
            .input('module_lid', sql.NVarChar(sql.MAX), moduleLid)
            .query(`SELECT session_duration FROM [${slug}].initial_course_workload WHERE id = @module_lid`)
        })
    }

    static getTimings(rowcount) { 
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT TOP ${Number(rowcount)} id,CONVERT(NVARCHAR, start_time, 0) AS start_time_str, CONVERT(NVARCHAR,end_time,0) AS end_time_str, CONVERT(NVARCHAR, start_time, 108) AS start_time, CONVERT(NVARCHAR,end_time,108) AS end_time, slot_name FROM [dbo].slot_interval_timings ORDER BY id ASC`)
        })
    }

}