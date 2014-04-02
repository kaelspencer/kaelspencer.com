(function() {
    var name = false;
    var resultsHandled = false;

    $(function() {
        $('#loading_indicator').show().children().removeClass('loading_stop');

        $('.segment .segment-header a').click(function() {
            $(this).parent().parent().parent().children('section').toggle();
            return false;
        });

        var industry = new EveIndustry.Overview();
        industry.industrate_detail(itemid, handleResults, onDrawComplete, handleOverview);
    });

    function handleResults(results) {
        var decryptors = $('#industry_decryptors tbody');
        var mpd = $('#industry_mpd tbody');
        resultsHandled = true;

        $.each(results, function(i, result) {
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
                    .append($('<td />', { html: K.comma(result.stipd.stipd.toFixed(0)) }))
                    .append($('<td />', { html: K.comma(result.mtipd.mtipd.toFixed(0)) + ' (' + result.mtipd.bpo + ')' })));

                mpd.append($('<tr />')
                    .append($('<td />', { text: result.decryptor.name }))
                    .append($('<td />', { text: K.comma(result.stipd.copiesPerDay.toFixed(2)) }))
                    .append($('<td />', { text: K.comma(result.stipd.bpcPerDay.toFixed(2)) }))
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
            $('#industry_decryptors').tablesorter({ sortList: [[5, 1]]}).show();
            $('#industry_mpd').tablesorter({ sortList: [[3, 1]]}).show();
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
