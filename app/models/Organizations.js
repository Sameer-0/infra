const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')
module.exports = class Organizations {
    constructor(orgId, orgAbbr, orgName, orgCompleteName, orgTypeId, parentId) {
        this.orgId = orgId;
        this.orgAbbr = orgAbbr;
        this.orgName = orgName;
        this.orgCompleteName = orgCompleteName;
        this.orgTypeId = orgTypeId;
        this.parentId = parentId;
    }

    static fetchAll(rowcount) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT TOP ${Number(rowcount)} org.id, org.org_id, org.org_abbr, org.org_name, org.org_complete_name, org.org_type_id , ot.name AS org_type, org.campus_lid,
            camp.campus_abbr
            FROM [dbo].organizations org 
            INNER JOIN [dbo].organization_types ot ON org.org_type_id = ot.id
            INNER JOIN [dbo].campuses camp ON camp.id = org.campus_lid
            ORDER BY org.id DESC`)
        })
    }


    static fetchChunkRows(pageNo) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('pageNo', sql.Int, pageNo)
                .query(`SELECT org.id, org.org_id, org.org_abbr, org.org_name, org.org_complete_name, org.org_type_id , ot.name AS org_type,camp.campus_abbr
                FROM [dbo].organizations org 
                INNER JOIN [dbo].organization_types ot ON org.org_type_id = ot.id
                INNER JOIN [dbo].campuses camp ON camp.id = org.campus_lid
                 ORDER BY org.id DESC OFFSET (@pageNo - 1) * 10 ROWS FETCH NEXT 10 ROWS ONLY`)
        })
    }

    static getOrgById(id) {
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.input('id', sql.Int, id)
                .query(`SELECT id, org_id, org_abbr, org_name, org_complete_name, org_type_id, campus_lid FROM [dbo].organizations WHERE id = @id`)
        })
    }


    static save(inputJSON, userid) {
        console.log('inputJSON:::::::::::::>>>', JSON.stringify(inputJSON))
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(inputJSON))
                //  .input('last_modified_by', sql.Int, userid)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute('[dbo].[sp_add_new_organizations]')
        })
    }

    static update(inputJSON, userId) {
        console.log('INPUT JSON:::::::::::::>>', inputJSON)
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(inputJSON))
                .input('last_modified_by', sql.Int, userId)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute('[dbo].[sp_update_organizations]')
        })
    }

    static delete(id, userid) {
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('input_org_lid', sql.Int, id)
                .input('last_modified_by', sql.Int, userid)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[dbo].[sp_delete_organizations]`)
        })
    }

    static deleteAll() {
        return poolConnection.then(pool => {
            return pool.request().query(`DELETE FROM [dbo].organizations`)
        })
    }

    static getCount() {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT COUNT(*) AS count FROM [dbo].organizations`)
        })
    }

    static searchOrg(body) {
        console.log('body::::::::::::::::::',body)
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('keyword', sql.NVarChar(100), '%' + body.keyword + '%')
                .input('pageNo', sql.Int, body.pageNo)
                .query(`SELECT  org.id, org.org_id, org.org_abbr, org.org_name, org.org_complete_name, org.org_type_id , ot.name AS org_type,
                camp.campus_abbr
                FROM [dbo].organizations org 
                INNER JOIN [dbo].organization_types ot ON org.org_type_id = ot.id
                INNER JOIN [dbo].campuses camp ON camp.id = org.campus_lid
                WHERE org.org_id LIKE @keyword OR org.org_abbr LIKE @keyword OR org.org_name LIKE @keyword OR org.org_complete_name LIKE @keyword
                OR  ot.name LIKE @keyword OR camp.campus_abbr LIKE @keyword
                ORDER BY org.id DESC  OFFSET (@pageNo - 1) * 10 ROWS FETCH NEXT 10 ROWS ONLY`)
        })
    }

    static getChildByParentId(parentid) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('parentId', sql.Int, parentid)
                .query(`SELECT  org.id, org.org_id, org.org_abbr, org.org_name, org.org_complete_name, org.org_type_id , ot.name AS org_type, org.campus_lid,
            camp.campus_abbr
            FROM [dbo].organizations org 
            INNER JOIN [dbo].organization_types ot ON org.org_type_id = ot.id
            INNER JOIN [dbo].campuses camp ON camp.id = org.campus_lid WHERE org.parent_id = @parentId
            ORDER BY org.id DESC`)
        })
    }

}