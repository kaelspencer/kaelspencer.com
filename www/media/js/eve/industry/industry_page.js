(function() {
    var resultsHandled = false;

    $(function() {
        $('#loading_indicator').show().children().removeClass('loading_stop');

        var industry = new EveIndustry.Overview();
        industry.industrate(handleResults, onDrawComplete);

        $('#search').submit(function() {
            var validator = new Validator();

            if (validator.validate()) {
                //var industry = new EveIndustry.Overview();
                //industry.industrate(handleResults, onDrawComplete);
            }

            return false;
        });
    });

    function handleResults(results) {
        var table = $('#industry tbody');
        var best = { 'stipd': { 'stipd': 0}, 'valid': false };
        resultsHandled = true;

        $.each(results, function(i, result) {
            if (result.valid) {
                if (result.stipd.stipd > best.stipd.stipd || !best.valid) {
                    best = result;
                }
            }
        });

        if (best.valid && best.stipd.stipd > 0) {
           table.append($('<tr />')
                .append($('<td />', { html: '<a href="/eve/industry/' + best.itemid + '/">' + best.typeName + '</a>' }))
                .append($('<td />', { text: best.decryptor.name }))
                .append($('<td />', { text: best.volume }))
                .append($('<td />', { text: K.prettyTime(best.productionTime * 60 * 60) }))
                .append($('<td />', { text: best.vbr.toFixed(1) + ' (' + (best.vbr * best.mtipd.bpo).toFixed(1) + ')' }))
                .append($('<td />', { html: K.comma(best.stipd.stipd.toFixed(0)) }))
                .append($('<td />', { html: K.comma(best.mtipd.mtipd.toFixed(0)) })));
        }
    }

    function onDrawComplete() {
        if (resultsHandled) {
            $('#industry').tablesorter({ sortList: [[6, 1]]}).show();
        }

        $('#loading_indicator').hide().children().addClass('loading_stop');
    }
})();
