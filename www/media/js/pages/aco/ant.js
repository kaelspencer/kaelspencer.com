var Ant = (function() {
    function Ant(board, x, y) {
        this.m_board = board;
        this.m_position = {
            x: x,
            y: y
        };
    }

    Ant.prototype.advance = function() {
        var neighbors = this.m_board.getNeighboringCells(this.m_position.x, this.m_position.y);

        $.each(neighbors, function() {
            console.log('Neighbor (' + this.x + ', ' + this.y + '): ' + this.weight);
        });
    };

    return Ant;
})();
