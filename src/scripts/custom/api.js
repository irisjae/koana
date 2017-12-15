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
    quiz: '#quiz',
    answer: '#answer',
    excerpt: '#excerpt',
}
var _routing = {
    login: {
        need_account: routes .make_account,
        
        logged_in: routes .dashboard
    },
    logout: {
        logged_out: routes .login
    },
    make_account: {
        back: routes .login,
        
        logged_in: routes .dashboard
    },
    dashboard: {
        go: routes .categories,
        add: routes .dashboard_create,
        profile: routes .profile,
        map: routes .map,
        
        unauthorized: routes .login,
        first_player: routes .dashboard_create
    },
    dashboard_create: {
        back: routes .dashboard,
        done: routes .dashboard
    },
    categories: {
        back: routes .dashboard,
        subcategory: routes .quiz
    },
    quiz: {
        back: routes .categories,
        start: routes .answer,
        
        unsolicited: routes .dashboard
    },
    answer: {
        next: routes .answer,
        done: routes .dashboard
    }
};

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
                    [ R .compose (R .not, R .is (Object)), 
                    	R .F 
                	],
                    [ R .T,
                    	R .compose (R .not, R .prop ('error'))
                	]
                ]);

var logs = stream ();
var __routing = [routes]
    .map (R .map (window .page_name))
    .map (R .invert)
    .map (R .map (
		R .map (R .prop (R .__, _routing))
    ))
    .map (R .map (R .mergeAll))
[0];
var routing = R .pipe (
	function (name_wherefrom, role) {
	    return __routing [name_wherefrom] [role];
	}, 
	R .tap (function (x) {
	    if (! x || ! window .page_exists (window .page_name (x)))
	        throw new Error ('route not found')
	})
);

						
var user_api = R .memoize (function (user) {
    return R .tap (function (_) {
        var prefix = 'user:' + user .token;
        
		_ .add_player =	cycle_by_translate (R .applySpec ({
							path: R .always (backend_path + '/player/add'),
							method: R .always ('POST'),
							headers: R .pipe (
							    R .applySpec ({
    							    user: R .pipe (R .always (stringify (user)), Base64 .encode)
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
        							    user: R .pipe (R .always (stringify (user)), Base64 .encode)
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
    								headers:  R .pipe (
        							    R .applySpec ({
            							    user: R .pipe (R .always (stringify (user)), Base64 .encode)
        								}),
        								R .merge ({
        								    'Content-Type': 'application/json',
        								})
        						    ),
    								body: stringify
    							}), cycle_from_network, R .prop ('json')),
    			                cycle_persisted (prefix + '/all-players')
    						) ();
		_ .chances =	R .pipe (
		                    cycle_by_translate (R .applySpec ({
								path: R .always (backend_path + '/chances'),
								method: R .always ('GET'),
								headers:  R .pipe (
    							    R .applySpec ({
        							    user: R .pipe (R .always (stringify (user)), Base64 .encode)
    								}),
    								R .merge ({
    								    'Content-Type': 'application/json',
    								})
    						    ),
								body: stringify
							}), cycle_from_network, R .prop ('json')),
			                cycle_persisted (prefix + '/chances')
						) ();
	
    	_ .logout = re_cycle ();
    	[_ .logout .from] .forEach (tap (function () {
    	    _ .player .to (undefined);
    	    _ .user .to (undefined);
    	}))
    }) (global_api);
});

var player_api = R .memoize (function (user, player) {
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
								    R .applySpec ({
								        subcategory: R .compose (
								            R .pipe (stringify, Base64 .encode), just_call (_ .quiz .from)
							            )
							        }),
    							    R .merge ({
        							    user: R .pipe (stringify, Base64 .encode) (user),
        							    player: R .pipe (stringify, Base64 .encode) (player)
    								}),
    								R .merge ({
    								    'Content-Type': 'application/json',
    								})
							    ),
								body: stringify
							}), cycle_from_network, R .prop ('json')) ();
        [_ .take_set .from] .map (filter (no_errors)) .forEach (tap (function (x) {
            _ .set .to (x);
        }))
    	_ .current_set =	cycle_by_translate (R .applySpec ({
								path: R .always (backend_path + '/set/current'),
								method: R .always ('GET'),
								headers: R .pipe (
    							    R .always ({
        							    user: R .pipe (stringify, Base64 .encode) (user),
        							    player: R .pipe (stringify, Base64 .encode) (player)
    								}),
    								R .merge ({
    								    'Content-Type': 'application/json',
    								})
							    ),
								body: stringify
							}), cycle_from_network, R .prop ('json')) ();
        [_ .current_set .from] .map (filter (no_errors)) .forEach (tap (function (x) {
            _ .set .to (x);
        }))
    	_ .give_set =	cycle_by_translate (R .applySpec ({
							path: R .always (backend_path + '/set/report'),
							method: R .always ('POST'),
							headers: R .pipe (
							    R .applySpec ({
							        set: R .compose (
							            R .pipe (stringify, Base64 .encode), just_call (_ .set .from)
						            )
						        }),
							    R .merge ({
    							    user: R .pipe (stringify, Base64 .encode) (user),
    							    player: R .pipe (stringify, Base64 .encode) (player)
								}),
								R .merge ({
								    'Content-Type': 'application/json',
								})
						    ),
							body: stringify
						}), cycle_from_network, R .prop ('json')) ();    
    	[_ .give_set .from] .map (filter (no_errors)) .forEach (tap (function () {
    	    _ .set .to (undefined);
    	}));
    	_ .give_up_set =	cycle_by_translate (R .applySpec ({
    							path: R .always (backend_path + '/set/relinquish'),
    							method: R .always ('POST'),
    							headers: R .pipe (
    							    R .always ({
        							    user: R .pipe (stringify, Base64 .encode) (user),
        							    player: R .pipe (stringify, Base64 .encode) (player)
    								}),
    								R .merge ({
    								    'Content-Type': 'application/json',
    								})
    						    ),
    							body: stringify
    						}), cycle_from_network, R .prop ('json')) ();    
    	[_ .give_up_set .from] .map (filter (no_errors)) .forEach (tap (function () {
    	    _ .set .to (undefined);
    	}))
    }) (user_api (user));
});
                
var global_api =    R .tap (function (_) {
						_ .user = cycle_persisted ('user') (re_cycle ());
						_ .player =	cycle_persisted ('player') (re_cycle ());
									
						promised_api .then (function () {
    						[_ .user .from] .forEach (tap (R .cond ([
    					        [R .not, function () {
    					            api (default_api)
    					        }],
    					        [R .T, function (user) {
    					            api (user_api (user))
    					        }]
    				        ])));
    				        [mechanism (just_call (_ .player .from), [_ .player .from, [_ .user .from] .map (filter (R .identity)) [0]])]
    						    .forEach (tap (R .cond ([
        					        [R .not, function () {
        					            api (user_api (_ .user .from ()))
        					        }],
        					        [R .T, function (player) {
        					            api (player_api (_ .user .from (), player))
        					        }]
        				        ])));
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
    										
    					[mergeAll ([
    					    _ .register .from,
    					    _ .login .from
                        ])]
                        	.map (filter (no_errors))
                        	.forEach (tap (_ .user .to));
					}) (global_api);

api (default_api);