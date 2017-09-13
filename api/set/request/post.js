var use_db = require ('api/use_db');
var config = require ('api/config');
var detokenizer = require ('api/detokenizer');
var neonum = require ('api/neonum');

module .exports = function (ctx, next) {
    var user = { id: neonum (detokenizer (ctx .request .body .user .token)) };
    var player = { id: neonum (detokenizer (ctx .request .body .player .token)) };
    var subcategory = { name: ctx .request .body .subcategory };
    var achievement;
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
                        })
                        .then (function () {
                            return  session .run (
                                        'MATCH (subcategory:Subcategory { name: {subcategory} .name }) ' +
                                        'RETURN subcategory',
                                        {
                                            subcategory: subcategory
                                        })
                        })
                        .then (function (results) {
                            if (! results .records .length)
                                return Promise .reject (new Error ('Subcategory not found'))
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
                            if (results .records .length)
                                return Promise .reject (new Error ('Player already doing another set'))
                        })
                        .then (function () {
                            return  session .run (
                                        'MATCH (player:Player) WHERE ID (player) = {player} .id ' +
                                        'MATCH (subcategory:Subcategory { name: {subcategory} .name }) ' +
                                        'MERGE (subcategory)<-[:in]-(achievement:achieves)-[:_]->(player) ' +
                                        'RETURN achievement',
                                        {
                                            player: player
                                        });
                        })
                        .then (function (results) {
                            achievement = results .records [0] ._fields [0] .properties;
                            achievement .level = achievement .level || config .level .default;
                        })
                        .then (function () {
                            return  session .run (
                                        'MATCH (player:Player) WHERE ID (player) = {player} .id ' +
                                        'MATCH (subcategory:Subcategory { name: {subcategory} .name }) ' +
                                        'MATCH (question:Question)<-[:_]-(:is)-[:in]->(subcategory) ' +
                                        //'WHERE NOT (player)<-[:_]-(:done)-[:to]->(question) ' +
                                        'RETURN question',
                                    {
                                        user: user,
                                        subcategory: subcategory
                                    });
                        })
                        .then (function (results) {
                            return  results .records
                                        .sort (function (a, b) {
                                            var a_difficulty = a ._fields [0] .properties .difficulty;
                                            var b_difficulty = b ._fields [0] .properties .difficulty;
                                            if (Math .abs (a_difficulty - achievement .level) < Math .abs (b_difficulty - achievement .level))
                                                return -1;
                                            if (Math .abs (a_difficulty - achievement .level) > Math .abs (b_difficulty - achievement .level))
                                                return 1;
                                            return 0;
                                        })
                                        .slice (0, 10)
                        })
                        .then (function (results) {
                            return  Promise .all (
                                        results .map (function (record) {
                                            var question = { id: record ._fields [0] .identity };
                                            return  session .run (
                                                        'MATCH (player:Player) WHERE ID (player) = {player} .id ' +
                                                        'MATCH (question:Question) WHERE ID (question) = {question} .id ' +
                                                        'MERGE (set:Set { subcategory: { name: {subcategory} .name } })<-[:to]-(:does)-[:_]->(player) ' +
                                                        'MERGE (question)<-[:_]-(:is)-[:in]->(set) ' +
                                                        'RETURN question',
                                                    {
                                                        player: player,
                                                        question: question,
                                                        subcategory: subcategory
                                                    })
                                                    .then (function (results) {
                                                        return results .records [0]
                                                    })
                                                    .then (function (record) {
                                                        return record ._fields [0] .properties
                                                    })
                                        })
                                    );
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