(function(){
    var c_grid_size = 5;
    var c_grid_cells_x = 150;
    var c_grid_cells_y = 85;
    /*var c_grid_size = 50;
    var c_grid_cells_x = 10;
    var c_grid_cells_y = 10;*/
    var g_board = null;

    $(function() {
        runSimulation();
    });

    // Run it!
    function runSimulation() {
        try {
            g_board = new Board('canvas', c_grid_size, c_grid_cells_x, c_grid_cells_y);

            generateBoard(g_board);

            g_board.drawGrid();
            g_board.paintGrid();
        } catch(e) {
            console.log('Exception: ' + e);
        }
    }

    // Generate the board. First create the obstructions then attempt to create the start
    // and end points. If the endpoints collide with the obstructions, clear the board and
    // try again. Limit this loop to 50 so it doesn't go on forever in case of a bug.
    function generateBoard(board) {
        var endpoints = false;

        // Don't run forever.
        for (var i = 0; i < 50 && !endpoints; i++) {
            createObstructions(board);
            endpoints = createEndpoints(board);

            if (!endpoints) {
                board.clear();
                console.log('Regnerating board, endpoint collision.');
            }
        }
    }

    // Randomly place the start and end points. The start is in the top left corner and the end
    // is in the bottom right.
    function createEndpoints(board) {
        var xStart = Math.floor(Math.random() * c_grid_cells_x * 0.15);
        var yStart = Math.floor(Math.random() * c_grid_cells_y * 0.15);
        var xEnd = Math.floor(Math.random() * c_grid_cells_x * 0.15) + Math.floor(c_grid_cells_x * 0.85);
        var yEnd = Math.floor(Math.random() * c_grid_cells_y * 0.15) + Math.floor(c_grid_cells_y * 0.85);
        var result = false;

        result = board.setStart(xStart, yStart);
        result = result && board.setEnd(xEnd, yEnd);

        if (result) {
            console.log('Start (' + xStart + ', ' + yStart + ')');
            console.log('End   (' + xEnd + ', ' + yEnd + ')');
        }

        return result;
    }

    // This method creates the set of obstructions on the board. The count of obstructions is a
    // weighted probability distribution.
    function createObstructions(board) {
        var weight_counts =
            [6, 6,
             7, 7, 7,
             8, 8, 8, 8, 8, 8,
             9, 9, 9, 9,
             10, 10, 10,
             11];
        var count = getWeightedProbability(weight_counts);

        console.log('Creating ' + count + ' obstructions.');

        for (var i = 0; i < count; i++) {
            createSingleObstruction(board);
        }
    }

    // This method creates a single obstruction and is called by createObstructions. The size the
    // obstruction is random and the result of a weighted probably distribution.
    // As this method is called multiple times the distribution is static.
    function createSingleObstruction(board) {
        var factor = 5;
        // Distribution of obstruction sizes.
        createSingleObstruction.sizes = createSingleObstruction.sizes ||
            [1, 1,
             2, 2, 2, 2,
             3, 3, 3, 3, 3, 3,
             4, 4,
             5];

        var size = factor * getWeightedProbability(createSingleObstruction.sizes);
        var x = Math.floor(Math.random() * c_grid_cells_x);
        var y = Math.floor(Math.random() * c_grid_cells_y);

        for (var j = 0; j < size && (j + x) < c_grid_cells_x; j++) {
            for (var k = 0; k < size && (k + y) < c_grid_cells_y; k++) {
                board.updateCell(x + j, y + k, (j && k && j != size - 1 && k != size - 1 ? 0.8 : 1.0));
                board.blockCell(x + j, y + k);
            }
        }
    }

    // Randomly select one element from the provided values.
    function getWeightedProbability(weighted_values) {
        return weighted_values[Math.floor(Math.random() * weighted_values.length)];
    }
})();
