const osrsge = require("./osrs-ge.js");
const database = require("./../database/database.js");

const ProgressBar = require('progress');
const fs = require("fs-extra");
const path = require('path');
const moment = require('moment');
const _ = require('lodash');
const request = require("request");

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

function monitor(initial) {
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
          tick(bar, arr, initial).catch((error) => {
            console.log(error);
          });;
        }).catch((error) => {
          tick(bar, arr, initial).catch((error) => {
            console.log(error);
          });
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
      var highest = [];
      sort(arr).then((result) => {
        highest = result.best;
        return updateDatabase(result.data);
      }).then((result) => {
          return save(result.dump);
      }).then((result) => {
        return paste(result.path, result.timestamp);
      }).then((result) => {
        if (result !== undefined) {
          if (initial) {
            console.log("Next update: " + moment().add(15, 'minute').format('MMMM Do YYYY - hh:mm:ssa'));
            setInterval(() => {
                request("https://sheltered-lake-98277.herokuapp.com/");
            }, 300000);

            setInterval(() => {
              monitor();
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
    var best = data.slice(0, 1);
    resolve({
      data,
      best
    });
  });
}

function updateDatabase(dump) {
  return database.update(dump);
}

function tweet(paste, highest) {
  var tweet = "";
  if (highest !== undefined) {
    highest = highest[0];
    var buy = numberWithCommas(highest.buying);
    var sell = numberWithCommas(highest.selling);
    var margin = numberWithCommas(highest.margin);
    var percent = highest.percent;
    tweet = tweet + `#1 - ${ highest.name } - Buy: ${ buy } - Sell: ${ sell } - Margin: ${ margin } (${ percent.toFixed(2) }%) \n`
  }

  tweet = tweet + "Full List: " + paste + "\n #OSRSMargins";
  return tweeter.post('statuses/update', {status: tweet});
}

function save(data) {
    var timestamp = moment().format('MMMM Do YYYY - hh.mm.ssa');
    var path = `osrs-ge/dumps/${timestamp}.json`;

    return new Promise((resolve, reject) => {
      fs.writeJson(path, data, { spaces : '\t' }).then((result) => {
        resolve({path, timestamp});
      }).catch((error) => {
        reject(error);
      });
    });

}

function paste(path, timestamp) {
  return pastebin.createPasteFromFile(path, `@OSRSMargins - ${ timestamp }`, "json", 3, "N");
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


module.exports = {
  monitor
}
