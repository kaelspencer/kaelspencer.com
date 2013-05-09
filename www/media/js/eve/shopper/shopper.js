var EveShopper = (function() {

    function EveShopper() {
        this.m_api = 'http://api.eve-central.com/api/';
        this.m_apiRoute = this.m_api + 'route/';
        this.m_apiQuicklook = this.m_api + 'quicklook';
        this.m_everest = 'http://localhost:5000/';
        //this.m_everest = 'http://everest.kaelspencer.com/'
        this.m_everestJumpCount = this.m_everest + 'jump/station/';
        this.m_currentStation = 'Jita IV - Moon 4 - Caldari Navy Assembly Plant';
        this.m_sellOrders = undefined;
        this.m_jumpCount = [];
    };

    EveShopper.prototype.runTest = function() {
        $.ajax({
            //url: this.m_apiQuicklook + '?typeid=4305',
            url: '/media/js/eve/shopper/quicklook.xml',
            dataType: 'xml',
            context: this,
            success: this.onQuicklook
        }).done(function() {
            this.updateJumpCounts(this.m_sellOrders);
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
                'station_id': $(this).children('station').text().trim(),
                'station_name': $(this).children('station_name').text().trim(),
                'price': $(this).children('price').text().trim()
            });
        });

        sellOrders.sort(function(a, b) {
            return (a.price == b.price ? 0 : (a.price < b.price ? -1 : 1));
        });

        this.m_sellOrders = sellOrders;
    };

    EveShopper.prototype.updateJumpCounts = function(orders) {
        that = this;
        url = this.m_everestJumpCount + this.m_currentStation + '/';
        requests = [];

        $.each(orders, function(key, value) {
            if (!(value.station_name in that.m_jumpCount)) {
                console.log(url + value.station_name + '/');
                that.m_jumpCount[value.station_name] = 0;

                requests.push($.ajax({
                    url: url + value.station_name + '/',
                    dataType: 'json',
                    context: this,
                    success: function(data) {
                        that.m_jumpCount[value.station_name] = data.jumps;
                    }
                }));
            }

            orders[key].system = 'TBA';
        });

        $.when.apply($, requests).done(function() { that.drawTable(that); });
    };

    EveShopper.prototype.drawTable = function(that) {
        var container = $('#sell_orders tbody');
        var odd = true;

        $.each(that.m_sellOrders, function() {
            var tr = $('<tr />')
                .append($('<td />', { text: this.system }))
                .append($('<td />', { text: this.station_name }))
                .append($('<td />', { text: that.m_jumpCount[this.station_name] }))
                .append($('<td />', { text: this.price }));

            if (odd = !odd) {
                tr.addClass('odd');
            }

            container.append(tr);
        });
    };

    return EveShopper;
})();
