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
            return pool.request().query(`SELECT TOP ${Number(rowcount)} ac.id AS acadSessionId, ac.acad_session, ac.sap_acad_session_id FROM [dbo].acad_sessions ac ORDER BY ac.id DESC`)
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
                .query(`DELETE FROM  [dbo].acad_sessions WHERE id = @acadSessionId`)
        }).catch(error => {
            throw error
        })
    }

    static search(body) {
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.input('keyword', sql.NVarChar(100), '%' + body.keyword + '%')
                .input('pageNo', sql.Int, body.pageNo)
                .query(`SELECT  ac.id AS acadSessionId, ac.acad_session,  ac.sap_acad_session_id FROM [dbo].acad_sessions ac WHERE ac.acad_session LIKE @keyword ORDER BY ac.id DESC OFFSET (@pageNo - 1) * 10 ROWS FETCH NEXT 10 ROWS ONLY`)
        })
    }


    static getById(id) {
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.input('Id', sql.NVarChar(100), id)
                .query(`SELECT  ac.id AS acadSessionId, ac.acad_session FROM [dbo].acad_sessions ac WHERE ac.id = @Id`)
        })
    }

    static fetchChunkRows(pageNo) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('pageNo', sql.Int, pageNo)
                .query(`SELECT  ac.id AS acadSessionId, ac.acad_session, ac.sap_acad_session_id FROM [dbo].acad_sessions ac  ORDER BY ac.id DESC  OFFSET (@pageNo - 1) * 10 ROWS FETCH NEXT 10 ROWS ONLY`)
        })
    }


    static getCount() {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.query(`SELECT COUNT(*) as count FROM [dbo].acad_sessions`)
        })
    }


    static sessionForCoursePreferences(slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT DISTINCT ads.id, ads.acad_session FROM [${slug}].program_sessions ps 
            INNER JOIN [dbo].acad_sessions ads ON ads.id = ps.acad_session_lid`)
        })
    }
}