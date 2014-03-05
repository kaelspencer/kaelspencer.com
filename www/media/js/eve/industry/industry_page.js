(function() {
    $(function() {
        $('#loading_indicator').show().children().removeClass('loading_stop');

        var industry = new EveIndustry();
        industry.industrate(handleResults, onDrawComplete);
    });

    function handleResults(results) {
        var table = $('#industry tbody');
        var best = { 'tipd': 0, 'valid': false };

        $.each(results, function(i, result) {
            if (result.valid) {
                if (result.tipd > best.tipd || !best.valid) {
                    best = result;
                }
            }
        });

        if (best.valid && best.tipd > 0) {
           table.append($('<tr />')
                .append($('<td />', { html: '<a href="/eve/industry/' + best.itemid + '/">' + best.typeName + '</a>' }))
                .append($('<td />', { text: best.decryptor.name }))
                .append($('<td />', { text: best.volume }))
                .append($('<td />', { text: K.prettyTime(best.productionTime * 60 * 60) }))
                .append($('<td />', { text: K.comma(best.iph.toFixed(0)) }))
                .append($('<td />', { text: K.comma(best.iph24.toFixed(0)) }))
                .append($('<td />', { html: K.comma(best.tipd.toFixed(0)) })));
        }
    }

    function onDrawComplete() {
        $('#industry').tablesorter({ sortList: [[6, 1]]}).show();
        $('#loading_indicator').hide().children().addClass('loading_stop');
    }
})();
