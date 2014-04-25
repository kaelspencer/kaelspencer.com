(function(EveIndustry, $, undefined) {
    var m_apiPrices = 'http://api.eve-marketdata.com/api/item_prices2.json?char_name=Dogen%20Okanata&region_ids=10000002&buysell=s&type_ids=';
    var m_apiHistory = 'http://api.eve-marketdata.com/api/item_history2.json?char_name=Dogen%20Okanata&region_ids=10000002&days=30&type_ids=';
    var m_everest = 'http://everest.kaelspencer.com/';
    //var m_everest = 'http://localhost:5000/';
    var m_everestIndustry = m_everest + "industry/0/names/norigs/";
    var m_everestIndustryDetail = m_everest + "industry/detail/";
    var m_everestIndustryDetailNames = 'names/'; // Set this to '' to exclude names.
    var m_pe = 5; // Production Effeciency Skill
    var m_ind = 5; // Industry Skill
    var m_indImp = 0.98; // Implant: 1 - % benefit, for manufacturing.
    var m_copyImp = 0.97; // Implant: 1 - % benefit, for copying.
    var m_indSlt = 0.75; // Slot modifier (POS) for manufacturing.
    var m_copySlt = 0.65; // Slot modifier (POS) for copying.
    var m_science = 5; // Science skill.
    var m_logLevel = 0; // 0 is important only, 1 is verbose, 2 is very verbose.
    var m_ajaxTimeout = 20 * 1000; // Timeout after 20 seconds.

    var m_decryptors = [
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

    EveIndustry.errorHandler = function(fetchItem, xhr, status, method) {
        var message = 'Failed to fetch ' + fetchItem + '. HTTP ' + xhr.status + ' (' + status + ')';

        if (typeof xhr === 'undefined') {
            message = fetchItem;
        }

        EveIndustry.log(message, 0);
        $('#status').text(message).show();

        if (typeof method === 'function') {
            method();
        }
    };

    EveIndustry.log = function(message, level) {
        if (level <= m_logLevel) {
            console.log(message);
        }
    };

    // There is a max length for the HTTP URI. It is easily exceeded. 2000 is a reasonable max
    // length. Leave some buffer so no backtracking is necessary. Additionally, the API limits
    // the number of returned rows to 10,000. Break it up into multiple requests and return an
    // array of deferrals.
    EveIndustry.fetchData = function(items, urlbase, callback, context) {
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
                deferrals.push($.ajax({ url: url, timeout: m_ajaxTimeout, context: context, dataType: 'jsonp' }).done(callback));
                url = urlbase;
                count = 0;
            }
        });

        if (url != urlbase) {
            deferrals.push($.ajax({ url: url, timeout: m_ajaxTimeout, context: context, dataType: 'jsonp' }).done(callback));
        }

        return deferrals;
    };

    // Given the count for a perfect blueprint, the blueprint's ME, the user's PE, the waste factor of the
    // blueprint and which waste type applies, calculate the actual number of units required.
    EveIndustry.calculateActualRequired = function(perfect, wf, me, meApplies, pe, peApplies) {
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
    EveIndustry.calculateWasteME = function(perfect, me, wf) {
        if (me >= 0) {
            return Math.round(perfect * ((wf / (me + 1)) / 100));
        } else {
            return Math.round(perfect * (wf / 100) * (1 - me));
        }
    };

    // Given the count for a perfect blueprint and the user's PE, calculate the result of PE waste.
    EveIndustry.calculateWastePE = function(perfect, pe) {
        return perfect * (0.25 - 0.05 * pe);
    };

    // Give the base production time in seconds, industry skill, implant modifier, production slot modifier
    // (POS), productivity modifier (blueprint), and PE of the blueprint, calculate total production time (in seconds).
    EveIndustry.calculateProductionTime = function(base, industry, implant, slot, modifier, pe) {
        var pt = 0;
        if (pe >= 0) {
            pt = 1 - (modifier / base) * (pe / (1 + pe));
        } else {
            pt = 1 - (modifier / base) * (pe - 1);
        }

        return base * pt * (1 - 0.04 * industry) * implant * slot;
    };

    // Copying is affected by skills, the POS (always use a POS), and the number of runs in the copy. This is for
    // a single copy.
    EveIndustry.calculateCopyTime = function(base, runs, prodLimit) {
        // Here is some craziness. The number listed in the DB for copyResearchTime is the copy time for half of the
        // production limit. Not a single run or the full run, but half. So, double it...
        var max = base * 2 * (1 - 0.05 * m_science) * m_copySlt * m_copyImp;
        return runs * max / prodLimit;
    };

    // Calculate the invention cost per resulting run.
    EveIndustry.calculateInventionCost = function(item, decryptor, datacore1Cost, datacore2Cost, decryptorCost) {
        // Hardcode encryption and science skills to 4 for now.
        var e = 4, d1 = 4, d2 = 4, meta = 0;
        var chance = item.chance * (1 + (0.01 * e)) * (1 + ((d1 + d1) * (0.1 / (5 - meta)))) * decryptor.probability;
        var costPerAttempt = datacore1Cost * item.datacores[0].quantity + datacore2Cost * item.datacores[1].quantity + decryptorCost;
        var costPerSuccess = costPerAttempt / chance;

        return { 'chance': chance, 'cost': costPerSuccess, 'raw': costPerAttempt };
    };

    // Calculate all of the good information about the blueprint.
    EveIndustry.processItem = function(itemid, item, decryptor, volume, prices) {
        // An item will be marked as invalid if one of the materials doesn't have a valid price associated with it.
        var result = {
            'copyTime': 0,
            'decryptor': decryptor,
            'inventionChance': 0,
            'inventionCost': 0,
            'ipd': 0,
            'iph': 0,
            'iph24': 0,
            'itemid': itemid,
            'materialCost': 0,
            'mtipd': {
                'bpcPerDay': 0,
                'bpo': 0,
                'copiesPerDay': 0,
                'mtipd': 0,
            },
            'net': 0,
            'productionTime': 0,
            'productionTime24': 0,
            'runs': item.maxProductionLimit / 10 + decryptor.run,
            'stipd': {
                'bpcPerDay': 0,
                'copiesPerDay': 0,
                'stipd': 0,
            },
            'typeName': item.typeName,
            'valid': true,
            'vbr': 0.0,
            'volume': volume,
        };
        var valid = true;
        var bp_pe = -4 + decryptor.pe;
        var bp_me = -4 + decryptor.me;
        var runs = item.maxProductionLimit / 10 + decryptor.run;

        // If the item is a ship it will be built in a station instead of a POS. The slot modifier in this case is 1.
        var slt = m_indSlt;
        if (item.categoryName == "Ship") {
            slt = 1;
        }

        result.productionTime = EveIndustry.calculateProductionTime(item.productionTime, m_ind, m_indImp, slt, item.productivityModifier, bp_pe);

        // Production time is in hour units and is for the entire blueprint (not each individual run).
        // If the production time is an exact multiple of 24 hours, add an extra day. Continuous runs aren't
        // happening.
        result.productionTime = result.productionTime * result.runs / (60 * 60);
        result.productionTime24 = Math.ceil(result.productionTime / 24) * 24;

        if (result.productionTime % 24 === 0) {
            result.productionTime24 += 24;
        }

        var invention = EveIndustry.calculateInventionCost(
            item,
            decryptor,
            prices[item.datacores[0].typeID],
            prices[item.datacores[1].typeID],
            prices[decryptor.items[item.decryptor_category]]);
        result.inventionCost = invention.cost;
        result.inventionChance = invention.chance;

        $.each(item.perfectMaterials, function(i, material) {
            var materialid = material.typeID;
            var actual = EveIndustry.calculateActualRequired(material.quantity, item.wasteFactor, bp_me, material.wasteME, m_pe, material.wastePE);

            result.materialCost += actual * material.dmg * prices[materialid];

            // TODO: Should actual be saved?
            EveIndustry.log('\t' + material.name + ' ' + actual + ' (' + material.quantity + ') -> ' + K.comma(Math.round(actual * material.dmg * prices[materialid]).toFixed(2)), 2);

            if (prices[materialid] === 0) {
                result.valid = false;
                EveIndustry.log('Failed to fetch price for ' + material.name + ' (' + materialid + ').', 0);
                return false;
            }
        });

        // Calculate the volume-BPO-ratio. This is the number BPOs required to fulfill the volume
        // moved through Jita on a daily average. This is a good indicator of how easily it will
        // be to sell the goods.
        result.vbr = result.volume / (result.runs / (result.productionTime24 / 24));

        result.net = (prices[itemid] - result.materialCost) * result.runs - result.inventionCost;
        result.iph = result.net / result.productionTime;
        result.iph24 = result.net / result.productionTime24;
        result.ipd = result.net / (result.productionTime24 / 24);

        // Now figure out the total IPD. This is done by determining how many copies can be produced from one
        // BPO per day then how many successful inventions. Multiply the result by IPD to get a max per day (mpd).
        // 10 inventions per day is a reasonable limit. To implement this, cap copiesPerDay to 10.
        result.stipd.copiesPerDay = 24 * 60 * 60 / item.copyTime;
        result.stipd.copiesPerDay = result.stipd.copiesPerDay > 10 ? 10 : result.stipd.copiesPerDay;
        result.stipd.bpcPerDay = result.stipd.copiesPerDay * result.inventionChance;
        result.stipd.stipd = result.stipd.bpcPerDay * result.ipd;

        // TIPD has a max of 10 inventions per day, as that is all that can be invented. If the BPO can't generate
        // 10 copies per day, the number of inventions is the limiting factor. In Max TIPD (MTIPD), calculate TIPD
        // as if there are multiple BPOs. However, it is unreasonable to have more than 10 copy slots occupied at
        // once for the same blueprint. Limit the number of BPOs at 10.
        if (result.stipd.copiesPerDay == 10) {
            result.mtipd.copiesPerDay = result.stipd.copiesPerDay;
            result.mtipd.bpcPerDay = result.stipd.bpcPerDay;
            result.mtipd.bpo = 1;
            result.mtipd.mtipd = result.stipd.stipd;
        } else {
            result.mtipd.copiesPerDay = 10;
            var cpd = 24 * 60 * 60 / item.copyTime;
            result.mtipd.bpo = Math.ceil(result.mtipd.copiesPerDay / cpd);

            // Cap the number of BPOs at 10.
            if (result.mtipd.bpo > 10) {
                result.mtipd.bpo = 10;
                result.mtipd.copiesPerDay = result.stipd.copiesPerDay * 10;
            }

            result.mtipd.bpcPerDay = result.mtipd.copiesPerDay * result.inventionChance;
            result.mtipd.mtipd = result.mtipd.bpcPerDay * result.ipd;
        }

        return result;
    };

    // The overview class. It retrieves a list of inventable items then calculations the IPH, IPD, and TIPD for each one.
    EveIndustry.Overview = (function() {
        function Overview() {
            // The method provided by the caller to handle the results of computation. It is called per
            // item. It is a list of results for each decryptor.
            this.m_handleResults = undefined;
            this.m_onDrawComplete = undefined; // Called when drawing is completed.
            this.m_uniquePriceItems = {};
            this.m_inventableVolume = {};
        }

        Overview.prototype.industrate = function(handleResults, onDrawComplete) {
            if (typeof handleResults !== 'function') {
                EveIndustry.errorHandler('Invalid handleResults function provided (' + typeof handleResults + ')', onDrawComplete);
            } else if (typeof onDrawComplete !== 'function') {
                EveIndustry.errorHandler('Invalid onDrawComplete function provided (' + typeof onDrawComplete + ')', onDrawComplete);
            } else {
                this.m_handleResults = handleResults;
                this.m_onDrawComplete = onDrawComplete;

                $.ajax({ url: m_everestIndustry, timeout: m_ajaxTimeout, context: this, })
                    .done(this.onLoadIndustryItems)
                    .fail(function(xhr, status) { EveIndustry.errorHandler('industy list', xhr, status, this.m_onDrawComplete); });
            }
        };

        // Called upon return from everest. Contains a list of inventable items and their information.
        Overview.prototype.onLoadIndustryItems = function(industry_data) {
            if (!industry_data.hasOwnProperty('items')) {
                EveIndustry.errorHandler('industry items from everest', '', '', this.m_onDrawComplete);
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
            $.each(m_decryptors, function(decryptor_name, decryptor) {
                $.each(decryptor.items, function(category, itemid) {
                    that.addUniquePriceItem(itemid);
                });
            });

            // Fetch all of the price data, then process each item and decryptor combination.
            var deferrals = EveIndustry.fetchData(this.m_uniquePriceItems, m_apiPrices, this.onLoadPrices, this);
            deferrals = deferrals.concat(EveIndustry.fetchData(this.m_inventableVolume, m_apiHistory, this.onLoadVolumes, this));
            $.when.apply($, deferrals)
                .done(function() {
                    $.each(industry_data.items, function(itemid, item) {
                        var results = [];
                        var valid = true;
                        var runs = (item.maxProductionLimit / 10 == 1 ? 1 : item.t1bpo.maxProductionLimit);
                        item.copyTime = EveIndustry.calculateCopyTime(item.t1bpo.researchCopyTime, runs, item.t1bpo.maxProductionLimit);

                        $.each(m_decryptors, function(k, decryptor) {
                            var i = results.push(EveIndustry.processItem(itemid, item, decryptor, that.m_inventableVolume[itemid], that.m_uniquePriceItems));

                            if (!results[i-1].valid) {
                                EveIndustry.log('Unable to fetch all details for ' + item.typeName + ' (' + itemid + ').', 0);
                                valid = false;
                                return valid;
                            }
                        });

                        if (valid) {
                            that.m_handleResults(results);
                        }
                    });

                    that.m_onDrawComplete();
                })
                .fail(function(xhr, status) { EveIndustry.errorHandler('price data', xhr, status, this.m_onDrawComplete); });
        };

        // Called upon return from EVE-Central with price data.
        Overview.prototype.onLoadPrices = function(price_data) {
            var d = new Date();
            EveIndustry.log('onLoadPrices: ' + K.pad(d.getHours(), 2, '0') + ':' + K.pad(d.getMinutes(), 2, '0') + ':' + K.pad(d.getSeconds(), 2, '0'), 0);
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
        Overview.prototype.onLoadVolumes = function(volume_data) {
            var d = new Date();
            EveIndustry.log('onLoadVolumes: ' + K.pad(d.getHours(), 2, '0') + ':' + K.pad(d.getMinutes(), 2, '0') + ':' + K.pad(d.getSeconds(), 2, '0'), 0);
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

        // Add an element to the price array and ensure uniqueness.
        Overview.prototype.addUniquePriceItem = function(itemid) {
            if (!this.m_uniquePriceItems.hasOwnProperty(itemid)) {
                this.m_uniquePriceItems[itemid] = 0;
            }
        };

        return Overview;
    })();

    // This class handles the detail view for a single item. It doesn't just calculate the current price, it calculates
    // a user defined N days previous.
    EveIndustry.Detail = (function() {
        function Detail() {
            // The method provided by the caller to handle the results of computation. It is called per
            // item. It is a list of results for each decryptor.
            this.m_handleResults = undefined;
            this.m_onDrawComplete = undefined; // Called when drawing is completed.
            this.m_handleDetail = undefined; // Called with detail information for each item.
            this.m_uniqueItems = {};
            this.m_inventableVolume = {};
            this.m_historicalPrices = {};
        }

        // Go into detail mode. Only information for the provided itemID is retrieved and calculated.
        Detail.prototype.industrate = function(itemid, handleResults, onDrawComplete, handleDetail) {
            if (typeof handleResults !== 'function') {
                EveIndustry.errorHandler('Invalid handleResults function provided (' + typeof handleResults + ')', onDrawComplete);
            } else if (typeof onDrawComplete !== 'function') {
                EveIndustry.errorHandler('Invalid onDrawComplete function provided (' + typeof onDrawComplete + ')', onDrawComplete);
            } else if (typeof itemid !== 'number') {
                EveIndustry.errorHandler('Incorrect itemid provided (' + typeof itemid + ')', this.m_onDrawComplete);
            } else {
                this.m_handleResults = handleResults;
                this.m_onDrawComplete = onDrawComplete;
                this.m_handleDetail = handleDetail;

                $.ajax({
                    url: m_everestIndustryDetail + itemid + '/' + m_everestIndustryDetailNames,
                    timeout: m_ajaxTimeout,
                    context: this,
                })
                    .done(this.onLoadIndustryItems)
                    .fail(function(xhr, status) { EveIndustry.errorHandler('industy list', xhr, status, this.m_onDrawComplete); });
            }
        };

        // Called upon return from everest. Contains a list of inventable items and their information.
        Detail.prototype.onLoadIndustryItems = function(industry_data) {
            if (!industry_data.hasOwnProperty('items')) {
                EveIndustry.errorHandler('industry items from everest', '', '', this.m_onDrawComplete);
                return false;
            }
            var that = this;

            // This is detail view. There should only be one item returned from everest.
            if (Object.keys(industry_data.items).length != 1) {
                EveIndustry.errorHandler('proper data from everest. Wrong number of keys.', '', '', this.m_onDrawComplete);
                EveIndustry.log(industry_data.items, 0);
                return false;
            }

            var item = industry_data.items[Object.keys(industry_data.items)[0]];

            this.addUniquePriceItem(item.typeID);
            this.m_inventableVolume[item.typeID] = 0;

            $.each(item.perfectMaterials, function(i, material) {
                that.addUniquePriceItem(material.typeID);
            });

            $.each(item.datacores, function(k, datacore) {
                that.addUniquePriceItem(datacore.typeID);
            });

            // Now loop through all of the different decryptors and add them to the unique list.
            $.each(m_decryptors, function(decryptor_name, decryptor) {
                $.each(decryptor.items, function(category, itemid) {
                    that.addUniquePriceItem(itemid);
                });
            });

            // Fetch all of the price data, then process each item and decryptor combination.
            var deferrals = EveIndustry.fetchData(this.m_uniqueItems, m_apiPrices, this.onLoadPrices, this);
            deferrals = deferrals.concat(EveIndustry.fetchData(this.m_uniqueItems, m_apiHistory, this.onLoadVolumes, this));
            $.when.apply($, deferrals)
                .done(function() {
                    // Get the current date as a key. Because of timezones, it's possible it is "yesterday".
                    var d = new Date();
                    var ds = d.getFullYear() + '-' + K.pad(d.getMonth() + 1, 2, '0') + '-' + K.pad(d.getDate(), 2, '0');

                    if (!that.m_historicalPrices.hasOwnProperty(ds)) {
                        d.setDay(d.getDate() - 1);
                        ds = d.getFullYear() + '-' + K.pad(d.getMonth() + 1, 2, '0') + '-' + K.pad(d.getDate(), 2, '0');

                        if (!that.m_historicalPrices.hasOwnProperty(ds)) {
                            EveIndustry.log('Error! What day is it?! Current date: ' + ds + ', not found in this.m_historicalPrices', 0);
                            EveIndustry.log(that.m_historicalPrices, 0);
                        }

                        EveIndustry.log('Using yesterday as current date: ' + ds, 0);
                    }

                    var results = [];
                    var valid = true;
                    var runs = (item.maxProductionLimit / 10 == 1 ? 1 : item.t1bpo.maxProductionLimit);
                    item.copyTime = EveIndustry.calculateCopyTime(item.t1bpo.researchCopyTime, runs, item.t1bpo.maxProductionLimit);

                    $.each(m_decryptors, function(k, decryptor) {
                        var i = results.push(EveIndustry.processItem(item.typeID, item, decryptor, that.m_inventableVolume[item.typeID], that.m_historicalPrices[ds]));

                        if (!results[i-1].valid) {
                            EveIndustry.log('Unable to fetch all details for ' + item.typeName + ' (' + item.typeID + ').', 0);
                            valid = false;
                            return valid;
                        }
                    });

                    if (valid) {
                        if (typeof that.m_handleDetail === 'function') {
                            var detail = item;
                            detail.vol = that.m_inventableVolume[item.typeID];
                            that.m_handleDetail(detail);
                        }
                        that.m_handleResults(results);
                    }

                    that.m_onDrawComplete();
                })
                .fail(function(xhr, status) { EveIndustry.errorHandler('price data', xhr, status, this.m_onDrawComplete); });
        };

        // Called upon return from EVE-Central with price data.
        Detail.prototype.onLoadPrices = function(price_data) {
            var d = new Date();
            EveIndustry.log('onLoadPrices: ' + K.pad(d.getHours(), 2, '0') + ':' + K.pad(d.getMinutes(), 2, '0') + ':' + K.pad(d.getSeconds(), 2, '0'), 0);

            // Date according to the API result.
            var current_date = new Date(price_data.emd.currentTime.replace(/(.*)T.*/, '$1'));
            var ds = current_date.getFullYear() + '-' + K.pad(current_date.getMonth() + 1, 2, '0') + '-' + K.pad(current_date.getDate(), 2, '0');
            if (!this.m_historicalPrices.hasOwnProperty(ds)) {
                var prices = {};

                $.each(price_data.emd.result, function(key, obj) {
                    var cost = parseFloat(obj.row.price);

                    if (!isNaN(cost)) {
                        prices[obj.row.typeID] = cost;
                    }
                });

                this.m_historicalPrices[ds] = prices;
            } else {
                EveIndustry.log('Error! Unexpected! The current date is already set in this.m_historicalPrices', 0);
                EveIndustry.log(this.m_historicalPrices, 0);
            }
        };

        // Average out the volumes. Drop the current date's volume because it will be incomplete - not
        // a full day.
        Detail.prototype.onLoadVolumes = function(volume_data) {
            var d = new Date();
            EveIndustry.log('onLoadVolumes: ' + K.pad(d.getHours(), 2, '0') + ':' + K.pad(d.getMinutes(), 2, '0') + ':' + K.pad(d.getSeconds(), 2, '0'), 0);
            // Get just the date portion.
            var current_date = new Date(volume_data.emd.currentTime.replace(/(.*)T.*/, '$1'));
            var volumes = {};

            $.each(volume_data.emd.result, function(key, value) {
                var this_date = new Date(value.row.date);
                var ds = this_date.getFullYear() + '-' + K.pad(this_date.getMonth() + 1, 2, '0') + '-' + K.pad(this_date.getDate(), 2, '0');

                if (this_date.getTime() == current_date.getTime()) {
                    // Skip today.
                    return true;
                }

                if (!volumes.hasOwnProperty(value.row.typeID)) {
                    volumes[value.row.typeID] = {'volume': 0, 'count': 0 };
                }

                volumes[value.row.typeID].volume += parseInt(value.row.volume);
                volumes[value.row.typeID].count++;

                // Store the historical price average.
                if (!this.m_historicalPrices.hasOwnProperty(ds)) {
                    this.m_historicalPrices[ds] = {};
                }

                var price = parseFloat(value.row.avgPrice);

                if (!isNaN(price)) {
                    this.m_historicalPrices[ds][value.row.typeID] = price;
                } else {
                    EveIndustry.log('Bad historical price for ' + value.row.typeid + ' on ' + ds + ': ' + value.row.avgPrice, 0);
                }
            }.bind(this));

            // Now create averages.
            $.each(volumes, function(typeid, volume) {
                if (volume.count > 0) {
                    this.m_inventableVolume[typeid] = Math.round(volume.volume / volume.count);
                }
            }.bind(this));
        };

        // Add an element to the price array and ensure uniqueness.
        Detail.prototype.addUniquePriceItem = function(itemid) {
            if (!this.m_uniqueItems.hasOwnProperty(itemid)) {
                this.m_uniqueItems[itemid] = 0;
            }
        };

        return Detail;
    })();
}(window.EveIndustry = window.EveIndustry || {}, jQuery));
