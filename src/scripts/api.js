/*
	global paper,
	global stateful,
	global constant,
	global stringify,
	global R,
	global tap,
	global resettle
*/

var frontend_path = window .location .protocol + '//briansark-mumenrider.c9users.io';
var backend_path = window .location .protocol + '//briansark-mumenrider.c9users.io/api';	

var home_path = '#home';


var default_api =	make (function (self) {
						self .register = stateful ({
							key: ':register',
							per: 'none',
							request: R .applySpec ({
										path: constant (backend_path + '/register'),
										method: constant ('POST'),
										headers: constant ({ 'Content-Type': 'application/json'}),
										body: stringify
									}),
							error: function (response) {
								if (! response .json)
									return {
										item: 'unsuccessful'
									}
							},
							value: R .compose (
									R .prop ('json')),
						});
						self .login = stateful ({
							key: ':login',
							per: 'none',
							request: R .applySpec ({
										path: constant (backend_path + '/login'),
										method: constant ('POST'),
										headers: constant ({ 'Content-Type': 'application/json'}),
										body: stringify
									}),
							value: R .compose (
									R .prop ('json'))
						});
						self .questions = stateful ({
							key: ':questions',
							per: 'lump',
							request: R .applySpec ({
										path: constant (backend_path + '/questions'),
										method: constant ('GET'),
										headers: constant ({ 'Content-Type': 'application/json'}),
									}),
							value: R .compose (
									R .prop ('json'))
						});
						self .completed_questions = stateful ({
							key: ':completed-questions',
							per: 'none',
							request: R .applySpec ({
										method: constant ('process'),
										item: R .identity
									}),
							value: R .compose (
									R .identity),
							fetch: constant (function (path, completed) {
								return completed;
							})
						});
						self .level = stateful ({
							key: ':level',
							per: 'none',
							request: R .applySpec ({
										method: constant ('process'),
										item: R .identity
									}),
							value: R .compose (
									R .identity),
							fetch: constant (function (path, req) {
								return req .item;
							})
						});
							
						self .questions_diff =	from (function (diff) {
													self .questions .impressions .init
														.then (function (prev) {
															self .questions .impressions
																.thru (map, R .path (['value', 'item']))
																.thru (filter, id)
																.thru (dropRepeatsWith, json_equal)
																.thru (tap, function (curr) {
																	//diff (diff_ques (curr, prev));
																	prev = curr;
																})
														})
												})
					});
						
						
var api =	stream (default_api);
			

var valid_email = 	function (email) {
						return /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/ .test (email);
					}
