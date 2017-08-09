const url = "mongodb://heroku_7dl5lkqv:ukou49hgjq420huiga2stqspc5@ds157258.mlab.com:57258/heroku_7dl5lkqv";
const db = "items";
const moment = require('moment');

const mongoose = require("mongoose");
      mongoose.connect(url, { useMongoClient: true });
      mongoose.Promise = global.Promise;

const dumpSchema = mongoose.Schema({

  timestamp : {
    type : Number,
    required : true,
    default : moment()
  },

  dump : {
    type : Object,
    required : true
  }

});

const Dump = mongoose.model('Dump', dumpSchema);

var get = (options) => {
  options = !options ? {} : options;
  return Dump.findOne(options);
}

var update = (entry) => {
  var dump = new Dump({
    dump : entry
  });
  return dump.save().then((result) => {
    console.log("Saved dump to db");
    return new Promise((resolve, reject) => {
      resolve(entry);
    })
  }).catch((error) => {
    console.log("Error saving dump to db");
  });
}

module.exports = {
  get,
  update
}
