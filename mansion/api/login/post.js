var use_db = require ('../use_db')

module .exports =   function (ctx, next) {
                        var email = ctx .request .body .email;
                        var password = ctx .request .body .password;
                        return  use_db (function (session) {
                                    return  session .run ('MATCH (parent:Parent { email: { email }, password: { password } }) RETURN parent', { email: email, password: password })
                                                .then (function (results) {
                                                    if (! results .records .length)
                                                        return Promise .reject (new Error ('User not found'))
                                                    else
                                                        return { id: results .records [0] ._fields [0] .identity .toString () }
                                                })
                                })
                                    .then (function (x) {
                                        ctx .body = x;
                                    })
                                    .then (function () {
                                        return next ();
                                    })
                    };