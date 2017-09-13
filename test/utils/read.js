var path = require ('path');
var fs = require ('fs-extra');
var read =	function (path) {
				return fs .readFileSync (path) .toString ();
			};
var file =  function (key) {
                return path .join (__dirname, '/../data/' + key + '.json')
            }

module .exports = function (key) {
    return JSON .parse (read (file (key)));
}