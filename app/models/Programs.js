const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = class Programs {

    static fetchAll( slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            let stmt = `SELECT  p.id, p.program_id, RTRIM(LTRIM(p.program_name)) as program_name, p.abbr, IIF(p.program_code IS NULL, 'NA', p.program_code) AS program_code, pt.name as program_type, p.program_type_lid  FROM [${slug}].programs p INNER JOIN [dbo].program_types pt ON p.program_type_lid = pt.id ORDER BY p.id DESC`;
            return request.query(stmt)
        })
    }


    static getCount(slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.query(`SELECT COUNT(*) as count FROM [${slug}].programs`)
        })
    }


    static pagination(pageNo, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('pageNo', sql.Int, pageNo)
                .query(`SELECT  p.id, p.program_id, p.program_name, p.abbr, IIF(p.program_code IS NULL, 'NA', p.program_code) AS program_code, pt.name as program_type, p.program_type_lid  FROM [${slug}].programs p INNER JOIN [dbo].program_types pt ON p.program_type_lid = pt.id ORDER BY id DESC  OFFSET (@pageNo - 1) * 10 ROWS FETCH NEXT 10 ROWS ONLY`)
        })
    }

    static search(body, slug) {
        return poolConnection.then(pool => {
            return pool.request().input('keyword', sql.NVarChar(100), '%' + body.keyword + '%')
                .input('pageNo', sql.Int, body.pageNo)
                .query(`SELECT  p.id, p.program_id, p.program_name, p.abbr, IIF(p.program_code IS NULL, 'NA', p.program_code) AS program_code, pt.name as program_type, p.program_type_lid  FROM [${slug}].programs p INNER JOIN [dbo].program_types pt ON p.program_type_lid = pt.id WHERE p.program_name LIKE @keyword OR p.abbr LIKE @keyword OR pt.name LIKE @keyword ORDER BY p.id DESC OFFSET (@pageNo - 1) * 10 ROWS FETCH NEXT 10 ROWS ONLY`)
        })
    }

    static findOne(id, slug) {
        return poolConnection.then(pool => {
            return pool.request().input('programId', sql.Int, id)
                .query(`select id, program_id, program_name, program_type_lid, abbr, program_code, last_modified_by from [${slug}].programs WHERE id = @programId`)
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

    static save(inputJSON, slug, userid) {
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(inputJSON))
                .input('last_modified_by', sql.Int, userid)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[${slug}].[sp_import_programs]`)
        })
    }

    static delete(id, slug, userid) {
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('input_program_lid', sql.Int, id)
                .input('last_modified_by', sql.Int, userid)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[${slug}].[sp_delete_programs]`)
        })
    }
    static downloadExcel(slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT p.program_id, RTRIM(LTRIM(p.program_name)) as program_name, p.abbr, IIF(p.program_code IS NULL, 'NA', p.program_code) AS program_code, pt.name as program_type FROM [${slug}].programs p INNER JOIN [dbo].program_types pt ON p.program_type_lid = pt.id ORDER BY p.id DESC`)
        })
    }
    
}