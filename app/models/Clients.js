const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = class Client {
    constructor(clientId, userLid, clientSecret, clientName, clientOS, expiryDate, isTrusted) {
        this.clientId = clientId;
        this.userLid = userLid;
        this.clientSecret = clientSecret;
        this.clientName = clientName;
        this.clientOS = clientOS;
        this.expiryDate = expiryDate;
        this.isTrusted = isTrusted;
    }

    static save(obj, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('userLid', sql.Int, obj.userLid)
                .input('clientSecret', sql.NVarChar(500), obj.clientSecret)
                .input('clientName', sql.NVarChar(255), obj.clientName)
                .input('clientOS', sql.NVarChar(255), obj.clientOS)
                .query(`INSERT INTO [${slug}].clients (client_id, client_secret, client_name, client_os) VALUES (@userLid, @clientSecret, @clientName, @clientOS)`)
        })
    }

    static fetch(obj, slug){
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('userLid', sql.Int, obj.userLid)
                .query(`SELECT TOP 1 user_lid, client_id, client_secret, client_name, client_os, is_trusted, created_at, expiry_date, 
                DATEDIFF(DAY, CURRENT_TIMESTAMP, expiry_date ) as remaing_day 
                FROM [${slug}].clients WHERE user_lid = @userLid ORDER BY created_at desc`)
        })
    }



}