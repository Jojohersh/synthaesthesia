var canvas = $("canvas")[0];
var context = canvas.getContext("2d");

var colorData = {
  orientation: "landscape",
  chunkWidth: 50,
  chunkHeight: 50,
  imageUrl: "",
  chunks: [],
  getColorData: function() {
    return this.chunks;
  }
};
//button opens the file input
$("#fileButton").on("click", function() {
  $("#fileInput").trigger("click");
});

//when the file input state changes check if it has the right kind of file
$("#fileInput").on("change", async function() {
  var file = $("#fileInput")[0].files[0];
  colorData.imageUrl = fileToDataUrl(file);
  draw(colorData.imageUrl)
  .then(() => {
    console.log("draw().then()");
    // NEED setTimeout....
    //canvas wouldn't finish rendering before we need pixel data
    setTimeout(function () {
      grabColorData()
      .then((colorChunks) => {
        colorData.chunks = colorChunks.slice();
      }).then(() => {
        sendToSongify(colorData.chunks);
      });
    }, 75);
  });
});

//**************************************************************************
// sends a fetch post request to server with the rgb data to be converted to
// a midi song file
//
//**************************************************************************
async function sendToSongify(data) {

  var request = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  };
  //checking the results of JSON.stringify
  console.log(request);

  fetch("/songify", request)
  .then((response) => {
    response.text()
    .then((responseText)=>{
      // here the response body has been converted into readable text
      console.log(responseText);
    });
  });
}

//**************************************************************************
// URL fileToDataUrl(file)
//    take a File object.
//    file is confirmed to be an image file, and is then converted to a URL
//    object. return null and throws an alert if not an image file
//**************************************************************************
function fileToDataUrl(file) {
  if (file.type.match("image/*")) {
    //take over the window data url
    window.URL = window.URL || window.webkitURL;
    var imageURL = window.URL.createObjectURL(file);
    return imageURL;
  } else {
    alert("File chosen not an image. Please select another file.");
    return null;
  }
}
// ***********************************************************************
// null draw(DataURL url)
//    takes a DataURL object as an argument
//    creates an image object from a url and draws it to the canvas. The image
//    color data is then extracted upon drawing.
//    returns null if a url is not provided
// ***********************************************************************
async function draw(url) {
  // make sure a url is supplied
  // console.log(url);
  if(url) {
    //define image object, when it loads, format the canvas and draw
    var image = new Image();
    //define the image as the data url
    image.src = url;
    image.onload = function() {
      // resize the canvas to keep aspect ratio
      adjustCanvas(image);
      //draw the image to fill the canvas
      context.drawImage(image,0,0,canvas.width,canvas.height);
    };
  } else {
    // if a url not provided return null
    console.log("url not provided to draw() function...");
    return null;
  }
}
//************************************************************************
// null adjustCanvas(Image image)
//    adjusts the dimensions of the canvas object to maintain an image's aspect
//    ratio. One dimension will always be 500 pixels, and the other will be
//    scaled appropriately. Requires an Image object as an argument
//*************************************************************************
function adjustCanvas(image){
  //one dimension will always stay 500
  var width = 500;
  var height = 500;
  //adjust the canvas size based on the picture aspect ratio
  if (image.width > image.height) {
    colorData.orientation = "landscape";
    var aspRatio = image.width / image.height;
    //adjust size of a chunk to ensure the canvas makes 100 chunks
    colorData.chunkWidth = Math.floor(50 * aspRatio);
    colorData.chunkHeight = 50;
    width = Math.floor(aspRatio * 500);
    canvas.width = width;
  } else {
    colorData.orientation = "portrait";
    var aspRatio = image.height / image.width;
    //adjust size of a chunk to ensure the canvas makes 100 chunks
    colorData.chunkHeight = Math.floor(50 * aspRatio);
    colorData.chunkWidth = 50;
    height = aspRatio * 500;
    canvas.height = height;
  }
}
// ***************************************************************
// null grabColorData()
//    loops over the canvas extracting the average pixel value for
//    a 10x10 grid of pixel "chunks". Data is stored in an array of
//    chunks in colorData
// ***************************************************************
async function grabColorData() {
  // define the width and height of pixel chunk
  var chunkW = colorData.chunkWidth;
  var chunkH = colorData.chunkHeight;
  var chunks = [];
  // loop over the image grabbing chunks of pixel data
  for (let x=0; x<10; x++) {
    for (let y=0; y<10; y++) {
      // traverse the canvas by width and height of a chunk
      // console.log(`x: ${x}, y: ${y}`);
      var chunkX = x * chunkW;
      var chunkY = y * chunkH;
      const data = context.getImageData(chunkX, chunkY,chunkW,chunkH).data;
      // find average r, g, and b values of chunks
      var avgRGB = await findAvgRGB(data);
      // ....new way....
      var chunk = avgRGB;

      //draw the avg pixel color
      drawAvgRGBRect(chunkX,chunkY,chunkW,chunkH,avgRGB);
      // store the chunk data
      var chunksIndex = x*10 + y;
      chunks.push(chunk);
    }
  }
  return chunks;
}
// ***************************************************************
// String findAvgRGB(Array rgbaData)
//    takes an array of rgba Data
//    loops over the array of rgba data and returns a string of
//    the average R, G, and B values
// ***************************************************************
async function findAvgRGB(rgbaData) {
  //takes in array in format [r,g,b,a,r,...]
  var r = 0;
  var g = 0;
  var b = 0;
  for (var i = 0; i < rgbaData.length; i+=4) {
    r += rgbaData[i];
    g += rgbaData[i+1];
    b += rgbaData[i+2];
  }
  var numPixels = rgbaData.length / 4;
  var avgR = Math.floor(r / numPixels);
  var avgG = Math.floor(g / numPixels);
  var avgB = Math.floor(b / numPixels);
  return [avgR, avgG, avgB].toString();
}
// ***************************************************************
// null drawAvgRGBRect(x coordinate, y coordinate, width, height, Array RGB value)
//    takes an x value and y value for top left of where to draw the rectange,
//    and a width and height for the rectangle, and an array of r,g,b values to
//    be drawn at an opacity of 0.7
// ***************************************************************
function drawAvgRGBRect(x,y,w,h,avgRGB) {
  var contextFillStyle = "rgba(" + avgRGB + ",0.7)";
  context.fillStyle = contextFillStyle;
  context.fillRect(x,y,w,h);
}
