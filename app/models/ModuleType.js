//Holiday for schema level
const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = class ModuleType{
    
    static fetchAll(rowcount, slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`select TOP ${Number(rowcount)} id, name from [dbo].module_types`)
        })
    }

}