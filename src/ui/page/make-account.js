+ function () {
	var ui_info = pre (function () {
		var ui = frame ('make-account');

		[] .forEach .call (ui .querySelectorAll ('#hint[for=input]'), function (_) {
			_ .outerHTML = input_ify (_);
		});
		
		return {
			dom: serve (ui)
		}
	});
	
	
	var _interaction_ =	function (components, unions) {
	    var nav = unions .nav;
	    
		var make_account = components .make_account;
		var back = components .back;
		
		var email = components .email;
		var password = components .password;
		var retype_password = components .retype_password;
		
		var extension = interaction (transition (function (intent, license) {
			if (intent === 'make') {
				return 	function (tenure) {
							if (! (email ._ .state () && email .dom .checkValidity ())) {
								toast ('Please make sure you enter a valid email');
								tenure .end (true);
							}
							else if (password ._ .state () !== retype_password ._ .state ()) {
								toast ('Please make sure your passwords match');
								tenure .end (true);
							}
							else if (password ._ .state () .length < 8) {
								toast ('Please make sure your password is at least 8 characters');
								tenure .end (true);
							}
							else {
								tenure ('making-account');
								loader ();
								inquire (api () .register, {
									email: email ._ .state (),
									password: password ._ .state ()
								})
								.then (function (res) {
									loader .stop ();
									if (res .error) {
										toast ('There was a problem creating the account');
									}
									else {
										nav .state (['logged_in'])
									}
								})
								.then (function () {
									tenure (null);
									tenure .end (true);
								})
							}
						}
			}
			else {
				console .error ('unknown intent passed', intent);
				return function (tenure) {
				    tenure .end (true);
				}
			}
		}));
		
		extension .state (null);
		
		[make_account]
			.forEach (tap (function () {
				extension .intent ('make');
			}));
		[back] 
			.forEach (tap (function () {
				nav .state (['back'])
			}));
		
		return {
			_: extension,
			
			input_email: email,
			input_password: password,
			input_retype_password: retype_password
		}
	}


	window .uis = R .assoc (
		'make-account', function (components, unions) {
			var nav = unions .nav;
			
			var dom = ui_info .dom .cloneNode (true);
	
			var make_account_dom = dom .querySelector ('#make-account[action=focus]');
			var back_dom = dom .querySelector ('#back[action=nav]');
			
			var make_account_stream = stream_from_click_on (make_account_dom);
			var back_stream = stream_from_click_on (back_dom);
										
										
			var email_dom = dom .querySelector ('#email');
			var password_dom = dom .querySelector ('#password');
			var retype_password_dom = dom .querySelector ('#retype-password');
			
			var email_interaction =	interaction_placeholder (
										email_dom .querySelector ('#placeholder'),
										interaction_input (email_dom .querySelector ('input'))
									);
			var password_interaction =	interaction_placeholder (
											password_dom .querySelector ('#placeholder'), 
											interaction_input (password_dom .querySelector ('input'))
										);
			var retype_password_interaction =	interaction_placeholder (
													retype_password_dom .querySelector ('#placeholder'), 
													interaction_input (retype_password_dom .querySelector ('input'))
												);
	
			return R .merge (R .__, {
			    nav: nav,
			    dom: dom
			}) (_interaction_ (
		    	{
					make_account: make_account_stream,
					back: back_stream,
					
					email: email_interaction,
					password: password_interaction,
					retype_password: retype_password_interaction
				},
				{
				    nav: nav
				}
			))
		}
	) (window .uis);
} ()