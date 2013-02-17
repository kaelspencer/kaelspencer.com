(function(){
    var c_canvasWidth = 900;
    var c_canvasHeight = 500;
    var canvas = null;

    $(window).load(function(){
        canvas = $('canvas');

        canvas.width(c_canvasWidth);
        canvas.height(c_canvasHeight);

        canvas.drawBezier({
            strokeStyle: "#000",
            strokeWidth: 5,
            x1: 50, y1: 50, // Start point
            cx1: 200, cy1: 50, // Control point
            cx2: 50, cy2: 150, // Control point
            x2: 200, y2: 150 // Start/end point
        });
    });
})();
