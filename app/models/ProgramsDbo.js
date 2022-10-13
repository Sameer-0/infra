const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')


module.exports = class ProgramsDbo {

    static fetchAll(rowcount) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT TOP ${Number(rowcount)} program_id, abbr, programName FROM [dbo].programs ORDER BY last_modified_by DESC`)
        })
    }


    static getCount(slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.query(`SELECT COUNT(*) as count FROM [${slug}].programs`)
        })
    }


    static pagination(rowcount, pageNo, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('pageNo', sql.Int, pageNo)
                .query(`SELECT TOP ${Number(rowcount)} p.id, p.program_id, p.program_name, p.abbr, p.program_code, pt.name as program_type, p.program_type_lid  FROM [${slug}].programs p INNER JOIN [dbo].program_types pt ON p.program_type_lid = pt.id ORDER BY id DESC  OFFSET (@pageNo - 1) * 10 ROWS FETCH NEXT 10 ROWS ONLY`)
        })
    }

    static search(rowcount, keyword, slug) {
        return poolConnection.then(pool => {
            return pool.request().input('keyword', sql.NVarChar(100), '%' + keyword + '%')
                .query(`SELECT TOP ${Number(rowcount)} p.id, p.program_id, p.program_name, p.abbr, p.program_code, pt.name as program_type, p.program_type_lid  FROM [${slug}].programs p INNER JOIN [dbo].program_types pt ON p.program_type_lid = pt.id WHERE p.program_name LIKE @keyword OR p.abbr LIKE @keyword OR pt.name LIKE @keyword ORDER BY p.id DESC`)
        })
    }

    static findOne(id) {
        return poolConnection.then(pool => {
            return pool.request().input('programId', sql.Int, id)
                .query(`select * from [dbo].programs where program_id WHERE program_id = @programId`)
        })
    }

    static update(inputJSON, slug, userid) {
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(inputJSON))
                .input('last_modified_by', sql.Int, userid)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[${slug}].[sp_update_programs]`)
        })
    }
}