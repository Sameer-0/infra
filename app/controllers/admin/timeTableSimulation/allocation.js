const ProgramSessions = require('../../../models/ProgramSessions');
const TimeTableAllocation = require('../../../models/TimeTableAllocation')


module.exports = {

    getPage:(req, res)=>{

        Promise.all([
            ProgramSessions.getUnlockedProgram(res.locals.slug),
            
        ])
        .then(result => {

            console.log('allocationlist:::', result[0].recordset);

            res.render('admin/timeTableSimulation/allocation', {
                programList: result[0].recordset,
                breadcrumbs: req.breadcrumbs,
                Url: req.originalUrl
            })
        })
       
    },

    generateTimeTable:(req, res) => {

        TimeTableAllocation.generateTimeTable(req.body.programLid, req.body.sessionLid, res.locals.slug)
        .then(result => {
            res.status(200).json({description: "Timetable allocation successful!"})
        })
        .catch(err => { console.log(err)})
    },

    deAllocateTimeTable:(req, res) => {

        TimeTableAllocation.deAllocateTimeTable(req.body.programLid, req.body.sessionLid, res.locals.slug)
        .then(result => {

            res.status(200).json({description: "Deallocation successful!"})

        })
        .catch(err => { console.log(err)})
    }
} 