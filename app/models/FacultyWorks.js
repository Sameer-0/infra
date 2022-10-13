const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = class {

    static save(inputJSON, slug, userid) {
        console.log('faculty works json', inputJSON)
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(inputJSON))
                .input('last_modified_by', sql.Int, userid)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[${slug}].[sp_add_faculty_works]`)
        })
    }

    static fetchAll(rowcount, slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT TOP ${Number(rowcount)} fw.id, fw.faculty_lid, fw.program_session_lid, fw.module_lid, fw.lecture_per_week, IIF(fw.practical_per_week IS NULL,0,fw.practical_per_week) practical_per_week, IIF(fw.tutorial_per_week IS NULL,0, fw.tutorial_per_week) AS tutorial_per_week, IIF(fw.workshop_per_week IS NULL, 0, fw.workshop_per_week) AS workshop_per_week, CONVERT(NVARCHAR, fw.is_batch_preference_set) AS is_batch_preference_set, IIF(fw.is_batch_preference_set = 1 ,'Yes','No') as is_batch_preference_set_status, icw.module_name, f.faculty_id, f.faculty_name, ps.program_lid, acs.acad_session, acs.id as session_lid, p.program_name
            FROM [${slug}].faculty_works fw 
            INNER JOIN [${slug}].[initial_course_workload] icw ON icw.id = fw.module_lid
            INNER JOIN [${slug}].faculties f ON f.id = fw.faculty_lid
            INNER JOIN [${slug}].program_sessions ps ON ps.id = fw.program_session_lid 
			INNER JOIN [${slug}].programs p ON p.id = ps.program_lid
            INNER JOIN [dbo].acad_sessions acs ON acs.id = ps.acad_session_lid ORDER BY fw.id DESC`)
        })
    }


    static getCount(slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.query(`SELECT COUNT(*) AS count FROM [${slug}].faculty_works`)
        })
    }

    static getFacultiesAllocationDetails(obj, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('program_lid', sql.Int, obj.programLid)
            .input('acad_session_lid', sql.Int, obj.sessionLid)
            .input('course_lid', sql.Int, obj.moduleLid)
            .input('division_lid', sql.Int, obj.divisionLid)
            .query(`SELECT * FROM (SELECT t1.faculty_lid, count(t1.event_lid) AS lecture_count FROM (SELECT fe.faculty_lid, fe.event_lid  FROM [${slug}].faculty_events fe
                INNER JOIN [${slug}].tb_events te ON te.id = fe.event_lid
                WHERE te.program_lid = @program_lid and te.acad_session_lid = @acad_session_lid and te.course_lid = @course_lid and te.division_lid = @division_lid) t1
                group by t1.faculty_lid) t2
                INNER JOIN [${slug}].faculties f ON f.id = t2.faculty_lid`)
        })
    }


    static search(body, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('keyword', sql.NVarChar(100), '%' + body.keyword + '%')
                .input('pageNo', sql.Int, body.pageNo)
                .query(`SELECT fw.id, fw.faculty_lid, fw.program_session_lid, fw.module_lid, fw.lecture_per_week, IIF(fw.practical_per_week IS NULL,0,fw.practical_per_week) practical_per_week, IIF(fw.tutorial_per_week IS NULL,0, fw.tutorial_per_week) AS tutorial_per_week, IIF(fw.workshop_per_week IS NULL, 0, fw.workshop_per_week) AS workshop_per_week, CONVERT(NVARCHAR, fw.is_batch_preference_set) AS is_batch_preference_set, IIF(fw.is_batch_preference_set = 1 ,'Yes','No') as is_batch_preference_set_status, icw.module_name, f.faculty_id, f.faculty_name, ps.program_lid, acs.acad_session, acs.id as session_lid, p.program_name FROM [${slug}].faculty_works fw 
                INNER JOIN [${slug}].[initial_course_workload] icw ON icw.id = fw.module_lid
                INNER JOIN [${slug}].faculties f ON f.id = fw.faculty_lid
                INNER JOIN [${slug}].program_sessions ps ON ps.id = fw.program_session_lid 
                INNER JOIN [${slug}].programs p ON p.id = ps.program_lid
                INNER JOIN [dbo].acad_sessions acs ON acs.id = ps.acad_session_lid WHERE fw.id LIKE @keyword OR  fw.lecture_per_week LIKE @keyword OR fw.practical_per_week LIKE @keyword OR icw.module_name LIKE @keyword OR f.faculty_id LIKE @keyword OR f.faculty_name LIKE @keyword OR p.program_name LIKE @keyword OR acs.acad_session like @keyword OR icw.module_name LIKE @keyword ORDER BY fw.id DESC OFFSET (@pageNo - 1) * 10 ROWS FETCH NEXT 10 ROWS ONLY`)
        })
    }

    static pagination(pageNo, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('pageNo', sql.Int, pageNo)
                .query(`SELECT  fw.id, fw.faculty_lid, fw.program_session_lid, fw.module_lid, fw.lecture_per_week, IIF(fw.practical_per_week IS NULL,0,fw.practical_per_week) practical_per_week, IIF(fw.tutorial_per_week IS NULL,0, fw.tutorial_per_week) AS tutorial_per_week, IIF(fw.workshop_per_week IS NULL, 0, fw.workshop_per_week) AS workshop_per_week, CONVERT(NVARCHAR, fw.is_batch_preference_set) AS is_batch_preference_set, IIF(fw.is_batch_preference_set = 1 ,'Yes','No') as is_batch_preference_set_status, icw.module_name, f.faculty_id, f.faculty_name, ps.program_lid, acs.acad_session, acs.id as session_lid, p.program_name
                FROM [${slug}].faculty_works fw 
                INNER JOIN [${slug}].[initial_course_workload] icw ON icw.id = fw.module_lid
                INNER JOIN [${slug}].faculties f ON f.id = fw.faculty_lid
                INNER JOIN [${slug}].program_sessions ps ON ps.id = fw.program_session_lid 
                INNER JOIN [${slug}].programs p ON p.id = ps.program_lid
                INNER JOIN [dbo].acad_sessions acs ON acs.id = ps.acad_session_lid ORDER BY fw.id DESC OFFSET (@pageNo - 1) * 10 ROWS FETCH NEXT 10 ROWS ONLY`)
        })
    }

    static update(inputJSON, slug, userid) {
        console.log('JSON:::::::::::::::::',JSON.stringify(inputJSON))
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(inputJSON)) 
                .input('last_modified_by', sql.Int, userid)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[${slug}].[sp_update_faculty_works]`)
        })
    }


    static delete(id, slug, userid) {
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('input_faculty_work_lid', sql.Int, id)
                .input('last_modified_by', sql.Int, userid)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[${slug}].[sp_delete_faculty_works]`)
        })
    }

    static sessionListByProgram(program_lid, slug){
        return poolConnection.then(pool => {
            let request = pool.request()
            console.log('program lidddd', program_lid)
            return request.input('programLid', sql.Int, program_lid)
                .query(`select ps.id, ps.program_lid, ads.id as acad_session_lid, ads.acad_session from [${slug}].program_sessions ps 
                inner join  [dbo].acad_sessions ads on ads.id = ps.acad_session_lid
                where ps.program_lid = @programLid`)
        })
    }

    static moduleByProgramSession(body, slug){
        return poolConnection.then(pool => {
            let request = pool.request()
            console.log('program lidddd', body.program_id)
            return request.input('programId', sql.Int, body.program_id)
                .input('SessionLid', sql.Int, body.session_lid)
                .query(`select * from [${slug}].initial_course_workload where acad_session_lid = @SessionLid AND program_id = @programId`)
        })
    }


    static findOne(id, slug) {
        return poolConnection.then(pool => {
            const request = pool.request();
            request.input('Id', sql.Int, id)
            return request.query(`SELECT fw.id, fw.faculty_lid, fw.program_session_lid, fw.module_lid, fw.lecture_per_week, IIF(fw.practical_per_week IS NULL,0,fw.practical_per_week) practical_per_week, IIF(fw.tutorial_per_week IS NULL,0, fw.tutorial_per_week) AS tutorial_per_week, IIF(fw.workshop_per_week IS NULL, 0, fw.workshop_per_week) AS workshop_per_week, CONVERT(NVARCHAR, fw.is_batch_preference_set) AS is_batch_preference_set, IIF(fw.is_batch_preference_set = 1 ,'Yes','No') as is_batch_preference_set_status, icw.module_name, f.faculty_id, f.faculty_name, ps.program_lid, acs.acad_session, acs.id as session_lid, p.program_name
            FROM [${slug}].faculty_works fw 
            INNER JOIN [${slug}].[initial_course_workload] icw ON icw.id = fw.module_lid
            INNER JOIN [${slug}].faculties f ON f.id = fw.faculty_lid
            INNER JOIN [${slug}].program_sessions ps ON ps.id = fw.program_session_lid 
			INNER JOIN [${slug}].programs p ON p.id = ps.program_lid
            INNER JOIN [dbo].acad_sessions acs ON acs.id = ps.acad_session_lid  WHERE fw.id = @Id`)
        })
    }

    static facultyWorkloadForPrefernce(body, slug) {
        console.log('body::::::::',body)
        return poolConnection.then(pool => {
            const request = pool.request();
            request.input('facultyLid', sql.Int, body.facultyLid)
            request.input('moduleLid', sql.Int, body.moduleLid)
            request.input('programLid', sql.Int, body.programLid)
            request.input('acadSessionLid', sql.Int, body.acadSessionLid)
            return request.query(`SELECT fw.id AS faculty_work_lid, fw.faculty_lid, icw.module_name, icw.program_id, f.faculty_name, f.faculty_id FROM [${slug}].faculty_works fw
            INNER JOIN [${slug}].program_sessions ps ON ps.id = fw.program_session_lid
            INNER JOIN [${slug}].initial_course_workload icw ON icw.id = fw.module_lid
            INNER JOIN [${slug}].faculties f ON f.id = fw.faculty_lid
            WHERE fw.faculty_lid = @facultyLid AND fw.module_lid = @moduleLid AND ps.program_lid = @programLid AND ps.acad_session_lid = @acadSessionLid`)
        })
    }


    static changePreferenceStatus(body, slug, userId) {
        console.log('slug', slug)
        return poolConnection.then(pool => {
            const request = pool.request();
            request.input('Id', sql.Int, body.id)
                .input('Status', sql.TinyInt, body.status)
                .input('userId', sql.TinyInt, userId)
            let stmt = `UPDATE [${slug}].faculty_works SET is_batch_preference_set = @Status, last_modified_by = @userId WHERE id =  @Id`
            return request.query(stmt)
        })
    }

    static facultyWorkEvents(body, slug) {
        console.log('procedure', slug)
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('program_lid', sql.Int, body.programLid)
                .input('acad_session_lid', sql.Int, body.sessionLid)
                .input('module_lid', sql.Int, body.moduleLid)
                .input('day_lid', sql.Int, body.dayLid)
                .input('start_slot_lid', sql.Int, body.startSlotLid)
                .input('end_slot_lid', sql.Int, body.endSlotLid)
                .output('output_flag', sql.Bit)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[${slug}].[sp_get_avail_faculties]`)
        })
    }

    static downloadExcel(slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT f.faculty_id, f.faculty_name, ft.name as faculty_type, p.program_name, p.program_code, icw.module_name, icw.module_code, icw.module_id, acs.acad_session, fw.lecture_per_week, IIF(fw.practical_per_week IS NULL,0,fw.practical_per_week) practical_per_week, IIF(fw.tutorial_per_week IS NULL,0, fw.tutorial_per_week) AS tutorial_per_week, IIF(fw.workshop_per_week IS NULL, 0, fw.workshop_per_week) AS workshop_per_week,  IIF(fw.is_batch_preference_set = 1 ,'Yes','No') as is_batch_preference_set_status   
            FROM [${slug}].faculty_works fw 
            INNER JOIN [${slug}].[initial_course_workload] icw ON icw.id = fw.module_lid
            INNER JOIN [${slug}].faculties f ON f.id = fw.faculty_lid
            INNER JOIN [dbo].faculty_types ft ON ft.id =  f.faculty_type_lid
            INNER JOIN [${slug}].program_sessions ps ON ps.id = fw.program_session_lid 
            INNER JOIN [${slug}].programs p ON p.id = ps.program_lid
            INNER JOIN [dbo].acad_sessions acs ON acs.id = ps.acad_session_lid ORDER BY fw.id DESC`)
        })
    }
}