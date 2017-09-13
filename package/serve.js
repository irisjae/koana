require ('koa-qs') (new (require ('koa')) ())
	.use (require ('koa-cors') ())
	.use (function (ctx, next) {
		return	next ()
					.catch (function (err) {
						console .error (err)
						
						ctx .type = 'application/json'
						ctx .status = /*err .code || */500
						//ctx .message = err .message || 'Internal Server Error'
						ctx .body =	{
										error:	err .message
									}
					});
	})
	.use (require ('koa-morgan') ('combined'))
	.use (require ('koa-bodyparser') ())
	.use (require ('koa-json') ())
	.use ((function (routes, router) {
		return routes .reduce (function (router, route_path) {
			route_path = route_path .slice (route_path .indexOf ('..') + 3);
			var file_separator = route_path .lastIndexOf ('/');
			var method = route_path .slice (file_separator + 1);
			var route = '/' + route_path .slice (0, file_separator);
			router [method] (route, require (route_path));
			return router;
		}, router) .routes ();
	}) ((function (extensions) {
		var search =	function (dir) {
							return	require ('fs-extra') .readdirSync (dir)
										.reduce (function (results, file) {
											var full_file = dir + '/' + file;
											var stat = require ('fs-extra') .statSync (full_file);
											if (stat && stat .isDirectory ())
												return results .concat (search (full_file));
											else if (extensions .some (function (extension) {
												return file .indexOf (extension) !== -1;
											}))
												return results .concat ([full_file .slice (0, full_file .lastIndexOf ('.'))]);
											else
												return results;
										}, []);
						};
		return search;
	}) (['get', 'post']) (__dirname + '/../api'), require ('koa-router') ()))
	
	.use (require ('koa-static') (__dirname + '/../platforms/browser/www'))
	
	.listen (8080);

console .log ('Listening at ' + process .env .C9_HOSTNAME + ':' + process .env .PORT + '...')