const mongoose = require("mongoose");
const moment = require("moment");

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

module.exports = {
  Dump
}
