const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')


module.exports = class Days {

    constructor(dayOfWeek, dayName, isLecture) {
        this.dayOfWeek = dayOfWeek;
        this.dayName = dayName;
        this.isLecture = isLecture;
    }

    static update(body, slug) {
        console.log('slug',slug)
        return poolConnection.then(pool => {
            const request = pool.request();
            request.input('Id', sql.Int, body.id)
                .input('Status', sql.TinyInt, body.status)
            let stmt = `UPDATE [${slug}].days SET status = @Status WHERE id =  @Id`
            return request.query(stmt)
        })
    }

    static fetchAll(rowcont, slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT TOP ${Number(rowcont)} id, day_name, SUBSTRING(day_name,1,3) as sort_name,  IIF(status = 1,'Yes','No') as status FROM [${slug}].[days]  ORDER BY id ASC`)
        })
    }

    static fetchActiveDay(slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT id, day_name,  status  FROM [${slug}].[days] WHERE day_of_week <> 7`)
        })
    }

}