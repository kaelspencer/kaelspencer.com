var Board = (function() {
    // Board constructor.
    function Board(){
        this.m_width = 900;
        this.m_height = 500;
    };

    Board.prototype.getWidth = function() {
        return this.m_width;
    }

    Board.prototype.setWidth = function(width) {
        this.m_width = width;
    }

    return Board;
})();
