const sql = require('mssql')
const sanitizer = require('sanitize')();
const soap = require('soap');
const path = require('path');
const moment = require("moment");
const {
    writeFile
} = require("fs");
const axios = require('axios').default;
const https = require('https');
//const httpsAgent = new https.Agent({ rejectUnauthorized: false });
// const Mutex = require('async-mutex').Mutex;
// const Semaphore = require('async-mutex').Semaphore;
// const withTimeout = require('async-mutex').withTimeout;
 
const Bull = require('bull');
const queue = new Bull('rescheduling-queue');



const {
    poolConnection
} = require('../../../../config/db');
require('dotenv').config();


module.exports.respond = async socket => {

    let db = await poolConnection;
    db.on('error', err => {
        console.log(err)
    })

    //On Client Join
    socket.on('join', function (data) {
        console.log('RESCHEDULE SOCKET INIT:::::::::::>>>', data);
    });


    //cancelEventedSlotBulk
    socket.on("cancelEvents", async data => {

        console.log('>>>>>>>>>>>>>>CANCEL EVENT<<<<<<<<<<<<<<<', )

        let socketUser = data.userId;
        // console.log('socketUser>>>>> ', socketUser)

        let wsdlUrl = path.join(process.env.WSDL_PATH, "zevent_reschedule_sp_bin_sqh_20220808.wsdl");
   
        console.log('wsdlUrl', wsdlUrl)
        let soapClient = await new Promise((resolve, reject) => {
            soap.createClient(wsdlUrl, async function (err, soapClient) {
                if (err) throw err;
                let client = await soapClient;
                resolve(client)
            })
        });


        let resObj = JSON.parse(data.transJson);
        //resObj.eventType = 'THEO';
        // let lecTransObj = data.transJson

        console.log('resJSON====>> ', resObj)
        console.log('JSON.stringify(resObj.eventsJson) ====>> ', JSON.stringify(resObj.eventsJson))

        try{

            let result = await db.request()
                .input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(resObj.eventsJson))
                .input('reason_id', sql.Int, resObj.reasonId)
                // .input('reason_detail', sql.NVarChar(sql.MAX), resObj.reasonDescription)
                .input('res_stage', sql.Int, 1)
                .input('flag', sql.NVarChar(sql.MAX), resObj.reschFlag)
                .input('last_modified_by', sql.Int, data.userId)
                .output('output_flag', sql.Bit)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[${data.slugName}].[sp_cancel_rescheduling]`)

            console.log('Stage-1 Result::>>', result.output.output_json)
            
            if(result.output.output_json == null){
                console.log('<<<<<<<<<:::::ERROR OCCURED STAGE 1::::::>>>>>>>>')
                global.io.emit("cancelEventResponse", {
                    socketUser: socketUser,
                    message: 'Error Occured',
                    slugName: 'asmsoc-mum',
                    status: 500,
                })
                
            }
            else{

                let transLectureList = JSON.parse(result.output.output_json).data

                console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>BEDFORE')
                console.log("transLectureList>> ", transLectureList)
                console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>AFTER')

                //CREATE SAP OBJ JSON
                let rescheduleItems = [];

                for (let lecture of transLectureList) {
                    let item = {
                        TransId: lecture.TransId,
                        ZBuseve: lecture.ZBuseve,
                        Zdate: lecture.Zdate,
                        ZtimeFrom: lecture.ZtimeFrom,
                        ZtimeTo: lecture.ZtimeTo,
                        Zflag: lecture.Zflag,
                        ZroomId: lecture.ZroomId,
                        OldZroomId: lecture.OldZroomId,
                        Zyear: lecture.Zyear,
                        ZOrg: data.orgId,
                        ZPrgstd: lecture.ZPrgstd,
                        ZSess: lecture.ZSess,
                        ZModule: lecture.ZModule,
                        ZEvetyp: lecture.ZEvetyp,
                        ZfacultyId: lecture.ZfacultyId,
                        OldZfacultyId: lecture.OldZfacultyId,
                        ReasonId: lecture.ReasonId,
                        OldZdate: lecture.OldZdate,
                        OldZtimeFrom: lecture.OldZtimeFrom,
                        OldZtimeTo: lecture.OldZtimeTo,
                        Remark: "",
                        ZfacId: "",
                        ReasonDetail: lecture.ReasonDetail
                    }
                    rescheduleItems.push(item)
                }


                let rescheduleObj = {
                    ItReschedule: {
                        item: rescheduleItems
                    }
                }

                console.log('>>>>>>>SAP IBJ JSON<<<<<<<<<<<<', rescheduleObj.ItReschedule.item)

                let sapResult = await new Promise((resolve, reject) => {
                    soapClient.ZeventRescheduleSp(rescheduleObj, async (err, result) => {
                        if (err) throw err;
                        console.log('>>>>>>>>>> Awaiting result from SAP <<<<<<<<<<');
                        let sapResult = await result.EtReturn.item;
                        resolve(sapResult);
                    })
                })

                console.log('>>>>>>>>>>SAP RESULT<<<<<<<<<<<<<<<<<<<')
                console.log(sapResult)
                console.log(JSON.stringify(sapResult))


                if (sapResult.length > 0) {

                    let updatedTimetableData = await db.request()
                        .input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(sapResult))
                        .input('reason_id', sql.Int, resObj.reasonId)
                        // .input('reason_detail', sql.NVarChar(sql.MAX), resObj.reasonDescription)
                        .input('res_stage', sql.Int, 2)
                        .input('flag', sql.NVarChar(sql.MAX), resObj.reschFlag)
                        .input('last_modified_by', sql.Int, data.userId)
                        .output('output_flag', sql.Bit)
                        .output('output_json', sql.NVarChar(sql.MAX))
                        .execute('[asmsoc-mum].[sp_cancel_rescheduling]');

                    console.log(updatedTimetableData)

                    if(result.output.output_json == null){
                        console.log('<<<<<<<<<:::::ERROR OCCURED STAGE 1::::::>>>>>>>>')
                        global.io.emit("cancelEventResponse", {
                            socketUser: socketUser,
                            message: 'Error Occured',
                            slugName: 'asmsoc-mum',
                            status: 500,
                        })
                        
                    }
                    else{
                        global.io.emit("cancelEventResponse", {
                            socketUser: socketUser,
                            updatedLectureList: updatedTimetableData.output.output_json,
                            slugName: 'asmsoc-mum',
                            status: 200,
                        })
                    }

                } else {
                    // global.io.emit("bulkCancelled", {
                    //     socketUser: socketUser,
                    //     updatedLectureList: [],
                    //     slugName: 'asmsoc-mum',
                    //     status: 200,
                    //     isUpdated: 0,
                    //     msg: 'Lectures has been updated successfully.',
                    // })
                    console.log('>>>>>>>>>>>>>>>SAP RESULT CAME EMPTY<<<<<<<<<<<<<<<<<')
                }
            }
        }
        catch(error){
            console.log('error::>>3', error);
            console.log('error::>>2', JSON.parse(error.originalError.info.message).description);
            console.log('error::>>1', typeof error.originalError.info.message);
          
                console.log('<<<<<<<<<:::::ERROR STAGE 1::::::>>>>>>>>')
                global.io.emit("extraClassResponse", {
                    socketUser: socketUser,
                    message: JSON.parse(error.originalError.info.message).description,
                    slugName: 'asmsoc-mum',
                    status: 500,
                })
          
        }

    })

    socket.on("cancelAgainstExtraEvent", async data => {

        console.log('>>>>>>>>>>>>>>CANCEL AGINST EXTRA EVENT<<<<<<<<<<<<<<<', )

        let socketUser = data.userId;
        // console.log('socketUser>>>>> ', socketUser)

        let wsdlUrl = path.join(process.env.WSDL_PATH, "zevent_reschedule_sp_bin_sqh_20220808.wsdl");

        console.log('wsdlUrl', wsdlUrl)
        let soapClient = await new Promise((resolve, reject) => {
            soap.createClient(wsdlUrl, async function (err, soapClient) {
                if (err) throw err;
                let client = await soapClient;
                resolve(client)
            })
        });


        let resObj = JSON.parse(data.transJson);
        //resObj.eventType = 'THEO';
        // let lecTransObj = data.transJson

        console.log('resJSON====>> ', resObj)
        console.log('JSON.stringify(resObj.eventsJson) ====>> ', JSON.stringify(resObj.eventsJson))

        try{

            let result = await db.request()
                .input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(resObj.eventsJson))
                .input('reason_id', sql.Int, resObj.reasonId)
                .input('reason_detail', sql.NVarChar(sql.MAX), resObj.reasonDescription)
                .input('res_stage', sql.Int, 1)
                .input('flag', sql.NVarChar(sql.MAX), resObj.reschFlag)
                .input('last_modified_by', sql.Int, data.userId)
                .output('output_flag', sql.Bit)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[${data.slugName}].[sp_cancel_regular_against_extra_rescheduling]`)

            console.log('Stage-1 Result::>>', result.output.output_json)

            if(result.output.output_json == null){
                console.log('<<<<<<<<<:::::ERROR OCCURED STAGE 1::::::>>>>>>>>')
                global.io.emit("cancelAgaistExtraEventResponse", {
                    socketUser: socketUser,
                    message: 'Error Occured',
                    slugName: 'asmsoc-mum',
                    status: 500,
                })
                
            }
            else{

                let transLectureList = JSON.parse(result.output.output_json).data

                console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>BEDFORE')
                console.log("transLectureList>> ", transLectureList)
                console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>AFTER')

                //CREATE SAP OBJ JSON
                let rescheduleItems = [];

                for (let lecture of transLectureList) {
                    let item = {
                        TransId: lecture.TransId,
                        ZBuseve: lecture.ZBuseve,
                        Zdate: lecture.Zdate,
                        ZtimeFrom: lecture.ZtimeFrom,
                        ZtimeTo: lecture.ZtimeTo,
                        Zflag: lecture.Zflag,
                        ZroomId: lecture.ZroomId,
                        OldZroomId: lecture.OldZroomId,
                        Zyear: lecture.Zyear,
                        ZOrg: data.orgId,
                        ZPrgstd: lecture.ZPrgstd,
                        ZSess: lecture.ZSess,
                        ZModule: lecture.ZModule,
                        ZEvetyp: lecture.ZEvetyp,
                        ZfacultyId: lecture.ZfacultyId,
                        OldZfacultyId: lecture.OldZfacultyId,
                        ReasonId: lecture.ReasonId,
                        OldZdate: lecture.OldZdate,
                        OldZtimeFrom: lecture.OldZtimeFrom,
                        OldZtimeTo: lecture.OldZtimeTo,
                        Remark: "",
                        ZfacId: "",
                        ReasonDetail: lecture.ReasonDetail
                    }
                    rescheduleItems.push(item)
                }


                let rescheduleObj = {
                    ItReschedule: {
                        item: rescheduleItems
                    }
                }

                console.log('>>>>>>>SAP IBJ JSON<<<<<<<<<<<<', rescheduleObj.ItReschedule.item)

                let sapResult = await new Promise((resolve, reject) => {
                    soapClient.ZeventRescheduleSp(rescheduleObj, async (err, result) => {
                        if (err) throw err;
                        console.log('>>>>>>>>>> Awaiting result from SAP <<<<<<<<<<');
                        let sapResult = await result.EtReturn.item;
                        resolve(sapResult);
                    })
                })

                console.log('>>>>>>>>>>SAP RESULT<<<<<<<<<<<<<<<<<<<')
                console.log(sapResult)
                console.log(JSON.stringify(sapResult))


                if (sapResult.length > 0) {

                    let updatedTimetableData = await db.request()
                        .input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(sapResult))
                        .input('reason_id', sql.Int, resObj.reasonId)
                        .input('reason_detail', sql.NVarChar(sql.MAX), resObj.reasonDescription)
                        .input('res_stage', sql.Int, 2)
                        .input('flag', sql.NVarChar(sql.MAX), resObj.reschFlag)
                        .input('last_modified_by', sql.Int, data.userId)
                        .output('output_flag', sql.Bit)
                        .output('output_json', sql.NVarChar(sql.MAX))
                        .execute('[asmsoc-mum].[sp_cancel_regular_against_extra_rescheduling]');

                    console.log('Stage-2 Result::>>',updatedTimetableData)

                    if(result.output.output_json == null){
                        console.log('<<<<<<<<<:::::ERROR OCCURED STAGE 1::::::>>>>>>>>')
                        global.io.emit("cancelAgaistExtraEventResponse", {
                            socketUser: socketUser,
                            message: 'Error Occured',
                            slugName: 'asmsoc-mum',
                            status: 500,
                        })
                        
                    }
                    else{
                        global.io.emit("cancelAgaistExtraEventResponse", {
                            socketUser: socketUser,
                            updatedLectureList: JSON.parse(updatedTimetableData.output.output_json),
                            slugName: 'asmsoc-mum',
                            status: 200,
                        })
                    }

                } else {
                    // global.io.emit("bulkCancelled", {
                    //     socketUser: socketUser,
                    //     updatedLectureList: [],
                    //     slugName: 'asmsoc-mum',
                    //     status: 200,
                    //     isUpdated: 0,
                    //     msg: 'Lectures has been updated successfully.',
                    // })
                    console.log('>>>>>>>>>>>>>>>SAP RESULT CAME EMPTY<<<<<<<<<<<<<<<<<')
                }
            }
        }
        catch(error){
            console.log('error::>>3', error);
            console.log('error::>>2', JSON.parse(error.originalError.info.message).description);
            console.log('error::>>1', typeof error.originalError.info.message);
          
                console.log('<<<<<<<<<:::::ERROR STAGE 1::::::>>>>>>>>')
                global.io.emit("extraClassResponse", {
                    socketUser: socketUser,
                    message: JSON.parse(error.originalError.info.message).description,
                    slugName: 'asmsoc-mum',
                    status: 500,
                })
          
        }

    })

    //Modify Evented Slot
    socket.on("modifyEvents", async function (data) {
        // const job = await queue.add({
        //     task: "modifyEventedSlot",
        //     reschData: data
        // });

        console.log('>>>>>>>>>>>>>>>>>>>>>>>>> MODIFY EVENT <<<<<<<<<<<<<<<<<<<<<<<<<<<<')

        let socketUser = data.userId;
        // console.log('socketUser>>>>> ', socketUser)

        let wsdlUrl = path.join(process.env.WSDL_PATH, "zevent_reschedule_sp_bin_sqh_20220808.wsdl");  

        console.log('wsdlUrl', wsdlUrl)
        let soapClient = await new Promise((resolve, reject) => {
            soap.createClient(wsdlUrl, async function (err, soapClient) {
                if (err) throw err;
                let client = await soapClient;
                resolve(client)
            })
        });


        let resObj = JSON.parse(data.transJson);

        console.log('resJSON====>> ', resObj)
        console.log('JSON.stringify(resObj.eventsJson) ====>> ', JSON.stringify(resObj.eventsJson))
        
        try{

            let result = await db.request()
                .input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(resObj.eventsJson))
                .input('reason_id', sql.Int, resObj.reasonId)
                .input('reason_detail', sql.NVarChar(sql.MAX), resObj.reasonDescription)
                .input('res_stage', sql.Int, 1)
                .input('flag', sql.NVarChar(sql.MAX), resObj.reschFlag)
                .input('last_modified_by', sql.Int, data.userId)
                .output('output_flag', sql.Bit)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[${data.slugName}].[sp_modify_rescheduling]`)

            console.log('Stage-1 Result::>>', result.output.output_json)
            if(result.output.output_json == null){
                console.log('<<<<<<<<<:::::ERROR OCCURED STAGE 1::::::>>>>>>>>')
                global.io.emit("modifyEventResponse", {
                    socketUser: socketUser,
                    message: 'Error Occured',
                    slugName: 'asmsoc-mum',
                    status: 500,
                })
                
            }
            else{

                let transLectureList = JSON.parse(result.output.output_json).data
                console.log('transLectureList', transLectureList)

                console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>BEDFORE')
                console.log("transLectureList>> ", transLectureList)
                console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>AFTER')
            
                //CREATE SAP OBJ JSON
                let rescheduleItems = [];

                for (let lecture of transLectureList) {
                    let item = {
                        TransId: lecture.TransId,
                        ZBuseve: lecture.ZBuseve,
                        Zdate: lecture.Zdate,
                        ZtimeFrom: lecture.ZtimeFrom,
                        ZtimeTo: lecture.ZtimeTo,
                        Zflag: lecture.Zflag,
                        ZroomId: lecture.ZroomId,
                        OldZroomId: "",
                        Zyear: lecture.Zyear,
                        ZOrg: data.orgId,
                        ZPrgstd: lecture.ZPrgstd,
                        ZSess: lecture.ZSess,
                        ZModule: lecture.ZModule,
                        ZEvetyp: lecture.ZEvetyp,
                        ZfacultyId: lecture.ZfacultyId,
                        OldZfacultyId: "",
                        ReasonId: lecture.ReasonId,
                        OldZdate: lecture.Zdate,
                        OldZtimeFrom: lecture.ZtimeFrom,
                        OldZtimeTo: lecture.ZtimeTo,
                        Remark: "",
                        ZfacId: "",
                        ReasonDetail: lecture.ReasonDetail
                    }
                    rescheduleItems.push(item)
                }


                let rescheduleObj = {
                    ItReschedule: {
                        item: rescheduleItems
                    }
                }

                console.log('>>>>>>>SAP IBJ JSON<<<<<<<<<<<<', rescheduleObj.ItReschedule.item)

                let sapResult = await new Promise((resolve, reject) => {
                    soapClient.ZeventRescheduleSp(rescheduleObj, async (err, result) => {
                        if (err) throw err;
                        console.log('>>>>>>>>>> Awaiting result from SAP <<<<<<<<<<');
                        let sapResult = await result.EtReturn.item;
                        resolve(sapResult);
                    })
                })

                console.log('>>>>>>>>>>SAP RESULT<<<<<<<<<<<<<<<<<<<')
                console.log(sapResult)
                console.log(JSON.stringify(sapResult))


                if (sapResult.length > 0) {

                    let updatedTimetableData = await db.request()
                        .input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(sapResult))
                        .input('reason_id', sql.Int, resObj.reasonId)
                        .input('reason_detail', sql.NVarChar(sql.MAX), resObj.reasonDescription)
                        .input('res_stage', sql.Int, 2)
                        .input('flag', sql.NVarChar(sql.MAX), resObj.reschFlag)
                        .input('last_modified_by', sql.Int, data.userId)
                        .output('output_flag', sql.Bit)
                        .output('output_json', sql.NVarChar(sql.MAX))
                        .execute('[asmsoc-mum].[sp_modify_rescheduling]');

                    console.log('Stage-2 Result::>>',updatedTimetableData)

                    if(result.output.output_json == null){
                        console.log('<<<<<<<<<:::::ERROR OCCURED STAGE 1::::::>>>>>>>>')
                        global.io.emit("modifyEventResponse", {
                            socketUser: socketUser,
                            message: 'Error Occured',
                            slugName: 'asmsoc-mum',
                            status: 500,
                        })
                        
                    }
                    else{
                        global.io.emit("modifyEventResponse", {
                            socketUser: socketUser,
                            updatedLectureList: updatedTimetableData.output.output_json,
                            slugName: 'asmsoc-mum',
                            status: 200,
                        })
                    }

                } else {
                    // global.io.emit("bulkCancelled", {
                    //     socketUser: socketUser,
                    //     updatedLectureList: [],
                    //     slugName: 'asmsoc-mum',
                    //     status: 200,
                    //     isUpdated: 0,
                    //     msg: 'Lectures has been updated successfully.',
                    // })
                    console.log('>>>>>>>>>>>>>>>SAP RESULT CAME EMPTY<<<<<<<<<<<<<<<<<')
                }
            }
        }
        catch(error){
            console.log('error::>>3', error);
            console.log('error::>>2', JSON.parse(error.originalError.info.message).description);
            console.log('error::>>1', typeof error.originalError.info.message);
          
                console.log('<<<<<<<<<:::::ERROR STAGE 1::::::>>>>>>>>')
                global.io.emit("extraClassResponse", {
                    socketUser: socketUser,
                    message: JSON.parse(error.originalError.info.message).description,
                    slugName: 'asmsoc-mum',
                    status: 500,
                })
          
        }

    })

    //Reschedule Evented Slots
    socket.on("rescheduleEvents", async function (data) {
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>> RESCHEDULE EVENT <<<<<<<<<<<<<<<<<<<<<<<<<<<<')

        let socketUser = data.userId;
        // console.log('socketUser>>>>> ', socketUser)

        let wsdlUrl = path.join(process.env.WSDL_PATH, "zevent_reschedule_sp_bin_sqh_20220808.wsdl");  

        console.log('wsdlUrl', wsdlUrl)
        let soapClient = await new Promise((resolve, reject) => {
            soap.createClient(wsdlUrl, async function (err, soapClient) {
                if (err) throw err;
                let client = await soapClient;
                resolve(client)
            })
        });


        let resObj = JSON.parse(data.transJson);

        console.log('resJSON====>> ', resObj)
        console.log('JSON.stringify(resObj.eventsJson) ====>> ', JSON.stringify(resObj.eventsJson))
        
        try{

            let result = await db.request()
                .input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(resObj.eventsJson))
                .input('reason_id', sql.Int, resObj.reasonId)
                .input('reason_detail', sql.NVarChar(sql.MAX), resObj.reasonDescription)
                .input('res_stage', sql.Int, 1)
                .input('flag', sql.NVarChar(sql.MAX), resObj.reschFlag)
                .input('last_modified_by', sql.Int, data.userId)
                .output('output_flag', sql.Bit)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[${data.slugName}].[sp_reschedule]`)

            console.log('Stage-1 Result::>>', result.output.output_json)
            if(result.output.output_json == null){
                console.log('<<<<<<<<<:::::ERROR OCCURED STAGE 1::::::>>>>>>>>')
                global.io.emit("rescheduleEventResponse", {
                    socketUser: socketUser,
                    message: 'Error Occured',
                    slugName: 'asmsoc-mum',
                    status: 500,
                })
                
            }
            else{

                let transLectureList = JSON.parse(result.output.output_json).data
                console.log('transLectureList', transLectureList)


                console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>BEDFORE')
                console.log("transLectureList>> ", transLectureList)
                console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>AFTER')
            
                //CREATE SAP OBJ JSON
                let rescheduleItems = [];

                for (let lecture of transLectureList) {
                    let item = {
                        TransId: lecture.TransId,
                        ZBuseve: lecture.ZBuseve,
                        Zdate: lecture.Zdate,
                        ZtimeFrom: lecture.ZtimeFrom,
                        ZtimeTo: lecture.ZtimeTo,
                        Zflag: lecture.Zflag,
                        ZroomId: lecture.ZroomId,
                        OldZroomId: lecture.OldZroomId,
                        Zyear: lecture.Zyear,
                        ZOrg: data.orgId,
                        ZPrgstd: lecture.ZPrgstd,
                        ZSess: lecture.ZSess,
                        ZModule: lecture.ZModule,
                        ZEvetyp: lecture.ZEvetyp,
                        ZfacultyId: lecture.ZfacultyId,
                        OldZfacultyId: lecture.OldZfacultyId,
                        ReasonId: lecture.ReasonId,
                        OldZdate: lecture.OldZdate,
                        OldZtimeFrom: lecture.OldZtimeFrom,
                        OldZtimeTo: lecture.OldZtimeTo,
                        Remark: "",
                        ZfacId: "",
                        ReasonDetail: lecture.ReasonDetail
                    }
                    rescheduleItems.push(item)
                }


                let rescheduleObj = {
                    ItReschedule: {
                        item: rescheduleItems
                    }
                }

                console.log('>>>>>>>SAP IBJ JSON<<<<<<<<<<<<', rescheduleObj.ItReschedule.item)


                let sapResult = await new Promise((resolve, reject) => {
                    soapClient.ZeventRescheduleSp(rescheduleObj, async (err, result) => {
                        if (err) throw err;
                        console.log('>>>>>>>>>> Awaiting result from SAP <<<<<<<<<<');
                        let sapResult = await result.EtReturn.item;
                        resolve(sapResult);
                    })
                })

                console.log('>>>>>>>>>>SAP RESULT<<<<<<<<<<<<<<<<<<<')
                console.log(sapResult)
                console.log(JSON.stringify(sapResult))

                if (sapResult.length > 0) {

                    let updatedTimetableData = await db.request()
                        .input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(sapResult))
                        .input('reason_id', sql.Int, resObj.reasonId)
                        .input('reason_detail', sql.NVarChar(sql.MAX), resObj.reasonDescription)
                        .input('res_stage', sql.Int, 2)
                        .input('flag', sql.NVarChar(sql.MAX), resObj.reschFlag)
                        .input('last_modified_by', sql.Int, data.userId)
                        .output('output_flag', sql.Bit)
                        .output('output_json', sql.NVarChar(sql.MAX))
                        .execute(`[${data.slugName}].[sp_reschedule]`);

                    console.log('Stage-2 Result',updatedTimetableData)
                    if(result.output.output_json == null){
                        console.log('<<<<<<<<<:::::ERROR OCCURED STAGE 2::::::>>>>>>>>')
                        global.io.emit("rescheduleEventResponse", {
                            socketUser: socketUser,
                            message: 'Error Occured',
                            slugName: 'asmsoc-mum',
                            status: 500,
                        })
                        
                    }
                    else{
                        global.io.emit("rescheduleEventResponse", {
                            socketUser: socketUser,
                            updatedLectureList: updatedTimetableData.output.output_json,
                            slugName: 'asmsoc-mum',
                            status: 200,
                        })
                    }

                
                } else {
                    // global.io.emit("bulkCancelled", {
                    //     socketUser: socketUser,
                    //     updatedLectureList: [],
                    //     slugName: 'asmsoc-mum',
                    //     status: 200,
                    //     isUpdated: 0,
                    //     msg: 'Lectures has been updated successfully.',
                    // })
                    console.log('>>>>>>>>>>>>>>>SAP RESULT CAME EMPTY<<<<<<<<<<<<<<<<<')
                }
            }
        }
        catch(error){
            console.log('error::>>3', error);
            console.log('error::>>2', JSON.parse(error.originalError.info.message).description);
            console.log('error::>>1', typeof error.originalError.info.message);
          
                console.log('<<<<<<<<<:::::ERROR STAGE 1::::::>>>>>>>>')
                global.io.emit("extraClassResponse", {
                    socketUser: socketUser,
                    message: JSON.parse(error.originalError.info.message).description,
                    slugName: 'asmsoc-mum',
                    status: 500,
                })
          
        }

    })

    //Extra Class new
    socket.on("scheduleExtraClassNew", async data => {
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>> EXTRA CLASS EVENT <<<<<<<<<<<<<<<<<<<<<<<<<<<<')

        let socketUser = data.userId;
        // console.log('socketUser>>>>> ', socketUser)

        let wsdlUrl = path.join(process.env.WSDL_PATH, "zevent_reschedule_sp_bin_sqh_20220808.wsdl"); 

        console.log('wsdlUrl', wsdlUrl)
        let soapClient = await new Promise((resolve, reject) => {
            soap.createClient(wsdlUrl, async function (err, soapClient) {
                if (err) throw err;
                let client = await soapClient;
                resolve(client)
            })
        });


        let resObj = JSON.parse(data.transJson);

        console.log('resJSON====>> ', resObj)
        console.log('JSON.stringify(resObj.eventsJson) ====>> ', JSON.stringify(resObj.eventsJson))
        
        try{
            let result = await db.request()
            .input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(resObj.eventsJson))
            .input('reason_id', sql.Int, resObj.reasonId)
            .input('reason_detail', sql.NVarChar(sql.MAX), resObj.reasonDescription)
            .input('res_stage', sql.Int, 1)
            .input('flag', sql.NVarChar(sql.MAX), resObj.reschFlag)
            .input('last_modified_by', sql.Int, data.userId)
            .output('output_flag', sql.Bit)
            .output('output_json', sql.NVarChar(sql.MAX))
            .execute(`[${data.slugName}].[sp_extra_class_rescheduling]`)

    
            console.log('Stage-1 Result::>>', result.output.output_json)
            if(result.output.output_json == null){
                console.log('<<<<<<<<<:::::ERROR OCCURED STAGE 1::::::>>>>>>>>')
                global.io.emit("extraClassResponse", {
                    socketUser: socketUser,
                    message: 'Error Occured',
                    slugName: 'asmsoc-mum',
                    status: 500,
                })
                
            }
            else{
        
                let transLectureList = JSON.parse(result.output.output_json).data
                console.log('transLectureList', transLectureList)


                console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>BEDFORE')
                console.log("transLectureList>> ", transLectureList)
                console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>AFTER')
            
                //CREATE SAP OBJ JSON
                let rescheduleItems = [];

                for (let lecture of transLectureList) {
                    let item = {
                        TransId: lecture.TransId,
                        ZBuseve: lecture.ZBuseve,
                        Zdate: lecture.Zdate,
                        ZtimeFrom: lecture.ZtimeFrom,
                        ZtimeTo: lecture.ZtimeTo,
                        Zflag: lecture.Zflag,
                        ZroomId: lecture.ZroomId,
                        OldZroomId: lecture.OldZroomId,
                        Zyear: lecture.Zyear,
                        ZOrg: data.orgId,
                        ZPrgstd: lecture.ZPrgstd,
                        ZSess: lecture.ZSess,
                        ZModule: lecture.ZModule,
                        ZEvetyp: lecture.ZEvetyp,
                        ZfacultyId: lecture.ZfacultyId,
                        OldZfacultyId: lecture.OldZfacultyId,
                        ReasonId: lecture.ReasonId,
                        OldZdate: lecture.OldZdate,
                        OldZtimeFrom: lecture.OldZtimeFrom,
                        OldZtimeTo: lecture.OldZtimeTo,
                        Remark: "",
                        ZfacId: "",
                        ReasonDetail: lecture.ReasonDetail
                    }
                    rescheduleItems.push(item)
                }


                let rescheduleObj = {
                    ItReschedule: {
                        item: rescheduleItems
                    }
                }

                console.log('>>>>>>>SAP IBJ JSON<<<<<<<<<<<<', rescheduleObj.ItReschedule.item)

                let sapResult = await new Promise((resolve, reject) => {
                    soapClient.ZeventRescheduleSp(rescheduleObj, async (err, result) => {
                        if (err) throw err;
                        console.log('>>>>>>>>>> Awaiting result from SAP <<<<<<<<<<');
                        let sapResult = await result.EtReturn.item;
                        resolve(sapResult);
                    })
                })

                console.log('>>>>>>>>>>SAP RESULT<<<<<<<<<<<<<<<<<<<')
                console.log(sapResult)
                console.log(JSON.stringify(sapResult))


                if (sapResult.length > 0) {

                    let updatedTimetableData = await db.request()
                        .input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(sapResult))
                        .input('reason_id', sql.Int, resObj.reasonId)
                        .input('reason_detail', sql.NVarChar(sql.MAX), resObj.reasonDescription)
                        .input('res_stage', sql.Int, 2)
                        .input('flag', sql.NVarChar(sql.MAX), resObj.reschFlag)
                        .input('last_modified_by', sql.Int, data.userId)
                        .output('output_flag', sql.Bit)
                        .output('output_json', sql.NVarChar(sql.MAX))
                        .execute('[asmsoc-mum].[sp_extra_class_rescheduling]');

                    console.log('Stage-2 Result::>>',updatedTimetableData)
                    if(updatedTimetableData.output.output_json == null){
                        console.log('<<<<<<<<<:::::ERROR OCCURED STAGE-2::::::>>>>>>>>')
                        global.io.emit("extraClassResponse", {
                            socketUser: socketUser,
                            message: 'Error Occured',
                            slugName: 'asmsoc-mum',
                            status: 500,
                        })
                        
                    }
                    else{
                        global.io.emit("extraClassResponse", {
                            socketUser: socketUser,
                            updatedLectureList: JSON.parse(updatedTimetableData.output.output_json),
                            slugName: 'asmsoc-mum',
                            status: 200,
                        })
                    }

                } else {
                    // global.io.emit("bulkCancelled", {
                    //     socketUser: socketUser,
                    //     updatedLectureList: [],
                    //     slugName: 'asmsoc-mum',
                    //     status: 200,
                    //     isUpdated: 0,
                    //     msg: 'Lectures has been updated successfully.',
                    // })
                    console.log('>>>>>>>>>>>>>>>SAP RESULT CAME EMPTY<<<<<<<<<<<<<<<<<')
                }
            }
    }
    catch(error){
        console.log('error::>>3', error);
        console.log('error::>>2', JSON.parse(error.originalError.info.message).description);
        console.log('error::>>1', typeof error.originalError.info.message);
      
            console.log('<<<<<<<<<:::::ERROR STAGE 1::::::>>>>>>>>')
            global.io.emit("extraClassResponse", {
                socketUser: socketUser,
                message: JSON.parse(error.originalError.info.message).description,
                slugName: 'asmsoc-mum',
                status: 500,
            })
      
    }

    })

    //Regular Lecture
    socket.on("scheduleRegularLecture", async data => {
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>> REGULAR CLASS EVENT <<<<<<<<<<<<<<<<<<<<<<<<<<<<')

        let socketUser = data.userId;
        // console.log('socketUser>>>>> ', socketUser)

        let wsdlUrl = path.join(process.env.WSDL_PATH, "zevent_reschedule_sp_bin_sqh_20220808.wsdl"); 

        console.log('wsdlUrl', wsdlUrl)
        let soapClient = await new Promise((resolve, reject) => {
            soap.createClient(wsdlUrl, async function (err, soapClient) {
                if (err) throw err;
                let client = await soapClient;
                resolve(client)
            })
        });


        let resObj = JSON.parse(data.transJson);

        console.log('resJSON====>> ', resObj)
        console.log('JSON.stringify(resObj.eventsJson) ====>> ', JSON.stringify(resObj.eventsJson))
        
        try{

            let result = await db.request()
                .input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(resObj.eventsJson))
                .input('reason_id', sql.Int, resObj.reasonId)
                .input('reason_detail', sql.NVarChar(sql.MAX), resObj.reasonDescription)
                .input('res_stage', sql.Int, 1)
                .input('flag', sql.NVarChar(sql.MAX), resObj.reschFlag)
                .input('last_modified_by', sql.Int, data.userId)
                .output('output_flag', sql.Bit)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[${data.slugName}].[sp_regular_class_rescheduling]`)

            console.log('Stage-1 Result::>>', result.output.output_json)

            if(result.output.output_json == null){
                console.log('<<<<<<<<<:::::ERROR OCCURED STAGE 1::::::>>>>>>>>')
                global.io.emit("regularClassResponse", {
                    socketUser: socketUser,
                    message: 'Error Occured',
                    slugName: 'asmsoc-mum',
                    status: 500,
                })
                
            }
            else{

                let transLectureList = JSON.parse(result.output.output_json).data
            console.log('transLectureList', transLectureList)


            console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>BEDFORE')
            console.log("transLectureList>> ", transLectureList)
            console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>AFTER')
        
            //CREATE SAP OBJ JSON
            let rescheduleItems = [];

            for (let lecture of transLectureList) {
                let item = {
                    TransId: lecture.TransId,
                    ZBuseve: lecture.ZBuseve,
                    Zdate: lecture.Zdate,
                    ZtimeFrom: lecture.ZtimeFrom,
                    ZtimeTo: lecture.ZtimeTo,
                    Zflag: lecture.Zflag,
                    ZroomId: lecture.ZroomId,
                    OldZroomId: "",
                    Zyear: lecture.Zyear,
                    ZOrg: data.orgId,
                    ZPrgstd: lecture.ZPrgstd,
                    ZSess: lecture.ZSess,
                    ZModule: lecture.ZModule,
                    ZEvetyp: lecture.ZEvetyp,
                    ZfacultyId: lecture.ZfacultyId,
                    OldZfacultyId: "",
                    ReasonId: lecture.ReasonId,
                    OldZdate: "",
                    OldZtimeFrom: "",
                    OldZtimeTo: "",
                    Remark: "",
                    ZfacId: "",
                    ReasonDetail: lecture.ReasonDetail
                }
                rescheduleItems.push(item)
            }


            let rescheduleObj = {
                ItReschedule: {
                    item: rescheduleItems
                }
            }

            console.log('>>>>>>>SAP IBJ JSON<<<<<<<<<<<< LAST:::>>>>', rescheduleObj.ItReschedule.item)
        
            let sapResult = await new Promise((resolve, reject) => {
                soapClient.ZeventRescheduleSp(rescheduleObj, async (err, result) => {
                    if (err) throw err;
                    console.log('>>>>>>>>>> Awaiting result from SAP <<<<<<<<<<');
                    let sapResult = await result.EtReturn.item;
                    resolve(sapResult);
                })
            })

            console.log('>>>>>>>>>>SAP RESULT<<<<<<<<<<<<<<<<<<<')
            console.log(sapResult)
            console.log(JSON.stringify(sapResult))


            if (sapResult.length > 0) {

                let updatedTimetableData = await db.request()
                    .input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(sapResult))
                    .input('reason_id', sql.Int, resObj.reasonId)
                    .input('reason_detail', sql.NVarChar(sql.MAX), resObj.reasonDescription)
                    .input('res_stage', sql.Int, 2)
                    .input('flag', sql.NVarChar(sql.MAX), resObj.reschFlag)
                    .input('last_modified_by', sql.Int, data.userId)
                    .output('output_flag', sql.Bit)
                    .output('output_json', sql.NVarChar(sql.MAX))
                    .execute('[asmsoc-mum].[sp_regular_class_rescheduling]');

                console.log('Stage-2 Result::>>',updatedTimetableData)

                if(result.output.output_json == null){
                    console.log('<<<<<<<<<:::::ERROR OCCURED STAGE 2::::::>>>>>>>>')
                    global.io.emit("regularClassResponse", {
                        socketUser: socketUser,
                        message: 'Error Occured',
                        slugName: 'asmsoc-mum',
                        status: 500,
                    })
                    
                }else{
                    global.io.emit("regularClassResponse", {
                        socketUser: socketUser,
                        updatedLectureList: JSON.parse(updatedTimetableData.output.output_json),
                        slugName: 'asmsoc-mum',
                        status: 200,
                    })
                } 
            } else {
                // global.io.emit("bulkCancelled", {
                //     socketUser: socketUser,
                //     updatedLectureList: [],
                //     slugName: 'asmsoc-mum',
                //     status: 200,
                //     isUpdated: 0,
                //     msg: 'Lectures has been updated successfully.',
                // })
                console.log('>>>>>>>>>>>>>>>SAP RESULT CAME EMPTY<<<<<<<<<<<<<<<<<')
            }
            }
        }
        catch(error){
            console.log('error::>>3', error);
            console.log('error::>>2', JSON.parse(error.originalError.info.message).description);
            console.log('error::>>1', typeof error.originalError.info.message);
          
                console.log('<<<<<<<<<:::::ERROR STAGE 1::::::>>>>>>>>')
                global.io.emit("extraClassResponse", {
                    socketUser: socketUser,
                    message: JSON.parse(error.originalError.info.message).description,
                    slugName: 'asmsoc-mum',
                    status: 500,
                })
          
        }

    })


    //faculty check for bulk modify
    socket.on('facultyAvailabilityCheck', async (facultyArg, roomArg) => {

        console.log('facultyAvailabilityCheck DATA::::::::::::::::', facultyArg, roomArg)


        let facultyData = await facultyArg;
        let roomData = await roomArg;

        console.log('>>>>>>>>>>>>>>CHECK FACULTY AVAILABILITY<<<<<<<<<<<<<<<')

        let wsdlUrl = path.join(process.env.WSDL_PATH, "zapi_faculty_availability_bin_sep_20220509.wsdl");



        let soapClient = await new Promise((resolve, reject) => {
            soap.createClient(wsdlUrl, async function (err, soapClient) {
                if (err) throw err;
                let client = await soapClient;
                resolve(client)
            })
        });

        let facultyParam = {
            ResourceType: facultyData.facultyType,
            ResourceId: facultyData.facultyId,
            StartDate: facultyData.startDate,
            EndDate: facultyData.endDate,
            StartTime: moment(facultyData.startTime, 'hh:mm:ss A').format('HH:mm:ss'),
            EndTime: moment(facultyData.endTime, 'hh:mm:ss A').format('HH:mm:ss'),
        }

        let roomParam = {
            ResourceType: 'G',
            ResourceId: roomData.roomAbbr,
            StartDate: roomData.startDate,
            EndDate: roomData.endDate,
            StartTime: moment(roomData.startTime, 'hh:mm:ss A').format('HH:mm:ss'),
            EndTime: moment(roomData.endTime, 'hh:mm:ss A').format('HH:mm:ss'),
        }


        let sapFacultyResult = await new Promise((resolve, reject) => {
            soapClient.ZapiFacultyAvailability(facultyParam, async (err, result) => {

                if (err) throw err;
                try {

                    console.log('>>>>>>>>>> Awaiting result from SAP <<<<<<<<<<', result)
                    let sapResult = await result.EtResoAvaiInfo
                    console.log('sapResult EtResoAvaiInfo: ', sapResult)
                    if (!sapResult) {
                        sapResult = [];
                    } else {
                        sapResult = sapResult.item

                        for (let item of sapResult) {
                            item.EventDate = moment(item.EventDate, 'YYYY-MM-DD').format("DD/MM/YYYY")
                            item.StartTime = moment(item.StartTime, 'HH:mm:ss').format('hh:mm:ss A')
                            item.EndTime = moment(item.EndTime, 'HH:mm:ss').format('hh:mm:ss A')
                        }
                    }
                    resolve({
                        status: 200,
                        data: sapResult
                    })
                } catch (error) {
                    console.log('error:::::::::', error)
                    reject({
                        status: 500,
                        data: []
                    })
                }
            })
        })

        let sapRoomResult = await new Promise((resolve, reject) => {
            soapClient.ZapiFacultyAvailability(roomParam, async (err, result) => {

                if (err) throw err;
                try {

                    console.log('>>>>>>>>>> Awaiting result from SAP <<<<<<<<<<', result)
                    let sapResult = await result.EtResoAvaiInfo
                    console.log('sapResult EtResoAvaiInfo: ', sapResult)
                    if (!sapResult) {
                        sapResult = [];
                    } else {
                        sapResult = sapResult.item

                        for (let item of sapResult) {
                            item.EventDate = moment(item.EventDate, 'YYYY-MM-DD').format("DD/MM/YYYY")
                            item.StartTime = moment(item.StartTime, 'HH:mm:ss').format('hh:mm:ss A')
                            item.EndTime = moment(item.EndTime, 'HH:mm:ss').format('hh:mm:ss A')
                        }
                    }
                    resolve({
                        status: 200,
                        data: sapResult
                    })
                } catch (error) {
                    console.log('error:::::::::', error)
                    reject({
                        status: 500,
                        data: []
                    })
                }
            })
        })

        console.log('>>>>>>>>>>>>>>>>>>SAP RESULT<<<<<<<<<<<<<<<<<<<<<<<')
        console.log('sapResult::::::::::::::::::::>>>>>>', sapFacultyResult)
        socket.emit('facultyRoomAvlList', sapFacultyResult, sapRoomResult)
        socket.broadcast.emit('facultyRoomAvlList', sapFacultyResult, sapRoomResult)
    })

    socket.on("changeTimetable", async data => {
        // const job = await queue.add({
        //     task: "changeTimetable",
        //     reschData: data
        // });

        console.log('>>>>>>>>>>>>>>>>>>>>>>>>> changeTimetable <<<<<<<<<<<<<<<<<<<<<<<<<<<<')

        let request = await db.request();

        console.log('>>>>>>>>>>>>>>CHANGE OF TIMETABLE<<<<<<<<<<<<<<<')

        let wsdlUrl = path.join(process.env.WSDL_PATH, "zevent_reschedule_sp_bin_sqh_20220401_2.wsdl");


        let soapClient = await new Promise((resolve, reject) => {
            soap.createClient(wsdlUrl, async function (err, soapClient) {
                if (err) throw err;
                let client = await soapClient;
                resolve(client)
            })
        });
        let socketUser = data.socketUser;
        console.log('socketUser>>>>> ', socketUser)


        let resObj = data.resObj
        resObj.eventType = 'THEO';
        resObj.schoolId = '00004533'
        let lecTransObj = data.transJson

        console.log('resJSON====>> ', lecTransObj)

        let insertedTransData = await db.request()
            .input('transJson', sql.NVarChar(sql.MAX), lecTransObj)
            .input('reasonId', sql.NVarChar(sql.Int), resObj.reasonId)
            .input('reasonDetail', sql.NVarChar(sql.MAX), resObj.reasonDetail)
            .output('output', sql.Bit)
            .output('msg', sql.NVarChar(sql.MAX))
            .execute('change_timetable')

        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>BEDFORE')
        console.log(insertedTransData)
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>AFTER')

        //CREATE SAP OBJ JSON
        if (insertedTransData.output.output) {

            let rescheduleItems = [];
            let transLectureList = insertedTransData.recordset

            console.log("transLectureList: ", transLectureList)

            for (let lecture of transLectureList) {
                console.log("date: ", lecture.date_str)
                console.log("DATE : ", moment(lecture.date_str, 'DD/MM/YYYY').format("YYYY-MM-DD"))

                let item = {
                    TransId: lecture.transaction_id,
                    ZBuseve: lecture.sap_event_id,
                    Zdate: moment(lecture.new_date_str, 'DD/MM/YYYY').format("YYYY-MM-DD"),
                    ZtimeFrom: moment(lecture.new_start_time, 'hh:mm:ss A').format('HH:mm:ss'),
                    ZtimeTo: moment(lecture.new_end_time, 'hh:mm:ss A').format('HH:mm:ss'),
                    Zflag: lecture.z_flag,
                    ZroomId: lecture.new_room_uid,
                    OldZroomId: lecture.room_uid,
                    Zyear: lecture.acad_year,
                    ZOrg: resObj.schoolId,
                    ZPrgstd: lecture.program_id,
                    ZSess: lecture.z_acad_id,
                    ZModule: lecture.module_id,
                    ZEvetyp: lecture.event_type,
                    ZfacultyId: resObj.toFacultyId,
                    OldZfacultyId: lecture.faculty_id,
                    ReasonId: Number(resObj.reasonId),
                    OldZdate: moment(lecture.date_str, 'DD/MM/YYYY').format("YYYY-MM-DD"),
                    OldZtimeFrom: moment(lecture.start_time, 'hh:mm:ss A').format('HH:mm:ss'),
                    OldZtimeTo: moment(lecture.end_time, 'hh:mm:ss A').format('HH:mm:ss'),
                    Remark: "",
                    ZfacId: "",
                    ReasonDetail: resObj.reasonDetail
                }
                rescheduleItems.push(item)
            }


            let rescheduleObj = {
                ItReschedule: {
                    item: rescheduleItems
                }
            }

            console.log('>>>>>>>SAP IBJ JSON<<<<<<<<<<<<', rescheduleObj.ItReschedule.item)


            let sapResult = await new Promise((resolve, reject) => {
                soapClient.ZeventRescheduleSp(rescheduleObj, async (err, result) => {
                    if (err) throw err;
                    console.log('>>>>>>>>>> Awaiting result from SAP <<<<<<<<<<');
                    let sapResult = await result.EtReturn.item;
                    resolve(sapResult);
                })
            })

            console.log('>>>>>>>>>>SAP RESULT<<<<<<<<<<<<<<<<<<<')
            console.log(sapResult)
            console.log(JSON.stringify(sapResult))


            if (sapResult.length > 0) {

                let updatedTimetableData = await db.request()
                    .input('transJson', sql.NVarChar(sql.MAX), JSON.stringify(sapResult))
                    .output('output', sql.Bit)
                    .output('msg', sql.NVarChar(sql.MAX))
                    .execute('after_change_timetable');

                console.log(updatedTimetableData)

                global.io.emit("bulkModified", {
                    socketUser: socketUser,
                    updatedLectureList: updatedTimetableData.recordset,
                    slugName: 'asmsoc-mum',
                    status: 200,
                    isUpdated: 1,
                    msg: 'Lectures has been updated successfully.'
                })
            } else {
                global.io.emit("bulkModified", {
                    socketUser: socketUser,
                    updatedLectureList: [],
                    slugName: 'asmsoc-mum',
                    status: 200,
                    isUpdated: 0,
                    msg: 'Lectures has been updated successfully.',
                })
            }



        } else {
            console.log('>>>>>>>>>>>>FAILED: ', insertedTransData.output.msg)
        }

    })


    //Freeze Timesheet
    socket.on("freezeTimesheet", async (data) => {
        console.log("=======>>>> Freezing Timesheet")
        let request = await db.request();
        let request1 = await db.request();
        let slugName = sanitizer.value(data.slug, String);

        async function execFreezeTimesheet() {

            // let generateTimesheet = await new Promise((resolve) => {
            //     request.output('output', sql.Int);
            //     request.execute('[' + slugName + '].generateTimesheet07042020', async function (err, result) {
            //         if (err) {
            //             console.log(err);
            //         } else {
            //             let answers = await result
            //             let outputVal = answers.output.output;
            //             if (outputVal == 1) {
            //                 return resolve(answers)
            //             } else {
            //                 global.io.emit("freezeTimetableErr", {
            //                     status: "Failed",
            //                     message: "Timesheet generation failed.",
            //                     data: answers
            //                 })
            //             }
            //         }
            //     })
            // })

            // let facultyTimesheet = await new Promise((resolve) => {
            //     console.log("=====>>>>>>>>> GENERATING FACULTY TIME SHEET");
            //     request.output('output', sql.Int)
            //     request.execute('[' + slugName + '].facultyTimesheet20042020', async function (err, result) {
            //         console.log("FACULTY TIMESHEET EXECUTING")
            //         if (err) throw err;
            //         let outputVal = await result.output.output
            //         console.log("FACULTY TIMESHEET EXECUTED")
            //         console.log("outputVal =====>>>>>>>>> ", outputVal);

            //         if (outputVal == 1) {
            //             console.log("NEXT PROMISE EXECUTING")
            //             return resolve(1)
            //         } else {
            //             console.log("EXEC STOPPED")
            //             global.io.emit("freezeTimetableErr", {
            //                 status: 400,
            //                 message: "Faculty timesheet generation failed."
            //             })
            //         }

            //     })
            // })

            // let generateDataForSAP = await new Promise((resolve) => {
            //     console.log("=====>>>>>>>>> GENERATING DATA FOR SAP");
            //     request1.output('state', sql.Int)
            //     request1.execute(`[${slugName}].generateDataForSAP`, async function (err, result) {
            //         if (err) throw err;
            //         let outputVal = await result.output.state

            //         console.log("generateDataForSAP ====>>>>>> ", outputVal)

            //         if (outputVal == 1) {
            //             return resolve(1)
            //         } else {
            //             global.io.emit("freezeTimetableErr", {
            //                 status: 400,
            //                 message: "Generate Data for SAP failed."
            //             })
            //         }

            //     })
            // })

            console.log(" TO UPDATE STATUS =====>>>>>>>>> ");

            // let updateStatus = await new Promise((resolve) => {
            //     console.log("=====>>>>>>>>>UPDATEING STATUS");
            //     let stmt = "IF NOT EXISTS (SELECT * FROM [" + slugName + "].statusTable WHERE title = 'isFreezed') INSERT INTO [" + slugName + "].statusTable (title, status, timesUpdated) VALUES('isFreezed', 'Y', 1) ELSE UPDATE [" + slugName + "].statusTable SET status='Y', timesUpdated = (SELECT timesUpdated FROM [" + slugName + "].statusTable WHERE title='isFreezed') + 1 WHERE title = 'isFreezed'"
            //     request.query(stmt, async function (err, obj) {
            //         if (err) throw err

            //         let result = await obj
            //         console.log("====>>>>>>   Emitting AGAIN", result)
            //         global.io.emit("timesheetFreezed", {
            //             status: 200,
            //             message: "Timesheet has been freezed successfully.",
            //             isFreezed: "Y"
            //         })
            //     })
            // })

        }

        execFreezeTimesheet()
    })

    //swapLecture
    socket.on('swapLecture', async obj => {
        let request = db.request();

        // request.input('roomno', sql.NVarChar(10), roomno)

        let socketData = await obj;
        console.log("Data: ", socketData)
        let fromId = Number(socketData.fromId)
        let toId = Number(socketData.toId)

        console.log(fromId, ' | ', toId)

        request.input('inputFromId', sql.Int, fromId);
        request.input('inputToId', sql.Int, toId);
        request.output('outputMsg', sql.NVarChar(500), '');
        request.input('output', sql.Int, 0);

        request.execute(`[${socketData.slug}].swapLectureDayWise110521`, async (err, result) => {
            if (err) throw err;

            let data = await result.recordset[0];

            console.log("swapped data==============>>>>>>>>>>>>>>>>>> ", data)
            //Changed By Hiren
            global.io.emit('lectureSwapped', {
                msg: data.outputMsg,
                isSwapped: data.output,
                slug: socketData.slug,
                dragTdId: socketData.dragTdId,
                targetTdId: socketData.targetTdId,
                dragTdHtml: data.toeventWithTime,
                dragEventName: data.toeventname,
                dragFacultyId: data.tofacultyid,
                dragFacultyType: data.tofacultyType,
                dragProgram: data.toprogram,
                dragAcadSession: data.toacadsession,
                dragEventType: data.toeventtype,
                dragEventId: data.toeventid,
                dragBookedDiv: data.tobookeddiv,

                targetTdVal: data.eventWithTime,
                targetEventName: data.eventname,
                targetFacultyId: data.facultyid,
                targetFacultyType: data.facultyType,
                targetProgram: data.program,
                targetAcadSession: data.acadsession,
                targetEventType: data.eventtype,
                targetEventId: data.eventid,
                targetBookedDiv: data.bookeddiv,
            })
        })
    })

    socket.on('create-sap-events', async function (slug) {

        console.log("Message: socket called creating sap events");

        let eventDetails = await poolConnection.then(pool => {
            return pool.request()
                .output('output_flag', sql.Bit)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[asmsoc-mum].sp_generate_event_details`)
        })
        eventDetails = JSON.parse(eventDetails.output.output_json).data

        let eventHeaders = await poolConnection.then(pool => {
            return pool.request()
                .output('output_flag', sql.Bit)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[asmsoc-mum].sp_generate_event_header`)
        })
        eventHeaders = JSON.parse(eventHeaders.output.output_json).data

        let eventSchedules = await poolConnection.then(pool => {
            return pool.request()
                .output('output_flag', sql.Bit)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[asmsoc-mum].sp_generate_event_schedules`)
        })
        eventSchedules = JSON.parse(eventSchedules.output.output_json).data


        console.log('Event details >>>> ', eventDetails.length)
        console.log('eventHeaders >>>> ', eventHeaders.length)
        console.log('eventSchedules >>>> ', eventSchedules.length)

        // return false;

        // let wsdlUrl = path.join(process.env.WSDL_PATH, "zevent_create_sp_bin_sep_20220509.wsdl");

        let soapClient = await new Promise((resolve, reject) => {
            soap.createClient(wsdlUrl, async function (err, soapClient) {
                if (err) throw err;
                let client = await soapClient;
                resolve(client)
            })
        });


        await soapClient.ZeventCreateSp({
                ItEventDetail: {
                    item: eventDetails
                },
                ItEventHeader: {
                    item: eventHeaders
                },
                ItEventSchedule: {
                    item: eventSchedules,
                },
            },
            async function (err, result) {

                if (err) throw err;

                let etReturn = await result.EtReturn.item;

                writeFile(`D:/infralog/production/course_wsdl.txt`, JSON.stringify(result), err => {
                    if (err) throw err;
                })


                let procRes = await poolConnection.then(pool => {
                    return pool.request()
                        .input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(etReturn))
                        .output('output_flag', sql.Bit)
                        .output('output_json', sql.NVarChar(sql.MAX))
                        .execute(`[asmsoc-mum].sp_update_created_events`)
                })

                console.log('procRes>>> ', procRes)

                socket.emit('res-create-sap-events', {
                    status: 200,
                    message: 'Event creation completed.'
                });

            }
        )
    })


    //Fetch api
    function sendToLms(data) {
        let obj = {
            TransId: data.TransId,
            ZBuseve: data.ZBuseve,
            Zdate: data.Zdate,
            ZtimeFrom: moment(data.ZtimeFrom).format("hh:mm:ss A"),
            ZtimeTo: moment(data.ZtimeTo).format("hh:mm:ss A"),
            Zflag: data.Zflag,
            ZroomId: data.ZroomId,
            OldZroomId: data.OldZroomId,
            Zyear: data.Zyear,
            ZOrg: data.ZOrg,
            ZPrgstd: data.ZPrgstd,
            ZSess: data.ZSess,
            ZModule: data.ZModule,
            ZEvetyp: data.ZEvetyp,
            ZfacultyId: data.ZfacultyId,
            OldZfacultyId: data.OldZfacultyId,
            ReasonId: data.ReasonId,
            OldZdate: data.OldZdate,
            OldZtimeFrom: data.OldZtimeFrom,
            OldZtimeTo: data.OldZtimeTo,
            Remark: data.Remark,
            ZfacId: data.ZfacId,
            ReasonDetail: data.ReasonDetail,
            Status: data.Status,
            StatusRemark: data.StatusRemark
        }

        console.log('>>>>>>>>>>>>>>>>>>>>>>>> SENDING DATA TO LMS <<<<<<<<<<<<<<<<<<<<<<<')
        axios.post('https://uat-portal.svkm.ac.in:8080/usermgmtcrud/sendCancledLecture', {
                data: obj
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    "Access-Control-Allow-Origin": "*",
                }
            })
            .then(function (response) {
                console.log(response.data);
            })
            .catch(function (err) {
                console.log(err);
            });
    }

}