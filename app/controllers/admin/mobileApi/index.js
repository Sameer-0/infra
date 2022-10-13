const {
    check,
    oneOf,
    validationResult
} = require('express-validator');

const {isJsonString, isArray} = require('../../../utils/util')
const {
    sql,
    poolConnection
} = require('../../../../config/db');


module.exports = {
   
    getHoliday: function (req, res) {
        console.log('::::::::::::::::::>>>>>>>>>getHoliday<<<<<<<<<<<<<<<::::::::::::::::::::::')
        poolConnection.then(pool => {
            return pool.request().query(`SELECT  id, date_str as dateString, IIF(is_holiday = 1, 1 , 0) as isHoliday FROM [${res.locals.slug}].session_calendar`)
        }).then(result => {
            res.json({
                status: 200,
                moduleList: result.recordset,
            });
        })
    },

    facultyDayWiseLectures: (req, res, next) => {
        console.log('>>>>>>FETCHING FACULTY LECTURES<<<<<<<')
        poolConnection.then(pool => {
            return pool.request()
            .input('facultyId', sql.Int, req.body.facultyId)
            .input('date_str', sql.NVarChar(50), req.body.dateStr)
            .query(`SELECT room_no, start_time, end_time, division, acad_session, event_name FROM [${res.locals.slug}].timesheet WHERE faculty_id = @facultyId AND date_str = @date_str AND active = 1`)
        }).then(result => {
            res.json({
                status: 200,
                lectureList: result.recordset,
                message: 'Lectures has been successfully fetched.'
            })
        }).catch(err => {
            res.json({
                status: 500,
                err: err,
                message: 'Error occured!!!'
            })
        })
    },

    studentDayWiseLectures: (req, res, next) => {
        console.log('>>>>>>FETCHING STUDENT LECTURES<<<<<<<')

        let module_id;
        if(isJsonString(req.body.module_id)){
            module_id = JSON.parse(req.body.module_id);
        }
        else{
            module_id = req.body.module_id;
        }

        poolConnection.then(pool => {
            let sqlstmt = `SELECT room_no, start_time, end_time, division, acad_session, event_name FROM [${res.locals.slug}].timesheet WHERE date_str = @dateStr AND  program_id = @programId AND acad_session = @acadSession AND active = 1 AND division = @division AND module_id IN (${module_id})`;
            return pool.request()
            .input('programId', sql.Int, req.body.programId)
            .input('dateStr', sql.NVarChar(50), req.body.dateStr)
            .input('acadSession', sql.NVarChar(50), req.body.acadSession)
            .input('division', sql.NVarChar(50), req.body.division)
            .query(sqlstmt)
        }).then(result => {
            res.json({
                status: 200,
                lectureList: result.recordset,
                message: 'Lectures has been successfully fetched.'
            })
        }).catch(err => {
            res.json({
                status: 500,
                err: err,
                message: 'Error occured!!!'
            })
        })
    },

    fetchAllDivisions: (req, res, next) => {
        console.log('>>>>>>fetchAllDivisions<<<<<<<')

        poolConnection.then(pool => {
            let sqlstmt = `SELECT DISTINCT division FROM [${res.locals.slug}].timesheet WHERE program_id = @programId AND acad_session = @acadSession AND active = 1 ORDER BY division`;
            return pool.request()
            .input('programId', sql.Int, req.body.programId)
            .input('acadSession', sql.NVarChar(50), req.body.acadSession)
            .query(sqlstmt)
        }).then(result => {
            res.json({
                status: 200,
                divisionList: result.recordset,
                message: 'Lectures has been successfully fetched.'
            })
        }).catch(err => {
            res.json({
                status: 500,
                err: err,
                message: 'Error occured!!!'
            })
        })
    },    


    //Make change for kiran mobile api
    getAllFacultyLectures(req, res) {
        poolConnection.then(pool => {
            let sqlstmt = `select room_no, date_str, start_time, end_time, division, acad_session, event_name,module_id,  module_id AS event_id, sap_event_id, program_id from [${res.locals.slug}].timesheet where faculty_id = @facultyId`;
            return pool.request()
            .input('facultyId', sql.Int, req.body.facultyId)
            .query(sqlstmt)
        }).then(result => {
            res.json({
                status: 200,
                moduleList: result.recordset,
                message: 'Lectures has been successfully fetched.'
            })
        }).catch(err => {
            res.json({
                status: 500,
                err: err,
                message: 'Error occured!!!'
            })
        })
    },


 
    getAllStudentLectures(req, res) {
        console.log('::::::::::::::::::::::getAllStudentLectures::::::::::::::::')
        let eventIdList;
        
        if(isJsonString(req.body.eventIdList)){
            eventIdList = JSON.parse(req.body.eventIdList);
        }
        else{
            eventIdList = req.body.eventIdList;
        }


        console.log('eventIdList:::::::::', eventIdList)

        poolConnection.then(pool => {
            let sqlstmt = `select room_no, date_str, start_time, end_time, division, acad_session, event_name from [${res.locals.slug}].timesheet where sap_event_id in(${eventIdList})`;

            console.log('SQL>>>>> ', sqlstmt)
            return pool.request()
            .query(sqlstmt)
        }).then(result => {
            res.json({
                status: 200,
                moduleList: result.recordset,
                message: 'Lectures has been successfully fetched.'
            })
        }).catch(err => {
            res.json({
                status: 500,
                err: err,
                message: 'Error occured!!!'
            })
        })
    },



    getAllFacultyLecturesDateWise(req, res) {

        console.log(':::::::::::::::::::getAllFacultyLecturesDateWise:::::::::::::::::::::::')
        poolConnection.then(pool => {
            let sqlstmt = `select room_no, date_str, start_time, end_time, division, acad_session, event_name, module_id AS event_id, program_id from [${res.locals.slug}].timesheet where faculty_id = @facultyId and date_str = @date_str`;
            return pool.request()
            .input('facultyId', sql.Int, req.body.facultyId)
            .input('date_str', sql.NVarChar(50), req.body.date_str)
            .query(sqlstmt)
        }).then(result => {
            res.json({
                status: 200,
                moduleList: result.recordset,
                message: 'Lectures has been successfully fetched.'
            })
        }).catch(err => {
            res.json({
                status: 500,
                err: err,
                message: 'Error occured!!!'
            })
        })
    },

    getAllStudentLecturesDateWise(req, res) {
        let eventIdList;
    
        if(isJsonString(req.body.eventIdList)){
            eventIdList = JSON.parse(req.body.eventIdList);
        }
        else{
            eventIdList = req.body.eventIdList;
        }

        poolConnection.then(pool => {
            let sqlstmt = `select room_no, date_str, start_time, end_time, division, acad_session, event_name from [${res.locals.slug}].timesheet where sap_event_id in(${eventIdList}) and date_str = @date_str`;
            return pool.request()
            .input('date_str', sql.NVarChar(50), req.body.date_str)
            .query(sqlstmt)
        }).then(result => {
            res.json({
                status: 200,
                moduleList: result.recordset,
                message: 'Lectures has been successfully fetched.'
            })
        }).catch(err => {
            res.json({
                status: 500,
                err: err,
                message: 'Error occured!!!'
            })
        })
    },

}