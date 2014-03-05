var EveIndustry = (function() {

    function EveIndustry() {
        this.m_apiPrices = 'http://api.eve-marketdata.com/api/item_prices2.json?char_name=Dogen%20Okanata&region_ids=10000002&buysell=s&type_ids='
        this.m_apiVolume = 'http://api.eve-marketdata.com/api/item_history2.json?char_name=Dogen%20Okanata&region_ids=10000002&days=20&type_ids='
        this.m_everest = 'http://everest.kaelspencer.com/'
        //this.m_everest = 'http://localhost:5000/'
        this.m_everestIndustry = this.m_everest + "industry/norigs/names/";
        this.m_everestIndustryDetail = this.m_everest + "industry/detail/names/";
        this.m_pe = 5; // Production Effeciency Skill
        this.m_ind = 5; // Industry Skill
        this.m_indImp = 0.98; // Implant: 1 - % benefit, for manufacturing.
        this.m_copyImp = 0.97; // Implant: 1 - % benefit, for copying.
        this.m_indSlt = 0.75 // Slot modifier (POS) for manufacturing.
        this.m_copySlt = 0.65 // Slot modifier (POS) for copying.
        this.m_science = 5; // Science skill.
        this.m_logLevel = 0; // 0 is important only, 1 is verbose, 2 is very verbose.
        // The method provided by the caller to handle the results of computation. It is called per
        // item. It is a list of results for each decryptor.
        this.m_handleResults = undefined;
        this.m_onDrawComplete = undefined; // Called when drawing is completed.
        this.m_handleOverview = undefined; // Called with detail information for each item.

        this.m_uniquePriceItems = {};
        this.m_inventableVolume = {};
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
            { 'name': 'Opt Attainment', 'probability': 1.9, 'run': 2, 'me': 1, 'pe': -1,
                'items': { '728': 33317, '729': 33324, '730': 33326, '731': 33325 }},
            { 'name': 'Opt Augmentation', 'probability': 0.9, 'run': 7, 'me': 2, 'pe': 0,
                'items': { '728': 33316, '729': 33321, '730': 33323, '731': 33322 }}
        ];
    };

    EveIndustry.prototype.industrate = function(handleResults, onDrawComplete) {
        if (typeof handleResults !== 'function') {
            this.errorHandler('Invalid handleResults function provided (' + typeof handleResults + ')');
        } else if (typeof onDrawComplete !== 'function') {
            this.errorHandler('Invalid onDrawComplete function provided (' + typeof onDrawComplete + ')');
        } else {
            this.m_handleResults = handleResults;
            this.m_onDrawComplete = onDrawComplete;

            $.ajax({ url: this.m_everestIndustry, context: this, })
                .done(this.onLoadIndustryItems)
                .fail(function(xhr, status) { this.errorHandler('industy list', xhr, status); });
        }
    };

    // Go into detail mode. Only information for the provided itemID is retrieved and calculated.
    EveIndustry.prototype.industrate_detail = function(itemid, handleResults, onDrawComplete, handleOverview) {
        if (typeof handleResults !== 'function') {
            this.errorHandler('Invalid handleResults function provided (' + typeof handleResults + ')');
        } else if (typeof onDrawComplete !== 'function') {
            this.errorHandler('Invalid onDrawComplete function provided (' + typeof onDrawComplete + ')');
        } else if (typeof itemid !== 'number') {
            this.errorHandler('Incorrect itemid provided (' + typeof itemid + ')');
        } else {
            this.m_handleResults = handleResults;
            this.m_onDrawComplete = onDrawComplete;
            this.m_handleOverview = handleOverview;

            $.ajax({ url: this.m_everestIndustryDetail + itemid + '/', context: this, })
                .done(this.onLoadIndustryItems)
                .fail(function(xhr, status) { this.errorHandler('industy list', xhr, status); });
        }
    };

    EveIndustry.prototype.errorHandler = function(fetchItem, xhr, status) {
        if (typeof xhr === 'undefined') {
            var message = fetchItem;
        } else {
            var message = 'Failed to fetch ' + fetchItem + '. HTTP ' + xhr.status + ' (' + status + ')';
        }

        this.log(message, 0);
        $('#status').text(message).show();
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
            that.m_inventableVolume[itemid] = 0;

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
        var deferrals = this.fetchPriceData(this.m_uniquePriceItems, this.m_apiPrices, this.onLoadPrices);
        deferrals = deferrals.concat(this.fetchPriceData(this.m_inventableVolume, this.m_apiVolume, this.onLoadVolumes));
        $.when.apply($, deferrals)
            .done(function() {
                $.each(industry_data.items, function(itemid, item) {
                    var results = [];
                    var valid = true;
                    var runs = (item.maxProductionLimit / 10 == 1 ? 1 : item.t1bpo.maxProductionLimit);
                    item.copyTime = that.calculateCopyTime(item.t1bpo.researchCopyTime, runs, item.t1bpo.maxProductionLimit);

                    $.each(that.m_decryptors, function(k, decryptor) {
                        var i = results.push(that.processItem(itemid, item, decryptor));

                        if (!results[i-1].valid) {
                            that.log('Unable to fetch all details for ' + item.typeName + ' (' + itemid + ').', 0);
                            return valid = false;
                        }
                    });

                    if (valid) {
                        var overview = item;
                        overview['vol'] = that.m_inventableVolume[itemid];
                        that.handleOverview(overview);
                        that.m_handleResults(results);
                    }
                });

                that.m_onDrawComplete();
            })
            .fail(function(xhr, status) { this.errorHandler('price data', xhr, status); })
    };

    // Called upon return from EVE-Central with price data.
    EveIndustry.prototype.onLoadPrices = function(price_data) {
        var d = new Date();
        this.log('onLoadPrices: ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds(), 0);
        $.each(price_data.emd.result, function(key, obj) {
            if (this.m_uniquePriceItems.hasOwnProperty(obj.row.typeID)) {
                var cost = parseFloat(obj.row.price);

                if (!isNaN(cost)) {
                    this.m_uniquePriceItems[obj.row.typeID] = cost;
                }
            }
        }.bind(this));
    };

    // Average out the volumes. Drop the current date's volume because it will be incomplete - not
    // a full day.
    EveIndustry.prototype.onLoadVolumes = function(volume_data) {
        var d = new Date();
        this.log('onLoadVolumes: ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds(), 0);
        // Get just the date portion.
        var current_date = new Date(volume_data.emd.currentTime.replace(/(.*)T.*/, '$1'));
        var volumes = {};

        $.each(volume_data.emd.result, function(key, value) {
            var this_date = new Date(value.row.date);

            if (!volumes.hasOwnProperty(value.row.typeID)) {
                volumes[value.row.typeID] = {'volume': 0, 'count': 0 };
            }

            // Exclude today's because it will be low (partial).
            if (this_date.getTime() != current_date.getTime()) {
                volumes[value.row.typeID].volume += parseInt(value.row.volume);
                volumes[value.row.typeID].count++;
            }
        });

        // Now create averages.
        $.each(volumes, function(typeid, volume) {
            if (volume.count > 0) {
                this.m_inventableVolume[typeid] = Math.round(volume.volume / volume.count);
            }
        }.bind(this));
    };

    // Calculate all of the good information about the blueprint.
    EveIndustry.prototype.processItem = function(itemid, item, decryptor) {
        // An item will be marked as invalid if one of the materials doesn't have a valid price associated with it.
        var result = {
            'bpcPerDay': 0,
            'copyTime': 0,
            'copiesPerDay': 0,
            'decryptor': decryptor,
            'inventionChance': 0,
            'ipd': 0,
            'iph': 0,
            'iph24': 0,
            'itemid': itemid,
            'materialCost': 0,
            'net': 0,
            'productionTime': 0,
            'productionTime24': 0,
            'runs': item.maxProductionLimit / 10 + decryptor.run,
            'tipd': 0,
            'typeName': item.typeName,
            'valid': true,
            'volume': this.m_inventableVolume[itemid],
        };
        var valid = true;
        var that = this;
        var bp_pe = -4 + decryptor.pe;
        var bp_me = -4 + decryptor.me;
        var runs = item.maxProductionLimit / 10 + decryptor.run;

        // If the item is a ship it will be built in a station instead of a POS. The slot modifier in this case is 1.
        var slt = this.m_indSlt;
        if (item.categoryName == "Ship") {
            slt = 1;
        }

        result.productionTime = this.calculateProductionTime(item.productionTime, this.m_ind, this.m_indImp, slt, item.productivityModifier, bp_pe);

        // Production time is in hour units and is for the entire blueprint (not each individual run).
        // If the production time is an exact multiple of 24 hours, add an extra day. Continuous runs aren't
        // happening.
        result.productionTime = result.productionTime * result.runs / (60 * 60);
        result.productionTime24 = Math.ceil(result.productionTime / 24) * 24;

        if (result.productionTime % 24 == 0) {
            result.productionTime24 += 24;
        }

        var invention = this.calculateInventionCost(item, decryptor);
        result.inventionCost = invention.cost;
        result.inventionChance = invention.chance;

        $.each(item.perfectMaterials, function(i, material) {
            var materialid = material.typeID;
            var actual = that.calculateActualRequired(material.quantity, item.wasteFactor, bp_me, material.wasteME, that.m_pe, material.wastePE);

            result.materialCost += actual * material.dmg * that.m_uniquePriceItems[materialid];

            // TODO: Should actual be saved?
            that.log('\t' + material.name + ' ' + actual + ' (' + material.quantity + ') -> ' + K.comma(Math.round(actual * material.dmg * that.m_uniquePriceItems[materialid]).toFixed(2)), 2);

            if (that.m_uniquePriceItems[materialid] == 0) {
                result.valid = false;
                that.log('Failed to fetch price for ' + material.name + ' (' + materialid + ').', 0);
                return false;
            }
        });

        result.net = (this.m_uniquePriceItems[itemid] - result.materialCost) * result.runs - result.inventionCost;
        result.iph = result.net / result.productionTime;
        result.iph24 = result.net / result.productionTime24;
        result.ipd = result.net / (result.productionTime24 / 24);

        // Now figure out the total IPD. This is done by determining how many copies can be produced from one
        // BPO per day then how many successful inventions. Multiply the result by IPD to get a max per day (mpd).
        // 10 inventions per day is a reasonable limit. To implement this, cap copiesPerDay to 10.
        result.copiesPerDay = 24 * 60 * 60 / item.copyTime;
        result.copiesPerDay = result.copiesPerDay > 10 ? 10 : result.copiesPerDay;
        result.bpcPerDay = result.copiesPerDay * result.inventionChance;
        result.tipd = result.bpcPerDay * result.ipd;

        return result;
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

        this.log('Invention chance: ' + (chance * 100).toFixed(2) + '%', 2);
        this.log('Raw cost: ' + K.comma(costPerAttempt.toFixed(2)), 2);
        this.log('Decryptor cost (' + decryptor.items[item.decryptor_category] + '): ' + K.comma(this.m_uniquePriceItems[decryptor.items[item.decryptor_category]].toFixed(2), 2));
        this.log('Cost per successful invention: ' + K.comma((costPerSuccess.toFixed(2))), 2);

        return { 'cost': costPerSuccess, 'chance': chance };
    };

    // Copying is affected by skills, the POS (always use a POS), and the number of runs in the copy. This is for
    // a single copy.
    EveIndustry.prototype.calculateCopyTime = function(base, runs, prodLimit) {
        // Here is some craziness. The number listed in the DB for copyResearchTime is the copy time for half of the
        // production limit. Not a single run or the full run, but half. So, double it...
        var max = base * 2 * (1 - 0.05 * this.m_science) * this.m_copySlt * this.m_copyImp;
        return runs * max / prodLimit;
    };

    // Add an element to the price array and ensure uniqueness.
    EveIndustry.prototype.addUniquePriceItem = function(itemid) {
        if (!this.m_uniquePriceItems.hasOwnProperty(itemid)) {
            this.m_uniquePriceItems[itemid] = 0;
        }
    };

    // There is a max length for the HTTP URI. It is easily exceeded. 2000 is a reasonable max
    // length. Leave some buffer so no backtracking is necessary. Additionallyl, the API limits
    // the number of returned rows to 10,000. Break it up into multiple requests and return an
    // array of deferrals.
    EveIndustry.prototype.fetchPriceData = function(items, urlbase, callback) {
        var deferrals = [];
        var url = urlbase;
        var maxLength = 1980;
        var maxCount = 10000;
        var count = 0;

        $.each(Object.keys(items), function(key, val) {
            url += val + ',';
            count++;

            if (url.length > maxLength || count > maxCount) {
                // The length was just exceeded. Kick off the request.
                deferrals.push($.ajax({ url: url, context: this, dataType: 'jsonp' }).done(callback));
                url = urlbase;
                count = 0;
            }
        }.bind(this));

        if (url != urlbase) {
            deferrals.push($.ajax({ url: url, context: this, dataType: 'jsonp' }).done(callback));
        }

        return deferrals;
    };

    // If the m_handleOverview is set, call it.
    EveIndustry.prototype.handleOverview = function(data) {
        if (typeof this.m_handleOverview === 'function') {
            this.m_handleOverview(data);
        }
    };

    EveIndustry.prototype.log = function(message, level) {
        if (level <= this.m_logLevel) {
            console.log(message);
        }
    };

    return EveIndustry;
})();
