const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = class FacultyWorkTimePreferences {
    static save(inputJSON, slug, userid) {
        console.log('inputJSON:::::::', JSON.stringify(inputJSON))
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(inputJSON))
                .input('last_modified_by', sql.Int, userid)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[${slug}].[sp_add_faculty_work_time_preferences]`)
        })
    }

    static fetchAll(rowcount, slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT TOP ${Number(rowcount)} fwtp.id, f.faculty_id, f.faculty_name, ft.name as faculty_type,
            CONVERT(NVARCHAR, sit.start_time, 0) AS start_time, 
            CONVERT(NVARCHAR, _sit.end_time, 0) AS end_time,
              RTRIM(LTRIM(p.program_name)) AS program_name, p.program_code,p.program_id, d.day_name as day, d.day_name, icw.module_name, icw.module_code, icw.module_id, ads.acad_session
            FROM [${slug}].faculty_work_time_preferences fwtp
            INNER JOIN [${slug}].faculty_works fw ON fwtp.faculty_work_lid = fw.id
            INNER JOIN [${slug}].program_days pd ON fwtp.p_day_lid =  pd.id
            INNER JOIN [dbo].slot_interval_timings sit ON fwtp.start_time_id = sit.id
            INNER JOIN [dbo].slot_interval_timings _sit ON fwtp.end_time_id = _sit.id
            INNER JOIN [${slug}].faculties f ON f.id = fw.faculty_lid
            INNER JOIN [dbo].faculty_types ft ON ft.id = f.faculty_type_lid
            INNER JOIN [${slug}].programs p ON p.id =  pd.program_lid
            INNER JOIN [${slug}].days d ON d.id = pd.day_lid
            INNER JOIN [${slug}].initial_course_workload icw ON icw.id = fw.module_lid
            INNER JOIN [dbo].acad_sessions ads ON ads.id = icw.acad_session_lid
            ORDER BY fwtp.id DESC`)
        })
    }



    static getCount(slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.query(`SELECT COUNT(*) as count FROM [${slug}].faculty_work_time_preferences`)
        })
    }


    static search(body, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('keyword', sql.NVarChar(100), '%' + body.keyword + '%')
                .input('pageNo', sql.Int, body.pageNo)
                .query(`SELECT  fwtp.id, fwtp.faculty_work_lid, fwtp.p_day_lid, fwtp.start_time_id, fwtp.end_time_id, 
                CONVERT(NVARCHAR, sit.start_time, 0) AS start_time, 
                CONVERT(NVARCHAR, _sit.end_time, 0) AS end_time,
                f.faculty_name, f.faculty_id, RTRIM(LTRIM(p.program_name)) AS program_name, p.program_id, p.program_code, d.day_name, icw.module_name, ads.acad_session
                FROM [${slug}].faculty_work_time_preferences fwtp
                INNER JOIN [${slug}].faculty_works fw ON fwtp.faculty_work_lid = fw.id
                INNER JOIN [${slug}].program_days pd ON fwtp.p_day_lid =  pd.id
                INNER JOIN [dbo].slot_interval_timings sit ON fwtp.start_time_id = sit.id
                INNER JOIN [dbo].slot_interval_timings _sit ON fwtp.end_time_id = _sit.id
                INNER JOIN [${slug}].faculties f ON f.id = fw.faculty_lid 
                INNER JOIN [${slug}].programs p ON p.id =  pd.program_lid
                INNER JOIN [${slug}].days d ON d.id = pd.day_lid
                INNER JOIN [${slug}].initial_course_workload icw ON icw.id = fw.module_lid
                INNER JOIN [dbo].acad_sessions ads ON ads.id = icw.acad_session_lid
                WHERE sit.start_time LIKE @keyword OR _sit.end_time LIKE @keyword OR RTRIM(p.program_name) LIKE @keyword OR p.program_id LIKE @keyword OR p.program_code LIKE @keyword OR d.day_name LIKE @keyword  OR f.faculty_name LIKE @keyword OR f.faculty_id LIKE @keyword OR CONVERT(NVARCHAR, sit.start_time, 0) LIKE @keyword OR CONVERT(NVARCHAR, _sit.end_time, 0) LIKE @keyword OR icw.module_name LIKE @keyword OR ads.acad_session LIKE @keyword
                ORDER BY fwtp.id DESC OFFSET (@pageNo - 1) * 10 ROWS FETCH NEXT 10 ROWS ONLY`)
        })
    }

    static pagination(pageNo, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('pageNo', sql.Int, pageNo)
                .query(`SELECT fwtp.id, fwtp.faculty_work_lid, fwtp.p_day_lid, fwtp.start_time_id, fwtp.end_time_id, 
                CONVERT(NVARCHAR, sit.start_time, 0) AS start_time, 
                CONVERT(NVARCHAR, _sit.end_time, 0) AS end_time,
                f.faculty_name, f.faculty_id, RTRIM(LTRIM(p.program_name)) AS program_name, p.program_id, p.program_code, d.day_name, icw.module_name, ads.acad_session
                FROM [${slug}].faculty_work_time_preferences fwtp
                INNER JOIN [${slug}].faculty_works fw ON fwtp.faculty_work_lid = fw.id
                INNER JOIN [${slug}].program_days pd ON fwtp.p_day_lid =  pd.id
                INNER JOIN [dbo].slot_interval_timings sit ON fwtp.start_time_id = sit.id
                INNER JOIN [dbo].slot_interval_timings _sit ON fwtp.end_time_id = _sit.id
                INNER JOIN [${slug}].faculties f ON f.id = fw.faculty_lid 
                INNER JOIN [${slug}].programs p ON p.id =  pd.program_lid
                INNER JOIN [${slug}].days d ON d.id = pd.day_lid
                INNER JOIN [${slug}].initial_course_workload icw ON icw.id = fw.module_lid
                INNER JOIN [dbo].acad_sessions ads ON ads.id = icw.acad_session_lid
                ORDER BY fwtp.id DESC OFFSET (@pageNo - 1) * 10 ROWS FETCH NEXT 10 ROWS ONLY`)
        })
    }

    static update(inputJSON, slug, userid) {
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(inputJSON))
                .input('last_modified_by', sql.Int, userid)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[${slug}].[sp_update_faculty_work_time_preferences]`)
        })
    }

    static delete(id, slug, userid) {
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('input_faculty_work_time_pref_lid', sql.Int, id)
                .input('last_modified_by', sql.Int, userid)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[${slug}].[sp_delete_faculty_work_time_preference]`)
        })
    }


    static facultyPrefList(slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT DISTINCT f.faculty_name, f.faculty_id, fw.faculty_lid,  f.faculty_dbo_lid FROM [${slug}].faculty_works fw
            INNER JOIN [${slug}].faculties f ON f.id =  fw.faculty_lid`)
        })
    }

    static programByFacultyId(facultyId, slug) {
        return poolConnection.then(pool => {
            return pool.request().input('facultyId', sql.Int, facultyId).query(`select distinct p.id, p.program_name from [${slug}].faculty_works fw
            INNER JOIN [${slug}].program_sessions ps ON ps.id =  fw.program_session_lid
            INNER JOIN [${slug}].programs p ON p.id = ps.program_lid
            where fw.faculty_lid = @facultyId`)
        })
    }


    static moduleByprogramAndSessionId(body, slug) {
        console.log('Body::::::', body)
        return poolConnection.then(pool => {
            return pool.request()
                .input('programId', sql.Int, body.programId)
                .input('sessionId', sql.Int, body.sessionId)
                .input('facultyId', sql.Int, body.facultyId)
                .query(`SELECT DISTINCT fw.module_lid, icw.module_name FROM [${slug}].faculty_works fw
            INNER JOIN [${slug}].initial_course_workload icw ON icw.id = fw.module_lid
            INNER JOIN [${slug}].program_sessions ps ON ps.id = fw.program_session_lid
            WHERE ps.program_lid = @programId AND ps.acad_session_lid = @sessionId AND fw.faculty_lid = @facultyId`)
        })
    }

    static findOne(id, slug) {
        return poolConnection.then(pool => {
            return pool.request().input('Id', sql.Int, id)
                .query(`SELECT fwtp.id, fwtp.faculty_work_lid, fwtp.p_day_lid, fwtp.start_time_id, fwtp.end_time_id,
                fw.faculty_lid, fw.module_lid, ps.program_lid, ps.acad_session_lid,
                f.faculty_dbo_lid
                from [${slug}].faculty_work_time_preferences fwtp
                INNER JOIN [${slug}].faculty_works  fw ON fw.id = fwtp.faculty_work_lid
                INNER JOIN [${slug}].program_sessions ps ON ps.id = fw.program_session_lid
                INNER JOIN [${slug}].faculties f ON f.id = fw.faculty_lid
                WHERE fwtp.id = @Id`)
        })
    }

    static downloadExcel(slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT fwtp.id, f.faculty_id, f.faculty_name, ft.name as faculty_type,
            CONVERT(NVARCHAR, sit.start_time, 0) AS start_time, 
            CONVERT(NVARCHAR, _sit.end_time, 0) AS end_time,
              RTRIM(LTRIM(p.program_name)) AS program_name, p.program_code,p.program_id, d.day_name as day, icw.module_name, icw.module_code, icw.module_id, ads.acad_session
            FROM [${slug}].faculty_work_time_preferences fwtp
            INNER JOIN [${slug}].faculty_works fw ON fwtp.faculty_work_lid = fw.id
            INNER JOIN [${slug}].program_days pd ON fwtp.p_day_lid =  pd.id
            INNER JOIN [dbo].slot_interval_timings sit ON fwtp.start_time_id = sit.id
            INNER JOIN [dbo].slot_interval_timings _sit ON fwtp.end_time_id = _sit.id
            INNER JOIN [${slug}].faculties f ON f.id = fw.faculty_lid
            INNER JOIN [dbo].faculty_types ft ON ft.id = f.faculty_type_lid
            INNER JOIN [${slug}].programs p ON p.id =  pd.program_lid
            INNER JOIN [${slug}].days d ON d.id = pd.day_lid
            INNER JOIN [${slug}].initial_course_workload icw ON icw.id = fw.module_lid
            INNER JOIN [dbo].acad_sessions ads ON ads.id = icw.acad_session_lid
            ORDER BY fwtp.id DESC`)
        })
    }

    static fetchByFacultyId(facultyid, slug) {
        return poolConnection.then(pool => {
            return pool.request().input('facultyId', sql.Int, facultyid).query(`SELECT  fwtp.id, f.faculty_id, f.faculty_name, ft.name as faculty_type,
            CONVERT(NVARCHAR, sit.start_time, 0) AS start_time, 
            CONVERT(NVARCHAR, _sit.end_time, 0) AS end_time,
              RTRIM(LTRIM(p.program_name)) AS program_name, p.program_code,p.program_id, d.day_name as day, d.day_name, icw.module_name, icw.module_code, icw.module_id, ads.acad_session
            FROM [${slug}].faculty_work_time_preferences fwtp
            INNER JOIN [${slug}].faculty_works fw ON fwtp.faculty_work_lid = fw.id
            INNER JOIN [${slug}].program_days pd ON fwtp.p_day_lid =  pd.id
            INNER JOIN [dbo].slot_interval_timings sit ON fwtp.start_time_id = sit.id
            INNER JOIN [dbo].slot_interval_timings _sit ON fwtp.end_time_id = _sit.id
            INNER JOIN [${slug}].faculties f ON f.id = fw.faculty_lid
            INNER JOIN [dbo].faculty_types ft ON ft.id = f.faculty_type_lid
            INNER JOIN [${slug}].programs p ON p.id =  pd.program_lid
            INNER JOIN [${slug}].days d ON d.id = pd.day_lid
            INNER JOIN [${slug}].initial_course_workload icw ON icw.id = fw.module_lid
            INNER JOIN [dbo].acad_sessions ads ON ads.id = icw.acad_session_lid
            WHERE f.faculty_id = @facultyId
            ORDER BY fwtp.id DESC`)
        })
    }


    static byProgramId(programid, slug) {
        return poolConnection.then(pool => {
            return pool.request().input('programid', sql.Int, programid).query(`SELECT fwtp.id, f.faculty_id, f.faculty_name, ft.name as faculty_type,
            CONVERT(NVARCHAR, sit.start_time, 0) AS start_time, 
            CONVERT(NVARCHAR, _sit.end_time, 0) AS end_time,
              RTRIM(LTRIM(p.program_name)) AS program_name, p.program_code,p.program_id, d.day_name as day, d.day_name, icw.module_name, icw.module_code, icw.module_id, ads.acad_session
            FROM [${slug}].faculty_work_time_preferences fwtp
            INNER JOIN [${slug}].faculty_works fw ON fwtp.faculty_work_lid = fw.id
            INNER JOIN [${slug}].program_days pd ON fwtp.p_day_lid =  pd.id
            INNER JOIN [dbo].slot_interval_timings sit ON fwtp.start_time_id = sit.id
            INNER JOIN [dbo].slot_interval_timings _sit ON fwtp.end_time_id = _sit.id
            INNER JOIN [${slug}].faculties f ON f.id = fw.faculty_lid
            INNER JOIN [dbo].faculty_types ft ON ft.id = f.faculty_type_lid
            INNER JOIN [${slug}].programs p ON p.id =  pd.program_lid
            INNER JOIN [${slug}].days d ON d.id = pd.day_lid
            INNER JOIN [${slug}].initial_course_workload icw ON icw.id = fw.module_lid
            INNER JOIN [dbo].acad_sessions ads ON ads.id = icw.acad_session_lid
            WHERE pd.program_lid = @programid
            ORDER BY fwtp.id DESC`)
        })
    }

    static distinctSession(programid, slug) {
        return poolConnection.then(pool => {
            return pool.request().input('programid', sql.Int, programid).query(`SELECT DISTINCT  acad_session_lid, acad_session FROM  [${slug}].program_sessions ps
            INNER JOIN [dbo].acad_sessions ads ON ps.acad_session_lid =  ads.id
            WHERE ps.program_lid = @programid`)
        })
    }

    static findByProgramSessionId(body, slug) {
        return poolConnection.then(pool => {
            return pool.request()
            .input('programid', sql.Int, body.program_lid)
            .input('sessionLid', sql.Int, body.session_lid).query(`SELECT fwtp.id, f.faculty_id, f.faculty_name, ft.name as faculty_type,
            CONVERT(NVARCHAR, sit.start_time, 0) AS start_time, 
            CONVERT(NVARCHAR, _sit.end_time, 0) AS end_time,
              RTRIM(LTRIM(p.program_name)) AS program_name, p.program_code,p.program_id, d.day_name as day, d.day_name, icw.module_name, icw.module_code, icw.module_id, ads.acad_session
            FROM [${slug}].faculty_work_time_preferences fwtp
            INNER JOIN [${slug}].faculty_works fw ON fwtp.faculty_work_lid = fw.id
            INNER JOIN [${slug}].program_days pd ON fwtp.p_day_lid =  pd.id
            INNER JOIN [dbo].slot_interval_timings sit ON fwtp.start_time_id = sit.id
            INNER JOIN [dbo].slot_interval_timings _sit ON fwtp.end_time_id = _sit.id
            INNER JOIN [${slug}].faculties f ON f.id = fw.faculty_lid
            INNER JOIN [dbo].faculty_types ft ON ft.id = f.faculty_type_lid
            INNER JOIN [${slug}].programs p ON p.id =  pd.program_lid
            INNER JOIN [${slug}].days d ON d.id = pd.day_lid
            INNER JOIN [${slug}].initial_course_workload icw ON icw.id = fw.module_lid
            INNER JOIN [dbo].acad_sessions ads ON ads.id = icw.acad_session_lid
            WHERE pd.program_lid = @programid AND icw.acad_session_lid = @sessionLid
            ORDER BY fwtp.id DESC`)
        })
    }
}