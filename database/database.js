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

const itemSchema = mongoose.Schema({
  id: {
    type : Number,
    required : true
  },

  name: {
    type : String,
    required : true
  },

  percent : {
    type : Number,
    default : 0,
  },

  margin : {
    type : Number,
    default : 0,
  },

  selling : {
    type : Number,
    default : 0,
  },

  buying : {
    type : Number,
    default : 0,
  },

  totalSelling : {
    type : Number,
    default : 0,
  },

  totalBuying : {
    type : Number,
    default : 0,
  },

}, {
  timestamps: true
});

const Item = mongoose.model("Item", itemSchema);

var get = (options) => {
  options = !options ? {} : options;
  return Dump.findOne(options, {}, { sort: { 'timestamp' : -1 } });
}

var insert = (item) => {
  if (item !== undefined) {
    return Item.update({name: item.name}, item, {
      upsert: true,
    });
  }
}

var dump = (data) => {
  return new Promise((resolve, reject) => {
    if (data !== undefined) {
      for (var i = 0; i < data.length; i++) {
        var item = data[i];
        insert(item).then((result) => {
          if (i === data.length - 1) {
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
  update,
  dump,
  insert,
}
