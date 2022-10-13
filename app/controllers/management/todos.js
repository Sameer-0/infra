const {
    check,
    oneOf,
    validationResult
} = require('express-validator');

const Todos = require("../../models/Todos")

module.exports = {

    getPage: (req, res) => {
        Todos.fetchAll().then(result => {
            let todosList = [];
            result.recordset.map(item => {
                let obj = {
                    id: item.id,
                    task: item.task.substring(0, 20) + '...',
                    description: item.description,
                    tags: item.tags
                }

                todosList.push(obj)
            })

            console.log(todosList)

            res.render('management/todos/index', {
                todosList: todosList,
            })
        })

    },

    viewDetails: (req, res) => {
        Todos.viewDetailsById(req.query.id).then(result => {
            res.json({
                status: 200,
                data: result.recordset
            })

        })
    },

    createTodos: (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({
                statuscode: 422,
                errors: errors.array()
            });
            return;
        }


        Todos.createTodos(req.body).then(result => {
            res.json({
                status: 200,
                message: "Success"
            })
        })
    },

    getTodosById: (req, res) => {
        Todos.getTodos(req.body.id).then(result => {
            res.json({
                status: 200,
                message: "Success",
                data: result.recordset[0]
            })
        })
    },

    updateTodosById: (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({
                statuscode: 422,
                errors: errors.array()
            });
            return;
        }
        
        Todos.updateTodos(req.body).then(result => {
            res.json({
                status: 200,
                message: "Success"
            })
        })
    },

    deleteTodosById: (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({
                statuscode: 422,
                errors: errors.array()
            });
            return;
        }
        Todos.delete(req.body.id).then(result => {
            res.json({
                status: 200,
                message: "Success"
            })
        })
    },

    search: (req, res) => {
        let rowcount = 10;

        Todos.searchTodos(rowcount, req.body.keyword).then(result => {
            if (result.recordset.length > 0) {
                res.json({
                    status: "200",
                    message: "Todos fetched",
                    data: result.recordset,
                    length: result.recordset.length
                })
            } else {
                res.json({
                    status: "400",
                    message: "No data found",
                    data: result.recordset,
                    length: result.recordset.length
                })
            }
        }).catch(error => {
            res.json({
                status: "500",
                message: "Something went wrong",
            })
        })
    }
}