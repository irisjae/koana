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
									path = home_path
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
								window .location .hash = home_path;
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
riot.tag2('custom-hamburger', '<component-hamburger-button ref="{ref prefix}action"></component-hamburger-button> <component-custom-menu off="{expression:custom-hamburger:1}" ref="{ref prefix}menu"></component-custom-menu>', '', '', function(opts) {
	(function (self, args) {

	 self ._loaded = true;
	 self ._scope = function () {};
	var self_diff = stream ();
	var yielded_diff = stream ();
	self .yielded_diff = yielded_diff ;
	var diffs = mergeAll ([ self_diff, yielded_diff ]);
	var ref = function (name) { return ref_diff (name, diffs) };
	var ref_set = function (name) { return ref_set_diff (name, diffs) };
	var _refs = mergeAll ([ from (function (when) { self .on ("mount", function () { when (self .refs); }); }), from (function (when) { self .on ("updated", function () { when (self .refs); }); }) ]) .thru (map, consistentfy)  ;
	_refs .thru (map, self_refs) .thru (diff_refs) .thru (tap, self_diff);
	var known_as = function (what) { return function (how) { log (self .root .localName, what, how);} };
	self .on ("update", function () {args = self .opts});

		    var off = stream (true);
		    off .thru (map, noop) .thru (tap, self .render)

		    ref ('action') .thru (tap, function (_ref) {
		        _ref .addEventListener ('click', function () {
		            off (! off ())
		        }, true)
		    })
		    ref ('menu') .thru (tap, function (_ref) {
		        _ref .addEventListener ('click', function (e) {
		            if (e .target === _ref)
		                off (! off ())
		        })
		    })

	self .expressions = {};

	self .expressions [0] = function (_item) { return  off ()  };
	if (typeof self .update_strategy === "function") self .shouldUpdate = self .update_strategy;
	}) (this, this .opts);
});
riot.tag2('custom-menu', '<pane> <item> <icon-holder> <svg viewbox="0 0 24 24"> <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"></path> </svg> </icon-holder> <label>Preview</label> <component-wavify></component-wavify> </item> <hr> <item> <icon-holder> <svg viewbox="0 0 24 24"> <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"></path> </svg> </icon-holder> <label>Preview</label> <component-wavify></component-wavify> </item> </pane>', '', '', function(opts) {
});
riot.tag2('custom-nav', '{ enter yield }<yield></yield>{ exit yield } <nav-bar> { enter yield }<yield></yield>{ exit yield } </nav-bar>', '', '', function(opts) {
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
riot.tag2('custom-page', '{ enter yield }<yield></yield>{ exit yield }', '', '', function(opts) {
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
riot.tag2('modules-checkbox', '', '', '', function(opts) {
	(function (self, args) {

	 self ._loaded = true;
	 self ._scope = function () {};
	var known_as = function (what) { return function (how) { log (self .root .localName, what, how);} };
	self .on ("update", function () {args = self .opts});

		    self .root .addEventListener ('click', function () {
		        if (self .root .getAttribute ('checked')) {
		            self .root .removeAttribute ('checked');
		            args .check__to (false)
		        }
		        else {
		            self .root .setAttribute ('checked', true);
		            args .check__to (true)
		        }
		    });

	if (typeof self .update_strategy === "function") self .shouldUpdate = self .update_strategy;
	}) (this, this .opts);
});
riot.tag2('modules-dynamic-load-item', '{ enter yield }<yield></yield>{ exit yield }', '', '', function(opts) {
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

			var nth = stream (+ args .nth);
			var item = stream (args .item);

			self .nth__from = nth .thru (tap, known_as ('nth'));
			self .item__from = item .thru (tap, known_as ('item'));

			self .on ('updated', function () {
				if (! args .garbage) {
					nth (+ args .nth);
					item (args .item);
				}
			})

	if (! self .update_strategy || self .update_strategy === "push") self .shouldUpdate = R .T;
	if (typeof self .update_strategy === "function") self .shouldUpdate = self .update_strategy;
	}) (this, this .opts);
});
riot.tag2('modules-dynamic-load', '<component-dynamic-load-item each="{wrap, i in expression:modules-dynamic-load:6}" nth="{expression:modules-dynamic-load:1}" item="{expression:modules-dynamic-load:2}" garbage="{expression:modules-dynamic-load:3}" riot-style="transform: translateY({expression:modules-dynamic-load:4}px);"> { enter yield }<yield></yield>{ exit yield } </component-dynamic-load-item> <stretcher riot-style="height: {expression:modules-dynamic-load:5}px;"></stretcher>', '', '', function(opts) {
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

			self .update_strategy = 'pull';

			var list = closest_parent (self .root, 'main-content');
			var dynamic_load = self .root;

			var items_to_load = + args .items_to_load;
			var loading_interval = + args .interval_for_loading;

			var item_source = args .items__from;
			var item_height = args .item_height;

			var nths = {};
			var wrap_nth =	function (nth) {
								if (! nths [nth])
									nths [nth] = { nth: nth };
								return nths [nth];
							};

			var loaded_items = item_source;
			var loaded_range = mechanism (function () {
				return rangify (loaded_items ());
			}, [loaded_items]) .thru (begins_with, null_range)
			var loaded_item = function (nth) {
				return loaded_items () [nth];
			}
			var height_up_to = function (nth) {
				return 	arrayify ({
							from: 0,
							to: nth - 1
						})
						.map (loaded_item)
						.reduce (function (total, item) {
							return total + item_height (item)
						}, 0);
			}

			var scroll_range = function () {
				return	{
							from: positive_or_zero (list .scrollTop - dynamic_load .offsetTop),
							to: positive_or_zero (list .scrollTop - dynamic_load .offsetTop + list .clientHeight)
						};
			};
			var target_range = mechanism (function () {
				var _scroll_range = scroll_range ();
				var _loaded_range = loaded_range ();

				var start =	(function () {
					var middle = (_scroll_range .from + _scroll_range .to) / 2;
					var min;

					var total = 0;
					var least_asymmetry = middle;

					for (var nth = 0; nth <= _loaded_range .to; nth ++) {
						if (total <= _scroll_range .from) min = nth;
						var new_total = total + item_height (loaded_item (nth));
						var new_asymmetry = Math .abs (new_total - middle);
						if (new_asymmetry < least_asymmetry) {
							total = new_total;
							least_asymmetry = new_asymmetry;
						}
						else {
							return Math .min (min, nth);
						}
					}
					return min || 0;
				}) ();
				var curr = intersection (target_range, _loaded_range);
				var next =	intersection ({
								from: start,
								to: start + items_to_load - 1
							}, _loaded_range);
				return curr && included_in (curr, next) ? curr : next
			}, [ mergeAll ([
					(window .dynamic_load_rendering || (window .dynamic_load_rendering = from (function (self) {
						document .addEventListener ('animationstart', self, false);
					})))
						.thru (map, R .prop ('target'))
						.thru (filter, R .equals (self .root))
						.thru (tap, logged_with ('attached')),
					from (function (when) { list .addEventListener ('scroll', function (x) { when (x); }); }) .thru (afterSilence, 5)
				]), loaded_range ]) .thru (tap, known_as ('target range'))
			var target_items = mechanism (function () {
				return arrayify (target_range ()) .map (wrap_nth);
			}, [target_range])

			loaded_items
				.thru (dropRepeats)
				.thru (map, function () {
					return 	target_items
								.thru (dropRepeatsWith, json_equal)
				})
				.thru (switchLatest)
				.thru (afterSilence, loading_interval)
				.thru (tap, function () {
					var date = new Date ();
					self .render ()
						.then (function () {
							log ('dynamic-load ' + (new Date () - date) + 'ms', self);
						});
				})

	self .expressions = {};

	self .expressions [0] = function (_item) { return  _item .wrap .nth  };
	self .expressions [1] = function (_item) { return  loaded_item (_item .wrap .nth)  };
	self .expressions [2] = function (_item) { return  _item .wrap .nth < loaded_range () .from || loaded_range () .to < _item .wrap .nth  };
	self .expressions [3] = function (_item) { return  height_up_to (_item .wrap .nth)  };
	self .expressions [4] = function (_item) { return  height_up_to (loaded_range () .to + 1)  };
	self .expressions [5] = function (_item) { return target_items ()  };
	if (! self .update_strategy || self .update_strategy === "push") self .shouldUpdate = R .T;
	if (typeof self .update_strategy === "function") self .shouldUpdate = self .update_strategy;
	}) (this, this .opts);
});
riot.tag2('modules-loader', '<component-modal-holder> <component-loading-item></component-loading-item> { enter yield }<yield></yield>{ exit yield } </component-modal-holder>', '', '', function(opts) {
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
riot.tag2('modules-modal-holder', '<item> { enter yield }<yield></yield>{ exit yield } </item>', '', '', function(opts) {
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
riot.tag2('modules-select-control', '{ enter yield }<yield></yield>{ exit yield }', '', '', function(opts) {
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

		    var multiple = args .multiple !== undefined;

		    var last = self .root .querySelector ('a[active]');
		    self .root .addEventListener ('click', function (event) {
		        var selects = self .root .querySelectorAll ('a');
		        var index = [] .indexOf .call (selects, event .target);
		        if (index !== -1) {
		            if (! multiple && last)
		                last .removeAttribute ('active');
		            if (multiple && event .target .hasAttribute ('active')) {
		                event .target .removeAttribute ('active');
		            }
		            else {
		                event .target .setAttribute ('active', true);
		                last = event .target;
		            }

		            var values =    [] .filter .call (selects, function (select) {
		                                return select .hasAttribute ('active')
		                            }) .map (function (select) {
		                                return select .textContent
		                            })
		            if (args .select__to)
		                args .select__to (multiple ? values : values [0]);
		        }
		    })

	if (! self .update_strategy || self .update_strategy === "push") self .shouldUpdate = R .T;
	if (typeof self .update_strategy === "function") self .shouldUpdate = self .update_strategy;
	}) (this, this .opts);
});
riot.tag2('modules-snackbar', '<snackbar> <item> { enter yield }<yield></yield>{ exit yield } </item> </snackbar>', '', '', function(opts) {
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
riot.tag2('modules-wavify', '', '', '', function(opts) {
	(function (self, args) {

	 self ._loaded = true;
	 self ._scope = function () {};
	var known_as = function (what) { return function (how) { log (self .root .localName, what, how);} };
	self .on ("update", function () {args = self .opts});

		    var time = (args .time / 1000 || 2)
		    var background = args .background;

		    var parent = self .root .parentElement;
		    parent .addEventListener ('click', function (e) {

		        var rect = parent .getBoundingClientRect ();
		        var x_base = rect .width;
		        var y_base = rect .height;
		        var x = args .center !== undefined ? x_base / 2 : e .clientX - rect .left;
		        var y = args .center !== undefined ? y_base / 2 : e .clientY - rect .top;
		        var x_max = x > 0.5 * x_base ? x : x_base - x;
		        var y_max = y > 0.5 * y_base ? y : y_base - y;
		        var r = Math .sqrt (x_max * x_max + y_max * y_max)
		        var wave = document .createElement ('wave');
		        wave .style .width = 2 * r + 'px';
		        wave .style .height = 2 * r + 'px';
		        wave .style .top = (y - r) + 'px';
		        wave .style .left = (x - r) + 'px';
		        wave .style .transition = 'opacity ' + time + 's cubic-bezier(0.23, 1, 0.32, 1) 0s, transform ' + (time / 2) + 's cubic-bezier(0.23, 1, 0.32, 1) 0s';
		        if (background)
		            wave .style .backgroundColor = background;
		        self .root .insertBefore (wave, null);
		        wait (60) .then
		            (function () {
		                wave .setAttribute ('move', true);
		            })

		        waitdone = wait (time * 1000 + 1000) .then
		            (self .root .removeChild .bind (self .root, wave))

		        if (args .waves__to)
		            args .waves__to (from_promise (done))
		    }, true);

	if (typeof self .update_strategy === "function") self .shouldUpdate = self .update_strategy;
	}) (this, this .opts);
});
riot.tag2('page-login', '{ enter yield }<yield></yield>{ exit yield } <component-field-control placeholder="Email" type="email"></component-field-control> <component-field-control type="password" placeholder="Password"></component-field-control> <a href="#forget"> Forget Password? </a> <component-spacing height="40px"></component-spacing> <component-action> <a href="#explore">Login</a> </component-action>', '', '', function(opts) {
});
