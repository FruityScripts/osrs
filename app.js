const port = process.env.PORT || 3000;
const osrsge = require("./osrs-ge/osrs-ge.js");
const monitor = require("./monitor/item-monitor.js");
const database = require("./database/database.js");
const humanizeDuration = require('humanize-duration')

const express = require('express');
const moment = require('moment');
const ejs = require('ejs');

var app = express();
    app.locals = {
      addCommas  : function(number) {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      },
      getRowClass : function(item) {
        if (item !== undefined) {
          if (item.margin > 0) {
            return "success";
          } else if (item.margin < 0) {
            return "danger";
          }
        }
        return "";
      },
      getMembersIcon : function(item) {
        if (item !== undefined) {
          return item.members ? "fa fa-star" : "";
        }
        return "";
      },

      getMarginColour : function(margin) {
        if (margin > 0) {
          return "#77b710";
        } else if (margin < 0) {
          return "#c0392b";
        }
        return "";
      }

    };

    app.use(express.static(__dirname + '/public'));
    app.set('view engine', 'ejs');

    app.get("/", (req, res, err) => {
      database.getLatestDump().then((result) => {
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

    app.get("/dumps", (req, res, err) => {
      res.redirect("/");
    });

    app.get("/item", (req, res, err) => {
      var findOptions = {};
      var query = req.query;
      if (query.name !== undefined) findOptions.name = query.name;
      if (query.id !== undefined) findOptions.id = query.id;
      if (query.members !== undefined) findOptions.members = query.members;
      database.getAllItems(findOptions).then((result) => {
        res.send(result);
      }).catch((error) => {
        res.send("Unable to find items that match your criteria.");
      });

    });

    app.get("/item/summary", (req, res, err) => {
      database.getAllItems().then((items) => {
        res.send(items);
      }).catch((error) => {
        res.send("Unable to find items.");
      })
    });

    app.get("/item/:id", (req, res, err) => {
      database.getItem({ id : req.params.id }).then((item) => {
        res.send(item);
      }).catch((error) => {
        res.send("Unable to find item.");
      })
    });

    app.listen(port, () => {
      console.log(`Starting server on port ${ port }`);
      monitor.monitor(true);
      // monitor.summary();
    });
