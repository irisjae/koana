Promise .resolve ()
.then (function () {
    return require ('./setup/user')
})
.then (function () {
    return require ('./setup/subcategory')
})
.then (function () {
    return require ('./test/api')
})