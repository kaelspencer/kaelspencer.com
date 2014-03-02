// This is a set of commonly used methods on this site.
(function() {
    var KLibrary = (function() {
        function KLibrary() {
        }

        // Add commas every three places.
        KLibrary.prototype.comma = function(x) {
            return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        };

        // Convert seconds into a reasonable time format.
        KLibrary.prototype.prettyTime = function(seconds) {
            var s = Math.floor(seconds) % 60;
            var m = Math.floor(seconds / 60) % 60;
            var h = Math.floor(seconds / (60 * 60)) % 24;
            var d = Math.floor(seconds / (60 * 60 * 24));

            function pad(n) { return ('00' + n).substr(-2); }

            var result = pad(h) + ':' + pad(m) + '::' + pad(s);

            if (d > 0) {
                result = d + 'd ' + result;
            }

            return result;
        };

        return KLibrary;
    })();

    if (!window.K) {
        window.K = new KLibrary;
    }
})();
