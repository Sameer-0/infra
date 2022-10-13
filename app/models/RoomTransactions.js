const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')


module.exports = class RoomTransactions {

    static fetchAll(rowcount, slug) {
        console.log('searching:::');
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT TOP ${Number(rowcount)} rt.id, rtt.name as transaction_type,
            rt.transaction_type_lid, rts.name as stage, stage_lid, org.org_name, org.org_abbr, camp.campus_abbr, u.username  
            FROM [${slug}].room_transactions rt
            INNER JOIN dbo.room_transaction_stages rts ON rt.stage_lid = rts.id
            INNER JOIN [dbo].room_transaction_types rtt ON rtt.id = rt.transaction_type_lid
            INNER JOIN [dbo].organizations org ON org.id = rt.org_lid
            INNER JOIN [dbo].campuses camp ON camp.id = rt.campus_lid
            INNER JOIN [${slug}].users u ON u.id = rt.user_lid  ORDER BY rt.id DESC`)
        })
    }

    static save(slug, inputJson, userId) {
        console.log(JSON.stringify(inputJson))
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(inputJson))
                .output('output_json', sql.NVarChar(sql.MAX))
                .input('last_modified_by', sql.Int, userId)
                .execute(`[${slug}].[request_for_room_bookings]`)
        })
    }


    static pagination(pageNo, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('pageNo', sql.Int, pageNo)
                .query(`SELECT rt.id, rtt.name as transaction_type,
                rt.transaction_type_lid, rts.name as stage, stage_lid, org.org_name, org.org_abbr, camp.campus_abbr, u.username  
                FROM [${slug}].room_transactions rt
                INNER JOIN dbo.room_transaction_stages rts ON rt.stage_lid = rts.id
                INNER JOIN [dbo].room_transaction_types rtt ON rtt.id = rt.transaction_type_lid
                INNER JOIN [dbo].organizations org ON org.id = rt.org_lid
                INNER JOIN [dbo].campuses camp ON camp.id = rt.campus_lid
                INNER JOIN [${slug}].users u ON u.id = rt.user_lid  ORDER BY rt.id DESC OFFSET (@pageNo - 1) * 10 ROWS FETCH NEXT 10 ROWS ONLY`)
        })
    }


    static search(body, slug) {
        console.log('Seacrh')
        return poolConnection.then(pool => {
            return pool.request().input('keyword', sql.NVarChar(100), '%' + body.keyword + '%')
                .input('pageNo', sql.Int, body.pageNo)
                .query(`SELECT rt.id, rtt.name as transaction_type,
                rt.transaction_type_lid, rts.name as stage, stage_lid, org.org_name, org.org_abbr, camp.campus_abbr, u.username  
                FROM [${slug}].room_transactions rt
                INNER JOIN dbo.room_transaction_stages rts ON rt.stage_lid = rts.id
                INNER JOIN [dbo].room_transaction_types rtt ON rtt.id = rt.transaction_type_lid
                INNER JOIN [dbo].organizations org ON org.id = rt.org_lid
                INNER JOIN [dbo].campuses camp ON camp.id = rt.campus_lid
                INNER JOIN [${slug}].users u ON u.id = rt.user_lid 
                WHERE rts.name LIKE @keyword OR org.org_name LIKE @keyword OR org.org_abbr LIKE @keyword OR camp.campus_abbr LIKE @keyword OR u.username LIKE @keyword OR rtt.name LIKE @keyword ORDER BY rt.id DESC OFFSET (@pageNo - 1) * 10 ROWS FETCH NEXT 10 ROWS ONLY`)
        })
    }

    static getCount(slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.query(`SELECT COUNT(*) as count FROM [${slug}].room_transactions`)
        })
    }

    // ROOM REQUESTS
    static RoomRequest(rowcount, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.query(`SELECT TOP ${Number(rowcount)} id, transaction_type_lid, stage_lid, created_on, updated_on, org_lid, campus_lid, user_lid, last_changed, tenant_id, tenant_room_transaction_id
            FROM [${slug}].room_transactions`)
        })
    }

    // Procedure for Room Approval
    static approveRoom(slug, body) {
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('input_room_request_lid', sql.Int, body.input_room_request_lid)
                .input('approval_flag', sql.TinyInt, body.approval_flag)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[${slug}].[approval_for_room_booking]`)
        })
    }


    static findOne(slug, id){
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('Id', sql.Int, id)
                .query(`SELECT * FROM [${slug}].room_transactions WHERE id = @Id`)
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



    static searchForBookedRooms(body, slug){ 
        return poolConnection.then(pool => {
            return pool.request().input('keyword', sql.NVarChar(100), '%' + body.keyword + '%')
            .input('pageNo', sql.Int, body.pageNo)
            .query(` SELECT DISTINCT  rtd.id, r.room_number,r.floor_number, r.capacity, b.building_name, CONVERT(NVARCHAR, sit.start_time, 0) AS start_time, 
            CONVERT(NVARCHAR,  _sit.end_time, 0) AS  end_time, CONVERT(NVARCHAR, cal.date, 105) as start_date, CONVERT(NVARCHAR, _cal.date, 105) as end_date
            FROM [${slug}].room_transactions rt INNER JOIN
            room_transaction_stages rts ON rts.id = rt.stage_lid AND rts.name = 'accepted' INNER JOIN 
            [${slug}].room_transaction_details rtd ON rtd.room_transaction_lid = rt.id
            INNER JOIN [dbo].rooms r ON r.id =  rtd.room_lid
            INNER JOIN [dbo].buildings b ON b.id = r.building_lid
            INNER JOIN [dbo].slot_interval_timings sit ON sit.id = rtd.start_time_id
            INNER JOIN [dbo].slot_interval_timings _sit ON _sit.id =  rtd.end_time_id
            INNER JOIN [dbo].academic_calendar cal ON cal.id = rtd.start_date_id
            INNER JOIN [dbo].academic_calendar _cal ON _cal.id =  rtd.end_date_id
            WHERE (r.room_number LIKE @keyword OR r.floor_number LIKE @keyword OR r.capacity LIKE @keyword OR  b.building_name LIKE @keyword) AND rtd.active = 1 ORDER BY rtd.id DESC OFFSET (@pageNo - 1) * 10 ROWS FETCH NEXT 10 ROWS ONLY`)
        })
    }


    static roomsForCoursePreferences(slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT DISTINCT r.room_number,r.floor_number, r.capacity, b.building_name, _rt.name as room_type FROM [${slug}].room_transactions rt INNER JOIN
            room_transaction_stages rts ON rts.id = rt.stage_lid AND rts.name = 'accepted' INNER JOIN 
           [${slug}].room_transaction_details rtd ON rtd.room_transaction_lid = rt.id
           INNER JOIN [dbo].rooms r ON r.id =  rtd.room_lid
           INNER JOIN [dbo].room_types _rt ON _rt.id = r.room_type_id
           INNER JOIN [dbo].buildings b ON b.id = r.building_lid`)
        })
    }


   
}