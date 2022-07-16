const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = class TimeSheet {

    static checkDaysLecture(slug, monthInt) {
        return poolConnection.then(pool => {
            return pool.request()
                .input('monthInt', sql.Int, monthInt)
                .query(`SELECT CONVERT(NVARCHAR, CONVERT(DATE, date_str, 103), 23) AS dateStr FROM [${slug}].faculty_timetable WHERE active = 1 AND date_str IN (SELECT date_str FROM [${slug}].timesheet WHERE month_int = @monthInt)
            GROUP BY date_str`)
        })
    }

    static SimulatedData(slug, date) {
        return poolConnection.then(pool => {
            return pool.request()
                .input('Date', sql.NVarChar(20), date)
                .query(`SELECT  * FROM [${slug}].timesheet WHERE date_str = CONVERT(VARCHAR(10), CAST(@Date AS DATETIME), 103) AND active = 1`)
        })
    }
}