var use_db = require ('api/use_db')
var detokenizer = require ('api/tokenizer');

module .exports =   function (ctx, next) {
                        var child_id = detokenizer (ctx .request .body .child_token);
                        var subcategory = detokenizer (ctx .request .body .subcategory);
                        return  use_db (function (session) {
                            
                                    var child_level;
                            
                                    return  Promise .resolve ()
                                                .then (function () {
                                                    return  session .run (
                                                                'MATCH (child:Child) WHERE ID (child) = { child_id } ' +
                                                                'RETURN child',
                                                            {
                                                                child_id: child_id
                                                            })
                                                })
                                                .then (function (results) {
                                                    if (! results .records .length)
                                                        return Promise .reject (new Error ('Child not found'))
                                                    child_level = results .records [0] .fields [0] .properties .level;
                                                })
                                                .then (function () {
                                                    return  session .run (
                                                                'MATCH (subcategory:Subcategory { name: { name } }) ' +
                                                                'RETURN subcategory',
                                                            {
                                                                name: subcategory
                                                            })
                                                })
                                                .then (function (results) {
                                                    if (! results .records .length)
                                                        return Promise .reject (new Error ('Subcategory not found'))
                                                })
                                                .then (function () {
                                                    return  session .run (
                                                                'MATCH (set:Set)<-[:Does]-(child:Child) WHERE ID (child) = { child_id } ' +
                                                                'RETURN set',
                                                            {
                                                                child_id: child_id
                                                            });
                                                })
                                                .then (function (results) {
                                                    if (results .records .length)
                                                        return Promise .reject (new Error ('Child already is doing set'))
                                                })
                                                .then (function () {
                                                    return  session .run (
                                                                'MATCH (child:Child) WHERE ID (child) = { child_id } ' +
                                                                'MATCH (question:Question)<-[:Owns]-(subcategory:Subcategory { name: { name } }) ' +
                                                                'WHERE NOT (child)-[:Finished]->(question) ' +
                                                                'RETURN question',
                                                            {
                                                                child_id: child_id,
                                                                name: subcategory
                                                            });
                                                })
                                                .then (function (results) {
                                                    return  results .records
                                                                .sort (function (a, b) {
                                                                    var a_difficulty = a .fields [0] .properties .difficulty;
                                                                    var b_difficulty = b .fields [0] .properties .difficulty;
                                                                    if (Math .abs (a_difficulty - child_level) < Math .abs (b_difficulty - child_level))
                                                                        return -1;
                                                                    if (Math .abs (a_difficulty - child_level) > Math .abs (b_difficulty - child_level))
                                                                        return 1;
                                                                    return 0;
                                                                })
                                                                .slice (0, 10)
                                                })
                                                .then (function (results) {
                                                    return  Promise .all (
                                                                results .map (function (record) {
                                                                    var question_id = record .identity .toString ();
                                                                    return  session .run (
                                                                                'MATCH (child:Child) WHERE ID (child) = { child_id } ' +
                                                                                'MATCH (question:Question) WHERE ID (question) = { question_id } ' +
                                                                                'MERGE (set:Set { subcategory: { name } })<-[:Does]-(child) ' +
                                                                                'MERGE (set)-[:Contains]->(question) ' +
                                                                                'RETURN question',
                                                                            {
                                                                                child_id: child_id,
                                                                                question_id: question_id,
                                                                                name: subcategory
                                                                            })
                                                                })
                                                            );
                                                })
                                                .then (function (results) {
                                                    return  results
                                                                .map (function (results) {
                                                                    return results .records [0]
                                                                })
                                                                .map (function (record) {
                                                                    return record .fields [0] .properties
                                                                })
                                                })
                                })
                                    .then (function (x) {
                                        ctx .body = x;
                                    })
                                    .then (function () {
                                        return next ();
                                    })
                    };