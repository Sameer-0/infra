const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = class AcadSession {

    constructor(acadSession) {
        this.acadSession = acadSession;
    }

    static fetchAll(rowcount) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT TOP ${Number(rowcount)} ac.id AS acadSessionId, ac.acad_session FROM [dbo].acad_sessions ac WHERE ac.active = 1 ORDER BY ac.id DESC`)
        })
    }

    static save(body) {
        return poolConnection.then(pool => {
            const request = pool.request();
            return request
                .input('acadSession', sql.NVarChar(100), body.acadSession)
                .query(`INSERT INTO [dbo].acad_sessions (acad_session) VALUES (@acadSession)`)
        }).catch(error => {
            throw error
        })
    }

    static update(body) {
        return poolConnection.then(pool => {
            const request = pool.request();
            return request
                .input('acadSessionId', sql.Int, body.acadSessionId)
                .input('acadSession', sql.NVarChar(100), body.acadSession)
                .query(`UPDATE [dbo].acad_sessions SET acad_session = @acadSession WHERE id = @acadSessionId`)
        }).catch(error => {
            throw error
        })
    }

    static softDeleteById(id) {
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('acadSessionId', sql.Int, id)
                .query(`UPDATE [dbo].acad_sessions SET active = 0 WHERE id = @acadSessionId`)
        }).catch(error => {
            throw error
        })
    }

    static search(rowcount, keyword) {
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.input('keyword', sql.NVarChar(100), '%' + keyword + '%')
                .query(`SELECT TOP ${Number(rowcount)} ac.id AS acadSessionId, ac.acad_session FROM [dbo].acad_sessions ac WHERE ac.active = 1 AND ac.acad_session LIKE @keyword ORDER BY ac.id DESC`)
        })
    }


    static getById(id) {
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.input('Id', sql.NVarChar(100), id)
            .query(`SELECT  ac.id AS acadSessionId, ac.acad_session FROM [dbo].acad_sessions ac WHERE ac.active = 1 AND ac.id = @Id`)
        })
    }
}