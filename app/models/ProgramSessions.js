const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = class {
    static fetchAll(rowcount, slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT DISTINCT TOP ${Number(rowcount)} ps.id, p.program_name, p.program_code, adc.acad_session, cww.acad_year FROM [${slug}].program_sessions ps 
            INNER JOIN [${slug}].programs p ON ps.program_lid = p.id
            INNER JOIN [dbo].acad_sessions adc ON adc.id = ps.acad_session_lid
            INNER JOIN [${slug}].initial_course_workload icw ON icw.program_id =  p.program_id
            INNER JOIN [${slug}].course_work_wsdl cww ON cww.id = icw.course_wsdl_lid
            ORDER BY ps.id DESC`)
        })
    }

    static pagination(pageNo, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('pageNo', sql.Int, pageNo)
                .query(`SELECT DISTINCT ps.id, p.program_name, p.program_code, adc.acad_session, cww.acad_year FROM [${slug}].program_sessions ps 
                INNER JOIN [${slug}].programs p ON ps.program_lid = p.id
                INNER JOIN [dbo].acad_sessions adc ON adc.id = ps.acad_session_lid
                INNER JOIN [${slug}].initial_course_workload icw ON icw.program_id =  p.program_id
                INNER JOIN [${slug}].course_work_wsdl cww ON cww.id = icw.course_wsdl_lid
                ORDER BY ps.id DESC OFFSET (@pageNo - 1) * 10 ROWS FETCH NEXT 10 ROWS ONLY`)
        })
    }

    static search(body, slug) {
        return poolConnection.then(pool => {
            return pool.request().input('keyword', sql.NVarChar(100), '%' + body.keyword + '%')
                .input('pageNo', sql.Int, body.pageNo)
                .query(`SELECT DISTINCT ps.id, p.program_name, p.program_code, adc.acad_session, cww.acad_year FROM [${slug}].program_sessions ps 
                INNER JOIN [${slug}].programs p ON ps.program_lid = p.id
                INNER JOIN [dbo].acad_sessions adc ON adc.id = ps.acad_session_lid
                INNER JOIN [${slug}].initial_course_workload icw ON icw.program_id =  p.program_id
                INNER JOIN [${slug}].course_work_wsdl cww ON cww.id = icw.course_wsdl_lid
                WHERE p.program_name LIKE @keyword OR adc.acad_session LIKE @keyword OR cww.acad_year LIKE @keyword ORDER BY ps.id DESC OFFSET (@pageNo - 1) * 10 ROWS FETCH NEXT 10 ROWS ONLY`)
        })
    }


    static getCount(slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.query(`SELECT COUNT(*) as count FROM [${slug}].program_sessions`)
        })
    }

    static refresh(slug, userid) {
        return poolConnection.then(pool => {
            const request = pool.request();
            return request
                .input('last_modified_by', sql.Int, userid)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[${slug}].[sp_refresh_program_sessions]`)
        })
    }

    static getLockedProgram(slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT DISTINCT p.id, p.program_id, p.program_name FROM [${slug}].program_sessions ps 
            INNER JOIN [${slug}].programs p ON p.id = ps.program_lid
            WHERE is_locked = 1`)
        })
    }

    static getUnlockedProgram(slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT p.id, p.program_id, p.program_name FROM [${slug}].programs p`)
        })
    }

    static getLockedSessionByProgram(slug, programLid) {
        return poolConnection.then(pool => {

            let stmt;

            if (programLid) {
                stmt = `SELECT ads.id, ads.acad_session, ps.program_lid FROM [${slug}].program_sessions ps 
                        INNER JOIN [dbo].acad_sessions ads ON ads.id = ps.acad_session_lid
                        WHERE ps.is_locked = 1 AND ps.program_lid = @programLid`
            } else {
                stmt = `SELECT distinct ads.id, ads.acad_session FROM [${slug}].program_sessions ps 
                        INNER JOIN [dbo].acad_sessions ads ON ads.id = ps.acad_session_lid
                        WHERE ps.is_locked = 1`
            }
            return pool.request()

                .input('programLid', sql.Int, programLid)
                .query(stmt)
        })
    }

    static getUnlockedSessionByProgram(slug, programLid) {
        return poolConnection.then(pool => {
            return pool.request()
                .input('programLid', sql.Int, programLid)
                .query(`SELECT ads.id, ads.acad_session, ps.program_lid, ps.id as program_session_lid FROM [${slug}].program_sessions ps 
            INNER JOIN [dbo].acad_sessions ads ON ads.id = ps.acad_session_lid
            WHERE ps.is_locked = 0 AND ps.program_lid = @programLid`)
        })
    }

    static getSessionForProgram(slug, programLid) {
        return poolConnection.then(pool => {
            return pool.request()
                .input('programLid', sql.Int, programLid)
                .query(`SELECT ads.id, ads.acad_session, ps.program_lid, ps.id as program_session_lid FROM [${slug}].program_sessions ps 
            INNER JOIN [dbo].acad_sessions ads ON ads.id = ps.acad_session_lid
            WHERE ps.program_lid = @programLid`)
        })
    }

    static downloadExcel(slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT p.program_name, p.program_code, p.program_id, adc.acad_session, cww.acad_year, pt.name as program_type  FROM [${slug}].program_sessions ps 
            INNER JOIN [${slug}].programs p ON ps.program_lid = p.id
            INNER JOIN [dbo].acad_sessions adc ON adc.id = ps.acad_session_lid
            INNER JOIN [${slug}].initial_course_workload icw ON icw.program_id =  p.program_id
            INNER JOIN [${slug}].course_work_wsdl cww ON cww.id = icw.course_wsdl_lid
			INNER JOIN [dbo].program_types pt ON pt.id = p.program_type_lid
            ORDER BY ps.id DESC`)
        })
    }

}