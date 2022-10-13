const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = class SlugTable {
    constructor(campusId, orgId, slugName, tanantId) {
        this.campusId = campusId;
        this.orgId = orgId;
        this.tanantId = tanantId;
    }


    static save(body) {
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.input('campusId', sql.Int, body.campusId)
                .input('orgId', sql.Int, body.orgId)
                .input('slugName', sql.NVarChar(100), body.slugName.toLowerCase().trim())
                .input('tanantId', sql.UniqueIdentifier, body.tanantId)
                .query(`INSERT INTO [dbo].slug_table (campus_id, org_id, slug_name, tenant_id) VALUES (@campusId, @orgId, @slugName, @tanantId)`)
        })
    }

    static fetchAll(rowcount) {
        return poolConnection.then(pool => {
            let request = pool.request();
            return request
                .query(`SELECT TOP ${Number(rowcount)} st.id as slugid, cm.campus_abbr, cm.id as campusid, om.org_abbr, st.slug_name FROM [dbo].slug_table st INNER JOIN [dbo].campus_master cm ON st.campus_id = cm.id INNER JOIN [dbo].organization_master om ON st.org_id = om.id WHERE st.active = 1 AND cm.active = 1 AND  om.active = 1 ORDER BY st.id DESC`)
        })
    }


    static update(body) {
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.input('campusId', sql.Int, body.campusId)
                .input('orgId', sql.Int, body.orgId)
                .input('slugName', sql.NVarChar(100), body.slugName)
                .input('slugId', sql.NVarChar(100), body.slugid)
                .query(`UPDATE [dbo].slug_table SET campus_id = @campusId, org_id = @orgId, slug_name = @slugName WHERE id = @slugId`)
        })
    }

    static softDeleteById(id) {
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.input('slugId', sql.Int, id)
                .query(`UPDATE  [dbo].slug_table SET active = 0 WHERE id = @slugId`)
        })
    }


    static getCount() {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT COUNT(*) AS count FROM [dbo].slug_table WHERE active = 1`)
        })
    }

    static getSlugById(id) {
        return poolConnection.then(pool => {
            let request = pool.request();
            request.input('id', sql.Int, id)
            return request.query(`SELECT id as slugid, campus_id as campusId, org_id as orgId, slug_name as slugName FROM [dbo].slug_table WHERE id = @id`)
        })
    }


    static searchSlug(rowcont, keyword) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('keyword', sql.NVarChar(100), '%' + keyword + '%')
                .query(`SELECT TOP ${Number(rowcont)} st.id as slugid, cm.campus_abbr, cm.id as campusid, 
                om.org_abbr, st.slug_name FROM [dbo].slug_table st INNER JOIN [dbo].campus_master cm ON st.campus_id = cm.id 
                INNER JOIN [dbo].organization_master om ON st.org_id = om.id 
                WHERE st.active = 1 AND cm.active = 1 AND  om.active = 1 AND cm.campus_abbr like @keyword OR st.slug_name  like  @keyword
                OR om.org_abbr like @keyword  ORDER BY st.id DESC`)
        })
    }
}