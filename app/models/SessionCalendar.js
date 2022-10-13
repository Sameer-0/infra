const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')
module.exports = class SessionCalendar {

    static fetchSessionStartEnd(slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT  CONVERT(NVARCHAR, MIN(date), 23) AS start_date , CONVERT(NVARCHAR, MAX(date), 23) AS end_date FROM [${slug}].session_calendar`)
        })
    }
}