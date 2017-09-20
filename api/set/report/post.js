var use_db = require ('api/use_db')
var decode = require ('api/decode');
var detokenizer = require ('api/tokenizer');
var neonum = require ('api/neonum');
var elo_step = require ('api/elo_step');

module .exports = function (ctx, next) {
    var user = { id: detokenizer (decode (ctx .request .headers .user) .token) };
    var player = { id: detokenizer (decode (ctx .request .headers .player) .token) };
    var set_ = ctx .request .body .set_;
    var subcategory;
    return  use_db (function (session) {
                return  Promise .resolve ()
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
                                return Promise .reject (new Error ('Invalid user or player specified'))
                            else
                                user .level = results .records [0] .fields [0] .properties .level;
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
                                return Promise .reject (new Error ('Player is not doing set'))
                        })
                        .then (function () {
                            return  session .run (
                                        'MATCH (player:Player) WHERE ID (player) = {player} .id ' +
                                        'MATCH (set:Set)<-[:to]-[doing:does]-[:_]->(player) ' +
                                        'REMOVE doing:does ' +
                                        'SET doing:done ' +
                                        'RETURN set ',
                                        {
                                            player: player
                                        });
                        })
                        .then (function (results) {
                            subcategory = results .records [0] .fields [0] .properties .subcategory;
                        })
                        .then (function () {
                            return  session .run (
                                        'MATCH (player:Player) WHERE ID (player) = {player} .id ' +
                                        'MATCH (subcategory:Subcategory { name: {subcategory} .name }) ' +
                                        'MATCH (subcategory)<-[:in]-(achievement:achieves)-[:_]->(player)' +
                                        'RETURN achievement',
                                        {
                                            player: player,
                                            subcategory: subcategory
                                        });
                        })
                        .then (function (results) {
                            return results .records [0] .fields [0] .properties;
                        })
                        .then (function (achievement) {
                            return  session .run (
                                        'MATCH (player:Player) WHERE ID (player) = {player} .id ' +
                                        'MATCH (subcategory:Subcategory { name: {subcategory} .name }) ' +
                                        'MATCH (subcategory)<-[:in]-(achievement:achieves)-[:_]->(player)' +
                                        'SET achievement .level = {achievement} .level',
                                        {
                                            player: player,
                                            subcategory: subcategory,
                                            achievement: {
                                                level: elo_step (set_, achievement)
                                            }
                                        });
                        })
                        .then (function () {
                            return {};
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