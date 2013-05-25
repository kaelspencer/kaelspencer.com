(function() {
    $(function() {
        var validator = new Validator();
        var shopper = new EveShopper();

        $('#search').submit(function() {
            if (validator.validate()) {
                shopper.shop(validator);
            }

            return false;
        });
    });
})();
