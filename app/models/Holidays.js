//Holiday for schema level
const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')
module.exports = class {
    constructor(calenderYear, hDate, Reason, holidayTypeId) {
        this.calenderYear = calenderYear;
        this.hDate = hDate;
        this.Reason = Reason;
        this.holidayTypeId = holidayTypeId;
    }

    static fetchAll(rowcount, slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT TOP ${Number(rowcount)} h.id, h.calendar_year, FORMAT(h.h_date, 'dddd') as dayname, CONVERT(NVARCHAR, h.h_date, 103) as h_date, h.reason, ht.name as holiday_type, h.holiday_type_lid FROM [${slug}].holidays h LEFT JOIN [dbo].holiday_types ht ON  ht.id = h.holiday_type_lid  ORDER BY h.id DESC`)
        })
    }


    static save(inputJSON, slug, userid) {
        console.log('object:::::::::::::', JSON.stringify(inputJSON))
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(inputJSON))
                .output('output_json', sql.NVarChar(sql.MAX))
                .input('last_modified_by', sql.Int, userid)
                .execute(`[${slug}].[sp_create_new_holidays]`)
        })
    }


    static findOne(id, slug) {
        return poolConnection.then(pool => {
            const request = pool.request();
            request.input('id', sql.Int, id)
            return request.query(`SELECT h.id, h.calendar_year, CONVERT(NVARCHAR, h.h_date, 120) as h_date, FORMAT(h.h_date, 'dddd') as dayname, h.reason, ht.name as holiday_type, h.holiday_type_lid FROM [${slug}].holidays h INNER JOIN [dbo].holiday_types ht ON  ht.id = h.holiday_type_lid AND h.id = @Id`)
        })
    }


    static update(inputJSON, slug, userid) {
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(inputJSON))
                .output('output_json', sql.NVarChar(sql.MAX))
                .input('last_modified_by', sql.Int, userid)
                .execute(`[${slug}].[sp_update_holidays]`)
        })
    }

    static delete(inputJSON, slug, userid) {
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(inputJSON))
                .output('output_json', sql.NVarChar(sql.MAX))
                .input('last_modified_by', sql.Int, userid)
                .execute(`[${slug}].[delete_holidays]`)
        })
    }


    static getCount(slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.query(`SELECT COUNT(*) as count FROM [${slug}].holidays`)
        })
    }


    static search(body, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('keyword', sql.NVarChar(100), '%' + body.keyword + '%')
            .input('pageNo', sql.Int, body.pageNo)
                .query(`SELECT  h.id, h.calendar_year, CONVERT(NVARCHAR,h.h_date,105) as h_date, FORMAT(h.h_date, 'dddd') as dayname, h.reason, ht.name as holiday_type, h.holiday_type_lid FROM [${slug}].holidays h LEFT JOIN [dbo].holiday_types ht ON  ht.id = h.holiday_type_lid  WHERE h.calendar_year LIKE @keyword OR CONVERT(NVARCHAR,h.h_date,105) LIKE @keyword OR h.reason LIKE @keyword OR ht.name LIKE @keyword OR FORMAT(h.h_date, 'dddd') LIKE @keyword ORDER by h.id DESC OFFSET (@pageNo - 1) * 10 ROWS FETCH NEXT 10 ROWS ONLY`)
        })
    }



    static pagination(pageNo, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('pageNo', sql.Int, pageNo)
                .query(`SELECT h.id, h.calendar_year, CONVERT(NVARCHAR,h.h_date,105) as h_date, h.reason, FORMAT(h.h_date, 'dddd') as dayname, ht.name as holiday_type, h.holiday_type_lid FROM [${slug}].holidays h LEFT JOIN [dbo].holiday_types ht ON  ht.id = h.holiday_type_lid  ORDER BY h.id DESC OFFSET (@pageNo - 1) * 10 ROWS FETCH NEXT 10 ROWS ONLY`)
        }).catch(error => {
            throw error
        })
    }

    static fetchHolidaySap(inputJSON, slug) {
        console.log('HOLIDAY SAP DATA::::::::::',JSON.stringify(inputJSON))
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(inputJSON))
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[${slug}].[sp_import_holidays]`)
        })
    }

    static downloadExcel(slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT h.calendar_year, FORMAT(h.h_date, 'dddd') as dayname, CONVERT(NVARCHAR, h.h_date, 103) as h_date, h.reason, ht.name as holiday_type FROM [${slug}].holidays h LEFT JOIN [dbo].holiday_types ht ON  ht.id = h.holiday_type_lid  ORDER BY h.id DESC`)
        })
    }

}