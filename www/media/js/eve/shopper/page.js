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
    });
})();
