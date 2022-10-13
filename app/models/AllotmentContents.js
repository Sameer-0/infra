const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')


module.exports = class AllotmentContents {

    constructor(programId, acadYear, acadSession, division, batch, eventName) {
        this.programId = programId;
        this.acadYear = acadYear;
        this.acadSession = acadSession;
        this.division = division;
        this.batch = batch;
        this.eventName = eventName;
    }

    static fetchAll(rowcount) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT TOP ${Number(rowcount)} ac.id as allotContentId, ac.program_id, ac.acad_year, ac.acad_session, ac.division, ac.batch, ac.event_name FROM  [dbo].allotment_contents ac`)
        })
    }

    static save(body) {
        return poolConnection.then(pool => {
            let  = pool.request()
           return  request.input('programId', sql.Int, body.programId)
           .input('acadYear', sql.SmallInt, body.acadYear)
           .input('acadSession', sql.NVarChar(100), body.acadSession)
           .input('division', sql.NVarChar(5), body.division)
           .input('batch', sql.Int, body.batch)
           .input('eventName', sql.NVarChar(1000), body.eventName)
           .query(`INSERT INTO [dbo].allotment_contents (program_id, acad_year, acad_session, division, batch, event_name) VALUES (@programId, @acadYear, @acadSession, @division, @batch, @eventName)`)
        })
    }

    static getCount() {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.query(`SELECT COUNT(*) as count FROM [dbo].allotment_contents`)
        })
    }


    static update(body) {
        return poolConnection.then(pool => {
            let  = pool.request()
           return  request.input('programId', sql.Int, body.programId)
           .input('acadYear', sql.SmallInt, body.acadYear)
           .input('acadSession', sql.NVarChar(100), body.acadSession)
           .input('division', sql.NVarChar(5), body.division)
           .input('batch', sql.Int, body.batch)
           .input('eventName', sql.NVarChar(1000), body.eventName)
           .input('allotContentId', sql.Int, body.allotContentId)
           .query(`UPDATE [dbo].allotment_contents SET program_id = @programId, acad_year = @acadYear, acad_session = @acadSession, division = @division, batch = @batch, event_name = @eventName WHERE id  = @allotContentId`)
        })
    }


    static softDeleteById(id) {
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('allotContentId', sql.Int, id)
                .query(`DELETE FROM [dbo].allotment_contents WHERE id = @allotContentId`)
        }).catch(error => {
            throw error
        })
    }

}