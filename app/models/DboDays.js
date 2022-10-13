const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')


module.exports = class DboDays {

    constructor(id, day_name, day_of_week) {
        this.id = id;
        this.day_name = day_name;
        this.day_of_week = day_of_week;
    }

    static fetchAll(rowcont) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT TOP ${Number(rowcont)} id, day_name, day_of_week as status FROM [dbo].[days]  ORDER BY id ASC`)
        })
    }


}