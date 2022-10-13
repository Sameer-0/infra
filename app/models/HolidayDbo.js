//Holiday for dbo level

const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = class Holidays {
    constructor(calenderId, calenderName, campusId, campusLid, ordLid, calenderYear, hDate, Reason, holidayTypeId) {
        this.calenderId = calenderId;
        this.calenderName = calenderName;
        this.campusId = campusId;
        this.campusLid = campusLid;
        this.ordLid = ordLid;
        this.calenderYear = calenderYear;
        this.hDate = hDate;
        this.Reason = Reason;
        this.holidayTypeId = holidayTypeId;
    }


    static insert(body) {
        return poolConnection.then(pool => {
            const request = pool.request();
            request.input('calenderId', sql.Int, body.calenderId)
                .input('calenderName', sql.NVarChar(20), body.calenderName)
                .input('campusId', sql.NVarChar(15), body.campusId)
                .input('campusLid', sql.Int, body.campusLid)
                .input('ordLid', sql.Int, body.ordLid)
                .input('calenderYear', sql.SmallInt, body.calenderYear)
                .input('hDate', sql.Date, body.hDate)
                .input('Reason', sql.NVarChar(100), body.Reason)
                .input('holidayTypeId', sql.Int, body.holidayTypeId)
            let stmt = `INSERT INTO  [dbo].[holidays] (calender_id, calender_name, campus_id, campus_lid, ord_lid, calender_year, h_date, reason, holiday_type_id)  VALUES (@calenderId, @calenderName, @campusId, @campusLid, @ordLid, @calenderYear, @hDate, @Reason, @holidayTypeId)`
            return request.query(stmt)
        })
    }


    static update(body) {
        return poolConnection.then(pool => {
            const request = pool.request();
            request.input('calenderId', sql.Int, body.calenderId)
                .input('calenderName', sql.NVarChar(20), body.calenderName)
                .input('campusId', sql.NVarChar(15), body.campusId)
                .input('campusLid', sql.Int, body.campusLid)
                .input('ordLid', sql.Int, body.ordLid)
                .input('calenderYear', sql.SmallInt, body.calenderYear)
                .input('hDate', sql.Date, body.hDate)
                .input('Reason', sql.NVarChar(100), body.Reason)
                .input('holidayTypeId', sql.Int, body.holidayTypeId)
                .input('Id', sql.Int, body.Id)
            let stmt = `INSERT INTO  [dbo].[holidays] (calender_id, calender_name, campus_id, campus_lid, ord_lid, calender_year, h_date, reason, holiday_type_id)  VALUES (@calenderId, @calenderName, @campusId, @campusLid, @ordLid, @calenderYear, @hDate, @Reason, @holidayTypeId)`
            return request.query(stmt)
        })
    }


    static delete(id) {
        return poolConnection.then(pool => {
            const request = pool.request();
            request.input('Id', sql.NVarChar(255), id)
            let stmt = `DELETE FROM [dbo].[holidays]  WHERE id =  @Id`
            return request.query(stmt)
        })
    }

    static fetchAll(rowcount) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT TOP ${Number(rowcount)} hd.id, hd.calendar_id, hd.calendar_name, hd.calendar_year, hd.reason, hd.h_date, hd.campus_lid, camp.campus_abbr, org.org_abbr FROM [dbo].holidays hd 
            INNER JOIN [dbo].campuses camp ON camp.campus_id = hd.campus_lid
            INNER JOIN [dbo].organizations org ON org.org_id = hd.org_lid
            INNER JOIN [dbo].holiday_types ht ON ht.id = hd.holiday_type_id`)
        })
    }

    static fetchById(id) {
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('Id', sql.NVarChar(255), id)
                .request().query(`SELECT * FROM [dbo].[holidays] WHERE id = @Id`)
        })
    }

    static search(rowcount, keyword) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('keyword', sql.NVarChar(100), '%' + keyword + '%')
                .query(`SELECT TOP ${Number(rowcount)} hd.id, hd.calendar_id, hd.calendar_name, hd.calendar_year, hd.reason, hd.h_date, hd.campus_lid, camp.campus_abbr, org.org_abbr FROM [dbo].holidays hd 
                INNER JOIN [dbo].campuses camp ON camp.campus_id = hd.campus_lid
                INNER JOIN [dbo].organizations org ON org.org_id = hd.org_lid
                INNER JOIN [dbo].holiday_types ht ON ht.id = hd.holiday_type_id 
                WHERE  hd.calendar_id LIKE @keyword OR hd.calendar_name LIKE @keyword OR hd.calendar_year LIKE @keyword OR camp.campus_abbr LIKE @keyword OR org.org_abbr LIKE @keyword`)
        })
    }

}