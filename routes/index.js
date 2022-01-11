const express = require("express");
const router = express.Router();
const path = require("path");
const songify = require("../lib/songify");

router.get("/", (req,res)=>{
  res.sendFile(path.join(__dirname+"/../index.html"));
  // res.send("hello there");
});

router.post("/songify", (req,res)=> {
  console.log("songify route hit...");
  // console.log(req.body);
  // songify.songify("hello");
  songify.songify(req.body);
  res.send("fuck you");
});

module.exports = router;