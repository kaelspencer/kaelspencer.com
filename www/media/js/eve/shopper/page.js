(function() {
    $(function() {
        var validator = new Validator();
        var shopper = new EveShopper();

        $('.chosen').chosen({ width: "95%" });

        $('#search').submit(function() {
            if (validator.validate()) {
                shopper.shop(validator);
            }

            return false;
        });

        $('#options_submit').click(function() {
            var div = $('#options_div');

            if (div.is(':visible')) {
                div.slideUp();
            } else {
                div.slideDown();
            }

            return false;
        });

        $('#current_location').autocomplete({ source: systems, minLength: 2 });
    });
})();
