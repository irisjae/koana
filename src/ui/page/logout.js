+ function () {
	window .uis = R .assoc (
		'logout', function (components, unions) {
			var nav = unions .nav;
			
			return interaction (function (intent, state) {
	            [nav .intent]
	            	.map (filter (function (x) {
		            	return R .head (x) === 'prepare'
		            }))
		            .forEach (tap (function () {
		                //log (api ())
		                Promise .resolve () .then (function () {
		                    if (api () .logout)
		                        return inquire (api () .logout) 
		                    else {
		                        log ('logout when already logged out');
		                    }
		                })
		                .then (function () {
		                    nav .state (['logged_out']);
		                })
		            }));
		        
		        [nav .state]
			        .map (map (R .objOf ('nav')))
			        .forEach (project (state));
		    })
		}
	) (window .uis);
} ();