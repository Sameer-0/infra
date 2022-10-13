const CourseWorkload = require('../../models/CourseWorkload')

module.exports = {
    getpage: (req, res) => {
        CourseWorkload.fetchAll().then(result => {
            res.render('management/courseWorkload/index', {
                courseList: result.recordset
            })
        })
    }
}

