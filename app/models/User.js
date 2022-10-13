const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = class User {

    constructor(username, password, fName, lName, empId, email, contactNumber, role) {
        this.username = username;
        this.password = password;
        this.fName = fName;
        this.lName = lName;
        this.empId = empId;
        this.email = email;
        this.contactNumber = contactNumber;
        this.role = role;
    }

    static fetchAll(rowcount, slug) {

        return poolConnection.then(pool => {
            return pool.request().query(`SELECT TOP ${Number(rowcount)} id, username, password, f_name, l_name, employee_id, email, contact_number FROM [${slug}].users`)
        })
    }

    static fetchUserById(id, slug) {
        return poolConnection.then(pool => {
            let request = pool.request();
            request.input('id', sql.Int, id)
            return request.query(`SELECT username, password, f_name, l_name, employee_id, email, contact_number, role_id FROM [${slug}].[users] WHERE id = @id`)
        })
    }

    static updateUserById(body, slug) {
        // console.log(body)

        return poolConnection.then(pool => {
            let request = pool.request();
            request.input('id', sql.Int, body.id)
                .input('username', sql.NVarChar(50), body.username)
                .input('password', sql.NVarChar(50), body.password)
                .input('fName', sql.NVarChar(50), body.f_name)
                .input('lName', sql.NVarChar(50), body.l_name)
                .input('empId', sql.NVarChar(50), body.employee_id)
                .input('email', sql.NVarChar(50), body.email)
                .input('contactNumber', sql.NVarChar(15), body.contact)
                .input('roleId', sql.Int, body.role_id)

                .query(`UPDATE [${slug}].[users] SET username = @username, password = @password, f_name = @fName, l_name= @lName,
            employee_id = @empId, email = @email, contact_number = @contactNumber, role_id = @roleId WHERE id = @id`);

        })
    }


    static addUser(body, slug) {

        return poolConnection.then(pool => {
            return pool.request().input('username', sql.NVarChar(100), body.username)
                .input('password', sql.NVarChar(500), body.password)
                .input('fName', sql.NVarChar(50), body.fName)
                .input('lName', sql.NVarChar(50), body.lName)
                .input('empId', sql.NVarChar(50), body.empId)
                .input('email', sql.NVarChar(50), body.email)
                .input('contactNumber', sql.NVarChar(15), body.contactNumber)
                .input('roleId', sql.Int, body.role)

                .query(`INSERT INTO [${slug}].[users] (username, password, f_name, l_name, employee_id, email,
                contact_number, role_id ) VALUES (@username, @password, @fName, @lName,
                @empId, @email, @contactNumber, @roleId)`)
        })
    }

    static deleteUser(id, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            request.input('id', sql.Int, id)
            return request.query(`UPDATE FROM [${slug}].[users] SET active = 0 WHERE id = @id`)
        })
    }


    static findUserByUsername(username, slug) {
        return poolConnection.then(pool => {
            return pool.request().input('username', sql.NVarChar(50), username)
                .query(`SELECT f_name, l_name, employee_id, email, contact_number, role_id FROM [${slug}].users WHERE username = @username`)
        })
    }

    static getUserByUsername(username, slug) {
        return poolConnection.then(pool => {
            return pool.request()
            .input('username', sql.NVarChar(50), username)
         .query(`SELECT u.id, u.username, u.password, u.f_name, u.l_name, u.employee_id, u.email, u.contact_number FROM [${slug}].users u WHERE u.username =  @username`)
        })
    }


    static getUserModules(userId, slug) {
        return poolConnection.then(pool => {
            return pool.request()
            .input('userId', sql.Int, userId)
         .query(`SELECT DISTINCT app.name FROM [${slug}].users u INNER JOIN [${slug}].user_permissions p ON p.user_id = u.id INNER JOIN app_urls app ON app.id = p.endpoint_id WHERE app.parent_id IS NULL AND u.id = @userId AND p.is_permitted = 1`)
        })
    }



}