const {
    check,
    oneOf,
    validationResult,
    Result
} = require('express-validator');

const Holidays = require('../../models/HolidayDbo')


module.exports = {
    getPage: (req, res) => {
        Holidays.fetchAll(10).then(result => {
            console.log('List:::::::::::::::::>', result.recordset)
            res.render('management/holiday/index', {
                holidayList: result.recordset,
                breadcrumbs: req.breadcrumbs
            })
        })
    },
    search: (req, res) => {
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({
                statuscode: 422,
                errors: errors.array()
            });
            return;
        }

        //here 10is rowcount
        let rowcont = 10;
        Holidays.search(rowcont, req.query.keyword).then(result => {
            if (result.recordset.length > 0) {
                res.json({
                    status: "200",
                    message: "Holiday Fetch",
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