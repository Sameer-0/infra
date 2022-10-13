const ProgramSessions = require('../../../models/ProgramSessions');



module.exports = {

    getPage:(req, res)=>{

        Promise.all([
            ProgramSessions.getUnlockedProgram(res.locals.slug),
            
        ])
        .then(result => {

            res.render('admin/freezetimetable/index', {
                programList: result[0].recordset,
                breadcrumbs: req.breadcrumbs,
                Url: req.originalUrl
            })
        })
       
    },

   
} 