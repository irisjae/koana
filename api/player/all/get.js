var R = require ('ramda');
var use_db = require ('api/use_db');
var tokenizer = require ('api/tokenizer');
var decode = require ('api/decode');
var detokenizer = require ('api/detokenizer');

module .exports =   function (ctx, next) {
                        var user = { id: detokenizer (decode (ctx .request .headers .user) .token) };
                        return  use_db (function (session) {
                                    return  Promise .resolve ()
                                        .then (function () {
                                            return  session .run (
                                                        'MATCH (user:User) WHERE ID (user) = {user} .id ' +
                                                        'RETURN user',
                                                        {
                                                            user: user
                                                        })
                                        })
                                        .then (function (results) {
                                            if (! results .records .length)
                                                return Promise .reject (new Error ('User not found'))
                                        })
                                        .then (function (results) {
                                            return  session .run (
                                                        'MATCH (user:User) WHERE ID (user) = {user} .id ' +
                                                        'MATCH (player)<-[:_]-(:is)-[:of]->(user) ' +
                                                        'RETURN player',
                                                        {
                                                            user: user
                                                        }
                                                    )
                                        })
                                        .then (function (results) {
                                            return results .records .map (function (record) {
                                                return R. merge (record ._fields .properties) ({
                                                    token: tokenizer (record ._fields [0])
                                                })
                                            })
                                        })
                                        .then (function (_) {
                                            return {
                                                _: _
                                            }
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