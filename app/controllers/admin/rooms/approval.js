const RoomTransactions =  require('../../../models/RoomTransactions')
const isJsonString = require('../../../utils/util')

module.exports = {
    ApproveRequest: (req, res) => {
        RoomTransactions.approveRoom(res.locals.slug, req.body).then(result => {
            res.status(200).json(JSON.parse(result.output.output_json))
        }).catch(error => {
            if(isJsonString.isJsonString(error.originalError.info.message)){
                res.status(500).json(JSON.parse(error.originalError.info.message))
            }
            else{
                res.status(500).json({status:500,
                description:error.originalError.info.message,
                data:[]})
            }
        })
    }
}