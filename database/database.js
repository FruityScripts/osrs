const url = "mongodb://heroku_7dl5lkqv:ukou49hgjq420huiga2stqspc5@ds157258.mlab.com:57258/heroku_7dl5lkqv";
const db = "items";

const mongoose = require("mongoose");
      mongoose.connect(url);

var get = (options) => {

}

var update = (entry) => {
  MongoClient.connect(url, (error, db) => {
  if (error) {
    return console.log("Unable to connect to MongoDB server");
  }

  console.log("Connected to MongoDB Server");

  db.collection(db).update({
    "name" : entry.name
  }, entry, (error, result) => {
    if (error) {
      return console.log("Unable to add user to table", error);
    }
     console.log(JSON.stringify(result.ops));
  });

  db.close();

  });

}

module.exports = {
  get
}
