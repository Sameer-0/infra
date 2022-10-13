module.exports = function roomValidate(req, res, next) {
    
    let roomJson = JSON.parse(req.body.roomJson);
    // console.log(roomJson)
    let breakcode = 0
    for (let elem of roomJson) {
        // console.log('elem', elem)
        for (let key in elem) {
            if ((typeof elem == '!number') && !elem[key] || elem[key] === '' ||  elem[key] == null) {
                return res.json({
                    status: 400,
                    message: "Fields must not be empty"
                })
            }

        }
        if (breakcode) {

            break;

        }
        console.log('true')
        next()
    }

}