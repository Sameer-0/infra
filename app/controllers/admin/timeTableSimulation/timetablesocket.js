require('dotenv').config()
const TimeTable = require('../../../models/TimeTable');
const isJsonString = require('../../../utils/util')

module.exports.respond = async socket => {
    //On Client Join
    socket.on('join', function (data) {
        console.log(data);
    });


    //Schedule Event
    socket.on('schedule-event-request', async function (slug, userId, data) {
        console.log('schedule-event-request >>> ', data)

        if (data.actionType == 'allocate') {

            console.log('>>> ALLOCATE FIRED'); 

            TimeTable.scheduleEvent(slug, userId, data).then(result => {
                console.log('result::::::::', result)
            //SHOW CHANGES FOR ALL THE CONNECTED CLIENT EXCEPT CURRENT
            socket.broadcast.emit('schedule-event-response', {data: JSON.parse(result.output.output_json), actionType:'allocate', positionIndex:data.positionIndex})
            //SHOW CHANGES FOR CURRENT USER ONLY
            socket.emit('schedule-event-response', {data: JSON.parse(result.output.output_json), actionType:'allocate', positionIndex:data.positionIndex})
            
            }).catch(error => {
                console.log("ERROR>>>>>>> ", error.originalError.info.message)
                if (isJsonString.isJsonString(error.originalError.info.message)) {
                    socket.emit('schedule-event-response', JSON.parse(error.originalError.info.message))
                } else {
                    socket.emit('schedule-event-response', {
                        status: 500,
                        description: error.originalError.info.message,
                        data: []
                    })
                }
            })
        } else if (data.actionType == 'drag') {

            console.log('>>>DRAG FIRED');

            TimeTable.dragDropEvent(slug, userId, data).then(result => {
                console.log('result::::::::', result)

                 //SHOW CHANGES FOR ALL THE CONNECTED CLIENT EXCEPT CURRENT
                 socket.broadcast.emit('schedule-event-response', {data: JSON.parse(result.output.output_json), actionType:'drag'})
                 //SHOW CHANGES FOR CURRENT USER ONLY
                 socket.emit('schedule-event-response', {data: JSON.parse(result.output.output_json), actionType:'drag'})
                // socket.emit('schedule-event-response',  {data: JSON.parse(result.output.output_json), actionType:'drag'})

            }).catch(error => {

                console.log("ERROR>>>>>>> ", error.originalError.info.message)

                if (isJsonString.isJsonString(error.originalError.info.message)) {
                    socket.emit('schedule-event-response', JSON.parse(error.originalError.info.message))
                } else {
                    socket.emit('schedule-event-response', {
                        status: 500,
                        description: error.originalError.info.message,
                        data: []
                    })
                }
            })

        } else if (data.actionType == 'swap') {

            TimeTable.swapEvents(slug, userId, data).then(result => {
                console.log('result::::::::', result)

                //SHOW CHANGES FOR ALL THE CONNECTED CLIENT EXCEPT CURRENT
                socket.broadcast.emit('schedule-event-response', {data: JSON.parse(result.output.output_json), actionType:'swap', targetElemId:data.targetEventLid, initialPositionIndex:data.initialPositionIndex})
                //SHOW CHANGES FOR CURRENT USER ONLY
                socket.emit('schedule-event-response', {data: JSON.parse(result.output.output_json), actionType:'swap', targetElemId:data.targetEventLid, initialPositionIndex:data.initialPositionIndex})
            }).catch(error => {

                console.log("ERROR>>>>>>> ", error.originalError.info.message)

                if (isJsonString.isJsonString(error.originalError.info.message)) {
                    socket.emit('schedule-event-response', JSON.parse(error.originalError.info.message))
                } else {
                    socket.emit('schedule-event-response', JSON.parse({
                        status: 500,
                        description: error.originalError.info.message,
                        data: []
                    }))
                }
            })
        }

    })

    //Drop Event
    socket.on('drop-event-request', async function (slug, userId, eventid) {
        console.log('drop-event-request::::::::')
        TimeTable.dropEvent(slug, userId, eventid).then(result => {
            console.log('result::::::::', result)
            //SHOW CHANGES FOR ALL THE CONNECTED CLIENT EXCEPT CURRENT
            socket.broadcast.emit('drop-event-response', JSON.parse(result.output.output_json))
            //SHOW CHANGES FOR CURRENT USER ONLY
            socket.emit('drop-event-response', JSON.parse(result.output.output_json))
        }).catch(error => {
            console.log("ERROR>>>>>>> ", error)
            if (isJsonString.isJsonString(error.originalError.info.message)) {
                socket.emit('drop-event-response', JSON.parse(error.originalError.info.message))
            } else {
                socket.emit('drop-event-response', JSON.parse({
                    status: 500,
                    description: error.originalError.info.message,
                    data: []
                }))
            }
        })
    })
}