var use_db = require ('api/use_db');
var decode = require ('api/decode');
var detokenizer = require ('api/detokenizer');

module .exports = function (ctx, next) {
    var user = { id: detokenizer (decode (ctx .request .headers .user) .token) };
    var player = { id: detokenizer (decode (ctx .request .headers .player) .token) };
    var latest_quizes;
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
                                return Promise .reject (new Error ('Invalid user specified'))
                                
                            latest_quizes = results .records [0] ._fields [0] .properties .latest_quizes || []
                            latest_quizes = latest_quizes.slice (0, -1)
                        })
                        .then (function () {
                            return  session .run (
                                        'MATCH (user:User) WHERE ID (user) = {user} .id ' +
                                        'MATCH (player:Player) WHERE ID (player) = {player} .id ' +
                                        'MATCH (user)<-[:of]-(:is)-[:_]->(player) ' +
                                        'RETURN player',
                                        {
                                            user: user,
                                            player: player
                                        })
                        })
                        .then (function (results) {
                            if (! results .records .length)
                                return Promise .reject (new Error ('Invalid player specified'))
                        })
                        .then (function () {
                            return  session .run (
                                        'MATCH (player:Player) WHERE ID (player) = {player} .id ' +
                                        'MATCH (set:Set)<-[:to]-(:does)-[:_]->(player) ' +
                                        'RETURN set',
                                        {
                                            player: player
                                        });
                        })
                        .then (function (results) {
                            if (! results .records .length)
                                return Promise .reject (new Error ('Player not doing set'))
                        })
						.then (function () {
							return  session .run (
										'MATCH (user:User) WHERE ID (user) = {user} .id ' +
										'SET user .latest_quizes = {latest_quizes} ',
										{
											user: user,
											latest_quizes: latest_quizes
										});
						})
                        .then (function () {
                            return  session .run (
                                        'MATCH (player:Player) WHERE ID (player) = {player} .id ' +
                                        'MATCH (set:Set)<-[x:to]-(y:does)-[z:_]->(player) ' +
                                        'OPTIONAL MATCH (set)<-[w:in]-(u:is)-[q:_]->(:Question) ' +
                                        'DELETE set, x, y, z, w, u, q',
                                        {
                                            player: player
                                        });
                        })
                        .then (function (questions) {
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
            .then (function () {
                return next ();
            })
};