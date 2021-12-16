const express = require("express");
const router = express.Router();
const path = require("path");

router.get("/", (req,res)=>{
  res.sendFile(path.join(__dirname+"/../index.html"));
  // res.send("hello there");
});

router.post("/songify", (req,res)=> {
  console.log("songify route hit...");
  console.log(req.body);
  res.send("fuck you");
});

module.exports = router;
