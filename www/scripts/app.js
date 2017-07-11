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
riot.tag2('component-action', '{ enter yield }<yield></yield>{ exit yield }', '', '', function(opts) {
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
riot.tag2('component-add-fab', '<floating> <action> <svg viewbox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path></svg> <component-wavify></component-wavify> </action> </floating>', '', '', function(opts) {
});
riot.tag2('component-back-button', '<icon-holder><svg width="1792" height="1792" viewbox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M1203 544q0 13-10 23l-393 393 393 393q10 10 10 23t-10 23l-50 50q-10 10-23 10t-23-10l-466-466q-10-10-10-23t10-23l466-466q10-10 23-10t23 10l50 50q10 10 10 23z"></path></svg ></icon-holder>', '', '', function(opts) {
});
riot.tag2('component-cached', '<render ref="{ref prefix}render"> { enter yield }<yield></yield>{ exit yield } </render>', '', '', function(opts) {
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

			var key = args .key;

			(window .cache_access || (window .cache_access = from (function (self) {
				document .addEventListener ('animationstart', self, false);
			})))
				.thru (map, function (event) {
					return event .target
				})
				.thru (filter, function (root) {
					return root === self .root
				})
				.thru (tap, logged_with ('attached ' + key))
				.thru (tap, function () {
					if (! window .component_cache) window .component_cache = {};
					if (! window .component_cache [key]) {
						var mother = self .root;

						var put_back;
						var main_cache = ref ('render') ();
						window .component_cache [key] =	function (put){
															if (put_back)
																main_cache .parentNode .insertBefore (put_back, main_cache);
															if (put === main_cache) {
																mother .insertBefore (main_cache, null);
																put_back = undefined;
															}
															else {
																put .parentNode .insertBefore (main_cache, put);
																put .parentNode .removeChild (put);
																put_back = put;
															}
														}
					}
					else {
						window .component_cache [key] (ref ('render') ());
					}
				})

	if (! self .update_strategy || self .update_strategy === "push") self .shouldUpdate = R .T;
	if (typeof self .update_strategy === "function") self .shouldUpdate = self .update_strategy;
	}) (this, this .opts);
});
riot.tag2('component-checkbox', '', '', '', function(opts) {
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
riot.tag2('component-custom-avatar', '<img size="40" src="images/uxceo-128.jpg" style=" color: rgb(255, 255, 255); background-color: rgb(188, 188, 188); user-select: none; display: inline-flex; align-items: center; justify-content: center; font-size: 20px; border-radius: 50%; height: 40px; width: 40px; position: absolute; top: 8px; left: 16px;">', '', '', function(opts) {
});
riot.tag2('component-custom-hamburger', '<component-hamburger-button ref="{ref prefix}action"></component-hamburger-button> <component-custom-menu off="{expression:component-custom-hamburger:1}" ref="{ref prefix}menu"></component-custom-menu>', '', '', function(opts) {
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
riot.tag2('component-custom-menu', '<pane> <item> <icon-holder> <svg viewbox="0 0 24 24"> <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"></path> </svg> </icon-holder> <label>Preview</label> <component-wavify></component-wavify> </item> <hr> <item> <icon-holder> <svg viewbox="0 0 24 24"> <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"></path> </svg> </icon-holder> <label>Preview</label> <component-wavify></component-wavify> </item> </pane>', '', '', function(opts) {
});
riot.tag2('component-custom-nav', '<nav-bar> { enter yield }<yield></yield>{ exit yield } </nav-bar>', '', '', function(opts) {
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
riot.tag2('component-custom-subcategory-item', '<a href="#account/quiz/subcategory/#{expression:component-custom-subcategory-item:1}" if="{expression:component-custom-subcategory-item:2}"> <img src="https://ibin.co/3I0i4laCon7P.png"> </a>', '', '', function(opts) {
	(function (self, args) {

	 self ._loaded = true;
	 self ._scope = function () {};
	var known_as = function (what) { return function (how) { log (self .root .localName, what, how);} };
	self .on ("update", function () {args = self .opts});

		    var item = args .item__from .thru (dropRepeatsWith, json_equal)

		    var subcategory = mechanism (function () {
		        if (item ())
		            return item () .category;
		    }, [item])
			var name = mechanism (function () {
				return subcategory ();
			}, [subcategory])

		    item .thru (map, noop) .thru (tap, self .render)

	self .expressions = {};

	self .expressions [0] = function (_item) { return  stringify (name ())  };
	self .expressions [1] = function (_item) { return  subcategory ()  };
	if (typeof self .update_strategy === "function") self .shouldUpdate = self .update_strategy;
	}) (this, this .opts);
});
riot.tag2('component-custom-tabs', '<tabs> <tab active="{expression:component-custom-tabs:1}"> <a href="#account/quizes"> <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" width="512px" height="512px" viewbox="0 0 485.213 485.212" style="enable-background:new 0 0 485.213 485.212;" xml:space="preserve"> <g> <path d="M394.235,151.628c0,82.449-49.695,92.044-59.021,181.956c0,8.382-6.785,15.163-15.168,15.163H165.161 c-8.379,0-15.161-6.781-15.161-15.163h-0.028c-9.299-89.912-58.994-99.507-58.994-181.956C90.978,67.878,158.855,0,242.606,0 S394.235,67.878,394.235,151.628z M318.423,363.906H166.794c-8.384,0-15.166,6.786-15.166,15.168 c0,8.378,6.782,15.163,15.166,15.163h151.628c8.378,0,15.163-6.785,15.163-15.163C333.586,370.692,326.801,363.906,318.423,363.906 z M318.423,409.396H166.794c-8.384,0-15.166,6.786-15.166,15.163c0,8.383,6.782,15.168,15.166,15.168h151.628 c8.378,0,15.163-6.785,15.163-15.168C333.586,416.182,326.801,409.396,318.423,409.396z M212.282,485.212h60.65 c16.76,0,30.322-13.562,30.322-30.326h-121.3C181.955,471.65,195.518,485.212,212.282,485.212z" fill="#7e7e7e"></path> </g> </svg> Quizes </a> <component-wavify></component-wavify> </tab> <tab active="{expression:component-custom-tabs:2}"> <a href="#account/ranking"> <svg width="53" height="61" viewbox="0 0 53 61" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <title>person.svg</title> <desc>Created using Figma</desc> <g id="Canvas" transform="translate(3410 646)"> <g id="person"> <g id="Shape 1"> <use xlink:href="#9c74239e-b755-4545-99a8-48b1d7ecbd25" transform="translate(-3409.11 -645.992)" fill="#7E7E7E"></use> </g> </g> </g> <defs> <path id="9c74239e-b755-4545-99a8-48b1d7ecbd25" d="M 51.475 55.7731C 51.475 58.1371 49.558 60.0541 47.194 60.0541L 4.294 60.0541C 1.922 60.0541 5.95703e-05 58.1319 5.95703e-05 55.7599L 5.95703e-05 51.475C 5.95703e-05 40.181 17.158 34.317 17.158 34.317C 17.158 34.317 18.14 32.563 17.158 30.027C 13.55 27.368 13.109 23.2071 12.868 12.8691C 13.61 2.51805 20.877 -8.98438e-05 25.737 -8.98438e-05C 30.597 -8.98438e-05 37.864 2.51405 38.606 12.8691C 38.366 23.2071 37.924 27.368 34.316 30.027C 33.334 32.558 34.316 34.317 34.316 34.317C 34.316 34.317 51.4741 40.181 51.4741 51.475L 51.4741 55.7731L 51.475 55.7731Z"></path> </defs> </svg> Profile </a> <component-wavify></component-wavify> </tab> <tab active="{expression:component-custom-tabs:3}"> <a href="#account/courses"> <svg width="53" height="55" viewbox="0 0 53 55" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <title>Group.svg</title> <desc>Created using Figma</desc> <g id="Canvas" transform="translate(3158 640)"> <g id="Group"> <g id="Vector"> <use xlink:href="#d60b977b-c6cb-4cd6-a033-e5e20ff036b1 " transform="translate(-3157.01 -605.957)" fill="#7E7E7E"></use> <use xlink:href="#5670583f-69b7-46ee-a0f3-ef772c677463 " transform="translate(-3157.01 -605.957)" fill="#7E7E7E"></use> </g> <g id="Vector"> <use xlink:href="#254bfab7-40f3-4302-8f28-322cca3a71fe " transform="translate(-3157.08 -604.429)" fill="#7E7E7E"></use> <use xlink:href="#c4e58a41-6c58-49b2-a4be-037c647ffdc9 " transform="translate(-3157.08 -604.429)" fill="#7E7E7E"></use> </g> <g id="Vector"> <use xlink:href="#bbc3b3c1-24ea-4300-8410-e8ae50ab9626" transform="translate(-3157.01 -627.113)" fill="#7E7E7E"></use> <use xlink:href="#bbc3b3c1-24ea-4300-8410-e8ae50ab9626" transform="translate(-3157.01 -627.113)" fill="#7E7E7E"></use> </g> <g id="Vector"> <use xlink:href="#2b5d59ac-2960-4d37-add9-218f307054d1" transform="translate(-3132.07 -637.793)" fill="#7E7E7E"></use> <use xlink:href="#7fa86e4d-affc-4a7c-bc50-fd219bc128a0" transform="translate(-3132.07 -637.793)" fill="#7E7E7E"></use> </g> <g id="Vector"> <use xlink:href="#91250fb5-0514-4c13-8163-c8972105f3bb" transform="translate(-3156.95 -637.793)" fill="#7E7E7E"></use> <use xlink:href="#6095b802-9d95-4559-b13b-044d0cb2f1fd" transform="translate(-3156.95 -637.793)" fill="#7E7E7E"></use> </g> <g id="Vector"> <use xlink:href="#6d4d5c0d-f0bc-4f44-b2f3-18f4195f5d6e" transform="translate(-3131.91 -627.337)" fill="#7E7E7E"></use> <use xlink:href="#8409e859-16a0-427e-9e2d-e90a431e5986" transform="translate(-3131.91 -627.337)" fill="#7E7E7E"></use> </g> </g> </g> <defs> <path id="d60b977b-c6cb-4cd6-a033-e5e20ff036b1 " d="M 51.2969 6.64063e-05L 1.17188e-05 6.64063e-05L 1.17188e-05 13.8131L 51.2969 13.8131L 51.2969 6.64063e-05Z"></path> <path id="5670583f-69b7-46ee-a0f3-ef772c677463 " d="M 1.17188e-05 6.64063e-05L 1.17188e-05 -0.499934L -0.499988 -0.499934L -0.499988 6.64063e-05L 1.17188e-05 6.64063e-05ZM 51.2969 6.64063e-05L 51.7969 6.64063e-05L 51.7969 -0.499934L 51.2969 -0.499934L 51.2969 6.64063e-05ZM 51.2969 13.8131L 51.2969 14.3131L 51.7969 14.3131L 51.7969 13.8131L 51.2969 13.8131ZM 1.17188e-05 13.8131L -0.499988 13.8131L -0.499988 14.3131L 1.17188e-05 14.3131L 1.17188e-05 13.8131ZM 1.17188e-05 0.500066L 51.2969 0.500066L 51.2969 -0.499934L 1.17188e-05 -0.499934L 1.17188e-05 0.500066ZM 50.7969 6.64063e-05L 50.7969 13.8131L 51.7969 13.8131L 51.7969 6.64063e-05L 50.7969 6.64063e-05ZM 51.2969 13.3131L 1.17188e-05 13.3131L 1.17188e-05 14.3131L 51.2969 14.3131L 51.2969 13.3131ZM 0.500012 13.8131L 0.500012 6.64063e-05L -0.499988 6.64063e-05L -0.499988 13.8131L 0.500012 13.8131Z"></path> <path id="254bfab7-40f3-4302-8f28-322cca3a71fe " d="M 51.4389 11.8971C 51.4389 15.2301 48.6291 17.9311 45.1701 17.9311L 6.26606 17.9311C 2.80906 17.9311 -5.66406e-05 15.2291 -5.66406e-05 11.8971L -5.66406e-05 6.03798C -5.66406e-05 2.69798 2.80906 -0.000101563 6.26606 -0.000101563L 45.1701 -0.000101563C 48.6291 -0.000101563 51.4389 2.69798 51.4389 6.03798L 51.4389 11.8971Z"></path> <path id="c4e58a41-6c58-49b2-a4be-037c647ffdc9 " d="M 50.9389 11.8971C 50.9389 14.936 48.3713 17.4311 45.1701 17.4311L 45.1701 18.4311C 48.8869 18.4311 51.9389 15.5243 51.9389 11.8971L 50.9389 11.8971ZM 45.1701 17.4311L 6.26606 17.4311L 6.26606 18.4311L 45.1701 18.4311L 45.1701 17.4311ZM 6.26606 17.4311C 3.06707 17.4311 0.499943 14.9352 0.499943 11.8971L -0.500057 11.8971C -0.500057 15.523 2.55105 18.4311 6.26606 18.4311L 6.26606 17.4311ZM 0.499943 11.8971L 0.499943 6.03798L -0.500057 6.03798L -0.500057 11.8971L 0.499943 11.8971ZM 0.499943 6.03798C 0.499943 2.9919 3.06708 0.499898 6.26606 0.499898L 6.26606 -0.500102C 2.55103 -0.500102 -0.500057 2.40407 -0.500057 6.03798L 0.499943 6.03798ZM 6.26606 0.499898L 45.1701 0.499898L 45.1701 -0.500102L 6.26606 -0.500102L 6.26606 0.499898ZM 45.1701 0.499898C 48.3713 0.499898 50.9389 2.99207 50.9389 6.03798L 51.9389 6.03798C 51.9389 2.4039 48.887 -0.500102 45.1701 -0.500102L 45.1701 0.499898ZM 50.9389 6.03798L 50.9389 11.8971L 51.9389 11.8971L 51.9389 6.03798L 50.9389 6.03798Z"></path> <path id="bbc3b3c1-24ea-4300-8410-e8ae50ab9626" d="M 26.198 21.2L -1.17188e-05 21.2L -1.17188e-05 6.05469e-05L 26.198 21.2Z"></path> <path id="bbc3b3c1-24ea-4300-8410-e8ae50ab9626" d="M 26.198 21.2L 26.198 21.7L 27.6107 21.7L 26.5125 20.8113L 26.198 21.2ZM -1.17188e-05 21.2L -0.500012 21.2L -0.500012 21.7L -1.17188e-05 21.7L -1.17188e-05 21.2ZM -1.17188e-05 6.05469e-05L 0.314516 -0.38862L -0.500012 -1.04775L -0.500012 6.05469e-05L -1.17188e-05 6.05469e-05ZM 26.198 20.7L -1.17188e-05 20.7L -1.17188e-05 21.7L 26.198 21.7L 26.198 20.7ZM 0.499988 21.2L 0.499988 6.05469e-05L -0.500012 6.05469e-05L -0.500012 21.2L 0.499988 21.2ZM -0.31454 0.388741L 25.8835 21.5887L 26.5125 20.8113L 0.314516 -0.38862L -0.31454 0.388741Z"></path> <path id="2b5d59ac-2960-4d37-add9-218f307054d1" d="M 25.623 31.8429L -9.375e-05 31.8429L -9.375e-05 -0.000115234L 25.623 31.8429Z"></path> <path id="7fa86e4d-affc-4a7c-bc50-fd219bc128a0" d="M 25.623 31.8429L 25.623 32.3429L 26.6671 32.3429L 26.0125 31.5294L 25.623 31.8429ZM -9.375e-05 31.8429L -0.500094 31.8429L -0.500094 32.3429L -9.375e-05 32.3429L -9.375e-05 31.8429ZM -9.375e-05 -0.000115234L 0.389452 -0.31357L -0.500094 -1.41905L -0.500094 -0.000115234L -9.375e-05 -0.000115234ZM 25.623 31.3429L -9.375e-05 31.3429L -9.375e-05 32.3429L 25.623 32.3429L 25.623 31.3429ZM 0.499906 31.8429L 0.499906 -0.000115234L -0.500094 -0.000115234L -0.500094 31.8429L 0.499906 31.8429ZM -0.38964 0.31334L 25.2334 32.1564L 26.0125 31.5294L 0.389452 -0.31357L -0.38964 0.31334Z"></path> <path id="91250fb5-0514-4c13-8163-c8972105f3bb" d="M -8.00781e-05 31.8849L 24.9169 31.8849L 24.9169 -0.000115234L -8.00781e-05 31.8849Z"></path> <path id="6095b802-9d95-4559-b13b-044d0cb2f1fd" d="M -8.00781e-05 31.8849L -0.394051 31.577L -1.02538 32.3849L -8.00781e-05 32.3849L -8.00781e-05 31.8849ZM 24.9169 31.8849L 24.9169 32.3849L 25.4169 32.3849L 25.4169 31.8849L 24.9169 31.8849ZM 24.9169 -0.000115234L 25.4169 -0.000115234L 25.4169 -1.45196L 24.5229 -0.30799L 24.9169 -0.000115234ZM -8.00781e-05 32.3849L 24.9169 32.3849L 24.9169 31.3849L -8.00781e-05 31.3849L -8.00781e-05 32.3849ZM 25.4169 31.8849L 25.4169 -0.000115234L 24.4169 -0.000115234L 24.4169 31.8849L 25.4169 31.8849ZM 24.5229 -0.30799L -0.394051 31.577L 0.393891 32.1928L 25.3109 0.307759L 24.5229 -0.30799Z"></path> <path id="6d4d5c0d-f0bc-4f44-b2f3-18f4195f5d6e" d="M -8.78906e-05 21.3869L 26.2001 21.3869L 26.2001 -6.05469e-05L -8.78906e-05 21.3869Z"></path> <path id="8409e859-16a0-427e-9e2d-e90a431e5986" d="M -8.78906e-05 21.3869L -0.316268 20.9996L -1.4033 21.8869L -8.78906e-05 21.8869L -8.78906e-05 21.3869ZM 26.2001 21.3869L 26.2001 21.8869L 26.7001 21.8869L 26.7001 21.3869L 26.2001 21.3869ZM 26.2001 -6.05469e-05L 26.7001 -6.05469e-05L 26.7001 -1.05364L 25.8839 -0.387398L 26.2001 -6.05469e-05ZM -8.78906e-05 21.8869L 26.2001 21.8869L 26.2001 20.8869L -8.78906e-05 20.8869L -8.78906e-05 21.8869ZM 26.7001 21.3869L 26.7001 -6.05469e-05L 25.7001 -6.05469e-05L 25.7001 21.3869L 26.7001 21.3869ZM 25.8839 -0.387398L -0.316268 20.9996L 0.316092 21.7742L 26.5163 0.387277L 25.8839 -0.387398Z"></path> </defs> </svg> Courses </a> <component-wavify></component-wavify> </tab> </tabs>', '', '', function(opts) {
	(function (self, args) {

	 self ._loaded = true;
	 self ._scope = function () {};
	var known_as = function (what) { return function (how) { log (self .root .localName, what, how);} };
	self .on ("update", function () {args = self .opts});

			var tabs = ['quizes', 'profile', 'courses']

			var highlight_position = function () {
				return 100 * tabs .indexOf (args .tab) / tabs .length
			}

	self .expressions = {};

	self .expressions [0] = function (_item) { return  args .tab === 'quizes'  };
	self .expressions [1] = function (_item) { return  args .tab === 'profile'  };
	self .expressions [2] = function (_item) { return  args .tab === 'courses'  };
	if (typeof self .update_strategy === "function") self .shouldUpdate = self .update_strategy;
	}) (this, this .opts);
});
riot.tag2('component-date-bar', '<span>{expression:component-date-bar:1}{expression:component-date-bar:2}</span>', '', '', function(opts) {
	(function (self, args) {

	 self ._loaded = true;
	 self ._scope = function () {};
	var known_as = function (what) { return function (how) { log (self .root .localName, what, how);} };
	self .on ("update", function () {args = self .opts});

		    var year = mechanism (function () {
		        if (args .date__from ()) {
		            var date = fecha .parse (args .date__from (), 'YYYYMM');
		            if (fecha .format (new Date (), 'YYYY') !== fecha .format (date, 'YYYY'))
		                return fecha .format (date, 'YYYY年');
		        }
		    }, [args .date__from])
		    var month = mechanism (function () {
		        if (args .date__from ()) {
		            var date = fecha .parse (args .date__from (), 'YYYYMM');
		            return fecha .format (date, 'M月');
		        }
		    }, [args .date__from])

	self .expressions = {};

	self .expressions [0] = function (_item) { return  year ()  };
	self .expressions [1] = function (_item) { return  month ()  };
	if (typeof self .update_strategy === "function") self .shouldUpdate = self .update_strategy;
	}) (this, this .opts);
});
riot.tag2('component-date-picker', '<input ref="{ref prefix}input">', '', '', function(opts) {
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

			var input = ref ('input');

			self
				.on ('mount', function () {
					var picker =	new Flatpickr (input (), {
										inline: true,
										minDate: (function () {
											var today = new Date();
											today .setDate (today .getDate () + 1);
											return today;
										}) (),
										dateFormat: 'Y年n月j日'
									})
					picker .currentYearElement .setAttribute ('readonly', true);
				})

			input .thru (tap, function (input) {
				input .addEventListener ('change', function () {
					args .date__to (input .value);
				});
			})

	if (typeof self .update_strategy === "function") self .shouldUpdate = self .update_strategy;
	}) (this, this .opts);
});
riot.tag2('component-day-of-week-picker', '<table> <tr> <th>一</th> <th>二</th> <th>三</th> <th>四</th> <th>五</th> <th>六</th> <th>日</th> </tr> <tr> <td><component-checkbox check__to="{expression:component-day-of-week-picker:1}"></component-checkbox></td> <td><component-checkbox check__to="{expression:component-day-of-week-picker:2}"></component-checkbox></td> <td><component-checkbox check__to="{expression:component-day-of-week-picker:3}"></component-checkbox></td> <td><component-checkbox check__to="{expression:component-day-of-week-picker:4}"></component-checkbox></td> <td><component-checkbox check__to="{expression:component-day-of-week-picker:5}"></component-checkbox></td> <td><component-checkbox check__to="{expression:component-day-of-week-picker:6}"></component-checkbox></td> <td><component-checkbox check__to="{expression:component-day-of-week-picker:7}"></component-checkbox></td> </tr> </table>', '', '', function(opts) {
	(function (self, args) {

	 self ._loaded = true;
	 self ._scope = function () {};
	var known_as = function (what) { return function (how) { log (self .root .localName, what, how);} };
	self .on ("update", function () {args = self .opts});

			var mon = stream ();
			var tue = stream ();
			var wed = stream ();
			var thu = stream ();
			var fri = stream ();
			var sat = stream ();
			var sun = stream ();

			mechanism (function () {
				return 	(mon () ? ['mon'] : []) .concat
						(tue () ? ['tue'] : []) .concat
						(wed () ? ['wed'] : []) .concat
						(thu () ? ['thu'] : []) .concat
						(fri () ? ['fri'] : []) .concat
						(sat () ? ['sat'] : []) .concat
						(sun () ? ['sun'] : [])
			}, [ mergeAll ([mon, tue, wed, thu, fri, sat, sun]) ])
			.thru (tap, known_as ('days'))
			.thru (tap, function (days) {
				args .days__to (days);
			})

	self .expressions = {};

	self .expressions [0] = function (_item) { return  mon  };
	self .expressions [1] = function (_item) { return  tue  };
	self .expressions [2] = function (_item) { return  wed  };
	self .expressions [3] = function (_item) { return  thu  };
	self .expressions [4] = function (_item) { return  fri  };
	self .expressions [5] = function (_item) { return  sat  };
	self .expressions [6] = function (_item) { return  sun  };
	if (typeof self .update_strategy === "function") self .shouldUpdate = self .update_strategy;
	}) (this, this .opts);
});
riot.tag2('component-dynamic-load-all', '<component-dynamic-load-item each="{wrap, i in expression:component-dynamic-load-all:5}" nth="{expression:component-dynamic-load-all:1}" item="{expression:component-dynamic-load-all:2}" garbage="{expression:component-dynamic-load-all:3}" no-reorder="{expression:component-dynamic-load-all:4}"> { enter yield }<yield></yield>{ exit yield } </component-dynamic-load-item>', '', '', function(opts) {
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

			var item_source = args .items__from;

			var nths = {};
			var wrap_nth =	function (nth) {
								if (! nths [nth])
									nths [nth] = { nth: nth };
								return nths [nth];
							};

			var loaded_items = item_source;
			var loaded_range = mechanism (function () {
				return rangify (loaded_items ());
			}, [loaded_items])
			var loaded_item = function (nth) {
				return loaded_items () [nth];
			}
			var target_items = mechanism (function () {
				return arrayify (loaded_range ()) .map (wrap_nth);
			}, [ loaded_range ])

			loaded_items
				.thru (tap, function () {
					var date = new Date ();
					self .render ()
						.then (function () {
							log ('dynamic-load-all ' + (new Date () - date) + 'ms');
						});
				})

	self .expressions = {};

	self .expressions [0] = function (_item) { return  _item .wrap .nth  };
	self .expressions [1] = function (_item) { return  loaded_item (_item .wrap .nth)  };
	self .expressions [2] = function (_item) { return  _item .wrap .nth < loaded_range () .from || loaded_range () .to < _item .wrap .nth  };
	self .expressions [3] = function (_item) { return  args .no_reorder  };
	self .expressions [4] = function (_item) { return target_items ()  };
	if (! self .update_strategy || self .update_strategy === "push") self .shouldUpdate = R .T;
	if (typeof self .update_strategy === "function") self .shouldUpdate = self .update_strategy;
	}) (this, this .opts);
});
riot.tag2('component-dynamic-load-item', '{ enter yield }<yield></yield>{ exit yield }', '', '', function(opts) {
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
riot.tag2('component-dynamic-load', '<component-dynamic-load-item each="{wrap, i in expression:component-dynamic-load:6}" nth="{expression:component-dynamic-load:1}" item="{expression:component-dynamic-load:2}" garbage="{expression:component-dynamic-load:3}" riot-style="transform: translateY({expression:component-dynamic-load:4}px);"> { enter yield }<yield></yield>{ exit yield } </component-dynamic-load-item> <stretcher riot-style="height: {expression:component-dynamic-load:5}px;"></stretcher>', '', '', function(opts) {
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
riot.tag2('component-field-control', '<placeholder empty="{expression:component-field-control:1}">{expression:component-field-control:2}</placeholder> <input ref="{ref prefix}input" type="{expression:component-field-control:3}" maxlength="{expression:component-field-control:4}"> <hr> <hr focused="{expression:component-field-control:5}">', '', '', function(opts) {
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

		    var focused = stream ()
		    var empty = stream ()

		    var vals = from (function (_vals) {
		        _vals (args .val);
		        self .on ('updated', function () {
		            _vals (args .val);
		        })
		    })

		    ref ('input') .thru (tap, function (ref) {

		        vals .thru (dropRepeats) .thru (tap, function (val) {
		            if (val) {
		                ref .value = val;
		                empty (false)
		            }
		            else {
		                ref .value = '';
		                empty (true)
		            }
		        })

		        if (args .change__to)
		            ref .addEventListener ('change', function () {
		                args .change__to (ref .value)
		            })
		        if (args .input__to)
		            ref .addEventListener ('input', function () {
		                args .input__to (ref .value)
		            })

		        ref .addEventListener ('input', function () {
		            empty (! ref .value)
		        })
		        ref .addEventListener ('focus', function () {
		            focused (true)
		        })
		        ref .addEventListener ('blur', function () {
		            focused (false)
		        })
		    })

		    focused .thru (map, noop) .thru (map, noop) .thru (tap, self .render)
		    empty .thru (dropRepeats) .thru (map, noop) .thru (map, noop) .thru (tap, self .render)

	self .expressions = {};

	self .expressions [0] = function (_item) { return  empty ()  };
	self .expressions [1] = function (_item) { return  args .placeholder  };
	self .expressions [2] = function (_item) { return  args .type  };
	self .expressions [3] = function (_item) { return  args .maxlength  };
	self .expressions [4] = function (_item) { return  focused ()  };
	if (typeof self .update_strategy === "function") self .shouldUpdate = self .update_strategy;
	}) (this, this .opts);
});
riot.tag2('component-hamburger-button', '<icon-holder> <svg width="12px" height="16px" viewbox="0 0 12 16" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <title>three-bars</title> <desc>Created with Sketch.</desc> <defs></defs> <g id="Octicons" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="three-bars" fill="#000000"> <path d="M11.41,9 L0.59,9 C0,9 0,8.59 0,8 C0,7.41 0,7 0.59,7 L11.4,7 C11.99,7 11.99,7.41 11.99,8 C11.99,8.59 11.99,9 11.4,9 L11.41,9 Z M11.41,5 L0.59,5 C0,5 0,4.59 0,4 C0,3.41 0,3 0.59,3 L11.4,3 C11.99,3 11.99,3.41 11.99,4 C11.99,4.59 11.99,5 11.4,5 L11.41,5 Z M0.59,11 L11.4,11 C11.99,11 11.99,11.41 11.99,12 C11.99,12.59 11.99,13 11.4,13 L0.59,13 C0,13 0,12.59 0,12 C0,11.41 0,11 0.59,11 L0.59,11 Z" id="Shape"></path> </g> </g> </svg> </icon-holder>', '', '', function(opts) {
});
riot.tag2('component-input-control', '<input ref="{ref prefix}input" type="{expression:component-input-control:1}" placeholder="{expression:component-input-control:2}" maxlength="{expression:component-input-control:3}">', '', '', function(opts) {
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

		    var input = ref ('input')

		    input .thru (tap, function (ref) {
		        if (args .change__to)
		            ref .addEventListener ('change', function () {
		                args .change__to (ref .value)
		            })
		        if (args .input__to)
		            ref .addEventListener ('input', function () {
		                args .input__to (ref .value)
		            })
		    })

	self .expressions = {};

	self .expressions [0] = function (_item) { return  args .type  };
	self .expressions [1] = function (_item) { return  args .placeholder  };
	self .expressions [2] = function (_item) { return  args .maxlength  };
	if (typeof self .update_strategy === "function") self .shouldUpdate = self .update_strategy;
	}) (this, this .opts);
});
riot.tag2('component-item', '{ enter yield }<yield></yield>{ exit yield }', '', '', function(opts) {
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
riot.tag2('component-jersey-control-item', '<component-field-control type="text" placeholder="{expression:component-jersey-control-item:1}" val="{expression:component-jersey-control-item:2}" input__to="{expression:component-jersey-control-item:3}" change__to="{expression:component-jersey-control-item:4}"></component-field-control>', '', '', function(opts) {
	(function (self, args) {

	 self ._loaded = true;
	 self ._scope = function () {};
	var known_as = function (what) { return function (how) { log (self .root .localName, what, how);} };
	self .on ("update", function () {args = self .opts});

			var item = 	args .item__from
		                	.thru (dropRepeatsWith, json_equal)
		    var jersey = item;

		    var modifications =	stream ()
								    .thru (tap, function (mod) {
										args .modify__to (mod)
								    })

		    var input = stream ()
			input
				.thru (map, function (val) {
					if (val)
						return 	stream (val)
									.thru (delay (500))
									.thru (filter, function () {
										return ! jersey () .value
									})
									.thru (map, function () {
										return {
											action: 'assume',
											nth: args .nth__from ()
										}
									})
					else
						return 	stream ({
									action: 'delete',
									nth: args .nth__from ()
								})
				})
				.thru (switchLatest)
				.thru (tap, function (mod) {
					args .modify__to (mod)
				})

			var change = stream ()
			change
				.thru (filter, id)
				.thru (tap, function (value) {
					args .modify__to ({
						action: 'set',
						nth: args .nth__from (),
						value: value
					})
				})

			args .nth__from
				.thru (map, noop) .thru (tap, self .render)

	self .expressions = {};

	self .expressions [0] = function (_item) { return  jersey () .placeholder  };
	self .expressions [1] = function (_item) { return  jersey () .value  };
	self .expressions [2] = function (_item) { return  input  };
	self .expressions [3] = function (_item) { return  change  };
	if (typeof self .update_strategy === "function") self .shouldUpdate = self .update_strategy;
	}) (this, this .opts);
});
riot.tag2('component-jersey-control', '<component-dynamic-load-all items__from="{expression:component-jersey-control:1}"> <component-jersey-control-item nth__from="{expression:component-jersey-control:2}" item__from="{expression:component-jersey-control:3}" modify__to="{expression:component-jersey-control:4}"></component-jersey-control-item> </component-dynamic-load-all>', '', '', function(opts) {
	(function (self, args) {

	 self ._loaded = true;
	 self ._scope = function () {};
	var known_as = function (what) { return function (how) { log (self .root .localName, what, how);} };
	self .on ("update", function () {args = self .opts});

			var none_more = [];
			var one_more = [undefined];
			var more =	function (n) {
							return n <= 0 ? none_more : one_more .concat (more (n - 1))
						};

			var limit = 2;

			var jerseys_to = stream ();
			jerseys_to
				.thru (map, function (_jerseys) {
					return _jerseys .slice (0, limit)
				})
				.thru (dropRepeatsWith, json_equal)
				.thru (tap, function (_jerseys) {
					args .jerseys__to (_jerseys)
				})

			var items = mechanism (function () {
				return	args .jerseys__from () .concat (one_more) .slice (0, limit) .map (function (jersey, nth) {
							return	{
										placeholder: '第' + (nth + 1) + '隻球衣' + (nth < 2 ? '(例：黑白間、藍色)' : ''),
										value: jersey
									};
						})
			}, [ args .jerseys__from ]) .thru (tap, known_as ('items'))

			var modify = stream () .thru (tap, known_as ('modification'));
			modify
				.thru (tap, function (modification) {
					if (modification .action === 'delete')
						jerseys_to (
							args .jerseys__from () .slice (0, modification .nth)
								.concat (
									args .jerseys__from () .slice (modification .nth + 1)))
					else if (modification .action === 'assume') {
						if (modification .nth >= args .jerseys__from () .length)
							jerseys_to (
								args .jerseys__from () .concat (
									more (modification .nth - args .jerseys__from () .length + 1)))
					}
					else if (modification .action === 'set')
						jerseys_to (
							args .jerseys__from () .slice (0, modification .nth)
								.concat ([ modification .value ])
								.concat (
									args .jerseys__from () .slice (modification .nth + 1)))
				})

	self .expressions = {};

	self .expressions [0] = function (_item) { return  items  };
	self .expressions [1] = function (_item) { return  _item .nth__from  };
	self .expressions [2] = function (_item) { return  _item .item__from  };
	self .expressions [3] = function (_item) { return  modify  };
	if (typeof self .update_strategy === "function") self .shouldUpdate = self .update_strategy;
	}) (this, this .opts);
});
riot.tag2('component-jersey-picker', '<modal> <jersey ref="{ref prefix}first" if="{expression:component-jersey-picker:1}"> <label>{expression:component-jersey-picker:2}</label> </jersey> <jersey ref="{ref prefix}second" if="{expression:component-jersey-picker:3}"> <label>{expression:component-jersey-picker:4}</label> </jersey> <jersey ref="{ref prefix}free"> <component-field-control placeholder="其他球衣" input__to="{expression:component-jersey-picker:5}"></component-field-control> </jersey> </modal>', '', '', function(opts) {
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

		    var jersey = stream ([ '曼聯衫', '球衣二' ])
		    var free_jersey = stream ()

		    jersey
		        .thru (dropRepeatsWith, json_equal)
		        .thru (map, noop) .thru (tap, self .render)

		    var first = ref ('first')
		    var second = ref ('second')
		    var free = ref ('free')

		    first
		        .thru (tap, function (_ref) {
		            _ref .addEventListener ('click', function () {
		                if (args .jersey__to)
		                    args .jersey__to (jersey () [0])
		            })
		        })
		    second
		        .thru (tap, function (_ref) {
		            _ref .addEventListener ('click', function () {
		                if (args .jersey__to)
		                    args .jersey__to (jersey () [1])
		            })
		        })
		    free
		        .thru (tap, function (_ref) {
		            _ref .addEventListener ('click', function () {
		                if (args .jersey__to)
		                    args .jersey__to (free_jersey ())
		            })
		        })
		    free_jersey
		        .thru (tap, function () {
		            if (args .jersey__to)
		                args .jersey__to (free_jersey ())
		        })

	self .expressions = {};

	self .expressions [0] = function (_item) { return  jersey () [0]  };
	self .expressions [1] = function (_item) { return  jersey () [0]  };
	self .expressions [2] = function (_item) { return  jersey () [1]  };
	self .expressions [3] = function (_item) { return  jersey () [1]  };
	self .expressions [4] = function (_item) { return  free_jersey  };
	if (typeof self .update_strategy === "function") self .shouldUpdate = self .update_strategy;
	}) (this, this .opts);
});
riot.tag2('component-list-bar', '{ enter yield }<yield></yield>{ exit yield }', '', '', function(opts) {
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
riot.tag2('component-loader', '<component-modal-holder> <component-loading-item></component-loading-item> { enter yield }<yield></yield>{ exit yield } </component-modal-holder>', '', '', function(opts) {
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
riot.tag2('component-loading-item', '<div> <spinner></spinner> </div>', '', '', function(opts) {
});
riot.tag2('component-logout-button', '<span>Logout</span>', '', '', function(opts) {
});
riot.tag2('component-main-content', '<main-content-holder> <main-content> { enter yield }<yield></yield>{ exit yield } </main-content> </main-content-holder>', '', '', function(opts) {
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
riot.tag2('component-modal-holder', '<item> { enter yield }<yield></yield>{ exit yield } </item>', '', '', function(opts) {
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
riot.tag2('component-next-button', '<svg width="94" height="94" viewbox="0 0 94 94" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:figma="http://www.figma.com/figma/ns"><g id="Canvas" transform="translate(1295 700)" figma:type="canvas"><g id="Group" figma:type="frame"><g id="Vector" figma:type="vector"><use xlink:href="#6ea366ce-4e17-4e17-93d7-f4d7e769eb89" transform="translate(-1294.36 -699.24)" fill="#4FABFF"></use></g><g id="Vector" figma:type="vector"><use xlink:href="#89ff831e-7a6d-4de1-bf1d-4028308a94fe" transform="matrix(-1 0 0 1 -1229.07 -681.69)" fill="#FFFFFF"></use></g></g></g><defs><path id="6ea366ce-4e17-4e17-93d7-f4d7e769eb89" d="M 80.73 4.88281e-05L 12.0001 4.88281e-05C 5.37264 4.88281e-05 5.37109e-05 5.37263 5.37109e-05 12L 5.37109e-05 80.73C 5.37109e-05 87.3574 5.37264 92.73 12.0001 92.73L 80.73 92.73C 87.3575 92.73 92.73 87.3574 92.73 80.73L 92.73 12C 92.73 5.37263 87.3575 4.88281e-05 80.73 4.88281e-05Z"></path><path id="89ff831e-7a6d-4de1-bf1d-4028308a94fe" d="M 29.2 9.76563e-05L 29.2 58.39L 1.95312e-05 29.19L 29.2 9.76563e-05Z"></path></defs></svg>', '', '', function(opts) {
});
riot.tag2('component-pitch-picker', '<selected-location> <input type="text" placeholder="請選擇球場" riot-value="{expression:component-pitch-picker:1}" disabled readonly><a disabled="{expression:component-pitch-picker:2}" ref="{ref prefix}done"><svg width="1792" height="1792" viewbox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M1671 566q0 40-28 68l-724 724-136 136q-28 28-68 28t-68-28l-136-136-362-362q-28-28-28-68t28-68l136-136q28-28 68-28t68 28l294 295 656-657q28-28 68-28t68 28l136 136q28 28 28 68z"></path></svg ></a> </selected-location> <football-field-map ref="{ref prefix}map"></football-field-map>', '', '', function(opts) {
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

		    var location = stream () .thru (tap, known_as ('location'))
		    location
		         .thru (map, noop) .thru (tap, self .render)

		    ref ('done')
		        .thru (tap, [function (ref) {
		            ref .addEventListener ('click', function () {
		                if (location ()) {
		                    args .location__to (location ());
		                }
		            });
		        }])

		    ref ('map')
		        .thru (tap, [function (ref) {
		        }])

		    wait (500)
		        .then (function () {
		            location ('pitch here');
		        })

	self .expressions = {};

	self .expressions [0] = function (_item) { return  location ()  };
	self .expressions [1] = function (_item) { return  ! location ()  };
	if (typeof self .update_strategy === "function") self .shouldUpdate = self .update_strategy;
	}) (this, this .opts);
});
riot.tag2('component-prev-button', '<svg width="94" height="93" viewbox="0 0 94 93" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:figma="http://www.figma.com/figma/ns"><title>Group</title><desc>Created using Figma</desc><g id="Canvas" transform="translate(158 699)" figma:type="canvas"><g id="Group" figma:type="frame"><g id="Vector" figma:type="vector"><use xlink:href="#fe2ae1a3-28ca-4124-aaa8-007b41494fe6" transform="translate(-157.365 -698.995)" fill="#4FABFF"></use></g><g id="Vector" figma:type="vector"><use xlink:href="#24ce5aa5-81c0-42f7-97ba-a8180a42d963" transform="translate(-131.275 -681.445)" fill="#FFFFFF"></use></g></g></g><defs><path id="fe2ae1a3-28ca-4124-aaa8-007b41494fe6" d="M 80.73 4.88281e-05L 12.0001 4.88281e-05C 5.37264 4.88281e-05 5.37109e-05 5.37263 5.37109e-05 12L 5.37109e-05 80.73C 5.37109e-05 87.3574 5.37264 92.73 12.0001 92.73L 80.73 92.73C 87.3575 92.73 92.73 87.3574 92.73 80.73L 92.73 12C 92.73 5.37263 87.3575 4.88281e-05 80.73 4.88281e-05Z"></path><path id="24ce5aa5-81c0-42f7-97ba-a8180a42d963" d="M 29.2 9.76563e-05L 29.2 58.39L 1.95312e-05 29.19L 29.2 9.76563e-05Z"></path></defs></svg>', '', '', function(opts) {
});
riot.tag2('component-select-control', '{ enter yield }<yield></yield>{ exit yield }', '', '', function(opts) {
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
riot.tag2('component-separator-inline', '<item> <span></span> </item>', '', '', function(opts) {
});
riot.tag2('component-separator', '<hr>', '', '', function(opts) {
});
riot.tag2('component-snackbar', '<snackbar> <item> { enter yield }<yield></yield>{ exit yield } </item> </snackbar>', '', '', function(opts) {
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
riot.tag2('component-spacing-inline', '<stretcher riot-style="width: {expression:component-spacing-inline:1};"></stretcher>', '', '', function(opts) {
	(function (self, args) {

	 self ._loaded = true;
	 self ._scope = function () {};
	self .expressions = {};

	self .expressions [0] = function (_item) { return  args .width  };
	if (typeof self .update_strategy === "function") self .shouldUpdate = self .update_strategy;
	}) (this, this .opts);
});
riot.tag2('component-spacing', '<stretcher riot-style="width: 100%; height: {expression:component-spacing:1};"></stretcher>', '', '', function(opts) {
	(function (self, args) {

	 self ._loaded = true;
	 self ._scope = function () {};
	self .expressions = {};

	self .expressions [0] = function (_item) { return  args .height  };
	if (typeof self .update_strategy === "function") self .shouldUpdate = self .update_strategy;
	}) (this, this .opts);
});
riot.tag2('component-star-icon', '<icon-holder><svg width="1792" height="1792" viewbox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M1728 647q0 22-26 48l-363 354 86 500q1 7 1 20 0 21-10.5 35.5t-30.5 14.5q-19 0-40-12l-449-236-449 236q-22 12-40 12-21 0-31.5-14.5t-10.5-35.5q0-6 2-20l86-500-364-354q-25-27-25-48 0-37 56-46l502-73 225-455q19-41 49-41t49 41l225 455 502 73q56 9 56 46z"></path></svg ></icon-holder>', '', '', function(opts) {
});
riot.tag2('component-support-fab', '<floating> <action> <svg width="363" height="331" viewbox="0 0 363 331" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:figma="http://www.figma.com/figma/ns"> <title>Vector</title> <desc>Created using Figma</desc> <g id="Canvas" transform="translate(242 141)" figma:type="canvas"> <g id="Vector" style="mix-blend-mode:normal;" figma:type="vector"> <use xlink:href="#1d5ff2f8-fc3e-4911-842c-1a1f665cd660" transform="translate(-242 -140.826)" style="mix-blend-mode:normal;"></use> </g> </g> <defs> <path id="1d5ff2f8-fc3e-4911-842c-1a1f665cd660" d="M 277.73 77.949C 277.73 88.946 269.724 95.634 263.878 100.542C 261.664 102.401 257.543 105.793 257.554 107.06C 257.594 112.03 253.598 115.999 248.627 115.999C 248.602 115.999 248.577 115.999 248.552 115.999C 243.616 115.999 239.594 112.152 239.554 107.207C 239.475 97.46 246.588 91.623 252.304 86.824C 256.789 83.058 259.73 80.408 259.73 77.983C 259.73 73.074 255.736 69.08 250.827 69.08C 245.916 69.08 241.921 73.074 241.921 77.983C 241.921 82.954 237.892 86.983 232.921 86.983C 227.95 86.983 223.921 82.954 223.921 77.983C 223.921 63.149 235.99 51.08 250.825 51.08C 265.661 51.079 277.73 63.114 277.73 77.949ZM 248.801 124.307C 243.83 124.307 240 128.336 240 133.307L 240 133.376C 240 138.347 243.831 142.342 248.801 142.342C 253.771 142.342 257.801 138.278 257.801 133.307C 257.801 128.336 253.772 124.307 248.801 124.307ZM 67.392 187C 62.421 187 58.392 191.029 58.392 196C 58.392 200.971 62.421 205 67.392 205L 68.142 205C 73.113 205 77.142 200.971 77.142 196C 77.142 191.029 73.113 187 68.142 187L 67.392 187ZM 98.671 187C 93.7 187 89.671 191.029 89.671 196C 89.671 200.971 93.7 205 98.671 205L 99.42 205C 104.391 205 108.42 200.971 108.42 196C 108.42 191.029 104.391 187 99.42 187L 98.671 187ZM 363 43.251L 363 144.552C 363 168.537 343.768 188 319.783 188L 203.066 188C 200.784 188 198.905 187.987 197.333 187.954C 195.686 187.92 193.832 187.907 193.109 187.987C 192.356 188.487 190.51 190.178 188.731 191.817C 188.026 192.466 187.228 193.18 186.367 193.966L 153.345 224.064C 150.711 226.467 146.814 227.089 143.552 225.651C 140.29 224.212 138 220.982 138 217.417L 138 122L 43.72 122C 29.658 122 18 133.523 18 147.583L 18 248.884C 18 262.945 29.659 274 43.72 274L 174.094 274C 176.339 274 178.439 275.031 180.097 276.545L 207 301.349L 207 215.81C 207 210.839 211.029 206.81 216 206.81C 220.971 206.81 225 210.839 225 215.81L 225 321.748C 225 325.313 222.96 328.495 219.697 329.934C 218.53 330.449 217.358 330.652 216.131 330.652C 213.927 330.652 211.753 329.747 210.062 328.203L 170.605 291.999L 43.72 291.999C 19.734 291.999 0 272.869 0 248.883L 0 147.583C 0 123.598 19.734 104 43.72 104L 138 104L 138 43.251C 138 19.265 157.885 -2.13623e-07 181.871 -2.13623e-07L 319.784 -2.13623e-07C 343.768 -2.13623e-07 363 19.265 363 43.251ZM 345 43.251C 345 29.19 333.843 18 319.783 18L 181.871 18C 167.81 18 156 29.19 156 43.251L 156 113.084L 156 197.018L 174.095 180.665C 174.933 179.9 175.872 179.2 176.557 178.568C 184.82 170.954 186.934 169.737 197.712 169.959C 199.182 169.99 200.933 170.001 203.066 170.001L 319.783 170.001C 333.843 170.001 345 158.613 345 144.553L 345 43.251Z"></path> </defs> </svg> <component-wavify></component-wavify> </action> </floating>', '', '', function(opts) {
});
riot.tag2('component-table-control', '<span ref="{ref prefix}span">{expression:component-table-control:1}</span><svg ref="{ref prefix}svg" width="9" height="16" viewbox="0 0 9 16" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:figma="http://www.figma.com/figma/ns"><title>right-arrow</title><desc>Created using Figma</desc><g id="Canvas" transform="translate(734 258)" figma:type="canvas"><g id="right-arrow" style="mix-blend-mode:normal;" figma:type="frame"><g id="Group" style="mix-blend-mode:normal;" figma:type="frame"><g id="Vector" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#0b39f1b4-0614-4a28-a406-f607ebc22df0" transform="translate(-733.297 -256.973)" fill="#CCD1D1" style="mix-blend-mode:normal;"></use></g><g id="Vector" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#dd187232-741f-4707-87f3-4b5c131211ec" transform="translate(-733.721 -257.397)" fill="#CCD1D1" style="mix-blend-mode:normal;"></use></g></g></g></g><defs><path id="0b39f1b4-0614-4a28-a406-f607ebc22df0" d="M 0.8484 14.0484L -6.63757e-08 13.2L 6.1755 7.0242L -6.63757e-08 0.8484L 0.8484 1.02997e-08L 7.8726 7.0242L 0.8484 14.0484Z"></path><path id="dd187232-741f-4707-87f3-4b5c131211ec" d="M 1.2726 14.8968L 6.63757e-08 13.6242L 6.1755 7.4484L 6.63757e-08 1.2726L 1.2726 0L 8.7213 7.4484L 1.2726 14.8968ZM 0.8484 13.6242L 1.2726 14.0484L 7.8726 7.4484L 1.2726 0.8484L 0.8484 1.2726L 7.0239 7.4484L 0.8484 13.6242Z"></path></defs></svg> <fullscreen-holder active="{expression:component-table-control:2}"> { enter yield }<yield></yield>{ exit yield } </fullscreen-holder>', '', '', function(opts) {
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

			var span = ref ('span');
			var svg = ref ('svg')

			var picking = stream ();
				picking .thru (map, noop) .thru (tap, self .render);
				self .root .addEventListener ('click', function (e) {
					if (e .target === span () || e .target === svg ())
						picking (true);
				});

			var message = args .message__from;
			message
				.thru (delay, 150)
				.thru (tap, function () {
					picking (false);
				})

	self .expressions = {};

	self .expressions [0] = function (_item) { return  message () || '未輸入'  };
	self .expressions [1] = function (_item) { return  picking ()  };
	if (! self .update_strategy || self .update_strategy === "push") self .shouldUpdate = R .T;
	if (typeof self .update_strategy === "function") self .shouldUpdate = self .update_strategy;
	}) (this, this .opts);
});
riot.tag2('component-tag-control-item', '<a ref="{ref prefix}href"> <tag>{expression:component-tag-control-item:1}</tag> </a>', '', '', function(opts) {
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

			var item =	args .item__from
							.thru (dropRepeatsWith, json_equal)

			ref ('href') .thru (tap, function (_ref) {
				_ref .addEventListener ('click', function () {
					args .select__to (
						item ())
				})
			})

			item .thru (map, noop) .thru (tap, self .render)

	self .expressions = {};

	self .expressions [0] = function (_item) { return  item ()  };
	if (typeof self .update_strategy === "function") self .shouldUpdate = self .update_strategy;
	}) (this, this .opts);
});
riot.tag2('component-tag-control', '<placeholder empty="{expression:component-tag-control:1}">{expression:component-tag-control:2}</placeholder> <field> <component-dynamic-load-all items__from="{expression:component-tag-control:3}" no_reorder="true"> <component-tag-control-item item__from="{expression:component-tag-control:4}" select__to="{expression:component-tag-control:5}"></component-tag-control-item> </component-dynamic-load-all> <input ref="{ref prefix}input"> </field> <hr> <hr focused="{expression:component-tag-control:6}"> <tag-select-box focused="{expression:component-tag-control:7}"> <component-dynamic-load-all items__from="{expression:component-tag-control:8}" no_reorder="true"> <component-tag-control-item item__from="{expression:component-tag-control:9}" select__to="{expression:component-tag-control:10}"></component-tag-control-item> </component-dynamic-load-all> </tag-select-box>', '', '', function(opts) {
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

			var focused = stream ()
			var empty = stream (true)

			ref ('input') .thru (tap, function (ref) {
				ref .addEventListener ('input', function () {
					empty (! ref .value)
				})
				ref .addEventListener ('focus', function () {
					focused (true)
				})
				ref .addEventListener ('blur', function () {
					focused (false)
				})
			})

			var tags = stream (['asdf', 'asdfasdfasdf', 'sdfgdsfgdsjfgl;dsgf', 'sfgh', 'asdfa', 'qwrt'])
			var selected_tags =	stream ([])
									.thru (tap, function (_selected) {
										if (args .tags__to)
											args .tags__to (_selected)
										empty (_selected .length ? true : false)
									})

			var select =	stream ()
								.thru (tap, function (tag) {
									tags (tags () .filter (
										R. pipe (
											R. equals (tag), R .not)))
									selected_tags (selected_tags () .concat ([tag]))
								})
			var delete_ =	stream ()
								.thru (tap, function (tag) {
									tags (tags () .concat ([tag]));
									selected_tags (selected_tags () .filter (
										R. pipe (
											R. equals (tag), R .not)));
								})

			focused .thru (map, noop) .thru (map, noop) .thru (tap, self .render)
			empty .thru (dropRepeats) .thru (map, noop) .thru (map, noop) .thru (tap, self .render)

	self .expressions = {};

	self .expressions [0] = function (_item) { return  empty ()  };
	self .expressions [1] = function (_item) { return  args .placeholder  };
	self .expressions [2] = function (_item) { return  selected_tags  };
	self .expressions [3] = function (_item) { return  _item .item__from  };
	self .expressions [4] = function (_item) { return  delete_  };
	self .expressions [5] = function (_item) { return  focused ()  };
	self .expressions [6] = function (_item) { return  focused ()  };
	self .expressions [7] = function (_item) { return  tags  };
	self .expressions [8] = function (_item) { return  _item .item__from  };
	self .expressions [9] = function (_item) { return  select  };
	if (typeof self .update_strategy === "function") self .shouldUpdate = self .update_strategy;
	}) (this, this .opts);
});
riot.tag2('component-timeslot-highlight', '<soon-highlight if="{expression:component-timeslot-highlight:1}"> {expression:component-timeslot-highlight:2} {expression:component-timeslot-highlight:3} {expression:component-timeslot-highlight:4} </soon-highlight> <month-highlight if="{expression:component-timeslot-highlight:5}"> {expression:component-timeslot-highlight:6} </month-highlight> <day-highlight if="{expression:component-timeslot-highlight:7}"> {expression:component-timeslot-highlight:8} </day-highlight> <day-of-week-highlight> {expression:component-timeslot-highlight:9} </day-of-week-highlight> <time-highlight> {expression:component-timeslot-highlight:10} </time-highlight>', '', '', function(opts) {
	(function (self, args) {

	 self ._loaded = true;
	 self ._scope = function () {};
	var known_as = function (what) { return function (how) { log (self .root .localName, what, how);} };
	self .on ("update", function () {args = self .opts});

			var time = function () {
				var date_time = new Date (args .timeslot__from ());
				return (function (am_pm) {
					if (am_pm === 'AM') return '上午'
					if (am_pm === 'PM') return '下午'
				}) (fecha .format (date_time, 'A')) + ' ' + fecha .format (date_time, 'h:mm');
			}
		    var month = function () {

		        return fecha .format (new Date (args .timeslot__from ()), 'M月');
		    }
		    var day = function () {

		        return fecha .format (new Date (args .timeslot__from ()), 'D');
		    }
		    var day_of_week = function () {

		        return '週' + day_of_week_to_chi (new Date (args .timeslot__from ()));
		    }
		    var how_soon = function () {
				return day_difference (fecha .format (new Date (), 'YYYY-MM-DD'), fecha .format (args .timeslot__from (), 'YYYY-MM-DD'));
		    }
		    var soon = function () {
				return how_soon () < 3;
		    }

		    args .timeslot__from .thru (map, noop) .thru (tap, self .render)

	self .expressions = {};

	self .expressions [0] = function (_item) { return  soon ()  };
	self .expressions [1] = function (_item) { return  Math .floor (how_soon ()) === 2 && '後天' || ''  };
	self .expressions [2] = function (_item) { return  Math .floor (how_soon ()) === 1 && '明天' || ''  };
	self .expressions [3] = function (_item) { return  Math .floor (how_soon ()) === 0 && '今天' || ''  };
	self .expressions [4] = function (_item) { return  ! soon ()  };
	self .expressions [5] = function (_item) { return  month ()  };
	self .expressions [6] = function (_item) { return  ! soon ()  };
	self .expressions [7] = function (_item) { return  day ()  };
	self .expressions [8] = function (_item) { return  day_of_week ()  };
	self .expressions [9] = function (_item) { return  time ()  };
	if (typeof self .update_strategy === "function") self .shouldUpdate = self .update_strategy;
	}) (this, this .opts);
});
riot.tag2('component-timeslot-picker', '<modal> <start> <hour> <input riot-value="{expression:component-timeslot-picker:1}" pattern="d*" step="1" min="1" max="12" readonly="true"> <label up ref="{ref prefix}start-hour-up"></label> <label down ref="{ref prefix}start-hour-down"></label> </hour> <separator>:</separator> <minutes> <input riot-value="{expression:component-timeslot-picker:2}" pattern="d*" step="1" min="1" max="12" readonly="true"> <label up ref="{ref prefix}start-minute-up"></label> <label down ref="{ref prefix}start-minute-down"></label> </minutes> <label ref="{ref prefix}start-ampm-toggle">{expression:component-timeslot-picker:3}</label> </start> <end> <hour> <input riot-value="{expression:component-timeslot-picker:4}" pattern="d*" step="1" min="1" max="12" readonly="true"> <label up ref="{ref prefix}end-hour-up"></label> <label down ref="{ref prefix}end-hour-down"></label> </hour> <separator>:</separator> <minutes> <input riot-value="{expression:component-timeslot-picker:5}" pattern="d*" step="1" min="1" max="12" readonly="true"> <label up ref="{ref prefix}end-minute-up"></label> <label down ref="{ref prefix}end-minute-down"></label> </minutes> <label ref="{ref prefix}end-ampm-toggle">{expression:component-timeslot-picker:6}</label> </end> </modal>', '', '', function(opts) {
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

		    var start_hour = stream (7)
		    var start_minute = stream (30)
		    var start_ampm = stream ('PM')
		    var end_hour = stream (9)
		    var end_minute = stream (0)
		    var end_ampm = stream ('PM')

		    var start_hour_up = ref ('start-hour-up')
		    var start_hour_down = ref ('start-hour-down')
		    var start_minute_up = ref ('start-minute-up')
		    var start_minute_down = ref ('start-minute-down')
		    var start_ampm_toggle = ref ('start-ampm-toggle')
		    var end_hour_up = ref ('end-hour-up')
		    var end_hour_down = ref ('end-hour-down')
		    var end_minute_up = ref ('end-minute-up')
		    var end_minute_down = ref ('end-minute-down')
		    var end_ampm_toggle = ref ('end-ampm-toggle')

		    mergeAll ([
		        start_hour, start_minute, start_ampm,
		        end_hour, end_minute, end_ampm
		    ])
		    .thru (map, noop) .thru (tap, self .render)
		    .thru (tap, function () {
		        if (args .timeslot__to)
		            args .timeslot__to ({
		                start: ('0' + start_hour ()) .slice (-2) + ':' + ('0' + start_minute ()) .slice (-2) + ' ' + start_ampm (),
		                end: ('0' + end_hour ()) .slice (-2) + ':' + ('0' + end_minute ()) .slice (-2) + ' ' + end_ampm ()
		            })
		    })

		    start_hour_up .thru (tap, function (ref) {
		        ref .addEventListener ('click', function () {
		            start_hour (
		                (start_hour () % 12) + 1)
		        })
		    })
		    start_hour_down .thru (tap, function (ref) {
		        ref .addEventListener ('click', function () {
		            start_hour (
		                (start_hour () - 1) || 12)
		        })
		    })
		    start_minute_up .thru (tap, function (ref) {
		        ref .addEventListener ('click', function () {
		            start_minute (
		                (start_minute () + 30) % 60)
		        })
		    })
		    start_minute_down .thru (tap, function (ref) {
		        ref .addEventListener ('click', function () {
		            start_minute (
		                (start_minute () + 30) % 60)
		        })
		    })
		    start_ampm_toggle .thru (tap, function (ref) {
		        ref .addEventListener ('click', function () {
		            start_ampm (
		                start_ampm () === 'AM' ? 'PM' : 'AM')
		        })
		    })
		    end_hour_up .thru (tap, function (ref) {
		        ref .addEventListener ('click', function () {
		            end_hour (
		                (end_hour () % 12) + 1)
		        })
		    })
		    end_hour_down .thru (tap, function (ref) {
		        ref .addEventListener ('click', function () {
		            end_hour (
		                (end_hour () - 1) || 12)
		        })
		    })
		    end_minute_up .thru (tap, function (ref) {
		        ref .addEventListener ('click', function () {
		            end_minute (
		                (end_minute () + 30) % 60)
		        })
		    })
		    end_minute_down .thru (tap, function (ref) {
		        ref .addEventListener ('click', function () {
		            end_minute (
		                (end_minute () + 30) % 60)
		        })
		    })
		    end_ampm_toggle .thru (tap, function (ref) {
		        ref .addEventListener ('click', function () {
		            end_ampm (
		                end_ampm () === 'AM' ? 'PM' : 'AM')
		        })
		    })

	self .expressions = {};

	self .expressions [0] = function (_item) { return  ('0' + start_hour ()) .slice (-2)  };
	self .expressions [1] = function (_item) { return  ('0' + start_minute ()) .slice (-2)  };
	self .expressions [2] = function (_item) { return  start_ampm ()  };
	self .expressions [3] = function (_item) { return  ('0' + end_hour ()) .slice (-2)  };
	self .expressions [4] = function (_item) { return  ('0' + end_minute ()) .slice (-2)  };
	self .expressions [5] = function (_item) { return  end_ampm ()  };
	if (typeof self .update_strategy === "function") self .shouldUpdate = self .update_strategy;
	}) (this, this .opts);
});
riot.tag2('component-tree-control-item', '<item ref="{ref prefix}item"> <status> <svg if="{expression:component-tree-control-item:1}" viewbox="0 0 24 24"><path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"></path></svg> <svg if="{expression:component-tree-control-item:2}" viewbox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2z"></path></svg> <svg if="{expression:component-tree-control-item:3}" viewbox="0 0 24 24"><path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path></svg> </status> <label>{expression:component-tree-control-item:4}</label> <branch-status if="{expression:component-tree-control-item:5}"> <button type="button"> <svg if="{expression:component-tree-control-item:6}" viewbox="0 0 24 24"><path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z"></path></svg> <svg if="{expression:component-tree-control-item:7}" viewbox="0 0 24 24"><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"></path></svg> <component-wavify center></component-wavify> </button> </branch-status> <component-wavify></component-wavify> </item> <branch if="{expression:component-tree-control-item:8}"> <component-tree-control items__from="{expression:component-tree-control-item:9}" items__to="{expression:component-tree-control-item:10}"></component-tree-control> </branch>', '', '', function(opts) {
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

			var zeroed =	one_cache (function (tree) {
								if (typeof tree === 'boolean') {
									return ! tree;
								}
								else {
									var list = Object .keys (tree);
									for (var nth = 0; nth < list .length; nth ++) {
										var item = list [nth];
										if (! zeroed (tree [item]))
											return false;
									}
									return true;
								}
							});
			var filled = 	one_cache (function (tree) {
								if (typeof tree === 'boolean') {
									return tree;
								}
								else {
									var list = Object .keys (tree);
									for (var nth = 0; nth < list .length; nth ++) {
										var item = list [nth];
										if (! filled (tree [item]))
											return false;
									}
									return true;
								}
							});
			var tree = args .item__from  .thru (dropRepeatsWith, json_equal);
				tree .thru (map, noop) .thru (tap, self .render)

		    var name = mechanism (function () {
		        return tree () .name;
		    }, [tree])
		    var status = mechanism (function () {
		        return tree () .status;
		    }, [tree])

		    var empty = mechanism (function () {
		        return zeroed (status ());
		    }, [status])
		    var half = mechanism (function () {
		        return ! zeroed (status ()) && ! filled (status ());
		    }, [status])
		    var full = mechanism (function () {
		        return filled (status ());
		    }, [status])

		    var branched = mechanism (function () {
		        return typeof status () !== 'boolean';
		    }, [status])
		    var branch_open = mechanism (function () {
		        return typeof status () !== 'boolean' && ! zeroed (status ());
		    }, [status])

		    ref ('item')
				.thru (tap, function (ref) {
					ref .addEventListener ('click', function () {
						toggle ('click');
					}, true)
				});

			var zero =	function (inp) {
							if (typeof inp === 'boolean') {
								return false;
							}
							else {
								var list = Object .keys (inp);
								var tree = {};
								for (var nth = 0; nth < list .length; nth ++) {
									var item = list [nth];
									tree [item] = zero (inp [item]);
								}
								return tree;
							}
						};
			var fill =	function (inp) {
							if (typeof inp === 'boolean') {
								return true;
							}
							else {
								var list = Object .keys (inp);
								var tree = {};
								for (var nth = 0; nth < list .length; nth ++) {
									var item = list [nth];
									tree [item] = fill (inp [item]);
								}
								return tree;
							}
						};

			var toggle = stream () .thru (tap, known_as ('toggle'))
				.thru (tap, function () {
					var _name = name ();
					var _status = status ();
					args .substitute__to ({
						item: _name,
						sub: zeroed (_status) ? fill (_status) : zero (_status)
					})
				});

			var modifications =	stream () .thru (tap, known_as ('modify'))
				.thru (tap, function (sub) {
					args .substitute__to ({
						item: name (),
						sub: sub
					})
				})

	self .expressions = {};

	self .expressions [0] = function (_item) { return  empty ()  };
	self .expressions [1] = function (_item) { return  half ()  };
	self .expressions [2] = function (_item) { return  full ()  };
	self .expressions [3] = function (_item) { return  name ()  };
	self .expressions [4] = function (_item) { return  branched ()  };
	self .expressions [5] = function (_item) { return  ! empty ()  };
	self .expressions [6] = function (_item) { return  empty ()  };
	self .expressions [7] = function (_item) { return  branch_open ()  };
	self .expressions [8] = function (_item) { return  status  };
	self .expressions [9] = function (_item) { return  modifications  };
	if (typeof self .update_strategy === "function") self .shouldUpdate = self .update_strategy;
	}) (this, this .opts);
});
riot.tag2('component-tree-control', '<component-dynamic-load-all items__from="{expression:component-tree-control:1}"> <component-tree-control-item item__from="{expression:component-tree-control:2}" substitute__to="{expression:component-tree-control:3}"></component-tree-control-item> </component-dynamic-load-all>', '', '', function(opts) {
	(function (self, args) {

	 self ._loaded = true;
	 self ._scope = function () {};
	var known_as = function (what) { return function (how) { log (self .root .localName, what, how);} };
	self .on ("update", function () {args = self .opts});

			var tree = 	args .items__from
							.thru (dropRepeatsWith, json_equal)
			var items = mechanism (function () {
					return 	Object .keys (tree ()) .map (function (name) {
								return 	{
											name: name,
											status: tree () [name]
										};
							});
				}, [tree])

			var substitute = 	stream ()
									.thru (tap, function (_sub) {
										if (! json_equal (tree () [_sub .item], _sub .sub))
											args .items__to (with_ (_sub .item, _sub .sub) (tree ()))
									})

	self .expressions = {};

	self .expressions [0] = function (_item) { return  items  };
	self .expressions [1] = function (_item) { return  _item .item__from  };
	self .expressions [2] = function (_item) { return  substitute  };
	if (typeof self .update_strategy === "function") self .shouldUpdate = self .update_strategy;
	}) (this, this .opts);
});
riot.tag2('component-wavify', '', '', '', function(opts) {
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
riot.tag2('component-x-button', '<icon-holder><svg width="13" height="13" viewbox="0 0 13 13" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:figma="http://www.figma.com/figma/ns"><title>cancel</title><desc>Created using Figma</desc><g id="Canvas" transform="translate(1022 334)" figma:type="canvas"><g id="cancel" style="mix-blend-mode:normal;" figma:type="frame"><g id="Group" style="mix-blend-mode:normal;" figma:type="frame"><g id="Vector" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#1c8fcd43-ce74-4b25-b1b4-2f698b0c61a8" transform="translate(-1022 -334)" fill="#5DADE2" style="mix-blend-mode:normal;"></use></g></g></g></g><defs><path id="1c8fcd43-ce74-4b25-b1b4-2f698b0c61a8" d="M 5.87831 6.50199L 0.123962 12.2965C -0.0359037 12.4575 -0.0359037 12.7183 0.123962 12.8793C 0.203793 12.9599 0.30861 13 0.413223 13C 0.51804 13 0.622653 12.9599 0.702484 12.8793L 6.5001 7.04119L 12.2977 12.8793C 12.3778 12.9599 12.4824 13 12.587 13C 12.6916 13 12.7964 12.9599 12.8762 12.8793C 13.0361 12.7183 13.0361 12.4575 12.8762 12.2965L 7.12209 6.50199L 12.8801 0.703352C 13.04 0.54237 13.04 0.281566 12.8801 0.120583C 12.7202 -0.0401945 12.4612 -0.0401945 12.3016 0.120583L 6.5003 5.96279L 0.698422 0.120788C 0.538556 -0.0399899 0.279765 -0.0399899 0.119899 0.120788C -0.0399664 0.28177 -0.0399664 0.542574 0.119899 0.703557L 5.87831 6.50199Z"></path></defs></svg ></icon-holder>', '', '', function(opts) {
});
riot.tag2('page-account-courses', '<component-custom-nav> <nav-buttons> <a icon> <component-custom-hamburger></component-custom-hamburger> </a> </nav-buttons> <nav-title>Courses</nav-title> </component-custom-nav> <component-main-content> <items> <my-highscore> <label>Your score is:</label> <score>29</score> </my-highscore> <highscores> <highscore><label>Champion</label><item>John Huen: 179</item></highscore> <highscore><label>First Runner-up</label><item>John Huen: 169</item></highscore> <highscore><label>Second Runner-up</label><item>John Huen: 168</item></highscore> </highscores> </items> </component-main-content> <component-custom-tabs tab="courses"></component-custom-tabs>', '', '', function(opts) {
});
riot.tag2('page-account-quiz-subcategory', '<component-custom-nav> <nav-buttons> <a href="#account/quizes" icon> <component-back-button></component-back-button> </a> </nav-buttons> <nav-title>Points: {expression:page-account-quiz-subcategory:1}/20</nav-title> </component-custom-nav> <component-main-content> <items> <number> <label>Q{expression:page-account-quiz-subcategory:2}.</label> </number> <label>{expression:page-account-quiz-subcategory:3}</label> <image-holder if="{expression:page-account-quiz-subcategory:4}"><img riot-src="{expression:page-account-quiz-subcategory:5}"></image-holder> <component-spacing height="20px"></component-spacing> <guesses> <guess><a href="#account/quiz/subcategory/#{expression:page-account-quiz-subcategory:6}">{expression:page-account-quiz-subcategory:7}</a></guess> <guess><a href="#account/quiz/subcategory/#{expression:page-account-quiz-subcategory:8}">{expression:page-account-quiz-subcategory:9}</a></guess> <guess><a href="#account/quiz/subcategory/#{expression:page-account-quiz-subcategory:10}">{expression:page-account-quiz-subcategory:11}</a></guess> <guess><a href="#account/quiz/subcategory/#{expression:page-account-quiz-subcategory:12}">{expression:page-account-quiz-subcategory:13}</a></guess> </guesses> </items> </component-main-content>', '', '', function(opts) {
	(function (self, args) {

	 self ._loaded = true;
	 self ._scope = function () {};
	var known_as = function (what) { return function (how) { log (self .root .localName, what, how);} };
	self .on ("update", function () {args = self .opts});

			self .temp = true;

			var questions_items = stream ();

			var category = parse (args [0]);
			var points = parse (args [1]) || 0;
			var nth = parse (args [2]) || 1;

			var questions_in_category = mechanism (function () {
				return 	questions_items () .filter (function (item) {
							return item .category === category
						})
			}, [questions_items])
			var question = mechanism (function () {
				var pool = questions_in_category ();
				return pool [Math .floor (Math .random () * pool .length)] .question
			}, [questions_in_category])
			var text = mechanism (function () {
				return question () .text
			}, [question])
			var answer = mechanism (function () {
				return question () .answer
			}, [question])
			var traps = mechanism (function () {
				return question () .traps
			}, [question])
			var image = mechanism (function () {
				return question () .image
			}, [question])

			var guesses =	mechanism (function () {
								var array = [answer ()] .concat (traps ());

								var currentIndex = array .length
								var temporaryValue
								var randomIndex;

								while (0 !== currentIndex) {

									randomIndex = Math .floor (Math .random () * currentIndex);
									currentIndex -= 1;

									temporaryValue = array [currentIndex];
									array [currentIndex] = array [randomIndex];
									array [randomIndex] = temporaryValue;
								}

								return array;
							}, [question]) .thru (begins_with, [[]])

			var points_for = function (guess) {
				return guesses () [guess] === answer () ? 1 : 0
			}

			question .thru (map, noop) .thru (tap, self .render)

			args .cycle__from
				.thru (tap, function () {
					last_or_inquire (api () .questions)
						.then (function (items) {
							questions_items (items)
						})
				})

	self .expressions = {};

	self .expressions [0] = function (_item) { return  points  };
	self .expressions [1] = function (_item) { return  nth  };
	self .expressions [2] = function (_item) { return  text ()  };
	self .expressions [3] = function (_item) { return  image ()  };
	self .expressions [4] = function (_item) { return  image ()  };
	self .expressions [5] = function (_item) { return  [ category, points + points_for (0), nth + 1 ] .map (stringify) .join ('/')  };
	self .expressions [6] = function (_item) { return  guesses () [0]  };
	self .expressions [7] = function (_item) { return  [ category, points + points_for (1), nth + 1 ] .map (stringify) .join ('/')  };
	self .expressions [8] = function (_item) { return  guesses () [1]  };
	self .expressions [9] = function (_item) { return  [ category, points + points_for (2), nth + 1 ] .map (stringify) .join ('/')  };
	self .expressions [10] = function (_item) { return  guesses () [2]  };
	self .expressions [11] = function (_item) { return  [ category, points + points_for (3), nth + 1 ] .map (stringify) .join ('/')  };
	self .expressions [12] = function (_item) { return  guesses () [3]  };
	if (typeof self .update_strategy === "function") self .shouldUpdate = self .update_strategy;
	}) (this, this .opts);
});
riot.tag2('page-account-quizes', '<component-custom-nav> <nav-buttons> <a icon> <component-custom-hamburger></component-custom-hamburger> </a> </nav-buttons> <nav-title>Ready to code?</nav-title> <nav-buttons> <a href="#home"> <component-logout-button></component-logout-button> </a> </nav-buttons> </component-custom-nav> <component-main-content> <items> <component-spacing height="10px"></component-spacing> <label> Choose a quiz! </label> <component-spacing height="20px"></component-spacing> <component-item if="{expression:page-account-quizes:1}">Fetching quizes...</component-item> <component-loading-item if="{expression:page-account-quizes:2}"></component-loading-item> <component-item if="{expression:page-account-quizes:3}">No courses found :(</component-item> <component-dynamic-load items_to_load="13" interval_for_loading="50" item_height="{expression:page-account-quizes:4}" items__from="{expression:page-account-quizes:5}"> <component-custom-subcategory-item item__from="{expression:page-account-quizes:6}"> </component-dynamic-load> </items> </component-main-content> <component-custom-tabs tab="quizes"></component-custom-tabs>', '', '', function(opts) {
	(function (self, args) {

	 self ._loaded = true;
	 self ._scope = function () {};
	var known_as = function (what) { return function (how) { log (self .root .localName, what, how);} };
	self .on ("update", function () {args = self .opts});

			args .cycle__from
				.thru (tap, function () {
					last_or_inquire (api () .questions)
						.then (questions_info)
				})
			var questions_info = stream ()
			var subcategories =	questions_info
									.thru (map, function (question_list) {
										var categories = {};
										question_list .forEach (function (question) {
											categories [question .category] = true;
										});
										return 	Object .keys (categories)
													.sort (function (a, b) {
														return a > b;
													})
													.map (function (category) {
														return { category: category };
													});
									})
									.thru (delay, 400)
									.thru (dropRepeatsWith, json_equal)

			var item_height = 	function (item) {
									return 135;
								}

			var status =	mechanism (function () {
								if (subcategories () .length)
									return 'loaded';
								else
									return 'no-items'
							}, [subcategories])
							.thru (_begins_with, 'loading')

			status .thru (map, noop) .thru (tap, self .render)

	self .expressions = {};

	self .expressions [0] = function (_item) { return  status () === 'loading'  };
	self .expressions [1] = function (_item) { return  status () === 'loading'  };
	self .expressions [2] = function (_item) { return  status () === 'no-items'  };
	self .expressions [3] = function (_item) { return  item_height  };
	self .expressions [4] = function (_item) { return  subcategories  };
	self .expressions [5] = function (_item) { return  _item .item__from  };
	if (typeof self .update_strategy === "function") self .shouldUpdate = self .update_strategy;
	}) (this, this .opts);
});
riot.tag2('page-account-subaccount-create', '<component-custom-nav> <nav-buttons> <a href="#account/profile" icon> <component-back-button></component-back-button> </a> </nav-buttons> <nav-title>Create New Player</nav-title> </component-custom-nav> <component-main-content> <items> <label> Please enter your email and create a password </label> <component-spacing height="20px"></component-spacing> <label>User Name:</label> <component-field-control type="text" placeholder="First Name" input__to=":firstname"></component-field-control> <component-field-control type="text" placeholder="Last Name" input__to=":lastname"></component-field-control> <label>Date of Birth:</label> <component-field-control placeholder="{expression:page-account-subaccount-create:1}" input__to="{expression:page-account-subaccount-create:2}" ref="{ref prefix}date-of-birth" readonly></component-field-control> <fullscreen-holder active="{expression:page-account-subaccount-create:3}"> <component-modal-holder> <component-date-picker date__to="{expression:page-account-subaccount-create:4}"></component-date-picker> </component-modal-holder> </fullscreen-holder> <label>Nationality:</label> <component-field-control type="password" placeholder="" input__to="{expression:page-account-subaccount-create:5}"></component-field-control> <label>School:</label> <component-field-control type="text" placeholder="" input__to="{expression:page-account-subaccount-create:6}"></component-field-control> <component-spacing height="40px"></component-spacing> <component-action> <a ref="{ref prefix}action" href="#account/quizes">Create</a> </component-action> <terms-of-agreement> <item> <component-checkbox check__to="{expression:page-account-subaccount-create:7}"></component-checkbox> </item> <label> I agree with the <a href="#disclaimer">Disclaimers and Terms of Agreement</a> </label> </terms-of-agreement> </items> </component-main-content> <component-custom-tabs tab="profile"></component-custom-tabs>', '', '', function(opts) {
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

			self .temp = true;

			var email = stream ();
			var password = stream ();
			var date_of_birth = stream ();
			var agree = stream ();

			var picking_date_of_birth = stream ();
			picking_date_of_birth .thru (map, noop) .thru (tap, self .render);

			ref ('date-of-birth')
				.thru (tap, function (ref) {
					ref .addEventListener ('click', function (e) {
						picking_date_of_birth (true);
					})
				})

			date_of_birth
				.thru (delay, 150)
				.thru (tap, function () {
					picking_date_of_birth (false);
				})

			ref ('action')
				.thru (tap, function (_ref) {
					var errors =	function () {
										if (! valid_email (email ()))
											return 'Please enter a valid email address';
										if (! password ())
											return 'Please enter a password'
										if (password () .length < 8)
											return 'Please enter a password of at least 8 characters'
										if (! agree ())
											return 'You must agree to the terms of agreement'
									}
					_ref .addEventListener ('click', function (e) {
						e .preventDefault ();
						var _errors = errors ();
						if (_errors)
							toast (_errors)
						else {
							inquire (api () .register, {
								email: email (),
								password: password ()
							})
								.then (function () {
									window .location .hash = _ref .hash;
								})
								.catch (function (err) {
									if (err === 'unsuccessful')
										toast ('This email has already been registered')
									else
										return Promise .reject (err)
								})
						}
					})
				})

	self .expressions = {};

	self .expressions [0] = function (_item) { return  date_of_birth  };
	self .expressions [1] = function (_item) { return  date_of_birth  };
	self .expressions [2] = function (_item) { return  picking_date_of_birth  };
	self .expressions [3] = function (_item) { return  date_of_birth  };
	self .expressions [4] = function (_item) { return  nationality  };
	self .expressions [5] = function (_item) { return  school  };
	self .expressions [6] = function (_item) { return  agree  };
	if (typeof self .update_strategy === "function") self .shouldUpdate = self .update_strategy;
	}) (this, this .opts);
});
riot.tag2('page-login', '<component-custom-nav> <nav-buttons> <a href="#home" icon> <component-back-button></component-back-button> </a> </nav-buttons> <nav-title>Login</nav-title> </component-custom-nav> <component-main-content> <items> <component-field-control placeholder="Email" type="email"></component-field-control> <component-field-control type="password" placeholder="Password"></component-field-control> <a href="#forget"> Forget Password? </a> <component-spacing height="40px"></component-spacing> <component-action> <a href="#account/ranking">Login</a> </component-action> </items> </component-main-content>', '', '', function(opts) {
});
riot.tag2('page-register', '<component-custom-nav> <nav-buttons> <a href="#home" icon> <component-back-button></component-back-button> </a> </nav-buttons> <nav-title>Register</nav-title> </component-custom-nav> <component-main-content> <items> <label>Please enter your email and create a password</label> <component-spacing height="20px"></component-spacing> <from> <label>Email:</label> <component-field-control input__to="{expression:page-register:1}" type="email"></component-field-control> </from> <from> <label>Create a password:</label> <component-field-control type="password" input__to="{expression:page-register:2}"></component-field-control> </from> <from> <label>Confirm your password:</label> <component-field-control type="password" input__to="{expression:page-register:3}"></component-field-control> </from> <component-spacing height="40px"></component-spacing> <component-action> <a ref="{ref prefix}action" href="#portal">Create</a> </component-action> <terms-of-agreement> <item> <component-checkbox check__to="{expression:page-register:4}"></component-checkbox> </item> <label> I agree with the <a href="#disclaimer">Disclaimers and Terms of Agreement</a> </label> </terms-of-agreement> </items> </component-main-content>', '', '', function(opts) {
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

			self .temp = true;

			var email = stream ();
			var password = stream ();
			var password_copy = stream ();
			var agree_toa = stream ();

			ref ('action')
				.thru (tap, function (_ref) {
					var errors =	function () {
										if (! valid_email (email ()))
											return 'Please enter a valid email address';
										if (! password ())
											return 'Please enter a password'
										if (password () .length < 8)
											return 'Please enter a password of at least 8 characters'
										if (password () !== password_copy ())
											return 'Please make sure the passwords match'
										if (! agree_toa ())
											return 'You must agree to the terms of agreement'
									}
					_ref .addEventListener ('click', function (e) {
						e .preventDefault ();
						var _errors = errors ();
						if (_errors)
							toast (_errors)
						else {
							inquire (api () .register, {
								email: email (),
								password: password ()
							})
								.then (function () {
									window .location .hash = _ref .hash;
								})
								.catch (function (err) {
									if (err === 'unsuccessful')
										toast ('This email has already been registered')
									else
										return Promise .reject (err)
								})
						}
					})
				})

	self .expressions = {};

	self .expressions [0] = function (_item) { return  email  };
	self .expressions [1] = function (_item) { return  password  };
	self .expressions [2] = function (_item) { return  password_copy  };
	self .expressions [3] = function (_item) { return  agree_toa  };
	if (typeof self .update_strategy === "function") self .shouldUpdate = self .update_strategy;
	}) (this, this .opts);
});
