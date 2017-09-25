riot.tag2('body', '', '', '', function(opts) {
	(function (self, args) {

	 self ._loaded = true;
	 self ._scope = function () {};
	var known_as = function (what) { return function (how) { log (self .root .localName, what, how);} };
	self .on ("update", function () {args = self .opts});

			var tag_label =	function (page_name) {
								return 'page-' + replace_all ('/', '-') (trim_trailing_slash (page_name));
							};
								var trim_trailing_slash =	function (path) {
																if (path [path .length - 1] === '/')
																	return path .slice (0, -1);
																else
																	return path;
															};
			var page_name = function (path) {
								if (path === '' || path === '#')
									path = routes .default
								return path .slice (path .indexOf ('#') + 1, path .indexOf ('/#') === -1 ? undefined : path .indexOf ('/#'))
							}
			var page_params =	function (path) {
									return (path .indexOf ('/#') !== -1 ? path .slice (path .indexOf ('/#') + 2) .split ('/') : []);
								};
			var page_label = 	function (path) {
									return page_name (path) + '/#' + page_params (path) .join ('/')
								}
			var tag_exists =	function (tag) {
									return riot .util .tags .selectTags () .split (',') .indexOf (tag) !== -1
								};
			var page_exists =	function (page_name) {
									return tag_exists (tag_label (page_name))
								};

			var exception =	from (function (errors) {
								riot .util .tmpl .errorHandler = 	function (err) {
																		errors ({
																			source: 'riot-tmpl',
																			data: err
																		});
																	}
								window .addEventListener ('unhandledrejection', function (e) {
								    e .preventDefault ();

								    errors ({
								    	source: 'promise',
								    	data: e .detail
								    });
								});
								window .onerror = 	function (message, source, lineno, colno, error) {
														errors ({
															source: 'window',
															data: arguments
														});
													};

							}) .thru (tap, known_as ('exception'))

			var	page_cache = stream ({}) .thru (tap, known_as ('page cache'))
			var page_cycle = R .memoize (function (id) {
				return stream () .thru (tap, known_as ('page cycle ' + id));
			})

			var page =	from (function (nav) {
							window .addEventListener ('hashchange', function () {
								nav (window .location .hash)
							});
							if (page_exists (page_name (window .location .hash))) {
								nav (window .location .hash)
							}
							else {
								window .location .hash = routes .default;
							}
						})
							.thru (map, function (path) {
								return {
									name: page_name (path),
									params: page_params (path),
									id: page_label (path)
								};
							})
							.thru (dropRepeatsWith, json_equal)
							.thru (filter, function (page) {
								return page_exists (page .name)
							})
							.thru (map, function (new_page) {
								return Promise .resolve (page && page ())
									.then (function (prev) {
										var time = new Date ()

										if (page_cache () [new_page .id]) {
											var curr = page_cache () [new_page .id];
										}
										else {
											var _tag_label = tag_label (new_page .name);
											var root = document .createElement (_tag_label);
											var curr = 	retaining (new_page) (
															riot .mount (root, _tag_label, having (new_page .params) ({
																parent: self,
																cycle__from: page_cycle (new_page .id)
															})) [0]);

											if (self .isMounted) {
												self .renders .push ('now');
												self .update ();
												self .renders .pop ();
											}
										}

										page_cycle (curr .id) (stream ());
										if (curr .id === page_label (window .location .hash)) {
											if (prev !== curr) {
												var _time = new Date ()

												self .root .insertBefore (curr .root, self .root .firstElementChild);
												if (prev) {
													self .root .removeChild (prev .root);
												}

												log ('mounted page time ' + (new Date () - _time) + 'ms', curr);
											}
											var last_loaded = curr;
										}
										else {
											var last_loaded = prev;
										}
										if (prev) {
											page_cycle (prev .id) .end (true);
										}

										log ('process page time ' + (new Date () - time) + 'ms', curr);
										return last_loaded;
									})
									.catch (
										R .pipe (
											exception,
											noop
										)
									)
							}) .thru (tap, known_as ('page'));

			page
				.thru (function (pages) {
					return from (function (loadings) {
						pages .thru (tap, function (page) {
							page .then (loadings)
						})
					});
				})
				.thru (filter, id)
				.thru (dropRepeats)
				.thru (tap, function (page) {
					if (! page_cache () [page .id] && ! page .temp)
						page_cache (
							with_ (page .id, page) (page_cache ()))
				})

			from (function (widths) {
				widths (window .innerWidth);
				window .addEventListener ('resize', function () {
					widths (window .innerWidth);
				});
			})
				.thru (dropRepeats)
				.thru (map, function (width) {
					return { width: width, height: window .innerHeight };
				})
				.thru (tap, function (size) {
					self .root .style .setProperty ('width', size .width + 'px', 'important');
					self .root .style .setProperty ('height', size .height + 'px', 'important');
				});

	if (typeof self .update_strategy === "function") self .shouldUpdate = self .update_strategy;
	}) (this, this .opts);
});
riot.tag2('custom-page', '<yield></yield>', '', '', function(opts) {
	(function (self, args) {

	 self ._loaded = true;
	 self ._scope = function () {};
	self ._yield_levels = 0;
	self ._yield_level = 0;
	self ._yield_on = function () {   self ._yielding = true; self ._yield_level++; if (self ._yield_level > self ._yield_levels) self ._yield_levels = self ._yield_level; return ""; };
	self ._yield_off = function () {   self ._yielding = false; self ._yield_level--; return ""; };
	var _refs = mergeAll ([ from (function (when) { self .on ("mount", function () { when (self .refs); }); }), from (function (when) { self .on ("updated", function () { when (self .refs); }); }) ]) .thru (map, consistentfy)  ;
	var yield_scope = self .parent;
	while (yield_scope && yield_scope ._yield_levels) yield_scope = climb (yield_scope ._yield_levels, yield_scope);
	if (yield_scope && yield_scope .yielded_diff) _refs .thru (map, yield_refs) .thru (diff_refs) .thru (tap, yield_scope .yielded_diff);
	var self_diff = stream ();
	var yielded_diff = stream ();
	self .yielded_diff = yielded_diff ;
	var diffs = mergeAll ([ self_diff, yielded_diff ]);
	var ref = function (name) { return ref_diff (name, diffs) };
	var ref_set = function (name) { return ref_set_diff (name, diffs) };
	_refs .thru (map, self_refs) .thru (diff_refs) .thru (tap, self_diff);
	if (! self .update_strategy || self .update_strategy === "push") self .shouldUpdate = R .T;
	if (typeof self .update_strategy === "function") self .shouldUpdate = self .update_strategy;
	}) (this, this .opts);
});
riot.tag2('modules-date-picker', '<modules-modal-holder> <input date-picker> </modules-modal-holder>', '', '', function(opts) {
	(function (self, args) {

	 self ._loaded = true;
	 self ._scope = function () {};
	var known_as = function (what) { return function (how) { log (self .root .localName, what, how);} };
	self .on ("update", function () {args = self .opts});

			self .on ('mount', function () {
				var picker =	new Flatpickr (self .root .querySelector ('input'), {
									inline: true,
									maxDate: (function () {
										var today = new Date();
										today .setDate (today .getDate ());
										return today;
									}) ()
								})
			})

	if (typeof self .update_strategy === "function") self .shouldUpdate = self .update_strategy;
	}) (this, this .opts);
});
riot.tag2('modules-loader', '<modules-modal-holder> <modules-loading-item></modules-loading-item> <yield></yield> </modules-modal-holder>', '', '', function(opts) {
	(function (self, args) {

	 self ._loaded = true;
	 self ._scope = function () {};
	self ._yield_levels = 0;
	self ._yield_level = 0;
	self ._yield_on = function () {   self ._yielding = true; self ._yield_level++; if (self ._yield_level > self ._yield_levels) self ._yield_levels = self ._yield_level; return ""; };
	self ._yield_off = function () {   self ._yielding = false; self ._yield_level--; return ""; };
	var _refs = mergeAll ([ from (function (when) { self .on ("mount", function () { when (self .refs); }); }), from (function (when) { self .on ("updated", function () { when (self .refs); }); }) ]) .thru (map, consistentfy)  ;
	var yield_scope = self .parent;
	while (yield_scope && yield_scope ._yield_levels) yield_scope = climb (yield_scope ._yield_levels, yield_scope);
	if (yield_scope && yield_scope .yielded_diff) _refs .thru (map, yield_refs) .thru (diff_refs) .thru (tap, yield_scope .yielded_diff);
	var self_diff = stream ();
	var yielded_diff = stream ();
	self .yielded_diff = yielded_diff ;
	var diffs = mergeAll ([ self_diff, yielded_diff ]);
	var ref = function (name) { return ref_diff (name, diffs) };
	var ref_set = function (name) { return ref_set_diff (name, diffs) };
	_refs .thru (map, self_refs) .thru (diff_refs) .thru (tap, self_diff);
	if (! self .update_strategy || self .update_strategy === "push") self .shouldUpdate = R .T;
	if (typeof self .update_strategy === "function") self .shouldUpdate = self .update_strategy;
	}) (this, this .opts);
});
riot.tag2('modules-loading-item', '<div> <spinner></spinner> </div>', '', '', function(opts) {
});
riot.tag2('modules-modal-holder', '<item> <yield></yield> </item>', '', '', function(opts) {
	(function (self, args) {

	 self ._loaded = true;
	 self ._scope = function () {};
	self ._yield_levels = 0;
	self ._yield_level = 0;
	self ._yield_on = function () {   self ._yielding = true; self ._yield_level++; if (self ._yield_level > self ._yield_levels) self ._yield_levels = self ._yield_level; return ""; };
	self ._yield_off = function () {   self ._yielding = false; self ._yield_level--; return ""; };
	var _refs = mergeAll ([ from (function (when) { self .on ("mount", function () { when (self .refs); }); }), from (function (when) { self .on ("updated", function () { when (self .refs); }); }) ]) .thru (map, consistentfy)  ;
	var yield_scope = self .parent;
	while (yield_scope && yield_scope ._yield_levels) yield_scope = climb (yield_scope ._yield_levels, yield_scope);
	if (yield_scope && yield_scope .yielded_diff) _refs .thru (map, yield_refs) .thru (diff_refs) .thru (tap, yield_scope .yielded_diff);
	var self_diff = stream ();
	var yielded_diff = stream ();
	self .yielded_diff = yielded_diff ;
	var diffs = mergeAll ([ self_diff, yielded_diff ]);
	var ref = function (name) { return ref_diff (name, diffs) };
	var ref_set = function (name) { return ref_set_diff (name, diffs) };
	_refs .thru (map, self_refs) .thru (diff_refs) .thru (tap, self_diff);
	var known_as = function (what) { return function (how) { log (self .root .localName, what, how);} };
	self .on ("update", function () {args = self .opts});

		    if (args .action__from)
		        args .action__from
		            .thru (tap, function (ref) {
		                ref .addEventListener ('click', function () {
		                    args .action__to (args .value__by ())
		                })
		            })

	if (! self .update_strategy || self .update_strategy === "push") self .shouldUpdate = R .T;
	if (typeof self .update_strategy === "function") self .shouldUpdate = self .update_strategy;
	}) (this, this .opts);
});
riot.tag2('modules-snackbar', '<snackbar> <item> <yield></yield> </item> </snackbar>', '', '', function(opts) {
	(function (self, args) {

	 self ._loaded = true;
	 self ._scope = function () {};
	self ._yield_levels = 0;
	self ._yield_level = 0;
	self ._yield_on = function () {   self ._yielding = true; self ._yield_level++; if (self ._yield_level > self ._yield_levels) self ._yield_levels = self ._yield_level; return ""; };
	self ._yield_off = function () {   self ._yielding = false; self ._yield_level--; return ""; };
	var _refs = mergeAll ([ from (function (when) { self .on ("mount", function () { when (self .refs); }); }), from (function (when) { self .on ("updated", function () { when (self .refs); }); }) ]) .thru (map, consistentfy)  ;
	var yield_scope = self .parent;
	while (yield_scope && yield_scope ._yield_levels) yield_scope = climb (yield_scope ._yield_levels, yield_scope);
	if (yield_scope && yield_scope .yielded_diff) _refs .thru (map, yield_refs) .thru (diff_refs) .thru (tap, yield_scope .yielded_diff);
	var self_diff = stream ();
	var yielded_diff = stream ();
	self .yielded_diff = yielded_diff ;
	var diffs = mergeAll ([ self_diff, yielded_diff ]);
	var ref = function (name) { return ref_diff (name, diffs) };
	var ref_set = function (name) { return ref_set_diff (name, diffs) };
	_refs .thru (map, self_refs) .thru (diff_refs) .thru (tap, self_diff);
	if (! self .update_strategy || self .update_strategy === "push") self .shouldUpdate = R .T;
	if (typeof self .update_strategy === "function") self .shouldUpdate = self .update_strategy;
	}) (this, this .opts);
});
riot.tag2('page-dashboard-create', __strs [13378], '', '', function(opts) {
	(function (self, args) {

	 self ._loaded = true;
	 self ._scope = function () {};
	var known_as = function (what) { return function (how) { log (self .root .localName, what, how);} };
	self .on ("update", function () {args = self .opts});

		    var _interaction = interaction_to_be (promise_of (function (is) {
				self .on ('mount', function () {
				    var dom, _dom = self .root;

				    dom = _dom .querySelector ('#dialog[step="1"]');

		    			var back_dom = dom .querySelector ('#back[action=nav]');
		    			var done_dom = dom .querySelector ('#done[action=focus]');

		    			var back_stream = stream_from_click_on (back_dom);
		    			var done_stream = stream_from_click_on (done_dom);

		    			var name_dom = dom .querySelector ('#name');
		    			var school_name_dom = dom .querySelector ('#school-name');
		    			var date_of_birth_dom = dom .querySelector ('#date-of-birth');

		    			var name_interaction =	interaction_placeholder (
		    										name_dom .querySelector ('#placeholder'),
		    										interaction_input (name_dom .querySelector ('input'))
		    									);
		    			var school_name_interaction =	interaction_placeholder (
		        											school_name_dom .querySelector ('#placeholder'),
		        											interaction_input (school_name_dom .querySelector ('input'))
		        										);
		    			var date_of_birth_interaction =	interaction_placeholder (
		    												date_of_birth_dom .querySelector ('#placeholder'),
		    												interaction_date_picker (date_of_birth_dom .querySelector ('input'))
		    											);

			        dom = _dom;

		    			var go_dom = dom .querySelector ('#go[action=focus]');
		    			var go_stream = stream_from_click_on (go_dom);

		    			var koders_dom = dom .querySelector ('#koders');
		    			var left_dom = koders_dom .querySelector ('#prev');
		    			var right_dom = koders_dom .querySelector ('#next');
		    			var image_dom = koders_dom .querySelector ('img');

		    			var koder_interaction =	interaction_select_koders (
		    										left_dom, right_dom, image_dom,
		        									config .koder .choices
		    									);

				    dom = _dom .querySelector ('#dialog[step="3"]');

		    			var all_done_dom = dom .querySelector ('#all-done[action=focus]');
		    			var all_done_stream = stream_from_click_on (all_done_dom);

		    			var koder_name_dom = dom .querySelector ('#name');
		    			var koder_name_interaction =	interaction_placeholder (
		            										koder_name_dom .querySelector ('#placeholder'),
		            										interaction_input (koder_name_dom .querySelector ('input'))
		            									);

			        dom = _dom;

			        is (_create_steps_interaction_ ({
			            step: _step_interaction_ (dom),
					    1: _interaction_of_step_ [1] ({
							back: back_stream,
							done: done_stream,

							name: name_interaction,
							school: school_name_interaction,
							date_of_birth: date_of_birth_interaction
						}),
					    2: _interaction_of_step_ [2] ({
							go: go_stream,
							koder: koder_interaction
						}),
					    3: _interaction_of_step_ [3] ({
							all_done: all_done_stream,
							koder_name: koder_name_interaction
						})
			        }));
				})
			}))

		;

		    var step_procession = {
		        start: 1,
		        1: 2,
		        2: 3,
		        3: function (steps) {
		            return promise_of (function (done) {
		                var _ = {
		                    name: steps [1] .state () .name ._,
		                    school_name: steps [1] .state () .school ._,
		                    date_of_birth: steps [1] .state () .date_of_birth ._,
		                    koder_archetype: steps [2] .state () .koder .name,
		                    koder_name: steps [3] .state () .koder_name ._,
		                };
		                loader ();
		                inquire (api () .add_player, _)
							.then (function (res) {
								loader .stop ();
								if (res .error) {
									toast ('There was a problem creating the Koder');
								}
								else {
									toast ('Koder ' + _ .name + ' has been created!');
								}
								window .location .href = routes .dashboard;
							})

		            });
		        }
		    };
		    var _create_steps_interaction_ = function (components) {
		        var step = components .step;
		        var steps = R .dissoc ('step') (components);

		        var extension = interaction (transition (function (intent, license) {
					if (intent [0] === 'step') {
		                var step_ = intent [1];
		                if (typeof (step_procession [step_]) !== 'function') {
		                    step .intent ([step .state (), step_procession [step_]])
		                }
		                else {
		                    step_procession [step_] (steps) .then (function () {
		                        R .forEachObjIndexed (function (x) {
		                            x .intent (['reset']);
		                        }) (steps)
		                    })
		                }
						return reflect (none);
					}
					else {
						console .error ('unknown intent passed', intent);
						return reflect (none);
					}
		        }))

		        R .forEachObjIndexed (function (x, i) {
		            i = +i;
		            x .state .thru (filter, R .propEq ('_', 'done')) .thru (tap, function () {
		                extension .intent (['step', i]);
		            })
		        }) (steps)

		        extension .intent (['step', 'start'])

		        return interaction_product (R .merge (components) ({
		            stepper: extension
		        }))
		    }
		;

		    var _step_interaction_ = function (dom) {
		        var stepped_nodes = [] .slice .call (dom .querySelectorAll ('[step]'));
		        var step = R .pipe (
		            R .chain (function (node) {
		                return node .getAttribute ('step') .split (',') .map (function (x) {
		                    return [node, x]
		                });
		            }),
		            R .groupBy (R .prop (1)),
		            R .map (R .map (R .prop (0)))
		        ) (stepped_nodes);

		        return interaction (transition (function (intent, license) {
		            var from = intent [0];
		            var to = intent [1];
		            if (from) {
		                step [from] .forEach (function (node) {
		                    node .style .visibility = 'hidden';
		                })
		            }
		            else {
		                R .forEachObjIndexed (function (step, from) {
		                    if (from !== to)
		                        step .forEach (function (node) {
		                            node .style .visibility = 'hidden';
		                        })
		                }) (step)
		            }
		            step [to] .forEach (function (node) {
		                node .style .visibility = '';
		            });
		            return only_ (to);
		        }));
		    }
		;

		    var _interaction_of_step_ = {
		        1: function (components) {
		    		var back = components .back;
		    		var done = components .done;

		    		var name = components .name;
		    		var school = components .school;
		    		var date_of_birth = components .date_of_birth;

		    		var extension = interaction (transition (function (intent, license) {
		    			if (intent [0] === 'done') {
				            if (! name .state () ._) {
				                toast ('Please fill in your name')
				                return reflect (none);
				            }
				            else if (! school .state () ._) {
				                toast ('Please fill in your school name')
				                return reflect (none);
				            }
				            else if (! date_of_birth .state () ._) {
				                toast ('Please fill in your date of birth')
				                return reflect (none);
				            }
				            else {
				                return only_ ('done');
				            }
		    			}
		    			else if (intent [0] === 'reset') {
		    			    name .intent (['reset']);
		    			    school .intent (['reset']);
		    			    date_of_birth .intent (['reset']);
			                return only_ (null);
		    			}
		    			else {
		    				console .error ('unknown intent passed', intent);
		    				return reflect (none);
		    			}
		    		}));

		    		extension .state (null);

		    		back .thru (tap, function () {
		    			window .location .href = routes .dashboard;
		    		})
		    		done .thru (tap, function () {
		    			extension .intent (['done']);
		    		})

		    		return interaction_product ({
		    			_: extension,

					    name: name,
					    school: school,
					    date_of_birth: date_of_birth
		    		})
		    	},
		    	2: function (components) {
		    		var go = components .go;

		    		var koder = components .koder;

		    		var extension = interaction (transition (function (intent, license) {
		    			if (intent === 'go') {
		    				return only_ ('done')
						}
		    			else if (intent [0] === 'reset') {
		    			    koder .intent (['reset']);
			                return only_ (null);
		    			}
		    			else {
		    				console .error ('unknown intent passed', intent);
			                return reflect (none);
		    			}
		    		}));

		    		extension .state (null);

		    		go .thru (tap, function () {
		    			extension .intent ('go');
		    		})

		    		return interaction_key_sum (koder, interaction_product ({
		    			_: extension
		    		}))
		    	},
		    	3: function (components) {
		    		var all_done = components .all_done;

		    		var koder_name = components .koder_name;

		    		var extension = interaction (transition (function (intent, license) {
		    			if (intent [0] === 'done') {
				            if (! koder_name .state () ._) {
				                toast ('Please give a name to your Koder!')
				                return reflect (none);
				            }
				            else {
				                return only_ ('done');
				            }
		    			}
		    			else if (intent [0] === 'reset') {
		    			    koder_name .intent (['reset']);
			                return only_ (null);
		    			}
		    			else {
		    				console .error ('unknown intent passed', intent);
		    				return reflect (none);
		    			}
		    		}));

		    		extension .state (null);

		    		all_done .thru (tap, function () {
		    			extension .intent (['done']);
		    		})

		    		return interaction_product ({
		    			_: extension,

					    koder_name: koder_name
		    		})
		    	}
		    }

	if (typeof self .update_strategy === "function") self .shouldUpdate = self .update_strategy;
	}) (this, this .opts);
});
riot.tag2('page-dashboard', __strs [2979227], '', '', function(opts) {
	(function (self, args) {

	 self ._loaded = true;
	 self ._scope = function () {};
	var known_as = function (what) { return function (how) { log (self .root .localName, what, how);} };
	self .on ("update", function () {args = self .opts});

		    args .cycle__from .thru (tap, function () {

		    })

	if (typeof self .update_strategy === "function") self .shouldUpdate = self .update_strategy;
	}) (this, this .opts);
});
riot.tag2('page-login', __strs [5868449], '', '', function(opts) {
	(function (self, args) {

	 self ._loaded = true;
	 self ._scope = function () {};
	var known_as = function (what) { return function (how) { log (self .root .localName, what, how);} };
	self .on ("update", function () {args = self .opts});

			var _interaction = interaction_to_be (promise_of (function (is) {
				self .on ('mount', function () {
				    var dom = self .root;

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

					is (
						_interaction_ ({
							login: login_stream,
							make_account: make_account_stream,

							email: email_interaction,
							password: password_interaction
						})
					)
				})
			}))

			var _interaction_ =	function (components) {
				var login = components .login;
				var make_account = components .make_account;

				var email = components .email;
				var password = components .password;

				var extension = interaction (transition (function (intent, license) {
					if (intent === 'login') {
						return	function (tenure) {
									if (! (email .state () ._ && email .state () .dom .checkValidity ())) {
										toast ('Please make sure you enter a valid email');
										tenure .end (true);
									}
									else {
										tenure ('logging-in');
										loader ();
										return inquire (api () .login, {
											email: email .state () ._,
											password: password .state () ._
										})
										.then (function (res) {
											loader .stop ();
											if (res .error) {
												toast ('There was a problem logging in');
											}
											else {
												window .location .href = routes .dashboard;
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

				login .thru (tap, function () {
					extension .intent ('login');
				})
				make_account .thru (tap, function () {
					window .location .href = routes .make_account
				})

				return interaction_product ({
					_: extension,

					input_email: email,
					input_password: password
				})
			}

	if (typeof self .update_strategy === "function") self .shouldUpdate = self .update_strategy;
	}) (this, this .opts);
});
riot.tag2('page-logout', '', '', '', function(opts) {
	(function (self, args) {

	 self ._loaded = true;
	 self ._scope = function () {};
	var known_as = function (what) { return function (how) { log (self .root .localName, what, how);} };
	self .on ("update", function () {args = self .opts});

		    args .cycle__from .thru (tap, function () {

		        inquire (api () .logout)
		            .then (function () {
		                window .location .href = routes .login;
		            })
		    })

	if (typeof self .update_strategy === "function") self .shouldUpdate = self .update_strategy;
	}) (this, this .opts);
});
riot.tag2('page-make-account', __strs [5943176], '', '', function(opts) {
	(function (self, args) {

	 self ._loaded = true;
	 self ._scope = function () {};
	var known_as = function (what) { return function (how) { log (self .root .localName, what, how);} };
	self .on ("update", function () {args = self .opts});

			var _interaction = interaction_to_be (promise_of (function (is) {
				self .on ('mount', function () {
				    var dom = self .root;

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

					is (
						_interaction_ ({
							make_account: make_account_stream,
							back: back_stream,

							email: email_interaction,
							password: password_interaction,
							retype_password: retype_password_interaction
						})
					)
				})
			}))

			var _interaction_ =	function (components) {
				var make_account = components .make_account;
				var back = components .back;

				var email = components .email;
				var password = components .password;
				var retype_password = components .retype_password;

				var extension = interaction (transition (function (intent, license) {
					if (intent === 'make') {
						return 	function (tenure) {
									if (! (email .state () ._ && email .state () .dom .checkValidity ())) {
										toast ('Please make sure you enter a valid email');
										tenure .end (true);
									}
									else if (password .state () ._ !== retype_password .state () ._) {
										toast ('Please make sure your passwords match');
										tenure .end (true);
									}
									else {
										tenure ('making-account');
										loader ();
										inquire (api () .register, {
											email: email .state () ._,
											password: password .state () ._
										})
										.then (function (res) {
											loader .stop ();
											if (res .error) {
												toast ('There was a problem creating the account');
											}
											else {
												window .location .href = routes .dashboard;
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

				make_account .thru (tap, function () {
					extension .intent ('make');
				})
				back .thru (tap, function () {
					window .location .href = routes .login;
				})

				return interaction_product ({
					_: extension,

					input_email: email,
					input_password: password,
					input_retype_password: retype_password
				})
			}

	if (typeof self .update_strategy === "function") self .shouldUpdate = self .update_strategy;
	}) (this, this .opts);
});
