const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = class {
    
    constructor(name, abbr) {
        this.name = name;
        this.abbr = abbr;
    }

    static fetchAll(rowcount, slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT TOP ${Number(rowcount)} id, name, abbr FROM [dbo].event_types`)
        })
    }

    static save(body) {
        return poolConnection.then(pool => {
            return pool.request().input('Name', sql.NVarChar(100), body.name)
                .input('Abbr', sql.NVarChar(4), body.abbr)
                .query(`INSERT INTO [dbo].event_types (name, abbr) VALUES (@Name, @Abbr)`)
        })
    }

    static findById(id, slug) {
        return poolConnection.then(pool => {
            return pool.request().input('Id', sql.Int, id)
                .query(`SELECT id, name, abbr from [dbo].event_types WHERE id = @Id`)
        })
    }

    static update(body, slug) {
        return poolConnection.then(pool => {
            return pool.request().input('Id', sql.Int, body.id)
                .input('Name', sql.NVarChar(100), body.name)
                .input('Abbr', sql.NVarChar(4), body.abbr)
                .query(`UPDATE [dbo].event_types SET name = @Name, abbr = @Abbr WHERE id = @Id`)
        })
    }


    static delete(ids, slug) {
        return poolConnection.then(pool => {
            let request = pool.request();
            JSON.parse(ids).forEach(element => {
                return request.query(`DELETE FROM [dbo].event_types WHERE id = ${element.id}`)
            });
        })
    }

    static search(rowcount, keyword, slug) {
        return poolConnection.then(pool => {
            return pool.request().input('keyword', sql.NVarChar(100), '%' + keyword + '%')
                .query(` SELECT TOP ${Number(rowcount)}  et.id, et.name, et.abbr  FROM 
                [dbo].event_types et WHERE et.name LIKE @keyword OR et.abbr LIKE @keyword ORDER BY et.id DESC`)
        })
    }


    static pagination(pageNo, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('pageNo', sql.Int, pageNo)
                .query(`SELECT id, name, abbr active FROM [dbo].event_types ORDER BY id DESC  OFFSET (@pageNo - 1) * 10 ROWS FETCH NEXT 10 ROWS ONLY`)
        })
    }

    static getCount(slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.query(`SELECT COUNT(*) as count FROM [dbo].event_types`)
        })
    }

    static refresh(slug, userid) {
        return poolConnection.then(pool => {
            const request = pool.request();
            return request
                .input('last_modified_by', sql.Int, userid)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[${slug}].[sp_refresh_event_allocation_seq]`)
        })
    }

}