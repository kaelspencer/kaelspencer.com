// This is a set of commonly used methods on this site.
(function(K, $, undefined) {
    // Add commas every three places.
    K.comma = function(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    // Convert seconds into a reasonable time format.
    K.prettyTime = function(seconds) {
        var s = Math.floor(seconds) % 60;
        var m = Math.floor(seconds / 60) % 60;
        var h = Math.floor(seconds / (60 * 60)) % 24;
        var d = Math.floor(seconds / (60 * 60 * 24));

        var result = K.pad(h, 2, '0') + ':' + K.pad(m, 2, '0') + ':' + K.pad(s, 2, '0');

        if (d > 0) {
            result = d + 'd ' + result;
        }

        return result;
    };

    // Pad the provided string to a length of padlen with padchar. This is a leading pad.
    K.pad = function(s, padlen, padchar) {
        return ((new Array(padlen + 1).join(padchar)) + s).substr(-1 * padlen);
    }
}(window.K = window.K || {}, jQuery));
