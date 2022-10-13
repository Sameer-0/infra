const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = class schoolTiming {
    
    static generateTimeTable(programLid, sessionLid, slug) {
      
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('program_lid', sql.Int, programLid)
            .input('session_lid', sql.Int, sessionLid)
            .input('last_modified_by', sql.Int, 1)
            .output('output_flag', sql.Bit, 0)
            .output('output_json', sql.NVarChar(sql.MAX))
            .execute(`[${slug}].[sp_generate_weekly_timetable]`)
        })
    }

    static deAllocateTimeTable(programLid, sessionLid, slug) {
      
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('program_lid', sql.Int, programLid)
            .input('acad_session_lid', sql.Int, sessionLid)
            .input('last_modified_by', sql.Int, 1)
            .output('output_json', sql.NVarChar(sql.MAX))
            .execute(`[${slug}].[sp_deallocate_timetable]`)
        })
    }

}