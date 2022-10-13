const res = require('express/lib/response');
const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = class Buildings {
    constructor(buildingName, buildingNumber, totalFloors, ownerId, handledBy, startTime, endTime, campusId) {
        this.buildingName = buildingName;
        this.buildingNumber = buildingNumber;
        this.totalFloors = totalFloors;
        this.ownerId = ownerId;
        this.handledBy = handledBy;
        this.startTime = startTime;
        this.endTime = endTime;
        this.campusId = campusId;
    }


    static save(buildingJson, userId) {
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(buildingJson))
                .input('last_modified_by', sql.Int, userId)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[dbo].[sp_add_new_buildings]`)
        })
    }

    static fetchAll(rowcount) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT TOP ${Number(rowcount)} b.id AS building_id, b.building_name, b.building_number, b.total_floors, org_o.org_abbr AS owner, org_h.org_abbr handled_by, CONVERT(NVARCHAR, st.start_time, 100) AS start_time, CONVERT(NVARCHAR, et.end_time, 100) AS end_time, c.campus_abbr FROM dbo.buildings b INNER JOIN dbo.organizations org_o ON org_o.id = b.owner_id INNER JOIN dbo.organizations org_h ON org_h.id = b.handled_by INNER JOIN dbo.slot_interval_timings st ON st.id = b.start_time_id INNER JOIN dbo.slot_interval_timings et ON et.id = b.end_time_id INNER JOIN dbo.campuses c ON c.id = b.campus_lid ORDER BY b.id DESC`)
        })
    }

    static findOne(id) {
        return poolConnection.then(pool => {
            const request = pool.request();
            request.input('id', sql.Int, id)
            return request.query(`SELECT b.id, b.building_name, b.building_number, b.total_floors, b.owner_id, b.handled_by, b.start_time_id, b.end_time_id, b.campus_lid FROM [dbo].buildings b WHERE  id =  @id`)
        })
    }


    static update(inputJSON, userId) {
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(inputJSON))
                .input('last_modified_by', sql.Int, userId)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[dbo].[sp_update_buildings]`)
        })
    }


    static delete(id, userid) {
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('input_building_lid', sql.Int, id)
                .input('last_modified_by', sql.Int, userid)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[dbo].[sp_delete_buildings]`)
        })
    }

    static fetchChunkRows(rowcount, pageNo) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('pageNo', sql.Int, pageNo)
                .query(`SELECT b.id AS building_id, b.building_name, b.building_number, b.total_floors, org_o.org_abbr AS owner, org_h.org_abbr handled_by, CONVERT(NVARCHAR, st.start_time, 100) AS start_time, CONVERT(NVARCHAR, et.end_time, 100) AS end_time, c.campus_abbr FROM dbo.buildings b INNER JOIN dbo.organizations org_o ON org_o.id = b.owner_id INNER JOIN dbo.organizations org_h ON org_h.id = b.handled_by INNER JOIN dbo.slot_interval_timings st ON st.id = b.start_time_id INNER JOIN dbo.slot_interval_timings et ON et.id = b.end_time_id INNER JOIN dbo.campuses c ON c.id = b.campus_lid  ORDER BY b.id DESC OFFSET (@pageNo - 1) * 10 ROWS FETCH NEXT 10 ROWS ONLY`)
        })
    }

    static getCount() {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.query(`SELECT COUNT(*) as count FROM [dbo].buildings`)
        })
    }


    static search(rowcount, keyword) {
        console.log('building ey word', keyword)
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('keyword', sql.NVarChar(100), '%' + keyword + '%')
                .query(`SELECT TOP ${Number(rowcount)} b.id AS building_id, b.building_name, b.building_number, 
                b.total_floors, org_o.org_abbr AS owner, org_h.org_abbr AS handled_by, CONVERT(NVARCHAR, st.start_time, 100) AS start_time, 
                CONVERT(NVARCHAR, et.end_time, 100) AS end_time, c.campus_abbr FROM dbo.buildings b 
                INNER JOIN dbo.organizations org_o ON org_o.id = b.owner_id 
                INNER JOIN dbo.organizations org_h ON org_h.id = b.handled_by 
                INNER JOIN dbo.slot_interval_timings st ON st.id = b.start_time_id 
                INNER JOIN dbo.slot_interval_timings et ON et.id = b.end_time_id 
                INNER JOIN dbo.campuses c ON c.id = b.campus_lid WHERE b.building_name like @keyword or  b.building_number like @keyword 
                or b.total_floors like @keyword or org_o.org_abbr like @keyword or org_h.org_abbr like @keyword or  st.start_time like @keyword or
                et.end_time like @keyword or c.campus_abbr like @keyword
                ORDER BY b.id DESC`)
        })
    }

    static buildingByCampusId(campus_lid) {
        return poolConnection.then(pool => {
            let request = pool.request()
            request.input('campus_Lid', sql.Int, campus_lid)
            return request.query(`select * from [dbo].buildings where campus_lid = @campus_Lid`)
        })
    }

}