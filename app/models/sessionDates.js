const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = class {
    constructor(program_session_lid, session_type_lid, start_date_id, end_date_id) {
        this.program_session_lid = program_session_lid;
        this.session_type_lid = session_type_lid;
        this.start_date_id = start_date_id;
        this.end_date_id = end_date_id;
    }

    static fetchAll(rowcount, slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT TOP ${Number(rowcount)} sd.id, sd.program_session_lid, sd.session_type_lid, sd.start_date_id, sd.end_date_id, CONVERT(NVARCHAR, ac.date, 105) as startDate ,  CONVERT(NVARCHAR, ac1.date, 105) as endDate, IIF(st.name IS NULL,'NA', st.name) as session_type, acs.acad_session, p.program_name
            FROM [${slug}].session_dates sd 
            INNER JOIN [dbo].[academic_calendar] ac ON sd.start_date_id =  ac.id
            INNER JOIN [dbo].[academic_calendar] ac1 ON sd.end_date_id =  ac1.id
            LEFT JOIN [dbo].[session_types] st ON st.id = sd.session_type_lid
            INNER JOIN [${slug}].[program_sessions] ps ON ps.id =  sd.program_session_lid
            INNER JOIN [dbo].acad_sessions acs ON acs.id = sd.sap_acad_session_lid
            INNER JOIN [${slug}].programs p ON p.id = ps.program_lid
            ORDER BY sd.id DESC`)
        })
    }


    static save(slug, inputJSON, userId) {
        console.log('JSON:::::::::',JSON.stringify(inputJSON))
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(inputJSON))
                .input('last_modified_by', sql.Int, userId)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[${slug}].[sp_add_session_dates]`)
        })
    }

    static findById(id, slug) {
        return poolConnection.then(pool => {
            return pool.request().input('Id', sql.Int, id)
                .query(`SELECT id, program_session_lid, session_type_lid, start_date_id, end_date_id FROM [${slug}].session_dates WHERE id = @Id`)
        })
    }

    static update(body, slug) {
        return poolConnection.then(pool => {
            return pool.request().input('Id', sql.Int, body.id)
                .input('AcadSessionLid', sql.Int, body.program_session_lid)
                .input('SessionTypeLid', sql.Int, body.session_type_lid)
                .input('StartDateId', sql.Int, body.start_date_id)
                .input('EndDateId', sql.Int, body.end_date_id)
                .query(`UPDATE [${slug}].session_dates SET program_session_lid = @AcadSessionLid, session_type_lid = @SessionTypeLid, start_date_id = @StartDateId, end_date_id = @EndDateId  WHERE id = @Id`)
        })
    }


    static delete(ids, slug) {
        return poolConnection.then(pool => {
            let request = pool.request();
            JSON.parse(ids).forEach(element => {
                return request.query(`UPDATE [${slug}].session_dates SET active = 0  WHERE id = ${element.id}`)
            });
        })
    }


    static search(body, slug) {
        return poolConnection.then(pool => {
            return pool.request().input('keyword', sql.NVarChar(100), '%' + body.keyword + '%')
                .input('pageNo', sql.Int, body.pageNo)
                .query(`SELECT  sd.id, sd.program_session_lid, sd.session_type_lid, sd.start_date_id, sd.end_date_id, CONVERT(NVARCHAR, ac.date, 105) as startDate ,  CONVERT(NVARCHAR, ac1.date, 105) as endDate, IIF(st.name IS NULL,'NA', st.name) as session_type, acs.acad_session, p.program_name
                FROM [${slug}].session_dates sd 
                INNER JOIN [dbo].[academic_calendar] ac ON sd.start_date_id =  ac.id
                INNER JOIN [dbo].[academic_calendar] ac1 ON sd.end_date_id =  ac1.id
                LEFT JOIN [dbo].[session_types] st ON st.id = sd.session_type_lid
                INNER JOIN [${slug}].[program_sessions] ps ON ps.id =  sd.program_session_lid
                INNER JOIN [dbo].acad_sessions acs ON acs.id = sd.sap_acad_session_lid
                INNER JOIN [${slug}].programs p ON p.id = ps.program_lid
                WHERE ac.date LIKE @keyword OR ac1.date LIKE @keyword OR st.name LIKE @keyword OR acs.acad_session LIKE @keyword OR p.program_name LIKE @keyword
				ORDER BY sd.id DESC OFFSET (@pageNo - 1) * 10 ROWS FETCH NEXT 10 ROWS ONLY`)
        })
    }

    static pagination(pageNo, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('pageNo', sql.Int, pageNo)
                .query(`SELECT sd.id, sd.program_session_lid, sd.session_type_lid, sd.start_date_id, sd.end_date_id, CONVERT(NVARCHAR, ac.date, 105) as startDate ,  CONVERT(NVARCHAR, ac1.date, 105) as endDate, IIF(st.name IS NULL,'NA', st.name) as session_type, acs.acad_session, p.program_name
                FROM [${slug}].session_dates sd 
                INNER JOIN [dbo].[academic_calendar] ac ON sd.start_date_id =  ac.id
                INNER JOIN [dbo].[academic_calendar] ac1 ON sd.end_date_id =  ac1.id
                LEFT JOIN [dbo].[session_types] st ON st.id = sd.session_type_lid
                INNER JOIN [${slug}].[program_sessions] ps ON ps.id =  sd.program_session_lid
                INNER JOIN [dbo].acad_sessions acs ON acs.id = sd.sap_acad_session_lid
                INNER JOIN [${slug}].programs p ON p.id = ps.program_lid
                ORDER BY sd.id DESC OFFSET (@pageNo - 1) * 10 ROWS FETCH NEXT 10 ROWS ONLY`)
        })
    }

    static getCount(slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.query(`SELECT COUNT(*) as count FROM [${slug}].session_dates`)
        })
    }

    static fetchSessionDateSap(slug, inputJSON){
        console.log('JSON.stringify(inputJSON)::::::::',JSON.stringify(inputJSON))
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(inputJSON))
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[${slug}].[sp_session_dates_wsdl]`)
        })
    }
    
    static downloadExcel(slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT p.program_name, p.program_code, p.program_id, CONVERT(NVARCHAR, ac.date, 105) as startDate ,  CONVERT(NVARCHAR, ac1.date, 105) as endDate, IIF(st.name IS NULL,'NA', st.name) as session_type, acs.acad_session
            FROM [${slug}].session_dates sd 
            INNER JOIN [dbo].[academic_calendar] ac ON sd.start_date_id =  ac.id
            INNER JOIN [dbo].[academic_calendar] ac1 ON sd.end_date_id =  ac1.id
            LEFT JOIN [dbo].[session_types] st ON st.id = sd.session_type_lid
            INNER JOIN [${slug}].[program_sessions] ps ON ps.id =  sd.program_session_lid
            INNER JOIN [dbo].acad_sessions acs ON acs.id = sd.sap_acad_session_lid
            INNER JOIN [${slug}].programs p ON p.id = ps.program_lid
            ORDER BY sd.id DESC`)
        })
    }


    

}