const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = class schoolTimingType {
    static fetchAll(rowcount, slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`select TOP ${Number(rowcount)} id, name, description from [${slug}].school_timing_types ORDER by id DESC`)
        })
    }

    static save(body, slug) {
        return poolConnection.then(pool => {
            return pool.request().input('Name', sql.NVarChar(100), body.name)
                .input('Description', sql.NVarChar(50), body.description)
                .query(`INSERT INTO [${slug}].school_timing_types (name, description) VALUES (@Name, @Description)`)
        })
    }

    static findById(id, slug) {
        return poolConnection.then(pool => {
            return pool.request().input('Id', sql.Int, id)
                .query(`SELECT id, name, description from [${slug}].school_timing_types WHERE id = @Id`)
        })
    }
	
	    static update(body, slug) {
        return poolConnection.then(pool => {
            return pool.request().input('Id', sql.Int, body.id)
                .input('Name', sql.NVarChar(100), body.name)
                .input('Description', sql.NVarChar(50), body.description)
                .query(`UPDATE [${slug}].school_timing_types SET name = @Name, description = @Description WHERE id = @Id`)
        })
    }
	
	
	    static search(rowcount, keyword, slug) {
        return poolConnection.then(pool => {
            return pool.request().input('keyword', sql.NVarChar(100), '%' + keyword + '%')
                .query(` SELECT TOP ${Number(rowcount)}  et.id, et.name, et.description  FROM 
                [${slug}].school_timing_types et WHERE et.name LIKE @keyword OR et.description LIKE @keyword ORDER BY et.id DESC`)
        })
    }


    static pagination(pageNo, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('pageNo', sql.Int, pageNo)
                .query(`SELECT id, name, description active FROM [${slug}].school_timing_types ORDER BY id DESC  OFFSET (@pageNo - 1) * 10 ROWS FETCH NEXT 10 ROWS ONLY`)
        })
    }

    static getCount(slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.query(`SELECT COUNT(*) as count FROM [${slug}].school_timing_types`)
        })
    }

    static delete(ids, slug) {
        return poolConnection.then(pool => {
            let request = pool.request();
            JSON.parse(ids).forEach(element => {
                return request.query(`DELETE FROM [${slug}].school_timing_types WHERE id = ${element.id}`)
            });
        })
    }
}