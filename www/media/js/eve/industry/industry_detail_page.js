(function() {
    var name = false;
    var resultsHandled = false;

    $(function() {
        $('#loading_indicator').show().children().removeClass('loading_stop');

        $('.segment .segment-header a').click(function() {
            $(this).parents('.segment').children('section').toggle();
            return false;
        });

        var industry = new EveIndustry.Detail();
        industry.industrate(itemid, handleResults, onDrawComplete, handleOverview);
    });

    function handleResults(results) {
        var decryptors = $('#industry_decryptors tbody');
        var mpd = $('#industry_mpd tbody');
        resultsHandled = true;

        // Get the current date as a key. Because of timezones, it's possible it is "yesterday".
        var d = new Date();
        var ds = d.getFullYear() + '-' + K.pad(d.getMonth() + 1, 2, '0') + '-' + K.pad(d.getDate(), 2, '0');

        if (!results.hasOwnProperty(ds)) {
            d.setDay(d.getDate() - 1);
            ds = d.getFullYear() + '-' + K.pad(d.getMonth() + 1, 2, '0') + '-' + K.pad(d.getDate(), 2, '0');

            if (!results.hasOwnProperty(ds)) {
                console.log(results);
                throw new Error('What day is it?! Current date: ' + ds + ', not found in result set.');
            }

            console.log('Using yesterday as current date: ' + ds);
        }

        $.each(results[ds], function(i, result) {
            if (result.valid) {
                if (!name) {
                    name = true;
                    $('#typename').text(result.typeName);
                }
                decryptors.append($('<tr />')
                    .append($('<td />', { text: result.decryptor.name }))
                    .append($('<td />', { text: K.prettyTime(result.productionTime * 60 * 60) }))
                    .append($('<td />', { text: result.runs }))
                    .append($('<td />', { text: K.comma(result.iph.toFixed(0)) }))
                    .append($('<td />', { text: K.comma(result.iph24.toFixed(0)) }))
                    .append($('<td />', { text: result.vbr.toFixed(1) + ' (' + (result.vbr * result.mtipd.bpo).toFixed(1) + ')' }))
                    .append($('<td />', { html: K.comma(result.stipd.stipd.toFixed(0)) }))
                    .append($('<td />', { html: K.comma(result.mtipd.mtipd.toFixed(0)) + ' (' + result.mtipd.bpo + ')' })));

                mpd.append($('<tr />')
                    .append($('<td />', { text: result.decryptor.name }))
                    .append($('<td />', { text: K.comma(result.stipd.copiesPerDay.toFixed(2)) }))
                    .append($('<td />', { text: K.comma(result.stipd.bpcPerDay.toFixed(2)) }))
                    .append($('<td />', { text: result.vbr.toFixed(1) }))
                    .append($('<td />', { html: K.comma(result.stipd.stipd.toFixed(2)) })));
            }
        });
    }

    function handleOverview(item) {
        $('#bpo tr').eq(0).children().eq(1).text(item.categoryName);
        $('#bpo tr').eq(1).children().eq(1).text(item.t1bpo.typeName);
        $('#bpo tr').eq(2).children().eq(1).text(K.prettyTime(item.copyTime));
        $('#bpo tr').eq(3).children().eq(1).text(item.vol);

        $('#datacores tr').eq(0).children().eq(1).text(getDecryptorCategory(item.decryptor_category));
        $('#datacores tr').eq(1).children().eq(1).text(item.datacores[0].typeName + ' (x' + item.datacores[0].quantity + ')');
        $('#datacores tr').eq(2).children().eq(1).text(item.datacores[1].typeName + ' (x' + item.datacores[1].quantity + ')');
    }

    function onDrawComplete() {
        if (resultsHandled) {
            $('.show-on-load').show();
            $('#industry_decryptors').tablesorter({ sortList: [[6, 1]]}).show();
            $('#industry_mpd').tablesorter({ sortList: [[4, 1]]}).show();
        }

        $('#loading_indicator').hide().children().addClass('loading_stop');
    }

    // Decryptor Group IDs: 728, 729, 730, 731
    // 728: Amarr      Occult
    // 729: Minmatar   Cryptic
    // 730: Gallente   Incognito
    // 731: Caldari    Esoteric
    function getDecryptorCategory(id) {
        switch(id) {
            case 728:
                return 'Occult'
            case 729:
                return 'Cryptic'
            case 730:
                return 'Incognito'
            case 731:
                return 'Esoteric'
            default:
                return 'Error! ID ' + id
        }
    }
})();
