const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = class ProgramSessionTimings {


    static fetchAll(rowcount, slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT pst.id, p.program_name, ads.acad_session, CONVERT(NVARCHAR, sit.start_time, 0) AS start_time, CONVERT(NVARCHAR, sit2.end_time, 0) AS end_time FROM [${slug}].program_session_timings pst 
            INNER JOIN [${slug}].programs p ON p.id = pst.program_lid 
            INNER JOIN [dbo].acad_sessions ads on ads.id = pst.session_lid
            INNER JOIN [dbo].slot_interval_timings sit on sit.id = pst.start_time_lid
            INNER JOIN [dbo].slot_interval_timings sit2 on sit2.id = pst.end_time_lid`)
        })
    }



    static save(obj, slug, userId) {
        return poolConnection.then(pool => {
            return pool.request()
                .input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(obj))
                .input('last_modified_by', sql.NVarChar(sql.MAX), userId)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[${slug}].sp_insert_program_session_timings`)
        })
    }

    static update(body) {
        return poolConnection.then(pool => {
            return pool.request().input('programId', sql.Int, body.id)
                .input('programName', sql.NVarChar(100), body.programName)
                .query(`UPDATE [dbo].program_types SET name = @programName WHERE id = @programId`)
        })
    }


    static delete(slug, id, userId) {
        console.log('deleete::>>', id, `[${slug}].[sp_delete_program_session_timings]`)
        return poolConnection.then(pool => {
            // let request = pool.request();
            // JSON.parse(ids).forEach(element => {
            return  pool.request().input('program_session_timing_lid', sql.Int, id)
            .input('last_modified_by', sql.Int, userId)
            .output('output_json', sql.NVarChar(sql.MAX))
            .output('output_flag', sql.Bit)
            .execute(`[${slug}].[sp_delete_program_session_timings]`)
            // });
        })
    }

    static findOne(id, slug) {
        return poolConnection.then(pool => {
            return pool.request().input('Id', sql.Int, id)
                .query(`SELECT pst.id, p.id AS program_lid, ads.id AS acad_session_lid, sit.id AS start_time_id, sit2.id AS end_time_id FROM [${slug}].program_session_timings pst 
                INNER JOIN [${slug}].programs p ON p.id = pst.program_lid 
                INNER JOIN [dbo].acad_sessions ads on ads.id = pst.session_lid
                INNER JOIN [dbo].slot_interval_timings sit on sit.id = pst.start_time_lid
                INNER JOIN [dbo].slot_interval_timings sit2 on sit2.id = pst.end_time_lid
                WHERE pst.id = @Id`)
        })
    }

    static update(startTimeLid, endTimeLid, id, slug) {

        console.log('edit object:::::', startTimeLid, endTimeLid);

        return poolConnection.then(pool => {
            const request = pool.request();
            return request
                .input('startTimeLid', sql.Int, startTimeLid)
                .input('endTimeLid', sql.Int, endTimeLid)
                .input('id', sql.Int, id)
                .query(`UPDATE [${slug}].program_session_timings set start_time_lid = @startTimeLid, end_time_lid = @endTimeLid WHERE id = @id`)
        })
    }

    static search(body, slug) {
        return poolConnection.then(pool => {
            return pool.request().input('keyword', sql.NVarChar(100), '%' + body.keyword + '%')
                .input('pageNo', sql.Int, body.pageNo)
                .query(`SELECT pst.id, p.program_name, ads.acad_session, CONVERT(NVARCHAR, sit.start_time, 0) AS start_time, CONVERT(NVARCHAR, sit2.end_time, 0) AS end_time FROM [${slug}].program_session_timings pst 
                INNER JOIN [${slug}].programs p ON p.id = pst.program_lid 
                INNER JOIN [dbo].acad_sessions ads on ads.id = pst.session_lid
                INNER JOIN [dbo].slot_interval_timings sit on sit.id = pst.start_time_lid
                INNER JOIN [dbo].slot_interval_timings sit2 on sit2.id = pst.end_time_lid
                WHERE program_name LIKE @keyword OR ads.acad_session LIKE @keyword OR sit.start_time LIKE @keyword OR sit2.end_time LIKE @keyword `)
        })
    }


    static pagination(pageNo, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('pageNo', sql.Int, pageNo)
                .query(`SELECT  pst.id, p.program_name, ads.acad_session, CONVERT(NVARCHAR, sit.start_time, 0) AS start_time, CONVERT(NVARCHAR, sit2.end_time, 0) AS end_time FROM [${slug}].program_session_timings pst 
                INNER JOIN [${slug}].programs p ON p.id = pst.program_lid 
                INNER JOIN [dbo].acad_sessions ads on ads.id = pst.session_lid
                INNER JOIN [dbo].slot_interval_timings sit on sit.id = pst.start_time_lid
                INNER JOIN [dbo].slot_interval_timings sit2 on sit2.id = pst.end_time_lid ORDER BY pst.id DESC  OFFSET (@pageNo - 1) * 10 ROWS FETCH NEXT 10 ROWS ONLY`)
        })
    }


    static getCount(slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.query(`select COUNT(*) as count from [${slug}].program_session_timings`)
        })
    }
}