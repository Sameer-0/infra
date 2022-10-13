const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = class slotIntervalSetting {
    constructor(name, intervalInMins, startDate, endDate) {
        this.name = name;
        this.intervalInMins = intervalInMins;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    static fetchAll(rowcount) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT TOP ${Number(rowcount)} id, name, interval_in_mins, FORMAT (start_date, 'dd-MM-yyyy') AS start_date, FORMAT (end_date, 'dd-MM-yyyy') as end_date  FROM  [dbo].slot_interval_settings ORDER BY id DESC`)
        })
    }

    static single(id) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('Id', sql.Int, id)
                .query(`SELECT id, name, interval_in_mins, FORMAT (start_date, 'yyyy-MM-dd') AS start_date, FORMAT (end_date, 'yyyy-MM-dd')as end_date FROM  [dbo].slot_interval_settings WHERE id = @Id`)
        })
    }

    static create(body) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('name', sql.NVarChar(100), body.name)
                .input('intervalInMins', sql.Int, body.intervalInMins)
                .input('startDate', sql.Date, body.startDate)
                .input('endDate', sql.Date, body.endDate)
                .query(`INSERT INTO [dbo].slot_interval_settings(name, interval_in_mins, start_date, end_date) VALUES (@name, @intervalInMins, @startDate, @endDate)`)
        })
    }

    static update(body) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('name', sql.NVarChar(100), body.name)
                .input('intervalInMins', sql.Int, body.intervalInMins)
                .input('startDate', sql.Date, body.startDate)
                .input('endDate', sql.Date, body.endDate)
                .input('Id', sql.Int, body.id)
                .query(`UPDATE [dbo].slot_interval_settings SET name = @name, interval_in_mins = @intervalInMins, start_date = @startDate, end_date = @endDate WHERE id = @Id`)
        })
    }


    static delete(id) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('Id', sql.Int, id)
                .query(`DELETE FROM [dbo].slot_interval_settings WHERE id = @Id`)
        })
    }


    static search(rowcount, keyword) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('keyword', sql.NVarChar(100), '%' + keyword + '%')
                .query(`SELECT TOP ${Number(rowcount)} id, name, interval_in_mins, FORMAT (start_date, 'dd-MM-yyyy') AS start_date, FORMAT (end_date, 'dd-MM-yyyy') AS end_date FROM  [dbo].slot_interval_settings WHERE name LIKE @keyword OR interval_in_mins LIKE @keyword OR start_date LIKE @keyword OR  end_date LIKE @keyword ORDER BY id DESC`)
        })
    }


    static count() {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.query(`SELECT COUNT(*) as count FROM [dbo].slot_interval_settings`)
        })
    }


}