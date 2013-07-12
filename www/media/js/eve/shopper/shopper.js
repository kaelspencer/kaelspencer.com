var EveShopper = (function() {

    function EveShopper() {
        this.m_api = 'http://api.eve-central.com/api/';
        this.m_apiRoute = this.m_api + 'route/';
        this.m_apiQuicklook = this.m_api + 'quicklook';
        this.m_everest = 'http://10.10.0.10/';
        //this.m_everest = 'http://everest.kaelspencer.com/'
        this.m_everestJumpCount = this.m_everest + 'jump/station/';
        this.m_currentStation = undefined;
        this.m_currentStationBestPrice = undefined;
        this.m_sellOrders = undefined;
        this.m_jumpCount = [];
        this.m_jumpLimit = 0;
    };

    EveShopper.prototype.shop = function(validator) {
        $('#loading_indicator').show().children().removeClass('loading_stop');

        this.m_currentStation = validator.currentLocation();
        this.m_jumpLimit = validator.jumpLimit();

        $.ajax({
            url: this.m_apiQuicklook + '?typeid=' + validator.item(),
            //url: '/media/js/eve/shopper/quicklook.xml',
            dataType: 'xml',
            context: this,
            success: this.onQuicklook,
            error: function(xhr, status) { this.errorHandler('quicklook', xhr, status); }
        }).done(function() {
            this.updateJumpCounts(this.m_sellOrders);
        });
    };

    EveShopper.prototype.errorHandler = function(fetchItem, xhr, status) {
        var message = 'Failed to fetch ' + fetchItem + '. HTTP ' + xhr.status + ' (' + status + ')';
        console.log(message);
        $('#status').text(message).show();
        $('#loading_indicator').hide().children().addClass('loading_stop');
    };

    EveShopper.prototype.onQuicklook = function(data) {
        var xml = $(data).children('evec_api').children('quicklook');
        var sell = xml.children('sell_orders').children('order');
        var buy = xml.children('buy_orders').children('order');
        var sellOrders = Array();

        $('#sell_header').text('Sell Orders: ' + xml.children('itemname').text());

        sell.each(function(key, value) {
            var order = {
                'station_id': $(value).children('station').text().trim(),
                'station_name': $(value).children('station_name').text().trim(),
                'price': parseInt($(value).children('price').text().trim())
            };
            sellOrders.push(order);

            if (order.station_name == this.m_currentStation &&
                (this.m_currentStationBestPrice === undefined || this.m_currentStationBestPrice > order.price)) {
                    this.m_currentStationBestPrice = order.price;
            }
        }.bind(this));

        sellOrders.sort(function(a, b) {
            return (a.price == b.price ? 0 : (a.price < b.price ? -1 : 1));
        });

        this.m_sellOrders = sellOrders;
    };

    EveShopper.prototype.updateJumpCounts = function(orders) {
        var url = this.m_everestJumpCount + this.m_currentStation + '/';
        var requests = [];

        // After these requests are complete, draw the table.
        var self = this;
        $(document).ajaxStop(function() {
            $(this).unbind('ajaxStop');
            self.drawTable();
        });

        $.each(orders, function(key, value) {
            if (!(value.station_name in this.m_jumpCount)) {
                this.m_jumpCount[value.station_name] = 0;

                requests.push($.ajax({
                    url: url + value.station_name,
                    dataType: 'json',
                    context: this,
                    success: function(data) { this.m_jumpCount[value.station_name] = data.jumps; },
                    error: function(xhr, status) {
                        console.log('Failed to fetch jump count for ' + value.station_name + '. HTTP ' + xhr.status + ' (' + status + ')');
                        this.m_jumpCount[value.station_name] = undefined;
                    }
                }));
            }

            orders[key].system = 'TBA';
        }.bind(this));
    };

    EveShopper.prototype.drawTable = function() {
        var container = $('#sell_orders tbody');
        var count = 0;

        var fnSavings = function(price, jumps) {
            var totalSavings = Math.round((this.m_currentStationBestPrice - price) / this.m_currentStationBestPrice * 1000) / 10;
            var perJumpSavings = (jumps == 0 ? 0 : Math.round(totalSavings / jumps * 10) / 10);
            return perJumpSavings.toString() + '%';
        }.bind(this);

        $.each(this.m_sellOrders, function(key, value) {
            if (this.m_jumpCount[value.station_name] === undefined) return;
            if (this.m_jumpLimit > 0 && this.m_jumpCount[value.station_name] > this.m_jumpLimit) return;
            count++;

            container.append($('<tr />')
                .append($('<td />', { text: value.station_name }))
                .append($('<td />', { text: value.price.toLocaleString() }))
                .append($('<td />', { text: fnSavings(value.price, this.m_jumpCount[value.station_name]) }))
                .append($('<td />', { text: this.m_jumpCount[value.station_name] })));
        }.bind(this));

        if (count > 0) {
            $('#sell_orders').tablesorter({ sortList: [[2, 1], [3, 0]] }).show();
        } else {
            $('#status').text('No items were retrieved').show();
        }

        $('#loading_indicator').hide().children().addClass('loading_stop');
    };

    return EveShopper;
})();
