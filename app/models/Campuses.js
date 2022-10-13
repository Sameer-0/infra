const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')
module.exports = class Campuses {
    constructor(campusId, campusAbbr, campusName40Char, campusDesc) {
        this.campusId = campusId;
        this.campusAbbr = campusAbbr;
        this.campusName40Char = campusName40Char;
        this.campusDesc = campusDesc;
    }

    static fetchAll(rowcount) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.query(`SELECT TOP ${Number(rowcount)} id, campus_id, campus_abbr ,campus_abbr AS abbr, campus_name_40_char as name, campus_description AS c_desc FROM [dbo].campuses  ORDER BY id DESC`)
        })
    }

    static pagination(pageNo) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('pageNo', sql.Int, pageNo)
                .query(`SELECT id, campus_id, campus_abbr AS abbr, campus_name_40_char AS name, campus_description AS c_desc
            FROM [dbo].campuses  ORDER BY id DESC OFFSET (@pageNo - 1) * 10 ROWS FETCH NEXT 10 ROWS ONLY`)
        })
    }



    static getCount() {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT COUNT(*) AS count FROM [dbo].campuses `)
        })
    }

    static save(body) {
        return poolConnection.then(pool => {
            let request = pool.request();
            request.input('campusId', sql.Int, body.campusId)
            request.input('campusAbbr', sql.NVarChar(40), body.campusAbbr)
            request.input('campusName40Char', sql.NVarChar(40), body.campusName)
            request.input('campusDesc', sql.NVarChar(150), body.campusDesc)
            return request.query(`INSERT INTO [dbo].campuses (campus_id, campus_abbr, campus_name_40_char, campus_description) VALUES (@campusId, @campusAbbr, @campusName40Char, @campusDesc)`);
        })
    }


    static saveWithProc(inputJSON, userId) {
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(inputJSON))
                .input('last_modified_by', sql.Int, userId)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[dbo].sp_add_new_campuses`);
        })
    }

    static findOne(id) {
        return poolConnection.then(pool => {
            let request = pool.request();
            request.input('id', sql.Int, id)
            return request.query(`SELECT id, campus_id, campus_abbr, campus_name_40_char, campus_description FROM [dbo].campuses  WHERE id = @id`)
        })
    }


    static update(inputJSON, userId) {
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(inputJSON))
                .input('last_modified_by', sql.Int, userId)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[dbo].sp_update_campuses`);
        })
    }


    static delete(id, userid) {
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('input_campus_lid', sql.Int, id)
                .input('last_modified_by', sql.Int, userid)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[dbo].[sp_delete_campuses]`)
        })
    }

    static searchCampus(body) {
        console.log('body::::',body)
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('keyword', sql.NVarChar(100), '%' + body.keyword + '%')
            .input('pageNo', sql.Int, body.pageNo)
                .query(`SELECT  id, campus_id, campus_abbr AS abbr, campus_name_40_char AS name, campus_description AS c_desc 
            FROM [dbo].campuses WHERE campus_id LIKE @keyword OR campus_abbr LIKE @keyword OR campus_name_40_char LIKE @keyword OR campus_description LIKE @keyword  ORDER BY id DESC  OFFSET (@pageNo - 1) * 10 ROWS FETCH NEXT 10 ROWS ONLY`)
        })
    }
}