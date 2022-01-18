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
  var clips = songify.songify(req.body);
  console.log(clips);

  var jsonClips = JSON.stringify(clips);

  // res.send("fuck you");
  res.send(jsonClips);
});

module.exports = router;
