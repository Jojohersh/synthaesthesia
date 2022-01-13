const scribble = require("scribbletune");
const {Scale} = require("@tonaljs/tonal");

var basicClipTest = {
  notes: scribble.scale('C4 major'),
  pattern: 'x'.repeat(8)
}

// var chords = scribble.getChordsByProgression('C4 egyptian', 'I IV V');

//experimenting how tonaljs works compared to scribble
//1. specify the key
//***eventually code will choose one of the 12 scale tones
let keys = ["A4","A#4","B4","C4","C#4","D4","D#4","E4","F4","F#4","G4","G#4"];

let scales = scribble.scales();

var key = null;
//2. specify the chord root order
//***eventually code will pluck which notes to construct the progression
//*** will probably choose 2 to 8 options

// var availNotes = Scale.get(key).notes;
// console.log(availNotes);

//3. find the name for the scale modes of the key and accompanying chords

// var modes = Scale.modeNames(key);
// for (let i=0; i<modes.length; i++) {
//   var currentMode = modes[i].toString().replace(","," ");
//   console.log(`mode: ${currentMode}`);
//   console.log(currentMode);
//   console.log(Scale.scaleChords(currentMode));
// }

//4. figure out which chord to play for that note
// var chords = Scale.scaleChords("C4 egyptian");
// console.log(chords);
// console.log(Scale.modeNames("C4 egyptian"));

// var whackClipTest = {
//   notes: chords,
//   pattern: 'x_'.repeat(4) + 'x_______'
// }

// songify takes in an array of pixel Data
// returns an accompanying array of scribble clips
exports.songify = function(data) {
  var clips = [];
  console.log(data);
  key = selectKey(data[0]);
  console.log(key);
  for (let i=1; i<100; i++) {
    var clip = makeClip(data[i]);
    clips.push(clip);
  }
  console.log(clips);
  // creates a midi file of music clip
  // scribble.midi(clip);
};

// takes in a chunk of pixel data formatted "r,g,b"
// returns an array of pixel data formatted [r,g,b]

function chunkToArray(chunk) {
  var arr = chunk.split(",");
  var mappedArr = arr.map(x => parseInt(x));
  return mappedArr;
}

// uses the Green pixel value to choose which root note for the song's key
// returns a string of "ROOT NOTE + SCALE"
function selectKey(dataChunk) {
  var chunkFormatted = chunkToArray(dataChunk);
  var greenVal = chunkFormatted[1];
  keyIndex = greenVal % 12;
  // console.log(keys[keyIndex]);
  var key = keys[keyIndex];
  var scale = selectScale(chunkFormatted);
  // console.log(`${key} ${scale}`);
  return `${key} ${scale}`;
}

// uses the sum of R G and B to choose which scale to use for the song
function selectScale(dataChunk) {
  var rgbSum = dataChunk[0] + dataChunk[1] + dataChunk[2];
  // console.log(rgbSum);
  var numOfScales = scales.length;
  var scale = scales[rgbSum % numOfScales];
  // console.log(scale);
  return scale;
}

function makeClip(dataChunk) {
  var clip = {};
  clip.pattern = createRhythm(dataChunk);
  var numNotesInClip = howManyNotes(clip.pattern);
  return clip;
}

// receives dataChunk in format "r,g,b"
// returns a string in the format needed for a scribble rhythm
// e.g. "x-x_--[-x]x"
function createRhythm(dataChunk) {
  var chunkFormatted = chunkToArray(dataChunk);
  var rhythmChoices = ["x","_","-","[xx]","[x-]","[-x]"];
  var rhythm = [];
  for (let i=0; i<8; i++) {
    //rotates through R,G, & B for each beat of the measure
    var rhythmIndex = ( chunkFormatted[i%3] + Math.ceil(7*i/3) ) % rhythmChoices.length;
    // console.log(`choices.length${rhythmChoices.length} i%3:${i%3} chunkFormatted:${chunkFormatted}`);
    // console.log(rhythmIndex);
    if (i===0 && rhythmIndex === 1) {
      rhythmIndex = 2;
    }
    if (rhythm.length > 0 && rhythmIndex === 1 && rhythm[rhythm.length-1] !== "x" ) {
      rhythmIndex = 0;
    }
    var currentBeat = rhythmChoices[rhythmIndex];
    rhythm.push(currentBeat);
  }
  var rhythmString = rhythm.toString().replaceAll(",","");
  return rhythmString;
  // console.log(rhythm.toString().replaceAll(",",""));
}


function howManyNotes(rhythmPattern) {
  var totalNotes = 0;
  for (let i=0; i<rhythmPattern.length; i++) {
    if (rhythmPattern.charAt(i) === 'x') {
      totalNotes++;
    }
  }
  return totalNotes;
}
