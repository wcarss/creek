scripts['test_script_2'].data = {
  "init": function () {
    console.log("initing script 2");
    let stage = document.getElementById("stage");
    let canvas = document.createElement("canvas");
    let context = null;

    canvas.width = 500;
    canvas.height = 500;
    canvas.id = "canvas_2";
    stage.appendChild(canvas);

    context = canvas.getContext("2d");
    context.fillStyle = "green";
    context.fillRect(10, 60, 100, 100);
  },
  "data": {
    "map": "not a real map"
  }
};
