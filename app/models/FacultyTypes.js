const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = class FacultyTypes {
    constructor(name, description) {
        this.name = name;
        this.description = description;
    }


    static save(inputJSON, userId) {
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(inputJSON))
            .input('last_modified_by', sql.Int, userId)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute('[dbo].[add_faculty_types]')
        })
    }

    static update(inputJSON, userId) {
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(inputJSON))
                .input('last_modified_by', sql.Int, userId)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute('[dbo].[sp_update_faculty_types]')
        })
    }

    static delete(inputJSON) {
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(inputJSON))
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute('[dbo].[delete_faculty_types]')
        })
    }


    static fetchAll(rowcont) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT TOP ${Number(rowcont)} id, name, description FROM [dbo].faculty_types  ORDER BY id DESC`)
        })
    }

    static fetchById(id) {
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('Id', sql.NVarChar(255), id)
                .request().query(`SELECT id, name, description FROM [dbo].[faculty_types] WHERE id = @Id`)
        })
    }


    static findOne(id) {
        return poolConnection.then(pool => {
            let request = pool.request();
            request.input('id', sql.Int, id)
            return request.query(`SELECT id, name, description FROM  [dbo].faculty_types  WHERE id = @id`)
        })
    }


    static search(rowcount, keyword) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('keyword', sql.NVarChar(100), '%' + keyword + '%')
                .query(`SELECT TOP ${Number(rowcount)}  id , name, description FROM [dbo].faculty_types  WHERE name LIKE @keyword OR description LIKE @keyword ORDER BY id DESC`)
        })
    }


    static getCount() {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.query(`SELECT COUNT(*) as count FROM [dbo].faculty_types`)
        })
    }


    static fetchChunkRows(rowcount, pageNo) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('pageNo', sql.Int, pageNo)
                .query(`SELECT id, name, description FROM  [dbo].[faculty_types] ORDER BY id DESC OFFSET (@pageNo - 1) * 10 ROWS FETCH NEXT 10 ROWS ONLY`)
        })
    }

}