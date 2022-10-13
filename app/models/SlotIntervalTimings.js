const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = class SlotIntervalTimings {
    
    static fetchAll(rowcount) { 
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT TOP ${Number(rowcount)} id, CONVERT(NVARCHAR, start_time, 0) AS start_time, CONVERT(NVARCHAR,end_time,0) AS end_time, slot_name FROM [dbo].slot_interval_timings ORDER BY id ASC`)
        })
    }

    static single(id) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('Id', sql.Int, id)
                .query(`SELECT  id, CONVERT(char(5), start_time, 108) AS start_time, CONVERT(char(5), end_time, 108) AS end_time, slot_name FROM [dbo].slot_interval_timings WHERE id = @Id`)
        })
    }

    static create(body) {

        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('slotName', sql.NVarChar(20), body.slotName)
                .input('startTime', sql.NVarChar(10), body.startTime)
                .input('endTime', sql.NVarChar(10), body.endTime)
                .query(`INSERT INTO [dbo].slot_interval_timings (slot_name, start_time, end_time) VALUES (@slotName, @startTime, @endTime)`)
        })
    }

    static update(body) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('slotName', sql.NVarChar(20), body.slotName)
                .input('startTime', sql.NVarChar(10), body.startTime)
                .input('endTime', sql.NVarChar(10), body.endTime)
                .input('Id', sql.Int, body.id)
                .query(`UPDATE [dbo].slot_interval_timings SET slot_name = @slotName, start_time = @startTime, end_time = @endTime WHERE id = @Id`)
        })
    }


    static delete(id) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('Id', sql.Int, id)
                .query(`DELETE FROM [dbo].slot_interval_timings  WHERE id = @Id`)
        })
    }


    static search(rowcount, keyword) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('keyword', sql.NVarChar(100), '%' + keyword + '%')
                .query(`SELECT TOP ${Number(rowcount)} id, slot_name, CONVERT(NVARCHAR, start_time, 0) AS start_time, CONVERT(NVARCHAR, end_time, 0) AS end_time FROM  [dbo].slot_interval_timings WHERE slot_name LIKE @keyword  OR end_time LIKE @keyword OR  end_time LIKE @keyword ORDER BY id DESC`)
        })
    }


    static count() {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.query(`SELECT COUNT(*) as count FROM [dbo].slot_interval_timings`)
        })
    }


    static forRoomBooking(rowcount) {
        return poolConnection.then(pool => {
            //  return pool.request().query(`SELECT TOP ${Number(rowcount)} id, CONVERT(NVARCHAR, start_time, 0) AS start_time, CONVERT(NVARCHAR,end_time,0) AS end_time, slot_name FROM [dbo].slot_interval_timings ORDER BY id ASC`)
            //APPLY WHERE CONDITION WITH ROOM_LID
            return pool.request().query(`SELECT TOP ${Number(rowcount)} st.id, CONVERT(NVARCHAR, st.start_time, 0) AS start_time,  CONVERT(NVARCHAR, st.end_time, 0) AS end_time, st.slot_name from
          rooms r
          join slot_interval_timings st
          on st.id >= r.start_time_id
          and st.id <= r.end_time_id
          group by st.id, st.start_time, st.end_time, st.slot_name ORDER BY st.id ASC`)
        })
    }

    //Fetching time for specific faculty
    static forFaculty(rowcount) {
        return poolConnection.then(pool => {
            //APPLY WHERE CONDITION WITH FACULTY ID
            return pool.request().query(`SELECT TOP ${Number(rowcount)} st.id, CONVERT(NVARCHAR, st.start_time, 0) AS start_time, CONVERT(NVARCHAR, st.end_time, 0) AS end_time
          from [dbo].faculties f
          join dbo.faculty_pools fp
          on f.faculty_id = fp.faculty_id
          join dbo.slot_interval_timings st
          on st.id >= fp.start_time_id
          and st.id <= fp.end_time_id
          GROUP BY st.id, st.start_time,st.end_time ORDER BY st.id ASC`)
        })
    }


    //Fetching time for specific Budling room
    static forAddingRoom(id) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('Id', sql.Int, id)
                .query(`select st.id, CONVERT(NVARCHAR, st.start_time, 0) AS start_time, CONVERT(NVARCHAR, st.end_time, 0) AS end_time, st.slot_name from buildings b join slot_interval_timings st on st.id >= b.start_time_id
          and st.id <= b.end_time_id where b.id = @Id ORDER By st.id`)
        })
    }

    //Fetching time for specific faculty
    static getFacultySlotsById(faculty_id, slug) {
        console.log('getFacultySlotsById::::::::::', faculty_id)
        return poolConnection.then(pool => {
            //APPLY WHERE CONDITION WITH FACULTY ID
            let request = pool.request();
            return request.input('faculty_dbo_lid', sql.Int, faculty_id)
                .query(`SELECT  st.id, CONVERT(NVARCHAR, st.start_time, 0) AS start_time, CONVERT(NVARCHAR, st.end_time, 0) AS end_time
         from [dbo].faculties f
         join dbo.faculty_pools fp
         on f.faculty_id = fp.faculty_id
         join dbo.slot_interval_timings st
         on st.id >= fp.start_time_id
         and st.id <= fp.end_time_id
         WHERE f.id = @faculty_dbo_lid
         GROUP BY st.id, st.start_time, st.end_time ORDER BY st.id ASC`)
        })
    }


    static roomSlotByRoomId(roomId) {
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.input('roomId', sql.Int, roomId).query(`SELECT  st.id, CONVERT(NVARCHAR, st.start_time, 0) AS start_time,  CONVERT(NVARCHAR, st.end_time, 0) AS end_time, st.slot_name from
          [dbo].rooms r
          join [dbo].slot_interval_timings st
          on st.id >= r.start_time_id
          and st.id <= r.end_time_id WHERE r.id =  @roomId
          group by st.id, st.start_time, st.end_time, st.slot_name ORDER BY st.id ASC`)
        })
    }

    static slotTimesForSchoolTiming(slug){
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.query(`SELECT id, CONVERT(NVARCHAR, start_time, 0) AS start_time, CONVERT(NVARCHAR, end_time, 0) AS end_time, slot_name, CONVERT(NVARCHAR, start_time, 108) as start_military_time, CONVERT(NVARCHAR, end_time, 108) as end_military_time FROM slot_interval_timings WHERE id BETWEEN (SELECT MIN(slot_start_lid) FROM [${slug}].school_timings) AND (select  MAX(slot_end_lid) FROM [${slug}].school_timings)`)
        })
    }

}