const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')
const {
    pool
} = require('mssql');
const slug = require('../controllers/management/slug');

module.exports = class Faculties {
    constructor(facultyId, facultyName, startTimeId, endTimeId, campusId, orgId) {
        this.facultyId = facultyId;
        this.facultyName = facultyName;
    }

    static save(inputJSON, slug, userid) {
        console.log(JSON.stringify(inputJSON))
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(inputJSON))
                .input('last_modified_by', sql.Int, userid)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[${slug}].[sp_import_faculties]`)
        })
    }

    static fetchAll(rowcount, slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT TOP ${Number(rowcount)} f.id, f.faculty_id, f.faculty_name, f.faculty_dbo_lid, ft.name AS faculty_type, f.faculty_type_lid
            FROM [${slug}].faculties f 
            INNER JOIN [dbo].faculty_types ft ON ft.id = f.faculty_type_lid
            ORDER BY f.id DESC`)
        })
    }

    static getCount(slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.query(`SELECT COUNT(*) as count FROM [${slug}].faculties`)
        })
    }

    static pagination(pageNo, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('pageNo', sql.Int, pageNo)
                .query(`SELECT  f.id, f.faculty_id, f.faculty_name, f.faculty_dbo_lid, ft.name AS faculty_type, f.faculty_type_lid
                FROM [${slug}].faculties f 
                INNER JOIN [dbo].faculty_types ft ON ft.id = f.faculty_type_lid
                ORDER BY f.id DESC OFFSET (@pageNo - 1) * 10 ROWS FETCH NEXT 10 ROWS ONLY`)
        })
    }

    static search(body, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('keyword', sql.NVarChar(100), '%' + body.keyword + '%')
                .input('pageNo', sql.Int, body.pageNo)
                .query(`SELECT f.id, f.faculty_id, f.faculty_name, f.faculty_dbo_lid, ft.name AS faculty_type, f.faculty_type_lid
                FROM [${slug}].faculties f 
                INNER JOIN [dbo].faculty_types ft ON ft.id = f.faculty_type_lid
                WHERE f.faculty_id LIKE @keyword OR f.faculty_name LIKE @keyword OR ft.name LIKE @keyword
                ORDER BY f.id DESC OFFSET (@pageNo - 1) * 10 ROWS FETCH NEXT 10 ROWS ONLY`)
        })
    }

    static findOne(id, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            request.input('Id', sql.Int, id)
            return request.query(`SELECT f.id, f.faculty_id, f.faculty_name, f.faculty_dbo_lid, ft.name AS faculty_type, f.faculty_type_lid
            FROM [${slug}].faculties f 
            INNER JOIN [dbo].faculty_types ft ON ft.id = f.faculty_type_lid
            WHERE f.id = @Id`)
        })
    }

    static update(inputJSON, slug, userid) {
        console.log('Update faculty json', JSON.stringify(inputJSON))
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(inputJSON))
                .input('last_modified_by', sql.Int, userid)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[${slug}].[sp_update_faculties]`)
        })
    }




    static delete(id, slug, userid) {
        console.log('id:::::::', id)
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('input_faculty_lid', sql.Int, id)
                .input('last_modified_by', sql.Int, userid)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[${slug}].[delete_faculties]`)
        })
    }


    static isBatchPrefSet(slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT  f.id, f.faculty_id, f.faculty_name, f.faculty_dbo_lid, ft.name AS faculty_type, f.faculty_type_lid
            FROM [${slug}].faculties f 
            INNER JOIN [dbo].faculty_types ft ON ft.id = f.faculty_type_lid
            INNER JOIN [${slug}].faculty_works fw ON fw.faculty_lid = f.id
            WHERE fw.is_batch_preference_set = 1
            ORDER BY f.id DESC`)
        })
    }


    static downloadExcel(slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT  f.faculty_id, f.faculty_name,  ft.name AS faculty_type
            FROM [${slug}].faculties f 
            INNER JOIN [dbo].faculty_types ft ON ft.id = f.faculty_type_lid
            ORDER BY f.id DESC`)
        })
    }

    static facultyBookedSlot(slug, facultyId) {
        return poolConnection.then(pool => {
            return pool.request().input('facultyId', sql.Int, facultyId).query(`SELECT  t2.room_lid, r.room_number, t2.day_lid, t2.is_break, t2.break_id, t2.event_lid, t2.start_slot, t2.end_slot, e.program_lid, e.acad_session_lid, e.course_lid, e.division_lid, RTRIM(LTRIM(e.division)) AS division, e.batch_lid, e.batch, e.event_type_lid, RTRIM(LTRIM(p.program_name)) AS program_name, p.program_id, p.program_code, ads.acad_session, icw.module_name, et.abbr as event_type, fe.faculty_lid, f.faculty_name FROM (SELECT room_lid, day_lid, event_lid, is_break, break_id, MIN(slot_lid) AS start_slot, MAX(slot_lid) AS end_slot
            FROM [${slug}].event_bookings
            WHERE  (active = 1 OR is_break = 1)
            GROUP BY room_lid, day_lid, event_lid, is_break, break_id) t2
            LEFT JOIN [${slug}].tb_events e ON e.id = t2.event_lid
            LEFT JOIN [${slug}].programs p ON p.id = e.program_lid
            LEFT JOIN [dbo].acad_sessions ads ON ads.id = e.acad_session_lid
            LEFT JOIN [${slug}].initial_course_workload icw ON icw.id = e.course_lid
            LEFT JOIN [dbo].event_types et ON et.id = e.event_type_lid
            LEFT JOIN [${slug}].faculty_events fe on fe.event_lid =  e.id
            LEFT JOIN [${slug}].faculties f on f.id = fe.faculty_lid
            LEFT JOIN rooms r ON r.id = t2.room_lid
            WHERE fe.faculty_lid = @facultyId OR t2.is_break = 1
            ORDER BY t2.start_slot, t2.end_slot`)
        })
    }


    static facultyAvailableSlot(slug, facultyId) {
              return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('faculty_lid', sql.Int, facultyId)
                .execute(`[${slug}].[faculty_status]`)
        })
    }

}