const mongoose = require("mongoose");

const itemSchema = mongoose.Schema({
  id: {
    type : Number,
    required : true
  },

  name: {
    type : String,
    required : true
  },

  members : {
    type : Boolean,
    default : false
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

  limit : {
    type : Number,
    default : -1
  }

}, {
  timestamps: true
});

const Item = mongoose.model("Item", itemSchema);

module.exports = {
  Item
}
