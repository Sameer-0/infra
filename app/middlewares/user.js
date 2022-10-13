const {
    RedisStore,
    redisClient,
    session
} = require('../../config/redis')

let store = new RedisStore({
    client: redisClient,
    ttl: 260
})

module.exports = {

    isLoggedIn: (req, res, next) => {
        let sessionId = req.sessionID;
        // console.log('sessionId is ====>>>>> ', sessionId)

        if (req.sessionID) {
            store.get(req.sessionID, async (err, result) => {
                //  console.log('isLoggedIn::::::::::::::::::>> ', err, result)
                if (!result) {
                    res.redirect('/user/login')
                } else {
                    res.locals.userId = result.userId
                    res.locals.firstName = result.firstName
                    next();
                }
            })
        } else {
            res.redirect('/user/login')
        }
    },

    redirectIfLoggedIn: (req, res, next) => {
        let sessionId = req.sessionID;
        //  console.log('sessionId is ====>>>>> ', sessionId);

        if (!req.sessionID) {
            return next();
        }

        store.get(req.sessionID, async (err, result) => {
           
           // console.log('redirectIfLoggedIn::::::::::::::::::>> ', req.session.cookie)
            if (!result) {
               //return res.redirect('/user/login')
               return next();
            }
            else{
                // console.log('redirect if loggedout result::::::::::::::::::>> ', result)
                // console.log('Logged out:::::::::>>')
                // setTimeout(function(){
                //     return res.redirect('/user/login')
                // },2000)
            }

            // if (result.modules.length > 1) {
            //     return res.redirect('/user/select-dashboard');
            // }

            if (result.modules.length > 0) {
                res.redirect(`/${result.modules[0].name}/dashboard`);
            } else {
                res.render('denied')
            }
        })
    },

    checkPermission: (req, res, next) => {
        // console.log('req.sessionID>>>>>>>>>>>>>> : ', req.sessionID)
        // console.log('endpoint>>>>>>>>>>>>>> : ', req.originalUrl)
        // console.log('method>>>>>>>>>>>>>> : ', req.method)
        let UserPermission = store.get(req.sessionID, async (err, result) => {
            if (result.permissions) {
                // console.log('Resulr::::::::::', result.permissions)
                // console.log('originalUrl::::::::::', req.Url)
                // console.log('originalUrl::::::::::', req._parsedOriginalUrl.pathname)
                // console.log('result.permissions::::::::::', result.permissions)
                // for (let permission of result.permissions) {
                //     console.log('permission url_path::::::::::', permission.url_path)
                //     if (permission.url_path === req._parsedOriginalUrl.pathname && permission.name === req.method) {
                //         return next();
                //     }
                // }
                return next(); //comment this line 
                //res.send('YOU DO NOT HAVE PERMISSION')
               // res.render('denied')
            }
        })
    }
}