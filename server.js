const express = require('express');
const app = express();
require('dotenv').config()
const http = require('http');
const https = require("https");
const path = require('path');
const soap = require('soap');

const setRouter = require("./router")
const timetablesocket = require("./app/controllers/admin/timeTableSimulation/timetablesocket");
const rescheduleTimesheetControllersocket = require("./app/controllers/admin/rescheduling/rescheduleTimesheetControllersocket");
const {
    verifySubdomain
} = require('./app/middlewares/domain')
const {
    v4: uuidv4
} = require('uuid');

const {
    existsSync,
    mkdirSync,
    accessSync,
    readFileSync,
    constants,
    appendFile,
    writeFile
} = require('fs');


let sslOptions = {
    pfx: readFileSync(__dirname + `/cert/server.pfx`),
    passphrase: '1234'
};


//redis
const {
    RedisStore,
    redisClient,
    session
} = require('./config/redis')
const device = require('express-device');

app.use(express.json({
    limit: '50mb'
}));
app.use(
    express.urlencoded({
        extended: false,
    })
);

app.use(express.static('./public'));
app.set('views', './app/views');
app.set('view engine', 'ejs');


app.use(
    session({
        store: new RedisStore({
            client: redisClient,
            ttl: 260
        }),
        saveUninitialized: false,
        genid: function (req) {
            return uuidv4() // use UUIDs for session IDs
        },
        secret: process.env.COOKIE_SECRET,
        resave: false,
        name: 'token',
        cookie: {
            secure: false,
            maxAge: 24 * 60 * 60 * 1000, //24 hours
            httpOnly: false,
            sameSite: false,
            path: '/'
        }
    })
)

app.use('/set-token', (req, res) => {
    req.session.name = "Kapil Sharma"
    res.send('Token set')
})

get_breadcrumbs = function (url) {
    var rtn = [],
        acc = "", // accumulative url
        arr = url.substring(1).split("/");

    for (i = 0; i < arr.length; i++) {
        acc = i != arr.length - 1 ? acc + "/" + arr[i] : null;
        if (acc == '/management') {
            acc = '/management/dashboard'
        }
        if (acc == '/admin') {
            acc = '/admin/dashboard'
        }
        rtn[i] = {
            name: arr[i].toUpperCase(),
            url: acc
        };
        if (acc == '/management/dashboard') {
            acc = '/management'
        }
        if (acc == '/admin/dashboard') {
            acc = '/admin'
        }
    }
    // console.log('rtnnnn', rtn)
    return rtn;
};

app.use(function (req, res, next) {
    req.breadcrumbs = get_breadcrumbs(req.originalUrl);
    next();
});



app.use((req, res, next) => {
    if (!req.session) {
        return next(new Error('No session found!')) // handle error
    }
    next() // otherwise continue
})

app.use(verifySubdomain);
app.use(device.capture());

setRouter(app)


const sql = require('mssql')
const {
    poolConnection
} = require('./config/db');
require('dotenv').config();



// app.use(function (req, res) {
//     res.status(404).redirect('/user/login')
// })


// app.use((err, req, res, next) => {
//     console.log('=========================>>>>ERROR MIDDLEWARE<<<<==============================')
//     let logDir = process.env.LOG_DIR_PATH
//     let logFile = process.env.LOG_FILE_PATH
//     let fsErr = '';
//     let errMsg = err.stack;
//     let msg = `Opps! Something went wrong.`

//     console.log('Error midleware: ', errMsg)

//     try {

//       if (!existsSync(logDir) && !accessSync(logDir, constants.R_OK | constants.W_OK)) {
//         mkdirSync(logDir);
//       }
//       let currentDate = new Date();
//       let errStr = `${currentDate}: \n Request URL - ${req.hostname + req.url} \n ${errMsg} \n -------------- \n`

//       appendFile(logFile, errStr, err => {
//         if (err) throw err;
//       })

//     } catch (e) {
//       fsErr += e;
//       console.log("catched error====>>> ", e)
//     }

//     console.log('File err===>>> ', fsErr)
//     console.log("Request type ===============================>>>>>", req.xhr)

//     if (req.xhr) {

//       res.status(500).json({
//         msg: msg + fsErr
//       })
//     } else {
//       res.status(500).render('message/error', {
//         msg: msg + fsErr
//       })
//     }
//   })




if (process.env.APP_ENV === 'PRODUCTION' || process.env.APP_ENV === 'DEV') {
    const server = https.createServer(sslOptions, app).listen(process.env.APP_PORT);
    //socket initialization
    global.io = require("socket.io")(server);
    //SOCKET CONNECTION
    global.io.on("connection", timetablesocket.respond);
    global.io.on("connection", rescheduleTimesheetControllersocket.respond)
}

else {
    const server = http.createServer(app).listen(process.env.APP_PORT);
    //socket initialization
    global.io = require("socket.io")(server);
    //SOCKET CONNECTION
    global.io.on("connection", timetablesocket.respond);
    global.io.on("connection", rescheduleTimesheetControllersocket.respond)
}