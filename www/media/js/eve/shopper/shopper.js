var EveShopper = (function() {

    function EveShopper() {
        this.m_api = 'http://api.eve-central.com/api/';
        this.m_apiRoute = this.m_api + 'route/';
        this.m_apiQuicklook = this.m_api + 'quicklook';
        this.m_sellOrders = undefined;
        this.m_jumpCount = Array();
    };

    EveShopper.prototype.runTest = function() {
        $.ajax({
            //url: this.m_apiQuicklook + '?typeid=4305',
            url: '/media/js/eve/shopper/quicklook.xml',
            dataType: 'xml',
            context: this,
            success: this.onQuicklook
        }).done(function() {
            console.log(this.m_sellOrders);

            if (this.m_sellOrders) {
                var container = $('#sell_orders tbody');
                var odd = false;

                this.updateJumpCounts(this.m_sellOrders);

                $.each(this.m_sellOrders, function() {
                    var tr = $('<tr />')
                        .append($('<td />', { text: this.station_name }))
                        .append($('<td />', { text: '0' }))
                        .append($('<td />', { text: this.price }))
                        .append($('<td />', { text: this.system }));

                    if (odd) {
                        tr.addClass('odd');
                    }

                    odd = !odd;

                    container.append(tr);
                });
            }
        });
    };

    EveShopper.prototype.onQuicklook = function(data) {
        var xml = $(data).children('evec_api').children('quicklook');
        var sell = xml.children('sell_orders').children('order');
        var buy = xml.children('buy_orders').children('order');
        var sellOrders = Array();

        $('#sell_header').text('Sell Orders: ' + xml.children('itemname').text());

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

        this.m_sellOrders = sellOrders;
    };

    EveShopper.prototype.updateJumpCounts = function(orders) {
        $.each(orders, function(key, value) {
            var split = value.station_name.split(' - ');
            var stationArr = split[0].split(' ');
            var system = stationArr.splice(0, stationArr.length - 1).join(' ');

            orders[key].system = system;
            this.m_jumpCount[system] = 0;
        });

    };

    return EveShopper;
})();
