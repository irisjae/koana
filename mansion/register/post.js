var use_db = require ('../use_db')

module .exports =   function (ctx, next) {
                        var email = ctx .request .body .email;
                        var password = ctx .request .body .password;
                        return  use_db (function (session) {
                                    return session .run ('MERGE (parent:Parent { email: { email } }) SET parent .password = { password }', { email: email, password: password })
                                })
                                    .then (function () {
                                        ctx .body = {};
                                    })
                                    .then (function () {
                                        return next ();
                                    })
                    };