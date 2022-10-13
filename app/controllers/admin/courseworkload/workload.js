const {
  check,
  oneOf,
  validationResult
} = require('express-validator');
const CourseWorkload = require('../../../models/CourseWorkload')
const AcadYear = require('../../../models/AcademicYear')
const Programs = require('../../../models/Programs')
const AcadSession = require('../../../models/AcadSession')
const ModuleType = require('../../../models/ModuleType')
const Settings = require('../../../models/Settings');
const path = require("path");
var soap = require("soap");
const isJsonString = require('../../../utils/util')
const excel = require("exceljs");



module.exports = {


  getPage: (req, res) => {
    Promise.all([CourseWorkload.getAll(res.locals.slug), CourseWorkload.getCount(res.locals.slug), AcadYear.fetchAll(), Programs.fetchAll(100, res.locals.slug), AcadSession.fetchAll(1000), ModuleType.fetchAll(1000, res.locals.slug)]).then(result => {
      console.log('result::::::::::::::', result[0].recordset)
      res.render('admin/courseworkload/courseworkload', {
        courseWorkloadList: result[0].recordset,
        pageCount: result[1].recordset[0].count,
        acadYear: result[2].recordset[0].input_acad_year,
        programList: result[3].recordset,
        AcadSessionList: result[4].recordset,
        moduleList: result[5].recordset,
        breadcrumbs: req.breadcrumbs,
        moduleListAjax: JSON.stringify(result[5].recordset)
      })
    })
  },



  changestatus: (req, res) => {
    CourseWorkload.changeStatus(req.body, res.locals.slug).then(result => {
      res.json({
        status: "200",
        message: "Success",
      })
    }).catch(error => {
      throw error
    })
  },

  getAll: (req, res) => {
    CourseWorkload.fetchAll(10, res.locals.slug).then(result => {
      res.status(200).json({
        status: 200,
        result: result.recordset
      })
    })
  },

  search: (req, res) => {
    let rowcount = 10;
    CourseWorkload.search(rowcount, req.body.keyword, res.locals.slug).then(result => {
      if (result.recordset.length > 0) {
        res.json({
          status: "200",
          message: "Room Type fetched",
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
      res.status(500).json(error.originalError.info.message)
    })
  },

  pagination: (req, res, ) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(422).json({
        statuscode: 422,
        errors: errors.array()
      });
      return;
    }

    CourseWorkload.pagination(req.body.pageNo, res.locals.slug).then(result => {
      res.json({
        status: "200",
        message: "Quotes fetched",
        data: result.recordset,
        length: result.recordset.length
      })
    }).catch(error => {
      throw error
    })
  },

  update: (req, res) => {
    let object = {
      update_initial_course_workload: JSON.parse(req.body.inputJSON)
    }

    console.log('COURSE WORKLOAD INPUT JSON:::::::::::::::::>>>>', object)
    CourseWorkload.update(object, res.locals.slug, res.locals.userId).then(result => {
      // console.log('result:::::::::::>>>', result)

      //IF ROOM APPLILICED ACCESSFULLY THEN NEED TO UPDATE SETTING TABLE DATA
      if (req.body.settingName) {
        Settings.updateByName(res.locals.slug, req.body.settingName)
      }


      res.status(200).json(JSON.parse(result.output.output_json))
    }).catch(error => {
      if (isJsonString.isJsonString(error.originalError.info.message)) {
        res.status(500).json(JSON.parse(error.originalError.info.message))
      } else {
        res.status(500).json({
          status: 500,
          description: error.originalError.info.message,
          data: []
        })
      }
    })
  },


  create: (req, res) => {
    let object = {
      insert_initial_course_worklaod: JSON.parse(req.body.inputJSON)
    }
    CourseWorkload.create(object, res.locals.slug, res.locals.userId).then(result => {
      res.status(200).json(JSON.parse(result.output.output_json))
    }).catch(error => {
      if (isJsonString.isJsonString(error.originalError.info.message)) {
        res.status(500).json(JSON.parse(error.originalError.info.message))
      } else {
        res.status(500).json({
          status: 500,
          description: error.originalError.info.message,
          data: []
        })
      }
    })
  },

  delete: (req, res) => {
    CourseWorkload.delete(req.body.id, res.locals.slug, res.locals.userId).then(result => {
      res.status(200).json(JSON.parse(result.output.output_json))
    }).catch(error => {
      console.log('testt::::::', error);
      if (isJsonString.isJsonString(error.originalError.info.message)) {
        res.status(500).json(JSON.parse(error.originalError.info.message))
      } else {
        res.status(500).json({
          status: 500,
          description: error.originalError.info.message,
          data: []
        })
      }
    })
  },

  sessionByProgramIdWSDL: (req, res) => {
    CourseWorkload.sessionByProgramIdWSDL(req.body.programId, res.locals.slug).then(result => {
      if (result.recordset.length > 0) {
        res.json({
          status: "200",
          message: "Sucessfull",
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
      console.log(error)
      res.status(500).json(error.originalError.info.message)
    })
  },


  courseBySessionIdAndProgramId: (req, res) => {
    CourseWorkload.courseBySessionIdAndProgramId(req.body, res.locals.slug).then(result => {
      if (result.recordset.length > 0) {
        res.json({
          status: "200",
          message: "Sucessfull",
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
      console.log(error)
      res.status(500).json(error.originalError.info.message)
    })
  },

  workloadByProgramId: (req, res) => {
    Promise.all([CourseWorkload.workloadByProgramId(req.body.programId, res.locals.slug), CourseWorkload.sessionByProgramId(req.body.
      programId, res.locals.slug)]).then(result => {
        console.log('req.body:::::::::::::',result)
      res.json({
        status: "200",
        message: "Sucessfull",
        workload: result[0].recordset,
        sessionList :  result[1].recordset
      })
    }).catch(error => {
      console.log(error)
      res.status(500).json(error.originalError.info.message)
    })
  },

  workloadByProgramIdSessionId: (req, res) => {
    CourseWorkload.workloadByProgramIdSessionId(req.body, res.locals.slug).then(result => {
      if (result.recordset.length > 0) {
        res.json({
          status: "200",
          message: "Sucessfull",
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
      console.log(error)
      res.status(500).json(error.originalError.info.message)
    })
  },

  downloadMaster: async(req, res, next) => {
    let workbook = new excel.Workbook();
    let worksheet = workbook.addWorksheet('CourseWorkload Master');
    worksheet.columns = [
      { header: "Module Name", key: "module_name", width: 30 },
      { header: "Module Id", key: "module_id", width: 25 },
      { header: "Module Code", key: "module_code", width: 25 },
      { header: "Program Name", key: "program_name", width: 30 },
      { header: "Program Id", key: "program_id", width: 25 },
      { header: "Program code", key: "program_code", width: 25 },
      { header: "Acad Session", key: "acad_session", width: 25 },
      { header: "Acad Year", key: "acad_year", width: 10 },
      { header: "Intake", key: "intake", width: 25 },
      { header: "Stduent Per Division", key: "student_per_division", width: 25 },
      { header: "Lecture Count Per Batch", key: "lecture_count_per_batch", width: 10 },
      { header: "Practical Count Per Batch", key: "practical_count_per_batch", width: 10 },
      { header: "Tutorial Count Per Batch", key: "tutorial_count_per_batch", width: 10 },
      { header: "Workshop Count Per Batch", key: "workshop_count_per_batch", width: 10 },
      { header: "Continuous", key: "continuous", width: 10 },
      { header: "Session Events Per Semester", key: "session_events_per_semester", width: 10 },
      { header: "Module Type", key: "module_type", width: 25 }
    ];

    CourseWorkload.downloadExcel(res.locals.slug).then(result => {
      console.log('result::::>>>>', result.recordset)
        // Add Array Rows
        worksheet.addRows(result.recordset);
        // res is a Stream object
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
          "Content-Disposition",
          "attachment; filename=" + "CourseWorkloadMaster.xlsx"
        );
        return workbook.xlsx.write(res).then(function () {
          res.status(200).end();
        });
    })
},


showEntries:(req, res, next)=>{
  CourseWorkload.getAllWithLimit(req.body.rowcount, res.locals.slug).then(result => {
      if (result.recordset.length > 0) {
          res.json({
              status: "200",
              message: "Work fetched",
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
      console.log(error)
      res.json({
          status: "500",
          message: "Something went wrong",
      })
  })
}

}