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
      database.getAllItems({
        buying: { $gt: 0 },
        selling: { $gt: 0 }
      }).then((result) => {
        if (result !== null) {
          var diff = moment().diff(moment(result[0].updatedAt));
          res.render("index.ejs", {
            data : result,
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

    app.get("/item/limit/:id/:limit", (req, res, err) => {
      var id = req.params.id;
      var limit = req.params.limit;
      if (id !== undefined && limit !== undefined) {
        database.getItem({ id }).then((result) => {
          result.limit = limit;
          return database.insertItem(result);
        }).then((result) => {
          res.redirect("/");
        }).catch((error) => {
          res.send("Unable to update item.");
        });
      } else {
        res.send("Unable to update item.");
      }
    });

    app.listen(port, () => {
      console.log(`Starting server on port ${ port }`);
      monitor.start();
      // monitor.summary();
    });
