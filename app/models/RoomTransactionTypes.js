const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')


module.exports = class RoomTransactionTypes {
    constructor(name, description) {
        this.name = name;
        this.description = description;
    }


    static fetchAll(rowcount) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT TOP ${Number(rowcount)} rts.id, rts.id as rtsid, rts.name, rts.description FROM [dbo].room_transaction_types rts ORDER BY rts.id DESC`)
        })
    }


    static save(inputJSON, userId) {
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(inputJSON))
                .input('last_modified_by', sql.Int, userId)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute('[dbo].[add_room_transaction_types]')
        })
    }


    static update(inputJSON, userId) {
        console.log('inputJSON', inputJSON)
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(inputJSON))
                .input('last_modified_by', sql.Int, userId)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute('[dbo].[sp_update_room_transaction_types]')
        })
    }



    static delete(inputJSON) {
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(inputJSON))
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute('[dbo].[delete_room_transaction_types]')
        })
    }


    static getRTSId(id) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('rtsId', sql.Int, id)
                .query(`SELECT  rts.id as rtsid, rts.name as rtsName, rts.description FROM [dbo].room_transaction_types rts WHERE rts.id  =  @rtsId`)
        })
    }



    static getRTSCount() {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('rtsId', sql.Int, id)
                .query(`SELECT  COUNT(*) as count FROM [dbo].room_transaction_types`)
        })
    }


    static search(rowcount, keyword) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('keyword', sql.NVarChar(100), '%' + keyword + '%')
                .query(`SELECT TOP ${Number(rowcount)}  rts.id as rtsid, rts.name, rts.description FROM [dbo].room_transaction_types rts  WHERE  rts.name LIKE @keyword OR rts.description LIKE @keyword ORDER BY rts.id DESC`)
        })
    }



    static fetchChunkRows(rowcount, pageNo) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('pageNo', sql.Int, pageNo)
                .query(`SELECT  rts.id as rtsid, rts.name, rts.description FROM [dbo].room_transaction_types rts ORDER BY rts.id DESC  OFFSET (@pageNo - 1) * 10 ROWS FETCH NEXT 10 ROWS ONLY`)
        })
    }

    static getCount() {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.query(`SELECT COUNT(*) as count FROM [dbo].[room_transaction_types]`)
        })
    }

}