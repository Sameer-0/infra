const {
    append
} = require('express/lib/response');
const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = {
    verifySubdomain: (req, res, next) => {

        let checkArr = ['map', 'png', 'jpg', 'jpeg', 'css', 'js', 'ico']
        let isUrl = 1;

        let splitedDomain = req.url.split('.')

        for (let item of checkArr) {
            if (splitedDomain[splitedDomain.length - 1] == item) {
                isUrl = 0;
                break;
            }
        }

        console.log("req.url =========>", req.url);

        if (isUrl) {
            let subDomain = req.headers.host.split(".")[0];
            console.log("subdomain =========>", subDomain);

            if (subDomain === 'timetable')
                return next()

            poolConnection
                .then(pool => {
                    return pool.request()
                        .input('slugName', sql.NVarChar(50), subDomain)
                        .query(`SELECT t.slug_name, t.campus_lid, t.org_lid, org.org_id as org_id, c.campus_id FROM [dbo].tenants t
                        INNER JOIN [dbo].organizations org ON org.id = t.org_lid
                        INNER JOIN [dbo].campuses c ON c.id =  t.campus_lid
                        WHERE slug_name = @slugName`);
                }).then(result => {
                    if (result.recordset.length === 0) {
                        return res.send('Invalid subdomain!!!')
                    }
                    res.locals.slug = result.recordset[0].slug_name
                    res.locals.organizationId = result.recordset[0].org_lid
                    res.locals.campusId = result.recordset[0].campus_lid
                    res.locals.campusIdSap = result.recordset[0].campus_id
                    res.locals.organizationIdSap = result.recordset[0].org_id
                    console.log('LOCALS:::::::', res.locals)
                    next();
                })
        } else {
            next();
        }



    },
}