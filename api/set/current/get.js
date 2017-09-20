var use_db = require ('api/use_db')
var decode = require ('api/decode');
var detokenizer = require ('api/tokenizer');
var neonum = require ('api/neonum');

module .exports = function (ctx, next) {
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
                            else
                                user .level = results .records [0] .fields [0] .properties .level;
                        })
                        .then (function () {
                            return  session .run (
                                        'MATCH (user:User) WHERE ID (user) = {user} .id ' +
                                        'MATCH (set:Set)<-[:to]-(:does)-[:_]->(user)' +
                                        'RETURN set',
                                        {
                                            user: user
                                        });
                        })
                        .then (function (results) {
                            if (! results .records .length)
                                return Promise .reject (new Error ('User has no set'))
                        })
                        .then (function () {
                            return  session .run (
                                        'MATCH (user:User) WHERE ID (user) = { user_id } ' +
                                        'MATCH (set:Set)<-[:to]-(:does)-[:_]->(user)' +
                                        'MATCH (question:Question)<-[:_]-(:is)-[:in]->(set) ' +
                                        'RETURN question',
                                        {
                                            user: user
                                        });
                        })
                        .then (function (results) {
                            return  results .records
                                        .map (function (record) {
                                            return record .fields [0] .properties
                                        })
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