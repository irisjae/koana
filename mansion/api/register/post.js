var use_db = require ('../use_db')

module .exports =   function (ctx, next) {
                        var email = ctx .request .body .email;
                        var password = ctx .request .body .password;
                        return  use_db (function (session) {
                                    return  session .run ('MATCH (parent:Parent { email: { email } }) RETURN parent', { email: email })
                                                .then (function (results) {
                                                    if (results .records .length)
                                                        return Promise .reject (new Error ('User already exists'))
                                                })
                                                .then (function () {
                                                    return session .run ('CREATE (parent:Parent { email: { email }, password: { password } })', { email: email, password: password })
                                                })
                                                .then (function () {
                                                    return {}
                                                })
                                })
                                    .then (function (x) {
                                        ctx .body = x;
                                    })
                                    .then (function () {
                                        return next ();
                                    })
                    };