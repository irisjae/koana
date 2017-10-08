var use_db = require ('api/use_db');
var decode = require ('api/decode');
var tokenizer = require ('api/tokenizer');
var detokenizer = require ('api/detokenizer');

module .exports = function (ctx, next) {
    var user = { id: detokenizer (decode (ctx .request .headers .user) .token) };
    var player = { id: detokenizer (decode (ctx .request .headers .player) .token) };
    var set_;
    return  use_db (function (session) {
                return  Promise .resolve ()
                        .then (function () {
                            return  session .run (
                                        'MATCH (user:User) WHERE ID (user) = {user} .id ' +
                                        'MATCH (player:Player) WHERE ID (player) = {player} .id ' +
                                        'MATCH (player)-[:_]-(:is)-[:of]-(user) ' +
                                        'RETURN user',
                                        {
                                            user: user,
                                            player: player
                                        })
                        })
                        .then (function (results) {
                            if (! results .records .length)
                                return Promise .reject (new Error ('Invalid user specified'))
                        })
                        .then (function () {
                            return  session .run (
                                        'MATCH (player:Player) WHERE ID (player) = {player} .id ' +
                                        'MATCH (set:Set)<-[:to]-(:does)-[:_]->(player)' +
                                        'RETURN set',
                                        {
                                            player: player
                                        });
                        })
                        .then (function (results) {
                            if (! results .records .length)
                                return Promise .reject (new Error ('User has no set'));
                            set_ = results .records [0] ._fields [0];
                        })
                        .then (function () {
                            return  session .run (
                                        'MATCH (player:Player) WHERE ID (player) = {player} .id ' +
                                        'MATCH (set:Set)<-[:to]-(:does)-[:_]->(player)' +
                                        'MATCH (question:Question)<-[:_]-(:is)-[:in]->(set) ' +
                                        'RETURN question',
                                        {
                                            player: player
                                        })
            							.then (function (results) {
            								return results .records
            							})
            							.then (function (records) {
            								return records .map (function (record) {
            								    return record ._fields [0] .properties
            								})
            							})
                        })
                        .then (function (questions) {
							return {
								questions: questions,
								token: tokenizer (set_)
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