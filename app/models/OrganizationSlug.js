const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = class OrganizationSlug {

    constructor () {
        
    }

    static fetchAll () {
        return poolConnection.then(conn => {
            return conn.request().query(`SELECT s.slug_name, o.org_abbr, UPPER(o.org_name) AS org_name FROM tenants s INNER JOIN organizations o ON o.id = s.org_lid WHERE s.active  = 1`)
        })
    }
}