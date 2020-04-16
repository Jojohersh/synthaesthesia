var canvas = $("canvas")[0];
var context = canvas.getContext("2d");

console.log("file connected...");
//button opens the file input
$("#fileButton").on("click", function() {
  console.log("Button clicked");
  $("#fileInput").trigger("click");
});
$("#fileInput").on("click", function() {
  console.log("fileInput click triggered");
});
//when the file input state changes check if it has the right kind of file
$("#fileInput").on("change", function() {
  console.log("a file has been chosen!");
  var file = $("#fileInput")[0].files[0];
  if (file.type.match("image/*")) {
    window.URL = window.URL || window.webkitURL;
    var imageURL = window.URL.createObjectURL(file);

    var image = new Image();
    image.onload = function() {
      //draw image
      context.drawImage(image, 0,0);
    };
    image.src = imageURL;
  }
});
