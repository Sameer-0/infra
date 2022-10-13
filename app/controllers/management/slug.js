const {
    validationResult
} = require('express-validator');
const SlugTable = require("../../models/SlugTable")
const Organizations = require("../../models/Organizations")
const Campuses = require("../../models/Campuses")
const {
    v4: uuidv4
} = require('uuid');

module.exports = {

    getPage: (req, res) => {
        if (req.method == "GET") {
            Promise.all([SlugTable.fetchAll(1000), SlugTable.getCount(), Organizations.fetchAll(1000), Campuses.fetchAll(1000)]).then(result => {
                res.render('management/slug/index', {
                    slugList: result[0].recordset,
                    pageCount: result[1].recordset[0].count,
                    orgList: result[2].recordset,
                    campusList: result[3].recordset,
                })
            }).catch(error => {
                throw error
            })
        } else if (req.method == "POST") {
            SlugTable.fetchAll(1000).then(result => {
                res.json({
                    status: 200,
                    data: result.recordset
                })
            })
        }
    },

    create: (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({
                statuscode: 422,
                errors: errors.array()
            });
            return;
        }

        req.body.tanantId = uuidv4()
        SlugTable.save(req.body).then(result => {
            res.json({
                status: 200,
                message: "Success"
            })
        })
    },

    single: (req, res) => {
        SlugTable.getSlugById(req.body.Id).then(result => {
            res.json({
                status: 200,
                message: "Success",
                data: result.recordset[0]
            })
        })
    },

    update: (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({
                statuscode: 422,
                errors: errors.array()
            });
            return;
        }

        SlugTable.update(req.body).then(result => {
            res.json({
                status: 200,
                message: "Success"
            })
        })
    },

    delete: (req, res) => {
        SlugTable.softDeleteById(req.body.Id).then(result => {
            res.json({
                status: 200,
                message: "Success"
            })
        })
    },

    search: (req, res) => {
        //here 10is rowcount
        let rowcont = 10;
        SlugTable.searchSlug(rowcont, req.body.keyword).then(result => {
            if (result.recordset.length > 0) {
                res.json({
                    status: "200",
                    message: "Slug fetched",
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