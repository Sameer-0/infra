const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')
const {
    pool
} = require('mssql');

module.exports = class FacultyPool {

    static fetchAll(rowcount) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT TOP ${Number(rowcount)} fp.faculty_id, fp.faculty_name, camp.campus_abbr, org.org_abbr, ft.name AS faculty_type, CONVERT(NVARCHAR, sit.start_time, 0) AS start_time,
            CONVERT(NVARCHAR, _sit.end_time, 0) AS end_time from [dbo].faculty_pools fp
            INNER JOIN [dbo].slot_interval_timings sit ON fp.start_time_id = sit.id
            INNER JOIN [dbo].slot_interval_timings _sit ON fp.end_time_id = _sit.id
            INNER JOIN [dbo].campuses camp ON fp.campus_lid =  camp.id
            INNER JOIN [dbo].organizations org ON fp.org_lid = org.id
            INNER JOIN [dbo].faculty_types  ft ON fp.faculty_type_lid = ft.id ORDER BY ft.id DESC`)
        })
    }


    static search(body) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('keyword', sql.NVarChar(100), '%' + body.keyword + '%')
                .input('pageNo', sql.Int, body.pageNo)
                .query(`SELECT fp.faculty_id, fp.faculty_name, camp.campus_abbr, org.org_abbr, ft.name AS faculty_type, CONVERT(NVARCHAR, sit.start_time, 0) AS start_time,
                CONVERT(NVARCHAR, _sit.end_time, 0) AS end_time from [dbo].faculty_pools fp
                INNER JOIN [dbo].slot_interval_timings sit ON fp.start_time_id = sit.id
                INNER JOIN [dbo].slot_interval_timings _sit ON fp.end_time_id = _sit.id 
                INNER JOIN [dbo].campuses camp ON fp.campus_lid =  camp.id
                INNER JOIN [dbo].organizations org ON fp.org_lid = org.id
                INNER JOIN [dbo].faculty_types  ft ON fp.faculty_type_lid = ft.id
                WHERE fp.faculty_id LIKE @keyword OR fp.faculty_name LIKE @keyword OR camp.campus_abbr LIKE @keyword OR  ft.name LIKE @keyword OR CONVERT(NVARCHAR, sit.start_time, 0) LIKE @keyword OR CONVERT(NVARCHAR, _sit.end_time, 0) LIKE @keyword
                ORDER BY ft.id DESC OFFSET (@pageNo - 1) * 10 ROWS FETCH NEXT 10 ROWS ONLY`)
        })
    }

    static pagination(pageNo) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('pageNo', sql.Int, pageNo)
                .query(`SELECT fp.faculty_id, fp.faculty_name, camp.campus_abbr, org.org_abbr, ft.name AS faculty_type, CONVERT(NVARCHAR, sit.start_time, 0) AS start_time,
                CONVERT(NVARCHAR, _sit.end_time, 0) AS end_time from [dbo].faculty_pools fp
                INNER JOIN [dbo].slot_interval_timings sit ON fp.start_time_id = sit.id
                INNER JOIN [dbo].slot_interval_timings _sit ON fp.end_time_id = _sit.id
                INNER JOIN [dbo].campuses camp ON fp.campus_lid =  camp.id
                INNER JOIN [dbo].organizations org ON fp.org_lid = org.id
                INNER JOIN [dbo].faculty_types  ft ON fp.faculty_type_lid = ft.id ORDER BY ft.id DESC OFFSET (@pageNo - 1) * 10 ROWS FETCH NEXT 10 ROWS ONLY`)
        })
    }

    static refresh(userid) {
        return poolConnection.then(pool => {
            const request = pool.request();
            return request
                .input('last_modified_by', sql.Int, userid)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[dbo].[sp_refresh_faculties]`)
        })
    }

    static getCount() {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.query(`SELECT  COUNT(*) AS count from [dbo].faculty_pools fp
            INNER JOIN [dbo].slot_interval_timings sit ON fp.start_time_id = sit.id
            INNER JOIN [dbo].slot_interval_timings _sit ON fp.end_time_id = _sit.id
            INNER JOIN [dbo].campuses camp ON fp.campus_lid =  camp.id
            INNER JOIN [dbo].organizations org ON fp.org_lid = org.id
            INNER JOIN [dbo].faculty_types  ft ON fp.faculty_type_lid = ft.id`)
        })
    }

}