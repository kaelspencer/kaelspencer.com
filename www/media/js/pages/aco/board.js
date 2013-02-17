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

        console.log('canvas height: ' + this.m_canvas.height());
        console.log('canvas width : ' + this.m_canvas.width());
    };

    Board.prototype.getWidth = function() {
        return this.m_width;
    }

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
            })
        }

        for (var i = 0; i <= this.m_grid_y; i++)
        {
            var y = i * (this.m_grid_size + 1);

            this.m_canvas.drawLine({
                strokeStyle: strokeStyle,
                strokeWidth: 1,
                x1: 0, y1: y,
                x2: this.m_width_px, y2: y
            })
        }
    }

    return Board;
})();
