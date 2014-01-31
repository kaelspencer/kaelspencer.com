var EveIndustry = (function() {

    function EveIndustry() {
        this.m_api = 'http://api.eve-central.com/api/marketstat?';
        this.m_everest = 'http://localhost:5000/';
        //this.m_everest = 'http://10.10.0.10/';
        //this.m_everest = 'http://everest.kaelspencer.com/'
        this.m_everestIndustry = this.m_everest + "industry/norigs/names/";
        this.m_pe = 5; // Production Effeciency Skill
        this.m_ind = 5; // Industry Skill
        this.m_imp = 1; // Implant: 1 - % benefit
        this.m_slt = 0.75 // Slot modifier (POS).
        this.m_logLevel = 0; // 0 is important only, 1 is verbose, 2 is very verbose.

        this.m_uniquePriceItems = [];
        this.m_decryptors = [
            { 'name': 'None', 'probability': 1, 'run': 0, 'me': 0, 'pe': 0,
                'items': { '728': 0, '729': 0, '730': 0, '731': 0 }},
            { 'name': 'Accelerant', 'probability': 1.2, 'run': 1, 'me': 2, 'pe': 5,
                'items': { '728': 23179, '729': 21580, '730': 23184, '731': 21574 }},
            { 'name': 'Attainment', 'probability': 1.8, 'run': 4, 'me': -1, 'pe': 2,
                'items': { '728': 23182, '729': 21583, '730': 23187, '731': 21577 }},
            { 'name': 'Augmentation', 'probability': 0.6, 'run': 9, 'me': -2, 'pe': 1,
                'items': { '728': 23181, '729': 21582, '730': 23186, '731': 21576 }},
            { 'name': 'Parity', 'probability': 1.5, 'run': 3, 'me': 1, 'pe': -1,
                'items': { '728': 33315, '729': 33318, '730': 33320, '731': 33319 }},
            { 'name': 'Process', 'probability': 1.1, 'run': 0, 'me': 3, 'pe': 3,
                'items': { '728': 23178, '729': 21579, '730': 23183, '731': 21573 }},
            { 'name': 'Symmetry', 'probability': 1.0, 'run': 2, 'me': 1, 'pe': 4,
                'items': { '728': 23180, '729': 21581, '730': 23185, '731': 21575 }},
            { 'name': 'Optimized Attainment', 'probability': 1.9, 'run': 2, 'me': 1, 'pe': -1,
                'items': { '728': 33317, '729': 33324, '730': 33326, '731': 33325 }},
            { 'name': 'Optimized Augmentation', 'probability': 0.9, 'run': 7, 'me': 2, 'pe': 0,
                'items': { '728': 33316, '729': 33321, '730': 33323, '731': 33322 }}
        ];
    };

    EveIndustry.prototype.industrate = function(validator) {
        $('#loading_indicator').show().children().removeClass('loading_stop');

        $.ajax({ url: this.m_everestIndustry, context: this, })
            .done(this.onLoadIndustryItems)
            .fail(function(xhr, status) { this.errorHandler('industy list', xhr, status); });
    };

    EveIndustry.prototype.errorHandler = function(fetchItem, xhr, status) {
        var message = 'Failed to fetch ' + fetchItem + '. HTTP ' + xhr.status + ' (' + status + ')';
        this.log(message, 0);
        $('#status').text(message).show();
        $('#loading_indicator').hide().children().addClass('loading_stop');
    };

    // Called upon return from everest. Contains a list of inventable items and their information.
    EveIndustry.prototype.onLoadIndustryItems = function(industry_data) {
        if (!industry_data.hasOwnProperty('items')) {
            this.errorHandler('industry items from everest', '', '')
            return false;
        }
        var that = this;

        // First loop through the result set. Just get the item ID's and store them in a unique list.
        $.each(industry_data.items, function(itemid, item) {
            that.addUniquePriceItem(itemid);

            $.each(item.perfectMaterials, function(i, material) {
                that.addUniquePriceItem(material.typeID);
            });

            $.each(item.datacores, function(k, datacore) {
                that.addUniquePriceItem(datacore.typeID);
            });
        });

        // Now loop through all of the different decryptors and add them to the unique list.
        $.each(this.m_decryptors, function(decryptor_name, decryptor) {
            $.each(decryptor.items, function(category, itemid) {
                that.addUniquePriceItem(itemid);
            });
        });

        // Fetch all of the price data, then process each item and decryptor combination.
        $.when.apply($, this.fetchPriceData())
            .done(function() {
                var table = $('#industry tbody');
                $.each(industry_data.items, function(itemid, item) {
                    $.each(that.m_decryptors, function(k, decryptor) {
                        var valid = that.processItem(itemid, item, decryptor, table);

                        if (!valid) {
                            this.log('Unable to fetch all details for ' + item.typeName + ' (' + itemid + ').', 0);
                            return false;
                        }
                    });
                });

                $('#industry').tablesorter({ sortList: [[4, 1]]}).show();
                $('#loading_indicator').hide().children().addClass('loading_stop');
            })
            .fail(function(xhr, status) { this.errorHandler('industy list', xhr, status); })
    };

    // Called upon return from EVE-Central with price data.
    EveIndustry.prototype.onLoadPriceData = function(price_data) {
        var types = $(price_data).children('evec_api').children('marketstat').children('type');
        var that = this;

        types.each(function(key, value) {
            if (that.m_uniquePriceItems.hasOwnProperty($(this).attr('id'))) {
                var cost = parseFloat($(this).children('sell').children('min').text().trim());

                if (!isNaN(cost)) {
                    that.m_uniquePriceItems[$(this).attr('id')] = cost;
                }
            }
        });
    };

    // Calculate all of the good information about the blueprint.
    EveIndustry.prototype.processItem = function(itemid, item, decryptor, table) {
        // An item will be marked as invalid if one of the materials doesn't have a valid price associated with it.
        var valid = true;
        var that = this;
        var bp_pe = -4 + decryptor.pe;
        var bp_me = -4 + decryptor.me;
        var runs = item.maxProductionLimit / 10 + decryptor.run;
        var pt = this.calculateProductionTime(item.productionTime, this.m_ind, this.m_imp, this.m_slt, item.productivityModifier, bp_pe);

        // Production time is in hour units and is for the entire blueprint (not each individual run).
        // If the production time is an exact multiple of 24 hours, add an extra day. Continuous runs aren't
        // happening.
        pt = pt * runs / (60 * 60);
        var pt24 = Math.ceil(pt / 24) * 24;

        if (pt % 24 == 0) {
            pt24 += 24;
        }

        var matcost = 0;
        var invention = this.calculateInventionCost(item, decryptor);

        $.each(item.perfectMaterials, function(i, material) {
            var materialid = material.typeID;
            var actual = that.calculateActualRequired(material.quantity, item.wasteFactor, bp_me, material.wasteME, that.m_pe, material.wastePE);

            matcost += actual * material.dmg * that.m_uniquePriceItems[materialid];

            // TODO: Should actual be saved?
            that.log('\t' + material.name + ' ' + actual + ' (' + material.quantity + ') -> ' + that.comma(Math.round(actual * material.dmg * that.m_uniquePriceItems[materialid]).toFixed(2)), 2);

            if (that.m_uniquePriceItems[materialid] == 0) {
                valid = false;
                that.log('Failed to fetch price for ' + material.name + ' (' + materialid + ').', 0);
                return false;
            }
        });

        var net = (this.m_uniquePriceItems[itemid] - matcost) * runs - invention;

        if (net > 0 && valid) {
            this.log('Decryptor: ' + decryptor.name, 1);
            this.log('Time: ' + pt.toFixed(2) + ' (' + pt24 + ') hours', 1);
            this.log('Runs: ' + runs, 1);
            this.log('Invention cost per run: ' + this.comma((invention / runs).toFixed(2)), 1);
            this.log('Material price (each): ' + this.comma(matcost.toFixed(2)), 1);
            this.log('Sell price (each): ' + this.comma(this.m_uniquePriceItems[itemid].toFixed(2)), 1);
            this.log('Net: ' + this.comma(net.toFixed(2)), 1);
            this.log('Net per hour: ' + this.comma((net / pt).toFixed(2)), 1);
            this.log('Net per 24 hour: ' + this.comma((net / pt24).toFixed(2)) + '\n', 1);

           table.append($('<tr />')
                .append($('<td />', { text: item.typeName }))
                .append($('<td />', { text: decryptor.name }))
                .append($('<td />', { text: pt.toFixed(2) }))
                .append($('<td />', { text: this.comma((net / pt).toFixed(2)) }))
                .append($('<td />', { text: this.comma((net / pt24).toFixed(2)) })));
       }

       return valid;
    };

    // Given the count for a perfect blueprint, the blueprint's ME, the user's PE, the waste factor of the
    // blueprint and which waste type applies, calculate the actual number of units required.
    EveIndustry.prototype.calculateActualRequired = function(perfect, wf, me, meApplies, pe, peApplies) {
        var actual = perfect;

        if (meApplies) {
            actual += this.calculateWasteME(perfect, me, wf);
        }

        if (peApplies) {
            actual += this.calculateWastePE(perfect, pe);
        }

        return actual;
    };

    // Given the count for a perfect blueprint, the blueprint's ME, and the waste factor of the blueprint,
    // calculate the result of ME waste.
    EveIndustry.prototype.calculateWasteME = function(perfect, me, wf) {
        if (me >= 0) {
            return Math.round(perfect * ((wf / (me + 1)) / 100));
        } else {
            return Math.round(perfect * (wf / 100) * (1 - me));
        }
    };

    // Given the count for a perfect blueprint and the user's PE, calculate the result of PE waste.
    EveIndustry.prototype.calculateWastePE = function(perfect, pe) {
        return perfect * (0.25 - 0.05 * pe);
    };

    // Give the base production time in seconds, industry skill, implant modifier, production slot modifier
    // (POS), productivity modifier (blueprint), and PE of the blueprint, calculate total production time (in seconds).
    EveIndustry.prototype.calculateProductionTime = function(base, industry, implant, slot, modifier, pe) {
        if (pe >= 0) {
            var pt = 1 - (modifier / base) * (pe / (1 + pe));
        } else {
            var pt = 1 - (modifier / base) * (pe - 1);
        }

        return base * pt * (1 - 0.04 * industry) * implant * slot;
    };

    // Calculate the invention cost per resulting run.
    EveIndustry.prototype.calculateInventionCost = function(item, decryptor) {
        // Hardcode encryption and science skills to 4 for now.
        var e = 4, d1 = 4, d2 = 4, meta = 0;
        var chance = item.chance * (1 + (0.01 * e)) * (1 + ((d1 + d1) * (0.1 / (5 - meta)))) * decryptor.probability;

        var costPerAttempt = this.m_uniquePriceItems[item.datacores[0].typeID] * item.datacores[0].quantity +
                             this.m_uniquePriceItems[item.datacores[1].typeID] * item.datacores[1].quantity;
        costPerAttempt += this.m_uniquePriceItems[decryptor.items[item.decryptor_category]];
        var costPerSuccess = costPerAttempt / chance;

        this.log('Invention chance: ' + (chance * 100).toFixed(2) + '%', 1);
        this.log('Raw cost: ' + this.comma(costPerAttempt.toFixed(2)), 1);
        this.log('Decryptor cost (' + decryptor.items[item.decryptor_category] + '): ' + this.comma(this.m_uniquePriceItems[decryptor.items[item.decryptor_category]].toFixed(2), 1))
        this.log('Cost per successful invention: ' + this.comma((costPerSuccess.toFixed(2))), 1);

        return costPerSuccess;
    };

    // Add an element to the price array and ensure uniqueness.
    EveIndustry.prototype.addUniquePriceItem = function(itemid) {
        if (!this.m_uniquePriceItems.hasOwnProperty(itemid)) {
            this.m_uniquePriceItems[itemid] = 0;
        }
    };

    // There is a max length for the HTTP URI. It is easily exceeded. Break it up into multiple
    // requests and return an array of deferrals.
    EveIndustry.prototype.fetchPriceData = function() {
        var pre = this.m_api + 'regionlimit=10000002';
        var url = pre;
        var deferrals = [];

        // 2000 is a reasonable max length. Leave some buffer so no backtracking is necessary.
        var maxLength = 1980;

        $.each(Object.keys(this.m_uniquePriceItems), function(key, val) {
            url += '&typeid=' + val;

            if (url.length > maxLength) {
                // The length was just exceeded. Kick off the request.
                deferrals.push($.ajax({ url: url, context: this }).done(this.onLoadPriceData));
                url = pre;
            }
        }.bind(this));

        if (url != pre) {
            deferrals.push($.ajax({ url: url, context: this }).done(this.onLoadPriceData));
        }

        return deferrals;
    };

    EveIndustry.prototype.comma = function(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    EveIndustry.prototype.log = function(message, level) {
        if (level <= this.m_logLevel) {
            console.log(message);
        }
    };

    return EveIndustry;
})();
