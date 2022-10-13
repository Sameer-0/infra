import { check, oneOf, validationResult } from 'express-validator';

import { getRoomTimimgs, roomStatus } from '../../../models/RoomStatus';


export function getPage(req, res) {

    Promise.all([getRoomTimimgs(res.body)]).then(result => {
        res.render('admin/rooms/status',
            {
                RoomTimings: result[0].recordset
                // breadcrumbs: req.breadcrumbs,
            });
    });
}
export function getStatus(req, res) {

    roomStatus(req.body)
        .then(result => {
            res.status(200).json(result.recordset);
        })
        .catch(error => {
            console.log('error:>>>>>>', error);
            if (isJsonString.isJsonString(error.originalError.info.message)) {
                console.log("error");
            }
            else {
                console.log("error2");
                res.status(500).json({
                    status: 500,
                    description: error.originalError.info.message,
                    data: []
                });
            }
        });
}