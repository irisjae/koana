var neo4j = require ('neo4j-driver') .v1;


module .exports =   function (use_case) {
                        return  (new Promise (function (resolve, reject) {
                                    var driver = neo4j .driver ("bolt://localhost:8081");
            
                                    driver .onCompleted =   function () {
                                                                resolve ({
                                                                    driver: driver,
                                                                    session: session
                                                                });
                                                            };
                                    driver .onError =    function (error) {
                                                            reject ({
                                                                driver: driver,
                                                                error: error
                                                            })
                                                        };
                                    var session = driver .session ();
                                }))
                                    .then (function (using_case) {
                                        return  Promise .resolve (using_case .session)
                                                    .then (use_case)
                                                    .then (function (data) {
                                                        return {
                                                            data: data,
                                                            driver: using_case .driver
                                                        };
                                                    })
                                                    .catch (function (error) {
                                                        console .log ('error', error);
                                                        return {
                                                            error: error,
                                                            driver: using_case .driver
                                                        }
                                                    })
                                    })
                                    .catch (function (using_case) {
                                        console .log ('Driver instantiation failed', using_case .error);
                                        return using_case;
                                    })
                                    .then (function (using_case) {
                                        using_case .driver .close ();
                                        return using_case .data;
                                    })
                    };