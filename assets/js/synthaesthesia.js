var canvas = $("canvas")[0];
var context = canvas.getContext("2d");

console.log("file connected...");
//button opens the file input
$("#fileButton").on("click", function() {
  console.log("Button clicked");
  $("#fileInput").trigger("click");
});

//when the file input state changes check if it has the right kind of file
$("#fileInput").on("change", function() {
  var file = $("#fileInput")[0].files[0];
  var imageUrl = fileToDataUrl(file);
  drawImage(imageUrl);
});

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
function drawImage(url) {
  // make sure a url is supplied
  console.log(url);
  if(url) {
    //define image object, when it loads, format the canvas and draw
    var image = new Image();
    image.onload = function() {
      //one dimension will always stay 500
      var width = 500;
      var height = 500;
      //adjust the canvas size based on the picture aspect ratio
      if (image.width > image.height) {
        var aspRatio = image.width / image.height;
        width = aspRatio * 500;
        canvas.width = width;
      } else {
        var aspRatio = image.height / image.width;
        height = aspRatio * 500;
        canvas.height = height;
      }
      //draw the image to the canvas
      context.drawImage(image,0,0,width,height)
    };
    //define the image as the data url
    image.src = url;
  } else {
    // if a url not provided return null
    return null;
  }

}
