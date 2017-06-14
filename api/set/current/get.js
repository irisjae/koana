var use_db = require ('api/use_db')
var detokenizer = require ('api/tokenizer');

module .exports =   function (ctx, next) {
                        var child_id = detokenizer (ctx .request .body .child_token);
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
                                                                'MATCH (set:Set)<-[:Does]-(child:Child) WHERE ID (child) = { child_id } ' +
                                                                'RETURN set',
                                                            {
                                                                child_id: child_id
                                                            });
                                                })
                                                .then (function (results) {
                                                    if (! results .records .length)
                                                        return Promise .reject (new Error ('Child has no set'))
                                                })
                                                .then (function () {
                                                    return  session .run (
                                                                'MATCH (child:Child) WHERE ID (child) = { child_id } ' +
                                                                'MATCH (set:Set)<-[:Does]-(child) ' +
                                                                'MATCH (set)-[:Contains]->(question:Question) ' +
                                                                'RETURN question',
                                                            {
                                                                child_id: child_id,
                                                            });
                                                })
                                                .then (function (results) {
                                                    return  results .records
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