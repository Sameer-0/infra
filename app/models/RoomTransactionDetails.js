const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')
module.exports = class RoomTransactionDetails {

    static findByRoomTransactionId(id, slug) {
        return poolConnection.then(pool => {
            let response = pool.request()
            return response.input('RoomLid', sql.Int, id)
                .query(`SELECT rtd.id, room.room_number, CONVERT(NVARCHAR, ac.date, 105) as start_date, CONVERT(NVARCHAR, _ac.date, 105) as end_date,  CONVERT(NVARCHAR, sit.start_time, 0) as start_time, 
                CONVERT(NVARCHAR, _sit.end_time, 0) as end_time  FROM [${slug}].[room_transaction_details] rtd 
            INNER JOIN [dbo].academic_calendar ac ON ac.id = rtd.start_date_id
            INNER JOIN [dbo].academic_calendar _ac ON _ac.id = rtd.end_date_id
            INNER JOIN [dbo].rooms room  ON room.id =  rtd.room_lid 
            INNER JOIN [dbo].slot_interval_timings sit ON sit.id =  rtd.start_time_id
            INNER JOIN [dbo].slot_interval_timings _sit ON _sit.id =  rtd.end_time_id
            WHERE  rtd.room_transaction_lid = @RoomLid
            ORDER BY rtd.id DESC`)
        })
    }


    static roomInfo(slug, id){
        return poolConnection.then(pool => {
            let response = pool.request()
            return response.input('transactionId', sql.Int, id)
                .query(`SELECT rtd.id, CONVERT(NVARCHAR, sit.start_time) AS start_time, CONVERT(NVARCHAR, _sit.end_time) AS end_time, CONVERT(NVARCHAR, ac.date_str, 105) AS start_date, 
                CONVERT(NVARCHAR, _ac.date_str, 105) AS end_date, r.room_number, r.capacity
                from [${slug}].room_transaction_details rtd
                INNER JOIN [dbo].slot_interval_timings sit ON rtd.start_time_id =  sit.id
                INNER JOIN [dbo].slot_interval_timings _sit ON rtd.end_time_id = _sit.id
                INNER JOIN [dbo].academic_calendar ac ON rtd.start_date_id = ac.id
                INNER JOIN [dbo].academic_calendar _ac ON rtd.end_date_id = _ac.id
                INNER JOIN [dbo].rooms r ON rtd.room_lid =  r.id
                WHERE rtd.room_transaction_lid = @transactionId`)
        })
    }

    static delete(id, slug, userid) {
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('room_transaction_lid', sql.Int, id)
                .input('last_modified_by', sql.Int, userid)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[${slug}].[sp_delete_room_transaction]`)
        })
    }

    static updateRequest(slug, inputJson, userId) {
        console.log(JSON.stringify(inputJson))
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(inputJson))
                .output('output_json', sql.NVarChar(sql.MAX))
                .input('last_modified_by', sql.Int, userId)
                .execute(`[${slug}].[sp_update_room_transaction_details]`)
        })
    }

    static cancelRequest(slug, inputJson, userId) {
        console.log('INPUT JSON:::::::::::>>',JSON.stringify(inputJson))
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(inputJson))
                .output('output_flag', sql.Bit)
                .output('output_json', sql.NVarChar(sql.MAX))
                .input('last_modified_by', sql.Int, userId)
                .execute(`[${slug}].[sp_cancellation_room_trans]`)
        })
    }
}