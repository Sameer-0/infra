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


module.exports = {

   getPage: (req, res) => {
        Promise.all([CourseWorkload.fetchAllWSDL(res.locals.slug),  AcadYear.fetchAll(), Programs.fetchAll(100, res.locals.slug), AcadSession.fetchAll(1000), ModuleType.fetchAll(1000, res.locals.slug)]).then(result => {
          console.log(result[0].recordset)
            res.render('admin/courseworkload/index', {
            courseWorkloadList: result[0].recordset,
            acadYear: result[1].recordset[0].input_acad_year,
            programList: result[2].recordset,
            AcadSessionList: result[3].recordset,
            moduleList: result[4].recordset
          })
        })
      },

    fetchFromSAP: async (req, res, next) => {
        console.log('REQ::::::::::::::::', req.body)
        let {
            acadYear,
            programLid,
            acadSessionLid
        } = req.body;

        if (!acadSessionLid) {
            acadSessionLid = "";
        }
        if (!programLid) {
            programLid = "";
        }

        var wsdlUrl = path.join(
            process.env.WSDL_PATH,
            "zacad_student_workload_seh.wsdl"
        );

        console.log('wsdlUrl::::::::::::::::', wsdlUrl)


        let soapClient = await new Promise(resolve => {
            soap.createClient(wsdlUrl, async function (err, soapClient) {
                if (err) {
                    next(err);
                }
                resolve(soapClient);
            })
        })

        let courseWorkloadList = await new Promise(async resolve => {
            await soapClient.ZACAD_STUDENT_WORKLOAD.ZACAD_STUDENT_WORKLOAD.ZACAD_STUDENT_WORKLOAD({
                    YEAR: acadYear,
                    CAMPUS_ID: "50070078",
                    SCHOOL_ID: "00004533",
                    SESSION: acadSessionLid,
                    PROGRAM_ID: programLid,
                },
                async function (err, result) {
                    let output = await result;
                    resolve(output.WORKLOAD_DETAILS ? output.WORKLOAD_DETAILS.item : []);
                });
        })

        console.log('courseWorkloadList:::::::::', JSON.stringify(courseWorkloadList))


        CourseWorkload.fetchCourseWorklaodSap(JSON.stringify(courseWorkloadList), req.session.userId, res.locals.slug).then(data => {

            console.log('Data>>> ', data)
            console.log("acadSessionLif>>> ", acadSessionLid)

            res.status(200).json({
                data: courseWorkloadList
            });
        }).catch(err => {
            console.log(err)
        });
    },
}