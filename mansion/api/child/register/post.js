var use_db = require ('api/use_db')
var detokenizer = require ('api/detokenizer')

module .exports =   function (ctx, next) {
                        var parent_id = detokenizer (ctx .request .body .parent_token);
                        var name = ctx .request .body .name;
                        var pin = ctx .request .body .pin;
                        return  use_db (function (session) {
                                    return  session .run (
                                                'MATCH (parent:Parent) WHERE ID (parent) = { id } ' + 
                                                'RETURN parent',
                                            {
                                                id: parent_id
                                            })
                                                .then (function (results) {
                                                    if (! results .records .length)
                                                        return Promise .reject (new Error ('Parent doesn\'t exists'))
                                                })
                                                .then (function () {
                                                    return  session .run (
                                                                'CREATE (child:Child { name: { name }, pin: { pin }, level: { level } })',
                                                            {
                                                                name: name,
                                                                pin: pin,
                                                                level: 1
                                                            })
                                                })
                                                .then (function () {
                                                    return {}
                                                })
                                })
                                    .then (function (x) {
                                        ctx .body = x;
                                    })
                                    .then (function () {
                                        return next ();
                                    })
                    };