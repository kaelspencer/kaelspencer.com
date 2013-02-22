(function(){
    var c_grid_size = 5;
    var c_grid_cells_x = 150;
    var c_grid_cells_y = 85;
    var g_aco = null;

    $(function() {
        console.log('bals');
        g_aco = new ACO('canvas', c_grid_size, c_grid_cells_x, c_grid_cells_y);
    });
})();
