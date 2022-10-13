const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = class RoomSlots {
    constructor(date, roomId, slotId, allotedTo, transactionUui, isBooked, dateId) {
        this.date = date;
        this.roomId = roomId;
        this.slotId = slotId;
        this.allotedTo = allotedTo;
        this.transactionUui = transactionUui;
        this.isBooked = isBooked;
        this.dateId = dateId;
    }

    static fetchAll(rowcount) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT TOP ${Number(rowcount)} id, date, room_id, slot_id, alloted_to, b_transaction_id, is_booked, b_transaction_uuid FROM [dbo].room_slots`)
        })
    }

    static save(body) {
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.input('date', sql.Date, body.date)
                .input('roomId', sql.Int, body.room_id)
                .input('slotId', sql.Int, body.slot_id)
                .input('allotedTo', sql.Int, body.alloted_to)
                .input('bTransactionId',sql.BigInt, b_transaction_id)
                .input('isBooked',sql.BigInt, body.is_booked)
                .input('bTransactionUuid',sql.BigInt, body.b_transaction_uuid)
                .query(`INSERT INTO [dbo].room_slots (date, room_id, slot_id, alloted_to, b_transaction_id, is_booked, b_transaction_uuid)  VALUES (@date, @roomId, @slotId, @allotedTo, @bTransactionId, @isBooked, @bTransactionUuid)`)
        })
    }


    // Method for fetching distinct record of rooms and its slots 
    static SlotsForCourcePreference(){
        return poolConnection.then(pool => {
            return pool.request().query(`select DISTINCT rs.room_lid, r.room_number from [dbo].room_slots rs INNER JOIN [dbo].rooms r ON rs.room_lid = r.id`)
        })
    }
}