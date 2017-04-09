var eval_request =	function (request, data) {
						return	{
									method: request .method && riot .util .tmpl (request .method, data),
									headers: request .headers && riot .util .tmpl (request .headers, data),
									body: request .body && stringify (riot .util .tmpl (request .body, data))
								};
					};
var eval_response =	function (response, data) {
						return riot .util .tmpl (response, data);
					};	
var query =	function (path, request) {
				if (request .method === 'local') {
					return	Promise .resolve (parse (request .body))
								.then (function (response) {
									log ('queryied local', path, request, response);
									return response;
								});
				}
				else {
					return	fetch (path, request)
								.then (function (response) {//log (response);
								    return response .json ();
								})
								.then (function (response) {
									log ('queryied network', path, request, response);
									return response;
								});
				}
			};
			

var rest =	function (path) {
				return	function (requests) {
							return	requests .thru (throttle (0)) .thru (map, function (req) {//debugger;
										return	query (path,
													eval_request (req .from,
														{
															data: req .data,
															request: req .data
														}
													)
												)
													.then (function (response) {
														return	eval_response (req .to,
																	{
																		data: response,
																		response: response
																	}
																);
													})
													.catch (function (error) {
														return	{
																	error: error
																};
													})
									});
						}
			};
			
var resource =	function (name, path, req, res, cache_options) {
					return	cache (name, function (datas) {
								return	datas .thru (map, function (data) {//debugger;
											return	{
														from: req,
														data: data,
														to: res
													}
										}) .thru (rest (path))
							}, cache_options)
				};
					
				
var reader =	function (path, requests, responses, cache_options) {
					requests = requests || {};
					responses =	{
									read: responses .read || responses
								}
					cache_options = cache_options || {};

					var read_request = requests .read || { method: 'GET' };
					var read_response = responses .read || '{ data }';
					
					var reader_name = ':' + path + ':read';
					
					
					
					var reader = dialogify (resource (reader_name, path, read_request, read_response, cache_options));
						
					var read =	function () {
									reader .ask ();
									return reader .consensus ();
								};
						
					return	dialogify (having ({
								impression: read,
								compromise: constant (read),
							}) (delegation (reader)));
				};
var editer =	function (path, requests, responses, cache_options) {
					requests = requests || {};
					responses =	{
									read: responses .read || responses,
									write: responses .write || responses
								}
					cache_options = cache_options || {};
					
					var read_request = requests .read || { method: 'GET' };
					var read_response = responses .read || '{ data }';
					var write_request = requests .write || { method: 'POST' };
					var write_response = responses .write || '{ data }';
					
					var reader_name = ':' + path + ':read';
					var writer_name = ':' + path + ':write';
					
					
					
					var reader = dialogify (resource (reader_name, path, read_request, read_response, cache_options));
					var writer = dialogify (resource (writer_name, path, write_request, write_response, cache_options));
						
					var read =	function () {
									reader .ask ();
									return reader .consensus ();
								};
						
					return	dialogify (having ({
								impression: read,
								compromise: constant (read)
							}) (delegation (writer)));
				};
var writer =	function (path, requests, responses, cache_options) {
					requests = requests || {};
					responses =	{
									write: responses .write || responses
								};
					cache_options = cache_options || {};
					
					var write_request = requests .write || { method: 'POST' };
					var write_response = responses .write || '{ data }';
					
					var writer_name = ':' + path + ':write';



					var writer = dialogify (resource (writer_name, path, write_request, write_response, cache_options));
					
					return	dialogify (having ({
								compromise: constant (noop)
							}) (delegation (writer)));
				};
					
					
var gotten =	function (read_dialogue) {
					if (read_dialogue .consensus ())
						return Promise .resolve (read_dialogue .consensus ());
					read_dialogue .ask ();
					return promise (read_dialogue .findings)
				}	
var all_gotten =	function (read_dialogue) {
						var gotten = stream ();
						if (read_dialogue .consensus ())
							gotten (read_dialogue .consensus ());
						read_dialogue .ask ();
						read_dialogue .findings .thru (tap, gotten);
						return gotten;
					}