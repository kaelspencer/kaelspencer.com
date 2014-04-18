var Validator = (function() {

    function Validator() {
        // -1 is all categories, all positive numbers are the rig category ID.
        // Valid category IDs: -1, 6, 7, 8, 18, 22
        this.m_categories = [];
        this.m_norigs = false;
    }

    Validator.prototype.categories = function() {
        return this.m_categories;
    };

    Validator.prototype.norigs = function() {
        return this.m_norigs;
    };

    Validator.prototype.validate = function() {
        var error = false;

        $('#form_errors').text('\xa0').hide();
        $('#status').text('').hide();

        var all = $('#all').is(':checked');
        var norigs = $('#norigs').is(':checked');
        var ships = $('#ships').is(':checked');
        var modules = $('#modules').is(':checked');
        var charges = $('#charges').is(':checked');
        var drones = $('#drones').is(':checked');
        var deployable = $('#deployable').is(':checked');

        if (all) {
            this.m_categories = [-1];
        } else {
            if (ships) {
                this.m_categories.push($('#ships').val());
            }

            if (modules) {
                this.m_categories.push($('#modules').val());
            }

            if (charges) {
                this.m_categories.push($('#charges').val());
            }

            if (drones) {
                this.m_categories.push($('#drones').val());
            }

            if (deployable) {
                this.m_categories.push($('#deployable').val());
            }
        }

        this.m_norigs = norigs;

        if (!(all || ships || modules || charges || drones || deployable)) {
            error = true;
            $('#form_errors').text('You must select something!').show();
        }

        return !error;
    };

    return Validator;
})();
