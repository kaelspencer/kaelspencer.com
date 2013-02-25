var Board = (function() {
    // Board constructor.
    // Grid size is the number of empty pixels between the lines.
    // Grid X & Y are the count of cells in each direction.
    function Board(canvas_id, grid_size, grid_x, grid_y) {
        if (!canvas_id || canvas_id == '') {
            throw 'Invalid canvas id (' + canvas_id + ') in Board constructor.'
        } else if (grid_size <= 0) {
            throw 'Invalid grid size (' + grid_size + ') in Board constructor.'
        } else if (grid_x <= 0) {
            throw 'Invalid grid width/x (' + grid_x + ') in Board constructor.'
        } else if (grid_y <= 0) {
            throw 'Invalid grid height/y (' + grid_y + ') in Board constructor.'
        }

        this.m_canvas = $(canvas_id);
        this.m_grid_size = grid_size;
        this.m_grid_x = grid_x;
        this.m_grid_y = grid_y;
        this.m_start = {
            x: 0,
            y: 0
        };

        // Don't use jQuery to set the height and width of the canvas.
        // It sets the CSS property which zooms the canvas.
        var canvas = document.getElementById(canvas_id);

        // The left (or top) line is 1 pixel. Add grid_size. Repeat for number of cells
        // in that direction. Add 1 to close the last cell.
        this.m_height_px = (grid_size + 1) * grid_y + 1;
        this.m_width_px = (grid_size + 1) * grid_x + 1;
        canvas.height = this.m_height_px;
        canvas.width = this.m_width_px;

        this.m_canvas.translateCanvas({
            translate: 0.5
        });

        this.clear();

        console.log('canvas height: ' + this.m_canvas.height());
        console.log('canvas width : ' + this.m_canvas.width());
    };

    // Clear the board by dropping the grid and recreating it.
    Board.prototype.clear = function() {
        // Create a multidimensional array that will represent the grid.
        var grid = new Array(this.m_grid_x);
        var grid_y = this.m_grid_y;
        var graph = new Graph();

        $.each(grid, function(x) {
            grid[x] = new Array(grid_y);
            $.each(grid[x], function(y) {
                var v = graph.addVertex();

                if (x - 1 >= 0) {
                    graph.connect(grid[x - 1][y].vertex, v);
                }

                if (y - 1 >= 0) {
                    graph.connect(grid[x][y - 1].vertex, v);
                }

                grid[x][y] = {
                    weight: 0.0,
                    blocked: false,
                    start: false,
                    end: false,
                    x: x,
                    y: y,
                    vertex: v
                };
            });
        });

        this.m_grid = grid;
        this.m_graph = graph;
    }

    Board.prototype.getStart = function() {
        return this.m_start;
    };

    // Update the weight value of this cell, increasing it by delta. The weight is capped at 1.0.
    Board.prototype.updateCell = function(x, y, delta) {
        this.validateCoordinates(x, y, 'Board.updateCell');

        var cell = this.m_grid[x][y];

        // Don't update blocked cells for style reasons.
        if (!cell.blocked) {
            cell.weight += delta;

            if (cell.weight > 1.0) {
                cell.weight = 1.0;
            }
        }
    };

    Board.prototype.setStart = function(x, y) {
        this.validateCoordinates(x, y, 'Board.setStart');

        if (this.m_grid[x][y].blocked) {
            return false;
        } else {
            this.m_grid[x][y].start = true;
            this.m_start.x = x;
            this.m_start.y = y;
            return true;
        }
    }

    Board.prototype.setEnd = function(x, y) {
        this.validateCoordinates(x, y, 'Board.setEnd');

        if (this.m_grid[x][y].blocked) {
            return false;
        } else {
            this.m_grid[x][y].end = true;
            return true;
        }
    }

    // Mark this cell as blocked.
    Board.prototype.blockCell = function(x, y) {
        this.validateCoordinates(x, y, 'Board.blockCell');
        this.m_grid[x][y].blocked = true;
    };

    // Validate the coordinates, throw an exception if they are invalid.
    Board.prototype.validateCoordinates = function(x, y, method) {
        if (x < 0 || x >= this.m_grid_x) {
            throw "Invalid x value (" + x + ") in " + method;
        }

        if (y < 0 || y >= this.m_grid_y) {
            throw "Invalid y value (" + y + ") in " + method;
        }
    }

    // Find all the non-blocked, non-starting neighbor cells.
    Board.prototype.getNeighboringCells = function(x, y) {
        this.validateCoordinates(x, y, 'Board.getNeighboringCells');
        var neighbors = new Array();

        // Loop around (x, y). That is [x - 1, x + 1] and [y - 1, y + 1].
        for (var i = -1; i < 2 && x + i <= this.m_grid_x; i++) {
            for (var j = -1; j < 2 && y + j <= this.m_grid_y; j++) {
                if (i + x >= 0 && j + y >= 0) {
                    var cell = this.m_grid[i + x][j + y];

                    if (!cell.blocked && !cell.start) {
                        neighbors.push(cell);
                    }
                }
            }
        }

        return neighbors;
    };

    // Draw the grid on the canvas. This method makes explicity assumptions about the size of the canvas
    // relative to the grid size. These rules are enforced in the constructor.
    Board.prototype.drawGrid = function() {
        var strokeStyle = 'rgba(0, 0, 0, 0.05)';

        for (var i = 0; i <= this.m_grid_x; i++)
        {
            var x = i * (this.m_grid_size + 1);

            this.m_canvas.drawLine({
                strokeStyle: strokeStyle,
                strokeWidth: 1,
                x1: x, y1: 0,
                x2: x, y2: this.m_height_px
            });
        }

        for (var i = 0; i <= this.m_grid_y; i++)
        {
            var y = i * (this.m_grid_size + 1);

            this.m_canvas.drawLine({
                strokeStyle: strokeStyle,
                strokeWidth: 1,
                x1: 0, y1: y,
                x2: this.m_width_px, y2: y
            });
        }
    }

    // Paint the grid system. Each cell is either blocked, resulting in black, or the weight is used to
    // determine the opacity.
    Board.prototype.paintGrid = function() {
        var grid = this.m_grid;
        var canvas = this.m_canvas;
        var grid_size = this.m_grid_size;

        $.each(grid, function(x) {
            $.each(grid[x], function(y) {
                var cell = grid[x][y];
                var style = 'rgba(40, 88, 200, ' + cell.weight + ')';

                if (cell['start']) {
                    style = 'rgb(20, 240, 20)';
                } else if (cell['end']) {
                    style = 'rgb(240, 20, 20)';
                } else if (!cell['blocked']) {
                    style = 'rgba(40, 88, 180, ' + cell.weight + ')';
                }

                canvas.drawRect({
                    fillStyle: style,
                    x: x * (grid_size + 1) + 1,
                    y: y * (grid_size + 1) + 1,
                    height: grid_size,
                    width: grid_size,
                    fromCenter: false
                });
            });
        });
    }

    return Board;
})();
