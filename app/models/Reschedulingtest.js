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
            .input('toDate', sql.NVarChar(sql.MAX), body.date)
            .input('startSlot', sql.Int, body.startTimeLid)
            .input('endSlot', sql.Int, body.endTimeLid)
            .input('startDate', sql.NVarChar(sql.MAX), body.startDate)
            .input('endDate', sql.NVarChar(sql.MAX), body.endDate)
            .input('roomId', sql.NVarChar(sql.MAX), body.roomId)
            .query(`(SELECT t1.* FROM
                (SELECT * FROM [${slug}].room_transaction_details WHERE start_time_id <= @startSlot AND end_time_id >= @endSlot AND room_lid
                NOT IN (SELECT DISTINCT room_lid FROM [${slug}].timesheet WHERE (date BETWEEN CONVERT(date, @startDate, 111) 
                AND CONVERT(date, @endDate, 111)) AND  ((start_time_lid <= @startSlot AND end_time_lid >= 193) OR (start_time_lid <= @endSlot and end_time_lid >= @endSlot)) AND active = 0 )) t1
                INNER JOIN rooms r ON r.id = t1.room_lid WHERE r.id = @roomId AND t1.room_lid = @roomId)`)
        })
        
    }

    static getTimings(rowcount) { 
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT TOP ${Number(rowcount)} id,CONVERT(NVARCHAR, start_time, 0) AS start_time_str, CONVERT(NVARCHAR,end_time,0) AS end_time_str, CONVERT(NVARCHAR, start_time, 108) AS start_time, CONVERT(NVARCHAR,end_time,108) AS end_time, slot_name FROM [dbo].slot_interval_timings ORDER BY id ASC`)
        })
    }

}