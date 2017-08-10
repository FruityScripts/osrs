const url = "mongodb://heroku_7dl5lkqv:ukou49hgjq420huiga2stqspc5@ds157258.mlab.com:57258/heroku_7dl5lkqv";
const db = "items";
const moment = require('moment');
const ProgressBar = require('progress');

const mongoose = require("mongoose");
      mongoose.connect(url, { useMongoClient: true });
      mongoose.Promise = global.Promise;

const { Item } = require("./item/Item.js");
const { Dump } = require("./dump/Dump.js");

var getLatestDump = (options) => {
  options = !options ? {} : options;
  return Dump.findOne(options, {}, { sort: { 'timestamp' : -1 } });
}

var getAllDumps = (options) => {
  options = !options ? {} : options;
  return Dump.findOne(options, {}, { sort: { 'timestamp' : -1 } });
}

var getItem = (options) => {
  options = !options ? {} : options;
  return Item.findOne(options, {}, { sort: { 'timestamp' : -1 } });
}

var getAllItems = (options) => {
  options = !options ? {} : options;
  return Item.find(options, {}, { sort: { 'timestamp' : -1 } });
}

var insertItem = (item) => {
  if (item !== undefined) {
    if (item.id && item.name) {
      return Item.update({id: item.id}, item, {
        upsert: true,
      });
    }
  }
}

var insertItems = (collection) => {
  return new Promise((resolve, reject) => {
    if (data !== undefined) {
      var bar = new ProgressBar('Scraping Prices [:bar] :elapsed :percent :current/:total', {
         complete: '=',
         incomplete: '-',
         total: data.length
       });
      for (var i = 0; i < data.length; i++) {
        var item = data[i];
        insert(item).then((result) => {
          bar.tick();
          if (bar.complete) {
            resolve(data);
          }
        }).catch(() => {
          reject("Error uploading item to database");
        });
      }
    } else {
      reject("Data provided is not valid");
    }
  });
}

var insertDump = (dump) => {
  var newDump = new Dump({ dump });
  return newDump.save();
}

module.exports = {
  getLatestDump,
  getAllDumps,
  getItem,
  getAllItems,
  insertItem,
  insertItems,
  insertDump,
}
