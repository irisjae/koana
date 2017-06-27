var t = require ('tap');

var report = require ('test/report');

report ('parent register/login set')
Promise .resolve ()
    .then (function () {
        return require ('test/api/register/post') (t)
    })
    .then (function () {
        return require ('test/api/login/post') (t)
    })