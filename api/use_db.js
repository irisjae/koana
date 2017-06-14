var neo4j = require ('neo4j-driver') .v1;

var last_attempt;

var fetch_driver =  function () {
                        last_attempt = new Promise (function (resolve, reject) {
                            var driver = neo4j .driver ("bolt://localhost:8081");
                            
                            /*/resolve (driver);
                            /*/driver .onCompleted =   function () {
                                                        module .exports .driver = driver;
                                                        resolve (driver);
                                                    };
                            driver .onError =   function (error) {
                                                    reject (error)
                                                };//*/
                        });
                        return last_attempt;
                    };

var fetch_session =   function () {
                        return  Promise .resolve (last_attempt)
                                    .then (function (driver) {
                                        if (driver)
                                            return driver;
                                        else
                                            return  fetch_driver ()
                                    })
                                    .then (function (driver) {
                                        return driver .session ();
                                    })
                    }

module .exports =   function (use_case) {
                        return  fetch_session ()
                                    .then (function (session) {
                                        return  Promise .resolve (use_case (session))
                                                    .catch (function (error) {
                                                        console .error ('error', error);
                                                    })
                                                    .then (function (data) {
                                                        session .close ();
                                                        return data
                                                    })
                                    })
                                    .catch (function (err) {
                                        console .error ('failed to make driver', err);
                                    })
                    };