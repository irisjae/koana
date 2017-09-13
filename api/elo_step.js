var config = require ('api/config');

module .exports = function (latest, aggregate, misc) {
    var f = config .level .standard_deviation;
    var K = config .level .max_adjustment;
    var R = aggregate .level;
    var E = latest .map (function (x) {
        return Math .pow (10, R * f) / (Math .pow (10, R * f) + Math .pow (10, x .difficulty * f))
    }) .reduce (function (sum, next) {
        return sum + next
    }, 0);
    var S = latest .map (function (x) {
        return x .score;
    }) .reduce (function (sum, next) {
        return sum + next
    }, 0);
    return R + K (S - E)
}