const {
    pool
} = require('mssql');
const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = class ProgramTypes {
    constructor(id, name, active) {
        this.id = id;
        this.name = name;
        this.active = active;
    }

    static fetchAll() {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT id, name FROM [dbo].program_types WHERE active = 1`)
        })
    }

    static save(body) {
        return poolConnection.then(pool => {
            return pool.request().input('programName', sql.NVarChar(50), body.programName)
                .query(`INSERT INTO [dbo].program_types (name) VALUES (@programName)`)
        })
    }

    static getProgramTypeById(id) {
        return poolConnection.then(pool => {
            return pool.request().input('programId', sql.Int, id)
                .query(`SELECT id, name from [dbo].program_types WHERE id = @programId`)
        })
    }

    static update(body) {
        return poolConnection.then(pool => {
            return pool.request().input('programId', sql.Int, body.id)
                .input('programName', sql.NVarChar(100), body.programName)
                .query(`UPDATE [dbo].program_types SET name = @programName WHERE id = @programId`)
        })
    }


    static delete(ids) {
        return poolConnection.then(pool => {
            let request = pool.request();
            JSON.parse(ids).forEach(element => {
                return request.query(`UPDATE [dbo].[program_types] SET active = 0  WHERE id = ${element.id}`)
            });
        })
    }

    static deleteAll() {
        return poolConnection.then(pool => {
            return pool.request().query(`UPDATE [dbo].[program_types] SET active = 0 WHERE active = 1`)
        })
    }

    static searchProgramType(rowcount, keyword) {
        return poolConnection.then(pool => {
            return pool.request().input('keyword', sql.NVarChar(100), '%' + keyword + '%')
                .query(` SELECT TOP ${Number(rowcount)}  pt.id as id, pt.name FROM 
                        [dbo].program_types pt WHERE pt.active = 1 AND pt.name LIKE @keyword ORDER BY pt.id DESC`)
        })
    }


    static fetchChunkRows(rowcount, pageNo) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('pageNo', sql.Int, pageNo)
                .query(`SELECT id, name, active FROM [dbo].program_types WHERE active = 1 ORDER BY id DESC  OFFSET (@pageNo - 1) * 10 ROWS FETCH NEXT 10 ROWS ONLY`)
        })
    }

    static getCount() {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.query(`SELECT COUNT(*) as count FROM [dbo].program_types WHERE active = 1`)
        })
    }


}