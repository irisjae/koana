var path = require ('path');
var fs = require ('fs-extra');
var write =	function (path) {
				return	function (string) {		
							fs .outputFileSync (path, string);
						}
			};
var file =  function (key) {
                return path .join (__dirname, '/../data/' + key + '.json')
            }
var format =    function (data) {
                    return JSON .stringify (data, undefined, 4)
                }	

module .exports = function (key, value) {
    write (file (key)) (format (value))
}