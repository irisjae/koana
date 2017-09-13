var report = require ('test/utils/report');
var fetch = require ('node-fetch');
var use_db = require ('api/use_db');
var detokenizer = require ('api/detokenizer');
var neonum = require ('api/neonum');

var path/* of api */ = 'http://localhost:8080/api'

var user = require ('test/utils/read') ('user');
var invalid_user = require ('test/utils/read') ('invalid-user');

module .exports =	function (t) {
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
						email: user .email,
						password: user .password
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
					t .ok (response .token, 'reponse has token');
					token = response .token;
					report ('token:', token);
					//t .same (response, {}, 'response json is {}');
				})
        		.then (function () {
        			return t .test ('db constraints work', function (t) {
        				report ('querying db...');
        				return	use_db (function (session/* of db */) {
        	                return  session .run (
                                'MATCH (user:User) WHERE ID (user) = { id } RETURN user', {
                            	id: neonum (detokenizer (token))
        	                })
        	            })
        	            .then (function (results/* of query */) {
        	    			report ('completed query');
        	                t .equal (results .records .length, 1, 'exactly one matching user')
        	                t .equal (results .records [0] ._fields [0] .properties .email, user .email, 'user email matches')
        	                t .equal (results .records [0] ._fields [0] .properties .password, user .password, 'user password matches')
        	            })
        	            .catch (t .threw)
        	            .then (function () {
        	            	use_db .driver .close ();
        	            })
        			})
        		})
			})
		})
		.then (function () {
			return t .test ('api constraint works on invalid user', function (t) {
				var response;
		
				report ('fetching...');
				return fetch (path + '/register', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON .stringify ({
						email: invalid_user .email,
						password: invalid_user .password
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
				.then (function (response) {
					t .ok (response .error, 'reponse has error');
					t .notOk (response .token, 'reponse has no token');
					//t .same (response, {}, 'response json is {}');
				})
			})
		})
	})
}