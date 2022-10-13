const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')


module.exports = class RoomTransactionStages {
    constructor(name, description) {
        this.name = name;
        this.description = description;
    }


    static fetchAll(rowcount) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT TOP ${Number(rowcount)}  rts.id as rtsid, rts.name, rts.description FROM [dbo].room_transaction_stages rts ORDER BY rts.id DESC`)
        })
    }


    static save(body) {
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.input('rtsName', sql.NVarChar(50), body.rtsName)
                .input('description', sql.NVarChar(100), body.description)
                .query(`INSERT INTO [dbo].room_transaction_stages (name, description) VALUES (@rtsName,  @description)`)
        })
    }


    static update(body) {
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.input('rtsId', sql.Int, body.rtsId)
                .input('rtsName', sql.NVarChar(100), body.rtsName)
                .input('description', sql.NVarChar(200), body.description)
                .query(`UPDATE [dbo].room_transaction_stages SET name = @rtsName, description = @description  WHERE id = @rtsId`)
        })
    }



    static delete(ids) {
        return poolConnection.then(pool => {
            let request = pool.request();
            JSON.parse(ids).forEach(element => {
                return request.query(`DELETE FROM [dbo].[room_transaction_stages]  WHERE id = ${element.id}`)
            });
        })
    }


    static getRTSId(id) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('rtsId', sql.Int, id)
                .query(`SELECT  rts.id as rtsid, rts.name as rtsName, rts.description FROM [dbo].room_transaction_stages rts WHERE rts.id  =  @rtsId`)
        })
    }




    static getRTSCount() {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('rtsId', sql.Int, id)
                .query(`SELECT  COUNT(*) as count FROM [dbo].room_transaction_stages`)
        })
    }


    static search(rowcount, keyword) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('keyword', sql.NVarChar(100), '%' + keyword + '%')
                .query(`SELECT TOP ${Number(rowcount)}  rts.id as rtsid, rts.name, rts.description FROM [dbo].room_transaction_stages rts WHERE rts.name LIKE @keyword OR rts.description LIKE @keyword ORDER BY rts.id DESC`)
        })
    }


}