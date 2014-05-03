(function() {
    var resultsHandled = false;

    $(function() {
        $('#search').submit(function() {
            var validator = new Validator();

            if (validator.validate()) {
                $('#loading_indicator').show().children().removeClass('loading_stop');
                $('#industry').trigger('destroy').hide().find('tbody').children().remove();

                var industry = new EveIndustry.Overview();
                industry.industrate(validator, handleResults, onDrawComplete);
            }

            return false;
        });

        $('input.toggle').change(function() {
            if (this.checked) {
                $('#all').prop('checked', false);
            }
        });

        $('#all').change(function() {
            if (this.checked) {
                $('input.toggle').prop('checked', false);
            }
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
                .append($('<td />', { text: best.stipd.mftp.toFixed(2) + ' (' + best.mtipd.mftp.toFixed(2) + ')' }))
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
