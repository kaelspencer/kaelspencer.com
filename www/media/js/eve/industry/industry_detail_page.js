(function() {
    var name = false;

    $(function() {
        $('#loading_indicator').show().children().removeClass('loading_stop');

        var industry = new EveIndustry();
        industry.industrate_detail(itemid, handleResults, onDrawComplete);
    });

    function handleResults(results) {
        var table = $('#industry tbody');

        $.each(results, function(i, result) {
            if (result.valid) {
                if (!name) {
                    name = true;
                    $('#typename').text(result.typeName);
                }
                table.append($('<tr />')
                    .append($('<td />', { text: result.decryptor.name }))
                    .append($('<td />', { text: result.volume }))
                    .append($('<td />', { text: result.production_time.toFixed(2) }))
                    // TODO: Move comma to a common helper.
                    .append($('<td />', { text: (new EveIndustry()).comma((result.net / result.production_time).toFixed(2)) }))
                    .append($('<td />', { text: (new EveIndustry()).comma((result.net / result.production_time24).toFixed(2)) })));
            }
        });
    }

    function onDrawComplete() {
        $('#industry').tablesorter({ sortList: [[4, 1]]}).show();
        $('#loading_indicator').hide().children().addClass('loading_stop');
    }
})();
