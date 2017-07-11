var fs = require ('fs-extra');
var unzip = require ('unzip');
var path = require ('path');
var fetch = require ('node-fetch');
var R = require ('ramda');

var promise_tap =   function (fn) {
                        return  function (x) {
                                    return Promise .resolve (x) .then (fn)
                                }
                    }
var with_ = function (stream) {
    return new Promise (function (resolve) {
        stream .on ('finish', resolve);
    })
}
 
var go = Promise .resolve .bind (Promise);
var throw_ = Promise .reject .bind (Promise);
var all_done_ = Promise .all .bind (Promise);

var _done = Promise .reject ();
var done_ = function (x) {
    if (x === _done)
        return;
    else
        return Promise .reject (x);
}



var exists = fs .pathExists;
var write =	function (locative) {
				return	function (object) {		
							return fs .outputFile (locative, object);
						}
			};
var read =  function (locative) {
                return fs .readFileSync (locative) .toString ();
            }

var self =  function (module_path) {
                var submodules_path;
                var submodules_json_path;
                return go ()
                    .then (function () {
                        submodules_path = path .join (module_path, '.modules')
                        return  exists (submodules_path)
                                    .then (function (has_modules) {
                                        if (! has_modules) {
                                            return _done;
                                        }
                                    })
                    })
                    .then (function () {
                        submodules_json_path = path .join (submodules_path, '&.json')
                        return read (submodules_json_path)
                    })
                        .then (JSON .parse)
                    .then (R .pipe (
                        R .mapObjIndexed (function (files, module) {
                            return R .pipe (
                                promise_tap (function () {
                                    return fs .ensureDir (path .join (submodules_path, module))
                                }),
                                R .mapObjIndexed (function (url, name) {
                                    var file_path = path .join (submodules_path, name);
                                    var temp_path = path .join (submodules_path, name + '.temp');
                                    return  fetch (url)
                                                .then (function (res) {
                                                    return res .buffer ()
                                                })
                                                .then (function (file) {
                                                    return fs .outputFile (file_path, file);
                                                })
                                                .then (function () {
                                                    if (name .endsWith ('/')) {
                                                        return  with_ (fs .createReadStream (file_path)
                                                                        .pipe (
                                                                            unzip .Extract ({ path: temp_path }))
                                                                ) .then (function () {
                                                                    fs .move (temp_path, file_path);
                                                                });
                                                    }
                                                })
                                                .then (function () {
                                                    if (name .endsWith ('/')) {
                                                        return  with_ (fs .createReadStream (file_path)
                                                                        .pipe (
                                                                            unzip .Extract ({ path: temp_path }))
                                                                ) .then (function () {
                                                                    fs .move (temp_path, file_path);
                                                                });
                                                    }
                                                })
                                                .then (function () {
                                                    if (name === '.modules/') {
                                                        return self (file_path);
                                                    }
                                                })
                                }),
                                R .values,
                                all_done_
                            ) (files)
                        }),
                        R .values,
                        all_done_
                    ))
            }
            
            
go ()
    .then (function () {
        if (process .argv [2]) {
            return self (path .resolve (process .argv [2]));
        }
        else {
            return throw_ ();
        }
    })
    .then (done_)