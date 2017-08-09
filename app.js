const port = process.env.PORT || 3000;
const osrsge = require("./osrs-ge/osrs-ge.js");
const geTest = require("./osrs-ge/ge-test.js");
const database = require("./database/database.js");
const humanizeDuration = require('humanize-duration')

const express = require('express');
const pug = require('pug');
const moment = require('moment');

var ejs = require('ejs');
var fs  = require('fs');

var app = express();
    app.locals = {
      addCommas  : function(number) {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      }
    };

    app.use(express.static(__dirname + '/public'));
    app.set('view engine', 'ejs');

    app.get("/", (req, res, err) => {
      database.get().then((result) => {
        if (result !== null) {
          var diff = moment().diff(moment(result.timestamp));
          res.render("index.ejs", {
            data : result.dump,
            ago : humanizeDuration(diff, {
              round: true,
              units: ['h', 'm']
            })
          });

        } else {
          res.render("index.ejs", {
            data : {},
            ago : 0
          });
        }
      });
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
