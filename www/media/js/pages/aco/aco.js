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
            g_board.drawGrid();

            createEndpoints(g_board);
            createObstructions(g_board);

            /*for (var x = 0; x < c_grid_cells_x; x++) {
                for (var y = 0; y < c_grid_cells_y; y++) {
                    g_board.updateCell(x, y, Math.random());
                }
            }*/

            g_board.paintGrid();
        } catch(e) {
            console.log('Exception: ' + e);
        }
    }

    function createEndpoints(board) {
        // One for the start, one for the end.
        createSingleEndpoint(function(x, y) { return board.setStart(x, y); });
        createSingleEndpoint(function(x, y) { return board.setEnd(x, y); });
    }

    function createSingleEndpoint(updateMethod) {
        var x = Math.floor(Math.random() * (c_grid_cells_x - 1));
        var y = Math.floor(Math.random() * (c_grid_cells_y - 1));
        var setEndpoint = false;

        for (var i = 0; i < 50 && !setEndpoint; i++) {
            setEndpoint = updateMethod(x, y);
        }

        if (!setEndpoint) {
            throw "Unable to create endpoint.";
        }
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
