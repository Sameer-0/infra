const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = class CancellationReasons {

    constructor(typeOfCancellation, reasonText, sapId) {
        this.typeOfCancellation = typeOfCancellation;
        this.reasonText = reasonText;
        this.sapId = sapId;
    }

    static fetchAll(rowcount) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT TOP ${Number(rowcount)} cr.id cancellationid, cr.type_of_cancellation, cr.reason_text, cr.sap_id FROM [dbo].cancellation_reasons cr`)
        })
    }

    static save(body) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('typeOfCancellation', sql.NVarChar(5), body.typeOfCancellation)
                .input('reasonText', sql.NVarChar(100), body.reasonText)
                .input('sapId', sql.Int, body.sapId)
                .query(`INSERT INTO [dbo].cancellation_reasons (type_of_cancellation, reason_text, sap_id) VALUES (@typeOfCancellation, @reasonText, @sapId)`)
        })
    }

    static update(body) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('typeOfCancellation', sql.NVarChar(5), body.typeOfCancellation)
                .input('reasonText', sql.NVarChar(100), body.reasonText)
                .input('sapId', sql.Int, body.sapId)
                .input('cancellationId', sql.Int, body.cancellationId)
                .query(`UPDATE [dbo].cancellation_reasons SET type_of_cancellation = @typeOfCancellation, reason_text = @reasonText, sap_id = @sapId WHERE id = @cancellationId `)
        })
    }

    static getById(id) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('Id', sql.Int, id)
                .query(`SELECT  cr.id cancellationid, cr.type_of_cancellation, cr.reason_text, cr.sap_id FROM [dbo].cancellation_reasons cr where  id = @Id`)
        })
    }

    static delete(id) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('Id', sql.Int, id)
                .query(`DELETE FROM [dbo].cancellation_reasons WHERE id = @Id `)
        })
    }


    static search(rowcount, keyword) {
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.input('keyword', sql.NVarChar(100), '%' + keyword + '%')
                .query(`SELECT TOP ${Number(rowcount)} cr.id cancellationid, cr.type_of_cancellation, cr.reason_text, cr.sap_id FROM [dbo].cancellation_reasons cr where cr.type_of_cancellation LIKE  @keyword OR cr.reason_text LIKE  @keyword OR cr.sap_id LIKE @keyword`)
        })
    }
}