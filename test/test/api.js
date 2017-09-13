var t = require ('tap');

var report = require ('test/utils/report');

Promise .resolve ()
.then (function () {
    report ('user register/login')
    
    return Promise .resolve ()
        .then (function () {
            return require ('./api/register/post') (t)
        })
        .then (function () {
            return require ('./api/login/post') (t)
        })
})
.then (function () {
    report ('question sets flow')
    
    return Promise .resolve ()
        .then (function () {
            return require ('./api/subcategories/get') (t)
        })
})