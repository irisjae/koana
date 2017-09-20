var use_db = require ('api/use_db');
var tokenizer = require ('api/tokenizer');
var decode = require ('api/decode');
var detokenizer = require ('api/detokenizer');
var neonum = require ('api/neonum');

module .exports =   function (ctx, next) {
                        var user = { id: detokenizer (decode (ctx .request .headers .user) .token) };
                        var name = ctx .request .body .name;
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
                                                        'CREATE (player:Player { name: { name } }) ' +
                                                        'MERGE (user)<-[:of]-(:is)-[:_]->(player) ' +
                                                        'RETURN player',
                                                        {
                                                            user: user,
                                                            name: name
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