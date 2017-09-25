/*
	global stateful,
	global stringify,
	global R
*/

var frontend_path = window .location .protocol + '//briansark-mumenrider.c9users.io';
var backend_path = window .location .protocol + '//briansark-mumenrider.c9users.io/api';	

var routes = {
    default: '#login',
    login: '#login',
    make_account: '#make-account',
    logout: '#logout',
    dashboard: '#dashboard',
    dashboard_create: '#dashboard/create',
    categories: '#categories',
    quiz: '#quiz'
}

var config = {
    koder: {
        choices: [
            {
                name: 'Nyan Cat',
                src: 'http://vignette1.wikia.nocookie.net/doawk/images/5/53/Giant_nyan_cat_by_daieny-d4fc8u1.png'
            },
            {
                name: 'Doge',
                src: 'https://vignette2.wikia.nocookie.net/animal-jam-clans-1/images/9/94/Doge_bread_by_thepinknekos-d9nolpe.png/revision/latest?cb=20161002220924'
            }
        ]
    }
};

var api = stream ();	
var promised_api = promise (api);

var no_errors = R .cond ([
                    [ R .compose (R .not, R .is (Object)), R .F ],
                    [ R .T, R .pipe (R .prop ('error'), R .not) ]
                ]);

						
var user_api = function (user) {
    return R .tap (function (_) {
        var prefix = 'user:' + user .token;
        
		_ .add_player =	cycle_by_translate (R .applySpec ({
							path: R .always (backend_path + '/player/add'),
							method: R .always ('POST'),
							headers: R .pipe (
							    R .applySpec ({
    							    user: R .pipe (R .always (stringify (user)), btoa)
								}),
								R .merge ({
								    'Content-Type': 'application/json',
								})
						    ),
							body: stringify
						}), cycle_from_network, R .prop ('json')) ();
		_ .remove_player =	cycle_by_translate (R .applySpec ({
    							path: R .always (backend_path + '/player/remove'),
    							method: R .always ('POST'),
    							headers: R .pipe (
								    R .applySpec ({
        							    user: R .pipe (R .always (stringify (user)), btoa)
    								}),
    								R .merge ({
    								    'Content-Type': 'application/json',
    								})
							    ),
    							body: stringify
    						}), cycle_from_network, R .prop ('json')) ();
		_ .all_players =	R .pipe (
    		                    cycle_by_translate (R .applySpec ({
    								path: R .always (backend_path + '/player/all'),
    								method: R .always ('GET'),
    								headers: R .always ({ 'Content-Type': 'application/json'}),
    								body: stringify
    							}), cycle_from_network, R .prop ('json')),
    			                cycle_persisted (prefix + '/all-players')
    						) ();
    	
    	_ .logout = re_cycle ();
    	_ .logout .from .thru (tap, function () {
    	    _ .player .to (undefined);
    	    _ .user .to (undefined);
    	})
    }) (global_api);
};

var player_api = function (user, player) {
    return R .tap (function (_) {
        var prefix = 'user:' + user .token + '/player:' + player .token;
        
    	_ .subcategories = 	R .pipe (
    		                    cycle_by_translate (R .applySpec ({
    								path: R .always (backend_path + '/subcategories'),
    								method: R .always ('GET')
    							}), cycle_from_network, R .prop ('json')),
    							cycle_persisted ('subcategories')
    						) ();
    	_ .quiz = cycle_persisted (prefix + '/quiz') (re_cycle ());
    	
    	_ .set = cycle_persisted (prefix + '/set') (re_cycle ());
    	_ .take_set =	cycle_by_translate (R .applySpec ({
								path: R .always (backend_path + '/set/request'),
								method: R .always ('POST'),
								headers: R .pipe (
								    R .converge (R .merge, [
        							    R .always ({
            							    user: R .pipe (stringify, btoa) (user),
            							    player: R .pipe (stringify, btoa) (player)
        								}),
    								    R .applySpec ({
    								        subcategory: R .compose (
    								            R .pipe (stringify, btoa), just_call (_ .quiz .from)
								            )
    							        })
								    ]),
    								R .merge ({
    								    'Content-Type': 'application/json',
    								})
							    ),
								body: stringify
							}), cycle_from_network, R .prop ('json')) ();
        _ .take_set .from .thru (tap, function (x) {
            _ .set .to (x);
        })
    	_ .give_set =	cycle_by_translate (R .applySpec ({
							path: R .always (backend_path + '/set/report'),
							method: R .always ('POST'),
							headers: R .pipe (
							    R .always ({
    							    user: R .pipe (stringify, btoa) (user),
    							    player: R .pipe (stringify, btoa) (player)
								}),
								R .merge ({
								    'Content-Type': 'application/json',
								})
						    ),
							body: stringify
						}), cycle_from_network, R .prop ('json')) ();    
    	_ .give_set .from .thru (tap, function () {
    	    _ .set .to (undefined);
    	})
    }) (user_api (user));
};
                
var global_api =    R .tap (function (_) {
						_ .user = cycle_persisted ('user') (re_cycle ());
						_ .player =	cycle_persisted ('player') (re_cycle ());
									
						promised_api .then (function () {
    						_ .user .from .thru (tap, R .cond ([
    					        [R .not, function () {
    					            api (default_api)
    					        }],
    					        [R .T, function (user) {
    					            api (user_api (user))
    					        }]
    				        ]));
    						_ .player .from .thru (tap, R .cond ([
    					        [R .not, function () {
    					            api (user_api (_ .user .from ()))
    					        }],
    					        [R .T, function (player) {
    					            api (player_api (_ .user .from (), player))
    					        }]
    				        ]));
						})
                    }) ({})
var default_api =	R .tap (function (_) {
						_ .register =	cycle_by_translate (R .applySpec ({
											path: R .always (backend_path + '/register'),
											method: R .always ('POST'),
											headers: R .always ({ 'Content-Type': 'application/json'}),
											body: stringify
										}), cycle_from_network, R .prop ('json')) ();
						_ .login =	cycle_by_translate (R .applySpec ({
										path: R .always (backend_path + '/login'),
										method: R .always ('POST'),
										headers: R .always ({ 'Content-Type': 'application/json'}),
										body: stringify
									}), cycle_from_network, R .prop ('json')) ();
    										
    					mergeAll ([
    					    _ .register .from,
    					    _ .login .from
                        ]) .thru (filter, no_errors) .thru (tap, _ .user .to)
					}) (global_api);

api (default_api);