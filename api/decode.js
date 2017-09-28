module .exports = function (x) {
    if (typeof x !== 'string')
        throw new Error ('invalid token');
    else
        return JSON .parse (Buffer .from (x, 'base64'))
}