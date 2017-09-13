var neo4j = require ('neo4j-driver') .v1;

var _port =  function (port) {
                var last_attempt;
                var fetch_driver =  function () {
                                        last_attempt = new Promise (function (resolve, reject) {
                                            var driver = neo4j .driver ("bolt://localhost:" + port);
                                            
                                            /**/module .exports .driver = driver;
                                            resolve (driver);
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
                
                return   function (use_case) {
                            var error_flag = false;
                            var error;
                            return  fetch_session ()
                                        .then (function (session) {
                                            return  Promise .resolve (use_case (session))
                                                        .catch (function (e) {
                                                            //console .error ('error', e);
                                                            error_flag = true;
                                                            error = e;
                                                        })
                                                        .then (function (data) {
                                                            session .close ();
                                                            return data
                                                        })
                                        })
                                        .then (function (data) {
                                            if (error_flag)
                                                return Promise .reject (error);
                                            else
                                                return data;
                                        })
                        }
            };

var export_ =   function (port) {
                    var use_db = _port (port);
                    use_db .port = port;
                    use_db .on = _port;
                    return use_db;
                };

module .exports = export_ (process .env .BOLT_PORT || 8081);