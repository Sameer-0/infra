const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')
const {
    pool
} = require('mssql');
const {
    body,
    Result
} = require('express-validator');

module.exports = class Divisions {

    static fetchAll(rowcount, slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT TOP ${Number(rowcount)} d.id, d.division, d.division_num, d.division_count, p.program_name, ads.acad_session, IIF(d.count_for_theory_batch IS NULL , 0, d.count_for_theory_batch) AS count_for_theory_batch, IIF(d.count_for_practical_batch IS NULL , 0 , d.count_for_practical_batch) AS count_for_practical_batch, IIF(d.count_for_tutorial_batch IS NULL ,0, d.count_for_tutorial_batch) AS count_for_tutorial_batch, IIF(d.count_for_workshop_batch IS NULL ,0 , d.count_for_workshop_batch) AS count_for_workshop_batch, icw.module_name
            FROM [${slug}].divisions d 
            INNER JOIN [${slug}].initial_course_workload icw ON icw.id = d.course_lid
            INNER JOIN [${slug}].programs p ON p.program_id = icw.program_id
            INNER JOIN [dbo].acad_sessions ads ON ads.id = icw.acad_session_lid
            ORDER BY d.division_num ASC`)
        })
    }

    static getUniqueDiv(slug, programLid, sessionLid) {
        return poolConnection.then(pool => {
            return pool.request()
            .input('programLid', sql.Int, programLid)
            .input('sessionLid', sql.Int, sessionLid).query(`SELECT DISTINCT(d.division) FROM (SELECT icw.id AS course_lid, icw.program_id, icw.acad_session_lid, p.id as program_lid, p.program_name FROM [${slug}].initial_course_workload icw 
            INNER JOIN [${slug}].programs p ON p.program_id = icw.program_id
            Where p.id = @programLid and icw.acad_session_lid = @sessionLid) t1 
            INNER JOIN [${slug}].divisions d ON d.course_lid = t1.course_lid`)
        })
    }

  
    static fetchDivisionData(rowcount, slug){
        return poolConnection.then(pool => {
            return pool.request().query(`select 
            division, division_num, division_count, module_name 
            from 
            [${slug}].divisions d 
            inner join [${slug}].initial_course_workload icw 
            on icw.id = d.course_lid`)
        })
    }

    static getCount(slug) {
        return poolConnection.then(pool => { 
            let request = pool.request()
            return request.query(`SELECT COUNT(*) as count FROM [${slug}].divisions`)
        })
    }


    static pagination(pageNo, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('pageNo', sql.Int, pageNo)
                .query(`SELECT  d.id, d.division, d.division_num, d.division_count,p.program_name, ads.acad_session, IIF(d.count_for_theory_batch IS NULL , 0, d.count_for_theory_batch) AS count_for_theory_batch, IIF(d.count_for_practical_batch IS NULL , 0 , d.count_for_practical_batch) AS count_for_practical_batch, IIF(d.count_for_tutorial_batch IS NULL ,0, d.count_for_tutorial_batch) AS count_for_tutorial_batch, IIF(d.count_for_workshop_batch IS NULL ,0 , d.count_for_workshop_batch) AS count_for_workshop_batch, icw.module_name
                FROM [${slug}].divisions d 
                INNER JOIN [${slug}].initial_course_workload icw ON icw.id = d.course_lid
                INNER JOIN [${slug}].programs p ON p.program_id = icw.program_id
                INNER JOIN [dbo].acad_sessions ads ON ads.id = icw.acad_session_lid ORDER BY d.id DESC  OFFSET (@pageNo - 1) * 10 ROWS FETCH NEXT 10 ROWS ONLY`)
        })
    }

    static search(rowcount, keyword, slug) {
        return poolConnection.then(pool => {
            return pool.request().input('keyword', sql.NVarChar(100), '%' + keyword + '%')
                .query(`SELECT TOP ${Number(rowcount)} d.id, d.division, d.division_num, d.division_count, p.program_name, ads.acad_session, IIF(d.count_for_theory_batch IS NULL , 0, d.count_for_theory_batch) AS count_for_theory_batch, IIF(d.count_for_practical_batch IS NULL , 0 , d.count_for_practical_batch) AS count_for_practical_batch, IIF(d.count_for_tutorial_batch IS NULL ,0, d.count_for_tutorial_batch) AS count_for_tutorial_batch, IIF(d.count_for_workshop_batch IS NULL ,0 , d.count_for_workshop_batch) AS count_for_workshop_batch, icw.module_name
                FROM [${slug}].divisions d 
                INNER JOIN [${slug}].initial_course_workload icw ON icw.id = d.course_lid
                INNER JOIN [${slug}].programs p ON p.program_id = icw.program_id
                INNER JOIN [dbo].acad_sessions ads ON ads.id = icw.acad_session_lid 
                WHERE  d.division LIKE @keyword OR d.division_count LIKE @keyword 
                OR d.division_num LIKE @keyword OR d.count_for_theory_batch LIKE @keyword 
                OR d.count_for_tutorial_batch LIKE @keyword 
                OR d.count_for_workshop_batch LIKE @keyword 
                OR icw.module_name LIKE @keyword OR p.program_name LIKE @keyword OR ads.acad_session LIKE @keyword ORDER BY d.id DESC`)
        })
    }


    static changeStatus(body, slug) {
        console.log(body, slug)
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('Id', sql.Int, body.id)
            .input('Status', sql.TinyInt, body.status)
            .query(`UPDATE [${slug}].divisions SET active = @Status WHERE id = @Id`)
        })
    }


    //object, res.locals.slug, res.locals.userId
    static update(inputJson, slug, userId) {
        console.log('UPDATE DIVISION JSON::::::::>>',JSON.stringify(inputJson))
        return poolConnection.then(pool => {
            return pool.request()
            .input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(inputJson))
            .input('last_modified_by', sql.Int, userId)
            .output('output_json', sql.NVarChar(sql.MAX))
            .execute(`[${slug}].[sp_update_divisions]`)
            
        })
    }


    static getAll(slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`select DISTINCT course_lid, division from [${slug}].divisions `)
        })
    }


    static generateDivision(slug, userid) {
        return poolConnection.then(pool => {
            const request = pool.request();
            return request
                .input('last_modified_by', sql.Int, userid)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[${slug}].[sp_generate_divisions]`)
        })
    }

    static delete(id, slug, userid) {
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('input_division_lid', sql.Int, id)
                .input('last_modified_by', sql.Int, userid)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[${slug}].[sp_delete_division]`)
        })
    }


    static divisionByModuleId(body, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('moduleId', sql.Int, body.moduleid)
            .input('programId', sql.Int, body.programid)
            .query(`SELECT  d.id, d.division, d.division_num, d.division_count, p.program_name, ads.acad_session, IIF(d.count_for_theory_batch IS NULL , 0, d.count_for_theory_batch) AS count_for_theory_batch, IIF(d.count_for_practical_batch IS NULL , 0 , d.count_for_practical_batch) AS count_for_practical_batch, IIF(d.count_for_tutorial_batch IS NULL ,0, d.count_for_tutorial_batch) AS count_for_tutorial_batch, IIF(d.count_for_workshop_batch IS NULL ,0 , d.count_for_workshop_batch) AS count_for_workshop_batch, icw.module_name
            FROM [${slug}].divisions d 
            INNER JOIN [${slug}].initial_course_workload icw ON icw.id = d.course_lid
            INNER JOIN [${slug}].programs p ON p.program_id = icw.program_id
            INNER JOIN [dbo].acad_sessions ads ON ads.id = icw.acad_session_lid
            WHERE icw.id = @moduleId AND p.id = @programId
            ORDER BY d.division_num ASC`)
        })
    }

    static divisionByProgramId(programid, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('programId', sql.Int, programid)
            .query(`SELECT  d.id, d.division, d.division_num, d.division_count, p.program_name, ads.acad_session, IIF(d.count_for_theory_batch IS NULL , 0, d.count_for_theory_batch) AS count_for_theory_batch, IIF(d.count_for_practical_batch IS NULL , 0 , d.count_for_practical_batch) AS count_for_practical_batch, IIF(d.count_for_tutorial_batch IS NULL ,0, d.count_for_tutorial_batch) AS count_for_tutorial_batch, IIF(d.count_for_workshop_batch IS NULL ,0 , d.count_for_workshop_batch) AS count_for_workshop_batch, icw.module_name
            FROM [${slug}].divisions d 
            INNER JOIN [${slug}].initial_course_workload icw ON icw.id = d.course_lid
            INNER JOIN [${slug}].programs p ON p.program_id = icw.program_id
            INNER JOIN [dbo].acad_sessions ads ON ads.id = icw.acad_session_lid
            WHERE p.id = @programId
            ORDER BY d.division_num ASC`)
        })
    }

    static downloadExcel(slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT p.program_name, p.program_code, p.program_id, icw.module_name, icw.module_code, icw.module_id, d.division,  ads.acad_session,d.division_count as student_count, IIF(d.count_for_theory_batch IS NULL , 0, d.count_for_theory_batch) AS count_for_theory_batch, IIF(d.count_for_practical_batch IS NULL , 0 , d.count_for_practical_batch) AS count_for_practical_batch, IIF(d.count_for_tutorial_batch IS NULL ,0, d.count_for_tutorial_batch) AS count_for_tutorial_batch, IIF(d.count_for_workshop_batch IS NULL ,0 , d.count_for_workshop_batch) AS count_for_workshop_batch
            FROM [${slug}].divisions d 
            INNER JOIN [${slug}].initial_course_workload icw ON icw.id = d.course_lid
            INNER JOIN [${slug}].programs p ON p.program_id = icw.program_id
            INNER JOIN [dbo].acad_sessions ads ON ads.id = icw.acad_session_lid
            ORDER BY d.division_num ASC`)
        })
    }

}