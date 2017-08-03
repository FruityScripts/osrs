const port = process.env.PORT || 3000;
const osrsge = require("./osrs-ge/osrs-ge.js");

const dbAdd = "mongodb://heroku_7dl5lkqv:ukou49hgjq420huiga2stqspc5@ds157258.mlab.com:57258/heroku_7dl5lkqv";
const express = require('express');
const { MongoClient, ObjectID } = require("mongodb");


var app = express();
    app.set('view engine', 'hbs');

    app.get("/", (req, res, err) => {
      MongoClient.connect(dbAdd, (error, db) => {
         if (error) {
           return console.log("Unable to connect to MongoDB server");
         }

         console.log("Connected to MongoDB Server");

        var summary = osrsge.summary(summary);

        console.log(summary);


        //  db.collection("items").insertOne({
        //    name : "Ben",
        //    age : 21,
        //    location : "Oldham"
        //  }, (error, result) => {
        //    if (error) {
        //      return console.log("Unable to add user to table", error);
        //    }
        //    console.log(JSON.stringify(result.ops));
        //  })

         db.close();

        });
    });

    app.listen(port, () => {
      console.log(`Starting server on port ${ port }`);
    });
