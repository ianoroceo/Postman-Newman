/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
/* eslint-disable valid-jsdoc */
const appRoot = require("app-root-path");
const newman = require("newman");
const config = require(appRoot + "/conf/conf.js");

console.log(config.Environment);
console.log(config.Collection);
console.log(config.Label);

newman
  .run({
    collection: require(String(config.Collection)),
    environment: require(String(config.Environment)),
    timeoutRequest: 60000,
    timeoutScript: 60000,
    delayRequest: 500,
    reporters: ["cli", "htmlextra", "junit"],
    reporter: {
      htmlextra: {
        export: "./report/" + config.ReportName + "_" + config.Label + ".html",
        title: config.ReportName + " " + config.Label,
        darkTheme: true,
        skipSensitiveData: false,
      },
      junit: {
        export: "./report/" + config.ReportName + "_" + config.Label + ".xml",
      },
    },
  })
  .on("start", function () {
    console.log("running a collection...");
  })
  .on("done", function (err, summary) {
    if (err || summary.error) {
      console.error("collection run encountered an error.");
    } else {
      console.log("collection run completed.");
    }
  });
