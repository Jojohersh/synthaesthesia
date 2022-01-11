const scribble = require("scribbletune");

// songify takes in an array of pixel Data
// returns an accompanying array of scribble clips
exports.songify = function(data) {
  console.log(data);
  const clip = scribble.clip({
    notes: scribble.scale('C4 major'),
    pattern: 'x'.repeat(8)
  });

  scribble.midi(clip);
};

// takes in a chunk of pixel data formatted "r,g,b"
// returns an array of pixel data formatted [r,g,b]

function chunkToArray(chunk) {
  var arr = chunk.split(",");
  return arr;
}
