var use_db = require ('api/use_db')

module .exports =   function (ctx, next) {
                        return  use_db (function (session) {
                                    return session .run (
                                        'MATCH (nonexistent:Nonexistent)' +
                                        'RETURN nonexistent')
                                })
                                .then (function () {
                                    ctx .body = {
                                        wake: 'up'
                                    };
                                })
                                .then (next)
                    };