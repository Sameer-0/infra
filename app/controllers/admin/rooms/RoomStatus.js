const {
    check,
    oneOf,
    validationResult
} = require('express-validator');

const RoomStatus = require('../../../models/RoomStatus')


module.exports = {
    
    getPage: (req, res) => {
        const slug = res.locals.slug
        Promise.all([RoomStatus.getRoomTimings(slug),RoomStatus.getRoomNumbers()],).then(result => {
            res.render('admin/rooms/status'
            ,{
                RoomTimings: result[0].recordset,
                RoomNumbers: result[1].recordset,
                breadcrumbs: req.breadcrumbs
            })
        }) 
    },

    getStatus: (req, res) => {

        const slug = res.locals.slug
         RoomStatus.roomStatus(req.body,slug)
         .then(result => {
            res.status(200).json(result.recordset)
        })
        .catch(error => {
            console.log('error:>>>>>>', error)
            if(isJsonString.isJsonString(error.originalError.info.message)){
                console.log("error")
                res.status(500).json(JSON.parse(error.originalError.info.message))
            }
            else{
                console.log("error2")
                res.status(500).json({status:500,
                description:error.originalError.info.message,
                data:[]})
            }
        })
    }, 
}