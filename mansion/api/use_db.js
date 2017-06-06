var neo4j = require ('neo4j-driver') .v1;


var get_session =   function () {
                        if (module .exports .driver)
                            return  Promise .resolve (module .exports .driver)
                                        .then (function (driver) {
                                            return driver .session ();
                                        })
                        else
                            return (new Promise (function (resolve, reject) {
                                var driver = neo4j .driver ("bolt://localhost:8081");
        
                                driver .onCompleted =   function () {
                                                            module .exports .driver = driver;
                                                            resolve (session);
                                                        };
                                driver .onError =   function (error) {
                                                        reject (error)
                                                    };
                                var session = driver .session ();
                            }))    
                    }

module .exports =   function (use_case) {
                        return  get_session ()
                                    .then (function (session) {
                                        return  Promise .resolve (session)
                                                    .then (use_case)
                                                    .catch (function (error) {
                                                        console .log ('error', error);
                                                    })
                                                    .then (function (data) {
                                                        session .close ();
                                                        return data
                                                    })
                                    })
                                    .catch (function (error) {
                                        console .log ('Driver instantiation failed', error);
                                    })
                    };