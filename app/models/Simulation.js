const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = class Simulation {

    // static dateRange(slug) {
    //     return poolConnection.then(pool => {
    //         return pool.request().query(`SELECT CONVERT(NVARCHAR, MIN(CONVERT(DATE, date_str, 103)), 23) AS start_date, CONVERT(NVARCHAR, DATEADD(DAY, 1, MAX(CONVERT(DATE, date_str, 103))), 23) AS end_date FROM [${slug}].timesheet`)
    //     }) 
    // } 

    static semesterDates(slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT DISTINCT date_str as dateString, day_name as dateNameString, active FROM [${slug}].timesheet`)
        })
    }

    static rescheduleFlag(slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT id, name, LTRIM(RTRIM(denoted_by)) as denotedBy FROM [dbo].reschedule_flags WHERE active = 1`)
        })
    }

    static slotData(slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`select len(sit.slot_name),  sit.slot_name, sit.start_time as starttime, _sit.end_time as endtime from [${slug}].school_timings st 
            INNER JOIN [dbo].slot_interval_timings sit ON sit.id = st.slot_start_lid
            INNER JOIN [dbo].slot_interval_timings _sit ON _sit.id =  st.slot_end_lid 
            ORDER BY len(sit.slot_name), sit.slot_name`)
        })
    }

    static programList(slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT DISTINCT p.id, p.program_id, p.program_name as programName from [${slug}].timesheet ft INNER JOIN [${slug}].programs p ON p.id = ft.program_lid WHERE ft.active = 1`)
        })
    }

    static roomList(slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT roomno, roomtype, room_uid FROM [${slug}].room_data WHERE active = 'Y'`)
        })
    }

    static userProgramId(slug, username) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT programId FROM [${slug}].users WHERE username = '${username}'`)
        })
    }

    // static getAvailableRoomForTimeRange(slug, dayLid, startSlot, endSlot) {
    //     return poolConnection.then(pool => {
    //         return pool.request()
    //         .input('dayLid', sql.Int, dayLid)
    //         .input('startSlot', sql.Int, startSlot)
    //         .input('endSlot', sql.Int, endSlot)
    //         .query(`SELECT t1.room_lid, r.room_number FROM
	// 		(SELECT * FROM [${slug}].room_transaction_details WHERE start_time_id <= @startSlot AND end_time_id >= @endSlot AND room_lid
	// 		NOT IN (SELECT room_lid FROM [${slug}].timesheet WHERE date_str = @date AND  start_time_lid = @startSlot AND end_time_lid = @endSlot)) t1
	// 		INNER JOIN rooms r ON r.id = t1.room_lid`)
    //     })
    // }

    static getAvailableFacultyForTimeRange(slug, date, roomLid, startSlot, endSlot, programLid, sessionLid, moduleLid) { 
        return poolConnection.then(pool => {
            console.log('available faculty check',slug, date, roomLid, startSlot, endSlot, programLid, sessionLid, moduleLid)
            return pool.request()
            .input('date', sql.NVarChar(sql.MAX), date)
            // .input('roomLid', sql.Int, roomLid)
            .input('startSlot', sql.Int, startSlot)
            .input('endSlot', sql.Int, endSlot)
            .input('programLid', sql.Int, programLid)
            .input('sessionLid', sql.Int, sessionLid)
            .input('moduleLid', sql.Int, moduleLid)
            .query(`SELECT fp.faculty_lid, fp.faculty_id, fp.faculty_name, (select abbr from faculty_types where id = (select faculty_type_lid from [${slug}].faculties where id = fp.faculty_lid)) as faculty_type_abbr FROM (SELECT f.id AS faculty_lid,  f.faculty_id AS faculty_id,  f.faculty_name AS faculty_name, ts.start_time_lid, ts.end_time_lid FROM [${slug}].faculty_works fw
                INNER JOIN [${slug}].program_sessions ps
                ON ps.id =  fw.program_session_lid
                INNER JOIN [${slug}].faculties f
                ON f.id =  fw.faculty_lid
                INNER JOIN (SELECT @startSlot AS start_time_lid, @endSlot AS end_time_lid) ts
                ON 1 = 1
                WHERE fw.module_lid = @moduleLid AND ps.program_lid = @programLid AND ps.acad_session_lid = @sessionLid)
                fp
                LEFT JOIN
                (SELECT t.faculty_id, t.faculty_name, t.start_time_lid, t.end_time_lid FROM [${slug}].timesheet t WHERE t.date = @date AND t.program_lid = @programLid AND t.acad_session_lid = @sessionLid AND t.module_lid = @moduleLid AND t.active = 1) fb
                ON 
                fp.faculty_id = fb.faculty_id AND
                fp.start_time_lid = fb.start_time_lid AND
                fp.end_time_lid = fb.end_time_lid
                WHERE fb.faculty_id IS NULL`)
        })
    }

    static LectureByDateRange(slug, body) {
        console.log('body:::::::::',body)
        return poolConnection.then(pool => {
            let lecStmt = `SELECT * FROM [${slug}].timesheet WHERE active = 1 AND CONVERT(DATE, date_str, 103) BETWEEN CONVERT(DATE, @fromDate, 103) AND CONVERT(DATE, @toDate, 103) AND program_lid = @program_lid AND  division_lid = @division_lid AND module_lid = @module_lid AND acad_session_lid = @acad_session_lid AND faculty_lid = @facultyLid ORDER BY date ASC`;
           
            console.log('lecStmt:::::::::::::',lecStmt)

            let request = pool.request()
            return request
                .input('fromDate', sql.NVarChar(20), body.fromDate)
                .input('toDate', sql.NVarChar(20), body.toDate)
                .input('facultyLid', sql.Int, body.facultyLid)
                .input('program_lid', sql.Int, body.program_lid)
                .input('division_lid', sql.Int, body.division_lid)
                .input('module_lid', sql.Int, body.module_lid)
                .input('acad_session_lid', sql.Int, body.acad_session_lid)
                .query(lecStmt)
        })
    }

    static facultyLectureCount(slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request
                .query(`SELECT COUNT(*) as count FROM [${slug}].timesheet WHERE active = 1 AND sap_flag <> 'E'`)
        })
    }

    static facultyLectureLimit(slug, body) {
        return poolConnection.then(pool => {

            // if (!body.facultyId) {
            //     lecStmt = `SELECT TOP ${Number(body.rowcount)} * FROM [${slug}].faculty_timetable WHERE active = 1 AND CONVERT(DATE, date_str, 103) BETWEEN CONVERT(DATE, @fromDate, 103) AND CONVERT(DATE, @toDate, 103) AND (sap_flag <> 'E' OR is_new_ec <> 1) ORDER BY id ASC;`
            // } else if(!body.fromDate && !body.toDate){
            //     lecStmt = `SELECT TOP ${Number(body.rowcount)} * FROM [${slug}].faculty_timetable WHERE active = 1 AND CONVERT(DATE, date_str, 103) BETWEEN CONVERT(DATE, @fromDate, 103) AND CONVERT(DATE, @toDate, 103) AND faculty_id = @facultyId AND (sap_flag <> 'E' OR is_new_ec <> 1) ORDER BY id ASC;`
            // }else{

            // }

            let lecStmt = `SELECT TOP ${Number(body.rowcount)} * FROM [${slug}].timesheet WHERE active = 1 ORDER BY id ASC;`
            let request = pool.request()
            return request
                // .input('fromDate', sql.NVarChar(20), body.fromDate)
                // .input('toDate', sql.NVarChar(20), body.toDate)
                // .input('facultyId', sql.Int, body.facultyId)
                //.input('pageNo', sql.Int, body.pageNo)
                .query(lecStmt)
        })
    }

    static facultyByModuleProgramId(slug, body) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request
                .input('programId', sql.NVarChar(20), body.programId)
                .input('moduleId', sql.NVarChar(20), body.moduleId)
                .query(`SELECT facultyId, facultyName, type FROM [${slug}].facultyWorkloadStatus WHERE active = 'Y' AND moduleId = @programId AND programId = @moduleId`)
        })
    }

    static getCancelledLecture(slug, body) {
        console.log('body::>>', body)
        return poolConnection.then(pool => {
            let request = pool.request()
            return request
                .input('programLid', sql.Int, body.programLid)
                .input('divisionLid', sql.Int, body.divisionLid)
                .input('moduleLid', sql.Int, body.moduleLid)
                .input('acadSessionLid', sql.Int, body.acadSessionLid)
                .query(`
                select ts.* from [${slug}].timesheet ts
                inner join
                (select t1.* from
                (select * from [${slug}].reschedule_transaction where sap_flag ='C' and trans_status = 'success') t1
                left join (select extra_against from [${slug}].reschedule_transaction where sap_flag ='E' and trans_status = 'success' ) t2 ON t1.unx_lid = t2.extra_against
                where t2.extra_against is null) t3
                on t3.unx_lid = ts.unx_lid
                where ts.program_lid = @programLid AND ts.acad_session_lid = @acadSessionLid AND ts.module_lid = @moduleLid AND ts.division_lid = @divisionLid
                `)
        })
    }

    static facultyByModuleProgramSapDivisionId(slug, body) {
        console.log('facilty_lis:::', body)
        return poolConnection.then(pool => {
            let lecStmt = `SELECT DISTINCT faculty_lid, faculty_id, faculty_name, faculty_type FROM [${slug}].timesheet WHERE active = 1 AND CONVERT(DATE,date_str, 103) BETWEEN CONVERT(DATE, @fromDate, 103) AND CONVERT(DATE, @toDate, 103) AND  program_lid = @program_lid AND  division_lid = @division_lid AND module_lid = @module_lid AND acad_session_lid = @acad_session_lid`;
           
            console.log('lecStmt:::::::::::::',lecStmt)

            let request = pool.request()
            return request
                .input('fromDate', sql.NVarChar(20), body.fromDate)
                .input('toDate', sql.NVarChar(20), body.toDate)
                .input('facultyId', sql.Int, body.facultyId)
                .input('program_lid', sql.Int, body.program_lid)
                .input('division_lid', sql.Int, body.division_lid)
                .input('module_lid', sql.Int, body.module_lid)
                .input('acad_session_lid', sql.Int, body.acad_session_lid)
                .input('facultyLid', sql.Int, body.facultyLid)
                // .input('pageNo', sql.Int, body.pageNo)
                .query(lecStmt)
        })
    }

    static facultyDateRange(slug, body) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request
                .input('fromDate', sql.NVarChar(20), body.fromDate)
                .input('toDate', sql.NVarChar(20), body.toDate)
                .query(`SELECT DISTINCT faculty_id, faculty_name FROM [${slug}].timesheet WHERE active = 1 AND CONVERT(DATE, date_str, 103) BETWEEN CONVERT(DATE, @fromDate, 103) AND CONVERT(DATE, @toDate, 103)`)
        })
    }

    static newExtraLecture(slug, body) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request
                .input('program_lid', sql.Int, body.program_lid)
                .input('module_lid', sql.Int, body.module_lid)
                .input('division_lid', sql.Int, body.division_lid)
                .input('acad_session_lid', sql.Int, body.acad_session_lid)
                .input('date_str', sql.NVarChar(20), body.date_str)
                .query(`select ts.* from [${slug}].timesheet ts
                inner join
                (select t1.* from
                (select * from [${slug}].reschedule_transaction where sap_flag ='E' and trans_status = 'success' ) t1
                left join (select cancelled_against from [${slug}].reschedule_transaction where sap_flag ='C' and trans_status = 'success' ) t2 ON t1.unx_lid = t2.cancelled_against
                where t2.cancelled_against is null) t3
                on t3.unx_lid = ts.unx_lid
                where ts.program_lid = @program_lid AND ts.acad_session_lid = @acad_session_lid AND ts.module_lid = @module_lid AND ts.division_lid = @division_lid
                `)
        })
    }



    static newRegularLecture(slug, body) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request
                .input('program_lid', sql.NVarChar(20), body.program_lid)
                .input('module_lid', sql.NVarChar(20), body.module_lid)
                .input('division_lid', sql.NVarChar(20), body.division_lid)
                .input('acad_session_lid', sql.NVarChar(20), body.acad_session_lid)
                .input('date_str', sql.NVarChar(20), body.date_str)
                .query(`SELECT * FROM [${slug}].timesheet WHERE active = 1 AND sap_flag  <> 'E'  AND
                program_lid = @program_lid AND module_lid = @module_lid AND division_lid = @division_lid AND acad_session_lid  = @acad_session_lid AND date_str = @date_str`)
        })
    }




    static getLectures(slug, body) {
        console.log('getLectures Body:::::::::>>>', body)
        return poolConnection.then(pool => {
            let request = pool.request()
            return request
                .input('acadSession', sql.NVarChar(20), body.acadSession)
                .input('programId', sql.NVarChar(20), body.programId)
                .input('division', sql.NVarChar(20), body.division)
                .query(`SELECT DISTINCT Stuff((SELECT N'-' + part FROM fn_SplitString1(event_name, '-') WHERE id = 1 FOR XML PATH(''), TYPE).value('text()[1]','nvarchar(max)'),1,1,N'') AS event_name, event_abbr, sap_event_id, module_id, acad_year, event_type, unique_id_for_sap FROM [${slug}].faculty_timetable  WHERE active = 1 AND program_id = @programId AND acad_session = @acadSession AND division = @division`)
        })
    }

    static findByFacultyTimeTableByProgramId(program_lid, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request
                .input('program_lid', sql.NVarChar(20), program_lid)
                .query(`SELECT * FROM [${slug}].timesheet WHERE active = 1 AND program_lid = @program_lid AND sap_flag <> 'E' ORDER BY id ASC`)
        })
    }

    static findByFacultyTimeTableByProgramSession(body, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request
                .input('program_lid', sql.NVarChar(20), body.program_lid)
                .input('acad_session', sql.NVarChar(20), body.acad_session)
                .query(`SELECT * FROM [${slug}].timesheet WHERE active = 1 AND program_lid = @program_lid AND acad_session = @acad_session AND sap_flag <> 'E'  ORDER BY id ASC`)
        })
    }

    static semesterByProgramId(program_lid, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request
                .input('program_lid', sql.Int, program_lid)
                .query(`SELECT DISTINCT acad_session_lid, acad_session FROM [${slug}].timesheet WHERE program_lid = @program_lid`)
        })
    }

    static divisionByProgramSessionId(body, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request
                .input('program_lid', sql.NVarChar(20), body.program_lid)
                .input('acad_session', sql.Int, body.acad_session)
                .query(`SELECT DISTINCT division as div FROM [${slug}].timesheet WHERE program_lid = @program_lid AND acad_session_lid = @acad_session`)
        })
    }

    static findBySchelDivisionByProgramSession(body, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request
                .input('program_lid', sql.NVarChar(20), body.program_lid)
                .input('acad_session', sql.NVarChar(20), body.acad_session)
                .input('division', sql.NVarChar(20), body.division)
                .query(`SELECT * FROM [${slug}].timesheet WHERE active = 1 AND program_lid = @program_lid AND acad_session = @acad_session AND division = @division AND sap_flag <> 'E'  ORDER BY id ASC`)
        })
    }



    static divisionByProgramAcadSession(body, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request
                .input('programId', sql.NVarChar(20), body.programId)
                .input('acadSession', sql.NVarChar(20), body.acadSession)
                .query(`SELECT DISTINCT division as div FROM [${slug}].timesheet WHERE active = 1 AND program_id = @programId AND acad_session = @acadSession  ORDER BY division`)
        })
    }

    static CancelledLectures(slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.query(`WITH cte AS (SELECT *, ROW_NUMBER() OVER(PARTITION BY unx_lid ORDER BY id DESC) AS row_num FROM reschedule_transaction WHERE trans_status = 'success')
                SELECT id, transaction_id, z_flag, event_name, event_type, program_id, module_id, division, acad_session, faculty_id, date_str, room_no, acad_year, slot_name, (SELECT sapStartTime FROM [${slug}].school_timing WHERE active = 'Y' AND dayId = 1 AND slotName = slot_name) AS start_time, (SELECT sapEndTime FROM [${slug}].school_timing WHERE active = 'Y' AND dayId = 1 AND slotName = slot_name) AS end_time, reason_id, sap_event_id, unx_lid FROM cte WHERE row_num = 1 AND z_flag = 'C'`)
        })
    }

    static getResFaculties(slug, body) {
        return poolConnection.then(pool => {


            let request = pool.request()
            return request
                .input('moduleId', sql.NVarChar(20), body.moduleId)
                .input('programId', sql.NVarChar(20), body.programId)
                .query(`SELECT f.faculty_id as facultyId,  f.faculty_name as facultyName FROM [${slug}].faculty_works fw
                INNER JOIN [${slug}].program_sessions ps
                ON ps.id =  fw.program_session_lid
                INNER JOIN [${slug}].faculties f
                ON f.id =  fw.faculty_lid
                where fw.module_lid = @moduleId and ps.program_lid = @programId`)
        })
    }


    static getResSlots(slug, body) {
        return poolConnection.then(pool => {
            // SELECT DISTINCT slotName, starttime, endtime, sapStartTime, sapEndTime FROM [${res.locals.slug}].school_timing WHERE slotName NOT IN (SELECT DISTINCT slot_name FROM faculty_timetable WHERE active = 1 AND faculty_id = '${req.body.facultyId}' AND date_str = '${req.body.dateStr}')
            let request = pool.request()
            return request
                .input('facultyId', sql.NVarChar(20), body.facultyId)
                .input('dateStr', sql.NVarChar(20), body.dateStr)
                .query(`select start_time,  end_time,  sap_start_time  from [${slug}].timesheet WHERE faculty_id = @facultyId  AND date_str = @dateStr`)
        })
    }

    static uniqueFacultyByDate(slug, body) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request
                .input('toDate', sql.NVarChar(20), body.toDate)
                .input('fromDate', sql.NVarChar(20), body.fromDate)
                .query(`select DISTINCT faculty_id, faculty_name, faculty_lid 
                from [${slug}].timesheet WHERE 
                CONVERT(DATE, date_str, 103) BETWEEN CONVERT(DATE, @fromDate, 103) AND CONVERT(DATE, @toDate, 103)`)
        })
    }

    static timeSheetRoomByDate(slug, date_str) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request
                .input('dateStr', sql.NVarChar(20), date_str)
                .query(`select * from [${slug}].timesheet WHERE date_str = @dateStr`)
        })
    }


    static getResRooms(slug, date_str) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request
                .input('dateStr', sql.NVarChar(20), date_str)
                .query(`select DISTINCT room_no from [${slug}].timesheet WHERE date_str = @dateStr`)
        })
    }

    static findModuleByProgramSession(body, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request
                .input('program_lid', sql.Int, body.program_lid)
                .input('acad_session', sql.Int, body.acad_session)
                .query(`SELECT DISTINCT module_lid, module_name from [${slug}].timesheet where program_lid = @program_lid and acad_session_lid = @acad_session`)
        })
    }

    static getDivisionByProgramSessionModule(body, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request
                .input('program_lid', sql.Int, body.program_lid)
                .input('acad_session_lid', sql.Int, body.acad_session_lid)
                .input('module_lid', sql.Int, body.module_lid)
                .query(`SELECT DISTINCT division_lid,division from [${slug}].timesheet where program_lid = @program_lid and acad_session_lid = @acad_session_lid and module_lid = @module_lid`)
        })
    }



    static extraClassFaculties(slug, body) {
        // return poolConnection.then(pool => {
        //     let request = pool.request()
        //     return request
        //         .input('dateStr', sql.NVarChar(20), body.dateStr)
        //         .input('programId', sql.NVarChar(20), body.programId)
        //         .input('moduleId', sql.NVarChar(20), body.moduleId)
        //         .input('slotName', sql.NVarChar(20), body.slotName)
        //         .input('facultyId', sql.NVarChar(20), body.facultyId)
        //         .query(`SELECT fw.* FROM (SELECT id, facultyId, facultyName FROM [${slug}].facultyWorkloadStatus WHERE active = 'Y' AND moduleId = @moduleId AND programId = @programId) fw LEFT JOIN (SELECT faculty_id, faculty_name FROM faculty_timetable WHERE active = 1 AND date_str = @dateStr AND slot_name = @slotName' AND program_id = @programId AND module_id = @moduleId) f ON f.faculty_id = fw.facultyId WHERE f.faculty_id IS NULL`)
        // })
        return poolConnection.then(pool => {
            let lecStmt = `SELECT DISTINCT faculty_lid, faculty_id, faculty_name FROM [${slug}].timesheet WHERE active = 1 AND CONVERT(DATE,date_str, 103) = CONVERT(DATE, @toDate, 103) AND  program_lid = @program_lid AND  division_lid = @division_lid AND module_lid = @module_lid AND acad_session_lid = @acad_session_lid`;
            console.log('lecStmt:::::::::::::',lecStmt)
            let request = pool.request()
            return request
                .input('toDate', sql.NVarChar(20), body.toDate)
                .input('program_lid', sql.Int, body.program_lid)
                .input('division_lid', sql.Int, body.division_lid)
                .input('module_lid', sql.Int, body.module_lid)
                .input('acad_session_lid', sql.Int, body.acad_session_lid)
                .query(lecStmt)
        })
    }

    static getAvailableRoomForTimeRange(slug, body) {
        return poolConnection.then(pool => {
            console.log('date:::>>>>', body.date)
            return pool.request()
            .input('toDate', sql.NVarChar(sql.MAX), body.date)
            .input('startSlot', sql.Int, body.startTimeLid)
            .input('endSlot', sql.Int, body.endTimeLid)
            .query(`(SELECT t1.room_lid, r.room_number, r.room_abbr FROM
                (SELECT * FROM [${slug}].room_transaction_details WHERE start_time_id <= @startSlot AND end_time_id >= @endSlot AND room_lid
                NOT IN (SELECT DISTINCT room_lid FROM [${slug}].timesheet WHERE (date = @toDate) AND  ((start_time_lid <= @startSlot AND end_time_lid >= @startSlot) OR (start_time_lid <= @endSlot and end_time_lid >= @endSlot)) AND active = 1 )) t1
                INNER JOIN rooms r ON r.id = t1.room_lid)`)
        })
    }

    // static getAvailableFacultyForTimeRangeForExtraClass(slug, body) {
    //     return poolConnection.then(pool => {
    //         return pool.request()
    //         .input('date', sql.NVarChar(sql.MAX), body.date)
    //         .input('roomLid', sql.Int, body.roomLid)
    //         .input('startSlot', sql.Int, body.startSlot)
    //         .input('endSlot', sql.Int, body.endSlot)
    //         .input('programLid', sql.Int, body.program_lid)
    //         .input('sessionLid', sql.Int, body.acad_session_lid)
    //         .input('moduleLid', sql.Int, body.module_lid)
    //         .input('division_lid', sql.Int, body.division_lid)
    //         .query(`SELECT fp.faculty_lid, fp.faculty_id, fp.faculty_name, ft.abbr FROM (SELECT f.id AS faculty_lid,  f.faculty_id AS faculty_id,  f.faculty_name AS faculty_name, ts.start_time_lid, ts.end_time_lid FROM [${slug}].faculty_works fw
    //             INNER JOIN [${slug}].program_sessions ps
    //             ON ps.id =  fw.program_session_lid
    //             INNER JOIN [${slug}].faculties f
    //             ON f.id =  fw.faculty_lid
    //             INNER JOIN (SELECT @startSlot AS start_time_lid, @endSlot AS end_time_lid) ts
    //             ON 1 = 1
    //             INNER JOIN faculty_types ft ON ft.id = f.faculty_type_lid
    //             WHERE fw.module_lid = @moduleLid AND ps.program_lid = @programLid AND ps.acad_session_lid = @sessionLid)
    //             fp
    //             LEFT JOIN
    //             (SELECT t.faculty_id, t.faculty_name, t.start_time_lid, t.end_time_lid FROM [${slug}].timesheet t WHERE t.date_str = @date AND t.program_lid = @programLid AND t.acad_session_lid = @sessionLid AND t.module_lid = @moduleLid) fb
    //             ON 
    //             fp.faculty_id = fb.faculty_id AND
    //             fp.start_time_lid = fb.start_time_lid AND
    //             fp.end_time_lid = fb.end_time_lid
    //             WHERE fb.faculty_id IS NULL`)
    //     })
    // }


    static availableFacultyForReplace(slug, body) {
        console.log('facilty_lis:::', body)
        return poolConnection.then(pool => {
            let lecStmt = `SELECT f.id AS faculty_lid, f.faculty_id, f.faculty_name, ft.abbr as faculty_type FROM [${slug}].faculty_works fw
            INNER JOIN [${slug}].faculties f
            ON f.id =  fw.faculty_lid
            INNER JOIN [dbo].faculty_types ft
            ON ft.id = f.faculty_type_lid
            INNER JOIN [${slug}].program_sessions ps
            ON ps.id =  fw.program_session_lid
            WHERE ps.program_lid  = @program_lid AND ps.acad_session_lid = @acad_session_lid AND fw.module_lid = @module_lid`;
           
            console.log('lecStmt:::::::::::::',lecStmt)

            let request = pool.request()
            return request
                .input('program_lid', sql.Int, body.program_lid)
                .input('module_lid', sql.Int, body.module_lid)
                .input('acad_session_lid', sql.Int, body.acad_session_lid)
                .query(lecStmt)
        })
    }
}