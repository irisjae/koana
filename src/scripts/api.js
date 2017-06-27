/*
	global stateful,
	global constant,
	global stringify,
	global R,
	global tap
*/

var frontend_path = window .location .protocol + '//briansark-mumenrider.c9users.io';
var backend_path = window .location .protocol + '//briansark-mumenrider.c9users.io/api';	

var home_path = '#home';

var default_api =	make (function (self) {
						self .register =	dialogue (persisted (':register', cycle_translate (R .applySpec ({
												path: constant (backend_path + '/register'),
												method: constant ('POST'),
												headers: constant ({ 'Content-Type': 'application/json'}),
												body: stringify
											}), cycle_network, R .prop ('json'))));
						self .login =	dialogue (persisted (':login', cycle_translate (R .applySpec ({
											path: constant (backend_path + '/login'),
											method: constant ('POST'),
											headers: constant ({ 'Content-Type': 'application/json'}),
											body: stringify
										}), cycle_network, R .prop ('json'))));
						self .questions = 	dialogue (persisted (':questions', cycle_translate (R .applySpec ({
												path: constant (backend_path + '/questions'),
												method: constant ('GET'),
												headers: constant ({ 'Content-Type': 'application/json'}),
												body: stringify
											}), cycle_network, R .prop ('json'))));
					});
						
						
var api = stream (default_api);
			

var valid_email = 	function (email) {
						return /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/ .test (email);
					}
