console.log("inside test_script_1");
console.log(scripts);
scripts['test_script_1'].data = {
  "init": function () {
    console.log("initing script 1");
    let stage = document.getElementById("stage");
    let canvas = document.createElement("canvas");
    let context = null;

    canvas.width = 500;
    canvas.height = 500;
    canvas.id = "canvas_1";
    stage.appendChild(canvas);

    context = canvas.getContext("2d");
    context.fillStyle = "red";
    context.fillRect(10, 10, 50, 50);
  },
  "data": {
    "map": "this though, _is_ a real map"
  }
};
