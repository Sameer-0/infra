const path = require("path");
const soap = require("soap");


(async () => {

  console.log('path:::::::::::>>>', process.env.WSDL_PATH)
    var wsdlUrl =   "D:/INFRAPROJECT/infra_v2/wsdl/zapi_faculty_availability_bin_sep_20220509.wsdl"
   // path.join(process.env.WSDL_PATH, "zapi_faculty_availability_bin_sep_20220509.wsdl");  D:\Infra_V2_Dev2\infra_v2_dev\wsdl
      console.log('wsdlUrl::::::::::::::::', wsdlUrl)    

      let soapClient = await new Promise(resolve => {
        soap.createClient(wsdlUrl, async function (err, soapClient) {
          resolve(soapClient); 
        })
      }).catch(e => console.log("Error>>> ", e))  

      let resourceParam = {
        ResourceType: 'H',
        ResourceId: '50129129',
        StartDate: '2022-08-28',
        EndDate: '2022-08-28',
        StartTime: '', //moment(lecture.start_time, 'hh:mm:ss A').format('HH:mm:ss'),
        EndTime: '' //moment(lecture.end_time, 'hh:mm:ss A').format('HH:mm:ss'),
    }

    //console.log(soapClient)
    //return false;
 
    let sapResult = await new Promise((resolve, reject) => {
        soapClient.ZapiFacultyAvailability(resourceParam, async (err, result) => {
            if (err) throw err;
            console.log('>>>>>>>>>> Awaiting result from SAP <<<<<<<<<<', result)

            let sapResult = await result.EtResoAvaiInfo
        
            if (!sapResult) {
                sapResult = [];
            } else {
                sapResult = sapResult.item
            }
            resolve(sapResult)
        })
    })

    console.log('sapResult>>> ', sapResult)

})(); 

