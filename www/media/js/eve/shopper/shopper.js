var EveShopper = (function() {

    function EveShopper() {
        this.m_api = 'http://api.eve-central.com/api/';
        this.m_apiRoute = this.m_api + 'route/';
        this.m_apiQuicklook = this.m_api + 'quicklook';
    };

    EveShopper.prototype.runTest = function() {
        $.ajax({
            //url: this.m_apiQuicklook + '?typeid=4305',
            url: '/media/js/eve/shopper/quicklook.xml',
            dataType: 'xml',
            success: this.onQuicklook
        });
    };

    EveShopper.prototype.onQuicklook = function(data) {
        var xml = $(data).children('evec_api').children('quicklook');
        var sell = xml.children('sell_orders').children('order');
        var buy = xml.children('buy_orders').children('order');
        var container = $('#sell_orders');

        var sellOrders = Array();

        sell.each(function() {
            sellOrders.push({
                'station_id': $(this).children('station').text(),
                'station_name': $(this).children('station_name').text(),
                'price': $(this).children('price').text()
            });
        });

        sellOrders.sort(function(a, b) {
            return (a.price == b.price ? 0 : (a.price < b.price ? -1 : 1));
        });

        $.each(sellOrders, function() {
            var tr = $('<tr />');
            tr.append($('<td />', { text: this.station_name }));
            tr.append($('<td />', { text: '0' }));
            tr.append($('<td />', { text: this.price }));

            container.append(tr);
        });
    };

    return EveShopper;
})();
