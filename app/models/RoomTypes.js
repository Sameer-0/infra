const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')


module.exports = class RoomTypes {
    constructor(name, description) {
        this.name = namel
        this.description = description;
    }


    static fetchAll(rowcount) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT TOP ${Number(rowcount)}  rt.id as roomtypeid, rt.name, rt.description FROM [dbo].room_types rt ORDER BY rt.id DESC`)
        })
    }



    static save(body) {
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.input('roomName', sql.NVarChar(100), body.roomName)
                .input('description', sql.NVarChar(200), body.description)
                .query(`INSERT INTO [dbo].room_types (name, description) VALUES (@roomName,  @description)`)
        }).catch(error => {
            throw error
        })
    }



    static update(body) {
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.input('roomTypeId', sql.Int, body.roomtypeid)
                .input('roomName', sql.NVarChar(100), body.roomName)
                .input('description', sql.NVarChar(200), body.description)
                .query(`UPDATE [dbo].room_types SET name = @roomName, description = @description  WHERE id = @roomTypeId`)
        }).catch(error => {
            throw error
        })
    }


    static delete(ids) {
        return poolConnection.then(pool => {
            let request = pool.request();
            JSON.parse(ids).forEach(element => {
                return request.query(`DELETE FROM [dbo].room_types  WHERE id = ${element}`)
            });
        })
    }

    static getRoomTypeById(id) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('roomTypeId', sql.Int, id)
                .query(`SELECT  rt.id as roomtypeid, rt.name as roomName, rt.description FROM [dbo].room_types rt WHERE rt.id  =  @roomTypeId`)
        }).catch(error => {
            throw error
        })
    }

    static searchRoomType(rowcount, keyword) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('keyword', sql.NVarChar(100), '%' + keyword + '%')
                .query(`SELECT TOP ${Number(rowcount)}  rt.id as roomtypeid, rt.name, rt.description FROM 
                [dbo].room_types rt WHERE rt.name LIKE @keyword OR rt.description  LIKE @keyword  ORDER BY rt.id DESC`)
        }).catch(error => {
            throw error
        })
    }



}