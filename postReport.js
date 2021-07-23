const axios = require("axios");
require("dotenv").config();
const fs = require("fs");
const path = require("path");

const FormData = require("form-data");
const data = new FormData();

const appRoot = require("app-root-path");
const configuration = require(appRoot + "/conf/conf.js");

const envRelease = process.env.RELEASE_RELEASENAME;
const releaseName = envRelease === undefined ? " " : envRelease;

const authToken =
  "QmVhcmVyIHhveGItMjE2NzYxNjMzNi0yMzA3NzY0NjgwNjkxLWxTY1g2c0tQMGdUT3VrTFBkcFBlOWN5Tg==";
const CryptoJS = require("crypto-js");
const encrypt = CryptoJS.enc.Base64.parse(authToken);
const tokenD = encrypt.toString(CryptoJS.enc.Utf8);

const env = configuration.Label;

data.append(
  "file",
  fs.createReadStream(
    path.join(
      __dirname,
      `/report/Random Joke API Test_${env.toUpperCase()}.html`
    )
  )
);
data.append(
  "initial_comment",
  `This is the API Test HTML Report for ${env} - ${releaseName} :memo: Please download the File`
);
data.append("channels", "C029Q378J9W");

const config = {
  method: "post",
  url: "https://slack.com/api/files.upload",
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
  headers: {
    Authorization: tokenD,
    "Content-Type": "multipart/form-data;boundary=" + data.getBoundary(),
    ...data.getHeaders(),
  },
  data: data,
};
axios(config)
  .then(function (response) {
    console.log(JSON.stringify(response.data));
  })
  .catch(function (error) {
    console.log(error);
  });
