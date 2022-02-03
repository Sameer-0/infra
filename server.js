const express = require('express');
const bodyParser = require('body-parser')
const app = express();
require('dotenv').config()
const http = require('http');
const path = require('path');
const setRouter = require("./router")
const {verifySubdomain} = require('././app/middlewares/domain')
//const https = require("https");
const {
    existsSync,
    mkdirSync,
    accessSync,
    readFileSync,
    constants,
    appendFile
} = require('fs');

//redis
const {
    RedisStore,
    redisClient,
    session
} = require('./config/redis')


app.use(express.json());
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
        saveUninitialized: true,
        secret: process.env.COOKIE_SECRET,
        resave: false,
        name: 'token',
        cookie: {
            secure: false,
            maxAge: 1000 * 60 * 30,
            httpOnly: false,
            domain: 'localhost',
            sameSite: true,
        }
    })
)


app.use((req, res, next) => {
    if (!req.session) {
        return next(new Error('No session found!')) // handle error
    }
    next() // otherwise continue
})

app.use(verifySubdomain);

app.get('/logout', (req, res, next) => {
    req.session.destroy(function (err) {
        res.redirect('/login')
    })
})

setRouter(app)

app.listen(process.env.APP_PORT, () => console.log('Server started at port: ', process.env.APP_PORT))


