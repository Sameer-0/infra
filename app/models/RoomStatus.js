const {
    pool, MAX
} = require('mssql');
const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = class RoomStatus {

    // static roomStatus(startDate,endDate,roomNo) {
    //     return poolConnection.then(pool => {
    //         console.log(">>>>>>>>>>",startDate,endDate,roomNo)
    //         return pool.request().query(`SELECT date,room_no,room_abbr,day_name,event_name,start_time,end_time
    //         ,program_name,acad_session,module_name,faculty_id,faculty_name,division,batch 
    //         FROM [asmsoc-mum].timesheet WHERE date BETWEEN CONVERT(date, ${startDate}, 111) 
    //         AND CONVERT(date, ${endDate}, 111) AND room_no = ${roomNo} AND active = 1 ORDER BY start_time`)
    //     })
    // }

    static roomStatus(body) {
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.input('startDate', sql.NVarChar(MAX), body.startDate)
                .input('endDate', sql.NVarChar(MAX), body.endDate)
                .input('roomNo', sql.NVarChar(MAX), body.roomNo)
                .query(`SELECT date,room_no,room_abbr,day_name,event_name,start_time,end_time
                ,program_name,acad_session,module_name,faculty_id,faculty_name,division,batch 
                FROM [asmsoc-mum].timesheet WHERE date BETWEEN CONVERT(date, @startDate, 111) 
                AND CONVERT(date, @endDate, 111) AND room_no = @roomNo AND active = 1 ORDER BY start_time`)
        })
    }

    static getRoomTimimgs() {
        return poolConnection.then(pool => {
            let request = pool.request();
            return request
                .query(`SELECT MIN(start_time) as min_timing,MAX(start_time) as max_timing FROM [asmsoc-mum].timesheet WHERE active = 1 `)
        })
    }
}