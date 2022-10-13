const crypto = require("crypto")
const req = require('express/lib/request');
require('dotenv').config()



    const hashPassword = (password) => {
        return new Promise((resolve, reject) => {
            // generate random 16 bytes long salt
            const salt = crypto.randomBytes(16).toString("hex")
            crypto.scrypt(password, salt, 64, (err, derivedKey) => {
                if (err) reject(err);
                resolve(salt + ":" + derivedKey.toString('hex'))
            });
        })
    }

hashPassword('password@1234').then(res => {
    console.log(res)
})

// f34949a28b010a9b45c47e504129edd6:2bbcb7d8f504161dd5d40cae628eff245324411282e98c38cac7b6b3d4a0d11cc8587a8e7394fb427759912e16fa56bc17734b81ffab881736ead6e403d434a8