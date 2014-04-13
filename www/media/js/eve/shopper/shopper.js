var EveShopper = (function() {

    function EveShopper() {
        this.m_api = 'http://api.eve-central.com/api/';
        this.m_apiQuicklook = this.m_api + 'quicklook';
        //this.m_everest = 'http://127.0.0.1:5000/';
        this.m_everest = 'http://everest.kaelspencer.com/'
        this.m_everestJumpBatch = this.m_everest + 'jump/batch/';
        this.m_currentStation = undefined;
        this.m_sellOrders = undefined;
        this.m_jumpCount = [];
        this.m_jumpLimit = 0;
        this.m_bestPrices = [];
        this.m_bestPrice = 0;
        this.m_bestPriceJumps = 0;
        this.m_avoidance = 'none';
        this.m_bucket = 0;
        this.m_tradeHubs =[
            'Jita IV - Moon 4 - Caldari Navy Assembly Plant',
            'Amarr VIII (Oris) - Emperor Family Academy',
            'Rens VI - Moon 8 - Brutor Tribe Treasury',
            'Dodixie IX - Moon 20 - Federation Navy Assembly Plant',
            'Hek VIII - Moon 12 - Boundless Creation Factory'
        ]
    };

    EveShopper.prototype.shop = function(validator) {
        $('#loading_indicator').show().children().removeClass('loading_stop');

        this.clean();

        this.m_currentStation = validator.currentLocation();
        this.m_jumpLimit = validator.jumpLimit();
        this.m_avoidance = validator.avoidance();
        this.m_bucket = validator.bucket();

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

    EveShopper.prototype.clean = function() {
        var table = $('#sell_orders');
        table.find('tbody').children().remove();
        table.trigger('destroy');
        this.m_currentStation = undefined;
        this.m_sellOrders = undefined;
        this.m_jumpCount = [];
        this.m_jumpLimit = 0;
        this.m_bestPrices = [];
        this.m_bestPrice = 0;
        this.m_bestPriceJumps = 0;
        this.m_avoidance = 'none';
        this.m_bucket = 0;
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
                'price': parseFloat($(value).children('price').text().trim()),
                'quantity': parseInt($(value).children('vol_remain').text().trim()),
                'trade_hub': this.m_tradeHubs.indexOf($(value).children('station_name').text().trim()) >= 0,
                'sec': parseFloat($(value).children('security').text().trim()),
            };
            sellOrders.push(order);
        }.bind(this));

        sellOrders.sort(function(a, b) {
            return (a.price == b.price ? 0 : (a.price < b.price ? -1 : 1));
        });

        this.m_sellOrders = sellOrders;
    };

    EveShopper.prototype.updateJumpCounts = function(orders) {
        var postdata = {
            source: this.m_currentStation,
            avoidance: this.m_avoidance,
            destinations: []
        };

        // Add all of the destinations.
        var self = this;
        $.each(orders, function(key, value) {
            if (!(value.station_name in self.m_jumpCount)) {
                self.m_jumpCount[value.station_name] = 0;
                postdata.destinations.push(value.station_name);
            }
        });

        $.ajax({
            url: this.m_everestJumpBatch,
            data: JSON.stringify(postdata),
            contentType: 'application/json; charset=utf-8',
            type: 'POST',
            dataType: 'json',
            success: function(data) {
                $.each(data.destinations, function(key, value) {
                    if (value.jumps >= 0) {
                        self.m_jumpCount[value.destination] = value.jumps;
                    } else {
                        self.m_jumpCount[value.destination] = undefined;
                    }
                });

                // Update the best prices list.
                $.each(orders, function(key, value) {
                    var jumpCount = self.m_jumpCount[value.station_name];

                    if (jumpCount !== undefined && (!(jumpCount in self.m_bestPrices) || self.m_bestPrices[jumpCount] > value.price)) {
                        self.m_bestPrices[jumpCount] = value.price;
                    }
                });

                self.ensureBestPrice();
                self.drawTable();
            },
            error: function(xhr, status) {
                self.errorHandler('jump counts', xhr, status);
            }
        });
    };

    EveShopper.prototype.ensureBestPrice = function() {
        $.each(this.m_bestPrices, function(key, value) {
            if (value !== undefined) {
                this.m_bestPrice = value;
                this.m_bestPriceJumps = key;
                return false;
            }
        }.bind(this));
    };

    EveShopper.prototype.drawTable = function() {
        var container = $('#sell_orders tbody');
        var count = 0;

        var fnSavings = function(price, jumps) {
            var totalSavings = Math.round((this.m_bestPrice - price) / this.m_bestPrice * 1000) / 10;
            var jumpDiff = jumps - this.m_bestPriceJumps;
            var perJumpSavings = (jumpDiff == 0 ? 0 : Math.round(totalSavings / jumpDiff * 10) / 10);
            return perJumpSavings.toString() + '%';
        }.bind(this);

        var fnSecTag = function(security) {
            var cls = 'secNull';
            if (security >= 0.5) {
                cls = 'secHigh';
            } else if (security > 0) {
                cls = 'secLow';
            }
            return $('<span />', { class: cls, text: ' (' + security.toFixed(1) + ')' });
        }

        var orders = this.bucketize(this.m_sellOrders);

        $.each(orders, function(key, value) {
            // If the bucket size is not 0, bucketize has run. That means these checks have already been done.
            if (this.m_bucket == 0) {
                if (this.m_jumpCount[value.station_name] === undefined) return;
                if (this.m_jumpLimit > 0 && this.m_jumpCount[value.station_name] > this.m_jumpLimit) return;
            }
            count++;

            var row = $('<tr />')
                .append($('<td />', { text: value.station_name })
                    .append(fnSecTag(value.sec)))
                .append($('<td />', { text: value.price.toFixed(2).toLocaleString() }))
                .append($('<td />', { text: fnSavings(value.price, this.m_jumpCount[value.station_name]) }))
                .append($('<td />', { text: value.quantity }))
                .append($('<td />', { text: this.m_jumpCount[value.station_name] }));

            if (value.trade_hub) {
                row.addClass('tradehub');
            }

            container.append(row);
        }.bind(this));

        if (count > 0) {
            $('#sell_orders').tablesorter({ sortList: [[2, 1], [4, 0]] }).show();
        } else {
            $('#status').text('No items were retrieved').show();
        }

        $('#loading_indicator').hide().children().addClass('loading_stop');
    };

    EveShopper.prototype.bucketize = function(orders) {
        // 0 means no buckets. Return what was passed in.
        if (this.m_bucket == 0) {
            return orders;
        }

        var buckets = undefined;

        $.each(orders, function(key, value) {
            if (this.m_jumpCount[value.station_name] === undefined) return;
            if (this.m_jumpLimit > 0 && this.m_jumpCount[value.station_name] > this.m_jumpLimit) return;
            if (buckets === undefined) {
                buckets = [value];
                return;
            }

            var current = buckets[buckets.length - 1];

            if (current.station_id != value.station_id || current.price * (1 + this.m_bucket) < value.price) {
                buckets.push(value);
            } else {
                current.quantity += value.quantity;
            }
        }.bind(this));

        return buckets;
    };

    return EveShopper;
})();
