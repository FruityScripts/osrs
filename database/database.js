const url = "mongodb://heroku_7dl5lkqv:ukou49hgjq420huiga2stqspc5@ds157258.mlab.com:57258/heroku_7dl5lkqv";
const db = "items";

const mongoose = require("mongoose");
      mongoose.connect(url, { useMongoClient: true });
      mongoose.Promise = global.Promise;

const dumpSchema = mongoose.Schema({

  timestamp : {
    type : Number,
    required : true,
    default : Date.now()
  },

  dump : {
    type : Object,
    required : true
  }

});

const Dump = mongoose.model('Dump', dumpSchema);

var get = (options) => {
  options = !options ? {} : options;
  return Dump.find(options);
}

var update = (entry) => {
  var dump = new Dump({
    dump : entry
  });
  return dump.save();
}

module.exports = {
  get,
  update
}
