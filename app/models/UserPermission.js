

const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = class UserPermission {
    // constructor(username, password, fName, lName, empId, email, contactNumber, role) {
    //     this.username = username;
    //     this.password = password;
    //     this.fName = fName;
    //     this.lName = lName;
    //     this.empId = empId;
    //     this.email = email;
    //     this.contactNumber = contactNumber;
    //     this.role = role;
    // }

    static getPermissionsByUserId(userId, slug) {
        return poolConnection.then(pool => {
            return pool.request().input('userId', sql.Int, userId).query(`SELECT p.url_path, m.name FROM [${slug}].user_permissions p 
            INNER JOIN [dbo].http_methods m
            ON m.id = p.http_method_id
            WHERE p.user_id = @userId  AND p.is_permitted = 1`)
        })
    }

}