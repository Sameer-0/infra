const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = class Mis {

    static sessionForCoursePreferences(slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT DISTINCT ads.id, ads.acad_session FROM [${slug}].program_sessions ps 
            INNER JOIN [dbo].acad_sessions ads ON ads.id = ps.acad_session_lid`)
        })
    }

    static facultyDayWise(slug, faculty_lid){
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.input('faculty_lid', sql.Int, faculty_lid)
                //.output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[${slug}].[faculty_day_wise_mis]`)
        })
    }



    static getRoomAllocationDownload(slug, room_lid) {
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.input('room_lid', sql.Int, room_lid)
                .execute(`[${slug}].[room_wise_allocation_mis]`)
        })
    }


    static DivisionWiseDownload(slug, room_lid) {
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.input('program_id', sql.Int, room_lid)
            .input('acad_session_id', sql.Int, room_lid)
            .input('division', sql.Int, room_lid)
            .execute(`[${slug}].[division-wise-allocation-mis]`)
        })
    }
}