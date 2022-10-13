const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = class schoolTiming {
    static fetchAll(rowcount, slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT TOP ${Number(rowcount)} st.id, IIF(st.name IS NULL, 'NA', st.name) as name,  st.type_lid, st.slot_start_lid, st.slot_end_lid, CONVERT(NVARCHAR, sit.start_time, 100) AS start_time, CONVERT(NVARCHAR, _sit.end_time, 100) AS end_time, st.day_lid, d.day_name,
            p.program_name, stt.name as schooltimetype, acs.acad_session, p.program_id
           FROM [${slug}].school_timings st
           INNER JOIN [dbo].slot_interval_timings sit ON st.slot_start_lid =  sit.id
           INNER JOIN [dbo].slot_interval_timings _sit ON st.slot_end_lid = _sit.id
           INNER JOIN [${slug}].days d ON d.id =  st.day_lid
           INNER JOIN [${slug}].programs p ON p.id = st.program_lid
           INNER JOIN [${slug}].school_timing_types stt ON stt.id = st.type_lid
           INNER JOIN [dbo].acad_sessions acs ON acs.id = st.acad_session_lid
           ORDER BY st.acad_session_lid`)
        })
    }

    static save(inputJSON, slug, userid, settingId) {
        console.log('SCHOOL TIMING  inputJSON:::::::::::::', JSON.stringify(inputJSON))
        console.log('Setting Id:::::::::::::', settingId)
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(inputJSON))
                .input('last_modified_by', sql.Int, userid)
                .input('school_timing_setting_id', sql.Int, settingId)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[${slug}].[sp_insert_school_timings]`)
        })
    }

    static update(inputJSON, slug, userid) {
        console.log('JSON::::::::::>>>>>>', JSON.stringify(inputJSON))
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(inputJSON))
                .input('last_modified_by', sql.Int, userid)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[${slug}].[sp_update_school_timings]`)
        })
    }

    static pagination(pageNo, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('pageNo', sql.Int, pageNo)
                .query(`SELECT st.id, IIF(st.name IS NULL, 'NA', st.name) as name,  st.type_lid, st.slot_start_lid, st.slot_end_lid, CONVERT(NVARCHAR, sit.start_time, 100) AS start_time, CONVERT(NVARCHAR, _sit.end_time, 100) AS end_time, st.day_lid, d.day_name,
                p.program_name, stt.name as schooltimetype, acs.acad_session, p.program_id
               FROM [${slug}].school_timings st
               INNER JOIN [dbo].slot_interval_timings sit ON st.slot_start_lid =  sit.id
               INNER JOIN [dbo].slot_interval_timings _sit ON st.slot_end_lid = _sit.id
               INNER JOIN [${slug}].days d ON d.id =  st.day_lid
               INNER JOIN [${slug}].programs p ON p.id = st.program_lid
               INNER JOIN [${slug}].school_timing_types stt ON stt.id = st.type_lid
               INNER JOIN [dbo].acad_sessions acs ON acs.id = st.acad_session_lid
               ORDER BY st.id DESC OFFSET (@pageNo - 1) * 10 ROWS FETCH NEXT 10 ROWS ONLY`)
        })
    }

    static getCount(slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT COUNT(*) AS count FROM [${slug}].school_timings`)
        })
    }


    static search(rowcount, keyword, slug) {
        return poolConnection.then(pool => {
            return pool.request().input('keyword', sql.NVarChar(100), '%' + keyword + '%')
                .query(`SELECT TOP ${Number(rowcount)} st.id, IIF(st.name IS NULL, 'NA', st.name) as name,  st.type_lid, st.slot_start_lid, st.slot_end_lid, CONVERT(NVARCHAR, sit.start_time, 100) AS start_time, CONVERT(NVARCHAR, _sit.end_time, 100) AS end_time, st.day_lid, d.day_name,
                p.program_name, stt.name as schooltimetype, acs.acad_session, p.program_id
               FROM [${slug}].school_timings st
               INNER JOIN [dbo].slot_interval_timings sit ON st.slot_start_lid =  sit.id
               INNER JOIN [dbo].slot_interval_timings _sit ON st.slot_end_lid = _sit.id
               INNER JOIN [${slug}].days d ON d.id =  st.day_lid
               INNER JOIN [${slug}].programs p ON p.id = st.program_lid
               INNER JOIN [${slug}].school_timing_types stt ON stt.id = st.type_lid
               INNER JOIN [dbo].acad_sessions acs ON acs.id = st.acad_session_lid
               WHERE st.name LIKE @keyword OR sit.start_time LIKE @keyword OR _sit.end_time LIKE @keyword OR d.day_name LIKE @keyword OR p.program_name LIKE @keyword OR p.abbr LIKE @keyword OR stt.name LIKE @keyword OR acs.acad_session LIKE @keyword OR p.program_id LIKE @keyword
               ORDER BY st.acad_session_lid`)
        })
    }

    static getTimeTableSimulationSlots(slug, dayLid, programLid, acadSessionLid) {

        return poolConnection.then(pool => {
            let stmt

            if (programLid && acadSessionLid) {
                stmt = `SELECT sct.id, sct.slot_start_lid as start_time_lid, sct.slot_end_lid as end_time_lid, CONVERT(NVARCHAR, st.start_time, 0) AS start_time, CONVERT(NVARCHAR, et.end_time, 0) AS end_time FROM [${slug}].school_timings sct 
                INNER JOIN slot_interval_timings st ON st.id = sct.slot_start_lid
                INNER JOIN slot_interval_timings et ON et.id = sct.slot_end_lid
                WHERE sct.program_lid = @programLid AND sct.acad_session_lid = @acadSessionLid AND sct.day_lid = @dayLid`
            } else {
                stmt = `SELECT sct.id, sct.slot_start_lid as start_time_lid, sct.slot_end_lid as end_time_lid, CONVERT(NVARCHAR ,st.start_time, 0) AS start_time, CONVERT(NVARCHAR, et.end_time, 0) AS end_time FROM [${slug}].school_timings sct 
                INNER JOIN slot_interval_timings st ON st.id = sct.slot_start_lid
                INNER JOIN slot_interval_timings et ON et.id = sct.slot_end_lid`
            }

            return pool.request()
                .input('programLid', sql.Int, programLid)
                .input('acadSessionLid', sql.Int, acadSessionLid)
                .input('dayLid', sql.Int, dayLid)
                .query(stmt)
        })
    }

    static get(slug, dayLid, programLid, acadSessionLid) {

        return poolConnection.then(pool => {
            let stmt

            if (programLid && acadSessionLid) {
                stmt = `SELECT sct.id, sct.slot_start_lid, sct.slot_end_lid, CONVERT(NVARCHAR, st.start_time, 0) AS start_time, CONVERT(NVARCHAR, et.end_time, 0) AS end_time FROM [${slug}].school_timings sct 
                INNER JOIN slot_interval_timings st ON st.id = sct.slot_start_lid
                INNER JOIN slot_interval_timings et ON et.id = sct.slot_end_lid
                WHERE sct.program_lid = @programLid AND sct.acad_session_lid = @acadSessionLid AND sct.day_lid = @dayLid`
            } else {
                stmt = `SELECT sct.id, sct.slot_start_lid, sct.slot_end_lid, CONVERT(NVARCHAR ,st.start_time, 0) AS start_time, CONVERT(NVARCHAR, et.end_time, 0) AS end_time FROM [${slug}].school_timings sct 
                INNER JOIN slot_interval_timings st ON st.id = sct.slot_start_lid
                INNER JOIN slot_interval_timings et ON et.id = sct.slot_end_lid`
            }

            return pool.request()
                .input('programLid', sql.Int, programLid)
                .input('acadSessionLid', sql.Int, acadSessionLid)
                .input('dayLid', sql.Int, dayLid)
                .query(stmt)
        })
    }


    static fetchAllBySettingName(slug) {
        return poolConnection.then(pool => {
            return pool.request().execute(`[${slug}].[school_timing_list]`)
        })
    }


    static delete(slug, body, userId) {
        console.log('delete school timing', body.schoolTimingLid, userId, `[${slug}].[sp_delete_school_timings]`)
        return poolConnection.then(pool => {
            // let request = pool.request()
            return pool.request().input('school_timing_lid', sql.Int, body.schoolTimingLid)
                .input('last_modified_by', sql.Int, userId)
                .output('output_json', sql.NVarChar(sql.MAX))
                .output('output_flag', sql.Bit)
                .execute(`[${slug}].[sp_delete_school_timings]`)
        })
    }
}