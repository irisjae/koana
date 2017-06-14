module .exports =   function (ctx, next) {
                        return  Promise .resolve ()
                                    .then (function (results) {
                                        return { ping: 'pong' };
                                    })
                                    .then (function (x) {
                                        ctx .body = x;
                                    })
                                    .then (function () {
                                        return next ();
                                    })
                    };