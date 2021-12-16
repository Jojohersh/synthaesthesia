//enviornment variables
require("dotenv").config();
//setup server
const express = require("express");
// const bodyParser = require("body-parser");
const app = express();
const path = require("path");
//for resource linking
app.use(express.static(path.join(__dirname+"/public/")));
//create application json parser
// var jsonParser = bodyParser.json();
//create application/x-www-form-urlencoded parser
// app.use(bodyParser.urlencoded({extended: true}));
app.use(express.json());
//require routes
const indexRoutes = require("./routes/index.js");
//app config
app.use(indexRoutes);
//start it up Scotty
app.listen(process.env.PORT, () => {
  console.log("server running on port:" + process.env.PORT);
});
