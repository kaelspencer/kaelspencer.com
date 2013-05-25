var Validator = (function() {

    function Validator() {
        this.m_item = 0;
        this.m_currentLocation = 'Jita IV - Moon 4 - Caldari Navy Assembly Plant';
        this.m_jumpLimit = 0;
    }

    Validator.prototype.item = function() {
        return this.m_item;
    };

    Validator.prototype.currentLocation = function() {
        return this.m_currentLocation;
    };

    Validator.prototype.jumpLimit = function() {
        return this.m_jumpLimit;
    };

    Validator.prototype.validate = function() {
        var error = false;
        var item = $('#search_item').val();
        var location = $('#current_location').val();
        var jumps = $('#jump_limit').val();

        $('#item_error').text('\xa0');
        $('#location_error').text('\xa0');
        $('#jump_error').text('\xa0');
        $('#status').text('').hide();

        if (item == null || item == '') {
            error = true;
            $('#item_error').text('Item ID is required');
        } else if (isNaN(item)) {
            error = true;
            $('#item_error').text('Item ID must be a number');
        } else {
            this.m_item = +item;
        }

        // An empty string will be converted to 0, and isNaN makes that assumption.
        if (isNaN(jumps)) {
            error = true;
            $('#jump_error').text('Jump limits must be a number');
        } else {
            this.m_jumpLimit = +jumps;
        }

        if (location != null && location != '') {
            this.m_currentLocation = location;
        }

        if (error) {
            $('#form_errors').show();
        } else {
            $('#form_errors').hide();
        }

        console.log('Item: ' + item + ' Location: ' + location + ' Jump limit: ' + jumps);
        return !error;
    };

    return Validator;
})();
