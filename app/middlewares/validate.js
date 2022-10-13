const {
    check,
    body,
    oneOf
} = require('express-validator');

const validator = require('validator')

module.exports = function validate(method) {


    switch (method) {
        case 'createAcadYear': {
            return [
                check('acadYear').not().isEmpty().withMessage('acadYear Name not be empty'),
                check('startDate').not().isEmpty().withMessage('startDate must not be empty'),
                check('endDate').not().isEmpty().withMessage('endDate  must not be empty'),
            ]
        }

        case 'JsonValidator': {
            return (req, res, next) => {
                let jsonreq = JSON.parse(req.body.inputJSON);
                let done = false
                let keyval = [];
                for (let data of jsonreq) {
                    console.log('data:::::::::::>>>',data)
                    for (let key in data) {
                        if (!data[key]) {
                            let obj = {
                                "": key + ` must not be empty`
                            }
                            done = false
                            keyval.push(obj)
                            break;
                        } else {
                            done = true
                            console.log('NExt', data[key])
                        }
                    }
                }
                if (done) {
                    console.log('Success:::::::::>>')
                    next()
                } else {
                    console.log('Fail::::::::::::>>')
                    res.status(403).json({
                        status: 403,
                        description: 'All fields are mandatory',
                        data: keyval
                    })
                }
            };
        }


        case 'isArrayNumber':{
            return (req, res, next) => {
                let jsonreq = JSON.parse(req.body.array);
                let done = false
                let keyval = [];
                for (let data of jsonreq) {
                    console.log('data:::::::::::>>>',parseInt(data))
                    if (isNaN(data)) {
                        let obj = {
                            "": data + ` Must be Number`
                        }
                        done = false
                        keyval.push(obj)
                        break;
                    } else {
                         
                        done = true
                        console.log('NExt', data)
                    }
                }
                if (done) {
                    console.log('Success:::::::::>>')
                    next()
                } else {
                    console.log('Fail::::::::::::>>')
                    res.status(403).json({
                        status: 403,
                        description: 'All fields are mandatory',
                        data: keyval
                    })
                }
            }
        }
     

        case 'createSlug': {
            return [
                check('slugName').not().isEmpty().withMessage('slug name not be empty'),
                check('campusId').not().isEmpty().withMessage('campusId must not be empty'),
                check('orgId').not().isEmpty().withMessage('Organization must not be empty'),
            ]
        }

        case 'updateSlug': {
            return [
                check('slugid').not().isEmpty().withMessage('slugid must not be empty').isNumeric().withMessage('slugid must be number only'),
                check('slugName').not().isEmpty().withMessage('slug name not be empty'),
                check('campusId').not().isEmpty().withMessage('campusId must not be empty'),
                check('orgId').not().isEmpty().withMessage('Organization must not be empty'),
            ]
        }

        case 'createCancellationreasons': {
            return [
                check('typeOfCancellation').not().isEmpty().withMessage('Type of cancellation must not be empty'),
                check('reasonText').not().isEmpty().withMessage('Reason must not be empty'),
                check('sapId').not().isEmpty().withMessage('sapId must not be empty').isNumeric().withMessage('sapId must be number only')
            ]
        }

        case 'updateCancellationreasons': {
            return [
                check('cancellationId').not().isEmpty().withMessage('Cancellation id must not be empty').isNumeric().withMessage('sapId must be number only'),
                check('typeOfCancellation').not().isEmpty().withMessage('Type of cancellation must not be empty'),
                check('reasonText').not().isEmpty().withMessage('Reason must not be empty'),
                check('sapId').not().isEmpty().withMessage('sapId must not be empty').isNumeric().withMessage('sapId must be number only')
            ]
        }

        case 'createRoomType': {
            return [
                check('roomName').not().isEmpty().withMessage('Room name must not be empty'),
                check('description').not().isEmpty().withMessage('Description must not be empty')
            ]
        }

        case 'updateRoomType': {
            return [
                check('roomtypeid').not().isEmpty().withMessage('roomtypeid must not be empty'),
                check('roomName').not().isEmpty().withMessage('Room name must not be empty'),
                check('description').not().isEmpty().withMessage('Description must not be empty')
            ]
        }


        case 'updateRoom': {
            return [
                check('roomid').not().isEmpty().withMessage('roomId must not be empty').isNumeric().withMessage('roomId must be number only'),
                check('room_number').not().isEmpty().withMessage('roomNo must not be empty'),
                check('buildingId').not().isEmpty().withMessage('building name must not be empty'),
                check('roomtypeId').not().isEmpty().withMessage('roomType must not be empty'),
                check('floor_number').not().isEmpty().withMessage('floor must not be empty').isNumeric().withMessage('floorNo must be number only'),
                check('capacity').not().isEmpty().withMessage('capacity must not be empty').isNumeric().withMessage('capacity must not be empty'),
                check('handledBy').not().isEmpty().withMessage('handledBy must not be empty'),
                check('is_basement').not().isEmpty().withMessage('isBasement must not be empty'),
                check('campusId').not().isEmpty().withMessage('campus must not be empty'),
                check('start_time').not().isEmpty().withMessage('startTime must not be empty'),
                check('end_time').not().isEmpty().withMessage('endTime must not be empty')
            ]
        }

        case 'createRoomTransType': {
            return [
                check('rtsName').not().isEmpty().withMessage('Room Transaction Type must not be empty'),
                check('description').not().isEmpty().withMessage('Description must not be empty')
            ]
        }

        case 'Holiday': {
            return [
                check('name').not().isEmpty().withMessage('Name must not be empty'),
                check('description').not().isEmpty().withMessage('Description must not be empty')
            ]
        }

        case 'FacultyType': {
            return [
                check('name').not().isEmpty().withMessage('Name must not be empty'),
                check('description').not().isEmpty().withMessage('Description must not be empty')
            ]
        }

        case 'SessionType': {
            return [
                check('name').not().isEmpty().withMessage('Name must not be empty'),
                check('description').not().isEmpty().withMessage('Description must not be empty')
            ]
        }

        case 'EventType': {
            return [
                check('name').not().isEmpty().withMessage('Name must not be empty'),
                check('abbr').not().isEmpty().withMessage('Abbr must not be empty').isLength({
                    min: 1,
                    max: 4
                }).withMessage('Abbr must be between 1 and 4 characters')
            ]
        }

        case 'updateRoomTransType': {
            return [
                check('rtsId').not().isEmpty().withMessage('roomTransactionTypeId must not be empty'),
                check('rtsName').not().isEmpty().withMessage('Room Transaction type must not be empty'),
                check('description').not().isEmpty().withMessage('Description must not be empty')

            ]
        }

        case 'createDivision': {
            return [
                check('courseId').not().isEmpty().withMessage('Course must not be empty'),
                check('division').not().isEmpty().withMessage('Division must not be empty'),
                check('divisionNum').not().isEmpty().withMessage('division number must not be empty').isNumeric().withMessage('DivisionNum must be an integer'),
                check('divisionCount').not().isEmpty().withMessage('Division Count must not be empty').isNumeric().withMessage('DivisionCount must be an integer'),
                check('countTheoryBatch').not().isEmpty().withMessage('countTheoryBatch must not be empty').isNumeric().withMessage('countTheoryBatch must be an integer'),
                check('countPracticalBatch').not().isEmpty().withMessage('countPracticalBatch must not be empty').isNumeric().withMessage('countPracticalBatch must be number'),
                check('countTutorialBatch').not().isEmpty().withMessage('countTutorialBatch must not be empty').isNumeric().withMessage('countTutorialBatch must be an integer'),
                check('countWorkshopBatch').not().isEmpty().withMessage('countWorkshopBatch must not be an empty').isNumeric().withMessage('countWorkshopBatch must not be an integer'),

            ]
        }

        case 'updateDivision': {
            return [
                check('id').not().isEmpty().withMessage('id must not be empty').isNumeric().withMessage('Id must be an integer'),
                check('courseId').not().isEmpty().withMessage('Course must not be empty'),
                check('division').not().isEmpty().withMessage('Division must not be empty'),
                check('divisionNum').not().isEmpty().withMessage('division number must not be empty').isNumeric().withMessage('DivisionNum must be an integer'),
                check('divisionCount').not().isEmpty().withMessage('Division Count must not be empty').isNumeric().withMessage('DivisionCount must be an integer'),
                check('countTheoryBatch').not().isEmpty().withMessage('countTheoryBatch must not be empty').isNumeric().withMessage('countTheoryBatch must be an integer'),
                check('countPracticalBatch').not().isEmpty().withMessage('countPracticalBatch must not be empty').isNumeric().withMessage('countPracticalBatch must be number'),
                check('countTutorialBatch').not().isEmpty().withMessage('countTutorialBatch must not be empty').isNumeric().withMessage('countTutorialBatch must be an integer'),
                check('countWorkshopBatch').not().isEmpty().withMessage('countWorkshopBatch must not be an empty').isNumeric().withMessage('countWorkshopBatch must not be an integer'),
            ]
        }




        case 'createRtstage': {
            return [
                check('rtsName').not().isEmpty().withMessage('Room name must not be empty'),
                check('description').not().isEmpty().withMessage('Description must not be empty')
            ]
        }

        case 'updateRtstage': {
            return [
                check('rtsName').not().isEmpty().withMessage('Room transaction type must not be empty'),
                check('description').not().isEmpty().withMessage('Description must not be empty')
            ]
        }

        case 'createRtypes': {
            return [
                check('rtsName').not().isEmpty().withMessage('Room transaction stage must not be empty'),
                check('description').not().isEmpty().withMessage('Description must not be empty')
            ]
        }

        case 'updateRtypes': {
            return [
                check('rtsId').not().isEmpty().withMessage('Room transaction id must not be empty'),
                check('rtsName').not().isEmpty().withMessage('Room transaction stage must not be empty'),
                check('description').not().isEmpty().withMessage('Description must not be empty')
            ]
        }

        case 'createBookingRejectionReasons': {
            return [
                check('reason').not().isEmpty().withMessage('Room Cancellation Reason stage must not be empty')
            ]
        }

        case 'updateBookingRejectionReasons': {
            return [
                check('Id').not().isEmpty().withMessage('Room Cancellation Reason id must not be empty'),
                check('reason').not().isEmpty().withMessage('Room Cancellation Reason stage must not be empty')
            ]
        }

        case 'search': {
            return [
                [check('keyword', 'Input field must not be empty').exists().trim().escape()]
            ]
        }

        case 'delete': {
            return [check('Id', 'Parameter must not be empty while deleteting records').not().isEmpty().exists().trim().escape()]
        }

        case 'single': {
            return [check('Id', 'Parameter must not be empty while fetching record').not().isEmpty().exists().trim().escape()]
        }

        case 'pagination': {
            return [check('pageNo', 'Invalid Page No').exists().trim().escape()]
        }

        case 'createSlotIntrTime': {
            return [
                check('slotName').not().isEmpty().withMessage('SlotName must not be empty'),
                check('startTime').not().isEmpty().withMessage('StartTime must not be empty'),
                check('endTime').not().isEmpty().withMessage('EndTime must not be empty')
            ]
        }

        case 'updateSlotIntrTime': {
            return [
                check('id').not().isEmpty().withMessage('id must not be empty'),
                check('slotName').not().isEmpty().withMessage('SlotName must not be empty'),
                check('startTime').not().isEmpty().withMessage('StartTime must not be empty'),
                check('endTime').not().isEmpty().withMessage('EndTime must not be empty')
            ]
        }

        case 'createSlotIntrSetting': {
            return [
                check('name').not().isEmpty().withMessage('Slot Setting Name must not be empty'),
                check('startDate').not().isEmpty().withMessage('Start Date must not be empty'),
                check('endDate').not().isEmpty().withMessage('EndDate must not be empty'),
                check('intervalInMins').not().isEmpty().withMessage('IntervalInMins must not be empty')
            ]
        }

        case 'updateSlotIntrSetting': {
            return [
                check('id').not().isEmpty().withMessage('Slot Setting id Name must not be empty'),
                check('name').not().isEmpty().withMessage('Slot Setting Name must not be empty'),
                check('startDate').not().isEmpty().withMessage('Start Date must not be empty'),
                check('endDate').not().isEmpty().withMessage('EndDate must not be empty'),
                check('intervalInMins').not().isEmpty().withMessage('IntervalInMins must not be empty').isNumeric().withMessage('IntervalInMins must be number only')
            ]
        }

        case 'createSession': {
            return [
                check('acadSession').not().isEmpty().withMessage('Academic session must not be empty')
            ]
        }

        case 'updateSession': {
            return [
                check('acadSessionId').not().isEmpty().withMessage('Academic session acadSessionId must not be empty'),
                check('acadSession').not().isEmpty().withMessage('Academic session must not be empty')
            ]
        }
        case 'createRoom': {
            return [
                body().isArray(),
                body('*.roomNo', 'Room No must be a number').exists().not().isEmpty().isNumeric(),
                body('*.roomType', 'Room Type field must a number').exists().not().isEmpty()
            ]
        }

        case 'createDivBatch': {
            return [
                check('divisionId').not().isEmpty().withMessage('Division must not be empty'),
                check('batch').not().isEmpty().withMessage('batch must not be empty'),
                check('eventType').not().isEmpty().withMessage('eventType must not be empty'),
                check('divisionCount').not().isEmpty().withMessage('divisionCount must not be empty'),
                check('batchCount').not().isEmpty().withMessage('batchCount must not be empty').isNumeric().withMessage('batchCount must be an integer'),
                check('inputBatchCount').not().isEmpty().withMessage('inputBatchCount must not be empty').isNumeric().withMessage('inputBatchCount must be an integer'),
                check('facultyCount').not().isEmpty().withMessage('facultyCount must not be empty').isNumeric().withMessage('facultyCount must be an integer')
            ]
        }

        case 'updateDivBatch': {
            return [
                check('id').not().isEmpty().withMessage('Id must not be empty').isNumeric().withMessage('Id must be an integer'),
                check('divisionId').not().isEmpty().withMessage('Division must not be empty'),
                check('batch').not().isEmpty().withMessage('batch must not be empty'),
                check('eventType').not().isEmpty().withMessage('eventType must not be empty'),
                check('divisionCount').not().isEmpty().withMessage('divisionCount must not be empty'),
                check('batchCount').not().isEmpty().withMessage('batchCount must not be empty').isNumeric().withMessage('batchCount must be an integer'),
                check('inputBatchCount').not().isEmpty().withMessage('inputBatchCount must not be empty').isNumeric().withMessage('inputBatchCount must be an integer'),
                check('facultyCount').not().isEmpty().withMessage('facultyCount must not be empty').isNumeric().withMessage('facultyCount must be an integer')
            ]
        }

        case 'createProgramType': {
            return [
                check('programName').not().isEmpty().withMessage('programName must not be empty')
            ]
        }

        case 'updateProgramType': {
            return [
                check('id').not().isEmpty().withMessage('id must not be empty').isNumeric().withMessage('id must be an integer'),
                check('programName').not().isEmpty().withMessage('programName must not be empty')
            ]
        }

        case 'createTodos': {
            return [
                check('task').not().isEmpty().withMessage('task must not be empty'),
                check('description').not().isEmpty().withMessage('description must not be empty'),
                check('tags').not().isEmpty().withMessage('tags must not be empty')
            ]
        }

        case 'updateTodos': {
            return [
                check('id').not().isEmpty().withMessage('id must not be empty').isNumeric().withMessage('id must be an integer'),
                check('task').not().isEmpty().withMessage('task must not be empty'),
                check('description').not().isEmpty().withMessage('description must not be empty'),
                check('tags').not().isEmpty().withMessage('tags must not be empty')
            ]
        }

        case 'SessionDate': {
            // return[
            //     check('acadSession').not().isEmpty().trim().escape().withMessage('Acad Session must not be empty'),
            //     check('sessionType').not().isEmpty().trim().escape().withMessage('Session type must not be empty'),
            //     check('startDate').not().isEmpty().trim().escape().withMessage('Start Date must not be empty'),
            //     check('endDate').not().isEmpty().trim().escape().withMessage('End Date must not be empty'),
            //     check('endDate').isAfter(new Date('startDate').toDateString()).withMessage('End date of lab must be valid and after start date')
            // ]


            return [
                check('acadSession').not().isEmpty().trim().escape().withMessage('Acad Session must not be empty'),
                check('sessionType').not().isEmpty().trim().escape().withMessage('Session type must not be empty'),
                check('startDate').not().isEmpty(),
                check('startDate').not().isEmpty(),

                check('endDate').custom((value, {
                    req,
                    res
                }) => {
                    if (value >= req.body.startDate) {
                        console.log('>>>>>>>>>>>>> ENTER HERE')
                        return true;
                    } else {
                        return false;
                    }
                }).withMessage('Start date cannot be greater than end date.')


            ]

            // return (req, res, next) => {
            //     check('acadSession').not().isEmpty().trim().escape().withMessage('Acad Session must not be empty'),
            //     check('sessionType').not().isEmpty().trim().escape().withMessage('Session type must not be empty')

            //     if (req.body.startDate <= req.body.endDate) {
            //         console.log('True')
            //     } else {
            //         console.log('FALSE')
            //     }
            // }
        }

        case 'SessionDateUpdate': {
            return [
                check('id').not().isEmpty().trim().escape().isNumeric().withMessage('Id must not be empty'),
                check('acadSession').not().isEmpty().trim().escape().withMessage('Acad Session must not be empty'),
                check('sessionType').not().isEmpty().trim().escape().withMessage('Session type must not be empty'),
                check('startDate').not().isEmpty().trim().escape().withMessage('Start Date must not be empty'),
                check('endDate').not().isEmpty().trim().escape().withMessage('End Date must not be empty'),

            ]
        }

      

        default: {
            return "No Validation Found"
        }


    }
}