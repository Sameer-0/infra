
const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = class TodosTable {
    constructor(id, task, description, tags, active) {
        this.id = id;
        this.task = task;
        this.description = description;
        this.tags = tags;
        this.active = active;
    }


    static fetchAll() {
        return poolConnection.then(pool => {
            return pool.request()
                .query(`SELECT td.id, td.task, td.description, td.tags FROM [dbo].[todos] td WHERE td.active = 1 ORDER BY td.id DESC`)
        })
    }

    static viewDetailsById(id) {
        return poolConnection.then(pool => {
            return pool.request().input('id', sql.Int, id).query(`SELECT id, task, description, tags FROM [dbo].[todos]  WHERE id = @id`)
        })
    }

    static createTodos(body) {
        return poolConnection.then(pool => {
            return pool.request().input('task', sql.NVarChar(100), body.task)
                .input('description', sql.NVarChar(200), body.description)
                .input('tags', sql.NVarChar(100), body.tags)
                .query(`INSERT INTO [dbo].todos (task, description, tags) VALUES (@task,  @description, @tags) `)
        })
    }

    static getTodos(id) {
        return poolConnection.then(pool => {
            return pool.request().input('id', sql.Int, id)
                .query(`SELECT td.id, td.task, td.description, td.tags FROM [dbo].todos td where td.id = @id`)
        })
    }



    static updateTodos(body) {
        return poolConnection.then(pool => {
            return pool.request().input('id', sql.Int, body.id)
                .input('task', sql.NVarChar(100), body.task)
                .input('description', sql.NVarChar(200), body.description)
                .input('tags', sql.NVarChar(100), body.tags)
                .query(`UPDATE [dbo].todos SET task = @task, description = @description, tags = @tags WHERE id = @id`)
        })
    }

    static delete(id) {
        return poolConnection.then(pool => {
            return pool.request().input('id', sql.Int, id)
                .query(`UPDATE [dbo].todos SET active = 0 WHERE id = @id`)
        })
    }

    static searchTodos(rowcount, keyword) {
        return poolConnection.then(pool => {
            return pool.request().input('keyword', sql.NVarChar(100), '%' + keyword + '%')
                .query(`SELECT TOP ${Number(rowcount)} td.id, td.task, td.description, td.tags FROM 
                                [dbo].todos td WHERE td.active = 1 AND td.task LIKE @keyword OR td.description LIKE @keyword OR td.tags LIKE @keyword ORDER BY td.id DESC`)
        })
    }
}