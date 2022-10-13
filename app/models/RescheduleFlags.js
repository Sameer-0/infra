const {
    pool
} = require('mssql');
const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = class RescheduleFlags {
    constructor(name, description, denotedBy){
        this.name = name;
        this.description = description;
        this.denotedBy = denotedBy;
    }

    static fetchAll() {
        return poolConnection.then(pool => {
            return pool.request().query(`select id, name, description, denoted_by from [dbo].[reschedule_flags]`)
        })
    }
}