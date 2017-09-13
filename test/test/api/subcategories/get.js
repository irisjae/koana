var report = require ('test/utils/report');
var fetch = require ('node-fetch');
var use_db = require ('api/use_db');
var detokenizer = require ('api/detokenizer');

var R = require ('ramda');

var path/* of api */ = 'http://localhost:8080/api'

var category = require ('test/utils/read') ('category');
var subcategory = require ('test/utils/read') ('subcategory');

module .exports = function (t) {
	return	t .test ('/api/subcategories GET endpoint', function (t) {
		return	Promise .resolve ()
		.then (function () {
			return t .test ('api works', function (t) {
				var response/* of fetch */;
		
				report ('fetching...');
				return fetch (path + '/subcategories', {
					method: 'GET'
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
				    var values = R .values (response);
				    
					t .type (response, 'object', 'response is object');
					t .ok (values .length, 'category list is populated');

					var subcategories_list = response [category .name];
					var list_key;
					
					t .type (subcategories_list, Array, 'categories have lists of subcategories');
					t .equal (
					    subcategories_list .filter (function (x, i) {
    					    if (x [0] === subcategory .name) {
    					        list_key = i;
    					        return true;
    					    }
    					}) .length,
    					1, 'category contains specified subcategory');
					t .equal (subcategories_list [list_key] .length, 3, 'subcategory tuples have 3 items');
					t .equal (subcategories_list [list_key] [0], subcategory .name, 'subcategory name matches');
				})
			})
		})
	})
}