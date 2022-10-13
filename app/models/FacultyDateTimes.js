const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')
const {
    pool
} = require('mssql');
const slug = require('../controllers/management/slug');

module.exports = class FacultyDateTimes {

    constructor(faculty_id, faculty_name, start_date, end_date, start_time, end_time) {
        this.faculty_id = faculty_id;
        this.faculty_name = faculty_name;
        this.start_date = start_date;
        this.end_date = end_date;
        this.start_time = start_time;
        this.end_time = end_time
    }

    static save(inputJSON, slug, userid) {
        console.log('JSON::::::::', JSON.stringify(inputJSON))
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(inputJSON))
                .input('last_modified_by', sql.Int, userid)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[${slug}].[sp_add_faculty_date_times]`)
        })
    }


    static fetchAll(rowcount, slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT TOP ${Number(rowcount)} fdt.id, fdt.faculty_lid, fdt.start_date_id, fdt.end_date_id, fdt.start_time_id, fdt.end_time_id, 
            f.faculty_name, f.faculty_id, CONVERT(NVARCHAR, ac.date, 103) as start_date, CONVERT(NVARCHAR, ac1.date, 103) as end_date, CONVERT(NVARCHAR, sit.start_time, 0) AS start_time, CONVERT(NVARCHAR, _sit.end_time, 0) AS end_time, ft.name as faculty_type
            FROM [${slug}].faculty_date_times fdt 
            INNER JOIN [${slug}].[faculties] f ON fdt.faculty_lid =  f.id
			INNER JOIN [dbo].[academic_calendar] ac ON fdt.start_date_id =  ac.id
            INNER JOIN [dbo].[academic_calendar] ac1 ON fdt.end_date_id =  ac1.id
            INNER JOIN [dbo].[slot_interval_timings] sit ON fdt.start_time_id = sit.id  
            INNER JOIN [dbo].[slot_interval_timings] _sit ON fdt.end_time_id = _sit.id
            INNER JOIN [dbo].faculty_types ft ON ft.id = f.faculty_type_lid           
            ORDER BY fdt.id DESC`)
        })
    }

    static getCount(slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.query(`SELECT COUNT(*) as count FROM [${slug}].faculty_date_times`)
        })
    }

    static search(body, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('keyword', sql.NVarChar(100), '%' + body.keyword + '%')
                .input('pageNo', sql.Int, body.pageNo)
                .query(`SELECT fdt.id, fdt.faculty_lid, fdt.start_date_id, fdt.end_date_id, fdt.start_time_id, fdt.end_time_id, 
                f.faculty_name, f.faculty_id, CONVERT(NVARCHAR, ac.date, 103) as start_date, CONVERT(NVARCHAR, ac1.date, 103) as end_date, CONVERT(NVARCHAR, sit.start_time, 0) AS start_time, CONVERT(NVARCHAR, _sit.end_time, 0) AS end_time, ft.name as faculty_type
                FROM [${slug}].faculty_date_times fdt 
                INNER JOIN [${slug}].[faculties] f ON fdt.faculty_lid =  f.id
                INNER JOIN [dbo].[academic_calendar] ac ON fdt.start_date_id =  ac.id
                INNER JOIN [dbo].[academic_calendar] ac1 ON fdt.end_date_id =  ac1.id
                INNER JOIN [dbo].[slot_interval_timings] sit ON fdt.start_time_id = sit.id
                INNER JOIN [dbo].[slot_interval_timings] _sit ON fdt.end_time_id = _sit.id
                INNER JOIN [dbo].faculty_types ft ON ft.id = f.faculty_type_lid 
                WHERE fdt.id LIKE @keyword OR f.faculty_name LIKE @keyword OR  ac.date LIKE @keyword OR ac1.date LIKE @keyword OR ft.name LIKE @keyword          
                ORDER BY fdt.id DESC OFFSET (@pageNo - 1) * 10 ROWS FETCH NEXT 10 ROWS ONLY`)
        })
    }

    static pagination(pageNo, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('pageNo', sql.Int, pageNo)
                .query(`SELECT  fdt.id, fdt.faculty_lid, fdt.start_date_id, fdt.end_date_id, fdt.start_time_id, fdt.end_time_id, 
                f.faculty_name, f.faculty_id, CONVERT(NVARCHAR, ac.date, 103) as start_date, CONVERT(NVARCHAR, ac1.date, 103) as end_date, CONVERT(NVARCHAR, sit.start_time, 0) AS start_time, CONVERT(NVARCHAR, _sit.end_time, 0) AS end_time, ft.name as faculty_type
                FROM [${slug}].faculty_date_times fdt 
                INNER JOIN [${slug}].[faculties] f ON fdt.faculty_lid =  f.id
                INNER JOIN [dbo].[academic_calendar] ac ON fdt.start_date_id =  ac.id
                INNER JOIN [dbo].[academic_calendar] ac1 ON fdt.end_date_id =  ac1.id
                INNER JOIN [dbo].[slot_interval_timings] sit ON fdt.start_time_id = sit.id
                INNER JOIN [dbo].[slot_interval_timings] _sit ON fdt.end_time_id = _sit.id
                INNER JOIN [dbo].faculty_types ft ON ft.id = f.faculty_type_lid             
                ORDER BY fdt.id DESC OFFSET (@pageNo - 1) * 10 ROWS FETCH NEXT 10 ROWS ONLY`)
        })
    }

    static delete(id, slug, userid) {
        console.log('id:::::::', id)
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('input_faculty_date_times_lid', sql.Int, id)
                .input('last_modified_by', sql.Int, userid)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[${slug}].[sp_delete_faculty_date_times]`)
        })
    }


    static update(inputJSON, slug, userid) {
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(inputJSON))
                .input('last_modified_by', sql.Int, userid)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[${slug}].[sp_update_faculty_date_times]`)
        })
    }

    static findOne(id, slug) {
        return poolConnection.then(pool => {
            const request = pool.request();
            request.input('id', sql.Int, id)
            return request.query(`SELECT fdt.id, fdt.faculty_lid, fdt.start_date_id, fdt.end_date_id, fdt.start_time_id, fdt.end_time_id, 
            f.faculty_name, f.faculty_id, CONVERT(NVARCHAR, ac.date, 103) as start_date, CONVERT(NVARCHAR, ac1.date, 103) as end_date, CONVERT(NVARCHAR, sit.start_time, 0) AS start_time, CONVERT(NVARCHAR, _sit.end_time, 0) AS end_time, f.faculty_dbo_lid, ft.name as faculty_type
            FROM [${slug}].faculty_date_times fdt 
            INNER JOIN [${slug}].[faculties] f ON fdt.faculty_lid =  f.id
			INNER JOIN [dbo].[academic_calendar] ac ON fdt.start_date_id =  ac.id
            INNER JOIN [dbo].[academic_calendar] ac1 ON fdt.end_date_id =  ac1.id
            INNER JOIN [dbo].[slot_interval_timings] sit ON fdt.start_time_id = sit.id
            INNER JOIN [dbo].[slot_interval_timings] _sit ON fdt.end_time_id = _sit.id
            INNER JOIN [dbo].faculty_types ft ON ft.id = f.faculty_type_lid              
            WHERE fdt.id = @id`)
        })
    }

    static downloadExcel(slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT  f.faculty_name, f.faculty_id, CONVERT(NVARCHAR, ac.date, 103) as start_date, CONVERT(NVARCHAR, ac1.date, 103) as end_date, CONVERT(NVARCHAR, sit.start_time, 0) AS start_time, CONVERT(NVARCHAR, _sit.end_time, 0) AS end_time, ft.name as faculty_type
            FROM [${slug}].faculty_date_times fdt 
            INNER JOIN [${slug}].[faculties] f ON fdt.faculty_lid =  f.id
            INNER JOIN [dbo].[academic_calendar] ac ON fdt.start_date_id =  ac.id
            INNER JOIN [dbo].[academic_calendar] ac1 ON fdt.end_date_id =  ac1.id
            INNER JOIN [dbo].[slot_interval_timings] sit ON fdt.start_time_id = sit.id  
            INNER JOIN [dbo].[slot_interval_timings] _sit ON fdt.end_time_id = _sit.id
            INNER JOIN [dbo].faculty_types ft ON ft.id = f.faculty_type_lid           
            ORDER BY fdt.id DESC`)
        })
    }
}