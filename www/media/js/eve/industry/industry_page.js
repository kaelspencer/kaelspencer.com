(function() {
    $(function() {
        $('#loading_indicator').show().children().removeClass('loading_stop');

        var industry = new EveIndustry();
        industry.industrate(handleResults, onDrawComplete);
    });

    function handleResults(results) {
        var table = $('#industry tbody');
        var best = { 'iph24': 0, 'valid': false };

        $.each(results, function(i, result) {
            if (result.valid) {
                if (result.iph24 > best.iph24 || !best.valid) {
                    best = result;
                }
            }
        });

        if (best.valid && best.iph24 > 0) {
           table.append($('<tr />')
                .append($('<td />', { html: '<a href="/eve/industry/' + best.itemid + '/">' + best.typeName + '</a>' }))
                .append($('<td />', { text: best.decryptor.name }))
                .append($('<td />', { text: best.volume }))
                .append($('<td />', { text: K.prettyTime(best.production_time * 60 * 60) }))
                .append($('<td />', { text: K.comma((best.net / best.production_time).toFixed(0)) }))
                .append($('<td />', { text: K.comma((best.net / best.production_time24).toFixed(0)) }))
                .append($('<td />', { html: K.comma(best.ipd.toFixed(0)) })));
        }
    }

    function onDrawComplete() {
        $('#industry').tablesorter({ sortList: [[5, 1]]}).show();
        $('#loading_indicator').hide().children().addClass('loading_stop');
    }
})();
