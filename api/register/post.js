var use_db = require ('api/use_db')
var tokenizer = require ('api/tokenizer')

module .exports =   function (ctx, next) {
                        var email = ctx .request .body .email;
                        var password = ctx .request .body .password;
                        return use_db (function (session) {
                            return Promise .resolve ()
                                .then (function () {
                                    if (! email)
                                        return Promise .reject (new Error ('Parameter missing: email'))
                                })
                                .then (function () {
                                    if (! password)
                                        return Promise .reject (new Error ('Parameter missing: password'))
                                })
                                .then (function () {
                                    if (password .length < 8)
                                        return Promise .reject (new Error ('Parameter length must be larger or equal to 8: password'))
                                })
                                .then (function () {
                                    return session .run (
                                        'MATCH (user:User { email: { email } })' +
                                        'RETURN user',
                                        { 
                                            email: email
                                        }
                                    )
                                }) 
                                .then (function (results) {
                                    if (results .records .length)
                                        return Promise .reject (new Error ('User already exists'))
                                })
                                .then (function () {
                                    return session .run (
                                        'CREATE (user:User { email: { email }, password: { password } })' +
                                        'RETURN user',
                                        {
                                            email: email,
                                            password: password
                                        }
                                    )
                                })
                                .then (function (results) {
                                    return { token: tokenizer (results .records [0] ._fields [0]) }
                                })
                                .catch (function (err) {
                                    return {
                                        error: err .message
                                    }
                                })
                        })
                        .then (function (x) {
                            ctx .body = x;
                        })
                        .then (next)
                    };