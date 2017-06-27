var casual = require ('casual');
var path = require ('path');
var fs = require ('fs-extra');
var write =	function (path) {
				return	function (string) {		
							fs .outputFileSync (path, string);
						}
			};
var file =  function (role) {
                return path .join (__dirname, '/case/' + role + '.json')
            }
var format =    function (data) {
                    return JSON .stringify (data, undefined, 4)
                }			
                
write (file ('parent')) (format ({
    email: casual .email,
    password: casual .password
}))