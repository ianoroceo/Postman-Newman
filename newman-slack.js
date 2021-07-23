/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
/* eslint-disable valid-jsdoc */
require("dotenv").config();
const newman = require("newman");
const axios = require("axios");
// const argv = require('yargs').argv
const appRoot = require("app-root-path");
const config = require(appRoot + "/conf/conf.js");

const prettyMs = require("pretty-ms");

// TODO: this needs to be moved to env in the future
const uri =
  "aHR0cHM6Ly9ob29rcy5zbGFjay5jb20vc2VydmljZXMvVEdUTkdTSzVaL0IwMjhNNlBHMEFLL3RjbGUzZ2xyZXdIQXl0Qjc1WlA0cU5LQg==";

const CryptoJS = require("crypto-js");
const encrypt = CryptoJS.enc.Base64.parse(uri);
const url = encrypt.toString(CryptoJS.enc.Utf8);

const slackUrl = url;

const envRelease = process.env.RELEASE_RELEASENAME;
const releaseName = envRelease === undefined ? " " : envRelease;

const executeNewman = () => {
  return new Promise((resolve, reject) => {
    newman
      .run({
        collection: require(String(config.Collection)),
        environment: require(String(config.Environment)),
        timeoutRequest: 300000,
        timeoutScript: 300000,
        delayRequest: 1000,
        reporters: ["cli", "htmlextra", "junit"],
        reporter: {
          htmlextra: {
            export:
              "./report/" + config.ReportName + "_" + config.Label + ".html",
            title: config.ReportName + " " + config.Label,
            darkTheme: true,
            skipSensitiveData: false,
          },
          junit: {
            export:
              "./report/" + config.ReportName + "_" + config.Label + ".xml",
          },
        },
      })
      .on("start", function (_err, _args) {
        console.log("running a collection...");
      })
      .on("done", (err, summary) => {
        if (err) {
          return reject(err);
        }
        resolve(summary);
      });
  });
};

axios({
  method: "post",
  url: slackUrl,
  headers: { "Content-Type": "application/json" },
  data: {
    response_type: "in_channel",
    attachments: [
      {
        color: "good",
        title:
          config.ReportName +
          " Run Started " +
          " " +
          config.Label +
          " " +
          releaseName,
        mrkdwn: true,
        fields: [
          {
            value: `Your Summary Report for ${config.ReportName} will be with you _very_ soon`,
          },
        ],
      },
    ],
  },
})
  .then(() => executeNewman())
  .then((newmanResult) => {
    return new TestRunContext(newmanResult);
  })
  .then((context) => {
    return axios({
      method: "post",
      url: slackUrl,
      headers: { "Content-Type": "application/json" },
      data: context.slackData,
    });
  })
  .catch((err) => {
    axios({
      method: "post",
      url: slackUrl,
      headers: { "Content-Type": "application/json" },
      data: {
        response_type: "in_channel",
        attachments: [
          {
            color: "danger",
            title:
              config.ReportName +
              " Run Error" +
              " " +
              config.Label +
              " " +
              releaseName,
            fields: [
              {
                value: `${err}`,
              },
            ],
          },
        ],
      },
    });
  });
/**
 * Create data based on newman summary
 */
class TestRunContext {
  constructor(newmanResult) {
    this.environment = newmanResult.environment.name;
    this.iterationCount = newmanResult.run.stats.iterations.total;
    this.start = new Date(newmanResult.run.timings.started);
    this.end = new Date(newmanResult.run.timings.completed);
    this.responseAverage = newmanResult.run.timings.responseAverage;
    this.totalRequests = newmanResult.run.stats.tests.total;
    this.testResultTotal = newmanResult.run.stats.assertions.total;
    this.testResultFailed = newmanResult.run.stats.assertions.failed;
    this.failures = newmanResult.run.failures;
    this.skipped = newmanResult.skippedTests;
  }

  get percentagePassed() {
    return (
      (this.testResultTotal * 100) /
      (this.testResultTotal + this.testResultFailed)
    ).toFixed(2);
  }

  get envFileName() {
    return this.environment === undefined
      ? "No Environment file specified for the Newman Run"
      : this.environment;
  }

  get skippedList() {
    if (this.skipped === undefined) {
      return "No Skipped Tests";
    } else {
      return this.skipped.reduce(
        (accumulator, current) =>
          `${accumulator} *${current.item.name}:* _${current.assertion}_\n\n`,
        ""
      );
    }
  }

  get failsList() {
    return this.failures.length > 0
      ? this.failures.reduce(
          (accumulator, current) =>
            `${accumulator} *${current.error.name}:* ${current.error.test} - _${current.error.message}_\n\n`,
          ""
        )
      : "No Test Failures";
  }

  get totalAssertions() {
    if (this.skipped === undefined) {
      return this.testResultTotal;
    } else {
      return this.testResultTotal - this.skipped.length;
    }
  }

  get result() {
    return this.testResultFailed > 0 ? "Failed" : "Passed";
  }

  get runDuration() {
    return prettyMs(this.end - this.start);
  }

  get colour() {
    return this.testResultFailed > 0 ? "danger" : "good";
  }

  get averageResponseTime() {
    return prettyMs(this.responseAverage, { msDecimalDigits: 2 });
  }

  get slackData() {
    return {
      response_type: "in_channel",
      attachments: [
        {
          fallback: "Newman Run Summary",
          color: `${this.colour}`,
          title:
            "Summary Test Result " + " " + config.Label + " " + releaseName,
          title_link: "",
          text: `Total Run Duration: *${this.runDuration}*`,
          mrkdwn: true,
          fields: [
            {
              title: "No. Of Iterations ",
              value: `${this.iterationCount}`,
              short: true,
            },
            {
              title: "No. Of Requests",
              value: `${this.totalRequests}`,
              short: true,
            },
            {
              title: "No. Of Assertions",
              value: `${this.totalAssertions}`,
              short: true,
            },
            {
              title: "No. Of Failures",
              value: `${this.testResultFailed}`,
              short: true,
            },
            {
              title: "Av. Response Time",
              value: `${this.averageResponseTime}`,
              short: true,
            },
            {
              title: "Result",
              value: `${this.result}`,
              short: true,
            },
            {
              title: "Test Failures",
              value: `${this.failsList}`,
            },
          ],
        },
        // {
        //   'color': `${this.colour}`,
        //   'title_link': '',
        //   'mrkdwn': true,
        //   'fields': [
        //     {
        //       'title': 'Skipped Tests',
        //       'value': `${this.skippedList}`,
        //     },
        //   ],
        // },
      ],
    };
  }
}
