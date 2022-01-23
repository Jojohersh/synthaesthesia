const scribble = require("scribbletune");
const {Scale, Chord, Note} = require("@tonaljs/tonal");

//experimenting how tonaljs works compared to scribble
//1. specify the key
let keys = ["A4","A#4","B4","C4","C#4","D4","D#4","E4","F4","F#4","G4","G#4"];

let scales = scribble.scales();

var key = null;


// songify takes in an array of pixel Data
// returns an accompanying array of scribble clips
exports.songify = function(data) {
  var clips = [];
  // console.log(data);
  key = selectKey(data[0]);
  console.log(key);
  for (let i=1; i<100; i++) {
    var clip = makeClip(data[i]);
    clips.push(clip);
  }
  // console.log(clips);

  return clips;
};

// main function to create a clip readable by scribble
// takes a dataChunk in format "r,g,b" and returns a clip in format:
// clip: {
//   subdiv: 8n,
//   instrument: "Synth",
//   pattern: "x_-[x-][-x][xx]--",
//   notes: [note, note, etc..]
// }

function makeClip(dataChunk) {
  var newClip = {};
  //sets default pattern value to 8th notes instead of quarter notes
  newClip.subdiv = '8n';
  newClip.pattern = createRhythm(dataChunk);
  newClip.instrument = "Synth";
  var numNotesInClip = howManyNotes(newClip.pattern);
  newClip.notes = selectNotes(dataChunk, numNotesInClip);

  return newClip;
}

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

// uses the rgb values to choose which notes to play for the clip
// takes the data chunk and number of notes in the clip
// returns an array of notes to be played
function selectNotes(dataChunk, numOfNotes) {
  var chunkFormatted = chunkToArray(dataChunk);

  // possible modes to be played derived from the base scale
  var modes = Scale.modeNames(key);

  // uses R value to choose the mode
  var modeToChoose = chunkFormatted[0] % modes.length;
  var currentMode = modes[modeToChoose];
  // formates currentMode: ["NOTE","SCALENAME"] to "NOTE SCALENAME"
  // e.g. ["C4","Mixolydian"] -> "C4 Mixolydian"
  var currentModeFormatted = currentMode.toString().replace(","," ");

  // an array of possible chords
  // NOTE: tonics are not provided
  // e.g. ["maj7", "5", "min7"]
  var availChords = Scale.scaleChords(currentModeFormatted);

  // uses G value to choose the chord
  var chordToChoose = chunkFormatted[1] % availChords.length;

  //chooses the chord to pull notes from for the clip
  var currentChord = availChords[chordToChoose];
  var tonic = currentMode[0];
  // grabs the notes of the current chord
  //getChord takes arguments in format getChord("maj7", "C4") etc...
  var availNotes = Chord.getChord(currentChord, tonic).notes;
  // in some instances a note like G##5 would arise
  // it is now simplified to A5, etc...
  availNotes = availNotes.map(note => Note.simplify(note));

  // console.log({currentChord, tonic});
  // console.log({availNotes});

  // choose a note to be played for each note in the current clip
  var notes = [];
  for (let i=0; i<numOfNotes; i++) {
    // roates through R,G, and B and has index * 7 to reduce note repetition of each R,G, or B
    var noteToChoose = (chunkFormatted[i%3] + i*7) % availNotes.length;
    var selectedNote = availNotes[noteToChoose];
    // console.log({availNotes, noteToChoose, selectedNote});
    notes.push(selectedNote);
  }

  return notes;
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
    // some added math to add variance through the bar.
    var rhythmIndex = ( chunkFormatted[i%3] + Math.ceil(7*i/3) ) % rhythmChoices.length;
    //ensures the first note isn't a sustain
    if (i===0 && rhythmIndex === 1) {
      rhythmIndex = 2;
    }
    // checks to make sure a sustain doesn't come after a rest
    if (rhythm.length > 0 && rhythmIndex === 1 && rhythm[rhythm.length-1] === "-" ) {
      rhythmIndex = 2;
    }
    var currentBeat = rhythmChoices[rhythmIndex];
    rhythm.push(currentBeat);
  }
  console.log({rhythm});
  var rhythmString = rhythm.toString().replace(/\,/g,"");
  return rhythmString;
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
