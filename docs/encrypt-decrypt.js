const CryptoJS = require("crypto-js");

const textString =
  "<PASTE THE WEBHOOK URL HERE> or Bearer <PASTE THE BOT USER OAUTH TOKEN HERE>";
const encrypt = CryptoJS.enc.Utf8.parse(textString);
const base64 = CryptoJS.enc.Base64.stringify(encrypt);

console.log(`Encrypyed = ${base64}`);

const decrypt = CryptoJS.enc.Base64.parse(base64);
const password = CryptoJS.enc.Utf8.stringify(decrypt);

console.log(`Decrypted = ${password}`);
