var use_db = require ('api/use_db')
var tokenizer = require ('api/tokenizer')

module .exports =   function (ctx, next) {
                        var email = ctx .request .body .email;
                        var password = ctx .request .body .password;
                        return  use_db (function (session) {
                                    return  session .run (
                                                'MATCH (parent:Parent { email: { email } }) RETURN parent',
                                            { email: email })
                                                .then (function (results) {
                                                    if (results .records .length)
                                                        return Promise .reject (new Error ('User already exists'))
                                                })
                                                .then (function () {
                                                    return  session .run (
                                                                'CREATE (parent:Parent { email: { email }, password: { password } })' +
                                                                'RETURN parent',
                                                                { email: email, password: password })
                                                })
                                                .then (function (results) {
                                                    return { id: tokenizer (results .records [0] ._fields [0]) }
                                                })
                                })
                                    .then (function (x) {
                                        ctx .body = x;
                                    })
                                    .then (function () {
                                        return next ();
                                    })
                    };