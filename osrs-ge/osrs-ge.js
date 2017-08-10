const cloudscraper = require('cloudscraper');
const ProgressBar = require('progress');

var guidePrice = (item) => {
  return new Promise((resolve, reject) => {
    if (item.id !== undefined) {
      const guidePrice = `https://api.rsbuddy.com/grandExchange?a=guidePrice&i=${ item.id }`;
      cloudscraper.request(
        {
          method: 'GET',
          url: guidePrice,
          timeout: 120000,
          headers:{
            'Connection': 'keep-alive'
          }
        }, (err, response, body) => {
            if (err) {
              reject(err);
            } else {
              try {
                var json = JSON.parse(body);
                item.buying = json.buying;
                item.selling = json.selling;
                item.buyTotal = json.buyTotal;
                item.sellTotal = json.sellTotal;
                resolve(item);
              } catch (e) {
                reject(`Unexpected response from OSBuddy on item ID: ${ item.id } `, e);
              }
            }
        });
      } else {
        reject("No item provided.");
      }
  });
}

var summary = () => {
  return new Promise((resolve, reject) => {
    const url = "https://rsbuddy.com/exchange/summary.json";
    cloudscraper.request(
      {
        method: 'GET',
        url: url,
        timeout: 60000
      }, (err, response, body) => {
          if (err) {
            reject(err);
          } else {
            resolve(JSON.parse(body));
          }
      });
  });
};

var margin = (guidePrice) => {
  return new Promise((resolve, reject) => {
    if (guidePrice !== undefined) {
      var buying = guidePrice.buying;
      var selling = guidePrice.selling;
      var margin =  (buying > 0 && selling > 0) ? selling - buying : 0;
      guidePrice.margin = margin;
      guidePrice.percent = margin !== 0 ? (margin / buying) * 100 : 0;
      resolve(guidePrice);
  } else {
    reject('Guide Price object is undefined');
  }
  });
};

module.exports = {
  summary,
  guidePrice,
  margin,
};
