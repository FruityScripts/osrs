const osrsge = require("./../osrs-ge/osrs-ge.js");
const database = require("./../database/database.js");
const moment = require("moment");
const ProgressBar = require('progress');
const request = require("request");
const schedule = require("node-schedule");




var start = () => {
  monitor().then(() => {
    console.log("Scheduling monitor job");
    var rule = new schedule.RecurrenceRule();
        rule.minute = new schedule.Range(0, 59, 15);

    schedule.scheduleJob(rule, () => {
        monitor();
    });
  });
}

var monitor = () => {
  return new Promise((resolve, reject) => {
    database.getAllItems().then((items) => {
      var bar = new ProgressBar('Monitoring: [:bar] :percent% :current/:total :elapseds ', {
        complete: '=',
        incomplete: ' ',
        total: items.length
      });

      var count = 0;
      items.forEach((item) => {
        count++;
        setTimeout(() => {
          osrsge.guidePrice(item).then((result) => {
            return osrsge.margin(result);
          }).then((item) => {
            return database.insertItem(item);
          }).then((result) => {
            return tick(bar);
          }).then((result) => {
            if (result !== undefined) {
              logNextUpdate();
              resolve();
            }
          })
          .catch((error) => {
            tick(bar).then((result) => {
              if (result !== undefined) {
                logNextUpdate();
                resolve();
              }
            });
            console.log(`Error updating item ${ item.name }.`, error);
          });
        }, 100 * count);
      });
    }).catch((error) => {
      console.log("Error monitoring items", error);
    });
  });
}

function tick(bar) {
  return new Promise((resolve, reject) => {
    bar.tick();
    if (bar.complete) {
      resolve("Completed");
    }
  });
}

function logNextUpdate() {
  console.log("Next update: " + moment().add(10, 'minute').format('MMMM Do YYYY - hh:mm:ssa'));
}

module.exports = {
  start
}
