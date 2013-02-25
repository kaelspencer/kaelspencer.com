var ACO = (function() {
    // Setup the simulation
    function ACO(canvas_id, grid_size, grid_cells_x, grid_cells_y) {
        try {
            this.m_grid_size = grid_size;
            this.m_grid_cells_x = grid_cells_x;
            this.m_grid_cells_y = grid_cells_y;
            this.m_board = new Board(canvas_id, this.m_grid_size, this.m_grid_cells_x, this.m_grid_cells_y);

            this.generateBoard();
            this.generateAnts();

            this.m_board.drawGrid();
            this.m_board.paintGrid();
        } catch(e) {
            if (e.stack) {
                console.log(e.stack);
            } else {
                console.log('Exception: ' + e);
            }
        }
    }

    ACO.prototype.RunSimulation = function() {
        for (var i = 0; i < 1; i++) {
            $.each(this.m_ants, function() {
                this.advance();
            });
        }
    };

    // Generate the set of ants.
    ACO.prototype.generateAnts = function() {
        var start = this.m_board.getStart();
        var board = this.m_board;
        var ants = new Array(1);

        $.each(ants, function(i) {
            ants[i] = new Ant(board, start.x, start.y);
        });

        this.m_ants = ants;
    };

    // Generate the board. First create the obstructions then attempt to create the start
    // and end points. If the endpoints collide with the obstructions, clear the board and
    // try again. Limit this loop to 50 so it doesn't go on forever in case of a bug.
    ACO.prototype.generateBoard = function() {
        var endpoints = false;

        // Don't run forever.
        for (var i = 0; i < 50 && !endpoints; i++) {
            this.createObstructions();
            endpoints = this.createEndpoints();

            if (!endpoints) {
                this.m_board.clear();
                console.log('Regnerating board, endpoint collision.');
            }
        }
    }

    // Randomly place the start and end points. The start is in the top left corner and the end
    // is in the bottom right.
    ACO.prototype.createEndpoints = function() {
        var xStart = Math.floor(Math.random() * this.m_grid_cells_x * 0.15);
        var yStart = Math.floor(Math.random() * this.m_grid_cells_y * 0.15);
        var xEnd = Math.floor(Math.random() * this.m_grid_cells_x * 0.15) + Math.floor(this.m_grid_cells_x * 0.85);
        var yEnd = Math.floor(Math.random() * this.m_grid_cells_y * 0.15) + Math.floor(this.m_grid_cells_y * 0.85);
        var result = false;

        result = this.m_board.setStart(xStart, yStart);
        result = result && this.m_board.setEnd(xEnd, yEnd);

        if (result) {
            console.log('Start (' + xStart + ', ' + yStart + ')');
            console.log('End   (' + xEnd + ', ' + yEnd + ')');
        }

        return result;
    }

    // This method creates the set of obstructions on the board. The count of obstructions is a
    // weighted probability distribution.
    ACO.prototype.createObstructions = function() {
        var weight_counts =
            [7, 7, 7,
             8, 8, 8, 8, 8,
             9, 9, 9, 9, 9, 9,
             10, 10, 10, 10, 10, 10,
             11, 11, 11, 11,
             12, 12, 12,
             13, 13];
        var count = this.getWeightedProbability(weight_counts);

        console.log('Creating ' + count + ' obstructions.');

        for (var i = 0; i < count; i++) {
            this.createSingleObstruction();
        }
    }

    // This method creates a single obstruction and is called by createObstructions. The size the
    // obstruction is random and the result of a weighted probably distribution.
    // As this method is called multiple times the distribution is static.
    ACO.prototype.createSingleObstruction = function() {
        var factor = 5;
        // Distribution of obstruction sizes.
        this.createSingleObstruction.sizes = this.createSingleObstruction.sizes ||
            [1, 1,
             2, 2, 2, 2,
             3, 3, 3, 3, 3, 3,
             4, 4,
             5];

        var size = factor * this.getWeightedProbability(this.createSingleObstruction.sizes);
        var x = Math.floor(Math.random() * this.m_grid_cells_x);
        var y = Math.floor(Math.random() * this.m_grid_cells_y);

        for (var j = 0; j < size && (j + x) < this.m_grid_cells_x; j++) {
            for (var k = 0; k < size && (k + y) < this.m_grid_cells_y; k++) {
                this.m_board.updateCell(x + j, y + k, (j && k && j != size - 1 && k != size - 1 ? 0.8 : 1.0));
                this.m_board.blockCell(x + j, y + k);
            }
        }
    }

    // Randomly select one element from the provided values.
    ACO.prototype.getWeightedProbability = function(weighted_values) {
        return weighted_values[Math.floor(Math.random() * weighted_values.length)];
    }

    return ACO;
})();
