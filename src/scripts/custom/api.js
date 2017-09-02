/*
	global stateful,
	global constant,
	global stringify,
	global R,
	global tap
*/

var frontend_path = window .location .protocol + '//briansark-mumenrider.c9users.io';
var backend_path = window .location .protocol + '//briansark-mumenrider.c9users.io/api';	

var home_path = '#login';

var no_errors = function (x) {
    					    return ! x .error;
    					}

var api = stream ();
var default_api =	make (function (_) {
						_ .register =	R .pipe (
						                    cycle_by_translate (R .applySpec ({
												path: constant (backend_path + '/register'),
												method: constant ('POST'),
												headers: constant ({ 'Content-Type': 'application/json'}),
												body: stringify
											}), cycle_from_network, R .prop ('json'))
										) ();
						_ .login =	R .pipe (
						                cycle_by_translate (R .applySpec ({
											path: constant (backend_path + '/login'),
											method: constant ('POST'),
											headers: constant ({ 'Content-Type': 'application/json'}),
											body: stringify
										}), cycle_from_network, R .prop ('json')),
										cycle_persisted (':login')
									) ();
    										
    					mergeAll ([
    					    _ .register .from .thru (filter, no_errors),
    					    _ .login .from .thru (filter, no_errors)
                        ]) .thru (tap, function (login) {
                            api (logged_in_api (login));
                        })
					});
						
var logged_in_api = function (login) {
    return make (function (_) {
    	_ .subcategories = 	R .pipe (
    		                    cycle_by_translate (R .applySpec ({
    								path: constant (backend_path + '/subcategories'),
    								method: constant ('GET'),
    								headers: constant ({ 'Content-Type': 'application/json'}),
    								body: stringify
    							}), cycle_from_network, R .prop ('json')),
    							cycle_persisted (':subcategories')
    						) ();
    	_ .request_set =	R .pipe (
    		                    cycle_by_translate (R .applySpec ({
    								path: constant (backend_path + '/set/request'),
    								method: constant ('POST'),
    								headers: constant ({ 'Content-Type': 'application/json'}),
    								body: R .pipe (
    								    R .applySpec ({
        								    child_token: constant (login .id),
        								    subcategory: R .prop ('subcategory')
        								}),
        								stringify
    								)
    							}), cycle_from_network, R .prop ('json'))
    						) ();
        _ .request_set .from .thru (tap, function (_set) {
            _ .set .to (_set);
        })
    	_ .report_set =	R .pipe (
    	                    cycle_by_translate (R .applySpec ({
    							path: constant (backend_path + '/set/request'),
    							method: constant ('POST'),
    							headers: constant ({ 'Content-Type': 'application/json'}),
    							body: constant (stringify ({
    							    child_token: login .id
    							}))
    						}), cycle_from_network, R .prop ('json'))
    					) ();    
    	_ .report_set .from .thru (tap, function () {
    	    _ .set .to (undefined);
    	})
    	
    	_ .set = cycle_persisted ('login-' + login .id + ':set') ();
    	
    	_ .logout = re_cycle ();
    	_ .logout .from .thru (tap, function () {
    	    api (default_api)
    	})
    });
}
						
api .thru (_begins_with, default_api);