const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = class {
    constructor(tag_id, name, event_type, rule_on, repeatable) {
        this.tag_id = tag_id;
        this.name = name;
        this.event_type = event_type;
        this.rule_on = rule_on;
        this.repeatable = repeatable
    }

    static fetchAll(rowcount, slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT TOP ${Number(rowcount)} id, tag_id, name, event_type, rule_on, IIF(repeatable = 1, 'YES', 'NO') AS repeatable
            FROM [${slug}].weekly_constraints`)
        })
    }

    static save(body, slug) {
        return poolConnection.then(pool => { 
            return pool.request().input('tagId', sql.Int, body.tagId)
                .input('constraintName', sql.NVarChar(60), body.constraintName)
                .input('eventType', sql.NVarChar(5), body.eventType)
                .input('ruleOn', sql.NVarChar(30), body.ruleOn)
                .input('repeatable', sql.TinyInt, body.repeatable)
                .query(`INSERT INTO [${slug}].weekly_constraints (tag_id, name, event_type, rule_on, repeatable) VALUES (@tagId, @constraintName, @eventType, @ruleOn, @repeatable)`)
        })
    }

    static findById(id, slug) {
        return poolConnection.then(pool => {
            return pool.request().input('Id', sql.Int, id)
                .query(`SELECT id, tag_id, name, event_type, rule_on, CONVERT(NVARCHAR, repeatable) as repeatable
                FROM [dbo].weekly_constraints WHERE id = @Id`)
        })
    }

    static update(body, slug) {
        return poolConnection.then(pool => {
            return pool.request().input('id', sql.Int, body.id)
                .input('tagId', sql.Int, body.tagId)
                .input('constraintName', sql.NVarChar, body.constraintName)
                .input('eventType', sql.NVarChar, body.eventType)
                .input('ruleOn', sql.NVarChar, body.ruleOn)
                .input('repeatable', sql.TinyInt, body.repeatable)
                .query(`UPDATE [dbo].weekly_constraints SET tag_id = @tagId, name = @constraintName, event_type = @eventType, rule_on = @ruleOn, repeatable =  @repeatable WHERE id = @id`)
        })
    }

    static delete(ids, slug) {
        return poolConnection.then(pool => {
            let request = pool.request();
            JSON.parse(ids).forEach(element => {
                return request.query(`DELETE FROM [dbo].weekly_constraints  WHERE id = ${element.id}`)
            });
        })
    }

    static deleteAll(slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`DELETE FROM [dbo].weekly_constraints`)
        })
    }

    static search(rowcount, keyword, slug) {
        console.log(rowcount, keyword, slug)
        return poolConnection.then(pool => {
            return pool.request().input('keyword', sql.NVarChar(100), '%' + keyword + '%')
                .query(`SELECT TOP ${Number(rowcount)} id, tag_id, name, event_type, rule_on
                FROM [dbo].weekly_constraints 
                WHERE id LIKE @keyword OR tag_id LIKE @keyword OR name LIKE @keyword OR event_type LIKE @keyword OR rule_on LIKE @keyword
				ORDER BY id DESC`)
        })
    }

    static pagination(pageNo, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('pageNo', sql.Int, pageNo)
                .query(`SELECT sd.id, sd.program_session_lid, sd.session_type_lid, sd.start_date_id, sd.end_date_id, CONVERT(NVARCHAR, ac.date, 105) as startDate, CONVERT(NVARCHAR, ac1.date, 105) as endDate, st.name as session_type, acs.acad_session
                FROM [${slug}].session_dates sd 
                INNER JOIN [dbo].[academic_calendar] ac ON sd.start_date_id =  ac.id
                INNER JOIN [dbo].[academic_calendar] ac1 ON sd.end_date_id =  ac1.id
                INNER JOIN [dbo].[session_types] st ON st.id = sd.session_type_lid
                INNER JOIN [${slug}].[program_sessions] ps ON ps.id =  sd.program_session_lid
                INNER JOIN [dbo].acad_sessions acs ON acs.id = ps.program_lid
                ORDER BY sd.id DESC OFFSET (@pageNo - 1) * 10 ROWS FETCH NEXT 10 ROWS ONLY`)
        })
    }

    static getCount(slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.query(`SELECT COUNT(*) as count FROM [dbo].weekly_constraints`)
        })
    }


}