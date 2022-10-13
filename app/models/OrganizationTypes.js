const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')
module.exports = class OrganizationTypes{
        constructor(name, description) {
            this.name = name;
            this.description = description
        }

        static fetchAll(rowcount){
            return poolConnection.then(pool => {
                let request  =  pool.request();
                return request.query(`SELECT TOP ${Number(rowcount)} id, name, description FROM [dbo].organization_types  ORDER BY id DESC`)
            })
        }
  

}