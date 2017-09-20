var use_db = require ('api/use_db');
var tokenizer = require ('api/tokenizer');
var decode = require ('api/decode');
var detokenizer = require ('api/detokenizer');
var neonum = require ('api/neonum');

module .exports =   function (ctx, next) {
                        var user = { id: detokenizer (decode (ctx .request .headers .user) .token) };
                        var player = { id: detokenizer (decode (ctx .request .headers .player) .token) };
                        return  use_db (function (session) {
                                    return  Promise .resolve ()
                                        .then (function () {
                                            return  session .run (
                                                        'MATCH (user:User) WHERE ID (user) = {user} .id ' +
                                                        'MATCH (player:Player) WHERE ID (player) = {player} .id ' +
                                                        'MATCH (user)<-[x:of]-(y:is)-[z:_]->(player) ' +
                                                        'DELETE x, y, z, player ',
                                                        {
                                                            user: user,
                                                            player: player
                                                        })
                                        })
                                        .then (function (results) {
                                            if (! results .records .length)
                                                return Promise .reject (new Error ('Invalid user or player specified'))
                                        })
                                        .then (function (results) {
                                            return {}
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