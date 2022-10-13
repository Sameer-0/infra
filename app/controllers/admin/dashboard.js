const Settings = require("../../models/Settings");
const DboDays = require("../../models/DboDays");
const Days = require("../../models/Days");
const Holidays = require("../../models/Holidays");
const Rooms = require('../../models/Rooms');
const Buildings = require('../../models/Buildings');
const Organizations = require('../../models/Organizations');
const Divisions = require('../../models/Divisions');
const SlotIntervalTimings = require('../../models/SlotIntervalTimings');
const Campuses = require('../../models/Campuses');
const AcademicCalender = require("../../models/AcademicCalender");
const Programs = require('../../models/Programs');
const ProgramTypes = require('../../models/programType');
const AcadYear = require('../../models/AcademicYear');
const AcadSession = require('../../models/AcadSession');
const SessionTypes = require('../../models/SessionTypes'); 
const CourseWorkload = require('../../models/CourseWorkload');
const Faculties = require('../../models/Faculties');
const FacultyDbo = require('../../models/FacultyDbo');
const DivisionBatches = require('../../models/DivisionBatches');
const SchoolTimingType = require('../../models/SchoolTimingType');
const HolidayTypes = require('../../models/HolidayTypes');
const ModuleType =  require('../../models/ModuleType');
const FacultyTypes = require("../../models/FacultyTypes");
const FacultyWorkTimePreferences = require('../../models/FacultyWorkTimePreferences');
const ProgramDays = require('../../models/ProgramDays');
const ProgramSessions = require('../../models/ProgramSessions');
const RoomTransactionTypes = require('../../models/RoomTransactionTypes');
const RoomTransactions = require('../../models/RoomTransactions');
const ProgramsDbo = require('../../models/ProgramsDbo'); 
const SessionDates = require('../../models/SessionDates');
const FacultyWorks = require('../../models/FacultyWorks');
const SchoolTimingSettings = require('../../models/SchoolTimingSettings');
const FacultyDateTimes = require('../../models/FacultyDateTimes');



module.exports = {
    getDashboard: (req, res) => {
        Promise.all([Settings.fetchStepForm(res.locals.slug), Days.fetchAll(10, res.locals.slug), Divisions.fetchAll(100, res.locals.slug), Organizations.fetchAll(200), Buildings.fetchAll(50), SlotIntervalTimings.fetchAll(100), Campuses.fetchAll(500), AcademicCalender.fetchAll(100), Programs.fetchAll(10, res.locals.slug), ProgramTypes.fetchAll(100, res.locals.slug), AcadYear.fetchAll(), AcadSession.fetchAll(1000), SessionTypes.fetchAll(10, res.locals.slug), AcademicCalender.fetchAll(100), CourseWorkload.getAll(res.locals.slug), Divisions.fetchAll(100, res.locals.slug), Faculties.fetchAll(100, res.locals.slug), FacultyDbo.fetchAll(1000), SlotIntervalTimings.fetchAll(100), DivisionBatches.fetchAll(100, res.locals.slug), SchoolTimingType.fetchAll(10, res.locals.slug), HolidayTypes.fetchAll(100), ModuleType.fetchAll(1000, res.locals.slug), FacultyTypes.fetchAll(100), FacultyWorkTimePreferences.fetchAll(10, res.locals.slug), ProgramDays.fetchAll(1000, res.locals.slug), ProgramSessions.fetchAll(100, res.locals.slug), ProgramsDbo.fetchAll(1000), SessionDates.fetchAll(10, res.locals.slug), FacultyWorks.fetchAll(10, res.locals.slug), SchoolTimingSettings.fetchAll(100, res.locals.slug), SchoolTimingSettings.checkStatus(res.locals.slug), FacultyDateTimes.fetchAll(10, res.locals.slug), Organizations.getChildByParentId(res.locals.organizationId), DivisionBatches.fetchDistinctBatches(res.locals.slug)]).then(result => {
            res.render('admin/dashboard/index', {
                currentFormStep: result[0].recordset[0] ? result[0].recordset[0].seq : '',
                dayList: result[1].recordset,
                // RoomList: result[2].recordset,
                divisionList: result[2].recordset, 
                orgList: result[3].recordset,  
                buildingList: result[4].recordset,
                slotTiming:JSON.stringify(result[5].recordset),
                campusList: result[6].recordset,
                acadCalender: JSON.stringify(result[7].recordset),
                programList: result[8].recordset,
                programTypeList: JSON.stringify(result[9].recordset),
                acadYear: result[10].recordset[0].input_acad_year, 
                AcadSessionList: result[11].recordset,
                sessionList: result[12].recordset, 
                acadCal: result[13].recordset,
                courseWorkloadList: result[14].recordset,
                divisionData: result[15].recordset, 
                facultyList: result[16].recordset,
                faculties: result[17].recordset, 
                slotTime: result[18].recordset,
                divisionBatchList: result[19].recordset,
                schoolTimingTypeList: result[20].recordset,
                holidayTypeList: result[21].recordset,              
                moduleList: result[22].recordset,
                facultyType: JSON.stringify(result[23].recordset),
                facultyPreferenceList: result[24].recordset,
                facultyWorkList: result[30].recordset,
                programDayList: result[25].recordset,
                programSession: result[26].recordset,
                transactionTypes:  JSON.stringify(result[27].recordset),
                // transactionList: result[29].recordset,
                // programDboList: result[30].recordset,
                // sessionDateList: result[31].recordset,
                // schoolTimingSettingsList: result[33].recordset,
                schoolTimingSettingsListJson: JSON.stringify(result[31].recordset), 
                // stsStatus: result[30].recordset.length > 0 ? result[32].recordset[0].status : 0,
                // FacultyDateTimeList: result[35].recordset,
                // orgParentList: result[36].recordset,
                // batchList: result[37].recordset,
                path:'/admin'
            })
        }).catch(error => { 
            console.log('Dash Error+++++++++++',error)
        }) 
    },
 
    dashboardStepForm: (req, res) => {
        console.log('dashboard stepform', result[1].recordset )
        Promise.all([Settings.fetchStepForm(res.locals.slug), Rooms.fetchAll(100)]).then(result => {
            res.render('admin/dashboard/index', {
                currentFormStep: result[0].recordset[0] ? result[0].recordset[0].seq : '',
                RoomList: result[1].recordset,
                path:'/admin'
            })
        })
        
    },



}