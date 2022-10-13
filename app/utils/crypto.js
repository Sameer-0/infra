const crypto = require("crypto");
const algorithm = "aes-256-cbc"; 
// generate 16 bytes of random data
const initVector = crypto.randomBytes(16);
const Securitykey = crypto.randomBytes(32);
const encrypt = (text) => {
    // secret key generate 32 bytes of random data
   
    // the cipher function
    const cipher = crypto.createCipheriv(algorithm, Securitykey, initVector);
    // encrypt the message
    // input encoding
    // output encoding
    let encryptedData = cipher.update(text, "utf-8", "hex");
    encryptedData += cipher.final("hex");
    return encryptedData
};

const decrypt = (encryptedData) => {
    const decipher = crypto.createDecipheriv(algorithm, Securitykey, initVector);
    let decryptedData = decipher.update(encryptedData, "hex", "utf-8");
    decryptedData += decipher.final("utf8");
    return decryptedData;
};

module.exports = {
    encrypt,
    decrypt
};