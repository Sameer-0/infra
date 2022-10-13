// const saltRounds = 10;
const express = require('express')
const session = require('express-session')
const {
    v4: uuidv4
} = require('uuid');
const {
    hashPassword,
    verifyPassword
} = require('../utils/hash')
const User = require('../models/User');
const USerPermission = require('../models/USerPermission');
const Settings = require('../models/Settings');
const {
    AccountVerification,
    SigninWithNewDevice
} = require('../utils/emailTemplate');
// const res = require('express/lib/response');
const {
    encrypt,
    decrypt
} = require('../utils/crypto')

const {
    RedisStore,
    redisClient
} = require('../../config/redis')


const {
    body,
    validationResult
} = require('express-validator');
const hash = require('../utils/hash');
const UserPermission = require('../models/USerPermission');
const Client = require('../models/Clients');
let store = new RedisStore({
    client: redisClient,
    ttl: 260
})

module.exports = {

    renderLoginPage: (req, res, next) => {
        res.render('login.ejs');
    },


    renderRegisterPage: (req, res, next) => {
        res.render('register.ejs')
    },

    registerUser: (req, res, next) => {
        // const hash = bcrypt.hashSync(req.body.password, saltRounds);
        // req.body.password = hash
        hash.hashPassword(req.body.password).then(result => {
            console.log('PAss:>:::', result)
            req.body.password = result
            console.log('haspass', result)
            User.addUser(req.body)
            res.redirect('/user/register')
        })


    },


    getProfile: (req, res, next) => {
        User.fetchUserById('session se id nikalo')
            .then(result => {
                // console.log(result)
                res.render("/management/room/index.ejs", {
                    userList: result.recordset
                })
            }).catch(err => {
                console.log(err)
            })
    },

    getUserById: (req, res, next) => {
        User.fetchUserById(req.body.id).then(result => {
            res.json({
                status: 200,
                message: 'User details are ready.',
                userData: result.recordset
            })
        })
    },

    updateUser: (req, res, next) => {
        User.updateUserById(req.body).then(result => {
            res.json({
                status: 200,
            })
        })
    },

    addUser: (req, res, next) => {
        // console.log('reqBody', req.body)
        User.addUser(req.body)
        res.json({
            status: 200,
            message: 'Ok'
        })
    },

    deleteUser: (req, res, next) => {
        console.log('reqBodyId', req.body.id)
        User.deleteUser(req.body.id).then(result => {
            res.json({
                status: 200,
                message: 'delete successfully',
            })
        })
    },

    authenticate: async (req, res, next) => {

        try {

            let userData = await User.getUserByUsername(req.body.username, res.locals.slug);

            console.log('HERE:::::::::::>>')

            if (userData.recordset.length == 0) {
                //return res.status(200).send('Invalid username or password..!');
                return res.render('login', {
                    message: "Invalid username or password"
                })
            }

            let isVerified = await verifyPassword(req.body.password, userData.recordset[0].password);

            console.log('isVerified>>>>> ', isVerified);

            if (isVerified === false) {
                return res.render('login', {
                    message: "Invalid username or password"
                })
            }

            // console.log(">>>>> userData.recordset[0].username : ", userData.recordset[0].username)
            // console.log(">>>>> userData.recordset[0].f_name : ", userData.recordset[0].f_name)
            // console.log(">>>>> userData.recordset[0].l_name : ", userData.recordset[0].l_name)
            // console.log(">>>>> userData.recordset[0].email : ", userData.recordset[0].email)
            req.session.userId = userData.recordset[0].id;
            req.session.username = userData.recordset[0].username;
            req.session.firstName = userData.recordset[0].f_name;
            req.session.lastName = userData.recordset[0].l_name;
            req.session.email = userData.recordset[0].email;
            req.session.subDomain = res.locals.slug;


            //let userModules = await User.getUserModules(userData.recordset[0].id, res.locals.slug);

            let userDataSet = await Promise.all([User.getUserModules(userData.recordset[0].id, res.locals.slug), UserPermission.getPermissionsByUserId(userData.recordset[0].id, res.locals.slug)]).then(results => results);

            //console.log('userDataSet::::::::::::::::>>>',userDataSet[1].recordset)

            req.session.permissions = userDataSet[1].recordset;

            req.session.modules = userDataSet[0].recordset;

            console.log('device:::::::::::>>', req.device.type.toUpperCase())
            console.log('is_trusted::::::::::::::::::>>>', req.body)
            console.log('Here: User Data:::::::::::::::>>>>', userData.recordset)

            // IF CHECKED WITH DEVICE TRUSTED
            if (req.body.is_trusted == "on") {
                req.session.usersecretkey = encrypt(uuidv4())
                    console.log('is checked:::::::::::>>')
                    const headers = {
                        ip: req.ip,
                        platform: req.headers["user-agent"]
                    };
                   
                console.log('Here: User Data:::::::::::::::>>>>', userData.recordset)
                //INSERT IN DATABASE
                let obj = {
                    userLid: userData.recordset[0].id,
                    clientSecret: encrypt(uuidv4()),
                    clientName: '',
                    clientOS: ''
                }

                Client.save(obj, res.locals.slug)
                Client.fetch(obj, res.locals.slug).then(result => {
                    console.log('Result::::::::::::::::::::::', result.recordset[0])
                })

                //SEND EMAIL IF LOGGEDIN WITH NEW DEVICE
                SigninWithNewDevice(userData.recordset[0].email, headers)
            }

            console.log('userDataSet[0].recordset:::::::::::::',userDataSet[0].recordset)


            if (userDataSet[0].recordset.length !== 0 && userDataSet[0].recordset[0].name.toLowerCase() == "management") {
                res.redirect('/management/dashboard');
            } else if (userDataSet[0].recordset.length !== 0 && userDataSet[0].recordset[0].name.toLowerCase() == "admin") {
                res.redirect('/admin/dashboard');
            } else {
                res.send('This user has no permissions.');
            }
        } catch (err) {
            console.log("Error catched: ", err);
        }

        // User.getUserByUsername(req.body.username, res.locals.slug).then(async result => {
        //     let userData = result.recordset[0]
        //     if (result.recordset.length > 0) {
        //         let isVerified = await verifyPassword(req.body.password, userData.password)

        //         console.log('isVerified>>>>> ', isVerified)

        //         if (isVerified === true) {

        //             console.log(">>>>>>>>>>>>> LOGIN SUCCESSFULL", userData)

        //             req.session.username = userData.username;
        //             req.session.firstName = userData.f_name;
        //             req.session.lastName = userData.l_name;
        //             req.session.email = userData.email;
        //             req.session.subDomain = res.locals.slug;

        //             if (userData.role.toLowerCase() == "management") {
        //                 res.redirect('/management/dashboard')
        //             } else if (userData.role.toLowerCase() == "admin") {
        //                 res.redirect('/admin/dashboard')
        //             } else {
        //                 res.redirect('404')
        //             }
        //         } else {
        //             res.redirect('/user/login')
        //         }
        //     } else {
        //         res.send('User not exit..!')
        //     }
        // }).catch(error => {
        //     res.status(500).send('Something went wrong..!', error)
        // })
    },

    dashboard: (req, res, next) => {
        console.log('Dash', req.session)
        res.render('dashboard.ejs', {
            username: req.session.username
        })
    },

    logout: (req, res) => {
        req.session.destroy(function (err) {
            res.redirect('/user/login')
        })
    }

}