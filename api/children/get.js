var use_db = require ('api/use_db')
var detokenizer = require ('api/detokenizer')
var tokenizer = require ('api/tokenizer')

module .exports =   function (ctx, next) {
                        var parent_id = detokenizer (ctx .request .body .parent_token);
                        return  use_db (function (session) {
                                    return  session .run (
                                                'MATCH (parent:Parent) WHERE ID (parent) = { parent_id } ' +
                                                'MATCH (children:Child)<-[:Parents]-(parent) ' +
                                                'RETURN children ',
                                            {
                                                parent_id: parent_id
                                            })
                                                .then (function (results) {
                                                    return  results .records .map (function (record) {
                                                                return  {
                                                                            token: tokenizer (record ._fields [0]),
                                                                            name: record ._fields [0] .properties .name
                                                                        }
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