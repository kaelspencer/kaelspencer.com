(function(){
    var c_grid_size = 5;
    var c_grid_cells_x = 150;
    var c_grid_cells_y = 85;

    $(function() {
        runSimulation();
    });

    function runSimulation() {
        try {
            var board = new Board('canvas', c_grid_size, c_grid_cells_x, c_grid_cells_y);
            board.drawGrid();

            for (var x = 0; x < c_grid_cells_x; x++) {
                for (var y = 0; y < c_grid_cells_y; y++) {
                    board.updateCell(x, y, Math.random());
                }
            }

            board.paintGrid();
        } catch(e) {
            console.log('Exception: ' + e);
        }
    }
})();
