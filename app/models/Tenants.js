const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = class Tenants {
    static findOne(id) {
        return poolConnection.then(pool => {
            return pool.request()
                .input('Id', sql.Int, id)
                .query(`SELECT * from [dbo].tenants WHERE id = @Id`)
        })
    }
}