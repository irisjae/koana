+ function () {
	var ui_info = pre (function () {
		var ui = frame ('login');
		
		[] .forEach .call (ui .querySelectorAll ('#hint[for=input]'), function (_) {
			_ .outerHTML = input_ify (_);
		});
		
		return {
			dom: serve (ui)
		};
	});
	
	var _interaction_ =	function (components, unions) {
	    var nav = unions .nav;
	    
		var login = components .login;
		var make_account = components .make_account;
		
		var email = components .email;
		var password = components .password;
		
		var extension = interaction (transition (function (intent, license) {
			if (intent === 'login') {
				return	function (tenure) {
							if (! (email ._ .state () && email .dom .checkValidity ())) {
								toast ('Please make sure you enter a valid email');
								tenure .end (true);
							}
							else {
								tenure ('logging-in');
								loader ();
								return inquire (api () .login, {
									email: email ._ .state (),
									password: password ._ .state () 
								})
								.then (function (res) {
									loader .stop ();
									if (res .error) {
										toast ('There was a problem logging in');
										tenure .end (true); 
									}
									else {
										email ._ .intent (['reset']);
										password ._ .intent (['reset']);
										tenure .end (true); 
										nav .state (['logged_in']); 
									}
								})
							}
						}
			}
			else {
		        var err = new Error ('unknown intent passed')
		        err .intent = intent;
		        report (err);
		        return reflect (none);
			}
		}));
		
		extension .state (null);
		
		[login]
			.forEach (tap (function () {
				extension .intent ('login');
			}));
		[make_account]
			.forEach (tap (function () {					
			    nav .state (['need_account']); 
			}));
		
		return {
			_: extension,
			
			input_email: email,
			input_password: password
		}
	}	
	
	
	window .uis = R .assoc (
		'login', function (components, unions) {
			var nav = unions .nav;

			var dom = ui_info .dom .cloneNode (true);
				
			var login_dom = dom .querySelector ('#login[action=focus]');
			var make_account_dom = dom .querySelector ('#make-account[action=side]');
			
			var login_stream = stream_from_click_on (login_dom);
			var make_account_stream = stream_from_click_on (make_account_dom);
										
										
			var email_dom = dom .querySelector ('#email');
			var password_dom = dom .querySelector ('#password');
			
			var email_interaction =	interaction_placeholder (
										email_dom .querySelector ('#placeholder'),
										interaction_input (email_dom .querySelector ('input'))
									);
			var password_interaction =	interaction_placeholder (
											password_dom .querySelector ('#placeholder'), 
											interaction_input (password_dom .querySelector ('input'))
										);
		
			return R .merge ({
			    nav: nav,
			    dom: dom
			}) (_interaction_ (
				{
					login: login_stream,
					make_account: make_account_stream,
					
					email: email_interaction,
					password: password_interaction
				}, 
				{
				    nav: nav
				}
			))
		}
	) (window .uis);
} ();