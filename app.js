const port = process.env.PORT || 3000;
const osrsge = require("./osrs-ge/osrs-ge.js");
const geTest = require("./osrs-ge/ge-test.js");
const database = require("./database/database.js");

const express = require('express');

var app = express();
    app.set('view engine', 'hbs');

    app.get("/", (req, res, err) => {
      res.send("Hi")
    });

    app.get("/items", (req, res, err) => {
      database.get().then((result) => {
          res.send(result[0]);
      });
    });

    app.listen(port, () => {
      console.log(`Starting server on port ${ port }`);
      geTest.monitor(true);
    });
