const crypto = require("crypto")
const req = require('express/lib/request');
require('dotenv').config()


module.exports = {

    hashPassword:(password) => {
        return new Promise((resolve, reject) => {
            // generate random 16 bytes long salt
            const salt = crypto.randomBytes(16).toString("hex")
            crypto.scrypt(password, salt, 64, (err, derivedKey) => {
                if (err) reject(err);
                resolve(salt + ":" + derivedKey.toString('hex'))
            });
        })
    },

   verifyPassword: (password, hash) => {
        return new Promise((resolve, reject) => {
            const [salt, key] = hash.split(":")
            crypto.scrypt(password, salt, 64, (err, derivedKey) => {
                if (err) reject(err);
                resolve(key == derivedKey.toString('hex'))
            });
        })
    }

}





// ede5957a89ea630c96780ea0a00b4d86497dbe9c28e1d0ac7e10a2abd1ad2f1743f3bb80282b1944d577bb45fab0d038b6969ad3b6c2d13b3462ceaea349e39b
// ede5957a89ea630c96780ea0a00b4d86497dbe9c28e1d0ac7e10a2abd1ad2f1743f3bb80282b1944d577bb45fab0d038b6969ad3b6c2d13b3462ceaea349e39b