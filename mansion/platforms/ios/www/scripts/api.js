/*
	global paper,
	global stateful,
	global constant,
	global stringify,
	global R,
	global tap,
	global resettle
*/

var frontend_path = window .location .protocol + '//playboymansion-mumenrider.c9users.io';
var backend_path = window .location .protocol + '//playboymansion-mumenrider.c9users.io';	

var home_path = '#home';


var paper_default_api =	paper (function (self, args, my) {
							self
								.establish ('::register', stateful ({
									key: '::register',
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
								}))
								.establish ('::login', stateful ({
									key: '::login',
									per: 'none',
									request: R .applySpec ({
												path: constant (backend_path + '/login'),
												method: constant ('POST'),
												headers: constant ({ 'Content-Type': 'application/json'}),
												body: stringify
											}),
									value: R .compose (
											R .prop ('json'))
								}))
								.establish ('::questions', stateful ({
									key: '::questions',
									per: 'lump',
									request: R .applySpec ({
												path: constant (backend_path + '/questions'),
												method: constant ('GET'),
												headers: constant ({ 'Content-Type': 'application/json'}),
											}),
									value: R .compose (
											R .prop ('json'))
								}))
								.establish ('::completed-questions', stateful ({
									key: '::completed-questions',
									per: 'none',
									request: R .applySpec ({
												fetch: constant (function (path, completed) {
													return completed;
												}),
												method: constant ('process'),
												item: R .identity
											}),
									value: R .compose (
											R .identity)
								}))
								.establish ('::level', stateful ({
									key: '::level',
									per: 'none',
									request: R .applySpec ({
												fetch: constant (function (path, req) {
													return req .item;
												}),
												method: constant ('process'),
												item: R .identity
											}),
									value: R .compose (
											R .identity)
								}))
								
								.establish ('::questions-diff', constant (
									from (function (diff) {
										self .impressions ('::questions') .init
											.then (function (prev) {
												self .impressions ('::questions')
													.thru (map, R .path (['value', 'item']))
													.thru (filter, id)
													.thru (dropRepeatsWith, json_equal)
													.thru (tap, function (curr) {
														//diff (diff_ques (curr, prev));
														prev = curr;
													})
											})
									})
								))
						});
						
						
var paper_api =	paper (function (self, args, my) {
					self
						.remembers ('::api', paper_default_api ())
						.impressions ('::api')
							.thru (tap, function (to_be_api) {
								self .thru (
									resettle, to_be_api)
							})
							

					self .impressions ('::level') .init
					    .then (function () {
					        if (! my ('::level'))
					            self .mention ('::level', 5)
					    })
					self .impressions ('::questions-diff')
						.thru (tap, function (curr) {
							var _diff = diff_ques (curr, prev);
							self .mention ('::incomplete-questions',
								rediff_ques (_diff) (my ('::incomplete-questions')))
						})
				});
			
var api = paper_api () .realize ();


var valid_email = 	function (email) {
						return /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/ .test (email);
					}
