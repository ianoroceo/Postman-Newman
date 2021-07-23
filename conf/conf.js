/* eslint-disable max-len */
const appRoot = require("app-root-path");
const argv = require("yargs").argv;
const envToUse = argv.env;
const glob = require("glob");

switch (envToUse) {
  case "prod":
    Label = "PRODUCTION",
    Environment = glob.sync("./conf/environment/**/RandomJoke-PROD*");
    break;
  case "qa":
    Label = "QA",
    Environment = glob.sync("./conf/environment/**/RandomJoke-QA*");
    break;
  default:
    Label = "DEVELOPMENT",
    Environment = glob.sync("./conf/environment/**/RandomJoke-Dev*");
    break;
}

const config = {
  ReportName: "Random Joke API Test",
  Collection: glob.sync("./conf/collection/*collection.json"),
  Environment,
  Label,
};

module.exports = config;
