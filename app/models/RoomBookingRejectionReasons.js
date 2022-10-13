const {
    v4: uuidv4
} = require('uuid');

const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = class RoomBookingRejectionReasons {
    constructor(reason, transactionUuid) {
        this.reason = reason;
        this.transactionUuid = transactionUuid;
    }


    static fetchAll(rowcount) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT TOP ${Number(rowcount)} id, transaction_uuid, reason, active FROM [dbo].room_booking_rejection_reasons  ORDER BY id DESC`)
        }).catch(error => {
            throw error
        })
    }

    static save(body) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('reason', sql.Text, body.reason)
                .input('transaction_uuid', sql.UniqueIdentifier, uuidv4())
                .query(`INSERT INTO [dbo].room_booking_rejection_reasons (reason, transaction_uuid) VALUES (@reason, @transaction_uuid)`)
        }).catch(error=>{
            throw error
        })
    }

    static update(body) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('reason', sql.NVarChar(100), body.reason)
                .input('Id', sql.Int, body.Id)
                .query(`UPDATE [dbo].room_booking_rejection_reasons SET reason = @reason WHERE id = @Id `)
        }).catch(error=>{
            throw error
        })
    }

    static getById(id) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('Id', sql.Int, id)
                .query(`SELECT  id, transaction_uuid, reason, active FROM [dbo].room_booking_rejection_reasons WHERE id = @Id`)
        }).catch(error => {
            throw error
        })
    }

    static delete(id) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('Id', sql.Int, id)
                .query(`DELETE FROM [dbo].room_booking_rejection_reasons WHERE id = @Id`)
        }).catch(error=>{
            throw error
        })
    }


    static search(rowcount, keyword) {
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.input('keyword', sql.NVarChar(100), '%' + keyword + '%')
                .query(`SELECT TOP ${Number(rowcount)} id, transaction_uuid, reason FROM [dbo].room_booking_rejection_reasons WHERE transaction_uuid LIKE  @keyword OR reason LIKE  @keyword ORDER BY id DESC `)
        }).catch(error=>{
            throw error
        })
    }


}