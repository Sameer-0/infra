const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')
module.exports = class AcademicCalender {


    constructor(dateStr, date, day, dayName, week, isoWeek, dateOfWeek, month, monthName, quater, year, dayOfYear) {
        this.dateStr = dateStr;
        this.date = date;
        this.day = day;
        this.dayName = dayName;
        this.week = week;
        this.isoWeek = isoWeek;
        this.dateOfWeek = dateOfWeek;
        this.month = month;
        this.monthName = monthName;
        this.quater = quater;
        this.year = year;
        this.dayOfYear = dayOfYear;
    }


    static save(body) {
        return poolConnection.then(pool => {
            const request = pool.request();
            return request
                .input('dateStr', sql.NVarChar(12), body.dateStr)
                .input('date', sql.Date, body.date)
                .input('day', sql.Int, body.day)
                .input('dayName', sql.NVarChar(20), body.dayName)
                .input('week', sql.Int, body.week)
                .input('isoWeek', sql.Int, body.isoWeek)
                .input('dayOfWeek', sql.Int, body.dayOfWeek)
                .input('month', sql.Int, body.month)
                .input('monthName', sql.NVarChar(20), body.monthName)
                .input('quarter', sql.Int, body.quarter)
                .input('year', sql.SmallInt, body.year)
                .input('dayOfYear', sql.Int, body.dayOfYear)
                .query(`INSERT INTO [dbo].academic_calender (date_str, date, day, day_name, week, iso_week, day_of_week, month, month_name, quarter, year, day_of_year) VALUES (@dateStr, @date, @day, @dayName, @week, @isoWeek, @dayOfWeek, @month, @monthName, @quarter, @year, @dayOfYear)`)
        }).catch(error => {
            throw error
        })
    }


    static update(body) {
        return poolConnection.then(pool => {
            const request = pool.request();
            return request
                .input('dateStr', sql.NVarChar(12), body.dateStr)
                .input('date', sql.Date, body.date)
                .input('day', sql.Int, body.day)
                .input('dayName', sql.NVarChar(20), body.dayName)
                .input('week', sql.Int, body.week)
                .input('isoWeek', sql.Int, body.isoWeek)
                .input('dayOfWeek', sql.Int, body.dayOfWeek)
                .input('month', sql.Int, body.month)
                .input('monthName', sql.NVarChar(20), body.monthName)
                .input('quarter', sql.Int, body.quarter)
                .input('year', sql.SmallInt, body.year)
                .input('dayOfYear', sql.Int, body.dayOfYear)
                .input('acadCalId', sql.Int, body.acadCalId) // id of academic_calender table
                .query(`UPDATE [dbo].academic_calender SET date_str = @dateStr, date = @date, day = @day, day_name = @dayName, week = @week, iso_week =  @isoWeek, day_of_week = @dayOfWeek, month = @month, month_name = @monthName, quarter = @quarter, year = @year, day_of_year = @dayOfYear WHERE id = @acadCalId`)
        }).catch(error => {
            throw error
        })
    }



    static fetchAll(rowcount) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT TOP ${Number(rowcount)} ac.id, CONVERT(NVARCHAR, ac.date_str,110) AS date_str,  CONVERT(NVARCHAR, ac.date, 103) AS date, ac.day, ac.day_name, ac.week, ac.iso_week, ac.day_of_week, ac.month, ac.month_name, ac.quarter,ac.year, ac.day_of_year FROM [dbo].academic_calendar ac  ORDER BY ac.id ASC`)
        })
    }


    static softDeleteById(id) {
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('acadCalId', sql.Int, id)
                .query(`DELETE FROM  [dbo].academic_calendar  WHERE id = @acadCalId`)
        }).catch(error => {
            throw error
        })
    }

    static search(body) {
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.input('keyword', sql.NVarChar(100), '%' + body.keyword + '%')
                .input('pageNo', sql.Int, body.pageNo)
                .query(`SELECT ac.id, CONVERT(NVARCHAR, ac.date_str,110) AS date_str,  CONVERT(NVARCHAR, ac.date, 101) AS date, ac.day, ac.day_name, ac.week, ac.iso_week, ac.day_of_week, ac.month, ac.month_name, ac.quarter, ac.year, ac.day_of_year FROM [dbo].academic_calendar ac WHERE ac.date_str LIKE @keyword OR  ac.date LIKE @keyword OR  ac.day LIKE @keyword OR ac.week LIKE @keyword OR ac.iso_week LIKE @keyword OR ac.month LIKE @keyword OR ac.month_name LIKE @keyword OR ac.quarter LIKE @keyword OR ac.year LIKE @keyword OR ac.day_of_year LIKE @keyword OR ac.day_name LIKE @keyword OR ac.day_of_week LIKE @keyword ORDER BY ac.id DESC  OFFSET (@pageNo - 1) * 10 ROWS FETCH NEXT 10 ROWS ONLY`)
        })
    }


    static getCount() {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.query(`SELECT COUNT(*) as count FROM [dbo].academic_calendar`)
        })
    }



    static fetchChunkRows(pageNo) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('pageNo', sql.Int, pageNo)
                .query(`SELECT  ac.id, CONVERT(NVARCHAR, ac.date_str,110) AS date_str,  CONVERT(NVARCHAR, ac.date, 101) AS date, ac.day, ac.day_name, ac.week, ac.iso_week, ac.day_of_week, ac.month, ac.month_name, ac.quarter,ac.year, ac.day_of_year FROM [dbo].academic_calendar ac ORDER BY ac.id DESC  OFFSET (@pageNo - 1) * 10 ROWS FETCH NEXT 10 ROWS ONLY`)
        })
    }

    static refresh(slug, userId) {
        console.log('Refresh::::::::>>')
        return poolConnection.then(pool => {
            const request = pool.request();
            return request
                .input('last_modified_by', sql.Int, userId)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[dbo].[sp_generate_academic_calendar]`)
        })
    }

}