var Board = (function() {
    // Board constructor.
    // Grid size is the number of empty pixels between the lines.
    // Grid X & Y are the count of cells in each direction.
    function Board(canvas_id, grid_size, grid_x, grid_y){
        this.m_canvas = $(canvas_id);
        this.m_grid_size = grid_size;
        this.m_grid_x = grid_x;
        this.m_grid_y = grid_y;

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

        // Create a multidimensional array that will represent the grid.
        var grid = new Array(this.m_grid_x);
        $.each(grid, function(i) {
            grid[i] = new Array(grid_y);
            $.each(grid[i], function(j) {
                grid[i][j] = 0.0;
            });
        });

        this.m_grid = grid;

        console.log('canvas height: ' + this.m_canvas.height());
        console.log('canvas width : ' + this.m_canvas.width());
    };

    Board.prototype.updateCell = function(x, y, delta) {
        if (x < 0 || x >= this.m_grid_x) {
            throw "Invalid x value in Board.updateCell";
        }

        if (y < 0 || y >= this.m_grid_y) {
            throw "Invalid y value in Board.updateCell";
        }

        this.m_grid[x][y] += delta;
    };

    Board.prototype.drawGrid = function() {
        var strokeStyle = 'rgba(0, 0, 0, 0.1)';

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

    Board.prototype.paintGrid = function() {
        var grid = this.m_grid;
        var canvas = this.m_canvas;
        var grid_size = this.m_grid_size;

        $.each(grid, function(x) {
            $.each(grid[x], function(y) {
                //console.log('(' + x + ', ' + y + '): ' + grid[x][y]);
                canvas.drawRect({
                    fillStyle: 'rgba(40, 88, 180, ' + grid[x][y] + ')',
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
