const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = class CourseDayRoomPreferences {
    static fetchAll(rowcont, slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT TOP ${Number(rowcont)} cdrp.id, p.program_name, icw.module_name, IIF(icw.module_code IS NULL ,'NA', icw.module_code) AS module_code, div.division, div.division_num, dbatch.batch, dbatch.batch_count, d.day_name, acads.acad_session, r.capacity, r.room_number, r.floor_number, r.id as room_id FROM [${slug}].course_day_room_preferences cdrp
            INNER JOIN [${slug}].programs p ON cdrp.program_lid = p.id
            INNER JOIN [${slug}].initial_course_workload icw ON cdrp.course_lid = icw.id
            INNER JOIN [${slug}].divisions div ON cdrp.division_lid = div.id
            INNER JOIN [${slug}].division_batches dbatch ON cdrp.batch_lid = dbatch.id
            INNER JOIN [${slug}].days d ON cdrp.day_lid =  d.id
            INNER JOIN [dbo].acad_sessions acads ON cdrp.acad_session_lid = acads.id
            INNER JOIN [dbo].rooms r ON cdrp.room_lid = r.id
            ORDER BY cdrp.id DESC`)
        })
    }

    static getCount(slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.query(`SELECT COUNT(*) as count FROM [${slug}].course_day_room_preferences`)
        })
    }


    static pagination(pageNo, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('pageNo', sql.Int, pageNo)
                .query(`SELECT cdrp.id, p.program_name, icw.module_name, IIF(icw.module_code IS NULL ,'NA', icw.module_code) AS module_code, div.division, div.division_num, dbatch.batch, dbatch.batch_count, d.day_name, acads.acad_session, r.capacity, r.room_number, r.floor_number, r.id as room_id FROM [${slug}].course_day_room_preferences cdrp
                INNER JOIN [${slug}].programs p ON cdrp.program_lid = p.id
                INNER JOIN [${slug}].initial_course_workload icw ON cdrp.course_lid = icw.id
                INNER JOIN [${slug}].divisions div ON cdrp.division_lid = div.id
                INNER JOIN [${slug}].division_batches dbatch ON cdrp.batch_lid = dbatch.id
                INNER JOIN [${slug}].days d ON cdrp.day_lid =  d.id
                INNER JOIN [dbo].acad_sessions acads ON cdrp.acad_session_lid = acads.id
                INNER JOIN [dbo].rooms r ON cdrp.room_lid = r.id
                ORDER BY cdrp.id DESC OFFSET (@pageNo - 1) * 10 ROWS FETCH NEXT 10 ROWS ONLY`)
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

    static getAcadSession(program_lid, slug) {
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.input('program_lid', sql.Int, program_lid).query(`SELECT  p.id, p.program_name, ps.acad_session_lid, acs.acad_session FROM [${slug}].program_sessions ps 
                INNER JOIN [${slug}].programs p ON p.id = ps.program_lid
                INNER JOIN [dbo].acad_sessions acs ON acs.id = ps.acad_session_lid
                WHERE p.id = @program_lid`)
        })
    }

    static getDayName(program_lid, slug) {
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.input('program_lid', sql.Int, program_lid).query(
                `SELECT d.id as day_lid, pd.program_lid, d.day_name FROM [${slug}].program_days pd 
                INNER JOIN [${slug}].days d ON d.id = pd.day_lid 
                WHERE pd.is_lecture = 1 AND pd.program_lid = @program_lid;
                `
            )
        })
    }

    static getCourseList(body, slug) {
        return poolConnection.then(pool => {
            let request = pool.request();
            let stmt = `SELECT icw.id, icw.module_name, icw.program_id, p.id as program_lid FROM [${slug}].initial_course_workload icw
            INNER JOIN [${slug}].programs p ON p.program_id = icw.program_id
            WHERE p.id IN(${JSON.parse(body.program_lid)}) AND acad_session_lid IN(${JSON.parse(body.acad_session_lid)})`;
            console.log('stmt::::::::::::::', stmt)
            return request.query(stmt)
        })
    }

    static getDivList(body, slug) {
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.input('course_lid', sql.Int, body.course_lid)
                .query(
                    `SELECT  db.id as batch_lid, db.division_lid, d.division FROM [${slug}].division_batches db
                INNER JOIN [${slug}].divisions d ON d.id = db.division_lid 
                WHERE d.course_lid = @course_lid;
                `
                )
        })
    }

    static refresh(slug) {
        console.log('Refresh::::::::>>')
        return poolConnection.then(pool => {
            const request = pool.request();
            return request
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[${slug}].[sp_refresh_course_day_room_preferences]`)
        })
    }


    static save(inputJSON, slug, userid) {
        console.log('Course prefernceinputJSON::::::::::',  JSON.stringify(inputJSON))
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(inputJSON))
                .input('last_modified_by', sql.Int, userid)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[${slug}].[sp_set_course_day_room_preferences]`)
        })
    }

    static batchByDivisionId(division_lids, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            let stmt = `select db.id, db.batch, et.name AS event_type from [${slug}].division_batches db
            INNER JOIN [dbo].event_types et ON et.id = db.event_type_lid
            where db.division_lid IN(${division_lids})`;
            return request
                .query(stmt)
        })
    }

    static getAcadSessionList(program_lids, slug) {
        return poolConnection.then(pool => {
            let request = pool.request();
            let stmt = `SELECT  DISTINCT ps.acad_session_lid, acs.acad_session FROM [${slug}].program_sessions ps 
            INNER JOIN [${slug}].programs p ON p.id = ps.program_lid
            INNER JOIN [dbo].acad_sessions acs ON acs.id = ps.acad_session_lid
            WHERE p.id IN(${program_lids})`;
            return request.query(stmt)
        })
    }

    static findSemesterByProgramId(programid, slug) {
        console.log('programid:::::::::::>>',programid)
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('programId', sql.Int, programid).query(`select ads.id as session_id, ads.acad_session , p.program_id from [${slug}].program_sessions ps
            INNER JOIN [dbo].acad_sessions ads ON ads.id = ps.acad_session_lid
            INNER JOIN [${slug}].programs p ON p.id = ps.program_lid
            WHERE ps.program_lid = @programId`)
        })
    }

    static findModuleByProgramIdSemId(body, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('programId', sql.Int, body.programId)
                .input('sessionId', sql.Int, body.sessionId)
                .query(`select * from [${slug}].initial_course_workload where program_id = @programId and acad_session_lid = @sessionId`)
        })
    }

    static findDivisionByModuleId(moduleLid, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('moduleLid', sql.Int, moduleLid)
                .query(`select * from [${slug}].divisions WHERE course_lid = @moduleLid`)
        })
    }

    //WITH JSON DATA
        static icwForPreferenceTest(slug) {
            return poolConnection.then(pool => {
                return pool.request().query(`SELECT icw.id, icw.module_name,p.program_name, ads.acad_session, p.program_id,
    (SELECT id, RTRIM(LTRIM(division)) as division FROM [${slug}].divisions WHERE  divisions.course_lid = icw.id FOR JSON PATH) AS divisions,
    (SELECT db.id, db.batch FROM [${slug}].division_batches db INNER JOIN [${slug}].divisions d ON d.id = db.division_lid WHERE d.course_lid = icw.id FOR JSON PATH) as division_batches
    FROM [${slug}].initial_course_workload icw
    INNER JOIN [${slug}].programs p ON p.program_id = icw.program_id
    INNER JOIN [dbo].acad_sessions ads ON ads.id =icw.acad_session_lid`)
            })
        }

    // static icwForPreference(slug) {
    //     return poolConnection.then(pool => {
    //         return pool.request().query(`SELECT icw.id, icw.module_name, p.program_name, ads.acad_session, p.program_id, p.id as program_lid, ads.id as session_id, icw.id as module_id, d.division, d.id as division_id, db.batch, db.id as batch_id,
    //         (SELECT et.name from [dbo].event_types et WHERE et.id = db.event_type_lid) as batch_event,
    //         (SELECT d.id, d.day_name from [${slug}].course_day_room_preferences cdrp
    //             INNER JOIN [${slug}].days d ON d.id = cdrp.day_lid
    //             WHERE cdrp.program_lid = p.id AND cdrp.acad_session_lid = ads.id AND cdrp.course_lid = icw.id AND cdrp.batch_lid = db.id AND cdrp.day_lid = d.id
    //              FOR JSON PATH) AS days
    //     FROM [${slug}].initial_course_workload icw
    //     INNER JOIN [${slug}].programs p ON p.program_id = icw.program_id
    //     INNER JOIN [dbo].acad_sessions ads ON ads.id = icw.acad_session_lid
    //     INNER JOIN [${slug}].divisions d ON d.course_lid = icw.id
    //     INNER JOIN [${slug}].division_batches db ON db.division_lid = d.id`)
    //     })
    // }


    static icwForPreference(slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT t1.program_lid, p.program_name, t1.acad_Session_lid, ads.acad_session, t1.course_lid, icw.module_name, t1.division_lid, d.division, t1.batch_lid, db.batch, et.name as batch_type, 
            (
            SELECT d.id, d.day_name FROM (SELECT DISTINCT day_lid FROM [${slug}].course_day_room_preferences icw WHERE icw.program_lid = t1.program_lid AND icw.acad_session_lid = t1.acad_session_lid AND icw.course_lid  = t1.course_lid AND icw.division_lid = t1.division_lid AND icw.batch_lid = t1.batch_lid) t1
            INNER JOIN days d ON d.id = t1.day_lid FOR JSON PATH
            ) AS days,
            (
            SELECT r.id, r.room_number, rt.name as room_type  FROM (SELECT DISTINCT room_lid FROM [${slug}].course_day_room_preferences WHERE program_lid = t1.program_lid AND acad_session_lid = t1.acad_session_lid AND course_lid  = t1.course_lid AND division_lid = t1.division_lid AND batch_lid = t1.batch_lid) t2 
            INNER JOIN rooms r ON r.id = t2.room_lid
            INNER JOIN [dbo].room_types rt ON rt.id = r.room_type_id
            FOR JSON PATH
            
            )  AS rooms
            FROM 
            (SELECT DISTINCT program_lid, acad_session_lid, course_lid, division_lid, batch_lid FROM [${slug}].course_day_room_preferences) t1
            INNER JOIN [${slug}].programs p ON p.id = t1.program_lid
            INNER JOIN acad_sessions ads ON ads.id = t1.acad_session_lid
            INNER JOIN [${slug}].initial_course_workload icw ON icw.id = t1.course_lid
            INNER JOIN [${slug}].divisions d ON d.id = t1.division_lid
            INNER JOIN [${slug}].division_batches db ON db.id = t1.batch_lid
            INNER JOIN event_types et ON et.id = db.event_type_lid
            `)
        })
    }


    static preferenceByProgramId(programId, slug) {
        // return poolConnection.then(pool => {
        //     let request = pool.request()
        //     return request.input('programId', sql.Int, programId)
        //         .query(`SELECT icw.id, icw.module_name, p.program_name, ads.acad_session, p.program_id, p.id as program_lid, ads.id as session_id, icw.id as module_id, d.division, d.id as division_id, db.batch, db.id as batch_id,
        //         (SELECT et.name from [dbo].event_types et WHERE et.id = db.event_type_lid) as batch_event
        //     FROM [${slug}].initial_course_workload icw
        //     INNER JOIN [${slug}].programs p ON p.program_id = icw.program_id
        //     INNER JOIN [dbo].acad_sessions ads ON ads.id = icw.acad_session_lid
        //     INNER JOIN [${slug}].divisions d ON d.course_lid = icw.id
        //     INNER JOIN [${slug}].division_batches db ON db.division_lid = d.id
        //     WHERE p.id = @programId`)
        // })
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('programId', sql.Int, programId).query(`SELECT t1.program_lid, p.program_name, t1.acad_Session_lid, ads.acad_session, t1.course_lid, icw.module_name, t1.division_lid, d.division, t1.batch_lid, db.batch, et.name as batch_type, 
            (
            SELECT d.id, d.day_name FROM (SELECT DISTINCT day_lid FROM [${slug}].course_day_room_preferences icw WHERE icw.program_lid = t1.program_lid AND icw.acad_session_lid = t1.acad_session_lid AND icw.course_lid  = t1.course_lid AND icw.division_lid = t1.division_lid AND icw.batch_lid = t1.batch_lid) t1
            INNER JOIN days d ON d.id = t1.day_lid FOR JSON PATH
            ) AS days,
            (
            SELECT r.id, r.room_number, rt.name as room_type  FROM (SELECT DISTINCT room_lid FROM [${slug}].course_day_room_preferences WHERE program_lid = t1.program_lid AND acad_session_lid = t1.acad_session_lid AND course_lid  = t1.course_lid AND division_lid = t1.division_lid AND batch_lid = t1.batch_lid) t2 
            INNER JOIN rooms r ON r.id = t2.room_lid
            INNER JOIN [dbo].room_types rt ON rt.id = r.room_type_id
            FOR JSON PATH
            
            )  AS rooms
            FROM 
            (SELECT DISTINCT program_lid, acad_session_lid, course_lid, division_lid, batch_lid FROM [${slug}].course_day_room_preferences) t1
            INNER JOIN [${slug}].programs p ON p.id = t1.program_lid
            INNER JOIN acad_sessions ads ON ads.id = t1.acad_session_lid
            INNER JOIN [${slug}].initial_course_workload icw ON icw.id = t1.course_lid
            INNER JOIN [${slug}].divisions d ON d.id = t1.division_lid
            INNER JOIN [${slug}].division_batches db ON db.id = t1.batch_lid
            INNER JOIN event_types et ON et.id = db.event_type_lid
            WHERE t1.program_lid = @programId`)
        })
    }



    static preferenceByProgramIdSessionId(body, slug) {
        console.log('body:::::::', body)
        // return poolConnection.then(pool => {
        //     let request = pool.request()
        //     return request
        //         .input('programId', sql.Int, body.programId)
        //         .input('sessionId', sql.Int, body.sessionId)
        //         .query(`SELECT icw.id, icw.module_name, p.program_name, ads.acad_session, p.program_id, p.id as program_lid, ads.id as session_id, icw.id as module_id, d.division, d.id as division_id, db.batch, db.id as batch_id,
        //         (SELECT et.name from [dbo].event_types et WHERE et.id = db.event_type_lid) as batch_event
        //     FROM [${slug}].initial_course_workload icw
        //     INNER JOIN [${slug}].programs p ON p.program_id = icw.program_id
        //     INNER JOIN [dbo].acad_sessions ads ON ads.id = icw.acad_session_lid
        //     INNER JOIN [${slug}].divisions d ON d.course_lid = icw.id
        //     INNER JOIN [${slug}].division_batches db ON db.division_lid = d.id
        //     WHERE p.program_id = @programId AND icw.acad_session_lid  = @sessionId`)
        // })
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('programLid', sql.Int, body.programLid)
            .input('sessionId', sql.Int, body.sessionId)
            .query(`SELECT t1.program_lid, p.program_name, t1.acad_Session_lid, ads.acad_session, t1.course_lid, icw.module_name, t1.division_lid, d.division, t1.batch_lid, db.batch, et.name as batch_type, 
            (
            SELECT d.id, d.day_name FROM (SELECT DISTINCT day_lid FROM [${slug}].course_day_room_preferences icw WHERE icw.program_lid = t1.program_lid AND icw.acad_session_lid = t1.acad_session_lid AND icw.course_lid  = t1.course_lid AND icw.division_lid = t1.division_lid AND icw.batch_lid = t1.batch_lid) t1
            INNER JOIN days d ON d.id = t1.day_lid FOR JSON PATH
            ) AS days,
            (
            SELECT r.id, r.room_number, rt.name as room_type  FROM (SELECT DISTINCT room_lid FROM [${slug}].course_day_room_preferences WHERE program_lid = t1.program_lid AND acad_session_lid = t1.acad_session_lid AND course_lid  = t1.course_lid AND division_lid = t1.division_lid AND batch_lid = t1.batch_lid) t2 
            INNER JOIN rooms r ON r.id = t2.room_lid
            INNER JOIN [dbo].room_types rt ON rt.id = r.room_type_id
            FOR JSON PATH
            
            )  AS rooms
            FROM 
            (SELECT DISTINCT program_lid, acad_session_lid, course_lid, division_lid, batch_lid FROM [${slug}].course_day_room_preferences) t1
            INNER JOIN [${slug}].programs p ON p.id = t1.program_lid
            INNER JOIN acad_sessions ads ON ads.id = t1.acad_session_lid
            INNER JOIN [${slug}].initial_course_workload icw ON icw.id = t1.course_lid
            INNER JOIN [${slug}].divisions d ON d.id = t1.division_lid
            INNER JOIN [${slug}].division_batches db ON db.id = t1.batch_lid
            INNER JOIN event_types et ON et.id = db.event_type_lid
            WHERE t1.program_lid = @programLid AND t1.acad_session_lid  = @sessionId`)
        })
    }


    static preferenceByModuleId(moduleLid, slug) {
        // return poolConnection.then(pool => {
        //     let request = pool.request()
        //     return request
        //         .input('moduleId', sql.Int, moduleId)
        //         .query(`SELECT icw.id, icw.module_name, p.program_name, ads.acad_session, p.program_id, p.id as program_lid, ads.id as session_id, icw.id as module_id, d.division, d.id as division_id, db.batch, db.id as batch_id,
        //         (SELECT et.name from [dbo].event_types et WHERE et.id = db.event_type_lid) as batch_event
        //     FROM [${slug}].initial_course_workload icw
        //     INNER JOIN [${slug}].programs p ON p.program_id = icw.program_id
        //     INNER JOIN [dbo].acad_sessions ads ON ads.id = icw.acad_session_lid
        //     INNER JOIN [${slug}].divisions d ON d.course_lid = icw.id
        //     INNER JOIN [${slug}].division_batches db ON db.division_lid = d.id
        //     WHERE icw.id = @moduleId`)
        // })
            return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('moduleLid', sql.Int, moduleLid)
            .query(`SELECT t1.program_lid, p.program_name, t1.acad_Session_lid, ads.acad_session, t1.course_lid, icw.module_name, t1.division_lid, d.division, t1.batch_lid, db.batch, et.name as batch_type, 
            (
            SELECT d.id, d.day_name FROM (SELECT DISTINCT day_lid FROM [${slug}].course_day_room_preferences icw WHERE icw.program_lid = t1.program_lid AND icw.acad_session_lid = t1.acad_session_lid AND icw.course_lid  = t1.course_lid AND icw.division_lid = t1.division_lid AND icw.batch_lid = t1.batch_lid) t1
            INNER JOIN days d ON d.id = t1.day_lid FOR JSON PATH
            ) AS days,
            (
            SELECT r.id, r.room_number, rt.name as room_type  FROM (SELECT DISTINCT room_lid FROM [${slug}].course_day_room_preferences WHERE program_lid = t1.program_lid AND acad_session_lid = t1.acad_session_lid AND course_lid  = t1.course_lid AND division_lid = t1.division_lid AND batch_lid = t1.batch_lid) t2 
            INNER JOIN rooms r ON r.id = t2.room_lid
            INNER JOIN [dbo].room_types rt ON rt.id = r.room_type_id
            FOR JSON PATH
            
            )  AS rooms
            FROM 
            (SELECT DISTINCT program_lid, acad_session_lid, course_lid, division_lid, batch_lid FROM [${slug}].course_day_room_preferences) t1
            INNER JOIN [${slug}].programs p ON p.id = t1.program_lid
            INNER JOIN acad_sessions ads ON ads.id = t1.acad_session_lid
            INNER JOIN [${slug}].initial_course_workload icw ON icw.id = t1.course_lid
            INNER JOIN [${slug}].divisions d ON d.id = t1.division_lid
            INNER JOIN [${slug}].division_batches db ON db.id = t1.batch_lid
            INNER JOIN event_types et ON et.id = db.event_type_lid
            WHERE t1.course_lid  = @moduleLid`)
        })
    }

    static searchPreferences(body, slug) {
        // console.log('Search :::::::::', body)
        // return poolConnection.then(pool => {
        //     let request = pool.request()
        //     return request.input('divisionId', sql.Int, body.division_id)
        //         .input('programId', sql.Int, body.program_id)
        //         .input('sessionId', sql.Int, body.session_id)
        //         .input('moduleId', sql.Int, body.module_id)
        //         .query(`SELECT icw.id, icw.module_name, p.program_name, ads.acad_session, p.program_id, p.id as program_lid, ads.id as session_id, icw.id as module_id, d.division, d.id as division_id, db.batch, db.id as batch_id,
        //         (SELECT et.name from [dbo].event_types et WHERE et.id = db.event_type_lid) as batch_event
        //     FROM [${slug}].initial_course_workload icw
        //     INNER JOIN [${slug}].programs p ON p.program_id = icw.program_id
        //     INNER JOIN [dbo].acad_sessions ads ON ads.id = icw.acad_session_lid
        //     INNER JOIN [${slug}].divisions d ON d.course_lid = icw.id
        //     INNER JOIN [${slug}].division_batches db ON db.division_lid = d.id
        //     WHERE p.id = @programId AND icw.acad_session_lid  = @sessionId AND icw.id = @moduleId AND d.id = @divisionId`)
        // })
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('divisionLid', sql.Int, body.divisionLid)
                .input('programLid', sql.Int, body.programLid)
                .input('sessionLid', sql.Int, body.sessionLid)
                .input('moduleLid', sql.Int, body.moduleLid)
            .query(`SELECT t1.program_lid, p.program_name, t1.acad_Session_lid, ads.acad_session, t1.course_lid, icw.module_name, t1.division_lid, d.division, t1.batch_lid, db.batch, et.name as batch_type, 
            (
            SELECT d.id, d.day_name FROM (SELECT DISTINCT day_lid FROM [${slug}].course_day_room_preferences icw WHERE icw.program_lid = t1.program_lid AND icw.acad_session_lid = t1.acad_session_lid AND icw.course_lid  = t1.course_lid AND icw.division_lid = t1.division_lid AND icw.batch_lid = t1.batch_lid) t1
            INNER JOIN days d ON d.id = t1.day_lid FOR JSON PATH
            ) AS days,
            (
            SELECT r.id, r.room_number, rt.name as room_type  FROM (SELECT DISTINCT room_lid FROM [${slug}].course_day_room_preferences WHERE program_lid = t1.program_lid AND acad_session_lid = t1.acad_session_lid AND course_lid  = t1.course_lid AND division_lid = t1.division_lid AND batch_lid = t1.batch_lid) t2 
            INNER JOIN rooms r ON r.id = t2.room_lid
            INNER JOIN [dbo].room_types rt ON rt.id = r.room_type_id
            FOR JSON PATH
            
            )  AS rooms
            FROM 
            (SELECT DISTINCT program_lid, acad_session_lid, course_lid, division_lid, batch_lid FROM [${slug}].course_day_room_preferences) t1
            INNER JOIN [${slug}].programs p ON p.id = t1.program_lid
            INNER JOIN acad_sessions ads ON ads.id = t1.acad_session_lid
            INNER JOIN [${slug}].initial_course_workload icw ON icw.id = t1.course_lid
            INNER JOIN [${slug}].divisions d ON d.id = t1.division_lid
            INNER JOIN [${slug}].division_batches db ON db.id = t1.batch_lid
            INNER JOIN event_types et ON et.id = db.event_type_lid
            WHERE t1.program_lid = @programLid AND t1.acad_session_lid  = @sessionLid AND t1.course_lid = @moduleLid AND t1.division_lid = @divisionLid`)
        })
    }









    // static search(keyword, slug) {
    //     return poolConnection.then(pool => {
    //         let request = pool.request()
    //         return request.input('keyword', sql.NVarChar(100), '%' + keyword + '%')
    //             .query(`SELECT  icw.id, icw.module_name, p.program_name, ads.acad_session, p.program_id, p.id as program_lid, ads.id as session_id, icw.id as module_id, d.division, d.id as division_id, db.batch, db.id as batch_id,
    //             (SELECT et.name from [dbo].event_types et WHERE et.id = db.event_type_lid) as batch_event
    //         FROM [${slug}].initial_course_workload icw
    //         INNER JOIN [${slug}].programs p ON p.program_id = icw.program_id
    //         INNER JOIN [dbo].acad_sessions ads ON ads.id = icw.acad_session_lid
    //         INNER JOIN [${slug}].divisions d ON d.course_lid = icw.id
    //         INNER JOIN [${slug}].division_batches db ON db.division_lid = d.id 
    //         WHERE icw.module_name LIKE @keyword OR p.program_name LIKE @keyword OR ads.acad_session LIKE @keyword OR p.program_id LIKE @keyword ORDER BY icw.id DESC`)
    //     })
    // }

    static search(keyword, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('keyword', sql.NVarChar(100), '%' + keyword + '%')
                .query(`SELECT t1.program_lid, p.program_name, t1.acad_Session_lid, ads.acad_session, t1.course_lid, icw.module_name, t1.division_lid, d.division, t1.batch_lid, db.batch, et.name as batch_type, 
                (
                SELECT d.id, d.day_name FROM (SELECT DISTINCT day_lid FROM [${slug}].course_day_room_preferences icw WHERE icw.program_lid = t1.program_lid AND icw.acad_session_lid = t1.acad_session_lid AND icw.course_lid  = t1.course_lid AND icw.division_lid = t1.division_lid AND icw.batch_lid = t1.batch_lid) t1
                INNER JOIN days d ON d.id = t1.day_lid FOR JSON PATH
                ) AS days,
                (
                SELECT r.id, r.room_number, rt.name as room_type  FROM (SELECT DISTINCT room_lid FROM [${slug}].course_day_room_preferences WHERE program_lid = t1.program_lid AND acad_session_lid = t1.acad_session_lid AND course_lid  = t1.course_lid AND division_lid = t1.division_lid AND batch_lid = t1.batch_lid) t2 
                INNER JOIN rooms r ON r.id = t2.room_lid
                INNER JOIN [dbo].room_types rt ON rt.id = r.room_type_id
                FOR JSON PATH
                
                )  AS rooms
                FROM 
                (SELECT DISTINCT program_lid, acad_session_lid, course_lid, division_lid, batch_lid FROM [${slug}].course_day_room_preferences) t1
                INNER JOIN [${slug}].programs p ON p.id = t1.program_lid
                INNER JOIN acad_sessions ads ON ads.id = t1.acad_session_lid
                INNER JOIN [${slug}].initial_course_workload icw ON icw.id = t1.course_lid
                INNER JOIN [${slug}].divisions d ON d.id = t1.division_lid
                INNER JOIN [${slug}].division_batches db ON db.id = t1.batch_lid
                INNER JOIN event_types et ON et.id = db.event_type_lid
            WHERE icw.module_name LIKE @keyword OR p.program_name LIKE @keyword OR ads.acad_session LIKE @keyword OR p.program_id LIKE @keyword ORDER BY icw.id DESC`)
        })
    }

    static occupiedRoomDays(slug, body){
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('batches', sql.Int, body.batches)
            .input('divisions', sql.Int, body.divisions)
            .input('moduleId', sql.Int, body.moduleId)
            .input('sessionId', sql.Int, body.sessionId)
            .input('programId', sql.Int, body.programId)
                .query(`SELECT DISTINCT d.day_name, r.room_number from [${slug}].course_day_room_preferences cdrp
                INNER JOIN [${slug}].days d ON d.id =  cdrp.day_lid
                INNER JOIN [dbo].rooms r ON r.id = cdrp.room_lid
                WHERE cdrp.program_lid = @programId and cdrp.acad_session_lid = @sessionId AND cdrp.course_lid = @moduleId
                AND cdrp.division_lid = @divisions AND cdrp.batch_lid = @batches`)
        })
    }
}