var report = require ('test/report');
var fetch = require ('node-fetch');
var use_db = require ('api/use_db')

var path/* of api */ = 'http://localhost:8080/api'

var _case = require ('test/case/parent.json');

module .exports =	function (t) {
	return	t .test ('/api/register POST endpoint', function (t) {
		return	Promise .resolve ()
		.then (function () {
			return t .test ('works with fetch', function (t) {
				var response/* of fetch */;
		
				report ('fetching...');
				return fetch (path + '/register', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON .stringify ({
						email: _case .email,
						password: _case .password
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
					t .same (response, {}, 'response json is {}');
				})
			})
		})
		.then (function () {
			return t .test ('works with db', function (t) {
				report ('querying...');
				return	use_db (function (session/* of db */) {
	                return  session .run (
	                    'MATCH (parent:Parent { email: { email }, password: { password } }) RETURN parent', {
	                	email: _case .email,
	                	password: _case .password
	                })
	            })
	            .then (function (results/* of query */) {
	    			report ('completed query');
	                t .equal (results .records .length, 1, 'exactly one matching parent')
	                t .equal (results .records [0] ._fields [0] .properties .email, _case .email, 'parent email matches')
	                t .equal (results .records [0] ._fields [0] .properties .password, _case .password, 'parent password matches')
	            })
	            .catch (t .threw)
	            .then (function () {
	            	use_db .driver .close ();
	            })
			})
		})
	})
}