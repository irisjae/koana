riot.tag2('body', '', '', '', function(opts) {
	(function (self, args, my) {

	 var refs = stream ();
			self
				.thru (
					reframe, api);

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

			self
				.establish (':exception', constant (
					from (function (errors) {
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

					})
				))

				.remembers ('page-cache', {})
				.remembers ('page-cycle', function (id) {
					var cycle_label = ':page-cycle:' + id;
					if (! self .personal (cycle_label)) {
						self .remembers (cycle_label);
					}

					return cycle_label;
				})

				.establish (':page', constant (
					from (function (nav) {
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
							return Promise .resolve (my (':page'))
								.then (function (prev) {
									var time = new Date ()

									if (my ('page-cache') [new_page .id]) {
										var curr = my ('page-cache') [new_page .id];
									}
									else {
										var _tag_label = tag_label (new_page .name);
										var root = document .createElement (_tag_label);
										var curr = 	retaining (new_page) (
														riot .mount (root, _tag_label, {
															params: new_page .params,
															parent: self,
															cycle__from: my ('page-cycle') (new_page .id)
														}) [0]);

										if (self .isMounted) {
											self .renders .push ('now');
											self .update ();
											self .renders .pop ();
										}
									}

									var cycle_label = my ('page-cycle') (curr .id);
									var new_cycle = stream ();
									self .mention (cycle_label, new_cycle);
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
										var last_cycle_label = my ('page-cycle') (prev .id);
										self .impression (last_cycle_label) .end (true);
									}

									log ('process page time ' + (new Date () - time) + 'ms', curr);
									return last_loaded;
								})
								.catch (
									R .pipe (
										self .affiliated (':exception') .mention,
										noop
									)
								)
						})
				));

			self .impressions (':page')
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
					if (! my ('page-cache') [page .id] && ! page .temp)
						self .mention ('page-cache',
							with_ (page .id, page) (my ('page-cache')))
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

	}) (this, this .args, this .my);
});
riot.tag2('component-action', '<yield></yield>', '', '', function(opts) {
	(function (self, args, my) {

	 var refs = stream ();
	if (! self .update_strategy || self .update_strategy === "push") self .shouldUpdate = R .T;
	}) (this, this .args, this .my);
});
riot.tag2('component-add-fab', '<floating> <action> <svg viewbox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path></svg> <component-wavify></component-wavify> </action> </floating>', '', '', function(opts) {
});
riot.tag2('component-back-button', '<icon-holder nav-button><icon>&#xf104;</icon></icon-holder>', '', '', function(opts) {
});
riot.tag2('component-cached', '<render ref="render"> <yield></yield> </render>', '', '', function(opts) {
	(function (self, args, my) {

	 var refs = stream ();
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
						var main_cache = self .refs .render;
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
						window .component_cache [key] (self .refs .render);
					}
				})

	if (! self .update_strategy || self .update_strategy === "push") self .shouldUpdate = R .T;
	}) (this, this .args, this .my);
});
riot.tag2('component-cancel-button', '<span>取消</span>', '', '', function(opts) {
});
riot.tag2('component-checkbox', '', '', '', function(opts) {
	(function (self, args, my) {

	 var refs = stream ();
		    self .root .addEventListener ('click', function () {
		        if (self .root .getAttribute ('checked')) {
		            self .root .removeAttribute ('checked');
		            self .mention (args .check__to, false)
		        }
		        else {
		            self .root .setAttribute ('checked', true);
		            self .mention (args .check__to, true)
		        }
		    });

	}) (this, this .args, this .my);
});
riot.tag2('component-create-button', '<span>建立</span>', '', '', function(opts) {
});
riot.tag2('component-date-bar', '<span>{expression:component-date-bar:1}{expression:component-date-bar:2}</span>', '', '', function(opts) {
	(function (self, args, my) {

	 var refs = stream ();
		    self
		        .establish ('year', dependent (function () {
		            if (my (args .date__from)) {
		                var date = fecha .parse (my (args .date__from), 'YYYYMM');
		                if (fecha .format (new Date (), 'YYYY') !== fecha .format (date, 'YYYY'))
		                    return fecha .format (date, 'YYYY年');
		            }
		        }, self .impressions (args .date__from)))
		        .establish ('month', dependent (function () {
		            if (my (args .date__from)) {
		                var date = fecha .parse (my (args .date__from), 'YYYYMM');
		                return fecha .format (date, 'M月');
		            }
		        }, self .impressions (args .date__from)))

	window .tag_scopes = (window .tag_scopes || {});
	self .on ("before-mount", function () {window .tag_scopes ["component-date-bar"] = self;})
	self .on ("update", function () {window .tag_scopes ["component-date-bar"] = self;})
	self .on ("update", function () {args = self .opts});

	self .expressions = {};
	self .expressions [0] = function (_item) { return  my ('year')  };
	self .expressions [1] = function (_item) { return  my ('month')  };
	}) (this, this .args, this .my);
});
riot.tag2('component-date-picker', '<input ref="input">', '', '', function(opts) {
	(function (self, args, my) {

	 var refs = stream ();
			self
				.on ('mount', function () {
					var picker =	new Flatpickr (my ('input'), {
										inline: true,
										minDate: (function () {
											if (args ['min-date']) return args ['min-date'];
											var today = new Date();
											today .setDate (today .getDate () + 1);
											return today;
										}) (),
										dateFormat: 'Y年n月j日'
									})
					picker .currentYearElement .setAttribute ('readonly', true);
				})

				.establish ('input', ref)

			self .impressions ('input') .thru (tap, function (input) {
				input .addEventListener ('change', function () {
					self .mention (args .date__to, input .value);
				});
			})

	}) (this, this .args, this .my);
});
riot.tag2('component-day-of-week-picker', '<table> <tr> <th>一</th> <th>二</th> <th>三</th> <th>四</th> <th>五</th> <th>六</th> <th>日</th> </tr> <tr> <td><component-checkbox check__to=":mon"></component-checkbox></td> <td><component-checkbox check__to=":tue"></component-checkbox></td> <td><component-checkbox check__to=":wed"></component-checkbox></td> <td><component-checkbox check__to=":thu"></component-checkbox></td> <td><component-checkbox check__to=":fri"></component-checkbox></td> <td><component-checkbox check__to=":sat"></component-checkbox></td> <td><component-checkbox check__to=":sun"></component-checkbox></td> </tr> </table>', '', '', function(opts) {
	(function (self, args, my) {

	 var refs = stream ();
			self
				.remembers (':mon')
				.remembers (':tue')
				.remembers (':wed')
				.remembers (':thu')
				.remembers (':fri')
				.remembers (':sat')
				.remembers (':sun')

				.establish ('days', dependent (function () {
					return 	(my (':mon') ? ['mon'] : []) .concat
							(my (':tue') ? ['tue'] : []) .concat
							(my (':wed') ? ['wed'] : []) .concat
							(my (':thu') ? ['thu'] : []) .concat
							(my (':fri') ? ['fri'] : []) .concat
							(my (':sat') ? ['sat'] : []) .concat
							(my (':sun') ? ['sun'] : [])
				}, mergeAll
					([self .impressions (':mon'), self .impressions (':tue'), self .impressions (':wed'), self .impressions (':thu'), self .impressions (':fri'), self .impressions (':sat'), self .impressions (':sun')])
				))
				.impressions ('days')
					.thru (tap, function (days) {
						if (args .days__to)
							self .mention (args .days__to, days);
					})

	}) (this, this .args, this .my);
});
riot.tag2('component-dynamic-load-all', '<virtual each="{wrap, i in expression:component-dynamic-load-all:3}"> <component-dynamic-load-item nth="{expression:component-dynamic-load-all:1}" item__from="{expression:component-dynamic-load-all:2}"> <yield></yield> </component-dynamic-load-item> </virtual>', '', '', function(opts) {
	(function (self, args, my) {

	 var refs = stream ();
			self .update_strategy = 'pull';

			var item_source = args .items__from;

			var nths = {};
			var wrap_nth =	function (nth) {
								if (! nths [nth])
									nths [nth] = { nth: nth };
								return nths [nth];
							};

			self
				.establish ('loaded-items', constant (self .impressions (item_source)))
				.establish ('loaded-range', (dependent (function () {
					return rangify (my ('loaded-items'));
				}, self .impressions ('loaded-items'))))
				.remembers ('loaded-item', function (nth) {
					var item_label = ':item-' + nth;

					if (! self .personal (item_label))
						self .establish (item_label, dependent (function () {
							return my ('loaded-items') [nth];
						}, self .impressions ('loaded-items')))

					return item_label;
				})
				.establish ('target-items', dependent (function () {
					return arrayify (my ('loaded-range')) .map (wrap_nth);
				}, self .impressions ('loaded-range')))

			self .impressions ('loaded-items')
				.thru (tap, function () {
					var date = new Date ();
					self .render ()
						.then (function () {
							log ('dynamic-load-all ' + (new Date () - date) + 'ms');
						});
				})

	window .tag_scopes = (window .tag_scopes || {});
	self .on ("before-mount", function () {window .tag_scopes ["component-dynamic-load-all"] = self;})
	self .on ("update", function () {window .tag_scopes ["component-dynamic-load-all"] = self;})
	self .on ("update", function () {args = self .opts});

	self .expressions = {};
	self .expressions [0] = function (_item) { return  _item .wrap .nth  };
	self .expressions [1] = function (_item) { return  my ('loaded-item') (_item .wrap .nth)  };
	self .expressions [2] = function (_item) { return  my ('target-items')  };
	if (! self .update_strategy || self .update_strategy === "push") self .shouldUpdate = R .T;
	}) (this, this .args, this .my);
});
riot.tag2('component-dynamic-load-item', '<yield></yield>', '', '', function(opts) {
	(function (self, args, my) {

	 var refs = stream ();
			var nth = (+ args .nth);
			self .remembers (':nth', nth);
			self .remembers (':item', my (args .item__from));

			self .one ('updated', function () {
				self .on ('updated', function () {
					var nth = (+ args .nth);
					if (nth < my ('loaded-items') .length) {
						self .mention (':nth', nth);
						self .mention (':item', my (args .item__from));
					}
				})
			});

	if (! self .update_strategy || self .update_strategy === "push") self .shouldUpdate = R .T;
	}) (this, this .args, this .my);
});
riot.tag2('component-dynamic-load', '<virtual each="{wrap, i in expression:component-dynamic-load:5}"> <component-dynamic-load-item nth="{expression:component-dynamic-load:1}" item__from="{expression:component-dynamic-load:2}" riot-style="transform: translateY({expression:component-dynamic-load:3}px);"> <yield></yield> </component-dynamic-load-item> </virtual> <stretcher riot-style="height: {expression:component-dynamic-load:4}px;"></stretcher>', '', '', function(opts) {
	(function (self, args, my) {

	 var refs = stream ();
			self .update_strategy = 'pull';

			var list = closest_parent (self .root, 'main-content');
			var dynamic_load = self .root;

			var items_to_load = + args .items_to_load;
			var loading_interval = + args .interval_for_loading;

			var item_source = args .items__from;
			var item_height = args .item_height__from;

			var nths = {};
			var wrap_nth =	function (nth) {
								if (! nths [nth])
									nths [nth] = { nth: nth };
								return nths [nth];
							};

			self
				.establish ('loaded-items', constant (self .impressions (item_source)))
				.establish ('loaded-range', dependent (function () {
					return rangify (my ('loaded-items'));
				}, self .impressions ('loaded-items')))
				.remembers ('loaded-item', function (nth) {
					var item_label = ':item-' + nth;

					if (! self .personal (item_label))
						self .establish (item_label, dependent (function () {
							return my ('loaded-items') [nth];
						}, self .impressions ('loaded-items')))

					return item_label;
				})
				.remembers ('height-up-to', function (nth) {
					return 	arrayify ({
								from: 0,
								to: nth - 1
							}) .map (function (nth) {
								return my ('loaded-items') [nth]
							}) .reduce (function (total, item) {
								return total + my (item_height) (item)
							}, 0);
				})

				.remembers ('scroll-range', function () {
					return	{
								from: positive_or_zero (list .scrollTop - dynamic_load .offsetTop),
								to: positive_or_zero (list .scrollTop - dynamic_load .offsetTop + list .clientHeight)
							};
				})
				.establish ('target-range', dependent (function () {
					var scroll_range = my ('scroll-range') ();
					var loaded_range = my ('loaded-range') || null_range;

					var start =	(function () {
						var middle = (scroll_range .from + scroll_range .to) / 2;
						var min;

						var total = 0;
						var least_asymmetry = middle;

						for (var nth = 0; nth <= loaded_range .to; nth ++) {
							if (total <= scroll_range .from) min = nth;
							var new_total = total + my (item_height) (my ('loaded-items') [nth]);
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
					var curr = intersection (my ('target-range'), loaded_range);
					var next =	intersection ({
									from: start,
									to: start + items_to_load - 1
								}, loaded_range);
					return curr && included_in (curr, next) ? curr : next
				}, mergeAll ([
					(window .dynamic_load_rendering || (window .dynamic_load_rendering = from (function (self) {
						document .addEventListener ('animationstart', self, false);
					})))
						.thru (map, function (event) {
							return event .target
						})
						.thru (filter, function (root) {
							return root === self .root
						})
						.thru (tap, logged_with ('attached'))
					 ,
					from (function (when) { list .addEventListener ('scroll', function (x) { when (x); }); }) .thru (afterSilence, 5)
				]), self .impressions ('loaded-range')))
				.establish ('target-items', dependent (function () {
					return arrayify (my ('target-range')) .map (wrap_nth);
				}, self .impressions ('target-range')))

			self .impressions ('loaded-items')
				.thru (dropRepeats)
				.thru (map, function () {
					return 	self .impressions ('target-items')
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

	window .tag_scopes = (window .tag_scopes || {});
	self .on ("before-mount", function () {window .tag_scopes ["component-dynamic-load"] = self;})
	self .on ("update", function () {window .tag_scopes ["component-dynamic-load"] = self;})
	self .on ("update", function () {args = self .opts});

	self .expressions = {};
	self .expressions [0] = function (_item) { return  _item .wrap .nth  };
	self .expressions [1] = function (_item) { return  my ('loaded-item') (_item .wrap .nth)  };
	self .expressions [2] = function (_item) { return  my ('height-up-to') (_item .wrap .nth)  };
	self .expressions [3] = function (_item) { return  my ('height-up-to') ((my ('loaded-range') || null_range) .to + 1)  };
	self .expressions [4] = function (_item) { return  my ('target-items')  };
	if (! self .update_strategy || self .update_strategy === "push") self .shouldUpdate = R .T;
	}) (this, this .args, this .my);
});
riot.tag2('component-field-control', '<placeholder empty="{expression:component-field-control:1}">{expression:component-field-control:2}</placeholder> <input ref="input" type="{expression:component-field-control:3}" maxlength="{expression:component-field-control:4}" readonly="{expression:component-field-control:5}"> <hr> <hr focused="{expression:component-field-control:6}">', '', '', function(opts) {
	(function (self, args, my) {

	 var refs = stream ();
		    self
		        .establish ('input', ref)
		        .remembers ('focused')
		        .remembers ('empty')

		    var vals = stream (args .val);
		    self .on ('updated', function () {
		        vals (args .val);
		    })

		    self .impressions ('input') .thru (tap, function (ref) {

		        vals .thru (dropRepeats) .thru (tap, function (val) {
		            if (val) {
		                ref .value = val;
		                self .mention ('empty', false)
		            }
		            else {
		                ref .value = '';
		                self .mention ('empty', true)
		            }
		        })

		        if (args .change__to)
		            ref .addEventListener ('change', function () {
		                self .mention (args .change__to, ref .value)
		            })
		        if (args .input__to)
		            ref .addEventListener ('input', function () {
		                self .mention (args .input__to, ref .value)
		            })
		        if (args .focus__to)
		            self .impressions ('focus') .thru (tap, function () {
		                self .mention (args .input__to, ref .value)
		            })

		        ref .addEventListener ('input', function () {
		            self .mention ('empty', ! ref .value)
		        })
		        ref .addEventListener ('focus', function () {
		            self .mention ('focused', true)
		        })
		        ref .addEventListener ('blur', function () {
		            self .mention ('focused', false)
		        })
		    })

		    self .impressions ('focused') .thru (map, noop) .thru (tap, self .render)
		    self .impressions ('empty') .thru (dropRepeats) .thru (map, noop) .thru (tap, self .render)

	window .tag_scopes = (window .tag_scopes || {});
	self .on ("before-mount", function () {window .tag_scopes ["component-field-control"] = self;})
	self .on ("update", function () {window .tag_scopes ["component-field-control"] = self;})
	self .on ("update", function () {args = self .opts});

	self .expressions = {};
	self .expressions [0] = function (_item) { return  my ('empty')  };
	self .expressions [1] = function (_item) { return  args .placeholder  };
	self .expressions [2] = function (_item) { return  args .type  };
	self .expressions [3] = function (_item) { return  args .maxlength  };
	self .expressions [4] = function (_item) { return  args .readonly != undefined  };
	self .expressions [5] = function (_item) { return  my ('focused')  };
	}) (this, this .args, this .my);
});
riot.tag2('component-filter-button', '<span>篩選</span>', '', '', function(opts) {
});
riot.tag2('component-input-control', '<input ref="input" type="{expression:component-input-control:1}" placeholder="{expression:component-input-control:2}" maxlength="{expression:component-input-control:3}">', '', '', function(opts) {
	(function (self, args, my) {

	 var refs = stream ();
		    self .establish ('input', ref)

		    self .impressions ('input') .thru (tap, function (ref) {
		        if (args .change__to)
		            ref .addEventListener ('change', function () {
		                self .mention (args .change__to, ref .value)
		            })
		        if (args .input__to)
		            ref .addEventListener ('input', function () {
		                self .mention (args .input__to, ref .value)
		            })
		    })

	window .tag_scopes = (window .tag_scopes || {});
	self .on ("before-mount", function () {window .tag_scopes ["component-input-control"] = self;})
	self .on ("update", function () {window .tag_scopes ["component-input-control"] = self;})
	self .on ("update", function () {args = self .opts});

	self .expressions = {};
	self .expressions [0] = function (_item) { return  args .type  };
	self .expressions [1] = function (_item) { return  args .placeholder  };
	self .expressions [2] = function (_item) { return  args .maxlength  };
	}) (this, this .args, this .my);
});
riot.tag2('component-item', '<yield></yield>', '', '', function(opts) {
	(function (self, args, my) {

	 var refs = stream ();
	if (! self .update_strategy || self .update_strategy === "push") self .shouldUpdate = R .T;
	}) (this, this .args, this .my);
});
riot.tag2('component-jersey-control-item', '<component-field-control type="text" placeholder="{expression:component-jersey-control-item:1}" val="{expression:component-jersey-control-item:2}" input__to=":input" change__to=":change"></component-field-control>', '', '', function(opts) {
	(function (self, args, my) {

	 var refs = stream ();
			self
		        .establish ('item', constant (
		            self
		                .impressions (args .item__from)
		                    .thru (dropRepeatsWith, json_equal))
		        )
		        .establish (':jersey', dependent (function () {
		            return my ('item');
		        }, self .impressions ('item')))

		        .remembers (':modifications')
		        .impressions (':modifications')
		            .thru (tap, function (mod) {
						self .mention (args .modify__to, mod)
		            })

		    self
				.remembers (':input')
				.impressions (':input')
					.thru (map, function (val) {
						if (val)
							return 	stream (val)
										.thru (delay (500))
										.thru (filter, function () {
											return ! my (':jersey') .value
										})
										.thru (map, function () {
											return {
												action: 'assume',
												nth: my (args .nth__from)
											}
										})
						else
							return 	stream ({
										action: 'delete',
										nth: my (args .nth__from)
									})
					})
					.thru (switchLatest)
					.thru (tap, function (mod) {
						self .mention (args .modify__to, mod)
					})

			self
				.remembers (':change')
				.impressions (':change')
					.thru (filter, id)
					.thru (tap, function (value) {
						self .mention (args .modify__to, {
							action: 'set',
							nth: my (args .nth__from),
							value: value
						})
					})

			self
				.impressions (args .nth__from)
					.thru (map, noop) .thru (tap, self .render)

	window .tag_scopes = (window .tag_scopes || {});
	self .on ("before-mount", function () {window .tag_scopes ["component-jersey-control-item"] = self;})
	self .on ("update", function () {window .tag_scopes ["component-jersey-control-item"] = self;})
	self .on ("update", function () {args = self .opts});

	self .expressions = {};
	self .expressions [0] = function (_item) { return  my (':jersey') .placeholder  };
	self .expressions [1] = function (_item) { return  my (':jersey') .value  };
	}) (this, this .args, this .my);
});
riot.tag2('component-jersey-control', '<component-dynamic-load-all items__from=":items"> <component-jersey-control-item nth__from=":nth" item__from=":item" modify__to=":modify"></component-jersey-control-item> </component-dynamic-load-all>', '', '', function(opts) {
	(function (self, args, my) {

	 var refs = stream ();
			var none_more = [];
			var one_more = [undefined];
			var more =	function (n) {
							return n <= 0 ? none_more : one_more .concat (more (n - 1))
						};

			var limit = 2;

			self
				.remembers ('jerseys-to')
				.impressions ('jerseys-to')
					.thru (map, function (_jerseys) {
						return _jerseys .slice (0, limit)
					})
					.thru (dropRepeatsWith, json_equal)
					.thru (tap, function (_jerseys) {
						self .mention (args .jerseys__to, _jerseys)
					})

			self
				.establish (':items', dependent (function () {
					return	my (args .jerseys__from) .concat (one_more) .slice (0, limit) .map (function (jersey, nth) {
								return	{
											placeholder: '第' + (nth + 1) + '隻球衣' + (nth < 2 ? '(例：黑白間、藍色)' : ''),
											value: jersey
										};
							})
				}, self .impressions (args .jerseys__from)))
				.remembers (':modify')
				.impressions (':modify')
					.thru (tap, function () {
						var modification = my (':modify')
						if (modification .action === 'delete')
							self .mention ('jerseys-to', my (args .jerseys__from) .slice (0, modification .nth) .concat (my (args .jerseys__from) .slice (modification .nth + 1)))
						else if (modification .action === 'assume') {
							if (modification .nth >= my (args .jerseys__from) .length)
								self .mention ('jerseys-to', my (args .jerseys__from) .concat (more (modification .nth - my (args .jerseys__from) .length + 1)))
						}
						else if (modification .action === 'set')
							self .mention ('jerseys-to', my (args .jerseys__from) .slice (0, modification .nth) .concat ([ modification .value ]) .concat (my (args .jerseys__from) .slice (modification .nth + 1)))
					})

	}) (this, this .args, this .my);
});
riot.tag2('component-jersey-picker', '<modal> <jersey ref="first" if="{expression:component-jersey-picker:1}"> <label>{expression:component-jersey-picker:2}</label> </jersey> <jersey ref="second" if="{expression:component-jersey-picker:3}"> <label>{expression:component-jersey-picker:4}</label> </jersey> <jersey ref="free"> <component-field-control placeholder="其他球衣" input__to=":free-jersey"></component-field-control> </jersey> </modal>', '', '', function(opts) {
	(function (self, args, my) {

	 var refs = stream ();
		    self
		        .remembers ('jersey', [ '曼聯衫', '球衣二' ])
		        .remembers (':free-jersey')

		    self .impressions ('jersey')
		        .thru (dropRepeatsWith, json_equal)
		        .thru (map, noop) .thru (tap, self .render)

		    self
		        .establish ('first', ref)
		        .establish ('second', ref)
		        .establish ('free', ref)

		    self .impressions ('first')
		        .thru (tap, function (_ref) {
		            _ref .addEventListener ('click', function () {
		                if (args .jersey__to)
		                    self .mention (args .jersey__to, my ('jersey') [0])
		            })
		        })
		    self .impressions ('second')
		        .thru (tap, function (_ref) {
		            _ref .addEventListener ('click', function () {
		                if (args .jersey__to)
		                    self .mention (args .jersey__to, my ('jersey') [1])
		            })
		        })
		    self .impressions ('free')
		        .thru (tap, function (_ref) {
		            _ref .addEventListener ('click', function () {
		                if (args .jersey__to)
		                    self .mention (args .jersey__to, my (':free-jersey'))
		            })
		        })
		    self .impressions (':free-jersey')
		        .thru (tap, function () {
		            if (args .jersey__to)
		                self .mention (args .jersey__to, my (':free-jersey'))
		        })

	window .tag_scopes = (window .tag_scopes || {});
	self .on ("before-mount", function () {window .tag_scopes ["component-jersey-picker"] = self;})
	self .on ("update", function () {window .tag_scopes ["component-jersey-picker"] = self;})
	self .on ("update", function () {args = self .opts});

	self .expressions = {};
	self .expressions [0] = function (_item) { return  my ('jersey') [0]  };
	self .expressions [1] = function (_item) { return  my ('jersey') [0]  };
	self .expressions [2] = function (_item) { return  my ('jersey') [1]  };
	self .expressions [3] = function (_item) { return  my ('jersey') [1]  };
	}) (this, this .args, this .my);
});
riot.tag2('component-list-bar', '<yield></yield>', '', '', function(opts) {
	(function (self, args, my) {

	 var refs = stream ();
	if (! self .update_strategy || self .update_strategy === "push") self .shouldUpdate = R .T;
	}) (this, this .args, this .my);
});
riot.tag2('component-loader', '<component-modal-holder> <component-loading-item></component-loading-item> <yield></yield> </component-modal-holder>', '', '', function(opts) {
	(function (self, args, my) {

	 var refs = stream ();
	if (! self .update_strategy || self .update_strategy === "push") self .shouldUpdate = R .T;
	}) (this, this .args, this .my);
});
riot.tag2('component-loading-item', '<div> <spinner></spinner> </div>', '', '', function(opts) {
});
riot.tag2('component-logout-button', '<span>Logout</span>', '', '', function(opts) {
});
riot.tag2('component-main-content', '<main-content-holder> <main-content> <yield></yield> </main-content> </main-content-holder>', '', '', function(opts) {
	(function (self, args, my) {

	 var refs = stream ();
	if (! self .update_strategy || self .update_strategy === "push") self .shouldUpdate = R .T;
	}) (this, this .args, this .my);
});
riot.tag2('component-modal-holder', '<item> <yield></yield> </item>', '', '', function(opts) {
	(function (self, args, my) {

	 var refs = stream ();
		    if (args .action__by)
		        self
		            .establish (args .action__by, ref)
		            .impressions (args .action__by)
		                .thru (tap, function (ref) {
		                    ref .addEventListener ('click', function () {
		                        self .mention (args .action__to, my (args .value__by))
		                    })
		                })

	if (! self .update_strategy || self .update_strategy === "push") self .shouldUpdate = R .T;
	}) (this, this .args, this .my);
});
riot.tag2('component-next-button', '<svg width="94" height="94" viewbox="0 0 94 94" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:figma="http://www.figma.com/figma/ns"><g id="Canvas" transform="translate(1295 700)" figma:type="canvas"><g id="Group" figma:type="frame"><g id="Vector" figma:type="vector"><use xlink:href="#6ea366ce-4e17-4e17-93d7-f4d7e769eb89" transform="translate(-1294.36 -699.24)" fill="#4FABFF"></use></g><g id="Vector" figma:type="vector"><use xlink:href="#89ff831e-7a6d-4de1-bf1d-4028308a94fe" transform="matrix(-1 0 0 1 -1229.07 -681.69)" fill="#FFFFFF"></use></g></g></g><defs><path id="6ea366ce-4e17-4e17-93d7-f4d7e769eb89" d="M 80.73 4.88281e-05L 12.0001 4.88281e-05C 5.37264 4.88281e-05 5.37109e-05 5.37263 5.37109e-05 12L 5.37109e-05 80.73C 5.37109e-05 87.3574 5.37264 92.73 12.0001 92.73L 80.73 92.73C 87.3575 92.73 92.73 87.3574 92.73 80.73L 92.73 12C 92.73 5.37263 87.3575 4.88281e-05 80.73 4.88281e-05Z"></path><path id="89ff831e-7a6d-4de1-bf1d-4028308a94fe" d="M 29.2 9.76563e-05L 29.2 58.39L 1.95312e-05 29.19L 29.2 9.76563e-05Z"></path></defs></svg>', '', '', function(opts) {
});
riot.tag2('component-page-title', '<span><yield></yield></span>', '', '', function(opts) {
	(function (self, args, my) {

	 var refs = stream ();
	if (! self .update_strategy || self .update_strategy === "push") self .shouldUpdate = R .T;
	}) (this, this .args, this .my);
});
riot.tag2('component-pitch-picker', '<selected-location> <input type="text" placeholder="請選擇球場" riot-value="{expression:component-pitch-picker:1}" disabled readonly><a disabled="{expression:component-pitch-picker:2}" ref="done"><icon class="fa-check"></icon></a> </selected-location> <football-field-map ref="map"></football-field-map>', '', '', function(opts) {
	(function (self, args, my) {

	 var refs = stream ();
		    self
		        .remembers ('location')
		        .impressions ('location')
		            .thru (map, noop) .thru (tap, self .render)

		    self
		        .establish ('done', ref)
		        .impressions ('done')
		            .thru (tap, [function (ref) {
		                ref .addEventListener ('click', function () {
		                    if (my ('location')) {
		                        self .mention (args .location__to, my ('location'));
		                    }
		                });
		            }])

		    self
		        .establish ('map', ref)
		        .impressions ('map')
		            .thru (tap, [function (ref) {
		            }])

		    wait (500)
		        .then (function () {
		            self .mention ('location', 'pitch here');
		        })

	window .tag_scopes = (window .tag_scopes || {});
	self .on ("before-mount", function () {window .tag_scopes ["component-pitch-picker"] = self;})
	self .on ("update", function () {window .tag_scopes ["component-pitch-picker"] = self;})
	self .on ("update", function () {args = self .opts});

	self .expressions = {};
	self .expressions [0] = function (_item) { return  my ('location')  };
	self .expressions [1] = function (_item) { return  ! my ('location')  };
	}) (this, this .args, this .my);
});
riot.tag2('component-portal-subcategory-item', '<a href="#quiz/subcategory/#{expression:component-portal-subcategory-item:1}" if="{expression:component-portal-subcategory-item:2}"> <img src="https://ibin.co/3I0i4laCon7P.png"> </a>', '', '', function(opts) {
	(function (self, args, my) {

	 var refs = stream ();
		    self
		        .establish ('item', constant (self .impressions (args .item__from) .thru (dropRepeatsWith, json_equal)))

		        .establish ('subcategory', dependent (function () {
		            if (my ('item'))
		                return my ('item') .category;
		        }, self .impressions ('item')))
				.establish ('name', dependent (function () {
					return my ('subcategory');
				}, self .impressions ('subcategory')))

		    self .impressions ('item') .thru (tap, self .render)

	window .tag_scopes = (window .tag_scopes || {});
	self .on ("before-mount", function () {window .tag_scopes ["component-portal-subcategory-item"] = self;})
	self .on ("update", function () {window .tag_scopes ["component-portal-subcategory-item"] = self;})
	self .on ("update", function () {args = self .opts});

	self .expressions = {};
	self .expressions [0] = function (_item) { return  stringify (my ('name'))  };
	self .expressions [1] = function (_item) { return  my ('subcategory')  };
	}) (this, this .args, this .my);
});
riot.tag2('component-prev-button', '<svg width="94" height="93" viewbox="0 0 94 93" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:figma="http://www.figma.com/figma/ns"><title>Group</title><desc>Created using Figma</desc><g id="Canvas" transform="translate(158 699)" figma:type="canvas"><g id="Group" figma:type="frame"><g id="Vector" figma:type="vector"><use xlink:href="#fe2ae1a3-28ca-4124-aaa8-007b41494fe6" transform="translate(-157.365 -698.995)" fill="#4FABFF"></use></g><g id="Vector" figma:type="vector"><use xlink:href="#24ce5aa5-81c0-42f7-97ba-a8180a42d963" transform="translate(-131.275 -681.445)" fill="#FFFFFF"></use></g></g></g><defs><path id="fe2ae1a3-28ca-4124-aaa8-007b41494fe6" d="M 80.73 4.88281e-05L 12.0001 4.88281e-05C 5.37264 4.88281e-05 5.37109e-05 5.37263 5.37109e-05 12L 5.37109e-05 80.73C 5.37109e-05 87.3574 5.37264 92.73 12.0001 92.73L 80.73 92.73C 87.3575 92.73 92.73 87.3574 92.73 80.73L 92.73 12C 92.73 5.37263 87.3575 4.88281e-05 80.73 4.88281e-05Z"></path><path id="24ce5aa5-81c0-42f7-97ba-a8180a42d963" d="M 29.2 9.76563e-05L 29.2 58.39L 1.95312e-05 29.19L 29.2 9.76563e-05Z"></path></defs></svg>', '', '', function(opts) {
});
riot.tag2('component-select-control', '<yield></yield>', '', '', function(opts) {
	(function (self, args, my) {

	 var refs = stream ();
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
		                self .mention (args .select__to, multiple ? values : values [0]);
		        }
		    })

	if (! self .update_strategy || self .update_strategy === "push") self .shouldUpdate = R .T;
	}) (this, this .args, this .my);
});
riot.tag2('component-separator-inline', '<item> <span></span> </item>', '', '', function(opts) {
});
riot.tag2('component-separator', '<hr>', '', '', function(opts) {
});
riot.tag2('component-snackbar', '<snackbar> <item> <yield></yield> </item> </snackbar>', '', '', function(opts) {
	(function (self, args, my) {

	 var refs = stream ();
	if (! self .update_strategy || self .update_strategy === "push") self .shouldUpdate = R .T;
	}) (this, this .args, this .my);
});
riot.tag2('component-spacing-inline', '<stretcher riot-style="width: {expression:component-spacing-inline:1};"></stretcher>', '', '', function(opts) {
	(function (self, args, my) {

	 var refs = stream ();
	window .tag_scopes = (window .tag_scopes || {});
	self .on ("before-mount", function () {window .tag_scopes ["component-spacing-inline"] = self;})
	self .on ("update", function () {window .tag_scopes ["component-spacing-inline"] = self;})
	self .on ("update", function () {args = self .opts});

	self .expressions = {};
	self .expressions [0] = function (_item) { return  args .width  };
	}) (this, this .args, this .my);
});
riot.tag2('component-spacing', '<stretcher riot-style="width: 100%; height: {expression:component-spacing:1};"></stretcher>', '', '', function(opts) {
	(function (self, args, my) {

	 var refs = stream ();
	window .tag_scopes = (window .tag_scopes || {});
	self .on ("before-mount", function () {window .tag_scopes ["component-spacing"] = self;})
	self .on ("update", function () {window .tag_scopes ["component-spacing"] = self;})
	self .on ("update", function () {args = self .opts});

	self .expressions = {};
	self .expressions [0] = function (_item) { return  args .height  };
	}) (this, this .args, this .my);
});
riot.tag2('component-support-fab', '<floating> <action> <svg width="363" height="331" viewbox="0 0 363 331" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:figma="http://www.figma.com/figma/ns"> <title>Vector</title> <desc>Created using Figma</desc> <g id="Canvas" transform="translate(242 141)" figma:type="canvas"> <g id="Vector" style="mix-blend-mode:normal;" figma:type="vector"> <use xlink:href="#1d5ff2f8-fc3e-4911-842c-1a1f665cd660" transform="translate(-242 -140.826)" style="mix-blend-mode:normal;"></use> </g> </g> <defs> <path id="1d5ff2f8-fc3e-4911-842c-1a1f665cd660" d="M 277.73 77.949C 277.73 88.946 269.724 95.634 263.878 100.542C 261.664 102.401 257.543 105.793 257.554 107.06C 257.594 112.03 253.598 115.999 248.627 115.999C 248.602 115.999 248.577 115.999 248.552 115.999C 243.616 115.999 239.594 112.152 239.554 107.207C 239.475 97.46 246.588 91.623 252.304 86.824C 256.789 83.058 259.73 80.408 259.73 77.983C 259.73 73.074 255.736 69.08 250.827 69.08C 245.916 69.08 241.921 73.074 241.921 77.983C 241.921 82.954 237.892 86.983 232.921 86.983C 227.95 86.983 223.921 82.954 223.921 77.983C 223.921 63.149 235.99 51.08 250.825 51.08C 265.661 51.079 277.73 63.114 277.73 77.949ZM 248.801 124.307C 243.83 124.307 240 128.336 240 133.307L 240 133.376C 240 138.347 243.831 142.342 248.801 142.342C 253.771 142.342 257.801 138.278 257.801 133.307C 257.801 128.336 253.772 124.307 248.801 124.307ZM 67.392 187C 62.421 187 58.392 191.029 58.392 196C 58.392 200.971 62.421 205 67.392 205L 68.142 205C 73.113 205 77.142 200.971 77.142 196C 77.142 191.029 73.113 187 68.142 187L 67.392 187ZM 98.671 187C 93.7 187 89.671 191.029 89.671 196C 89.671 200.971 93.7 205 98.671 205L 99.42 205C 104.391 205 108.42 200.971 108.42 196C 108.42 191.029 104.391 187 99.42 187L 98.671 187ZM 363 43.251L 363 144.552C 363 168.537 343.768 188 319.783 188L 203.066 188C 200.784 188 198.905 187.987 197.333 187.954C 195.686 187.92 193.832 187.907 193.109 187.987C 192.356 188.487 190.51 190.178 188.731 191.817C 188.026 192.466 187.228 193.18 186.367 193.966L 153.345 224.064C 150.711 226.467 146.814 227.089 143.552 225.651C 140.29 224.212 138 220.982 138 217.417L 138 122L 43.72 122C 29.658 122 18 133.523 18 147.583L 18 248.884C 18 262.945 29.659 274 43.72 274L 174.094 274C 176.339 274 178.439 275.031 180.097 276.545L 207 301.349L 207 215.81C 207 210.839 211.029 206.81 216 206.81C 220.971 206.81 225 210.839 225 215.81L 225 321.748C 225 325.313 222.96 328.495 219.697 329.934C 218.53 330.449 217.358 330.652 216.131 330.652C 213.927 330.652 211.753 329.747 210.062 328.203L 170.605 291.999L 43.72 291.999C 19.734 291.999 0 272.869 0 248.883L 0 147.583C 0 123.598 19.734 104 43.72 104L 138 104L 138 43.251C 138 19.265 157.885 -2.13623e-07 181.871 -2.13623e-07L 319.784 -2.13623e-07C 343.768 -2.13623e-07 363 19.265 363 43.251ZM 345 43.251C 345 29.19 333.843 18 319.783 18L 181.871 18C 167.81 18 156 29.19 156 43.251L 156 113.084L 156 197.018L 174.095 180.665C 174.933 179.9 175.872 179.2 176.557 178.568C 184.82 170.954 186.934 169.737 197.712 169.959C 199.182 169.99 200.933 170.001 203.066 170.001L 319.783 170.001C 333.843 170.001 345 158.613 345 144.553L 345 43.251Z"></path> </defs> </svg> <component-wavify></component-wavify> </action> </floating>', '', '', function(opts) {
});
riot.tag2('component-table-control', '<span ref="span">{expression:component-table-control:1}</span><svg ref="svg" width="9" height="16" viewbox="0 0 9 16" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:figma="http://www.figma.com/figma/ns"><title>right-arrow</title><desc>Created using Figma</desc><g id="Canvas" transform="translate(734 258)" figma:type="canvas"><g id="right-arrow" style="mix-blend-mode:normal;" figma:type="frame"><g id="Group" style="mix-blend-mode:normal;" figma:type="frame"><g id="Vector" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#0b39f1b4-0614-4a28-a406-f607ebc22df0" transform="translate(-733.297 -256.973)" fill="#CCD1D1" style="mix-blend-mode:normal;"></use></g><g id="Vector" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#dd187232-741f-4707-87f3-4b5c131211ec" transform="translate(-733.721 -257.397)" fill="#CCD1D1" style="mix-blend-mode:normal;"></use></g></g></g></g><defs><path id="0b39f1b4-0614-4a28-a406-f607ebc22df0" d="M 0.8484 14.0484L -6.63757e-08 13.2L 6.1755 7.0242L -6.63757e-08 0.8484L 0.8484 1.02997e-08L 7.8726 7.0242L 0.8484 14.0484Z"></path><path id="dd187232-741f-4707-87f3-4b5c131211ec" d="M 1.2726 14.8968L 6.63757e-08 13.6242L 6.1755 7.4484L 6.63757e-08 1.2726L 1.2726 0L 8.7213 7.4484L 1.2726 14.8968ZM 0.8484 13.6242L 1.2726 14.0484L 7.8726 7.4484L 1.2726 0.8484L 0.8484 1.2726L 7.0239 7.4484L 0.8484 13.6242Z"></path></defs></svg> <fullscreen-holder active="{expression:component-table-control:2}"> <yield></yield> </fullscreen-holder>', '', '', function(opts) {
	(function (self, args, my) {

	 var refs = stream ();
			self .establish ('span', ref) .establish ('svg', ref)

			self .remembers ('picking')
			self .impressions ('picking') .thru (map, noop) .thru (tap, self .render);
			self .root .addEventListener ('click', function (e) {
				if (e .target === my ('span') || e .target === my ('svg'))
					self .mention ('picking', true);
			});

			self .establish ('message', constant (self .impressions (args .message__from)))
			self .impressions ('message')
				.thru (delay, 150)
				.thru (tap, function () {
					self .mention ('picking', false);
				})

	window .tag_scopes = (window .tag_scopes || {});
	self .on ("before-mount", function () {window .tag_scopes ["component-table-control"] = self;})
	self .on ("update", function () {window .tag_scopes ["component-table-control"] = self;})
	self .on ("update", function () {args = self .opts});

	self .expressions = {};
	self .expressions [0] = function (_item) { return  my ('message') || '未輸入'  };
	self .expressions [1] = function (_item) { return  my ('picking')  };
	if (! self .update_strategy || self .update_strategy === "push") self .shouldUpdate = R .T;
	}) (this, this .args, this .my);
});
riot.tag2('component-tabs', '<tabs> <tab active="{expression:component-tabs:1}"> <a href="#portal"> <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" width="512px" height="512px" viewbox="0 0 485.213 485.212" style="enable-background:new 0 0 485.213 485.212;" xml:space="preserve"> <g> <path d="M394.235,151.628c0,82.449-49.695,92.044-59.021,181.956c0,8.382-6.785,15.163-15.168,15.163H165.161 c-8.379,0-15.161-6.781-15.161-15.163h-0.028c-9.299-89.912-58.994-99.507-58.994-181.956C90.978,67.878,158.855,0,242.606,0 S394.235,67.878,394.235,151.628z M318.423,363.906H166.794c-8.384,0-15.166,6.786-15.166,15.168 c0,8.378,6.782,15.163,15.166,15.163h151.628c8.378,0,15.163-6.785,15.163-15.163C333.586,370.692,326.801,363.906,318.423,363.906 z M318.423,409.396H166.794c-8.384,0-15.166,6.786-15.166,15.163c0,8.383,6.782,15.168,15.166,15.168h151.628 c8.378,0,15.163-6.785,15.163-15.168C333.586,416.182,326.801,409.396,318.423,409.396z M212.282,485.212h60.65 c16.76,0,30.322-13.562,30.322-30.326h-121.3C181.955,471.65,195.518,485.212,212.282,485.212z" fill="#7e7e7e"></path> </g> </svg> Quizes </a> <component-wavify></component-wavify> </tab> <tab active="{expression:component-tabs:2}"> <a href="#profile"> <svg width="53" height="61" viewbox="0 0 53 61" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <title>person.svg</title> <desc>Created using Figma</desc> <g id="Canvas" transform="translate(3410 646)"> <g id="person"> <g id="Shape 1"> <use xlink:href="#9c74239e-b755-4545-99a8-48b1d7ecbd25" transform="translate(-3409.11 -645.992)" fill="#7E7E7E"></use> </g> </g> </g> <defs> <path id="9c74239e-b755-4545-99a8-48b1d7ecbd25" d="M 51.475 55.7731C 51.475 58.1371 49.558 60.0541 47.194 60.0541L 4.294 60.0541C 1.922 60.0541 5.95703e-05 58.1319 5.95703e-05 55.7599L 5.95703e-05 51.475C 5.95703e-05 40.181 17.158 34.317 17.158 34.317C 17.158 34.317 18.14 32.563 17.158 30.027C 13.55 27.368 13.109 23.2071 12.868 12.8691C 13.61 2.51805 20.877 -8.98438e-05 25.737 -8.98438e-05C 30.597 -8.98438e-05 37.864 2.51405 38.606 12.8691C 38.366 23.2071 37.924 27.368 34.316 30.027C 33.334 32.558 34.316 34.317 34.316 34.317C 34.316 34.317 51.4741 40.181 51.4741 51.475L 51.4741 55.7731L 51.475 55.7731Z"></path> </defs> </svg> Profile </a> <component-wavify></component-wavify> </tab> <tab active="{expression:component-tabs:3}"> <a href="#courses"> <svg width="53" height="55" viewbox="0 0 53 55" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <title>Group.svg</title> <desc>Created using Figma</desc> <g id="Canvas" transform="translate(3158 640)"> <g id="Group"> <g id="Vector"> <use xlink:href="#d60b977b-c6cb-4cd6-a033-e5e20ff036b1 " transform="translate(-3157.01 -605.957)" fill="#7E7E7E"></use> <use xlink:href="#5670583f-69b7-46ee-a0f3-ef772c677463 " transform="translate(-3157.01 -605.957)" fill="#7E7E7E"></use> </g> <g id="Vector"> <use xlink:href="#254bfab7-40f3-4302-8f28-322cca3a71fe " transform="translate(-3157.08 -604.429)" fill="#7E7E7E"></use> <use xlink:href="#c4e58a41-6c58-49b2-a4be-037c647ffdc9 " transform="translate(-3157.08 -604.429)" fill="#7E7E7E"></use> </g> <g id="Vector"> <use xlink:href="#bbc3b3c1-24ea-4300-8410-e8ae50ab9626" transform="translate(-3157.01 -627.113)" fill="#7E7E7E"></use> <use xlink:href="#bbc3b3c1-24ea-4300-8410-e8ae50ab9626" transform="translate(-3157.01 -627.113)" fill="#7E7E7E"></use> </g> <g id="Vector"> <use xlink:href="#2b5d59ac-2960-4d37-add9-218f307054d1" transform="translate(-3132.07 -637.793)" fill="#7E7E7E"></use> <use xlink:href="#7fa86e4d-affc-4a7c-bc50-fd219bc128a0" transform="translate(-3132.07 -637.793)" fill="#7E7E7E"></use> </g> <g id="Vector"> <use xlink:href="#91250fb5-0514-4c13-8163-c8972105f3bb" transform="translate(-3156.95 -637.793)" fill="#7E7E7E"></use> <use xlink:href="#6095b802-9d95-4559-b13b-044d0cb2f1fd" transform="translate(-3156.95 -637.793)" fill="#7E7E7E"></use> </g> <g id="Vector"> <use xlink:href="#6d4d5c0d-f0bc-4f44-b2f3-18f4195f5d6e" transform="translate(-3131.91 -627.337)" fill="#7E7E7E"></use> <use xlink:href="#8409e859-16a0-427e-9e2d-e90a431e5986" transform="translate(-3131.91 -627.337)" fill="#7E7E7E"></use> </g> </g> </g> <defs> <path id="d60b977b-c6cb-4cd6-a033-e5e20ff036b1 " d="M 51.2969 6.64063e-05L 1.17188e-05 6.64063e-05L 1.17188e-05 13.8131L 51.2969 13.8131L 51.2969 6.64063e-05Z"></path> <path id="5670583f-69b7-46ee-a0f3-ef772c677463 " d="M 1.17188e-05 6.64063e-05L 1.17188e-05 -0.499934L -0.499988 -0.499934L -0.499988 6.64063e-05L 1.17188e-05 6.64063e-05ZM 51.2969 6.64063e-05L 51.7969 6.64063e-05L 51.7969 -0.499934L 51.2969 -0.499934L 51.2969 6.64063e-05ZM 51.2969 13.8131L 51.2969 14.3131L 51.7969 14.3131L 51.7969 13.8131L 51.2969 13.8131ZM 1.17188e-05 13.8131L -0.499988 13.8131L -0.499988 14.3131L 1.17188e-05 14.3131L 1.17188e-05 13.8131ZM 1.17188e-05 0.500066L 51.2969 0.500066L 51.2969 -0.499934L 1.17188e-05 -0.499934L 1.17188e-05 0.500066ZM 50.7969 6.64063e-05L 50.7969 13.8131L 51.7969 13.8131L 51.7969 6.64063e-05L 50.7969 6.64063e-05ZM 51.2969 13.3131L 1.17188e-05 13.3131L 1.17188e-05 14.3131L 51.2969 14.3131L 51.2969 13.3131ZM 0.500012 13.8131L 0.500012 6.64063e-05L -0.499988 6.64063e-05L -0.499988 13.8131L 0.500012 13.8131Z"></path> <path id="254bfab7-40f3-4302-8f28-322cca3a71fe " d="M 51.4389 11.8971C 51.4389 15.2301 48.6291 17.9311 45.1701 17.9311L 6.26606 17.9311C 2.80906 17.9311 -5.66406e-05 15.2291 -5.66406e-05 11.8971L -5.66406e-05 6.03798C -5.66406e-05 2.69798 2.80906 -0.000101563 6.26606 -0.000101563L 45.1701 -0.000101563C 48.6291 -0.000101563 51.4389 2.69798 51.4389 6.03798L 51.4389 11.8971Z"></path> <path id="c4e58a41-6c58-49b2-a4be-037c647ffdc9 " d="M 50.9389 11.8971C 50.9389 14.936 48.3713 17.4311 45.1701 17.4311L 45.1701 18.4311C 48.8869 18.4311 51.9389 15.5243 51.9389 11.8971L 50.9389 11.8971ZM 45.1701 17.4311L 6.26606 17.4311L 6.26606 18.4311L 45.1701 18.4311L 45.1701 17.4311ZM 6.26606 17.4311C 3.06707 17.4311 0.499943 14.9352 0.499943 11.8971L -0.500057 11.8971C -0.500057 15.523 2.55105 18.4311 6.26606 18.4311L 6.26606 17.4311ZM 0.499943 11.8971L 0.499943 6.03798L -0.500057 6.03798L -0.500057 11.8971L 0.499943 11.8971ZM 0.499943 6.03798C 0.499943 2.9919 3.06708 0.499898 6.26606 0.499898L 6.26606 -0.500102C 2.55103 -0.500102 -0.500057 2.40407 -0.500057 6.03798L 0.499943 6.03798ZM 6.26606 0.499898L 45.1701 0.499898L 45.1701 -0.500102L 6.26606 -0.500102L 6.26606 0.499898ZM 45.1701 0.499898C 48.3713 0.499898 50.9389 2.99207 50.9389 6.03798L 51.9389 6.03798C 51.9389 2.4039 48.887 -0.500102 45.1701 -0.500102L 45.1701 0.499898ZM 50.9389 6.03798L 50.9389 11.8971L 51.9389 11.8971L 51.9389 6.03798L 50.9389 6.03798Z"></path> <path id="bbc3b3c1-24ea-4300-8410-e8ae50ab9626" d="M 26.198 21.2L -1.17188e-05 21.2L -1.17188e-05 6.05469e-05L 26.198 21.2Z"></path> <path id="bbc3b3c1-24ea-4300-8410-e8ae50ab9626" d="M 26.198 21.2L 26.198 21.7L 27.6107 21.7L 26.5125 20.8113L 26.198 21.2ZM -1.17188e-05 21.2L -0.500012 21.2L -0.500012 21.7L -1.17188e-05 21.7L -1.17188e-05 21.2ZM -1.17188e-05 6.05469e-05L 0.314516 -0.38862L -0.500012 -1.04775L -0.500012 6.05469e-05L -1.17188e-05 6.05469e-05ZM 26.198 20.7L -1.17188e-05 20.7L -1.17188e-05 21.7L 26.198 21.7L 26.198 20.7ZM 0.499988 21.2L 0.499988 6.05469e-05L -0.500012 6.05469e-05L -0.500012 21.2L 0.499988 21.2ZM -0.31454 0.388741L 25.8835 21.5887L 26.5125 20.8113L 0.314516 -0.38862L -0.31454 0.388741Z"></path> <path id="2b5d59ac-2960-4d37-add9-218f307054d1" d="M 25.623 31.8429L -9.375e-05 31.8429L -9.375e-05 -0.000115234L 25.623 31.8429Z"></path> <path id="7fa86e4d-affc-4a7c-bc50-fd219bc128a0" d="M 25.623 31.8429L 25.623 32.3429L 26.6671 32.3429L 26.0125 31.5294L 25.623 31.8429ZM -9.375e-05 31.8429L -0.500094 31.8429L -0.500094 32.3429L -9.375e-05 32.3429L -9.375e-05 31.8429ZM -9.375e-05 -0.000115234L 0.389452 -0.31357L -0.500094 -1.41905L -0.500094 -0.000115234L -9.375e-05 -0.000115234ZM 25.623 31.3429L -9.375e-05 31.3429L -9.375e-05 32.3429L 25.623 32.3429L 25.623 31.3429ZM 0.499906 31.8429L 0.499906 -0.000115234L -0.500094 -0.000115234L -0.500094 31.8429L 0.499906 31.8429ZM -0.38964 0.31334L 25.2334 32.1564L 26.0125 31.5294L 0.389452 -0.31357L -0.38964 0.31334Z"></path> <path id="91250fb5-0514-4c13-8163-c8972105f3bb" d="M -8.00781e-05 31.8849L 24.9169 31.8849L 24.9169 -0.000115234L -8.00781e-05 31.8849Z"></path> <path id="6095b802-9d95-4559-b13b-044d0cb2f1fd" d="M -8.00781e-05 31.8849L -0.394051 31.577L -1.02538 32.3849L -8.00781e-05 32.3849L -8.00781e-05 31.8849ZM 24.9169 31.8849L 24.9169 32.3849L 25.4169 32.3849L 25.4169 31.8849L 24.9169 31.8849ZM 24.9169 -0.000115234L 25.4169 -0.000115234L 25.4169 -1.45196L 24.5229 -0.30799L 24.9169 -0.000115234ZM -8.00781e-05 32.3849L 24.9169 32.3849L 24.9169 31.3849L -8.00781e-05 31.3849L -8.00781e-05 32.3849ZM 25.4169 31.8849L 25.4169 -0.000115234L 24.4169 -0.000115234L 24.4169 31.8849L 25.4169 31.8849ZM 24.5229 -0.30799L -0.394051 31.577L 0.393891 32.1928L 25.3109 0.307759L 24.5229 -0.30799Z"></path> <path id="6d4d5c0d-f0bc-4f44-b2f3-18f4195f5d6e" d="M -8.78906e-05 21.3869L 26.2001 21.3869L 26.2001 -6.05469e-05L -8.78906e-05 21.3869Z"></path> <path id="8409e859-16a0-427e-9e2d-e90a431e5986" d="M -8.78906e-05 21.3869L -0.316268 20.9996L -1.4033 21.8869L -8.78906e-05 21.8869L -8.78906e-05 21.3869ZM 26.2001 21.3869L 26.2001 21.8869L 26.7001 21.8869L 26.7001 21.3869L 26.2001 21.3869ZM 26.2001 -6.05469e-05L 26.7001 -6.05469e-05L 26.7001 -1.05364L 25.8839 -0.387398L 26.2001 -6.05469e-05ZM -8.78906e-05 21.8869L 26.2001 21.8869L 26.2001 20.8869L -8.78906e-05 20.8869L -8.78906e-05 21.8869ZM 26.7001 21.3869L 26.7001 -6.05469e-05L 25.7001 -6.05469e-05L 25.7001 21.3869L 26.7001 21.3869ZM 25.8839 -0.387398L -0.316268 20.9996L 0.316092 21.7742L 26.5163 0.387277L 25.8839 -0.387398Z"></path> </defs> </svg> Courses </a> <component-wavify></component-wavify> </tab> </tabs>', '', '', function(opts) {
	(function (self, args, my) {

	 var refs = stream ();
			self
				.remembers ('tabs', ['quizes', 'profile', 'courses'])

				.remembers ('highlight-position', function () {
					return 100 * my ('tabs') .indexOf (args .tab) / my ('tabs') .length
				})

				.remembers (':waves', none)

			self .impressions (':waves')
				.thru (flatMap, id)

	window .tag_scopes = (window .tag_scopes || {});
	self .on ("before-mount", function () {window .tag_scopes ["component-tabs"] = self;})
	self .on ("update", function () {window .tag_scopes ["component-tabs"] = self;})
	self .on ("update", function () {args = self .opts});

	self .expressions = {};
	self .expressions [0] = function (_item) { return  args .tab === 'quizes'  };
	self .expressions [1] = function (_item) { return  args .tab === 'profile'  };
	self .expressions [2] = function (_item) { return  args .tab === 'courses'  };
	}) (this, this .args, this .my);
});
riot.tag2('component-tag-control-item', '<a ref="ref"> <tag>{expression:component-tag-control-item:1}</tag> </a>', '', '', function(opts) {
	(function (self, args, my) {

	 var refs = stream ();
		    self
		        .establish ('item', constant (
		            self
		                .impressions (args .item__from)
		                    .thru (dropRepeatsWith, json_equal))
		        )
		        .establish ('tag', dependent (function () {
		            return my ('item');
		        }, self .impressions ('item')))

		        .establish ('ref', ref)
		        .impressions ('ref')
		            .thru (tap, function (_ref) {
		                _ref .addEventListener ('click', function () {
		                        self .mention (args .select__to, my ('tag'))
		                })
		            })

			self .impressions ('tag') .thru (map, noop) .thru (tap, self .render)

	window .tag_scopes = (window .tag_scopes || {});
	self .on ("before-mount", function () {window .tag_scopes ["component-tag-control-item"] = self;})
	self .on ("update", function () {window .tag_scopes ["component-tag-control-item"] = self;})
	self .on ("update", function () {args = self .opts});

	self .expressions = {};
	self .expressions [0] = function (_item) { return  my ('tag')  };
	}) (this, this .args, this .my);
});
riot.tag2('component-tag-control', '<placeholder empty="{expression:component-tag-control:1}">{expression:component-tag-control:2}</placeholder> <field> <component-dynamic-load-all items__from=":selected-tags"> <component-tag-control-item item__from=":item" select__to=":delete"></component-tag-control-item> </component-dynamic-load-all> <input ref="input" type="{expression:component-tag-control:3}" maxlength="{expression:component-tag-control:4}"> </field> <hr> <hr focused="{expression:component-tag-control:5}"> <tag-select-box focused="{expression:component-tag-control:6}"> <component-dynamic-load-all items__from=":tags"> <component-tag-control-item item__from=":item" select__to=":select"></component-tag-control-item> </component-dynamic-load-all> </tag-select-box>', '', '', function(opts) {
	(function (self, args, my) {

	 var refs = stream ();
		    self
		        .establish ('input', ref)
		        .remembers ('focused')
		        .remembers ('empty', true)

		    self .impressions ('input') .thru (tap, function (ref) {
		        ref .addEventListener ('input', function () {
		            self .mention ('empty', ! ref .value)
		        })
		        ref .addEventListener ('focus', function () {
		            self .mention ('focused', true)
		        })
		        ref .addEventListener ('blur', function () {
		            self .mention ('focused', false)
		        })
		    })

		    self
		        .remembers (':tags', ['asdf', 'asdfasdfasdf', 'sdfgdsfgdsjfgl;dsgf', 'sfgh', 'asdfa', 'qwrt'])
		        .remembers (':selected-tags', [])
		        .impressions (':selected-tags')
		            .thru (tap, function (_selected) {
		                if (args .tags__to)
		                    self .mention (args .tags__to, _selected)
		                self .mention ('empty', _selected .length ? true : false)
		            })

		    self
		        .remembers (':select')
		        .impressions (':select')
		            .thru (tap, function (tag) {
		                self .mention (':tags', my (':tags') .filter (function (_tag) {
		                    return _tag !== tag;
		                }))
		                self .mention (':selected-tags', my (':selected-tags') .concat ([tag]))
		            })
		    self
		        .remembers (':delete')
		        .impressions (':delete')
		            .thru (tap, function (tag) {
		                self .mention (':selected-tags', my (':selected-tags') .filter (function (_tag) {
		                    return _tag !== tag;
		                }))
		                self .mention (':tags', my (':tags') .concat ([tag]))
		            })

		    self .impressions ('focused') .thru (map, noop) .thru (map, noop) .thru (tap, self .render)
		    self .impressions ('empty') .thru (dropRepeats) .thru (map, noop) .thru (map, noop) .thru (tap, self .render)

	window .tag_scopes = (window .tag_scopes || {});
	self .on ("before-mount", function () {window .tag_scopes ["component-tag-control"] = self;})
	self .on ("update", function () {window .tag_scopes ["component-tag-control"] = self;})
	self .on ("update", function () {args = self .opts});

	self .expressions = {};
	self .expressions [0] = function (_item) { return  my ('empty')  };
	self .expressions [1] = function (_item) { return  args .placeholder  };
	self .expressions [2] = function (_item) { return  args .type  };
	self .expressions [3] = function (_item) { return  args .maxlength  };
	self .expressions [4] = function (_item) { return  my ('focused')  };
	self .expressions [5] = function (_item) { return  my ('focused')  };
	}) (this, this .args, this .my);
});
riot.tag2('component-timeslot-highlight', '<soon-highlight if="{expression:component-timeslot-highlight:1}"> {expression:component-timeslot-highlight:2} {expression:component-timeslot-highlight:3} {expression:component-timeslot-highlight:4} </soon-highlight> <month-highlight if="{expression:component-timeslot-highlight:5}"> {expression:component-timeslot-highlight:6} </month-highlight> <day-highlight if="{expression:component-timeslot-highlight:7}"> {expression:component-timeslot-highlight:8} </day-highlight> <day-of-week-highlight> {expression:component-timeslot-highlight:9} </day-of-week-highlight> <time-highlight> {expression:component-timeslot-highlight:10} </time-highlight>', '', '', function(opts) {
	(function (self, args, my) {

	 var refs = stream ();
		    self
				.remembers ('time', function () {
					var date_time = new Date (my (args .timeslot__from));
					return (function (am_pm) {
						if (am_pm === 'AM') return '上午'
						if (am_pm === 'PM') return '下午'
					}) (fecha .format (date_time, 'A')) + ' ' + fecha .format (date_time, 'h:mm');
				})
		        .remembers ('month', function () {

		            return fecha .format (new Date (my (args .timeslot__from)), 'M月');
		        })
		        .remembers ('day', function () {

		            return fecha .format (new Date (my (args .timeslot__from)), 'D');
		        })
		        .remembers ('day-of-week', function () {

		            return '週' + day_of_week_to_chi (new Date (my (args .timeslot__from)));
		        })
		        .remembers ('how-soon', function () {
					return day_difference (fecha .format (new Date (), 'YYYY-MM-DD'), fecha .format (my (args .timeslot__from), 'YYYY-MM-DD'));
		        })
		        .remembers ('soon', function () {
					return my ('how-soon') < 3;
		        })

		    self .impressions (args .timeslot__from) .thru (map, noop) .thru (tap, self .render)

	window .tag_scopes = (window .tag_scopes || {});
	self .on ("before-mount", function () {window .tag_scopes ["component-timeslot-highlight"] = self;})
	self .on ("update", function () {window .tag_scopes ["component-timeslot-highlight"] = self;})
	self .on ("update", function () {args = self .opts});

	self .expressions = {};
	self .expressions [0] = function (_item) { return  my ('soon') ()  };
	self .expressions [1] = function (_item) { return  Math .floor (my ('how-soon') ()) === 2 && '後天'  };
	self .expressions [2] = function (_item) { return  Math .floor (my ('how-soon') ()) === 1 && '明天'  };
	self .expressions [3] = function (_item) { return  Math .floor (my ('how-soon') ()) === 0 && '今天'  };
	self .expressions [4] = function (_item) { return  ! my ('soon') ()  };
	self .expressions [5] = function (_item) { return  my ('month') ()  };
	self .expressions [6] = function (_item) { return  ! my ('soon') ()  };
	self .expressions [7] = function (_item) { return  my ('day') ()  };
	self .expressions [8] = function (_item) { return  my ('day-of-week') ()  };
	self .expressions [9] = function (_item) { return  my ('time') ()  };
	}) (this, this .args, this .my);
});
riot.tag2('component-timeslot-picker', '<modal> <start> <hour> <input riot-value="{expression:component-timeslot-picker:1}" pattern="d*" step="1" min="1" max="12" readonly="true"> <label up ref="start-hour-up"></label> <label down ref="start-hour-down"></label> </hour> <separator>:</separator> <minutes> <input riot-value="{expression:component-timeslot-picker:2}" pattern="d*" step="1" min="1" max="12" readonly="true"> <label up ref="start-minute-up"></label> <label down ref="start-minute-down"></label> </minutes> <label ref="start-ampm-toggle">{expression:component-timeslot-picker:3}</label> </start> <end> <hour> <input riot-value="{expression:component-timeslot-picker:4}" pattern="d*" step="1" min="1" max="12" readonly="true"> <label up ref="end-hour-up"></label> <label down ref="end-hour-down"></label> </hour> <separator>:</separator> <minutes> <input riot-value="{expression:component-timeslot-picker:5}" pattern="d*" step="1" min="1" max="12" readonly="true"> <label up ref="end-minute-up"></label> <label down ref="end-minute-down"></label> </minutes> <label ref="end-ampm-toggle">{expression:component-timeslot-picker:6}</label> </end> </modal>', '', '', function(opts) {
	(function (self, args, my) {

	 var refs = stream ();
		    self
		        .remembers ('start-hour', 7)
		        .remembers ('start-minute', 30)
		        .remembers ('start-ampm', 'PM')
		        .remembers ('end-hour', 9)
		        .remembers ('end-minute', 0)
		        .remembers ('end-ampm', 'PM')

		        .establish ('start-hour-up', ref)
		        .establish ('start-hour-down', ref)
		        .establish ('start-minute-up', ref)
		        .establish ('start-minute-down', ref)
		        .establish ('start-ampm-toggle', ref)
		        .establish ('end-hour-up', ref)
		        .establish ('end-hour-down', ref)
		        .establish ('end-minute-up', ref)
		        .establish ('end-minute-down', ref)
		        .establish ('end-ampm-toggle', ref)

		    mergeAll ([
		        self .impressions ('start-hour'),
		        self .impressions ('start-minute'),
		        self .impressions ('start-ampm'),
		        self .impressions ('end-hour'),
		        self .impressions ('end-minute'),
		        self .impressions ('end-ampm')
		    ])
		        .thru (map, noop) .thru (tap, self .render)
		        .thru (tap, function () {
		            if (args .timeslot__to)
		                self .mention (args .timeslot__to, {
		                    start: ('0' + my ('start-hour')) .slice (-2) + ':' + ('0' + my ('start-minute')) .slice (-2) + ' ' + my ('start-ampm'),
		                    end: ('0' + my ('end-hour')) .slice (-2) + ':' + ('0' + my ('end-minute')) .slice (-2) + ' ' + my ('end-ampm')
		                })
		        })

		    self .impressions ('start-hour-up') .thru (tap, function (ref) {
		        ref .addEventListener ('click', function () {
		            self .mention ('start-hour', (my ('start-hour') % 12) + 1)
		        })
		    })
		    self .impressions ('start-hour-down') .thru (tap, function (ref) {
		        ref .addEventListener ('click', function () {
		            self .mention ('start-hour', (my ('start-hour') - 1) || 12)
		        })
		    })
		    self .impressions ('start-minute-up') .thru (tap, function (ref) {
		        ref .addEventListener ('click', function () {
		            self .mention ('start-minute', (my ('start-minute') + 30) % 60)
		        })
		    })
		    self .impressions ('start-minute-down') .thru (tap, function (ref) {
		        ref .addEventListener ('click', function () {
		            self .mention ('start-minute', (my ('start-minute') + 30) % 60)
		        })
		    })
		    self .impressions ('start-ampm-toggle') .thru (tap, function (ref) {
		        ref .addEventListener ('click', function () {
		            self .mention ('start-ampm', my ('start-ampm') === 'AM' ? 'PM' : 'AM')
		        })
		    })
		    self .impressions ('end-hour-up') .thru (tap, function (ref) {
		        ref .addEventListener ('click', function () {
		            self .mention ('end-hour', (my ('end-hour') % 12) + 1)
		        })
		    })
		    self .impressions ('end-hour-down') .thru (tap, function (ref) {
		        ref .addEventListener ('click', function () {
		            self .mention ('end-hour', (my ('end-hour') - 1) || 12)
		        })
		    })
		    self .impressions ('end-minute-up') .thru (tap, function (ref) {
		        ref .addEventListener ('click', function () {
		            self .mention ('end-minute', (my ('end-minute') + 30) % 60)
		        })
		    })
		    self .impressions ('end-minute-down') .thru (tap, function (ref) {
		        ref .addEventListener ('click', function () {
		            self .mention ('end-minute', (my ('end-minute') + 30) % 60)
		        })
		    })
		    self .impressions ('end-ampm-toggle') .thru (tap, function (ref) {
		        ref .addEventListener ('click', function () {
		            self .mention ('end-ampm', my ('end-ampm') === 'AM' ? 'PM' : 'AM')
		        })
		    })

	window .tag_scopes = (window .tag_scopes || {});
	self .on ("before-mount", function () {window .tag_scopes ["component-timeslot-picker"] = self;})
	self .on ("update", function () {window .tag_scopes ["component-timeslot-picker"] = self;})
	self .on ("update", function () {args = self .opts});

	self .expressions = {};
	self .expressions [0] = function (_item) { return  ('0' + my ('start-hour')) .slice (-2)  };
	self .expressions [1] = function (_item) { return  ('0' + my ('start-minute')) .slice (-2)  };
	self .expressions [2] = function (_item) { return  my ('start-ampm')  };
	self .expressions [3] = function (_item) { return  ('0' + my ('end-hour')) .slice (-2)  };
	self .expressions [4] = function (_item) { return  ('0' + my ('end-minute')) .slice (-2)  };
	self .expressions [5] = function (_item) { return  my ('end-ampm')  };
	}) (this, this .args, this .my);
});
riot.tag2('component-tree-control-item', '<item ref="item"> <status> <svg if="{expression:component-tree-control-item:1}" viewbox="0 0 24 24"><path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"></path></svg> <svg if="{expression:component-tree-control-item:2}" viewbox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2z"></path></svg> <svg if="{expression:component-tree-control-item:3}" viewbox="0 0 24 24"><path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path></svg> </status> <label>{expression:component-tree-control-item:4}</label> <branch-status if="{expression:component-tree-control-item:5}"> <button type="button"> <svg if="{expression:component-tree-control-item:6}" viewbox="0 0 24 24"><path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z"></path></svg> <svg if="{expression:component-tree-control-item:7}" viewbox="0 0 24 24"><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"></path></svg> <component-wavify center></component-wavify> </button> </branch-status> <component-wavify></component-wavify> </item> <branch if="{expression:component-tree-control-item:8}"> <component-tree-control items__from=":status" items__to=":modifications"></component-tree-control> </branch>', '', '', function(opts) {
	(function (self, args, my) {

	 var refs = stream ();
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
			self
		        .establish ('tree', constant (self .impressions (args .item__from) .thru (dropRepeatsWith, json_equal)))
		    	.impressions ('tree')
		    		.thru (map, noop) .thru (tap, self .render)

		    self
		        .establish ('name', dependent (function () {
		            return my ('tree') .name;
		        }, self .impressions ('tree')))
		        .establish (':status', dependent (function () {
		            return my ('tree') .status;
		        }, self .impressions ('tree')))

		        .establish ('empty', dependent (function () {
		            return zeroed (my (':status'));
		        }, self .impressions (':status')))
		        .establish ('half', dependent (function () {
		            return ! zeroed (my (':status')) && ! filled (my (':status'));
		        }, self .impressions (':status')))
		        .establish ('full', dependent (function () {
		            return filled (my (':status'));
		        }, self .impressions (':status')))

		        .establish ('branched', dependent (function () {
		            return typeof my (':status') !== 'boolean';
		        }, self .impressions (':status')))
		        .establish ('branch-open', dependent (function () {
		            return typeof my (':status') !== 'boolean' && ! zeroed (my (':status'));
		        }, self .impressions (':status')))

		    self
				.establish ('item', ref)
				.impressions ('item')
					.thru (tap, function (ref) {
						ref .addEventListener ('click', function () {
							self .mention ('toggle');
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
			self
				.remembers ('toggle')
				.impressions ('toggle')
					.thru (tap, function () {
						var name = my ('name');
						var status = my (':status');
						self .mention (args .substitute__to, {
							item: name,
							sub: zeroed (status) ? fill (status) : zero (status)
						})
					});

			self
				.remembers (':modifications')
				.impressions (':modifications')
					.thru (tap, function (sub) {
						self .mention (args .substitute__to, {
							item: my ('name'),
							sub: sub
						})
					})

	window .tag_scopes = (window .tag_scopes || {});
	self .on ("before-mount", function () {window .tag_scopes ["component-tree-control-item"] = self;})
	self .on ("update", function () {window .tag_scopes ["component-tree-control-item"] = self;})
	self .on ("update", function () {args = self .opts});

	self .expressions = {};
	self .expressions [0] = function (_item) { return  my ('empty')  };
	self .expressions [1] = function (_item) { return  my ('half')  };
	self .expressions [2] = function (_item) { return  my ('full')  };
	self .expressions [3] = function (_item) { return  my ('name')  };
	self .expressions [4] = function (_item) { return  my ('branched')  };
	self .expressions [5] = function (_item) { return  ! my ('empty')  };
	self .expressions [6] = function (_item) { return  my ('empty')  };
	self .expressions [7] = function (_item) { return  my ('branch-open')  };
	}) (this, this .args, this .my);
});
riot.tag2('component-tree-control', '<component-dynamic-load-all items__from=":items"> <component-tree-control-item item__from=":item" substitute__to=":substitute"></component-tree-control-item> </component-dynamic-load-all>', '', '', function(opts) {
	(function (self, args, my) {

	 var refs = stream ();
			self
				.establish ('tree', constant (
					self .impressions (args .items__from)
						.thru (dropRepeatsWith, json_equal)
				))
				.establish (':items', dependent (function () {
					return 	Object .keys (my ('tree')) .map (function (name) {
								return 	{
											name: name,
											status: my ('tree') [name]
										};
							});
				}, self .impressions ('tree')))

			self
				.remembers (':substitute')
				.impressions (':substitute')
					.thru (tap, function () {
						if (! json_equal (my ('tree') [my (':substitute') .item], my (':substitute') .sub))
							self .mention (args .items__to, with_ (my (':substitute') .item, my (':substitute') .sub) (my ('tree')))
					})

	}) (this, this .args, this .my);
});
riot.tag2('component-wavify', '', '', '', function(opts) {
	(function (self, args, my) {

	 var refs = stream ();
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
		            self .mention (args .waves__to, from_promise (done))
		    }, true);

	}) (this, this .args, this .my);
});
riot.tag2('component-x-button', '<icon-holder nav-button><svg width="13" height="13" viewbox="0 0 13 13" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:figma="http://www.figma.com/figma/ns"><title>cancel</title><desc>Created using Figma</desc><g id="Canvas" transform="translate(1022 334)" figma:type="canvas"><g id="cancel" style="mix-blend-mode:normal;" figma:type="frame"><g id="Group" style="mix-blend-mode:normal;" figma:type="frame"><g id="Vector" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#1c8fcd43-ce74-4b25-b1b4-2f698b0c61a8" transform="translate(-1022 -334)" fill="#5DADE2" style="mix-blend-mode:normal;"></use></g></g></g></g><defs><path id="1c8fcd43-ce74-4b25-b1b4-2f698b0c61a8" d="M 5.87831 6.50199L 0.123962 12.2965C -0.0359037 12.4575 -0.0359037 12.7183 0.123962 12.8793C 0.203793 12.9599 0.30861 13 0.413223 13C 0.51804 13 0.622653 12.9599 0.702484 12.8793L 6.5001 7.04119L 12.2977 12.8793C 12.3778 12.9599 12.4824 13 12.587 13C 12.6916 13 12.7964 12.9599 12.8762 12.8793C 13.0361 12.7183 13.0361 12.4575 12.8762 12.2965L 7.12209 6.50199L 12.8801 0.703352C 13.04 0.54237 13.04 0.281566 12.8801 0.120583C 12.7202 -0.0401945 12.4612 -0.0401945 12.3016 0.120583L 6.5003 5.96279L 0.698422 0.120788C 0.538556 -0.0399899 0.279765 -0.0399899 0.119899 0.120788C -0.0399664 0.28177 -0.0399664 0.542574 0.119899 0.703557L 5.87831 6.50199Z"></path></defs></svg></icon-holder>', '', '', function(opts) {
});
riot.tag2('page-courses', '<nav> <nav-bar> <nav-buttons> <a href="#portal"> <component-back-button></component-back-button> </a> </nav-buttons> <nav-title> <component-page-title>Courses</component-page-title> </nav-title> </nav-bar> </nav> <component-main-content> <highscore> <my-highscore> <label>Your score is:</label> <score>29</score> </my-highscore> <highscores> <highscore><label>Champion</label><item>John Huen: 179</item></highscore> <highscore><label>First Runner-up</label><item>John Huen: 169</item></highscore> <highscore><label>Second Runner-up</label><item>John Huen: 168</item></highscore> </highscores> </highscore> </component-main-content>', '', '', function(opts) {
});
riot.tag2('page-disclaimer', '<nav> <nav-bar> <nav-buttons> <a href="#register"> <component-back-button></component-back-button> </a> </nav-buttons> <nav-title></nav-title> </nav-bar> </nav> <component-main-content> <register> <label> Disclaimer and Terms of Agreements </label> <component-spacing height="20px"></component-spacing> <disclaimer> <p>The information contained on www.kodingkingdom.com website and mobile app (the "Service") is for general information purposes only.</p> <p>Koding Kingdom (Hong Kong) Limited assumes no responsibility for errors or omissions in the contents on the Service.</p> <p>In no event shall Koding Kingdom (Hong Kong) Limited be liable for any special, direct, indirect, consequential, or incidental damages or any damages whatsoever, whether in an action of contract, negligence or other tort, arising out of or in connection with the use of the Service or the contents of the Service. Koding Kingdom (Hong Kong) Limited reserves the right to make additions, deletions, or modification to the contents on the Service at any time without prior notice.</p> <p>Koding Kingdom (Hong Kong) Limited does not warrant that the website is free of viruses or other harmful components.</p> <p>This Disclaimer is licensed by TermsFeed to Koding Kingdom (Hong Kong) Limited.</p> </disclaimer> </register> </component-main-content>', '', '', function(opts) {
});
riot.tag2('page-forget', '<nav> <nav-bar> <nav-buttons> <a href="#login"> <component-back-button></component-back-button> </a> </nav-buttons> <nav-title> <component-page-title>Forget Password</component-page-title> </nav-title> </nav-bar> </nav> <component-main-content> <forget> <label>Please enter your email to receive a new password.</label> <component-field-control placeholder="Email" type="email"></component-field-control> <component-spacing height="40px"></component-spacing> <component-action> <a href="#home">Send</a> </component-action> </forget> </component-main-content>', '', '', function(opts) {
});
riot.tag2('page-highscore', '<nav> <nav-bar> <nav-buttons> <a href="#portal"> <component-back-button></component-back-button> </a> </nav-buttons> <nav-title> <component-page-title>Highscore</component-page-title> </nav-title> </nav-bar> </nav> <component-main-content> <highscore> <my-highscore> <label>Your score is:</label> <score>29</score> </my-highscore> <highscores> <highscore><label>Champion</label><item>John Huen: 179</item></highscore> <highscore><label>First Runner-up</label><item>John Huen: 169</item></highscore> <highscore><label>Second Runner-up</label><item>John Huen: 168</item></highscore> </highscores> </highscore> </component-main-content>', '', '', function(opts) {
});
riot.tag2('page-home', '<home> <label>CODE&#x3E;<br>&#x3C;WARS</label> <img src="https://ibin.co/3I5zb7FQHEYr.png"> <component-spacing height="40px"></component-spacing> <component-action> <a href="#login">Login</a> </component-action> <component-spacing height="10px"></component-spacing> <component-action> <a href="#register">Register</a> </component-action> </home>', '', '', function(opts) {
});
riot.tag2('page-login', '<nav> <nav-bar> <nav-buttons> <a href="#home"> <component-back-button></component-back-button> </a> </nav-buttons> <nav-title> <component-page-title>Login</component-page-title> </nav-title> </nav-bar> </nav> <component-main-content> <login> <component-field-control placeholder="Email" type="email"></component-field-control> <component-field-control type="password" placeholder="Password"></component-field-control> <a href="#forget"> Forget Password? </a> <component-spacing height="40px"></component-spacing> <component-action> <a href="#ranking">Login</a> </component-action> </login> </component-main-content>', '', '', function(opts) {
});
riot.tag2('page-logout', '', '', '', function(opts) {
	(function (self, args, my) {

	 var refs = stream ();

	}) (this, this .args, this .my);
});
riot.tag2('page-portal', '<nav> <nav-bar> <nav-buttons> </nav-buttons> <nav-title> <component-page-title>Ready to code?</component-page-title> </nav-title> <nav-buttons> <a href="#logout"> <component-logout-button></component-logout-button> </a> </nav-buttons> </nav-bar> </nav> <component-main-content> <portal> <component-spacing height="10px"></component-spacing> <label> Choose a quiz! </label> <component-spacing height="20px"></component-spacing> <component-item if="{expression:page-portal:1}">Fetching quizes...</component-item> <component-loading-item if="{expression:page-portal:2}"></component-loading-item> <component-item if="{expression:page-portal:3}">No courses found :(</component-item> <component-dynamic-load items_to_load="13" interval_for_loading="50" item_height__from=":item-height" items__from=":subcategories"> <component-portal-subcategory-item item__from=":item"> </component-dynamic-load> </portal> <component-spacing height="75px"></component-spacing> <links> <a href="#courses"><label>Courses</label></a> <a href="#highscore"><label>Highscore</label></a> <a href="#contact"><label>Contact us</label></a> </links> </component-main-content>', '', '', function(opts) {
	(function (self, args, my) {

	 var refs = stream ();
			self
				.remembers ('questions-info')
				.establish (':subcategories', function (requests) {
					return 	self .impressions ('questions-info')
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
				})
				.remembers (':item-height', function (item) {
					return 135;
				})

			self
				.establish ('status', constant (
					mechanism (function () {
						if (my (':subcategories') .length)
							return 'loaded';
						else
							return 'no-items'
					}, [self .impressions (':subcategories')])
						.thru (tap_ (function (status) {
							if (! status .hasVal)
								status ('loading')
						}))
				))
				.impressions ('status') .thru (tap, self .render)

			self
				.impressions (args .cycle__from)
					.thru (tap, function () {
						inquire (self .affiliated ('::questions'))
							.then (function (questions) {
								self .mention ('questions-info', questions)
							})
					})

	window .tag_scopes = (window .tag_scopes || {});
	self .on ("before-mount", function () {window .tag_scopes ["page-portal"] = self;})
	self .on ("update", function () {window .tag_scopes ["page-portal"] = self;})
	self .on ("update", function () {args = self .opts});

	self .expressions = {};
	self .expressions [0] = function (_item) { return  my ('status') === 'loading'  };
	self .expressions [1] = function (_item) { return  my ('status') === 'loading'  };
	self .expressions [2] = function (_item) { return  my ('status') === 'no-items'  };
	}) (this, this .args, this .my);
});
riot.tag2('page-quiz-subcategory', '<nav> <nav-bar> <nav-buttons> <a href="#portal"> <component-back-button></component-back-button> </a> </nav-buttons> <nav-title> <component-page-title>Points: {expression:page-quiz-subcategory:1}/20</component-page-title> </nav-title> </nav-bar> </nav> <component-main-content> <question> <number> <label>Q{expression:page-quiz-subcategory:2}.</label> </number> <label>{expression:page-quiz-subcategory:3}</label> <image-holder if="{expression:page-quiz-subcategory:4}"><img riot-src="{expression:page-quiz-subcategory:5}"></image-holder> <component-spacing height="20px"></component-spacing> <guesses> <guess><a href="#quiz/subcategory/#{expression:page-quiz-subcategory:6}">{expression:page-quiz-subcategory:7}</a></guess> <guess><a href="#quiz/subcategory/#{expression:page-quiz-subcategory:8}">{expression:page-quiz-subcategory:9}</a></guess> <guess><a href="#quiz/subcategory/#{expression:page-quiz-subcategory:10}">{expression:page-quiz-subcategory:11}</a></guess> <guess><a href="#quiz/subcategory/#{expression:page-quiz-subcategory:12}">{expression:page-quiz-subcategory:13}</a></guess> </guesses> </question> </component-main-content>', '', '', function(opts) {
	(function (self, args, my) {

	 var refs = stream ();
			self .temp = true;

			self
				.remembers ('questions-items')

				.remembers ('category', parse (args .params [0]))
				.remembers ('points', parse (args .params [1]) || 0)
				.remembers ('nth', parse (args .params [2]) || 1)

				.establish ('questions-in-category', dependent (function () {
					return 	my ('questions-items') .filter (function (item) {
								return item .category === my ('category')
							})
				}, self .impressions ('questions-items')))
				.establish ('question', dependent (function () {
					var pool = my ('questions-in-category');
					return pool [Math .floor (Math .random () * pool .length)] .question
				}, self .impressions ('questions-in-category')))
				.establish ('text', dependent (function () {
					return my ('question') .text
				}, self .impressions ('question')))
				.establish ('answer', dependent (function () {
					return my ('question') .answer
				}, self .impressions ('question')))
				.establish ('traps', dependent (function () {
					return my ('question') .traps
				}, self .impressions ('question')))
				.establish ('image', dependent (function () {
					return my ('question') .image
				}, self .impressions ('question')))

				.establish ('guesses', constant (
					mechanism (function () {
						var array = [my ('answer')] .concat (my ('traps'));

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
					}, [self .impressions ('question')])
						.thru (tap_ (function (guesses) {
							if (! guesses .hasVal)
								guesses ([])
						}))
				))

				.remembers ('points-for', function (guess) {
					return my ('guesses') [guess] === my ('answer') ? 1 : 0
				})

			self .impressions ('question') .thru (tap, self .render)

			self .impressions (args .cycle__from)
				.thru (tap, function () {
					inquire_last (self .affiliated ('::questions'))
						.then (function (items) {
							self .mention ('questions-items', items)
						})
				})

	window .tag_scopes = (window .tag_scopes || {});
	self .on ("before-mount", function () {window .tag_scopes ["page-quiz-subcategory"] = self;})
	self .on ("update", function () {window .tag_scopes ["page-quiz-subcategory"] = self;})
	self .on ("update", function () {args = self .opts});

	self .expressions = {};
	self .expressions [0] = function (_item) { return  my ('points')  };
	self .expressions [1] = function (_item) { return  my ('nth')  };
	self .expressions [2] = function (_item) { return  my ('text')  };
	self .expressions [3] = function (_item) { return  my ('image')  };
	self .expressions [4] = function (_item) { return  my ('image')  };
	self .expressions [5] = function (_item) { return  [ my ('category'), my ('points') + my ('points-for') (0), my ('nth') + 1 ] .map (stringify) .join ('/')  };
	self .expressions [6] = function (_item) { return  my ('guesses') [0]  };
	self .expressions [7] = function (_item) { return  [ my ('category'), my ('points') + my ('points-for') (1), my ('nth') + 1 ] .map (stringify) .join ('/')  };
	self .expressions [8] = function (_item) { return  my ('guesses') [1]  };
	self .expressions [9] = function (_item) { return  [ my ('category'), my ('points') + my ('points-for') (2), my ('nth') + 1 ] .map (stringify) .join ('/')  };
	self .expressions [10] = function (_item) { return  my ('guesses') [2]  };
	self .expressions [11] = function (_item) { return  [ my ('category'), my ('points') + my ('points-for') (3), my ('nth') + 1 ] .map (stringify) .join ('/')  };
	self .expressions [12] = function (_item) { return  my ('guesses') [3]  };
	self .expressions [13] = function (_item) { return  my ('nth') > 1  };
	self .expressions [14] = function (_item) { return  my ('nth') < 20  };
	}) (this, this .args, this .my);
});
riot.tag2('page-ranking', '<nav> <nav-bar> <nav-buttons> </nav-buttons> <nav-title> <component-page-title>Hello World! Ready to Code?</component-page-title> </nav-title> <nav-buttons> <a href="#home"> <component-logout-button></component-logout-button> </a> </nav-buttons> </nav-bar> </nav> <component-main-content> <ranking> <table> <tr> <th>Rank</th> <th>Name</th> <th></th> <th>Score</th> </tr> <tr> <td>1</td> <td>Not You</td> <td><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon></td> <td>1654</td> </tr> <tr> <td>1</td> <td>Not You</td> <td><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon></td> <td>1654</td> </tr> <tr> <td>1</td> <td>Not You</td> <td><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon></td> <td>1654</td> </tr> <tr active> <td>1</td> <td>You</td> <td><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon></td> <td>1654</td> </tr> <tr> <td>1</td> <td>Not You</td> <td><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon></td> <td>1654</td> </tr> <tr> <td>1</td> <td>Not You</td> <td><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon></td> <td>1654</td> </tr> <tr> <td>1</td> <td>Not You</td> <td><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon></td> <td>1654</td> </tr> <tr> <td>1</td> <td>Not You</td> <td><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon></td> <td>1654</td> </tr> <tr> <td>1</td> <td>Not You</td> <td><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon></td> <td>1654</td> </tr> <tr> <td>1</td> <td>Not You</td> <td><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon></td> <td>1654</td> </tr> <tr> <td>1</td> <td>Not You</td> <td><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon></td> <td>1654</td> </tr> <tr> <td>1</td> <td>Not You</td> <td><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon></td> <td>1654</td> </tr> <tr> <td>1</td> <td>Not You</td> <td><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon></td> <td>1654</td> </tr> <tr> <td>1</td> <td>Not You</td> <td><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon></td> <td>1654</td> </tr> <tr> <td>1</td> <td>Not You</td> <td><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon></td> <td>1654</td> </tr> <tr> <td>1</td> <td>Not You</td> <td><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon></td> <td>1654</td> </tr> <tr> <td>1</td> <td>Not You</td> <td><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon></td> <td>1654</td> </tr> <tr> <td>1</td> <td>Not You</td> <td><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon></td> <td>1654</td> </tr> <tr> <td>1</td> <td>Not You</td> <td><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon></td> <td>1654</td> </tr> <tr> <td>1</td> <td>Not You</td> <td><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon></td> <td>1654</td> </tr> </table> </ranking> </component-main-content> <component-tabs tab="quizes"></component-tabs>', '', '', function(opts) {
	(function (self, args, my) {

	 var refs = stream ();
			self
				.remembers ('questions-info')
				.establish (':subcategories', function (requests) {
					return 	self .impressions ('questions-info')
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
				})
				.remembers (':item-height', function (item) {
					return 135;
				})

			self
				.establish ('status', constant (
					mechanism (function () {
						if (my (':subcategories') .length)
							return 'loaded';
						else
							return 'no-items'
					}, [self .impressions (':subcategories')])
						.thru (tap_ (function (status) {
							if (! status .hasVal)
								status ('loading')
						}))
				))
				.impressions ('status') .thru (tap, self .render)

			self
				.impressions (args .cycle__from)
					.thru (tap, function () {
						inquire (self .affiliated ('::questions'))
							.then (function (questions) {
								self .mention ('questions-info', questions)
							})
					})

	}) (this, this .args, this .my);
});
riot.tag2('page-register', '<nav> <nav-bar> <nav-buttons> <a href="#home"> <component-back-button></component-back-button> </a> </nav-buttons> <nav-title> <component-page-title>Register</component-page-title> </nav-title> </nav-bar> </nav> <component-main-content> <register> <label> Please enter your email and create a password </label> <component-spacing height="20px"></component-spacing> <label1>Email:</label1> <component-field-control placeholder="" input__to=":email" type="email"></component-field-control> <label1>Create a password:</label1> <component-field-control type="password" placeholder="" input__to=":password"></component-field-control> <label1>Confirm your password:</label1> <component-field-control type="password" placeholder="" input__to=":password-copy"></component-field-control> <component-spacing height="40px"></component-spacing> <component-action> <a ref="action" href="#portal">Create</a> </component-action> <terms-of-agreement> <item> <component-checkbox check__to=":agree-toa"></component-checkbox> </item> <label> I agree with the <a href="#disclaimer">Disclaimers and Terms of Agreement</a> </label> </terms-of-agreement> </register> </component-main-content>', '', '', function(opts) {
	(function (self, args, my) {

	 var refs = stream ();
			self .temp = true;

			self
				.remembers (':email')
				.remembers (':password')
				.remembers (':password-copy')
				.remembers (':agree-toa')

				.establish ('action', ref)
				.impressions ('action')
					.thru (tap, function (_ref) {
						var errors =	function () {
											if (! valid_email (my (':email')))
												return 'Please enter a valid email address';
											if (! my (':password'))
												return 'Please enter a password'
											if (my (':password') .length < 8)
												return 'Please enter a password of at least 8 characters'
											if (my (':password') !== my (':password-copy'))
												return 'Please make sure the passwords match'
											if (! my (':agree-toa'))
												return 'You must agree to the terms of agreement'
										}
						_ref .addEventListener ('click', function (e) {
							e .preventDefault ();
							var _errors = errors ();
							if (_errors)
								toast (_errors)
							else {
								inquire (self .affiliated ('::register'), {
									email: my (':email'),
									password: my (':password')
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

	}) (this, this .args, this .my);
});
riot.tag2('page-subaccount-create', '<nav> <nav-bar> <nav-buttons> <a href="#home"> <component-back-button></component-back-button> </a> </nav-buttons> <nav-title> <component-page-title>Create New Player</component-page-title> </nav-title> </nav-bar> </nav> <component-main-content> <register> <label> Please enter your email and create a password </label> <component-spacing height="20px"></component-spacing> <label>User Name:</label> <component-field-control type="text" placeholder="First Name" input__to=":firstname"></component-field-control> <component-field-control type="text" placeholder="Last Name" input__to=":lastname"></component-field-control> <label>Date of Birth:</label> <component-field-control placeholder="{expression:page-subaccount-create:1}" input__to=":date-of-birth" ref="date-of-birth-ref" readonly></component-field-control> <fullscreen-holder active="{expression:page-subaccount-create:2}"> <component-modal-holder> <component-date-picker date__to=":date-of-birth"></component-date-picker> </component-modal-holder> </fullscreen-holder> <label>Nationality:</label> <component-field-control type="password" placeholder="" input__to=":nationality"></component-field-control> <label>School:</label> <component-field-control type="text" placeholder="" input__to=":school"></component-field-control> <component-spacing height="40px"></component-spacing> <component-action> <a ref="action" href="#portal">Create</a> </component-action> <terms-of-agreement> <item> <component-checkbox check__to=":agree-toa"></component-checkbox> </item> <label> I agree with the <a href="#disclaimer">Disclaimers and Terms of Agreement</a> </label> </terms-of-agreement> </register> </component-main-content>', '', '', function(opts) {
	(function (self, args, my) {

	 var refs = stream ();
			self .temp = true;

			self
				.remembers (':email')
				.remembers (':password')
				.remembers (':date-of-birth')
				.remembers (':agree-toa')

			self .remembers ('picking-date-of-birth')
			self .impressions ('picking-date-of-birth') .thru (map, noop) .thru (tap, self .render);

			self .establish ('date-of-birth-ref', ref)
				.impressions ('date-of-birth-ref')
				.thru (map, function (tag) {
					return tag .root;
				})
				.thru (tap, function (ref) {
					ref .addEventListener ('click', function (e) {
						self .mention ('picking-date-of-birth', true);
					})
				})

			self .impressions (':date-of-birth')
				.thru (delay, 150)
				.thru (tap, function () {
					self .mention ('picking-date-of-birth', false);
				})

			self
				.establish ('action', ref)
				.impressions ('action')
					.thru (tap, function (_ref) {
						var errors =	function () {
											if (! valid_email (my (':email')))
												return 'Please enter a valid email address';
											if (! my (':password'))
												return 'Please enter a password'
											if (my (':password') .length < 8)
												return 'Please enter a password of at least 8 characters'
											if (! my (':agree-toa'))
												return 'You must agree to the terms of agreement'
										}
						_ref .addEventListener ('click', function (e) {
							e .preventDefault ();
							var _errors = errors ();
							if (_errors)
								toast (_errors)
							else {
								inquire (self .affiliated ('::register'), {
									email: my (':email'),
									password: my (':password')
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

	window .tag_scopes = (window .tag_scopes || {});
	self .on ("before-mount", function () {window .tag_scopes ["page-subaccount-create"] = self;})
	self .on ("update", function () {window .tag_scopes ["page-subaccount-create"] = self;})
	self .on ("update", function () {args = self .opts});

	self .expressions = {};
	self .expressions [0] = function (_item) { return  my (':date-of-birth')  };
	self .expressions [1] = function (_item) { return  my ('picking-date-of-birth')  };
	}) (this, this .args, this .my);
});
riot.tag2('page-table', '<nav> <nav-bar> <nav-buttons> <a href="#team/profile"> <component-x-button></component-x-button> </a> </nav-buttons> <nav-title> <component-page-title> Let\'s Code! </component-page-title> </nav-title> </nav-bar> </nav> <component-main-content> <table> <tr> <th>Rank</th> <th>Name</th> <th></th> <th>Score</th> </tr> <tr> <td>1</td> <td>Not You</td> <td><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon></td> <td>1654</td> </tr> <tr> <td>1</td> <td>Not You</td> <td><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon></td> <td>1654</td> </tr> <tr> <td>1</td> <td>Not You</td> <td><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon></td> <td>1654</td> </tr> <tr active> <td>1</td> <td>You</td> <td><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon></td> <td>1654</td> </tr> <tr> <td>1</td> <td>Not You</td> <td><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon></td> <td>1654</td> </tr> <tr> <td>1</td> <td>Not You</td> <td><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon></td> <td>1654</td> </tr> <tr> <td>1</td> <td>Not You</td> <td><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon></td> <td>1654</td> </tr> <tr> <td>1</td> <td>Not You</td> <td><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon></td> <td>1654</td> </tr> <tr> <td>1</td> <td>Not You</td> <td><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon></td> <td>1654</td> </tr> <tr> <td>1</td> <td>Not You</td> <td><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon></td> <td>1654</td> </tr> <tr> <td>1</td> <td>Not You</td> <td><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon></td> <td>1654</td> </tr> <tr> <td>1</td> <td>Not You</td> <td><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon></td> <td>1654</td> </tr> <tr> <td>1</td> <td>Not You</td> <td><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon></td> <td>1654</td> </tr> <tr> <td>1</td> <td>Not You</td> <td><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon></td> <td>1654</td> </tr> <tr> <td>1</td> <td>Not You</td> <td><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon></td> <td>1654</td> </tr> <tr> <td>1</td> <td>Not You</td> <td><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon></td> <td>1654</td> </tr> </table> </component-main-content> <component-tabs tab="teams"></component-tabs>', '', '', function(opts) {
});
