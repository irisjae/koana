var use_db = require ('../use_db')

module .exports =   function (ctx, next) {
                        return  use_db (function (session) {
                                    return session .run ('MATCH (question:Question) MATCH (subcategory:Subcategory)-[:Owns]->(question) RETURN question, subcategory')
                                })
                                    .then (function (results) {
                                        return  results .records .map (function (record) {
                                                    return  {
                                                                category: record ._fields [1] .properties .name,
                                                                question: record ._fields [0] .properties
                                                            }
                                                })
                                    })
                                    .then (function (questions) {
                                        ctx .body = questions;
                                    })
                                    .then (function () {
                                        return next ();
                                    })
                    };