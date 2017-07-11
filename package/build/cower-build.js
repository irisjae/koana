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
                var scripts_roll = [];
                var styles_tree = [];
                
                var compile;
                
                return go ()
                    .then (function () {
                        return read (path .join (module_path, '&.html'))
                    })
                    .then (function () {
                        
                    })
                    .then (function () {
						fs .ensureDirSync (styles_copy)
						fs .ensureDirSync (styles_cache)
				
						invalidate_cache ()
						var answer = grow_tree ('', base_tree);
						refresh_cache ();
						write (styles_dist) (answer);
                    })
                    .then (function () {
						for (var path in scripts_roll) {
						    copy (dist_ (path)) (path)
						}
                    })
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