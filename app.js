const port = process.env.PORT || 3000;
const osrsge = require("./osrs-ge/osrs-ge.js");
const geTest = require("./osrs-ge/ge-test.js");

const dbAdd = "mongodb://heroku_7dl5lkqv:ukou49hgjq420huiga2stqspc5@ds157258.mlab.com:57258/heroku_7dl5lkqv";
const express = require('express');
const { MongoClient, ObjectID } = require("mongodb");

var app = express();
    app.set('view engine', 'hbs');

    app.get("/", (req, res, err) => {
      res.send("Hello");
    });

    app.listen(port, () => {
      console.log(`Starting server on port ${ port }`);
      geTest.test(true);
    });
