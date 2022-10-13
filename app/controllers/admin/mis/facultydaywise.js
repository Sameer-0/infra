const Mis = require('../../../models/Mis')
const Faculties = require('../../../models/Faculties')
const excel = require("exceljs");


module.exports = {
    getPage: (req, res, next) => {
        Faculties.fetchAll(1000, res.locals.slug).then(result => {
            res.render('admin/mis/facultydaywise', {
                facultyList: result.recordset,
                breadcrumbs: req.breadcrumbs,
                Url: req.originalUrl
            })
        })
    },

    facultyDayWise: (req, res, next) => {
        Mis.facultyDayWise(res.locals.slug, req.body.faculty_lid).then(result => {
            console.log('result:::::::::::::::', result.recordset.length)
            res.status(200).json({
                status: 200,
                data: result.recordset
            })
        })
    },

    download:(req, res, next)=>{

        console.log('result:::::::::::::::::', req.params.faculty)
        let workbook = new excel.Workbook();
        let facultyDayWiseWorksheet = workbook.addWorksheet('Faculty Day Wise');
        facultyDayWiseWorksheet.columns = [
            {
                header: "Faculty Id",
                key: "faculty_id",
                width: 25
            },
            {
                header: "Faculty Name",
                key: "faculty_name",
                width: 25
            },
            {
                header: "Time",
                key: "timing",
                width: 25
            },
            {
                header: "Monday",
                key: "Monday",
                width: 25
            },
            {
                header: "Tuesday",
                key: "Tuesday",
                width: 25
            },
            {
                header: "Wednesday",
                key: "Wednesday",
                width: 25
            },
            {
                header: "Thursday",
                key: "Thursday",
                width: 25
            },
            {
                header: "Friday",
                key: "Friday",
                width: 25
            },
            {
                header: "Saturday",
                key: "Saturday",
                width: 25
            }
        ]

        Mis.facultyDayWise(res.locals.slug, req.params.faculty).then(result => {
            facultyDayWiseWorksheet.addRows(result.recordset)
                        // res is a Stream object
                        res.setHeader(
                            "Content-Type",
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        );
                         res.setHeader(
                            "Content-Disposition",
                            "attachment; filename=" + `facultydaywise.xlsx`
                        );
            
                        return workbook.xlsx.write(res).then(function () {
                            res.status(200).end();
                        });
        })
    }
}