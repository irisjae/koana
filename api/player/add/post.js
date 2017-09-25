var use_db = require ('api/use_db');
var tokenizer = require ('api/tokenizer');
var decode = require ('api/decode');
var detokenizer = require ('api/detokenizer');
var neonum = require ('api/neonum');

module .exports =   function (ctx, next) {
                        var user = { id: detokenizer (decode (ctx .request .headers .user) .token) };
                        var name = ctx .request .body .name;
                        var school_name = ctx .request .body .name;
                        var date_of_birth = ctx .request .body .date_of_birth;
                        var koder_archetype = ctx .request .body .koder_archetype;
                        var koder_name = ctx .request .body .koder_name;
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
                                                        'CREATE (player:Player) ' +
                                                        'MERGE (user)<-[:of]-(:is)-[:_]->(player) ' +
                                                        'SET player .name = { name } ' +
                                                        'SET player .school_name = { school_name } ' +
                                                        'SET player .date_of_birth = { date_of_birth } ' +
                                                        'SET player .koder_archetype = { koder_archetype } ' +
                                                        'SET player .koder_name = { koder_name } ' +
                                                        'RETURN player',
                                                        {
                                                            user: user,
                                                            name: name,
                                                            school_name: school_name,
                                                            date_of_birth: date_of_birth,
                                                            koder_archetype: koder_archetype,
                                                            koder_name: koder_name
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