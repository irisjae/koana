module .exports = function (x) {
    return JSON .parse (Buffer .from (x, 'base64'))
}