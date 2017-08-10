const osrsge = require("./../osrs-ge/osrs-ge.js");
const database = require("./../database/database.js");
const moment = require("moment");
const ProgressBar = require('progress');
const request = require("request");

var summary = () => {
  osrsge.summary().then((summary) => {
    var keys = Object.keys(summary);
    var count = 0;
    keys.forEach((key) => {
      var item = summary[key];
      console.log(item);
      database.getItem({ id: item.id }).then((result) => {
        if (result !== null) {
          console.log("Members? ", item.members);
          result.members = item.members;
        } else {
          result = {
            id : item.id,
            name : item.name,
            members : item.members
          };
        }
        return database.insertItem(result);
      }).then(() => {
        count++;
        if (count === keys.length - 1) {
          console.log("complete");
        }
      }).catch((error) => {
        console.log("Error updating item.", error);
        count++;
      });
    });
  });
}

var monitor = (initial) => {
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
          tick(bar, initial);
        }).catch((error) => {
          tick(bar, initial);
          console.log(`Error updating item ${ item.name }.`, error);
        });
      }, 100 * count);
    });
  }).catch((error) => {
    console.log("Error monitoring items", error);
  })
}

function tick(bar, initial) {
  bar.tick();
  if (bar.complete) {
    onComplete(initial);
  }
}

function onComplete(initial) {
  database.getAllItems().then((items) => {
    return database.insertDump(items);
  }).then((result) => {
    console.log(result);
    logNextUpdate();
    if (initial) {
      setInterval(() => {
        request("https://sheltered-lake-98277.herokuapp.com/");
        monitor(false);
      }, 300000);
    }
  }).catch((error) => {
    console.log("Error uploading dump to db", error);
  });
}

function logNextUpdate() {
  console.log("Next update: " + moment().add(10, 'minute').format('MMMM Do YYYY - hh:mm:ssa'));
}

module.exports = {
  monitor,
  summary
}
