const port = process.env.PORT || 3000;
const osrsge = require("./osrs-ge/osrs-ge.js");
const geTest = require("./osrs-ge/ge-test.js");

const express = require('express');

var app = express();
    app.set('view engine', 'hbs');

    app.get("/", (req, res, err) => {
      res.send("Hello");
    });

    app.listen(port, () => {
      console.log(`Starting server on port ${ port }`);
      geTest.test(true);
    });
