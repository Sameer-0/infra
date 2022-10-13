const {
    RedisStore,
    redisClient
} = require('../../config/redis')
const {
    body,
    validationResult
} = require('express-validator');

let store = new RedisStore({
    client: redisClient,
    ttl: 260
})
const OrganizationSlug = require('../models/OrganizationSlug')


module.exports = {

    renderLoginPage: (req, res, next) => {

        console.log('sessionID: ', req.sessionID)
        console.log('sessionID: ', req.session)

        OrganizationSlug.fetchAll().then(result => {
            // console.log(result.recordset)
            res.render('login')
        })
        
    },

    postLogin: (req, res, next) => {

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false, 
                errors: errors.array()
            });
        }

        console.log(req.sessionID)
        console.log(req.session.name)

        req.session.username = req.body.username
        req.session.email = 'bkapilsharma@gmail.com'
        req.session.fName = 'Kapil'

        store.get(req.sessionID, async function (err, data) {
            let result = await data;
            console.log('Data: ', result)
        })
        res.redirect('/login')
    }
}