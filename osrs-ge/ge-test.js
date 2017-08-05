const osrsge = require("./osrs-ge.js");
const ProgressBar = require('progress');
const fs = require("fs");
const path = require('path');
const moment = require('moment');
const _ = require('lodash');
const { MongoClient, ObjectID } = require("mongodb");
const http = require("http");

const PastebinAPI = require('pastebin-js');
const pastebin = new PastebinAPI({
      'api_dev_key' : '655894ae195266b2de3e0e98965d6a04',
      'api_user_name' : 'OSRSMargins',
      'api_user_password' : 'elephants2010'
    });

const Twitter = require('twitter');
const tweeter = new Twitter({
  consumer_key: 'mml9xWs35vt2N3XGxzH4dtw0H',
  consumer_secret: 'Wz7T34mIb5TYE74O2RfFISVtoS1QPRCrysEhLgDgYxZYCZk19F',
  access_token_key: '892738284924829696-XdazjVTnBdPoBGUDADDJBIGd8Yuciw9',
  access_token_secret: 'fpFyfMijkBRR3XHMX73nybxLCnE0vE558k03A6IsP07RD'
});

// test(true);

function test(initial) {
  osrsge.summary().then((result) => {
    var keys = Object.keys(result);
    var arr = [];
    var count = 0;

    var bar = new ProgressBar('Scraping Prices [:bar] :rate/bps :percent :current/:total', {
       complete: '=',
       incomplete: '-',
       total: keys.length
     });

    keys.forEach((key) => {
      count++;
      setTimeout(() => {
        osrsge.guidePrice(result[key].id, result[key]).then((result) => {
          var formatted = {
            id : result.obj.id,
            name : result.obj.name,
            totalBuying : result.body.buyingQuantity,
            totalSelling : result.body.sellingQuantity,
            buying : result.body.buying,
            selling : result.body.selling
          }
          return osrsge.margin(formatted);
        }).then((result) => {
          arr.push(result);
          tick(bar, arr, initial);
        }).catch((error) => {
          tick(bar, arr, initial);
          console.log(error);
        });
      }, 50 * count);

    });
  }).catch((error) => {
    console.log(error);
  });
}

function tick(bar, arr, initial) {
  return new Promise((resolve, reject) => {
    bar.tick();
    if (bar.complete) {
      sort(arr).then((result) => {
        return paste(result);
      }).then((result) => {
        return tweet(result);
      }).then((result) => {
        if (result !== undefined) {
          console.log("Next update: " + moment().add(15, 'minute').format('MMMM Do YYYY - hh:mm:ssa'));
          if (initial) {
            setInterval(() => {
                http.get("https://sheltered-lake-98277.herokuapp.com/");
            }, 300000);

            setInterval(() => {
              test();
            }, 900000);
          }
        }
      }).catch((error) => {
        reject(error);
      });
    }
  });
}

function sort(data) {
  return new Promise((resolve, reject) => {
    data = _.filter(data, (item) => {
      return item.margin !== undefined && item.margin > 0;
    });
    data = _.reverse(_.sortBy(data, "margin"));
    resolve(data);
  });
}

function updateDatabase(data) {

}

function tweet(paste) {
  console.log("Paste: " + paste);
  var tweet = "OSRS Margins: " + paste;
  return tweeter.post('statuses/update', {status: tweet});
}

function paste(data) {
  var timestamp = moment().format('MMMM Do YYYY - hh.mm.ssa');
  var path = `osrs-ge/dumps/${timestamp}.txt`;



  fs.writeFileSync(path, JSON.stringify(data, undefined, 2));
  return pastebin.createPasteFromFile(path, `@OSRSMargins - ${ timestamp }`, "json", 3, "N");
}

module.exports = {
  test
}
