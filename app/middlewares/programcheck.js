const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = function checkprogram(req, res, next) {

    const {
        username
    } = req.body

    if (!username) {
        res.json({
            status: 400,
            message: "Faculty id must not be empty"
        })
    } else {
        console.log("Enterd:::::::::::::", username)
        let response = poolConnection.then(pool => {
            let request = pool.request()
            return request.input('userName', sql.Int, username)
                .query(`select program_id from [dbo].user_program where username = @userName and active  = 1`)
        })

        response.then(result => {
            if (result.recordset.length > 0) {
                console.log('Success')
                next()
            } else {
                res.json({
                    status: 400,
                    message: "Program not assign to you"
                })
            }
        })
    }

}