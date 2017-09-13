var report = require ('test/utils/report');
var fetch = require ('node-fetch');
var use_db = require ('api/use_db');
var detokenizer = require ('api/detokenizer');

var path/* of api */ = 'http://localhost:8080/api'

var parent = require ('test/utils/read') ('subcategories');

module .exports = function (t) {
	return	t .test ('/api/register POST endpoint', function (t) {
		var token;
		
		return	Promise .resolve ()
		.then (function () {
			return t .test ('api works', function (t) {
				var response/* of fetch */;
		
				report ('fetching...');
				return fetch (path + '/register', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON .stringify ({
						email: parent .email,
						password: parent .password
					})
				})
				.then (function (_) {
					report ('fetched');
					response = _;
				})
				.then (function () {
					t .equal (response .status, 200, 'response status is 200');
				})
				.then (function () {
					return response .json ()
				})
				.then (function (response/* as json */) {
					t .ok (response .id, 'reponse has id');
					token = response .id;
					report ('token: ', token);
					//t .same (response, {}, 'response json is {}');
				})
        		.then (function () {
        			return t .test ('works with db', function (t) {
        				report ('querying...');
        				return	use_db (function (session/* of db */) {
        	                return  session .run (
                                'MATCH (parent:Parent) WHERE ID (parent) = { id } RETURN parent', {
                            	id: detokenizer (token)
        	                })
        	            })
        	            .then (function (results/* of query */) {
        	    			report ('completed query');
        	                t .equal (results .records .length, 1, 'exactly one matching parent')
        	                t .equal (results .records [0] ._fields [0] .properties .email, parent .email, 'parent email matches')
        	                t .equal (results .records [0] ._fields [0] .properties .password, parent .password, 'parent password matches')
        	            })
        	            .catch (t .threw)
        	            .then (function () {
        	            	use_db .driver .close ();
        	            })
        			})
        		})
			})
		})
	})
}