(function() {
    var name = false;

    $(function() {
        $('#loading_indicator').show().children().removeClass('loading_stop');

        var industry = new EveIndustry();
        industry.industrate_detail(itemid, handleResults, onDrawComplete, handleOverview);
    });

    function handleResults(results) {
        var table = $('#industry_decryptors tbody');

        $.each(results, function(i, result) {
            if (result.valid) {
                if (!name) {
                    name = true;
                    $('#typename').text(result.typeName);
                }
                table.append($('<tr />')
                    .append($('<td />', { text: result.decryptor.name }))
                    .append($('<td />', { text: result.production_time.toFixed(1) }))
                    // TODO: Move comma to a common helper.
                    .append($('<td />', { text: (new EveIndustry()).comma((result.net / result.production_time).toFixed(0)) }))
                    .append($('<td />', { text: (new EveIndustry()).comma((result.net / result.production_time24).toFixed(0)) }))
                    .append($('<td />', { html: '&nbsp;' })));
            }
        });
    }

    function handleOverview(item) {
        $('#bpo tr').eq(0).children().eq(1).text(item.categoryName);
        $('#bpo tr').eq(1).children().eq(1).text(item.t1bpo.typeName);
        $('#bpo tr').eq(2).children().eq(1).text(prettyTime(item.copyTime));
        $('#bpo tr').eq(3).children().eq(1).text(item.vol);

        $('#datacores tr').eq(0).children().eq(1).text(getDecryptorCategory(item.decryptor_category));
        $('#datacores tr').eq(1).children().eq(1).text(item.datacores[0].typeName + ' (x' + item.datacores[0].quantity + ')');
        $('#datacores tr').eq(2).children().eq(1).text(item.datacores[1].typeName + ' (x' + item.datacores[1].quantity + ')');
    }

    function onDrawComplete() {
        $('.table-container').show();
        $('#industry_decryptors').tablesorter({ sortList: [[3, 1]]}).show();
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

    // Convert seconds into a reasonable time format.
    function prettyTime(seconds) {
        var s = Math.floor(seconds) % 60;
        var m = Math.floor(seconds / 60) % 60;
        var h = Math.floor(seconds / (60 * 60)) % 24;
        var d = Math.floor(seconds / (60 * 60 * 24));

        function pad(n) { return ('00' + n).substr(-2); }

        var result = pad(h) + ':' + pad(m) + '::' + pad(s);

        if (d > 0) {
            result = d + 'd ' + result;
        }

        return result;
    }
})();
