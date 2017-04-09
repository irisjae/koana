riot.tag2('body', '', '', '', function(opts) {
(function (self, args, my, me) {

		self
			.establish (':api', placeholder ())
			.have (api ({ api__for: ':api'}))

		var tag_name =	function (page_name) {
							return 'page-' + replace_all ('/', '-') (trim_trailing_slash (page_name));
						};
							var trim_trailing_slash =	function (path) {
															if (path [path .length - 1] === '/')
																return path .slice (0, -1);
															else
																return path;
														};
		var page_name =	function (path) {
							return path .slice (path .indexOf ('#') + 1, path .indexOf ('/#') === -1 ? undefined : path .indexOf ('/#'));
						};
		var page_params =	function (path) {
								return (path .indexOf ('/#') !== -1 ? path .slice (path .indexOf ('/#') + 2) .split ('/') : []);
							};

		if (riot .util .tags .selectTags () .split (',') .indexOf (tag_name (page_name (window .location .hash))) === -1) {
			setTimeout (function () { window .location .hash = '#matches/find'; }, 0);
		}

		self
			.establish ('page', function (pages_to) {
				return 	pages_to
							.thru (filter, [function (page) {
								return riot .util .tags .selectTags () .split (',') .indexOf (page .name) !== -1
							}])
							.thru (map, function (page) {
								if (my ('pages') [page .id]) {
									return my ('pages') [page .id];
								}
								else {
									var root = document .createElement (page .name);
									page .tag =	riot .mount (root, page .name, {
													params: page .params,
													parent: self,
													load__to: ':load',
													unload__to: ':unload'
												}) [0];

									return page;
								}
							});
			})
			.establish ('pages', viewpoint_of (
				scan (function (pages, page) {
					return with_ (page .id, page) (pages)
				}, {}, self .findings ('page'))
			));

		var hash_changes = stream ();
		hash_changes
			.thru (map, function () {
				return window .location .hash;
			})
			.thru (dropRepeats)
			.thru (tap, function (path) {
				self .ask ('page', {
					name: tag_name (page_name (path)),
					params: page_params (path),
					id: tag_name (page_name (path)) + '/' + page_params (path) .join ('/')
				});
			});
			window .location .hash && hash_changes (window .location .hash);
			window .addEventListener ('hashchange', hash_changes);

		self .findings ('page')
			.thru (dropRepeats)
			.thru (scan, [function (prev, curr) {
				var time;
				Promise .resolve ()
					.then (function () {
						var unload = prev && prev .tag .dialogue (':unload') && promise (prev .tag .findings (':unload'))
						prev && prev .tag .dialogue (':unload') && prev .tag .ask (':unload', curr);
						return unload;
					})
					.then (function () {
						time = new Date ()
						next_tick () .then (self .root .insertBefore .bind (self .root, curr .tag .root, null));
					})
					.then (function () {
						var load = curr .tag .dialogue (':load') && promise (curr .tag .findings (':load'));
						curr .tag .dialogue (':load') && curr .tag .ask (':load', prev);
						return load;
					})
					.then (function () {
						prev && prev .tag .root && next_tick () .then (self .root .removeChild .bind (self .root, prev .tag .root));
					})
					.then (function () {
						log ('update page time ' + (new Date () - time) + 'ms', curr);
					})
				return curr;
			}, {
				tag:	paper (function (self) {
							self .establish (':unload', function (reqs) {
								return	reqs .thru (map, function () {
											return 	localforage .getItem (':' + backend_path + '/auth/login:write')
														.then (function (login) {
															if (login) {
																self .ask (':api', { login: login })
																return self .findings (':api') .thru (promise)
															}
														}) .then (function (x) {
															return x;
														});
										})
							})
						}) () (self)
			}])

		var resizes = stream ();
		resizes .thru (map, function () {
			return window .innerWidth;
		}) .thru (trans, R .dropRepeats) .thru (map, function (width) {
			return { width: width, height: window .innerHeight };
		}) .thru (tap, function (size) {
			self .root .style .setProperty ('width', size .width + 'px', 'important');
			self .root .style .setProperty ('height', size .height + 'px', 'important');
		});
			resizes (window .innerWidth);
			window .addEventListener ('resize', resizes);

}) (this, opts, this .my, this .me);
});
riot.tag2('component-age-range-picker', '<range bounds="full"></range> <range bounds="selection" riot-style="left: {my (\'left\')}%; width: {my (\'width\')}%;"></range> <knob ref="min_knob" riot-style="left: {my (\'left\')}%;"> <tooltip>{my (\'min\') === + args .min && \'U\'}{my (\'min\')}</tooltip> </knob> <knob ref="max_knob" riot-style="left: {my (\'right\')}%;"> <tooltip>{my (\'max\') === + args .max && \'A\'}{my (\'max\')}</tooltip> </knob>', '', '', function(opts) {
(function (self, args, my, me) {

		var min = + args .min;
		var max = + args .max;

		self .establish ('range', delegation (self .dialogue (args .range__to), function (backing, inputs) {
			var ranges = stream ({ min: 20, max: 40 });
			inputs .thru (tap, [ranges]);

			return 	ranges
						.thru (trans, [R .filter (function (range) {
							return 	range .max - 5 >= range .min
									&& range .min >= min
									&& max >= range .max;
						})])
						.map (function (range) {
							return 	{
										min: Math .round (range .min),
										max: Math .round (range .max)
									}
						})
						.thru (trans, [R .dropRepeatsWith (json_equal)])
						.thru (backing)
		}))
		self .findings ('range') .thru (tap, [self .render])

		self
			.establish ('min', dependent (function () {
				return (my ('range') || {}) .min;
			}, self .findings ('range')))
			.establish ('max', dependent (function () {
				return (my ('range') || {}) .max;
			}, self .findings ('range')))

			.establish ('left', dependent (function () {
				return	100 *
							(my ('min') - min)
							/ (max - min);
			}, self .findings ('min')))
			.establish ('width', dependent (function () {
				return	100 *
							(my ('max') - my ('min'))
							/ (max - min);
			}, self .findings ('max'), self .findings ('min')))
			.establish ('right', dependent (function () {
				return	100 *
							(my ('max') - min)
							/ (max - min);
			}, self .findings ('max')))
			.establish ('x', dependent (function () {
				return self .root .clientWidth;
			} ))

			.establish ('min_knob', ref)
			.establish ('max_knob', ref)

		self .findings ('min_knob') .thru (tap, function (knob) {
			draggable_knob (knob)
				.on ('dragmove', function (event) {
					self .ask ('range',
						with_ ('min', min + (event .clientX / my ('x')) * (max - min)) (my ('range'))
					)
				});
		})

		self .findings ('max_knob') .thru (tap, function (knob) {
			draggable_knob (knob)
				.on ('dragmove', function (event) {
					self .ask ('range',
						with_ ('max', min + (event .clientX / my ('x')) * (max - min)) (my ('range'))
					)
				});
		})

			var draggable_knob =	function (knob) {
										return	interact (knob)
													.origin ('parent')
													.draggable (true)

									};

}) (this, opts, this .my, this .me);
});
riot.tag2('component-back-button', '<icon-holder nav-button><icon>&#xf104;</icon></icon-holder>', '', '', function(opts) {
});
riot.tag2('component-cancel-button', '<span>取消</span>', '', '', function(opts) {
});
riot.tag2('component-checkbox', '', '', '', function(opts) {
(function (self, args, my, me) {

	    self .root .addEventListener ('click', function () {
	        if (self .root .getAttribute ('checked')) {
	            self .root .removeAttribute ('checked');
	            self .ask (args .check__to, false)
	        }
	        else {
	            self .root .setAttribute ('checked', true);
	            self .ask (args .check__to, true)
	        }
	    });

}) (this, opts, this .my, this .me);
});
riot.tag2('component-choose-opponent-item', '<a> <team> <team-graphic> <image-holder size="64x64"> <team-picture> <img src="http://placehold.it/128x128"> </team-picture> </image-holder> </team-graphic> <team-info> <info-holder> <team-timestamp>2016年12月18日 2:00PM</team-timestamp> <br> <team-name>碧含足球隊</team-name> <br> <team-strength><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon></team-strength> <team-rating> <svg width="16" height="14" viewbox="0 0 16 14" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:figma="http://www.figma.com/figma/ns"><title>Like logo</title><desc>Created using Figma</desc><g id="Canvas" transform="translate(847 -193)" figma:type="canvas"><g id="Like logo" style="mix-blend-mode:normal;" figma:type="frame"><g id="Vector" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#f9e711fa-e4af-4ec5-8571-7653c7da29c2" transform="translate(-846.414 193)" fill="#2980B9" style="mix-blend-mode:normal;"></use></g></g></g><defs><path id="f9e711fa-e4af-4ec5-8571-7653c7da29c2" d="M 14.5498 9.51777C 14.8661 9.15182 15.0177 8.75951 14.9984 8.3555C 14.979 7.9105 14.7596 7.56211 14.5789 7.34839C 14.7886 6.87411 14.8693 6.12756 14.1691 5.54789C 13.656 5.12338 12.7847 4.93308 11.5779 4.98578C 10.7292 5.02091 10.0193 5.16437 9.9903 5.17022L 9.98707 5.17022C 9.82573 5.19657 9.65471 5.22877 9.48046 5.26391C 9.46755 5.07654 9.50305 4.61104 9.88381 3.56294C 10.3356 2.31577 10.3098 1.36136 9.79992 0.723128C 9.26426 0.0526976 8.40915 0 8.15745 0C 7.91544 0 7.69279 0.090757 7.53467 0.257633C 7.17649 0.635299 7.21844 1.33208 7.26362 1.65412C 6.83767 2.69051 5.64374 5.2317 4.63374 5.93726C 4.61438 5.94898 4.59825 5.96361 4.58211 5.97825C 4.28524 6.26223 4.08518 6.56964 3.94965 6.83898C 3.75927 6.7453 3.54307 6.6926 3.31074 6.6926L 1.34237 6.6926C 0.600192 6.6926 0 7.24007 0 7.9105L 0 12.6679C 0 13.3413 0.603419 13.8858 1.34237 13.8858L 3.31074 13.8858C 3.59793 13.8858 3.86575 13.8038 4.08518 13.6633L 4.84349 13.7453C 4.95965 13.7599 7.02483 13.9971 9.14487 13.959C 9.52886 13.9854 9.89027 14 10.2259 14C 10.8035 14 11.3069 13.959 11.7263 13.877C 12.7138 13.6867 13.3882 13.3061 13.7302 12.747C 13.9916 12.3195 13.9916 11.895 13.9496 11.6257C 14.5918 11.0987 14.7047 10.5161 14.6821 10.1062C 14.6692 9.86909 14.6111 9.66708 14.5498 9.51777ZM 1.34237 13.0954C 1.08099 13.0954 0.871247 12.9021 0.871247 12.6679L 0.871247 7.90757C 0.871247 7.67043 1.08422 7.48013 1.34237 7.48013L 3.31074 7.48013C 3.57211 7.48013 3.78186 7.67336 3.78186 7.90757L 3.78186 12.665C 3.78186 12.9021 3.56889 13.0924 3.31074 13.0924L 1.34237 13.0924L 1.34237 13.0954ZM 13.7238 9.17524C 13.5882 9.30406 13.5624 9.50021 13.6657 9.65245C 13.6657 9.65537 13.798 9.86031 13.8141 10.1414C 13.8367 10.5249 13.6334 10.8645 13.2075 11.1543C 13.0558 11.2597 12.9945 11.4412 13.059 11.6052C 13.059 11.6081 13.1978 11.9946 12.9719 12.3605C 12.7557 12.7118 12.2749 12.9636 11.5456 13.1041C 10.9616 13.2183 10.1678 13.2388 9.19327 13.1685C 9.18036 13.1685 9.16423 13.1685 9.14809 13.1685C 7.07323 13.2095 4.97579 12.9636 4.9532 12.9607L 4.94997 12.9607L 4.62406 12.9256C 4.64342 12.8436 4.6531 12.7558 4.6531 12.6679L 4.6531 7.90757C 4.6531 7.78168 4.63052 7.65872 4.59179 7.54454C 4.64988 7.34839 4.81122 6.91217 5.19199 6.54036C 6.64084 5.49812 8.05742 1.98202 8.11873 1.82978C 8.14455 1.7683 8.151 1.70096 8.13809 1.63363C 8.08324 1.30573 8.1026 0.904642 8.18004 0.784609C 8.35106 0.787537 8.8125 0.831451 9.09001 1.17984C 9.41915 1.59264 9.40624 2.33041 9.05129 3.30824C 8.50918 4.79841 8.464 5.58302 8.89317 5.92848C 9.10614 6.10121 9.39011 6.11 9.59662 6.04266C 9.79346 6.00167 9.98062 5.96654 10.1581 5.94019C 10.171 5.93726 10.1871 5.93434 10.2 5.93141C 11.1907 5.73526 12.9654 5.61522 13.5818 6.12463C 14.1045 6.55793 13.7334 7.13174 13.6915 7.19322C 13.5721 7.35717 13.6076 7.57089 13.7689 7.70263C 13.7722 7.70556 14.111 7.9954 14.1271 8.38478C 14.14 8.64534 14.0045 8.91175 13.7238 9.17524Z"></path></defs></svg> 62/62 </team-rating> </info-holder> </team-info> <team-action><svg width="8" height="13" viewbox="0 0 8 13" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:figma="http://www.figma.com/figma/ns"><title>enter</title><desc>Created using Figma</desc><g id="Canvas" transform="translate(722 -173)" figma:type="canvas"><g id="enter" style="mix-blend-mode:normal;" figma:type="frame"><g id="Vector" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#c1d1a5d7-a395-472e-aae3-af5c1e4f26c7" transform="translate(-721.611 173.37)" fill="#7F8C8D" style="mix-blend-mode:normal;"></use></g><g id="Vector" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#902c7c0c-156c-499c-aa70-5ef7d2058777" transform="translate(-722 173)" fill="#7F8C8D" style="mix-blend-mode:normal;"></use></g></g></g><defs><path id="c1d1a5d7-a395-472e-aae3-af5c1e4f26c7" d="M 0.778233 12.2596L -6.08861e-08 11.5193L 5.66475 6.12981L -6.08861e-08 0.740374L 0.778233 8.98823e-09L 7.22149 6.12981L 0.778233 12.2596Z"></path><path id="902c7c0c-156c-499c-aa70-5ef7d2058777" d="M 1.16735 13L 6.08861e-08 11.8894L 5.66475 6.5L 6.08861e-08 1.11056L 1.16735 0L 8 6.5L 1.16735 13ZM 0.778233 11.8894L 1.16735 12.2596L 7.22149 6.5L 1.16735 0.740374L 0.778233 1.11056L 6.44299 6.5L 0.778233 11.8894Z"></path></defs></svg ></team-action> </team> </a>', '', '', function(opts) {
});
riot.tag2('component-color-control', '<image-holder size="32x32" riot-style="background: {my (\'color\')};"> <input ref="trigger" readonly> </image-holder> <color-picker ref="picker"></color-picker>', '', '', function(opts) {
(function (self, args, my, me) {

		var picker;

		self
			.establish ('color', delegation (self .dialogue (args .color__to), function (backing, input_colors) {
				var colors = stream ('#1E8449');

				input_colors .thru (tap, colors);

				return 	colors .thru (dropRepeats) .thru (backing)
			}))

		self .findings ('color') .thru (tap, self .render)

		self
			.establish ('trigger', ref)

		self .findings ('trigger') .thru (tap, function (ref) {
			picker = new jscolor (ref, { container: self .refs .picker });
			picker .fromString (my ('color'));

			ref .addEventListener ('change', function () {
				self .ask ('color', picker .toHEXString ());
			});
		});

}) (this, opts, this .my, this .me);
});
riot.tag2('component-confirm-button', '<span>確定</span>', '', '', function(opts) {
});
riot.tag2('component-create-button', '<span>建立</span>', '', '', function(opts) {
});
riot.tag2('component-date-bar', '<span>{my (\'date\')}</span> <span>{my (\'day-of-week\')}</span>', '', '', function(opts) {
(function (self, args, my, me) {

	    self
	        .establish ('date', dependent (function () {

	            var date = fecha .parse (my (args .date__from), 'YYYYMMDD');
	            return fecha .format (date, 'YYYY年M月D日');
	        }, self .findings (args .date__from)))
	        .establish ('day-of-week', dependent (function () {

	            var date = fecha .parse (my (args .date__from), 'YYYYMMDD');
	            return '星期' + (function (day) {
									if (day === '0') return '日'
									if (day === '1') return '一'
									if (day === '2') return '二'
									if (day === '3') return '三'
									if (day === '4') return '四'
									if (day === '5') return '五'
									if (day === '6') return '六'
								}) (fecha .format (date, 'd'));
	        }, self .findings (args .date__from)))

}) (this, opts, this .my, this .me);
});
riot.tag2('component-date-picker', '<input ref="input">', '', '', function(opts) {
(function (self, args, my, me) {

		self
			.on ('mount', function () {
				var picker =	new Flatpickr (self .root .firstElementChild, {
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

			.establish ('input', ref)

		self .findings ('input') .thru (tap, function (input) {
			input .addEventListener ('change', function () {
				self .ask (args .date__to, input .value);
			});
		})

}) (this, opts, this .my, this .me);
});
riot.tag2('component-day-of-week-picker', '<table> <tr> <th>一</th> <th>二</th> <th>三</th> <th>四</th> <th>五</th> <th>六</th> <th>日</th> </tr> <tr> <td><component-checkbox check__to=":mon"></component-checkbox></td> <td><component-checkbox check__to=":tue"></component-checkbox></td> <td><component-checkbox check__to=":wed"></component-checkbox></td> <td><component-checkbox check__to=":thu"></component-checkbox></td> <td><component-checkbox check__to=":fri"></component-checkbox></td> <td><component-checkbox check__to=":sat"></component-checkbox></td> <td><component-checkbox check__to=":sun"></component-checkbox></td> </tr> </table>', '', '', function(opts) {
(function (self, args, my, me) {

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
				([self .findings (':mon'), self .findings (':tue'), self .findings (':wed'), self .findings (':thu'), self .findings (':fri'), self .findings (':sat'), self .findings (':sun')])
			))
			.findings ('days')
				.thru (tap, function (days) {
					self .ask (args .days__to, days);
				})

}) (this, opts, this .my, this .me);
});
riot.tag2('component-dynamic-load', '<item each="{nth in arrayify (my (\'loaded-range\'))}" nth="{nth}"> {me (\'loads-item\') (nth, self)}<yield></yield> </item> <component-loading-item if="{! me (\'done-loading\')}">', '', '', function(opts) {
(function (self, args, my, me) {

		var list = closest_parent (self .root, 'main-content');
		var dynamic_load = self .root;

		var items_to_load = + args .items_to_load;
		var loading_interval = + args .interval_for_loading;

		var item_source = args .items__from;

		var buffer = {};
		var items = [];

		self
			.establish ('imported-items', viewpoint_of (
				self .findings (item_source)
					.thru (map, function (new_items) {

						for (var nth in new_items) {
							buffer [nth] = new_items [nth];
						}

						for (var next = items .length; next in buffer; next ++) {
							items .push (buffer [next]);
							delete buffer [next];
						}

						for (var nth in buffer) {
							if (nth < items .length) {
								items [nth] = buffer [nth];
								delete buffer [nth];
							}
						}
						return items;
					})
			))
			.establish ('loaded-range', dependent (function () {
				return rangify (my ('imported-items'));
			}, self .findings ('imported-items')))
			.establish ('done-loading', viewpoint_of (
				scan (function (ended) {
					return true;
				}, false, self .findings (item_source) .end)
			))

			.establish ('loads-item', property (function (nth, item) {
				var data = my ('imported-items') [nth]
				if (! item .isMounted) {
					item .remembers (':item', data);
					item .remembers (':nth', nth);
				}
				else {
					item .ask (':item', data);
					item .ask (':nth', nth);
				}
			}))

		self .findings ('loaded-range')
			.thru (dropRepeatsWith, [json_equal])
			.thru (throttle, [loading_interval])
			.thru (tap, function () {
				var date = new Date ();
				self .render ()
					.then (function () {
						log ('dynamic-load ' + (new Date () - date) + 'ms');
					});
			})

}) (this, opts, this .my, this .me);
});
riot.tag2('component-edit-button', '<span>修改</span>', '', '', function(opts) {
});
riot.tag2('component-football-field-picker', '<selected-location> <input type="text" placeholder="請選擇球場" riot-value="{me (\'location\')}" disabled readonly><a disabled="{! me (\'location\')}" ref="done"><icon class="fa-check"></icon></a> </selected-location> <football-field-map ref="map"></football-field-map>', '', '', function(opts) {
(function (self, args, my, me) {

	    self
	        .remembers ('location')
	        .findings ('location')
	            .thru (tap, [self .render])

	    self
	        .establish ('done', ref)
	        .findings ('done')
	            .thru (tap, [function (ref) {
	                ref .addEventListener ('click', function () {
	                    if (me ('location')) {
	                        self .ask (args .location__to, me ('location'));
	                    }
	                });
	            }])

	    self
	        .establish ('map', ref)
	        .findings ('map')
	            .thru (tap, [function (ref) {
	                var map = L .map (ref) .setView ([51.505, -0.09], 13);

	            	L .tileLayer ('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw', {
	            		maxZoom: 18,
	            		id: 'mapbox.streets'
	            	}) .addTo (map);

	            	L .marker ([51.5, -0.09])
	            	    .bindPopup ('旺角大球場')
	            	    .on ('click', function () {
	            	        self .ask ('location', '旺角大球場');
	            	    })
	            	    .addTo (map);

	            	L .marker ([51.5, -0.08])
	            	    .bindPopup ('摩士十號場')
	            	    .on ('click', function () {
	            	        self .ask ('location', '摩士十號場');
	            	    })
	            	    .addTo (map);
	            }])

}) (this, opts, this .my, this .me);
});
riot.tag2('component-input-control', '<input ref="input" type="{args .type}" placeholder="{args .placeholder}" maxlength="{args .maxlength}">', '', '', function(opts) {
(function (self, args, my, me) {

	    self .establish ('input', ref)

	    self .findings ('input') .thru (tap, function (ref) {
	        if (args .change__to)
	            ref .addEventListener ('change', function () {
	                self .ask (args .change__to, ref .value)
	            })
	        if (args .input__to)
	            ref .addEventListener ('input', function () {
	                self .ask (args .input__to, ref .value)
	            })
	    })

}) (this, opts, this .my, this .me);
});
riot.tag2('component-loading-item', '<div> <spinner></spinner> </div>', '', '', function(opts) {
});
riot.tag2('component-location-highlight', '<span>樂富</span>', '', '', function(opts) {
});
riot.tag2('component-main-content', '<main-content-holder> <main-content> <yield></yield> </main-content> </main-content-holder>', '', '', function(opts) {
});
riot.tag2('component-matches-find-item', '<a href="#match/preview/find/#{my (\'id\')}"> <match> <match-graphic> <image-holder size="64x64"> <box-highlight> <box-top> <component-location-highlight></component-location-highlight> </box-top> <box-bottom> <component-time-highlight time__from=":time"></component-time-highlight> </box-bottom> </box-highlight> </image-holder> </match-graphic> <match-info> <info-holder> <match-location><icon-holder><icon class="fa-map-marker"></icon></icon-holder>{my (\'location\')}</match-location> <match-field-type>{my (\'field-type\')}</match-field-type> <match-number-of-players>{my (\'num-of-players\')}人</match-number-of-players> <br> <match-team-name>{my (\'team-name\')}</match-team-name> <match-team-strength><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon></match-team-strength> <br> </info-holder> </match-info> <match-substatus>已報名:{my (\'apply-numbers\')}</match-substatus> </match> </a>', '', '', function(opts) {
(function (self, args, my, me) {

		self
			.establish ('location', computed (function () {
				return location_from_api (my (args .match__from) .location);
			}))
			.establish ('num-of-players', computed (function () {
				return my (args .match__from) .match_type_value;
			}))
			.establish ('team-name', computed (function () {
				return my (args .match__from) .home_team .long_name;
			}))
			.establish ('field-type', computed (function () {
				return pitch_type_to_chi (my (args .match__from) .pitch_type);
			}))
			.establish ('apply-numbers', computed (function () {
				return my (args .match__from) .applied_opponent_count;
			}))

			.establish (':time', computed (function () {
				var date_time = new Date (my (args .match__from) .start_at);
				return fecha .format (date_time, 'h:mmA');
			}))

			.establish ('id', computed (function () {
				return my (args .match__from) .id;
			}))

}) (this, opts, this .my, this .me);
});
riot.tag2('component-matches-find-wrap', '<component-date-bar date__from=":date" if="{my (\':date\')}"></component-date-bar> <component-matches-find-item match__from=":match" if="{my (\':match\')}"></component-matches-find-item>', '', '', function(opts) {
(function (self, args, my, me) {

	    self
	        .establish (':date', dependent (function () {
	            return my (args .item__from) .date;
	        }, self .findings (args .item__from)))
	        .establish (':match', dependent (function () {
	            return my (args .item__from) .match;
	        }, self .findings (args .item__from)))

}) (this, opts, this .my, this .me);
});
riot.tag2('component-page-title', '<span>{args .page}</span>', '', '', function(opts) {
});
riot.tag2('component-search-bar', '<icon class="fa-search"></icon><input type="text">', '', '', function(opts) {
});
riot.tag2('component-select-control', '<yield></yield>', '', '', function(opts) {
(function (self, args, my, me) {

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
	            self .ask (args .select__to, multiple ? values : values [0]);
	        }
	    })

}) (this, opts, this .my, this .me);
});
riot.tag2('component-separator', '<hr>', '', '', function(opts) {
});
riot.tag2('component-table-control', '<span ref="span">{my (\'message\') || \'未輸入\'}</span><svg ref="svg" width="9" height="16" viewbox="0 0 9 16" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:figma="http://www.figma.com/figma/ns"><title>right-arrow</title><desc>Created using Figma</desc><g id="Canvas" transform="translate(734 258)" figma:type="canvas"><g id="right-arrow" style="mix-blend-mode:normal;" figma:type="frame"><g id="Group" style="mix-blend-mode:normal;" figma:type="frame"><g id="Vector" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#0b39f1b4-0614-4a28-a406-f607ebc22df0" transform="translate(-733.297 -256.973)" fill="#CCD1D1" style="mix-blend-mode:normal;"></use></g><g id="Vector" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#dd187232-741f-4707-87f3-4b5c131211ec" transform="translate(-733.721 -257.397)" fill="#CCD1D1" style="mix-blend-mode:normal;"></use></g></g></g></g><defs><path id="0b39f1b4-0614-4a28-a406-f607ebc22df0" d="M 0.8484 14.0484L -6.63757e-08 13.2L 6.1755 7.0242L -6.63757e-08 0.8484L 0.8484 1.02997e-08L 7.8726 7.0242L 0.8484 14.0484Z"></path><path id="dd187232-741f-4707-87f3-4b5c131211ec" d="M 1.2726 14.8968L 6.63757e-08 13.6242L 6.1755 7.4484L 6.63757e-08 1.2726L 1.2726 0L 8.7213 7.4484L 1.2726 14.8968ZM 0.8484 13.6242L 1.2726 14.0484L 7.8726 7.4484L 1.2726 0.8484L 0.8484 1.2726L 7.0239 7.4484L 0.8484 13.6242Z"></path></defs></svg> <fullscreen-holder active="{me (\'picking\')}"> <yield></yield> </fullscreen-holder>', '', '', function(opts) {
(function (self, args, my, me) {

		self .establish ('span', ref) .establish ('svg', ref)

		self .remembers ('picking')
		self .findings ('picking') .thru (tap, self .render);
		self .root .addEventListener ('click', function (e) {
			if (e .target === my ('span') || e .target === my ('svg'))
				self .ask ('picking', true);
		});

		self .establish ('message', delegation (self .dialogue (args .message__from)))
		self .findings ('message')
			.thru (delay, 150)
			.thru (tap, function () {
				self .ask ('picking', false);
			})

}) (this, opts, this .my, this .me);
});
riot.tag2('component-tabs', '<tabs> <tab active="{args .tab === \'matches\'}"> <a href="#matches/find"> <svg width="295" height="372" viewbox="0 0 295 372" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:figma="http://www.figma.com/figma/ns"> <title>football (3)</title> <desc>Created using Figma</desc> <g id="Canvas" transform="translate(640 2125)" figma:type="canvas"> <g id="football (3)" style="mix-blend-mode:normal;" figma:type="frame"> <g id="XMLID 409" style="mix-blend-mode:normal;" figma:type="frame"> <g id="XMLID 410" style="mix-blend-mode:normal;" figma:type="vector"> <use xlink:href="#16dd6d04-3d9e-4b5a-a1ac-e51e5dc4f9c3" transform="translate(-504.923 -2030.81)" style="mix-blend-mode:normal;"></use> </g> <g id="XMLID 411" style="mix-blend-mode:normal;" figma:type="vector"> <use xlink:href="#e158eb76-877c-47e2-845b-cf134fc3c98a" transform="translate(-562.068 -2063.87)" style="mix-blend-mode:normal;"></use> </g> <g id="XMLID 412" style="mix-blend-mode:normal;" figma:type="vector"> <use xlink:href="#69dddb27-d2d1-4f91-bfe4-80ebb0feda5a" transform="translate(-488.65 -2124.09)" style="mix-blend-mode:normal;"></use> </g> </g> <mask id="mask0_alpha" mask-type="alpha"> <path d="M -639.304 -2124.09L -564.389 -2124.09L -564.389 -2049.22L -639.304 -2049.22L -639.304 -2124.09Z" fill="#FFFFFF"></path> </mask> <g id="Group" style="mix-blend-mode:normal;" mask="url(#mask0_alpha)" figma:type="frame"> </g> <mask id="mask1_alpha" mask-type="alpha"> <path d="M -639.304 -2124.09L -564.389 -2124.09L -564.389 -2049.22L -639.304 -2049.22L -639.304 -2124.09Z" fill="#FFFFFF"></path> </mask> <g id="Group" style="mix-blend-mode:normal;" mask="url(#mask1_alpha)" figma:type="frame"> </g> <mask id="mask2_alpha" mask-type="alpha"> <path d="M -639.304 -2124.09L -564.389 -2124.09L -564.389 -2049.22L -639.304 -2049.22L -639.304 -2124.09Z" fill="#FFFFFF"></path> </mask> <g id="Group" style="mix-blend-mode:normal;" mask="url(#mask2_alpha)" figma:type="frame"> </g> <mask id="mask3_alpha" mask-type="alpha"> <path d="M -639.304 -2124.09L -564.389 -2124.09L -564.389 -2049.22L -639.304 -2049.22L -639.304 -2124.09Z" fill="#FFFFFF"></path> </mask> <g id="Group" style="mix-blend-mode:normal;" mask="url(#mask3_alpha)" figma:type="frame"> </g> <mask id="mask4_alpha" mask-type="alpha"> <path d="M -639.304 -2124.09L -564.389 -2124.09L -564.389 -2049.22L -639.304 -2049.22L -639.304 -2124.09Z" fill="#FFFFFF"></path> </mask> <g id="Group" style="mix-blend-mode:normal;" mask="url(#mask4_alpha)" figma:type="frame"> </g> <mask id="mask5_alpha" mask-type="alpha"> <path d="M -639.304 -2124.09L -564.389 -2124.09L -564.389 -2049.22L -639.304 -2049.22L -639.304 -2124.09Z" fill="#FFFFFF"></path> </mask> <g id="Group" style="mix-blend-mode:normal;" mask="url(#mask5_alpha)" figma:type="frame"> </g> <mask id="mask6_alpha" mask-type="alpha"> <path d="M -639.304 -2124.09L -564.389 -2124.09L -564.389 -2049.22L -639.304 -2049.22L -639.304 -2124.09Z" fill="#FFFFFF"></path> </mask> <g id="Group" style="mix-blend-mode:normal;" mask="url(#mask6_alpha)" figma:type="frame"> </g> <mask id="mask7_alpha" mask-type="alpha"> <path d="M -639.304 -2124.09L -564.389 -2124.09L -564.389 -2049.22L -639.304 -2049.22L -639.304 -2124.09Z" fill="#FFFFFF"></path> </mask> <g id="Group" style="mix-blend-mode:normal;" mask="url(#mask7_alpha)" figma:type="frame"> </g> <mask id="mask8_alpha" mask-type="alpha"> <path d="M -639.304 -2124.09L -564.389 -2124.09L -564.389 -2049.22L -639.304 -2049.22L -639.304 -2124.09Z" fill="#FFFFFF"></path> </mask> <g id="Group" style="mix-blend-mode:normal;" mask="url(#mask8_alpha)" figma:type="frame"> </g> <mask id="mask9_alpha" mask-type="alpha"> <path d="M -639.304 -2124.09L -564.389 -2124.09L -564.389 -2049.22L -639.304 -2049.22L -639.304 -2124.09Z" fill="#FFFFFF"></path> </mask> <g id="Group" style="mix-blend-mode:normal;" mask="url(#mask9_alpha)" figma:type="frame"> </g> <mask id="mask10_alpha" mask-type="alpha"> <path d="M -639.304 -2124.09L -564.389 -2124.09L -564.389 -2049.22L -639.304 -2049.22L -639.304 -2124.09Z" fill="#FFFFFF"></path> </mask> <g id="Group" style="mix-blend-mode:normal;" mask="url(#mask10_alpha)" figma:type="frame"> </g> <mask id="mask11_alpha" mask-type="alpha"> <path d="M -639.304 -2124.09L -564.389 -2124.09L -564.389 -2049.22L -639.304 -2049.22L -639.304 -2124.09Z" fill="#FFFFFF"></path> </mask> <g id="Group" style="mix-blend-mode:normal;" mask="url(#mask11_alpha)" figma:type="frame"> </g> <mask id="mask12_alpha" mask-type="alpha"> <path d="M -639.304 -2124.09L -564.389 -2124.09L -564.389 -2049.22L -639.304 -2049.22L -639.304 -2124.09Z" fill="#FFFFFF"></path> </mask> <g id="Group" style="mix-blend-mode:normal;" mask="url(#mask12_alpha)" figma:type="frame"> </g> <mask id="mask13_alpha" mask-type="alpha"> <path d="M -639.304 -2124.09L -564.389 -2124.09L -564.389 -2049.22L -639.304 -2049.22L -639.304 -2124.09Z" fill="#FFFFFF"></path> </mask> <g id="Group" style="mix-blend-mode:normal;" mask="url(#mask13_alpha)" figma:type="frame"> </g> <mask id="mask14_alpha" mask-type="alpha"> <path d="M -639.304 -2124.09L -564.389 -2124.09L -564.389 -2049.22L -639.304 -2049.22L -639.304 -2124.09Z" fill="#FFFFFF"></path> </mask> <g id="Group" style="mix-blend-mode:normal;" mask="url(#mask14_alpha)" figma:type="frame"> </g> </g> </g> <defs> <path id="16dd6d04-3d9e-4b5a-a1ac-e51e5dc4f9c3" d="M 31.0551 63.016C 34.012 62.8206 36.9973 62.3519 39.925 61.2775C 56.3096 55.2545 64.7405 37.1007 58.7151 20.7004C 52.6875 4.3247 34.5214 -4.07314 18.1106 1.94991C 9.59356 5.07636 3.297 11.5232 4.48098e-06 19.2569L 5.95646 41.723L 31.0551 63.016Z"></path> <path id="e158eb76-877c-47e2-845b-cf134fc3c98a" d="M 213.128 277.041C 207.158 268.062 181.124 229.038 175.339 219.934C 175.339 219.934 145.034 144.516 141.851 135.833L 163.539 132.597C 168.688 131.833 173.26 128.892 176.074 124.523L 208.418 74.4857C 213.849 66.0856 211.429 54.8743 203.041 49.4577C 194.637 44.0433 183.431 46.4473 178 54.8316L 150.098 97.9985L 89.6715 111.558L 53.4802 80.8472L 35.6101 13.4459C 33.051 3.78878 23.1323 -1.92282 13.4683 0.593458C 3.80655 3.15241 -1.95139 13.0506 0.607698 22.7212L 19.9199 95.608C 20.8699 99.1709 22.8753 102.38 25.7078 104.769L 75.5927 147.103C 87.6053 179.749 82.5958 166.162 104.441 225.589L 86.6726 255.269L 57.9646 231.288C 48.7546 223.598 35.0452 224.854 27.3477 234.031C 19.6525 243.235 20.8826 256.935 30.0941 264.626L 78.3249 304.91C 83.3472 309.094 89.8692 310.694 95.8961 309.647C 102.163 308.585 107.652 304.838 110.907 299.38L 145.019 242.386L 166.551 234.61L 129.527 296.496L 190.237 310.238C 198.696 312.191 207.792 308.811 212.928 301.389C 217.967 294.078 218.051 284.436 213.128 277.041Z"></path> <path id="69dddb27-d2d1-4f91-bfe4-80ebb0feda5a" d="M 42.528 61.2775C 58.9104 55.2529 67.3443 37.0992 61.3144 20.6988C 55.2883 4.32538 37.1222 -4.07321 20.7099 1.94985C 4.32983 7.9729 -4.07559 26.1282 1.95054 42.5008C 7.94896 58.9027 26.142 67.3013 42.528 61.2775Z"></path> </defs> </svg> 球賽 <component-wavify></component-wavify> </a> </tab> <tab active="{args .tab === \'todos\'}"> <a href="#todos/check"> <svg width="332" height="199" viewbox="0 0 332 199" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:figma="http://www.figma.com/figma/ns"> <title>Vector</title> <desc>Created using Figma</desc> <g id="Canvas" transform="translate(87 2002)" figma:type="canvas"> <g id="Vector" style="mix-blend-mode:normal;" figma:type="vector"> <use xlink:href="#e13ee5fe-cc7a-495d-a4bc-babdadd12fd5" transform="translate(-86.1018 -2001.95)" style="mix-blend-mode:normal;"></use> </g> </g> <defs> <path id="e13ee5fe-cc7a-495d-a4bc-babdadd12fd5" d="M 325.934 -1.48616e-06L 5.06633 -1.48616e-06C 2.26836 -1.48616e-06 0 2.27123 0 5.07274L 0 192.928C 0 194.904 1.14702 196.701 2.93847 197.531C 4.73161 198.361 6.84123 198.073 8.34559 196.794L 38.3045 171.322L 292.696 171.322L 322.654 196.794C 323.588 197.588 324.755 198 325.935 198C 326.656 198 327.382 197.846 328.062 197.531C 329.854 196.7 331 194.904 331 192.927L 331 5.07274C 331 2.27157 328.732 -1.48616e-06 325.934 -1.48616e-06ZM 289.505 161.178L 277.58 161.178L 271.507 155.098L 284.254 142.334L 289.687 147.774C 289.592 152.168 289.53 156.636 289.505 161.178ZM 72.5856 10.1455L 78.7503 16.318L 66.0031 29.0814L 53.2559 16.318L 59.4206 10.1455L 72.5856 10.1455ZM 112.409 10.1455L 118.574 16.318L 105.827 29.0814L 93.0796 16.318L 99.2443 10.1455L 112.409 10.1455ZM 152.233 10.1455L 158.398 16.318L 145.651 29.0814L 132.903 16.318L 139.068 10.1455L 152.233 10.1455ZM 192.057 10.1455L 198.221 16.318L 185.474 29.0814L 172.727 16.318L 178.892 10.1455L 192.057 10.1455ZM 231.881 10.1455L 238.045 16.318L 225.298 29.0814L 212.551 16.318L 218.716 10.1455L 231.881 10.1455ZM 271.704 10.1455L 277.869 16.318L 265.122 29.0814L 252.375 16.318L 258.539 10.1455L 271.704 10.1455ZM 29.9268 47.1816L 38.9263 56.1925L 33.2223 61.9037C 32.2131 56.7457 31.1126 51.8374 29.9268 47.1816ZM 294.885 79.0296L 285.034 88.8934L 272.287 76.13L 285.034 63.3667L 295.648 73.9944C 295.386 75.6522 295.131 77.3286 294.885 79.0296ZM 36.0942 78.8835C 35.8605 77.2697 35.6176 75.6779 35.369 74.102L 46.0911 63.3663L 58.8383 76.1297L 46.0911 88.8931L 36.0942 78.8835ZM 66.0031 83.3032L 78.7503 96.0666L 66.0031 108.83L 53.2559 96.0666L 66.0031 83.3032ZM 73.1679 76.13L 85.9151 63.3667L 98.6623 76.13L 85.9151 88.8934L 73.1679 76.13ZM 105.827 83.3032L 118.574 96.0666L 105.827 108.83L 93.0796 96.0666L 105.827 83.3032ZM 112.992 76.1297L 125.739 63.3663L 138.486 76.1297L 125.739 88.8931L 112.992 76.1297ZM 145.65 83.3032L 158.397 96.0666L 145.65 108.83L 132.903 96.0666L 145.65 83.3032ZM 152.815 76.1297L 165.562 63.3663L 178.309 76.1297L 165.562 88.8931L 152.815 76.1297ZM 185.474 83.3032L 198.222 96.0666L 185.474 108.83L 172.728 96.0666L 185.474 83.3032ZM 192.639 76.1297L 205.387 63.3663L 218.134 76.1297L 205.387 88.8931L 192.639 76.1297ZM 225.298 83.3032L 238.045 96.0666L 225.298 108.83L 212.551 96.0666L 225.298 83.3032ZM 232.463 76.1297L 245.21 63.3663L 257.957 76.1297L 245.21 88.8931L 232.463 76.1297ZM 265.122 83.3032L 277.869 96.0666L 265.122 108.83L 252.375 96.0666L 265.122 83.3032ZM 265.122 68.9562L 252.375 56.1928L 265.122 43.4294L 277.869 56.1928L 265.122 68.9562ZM 245.21 49.0189L 232.463 36.2556L 245.21 23.4922L 257.957 36.2556L 245.21 49.0189ZM 238.045 56.1925L 225.298 68.9558L 212.551 56.1925L 225.298 43.4291L 238.045 56.1925ZM 205.386 49.0189L 192.639 36.2556L 205.386 23.4922L 218.133 36.2556L 205.386 49.0189ZM 198.221 56.1925L 185.474 68.9558L 172.727 56.1925L 185.474 43.4291L 198.221 56.1925ZM 165.562 49.0189L 152.816 36.2556L 165.562 23.4922L 178.31 36.2556L 165.562 49.0189ZM 158.398 56.1925L 145.651 68.9558L 132.904 56.1925L 145.651 43.4291L 158.398 56.1925ZM 125.739 49.0189L 112.992 36.2556L 125.739 23.4922L 138.486 36.2556L 125.739 49.0189ZM 118.574 56.1925L 105.827 68.9558L 93.0796 56.1925L 105.827 43.4291L 118.574 56.1925ZM 85.9151 49.0189L 73.1679 36.2556L 85.9151 23.4922L 98.6623 36.2556L 85.9151 49.0189ZM 78.7503 56.1925L 66.0031 68.9558L 53.2559 56.1925L 66.0031 43.4291L 78.7503 56.1925ZM 46.0911 49.0189L 33.3439 36.2556L 46.0911 23.4922L 58.8383 36.2556L 46.0911 49.0189ZM 40.2665 121.374C 40.0361 117.462 39.7737 113.624 39.4795 109.861L 46.0911 103.241L 58.8383 116.004L 46.8706 127.987L 40.2665 121.374ZM 66.0031 123.178L 78.7503 135.941L 66.7826 147.924L 54.0354 135.161L 66.0031 123.178ZM 73.1679 116.004L 85.9151 103.241L 98.6623 116.004L 85.9151 128.767L 73.1679 116.004ZM 105.827 123.178L 118.574 135.941L 105.827 148.704L 93.0796 135.941L 105.827 123.178ZM 112.992 116.004L 125.739 103.241L 138.486 116.004L 125.739 128.767L 112.992 116.004ZM 145.65 123.178L 158.397 135.941L 145.65 148.704L 132.903 135.941L 145.65 123.178ZM 152.815 116.004L 165.562 103.241L 178.309 116.004L 165.562 128.767L 152.815 116.004ZM 185.474 123.178L 198.222 135.941L 185.474 148.704L 172.728 135.941L 185.474 123.178ZM 192.639 116.004L 205.387 103.241L 218.134 116.004L 205.387 128.767L 192.639 116.004ZM 225.298 123.178L 238.045 135.941L 225.298 148.704L 212.551 135.941L 225.298 123.178ZM 232.463 116.004L 245.21 103.241L 257.957 116.004L 245.21 128.767L 232.463 116.004ZM 265.122 123.178L 277.09 135.161L 264.342 147.924L 252.375 135.941L 265.122 123.178ZM 272.287 116.004L 285.034 103.241L 291.529 109.744C 291.228 113.587 290.959 117.508 290.725 121.507L 284.254 127.987L 272.287 116.004ZM 292.199 56.1925L 301.03 47.3493C 299.869 51.9239 298.789 56.7403 297.798 61.7989L 292.199 56.1925ZM 285.034 49.0189L 272.287 36.2556L 285.034 23.4922L 297.781 36.2556L 285.034 49.0189ZM 38.9263 16.318L 26.1791 29.0814L 23.348 26.2464C 20.5963 19.1682 17.8916 13.9453 15.5374 10.1455L 32.7619 10.1455L 38.9263 16.318ZM 41.3152 147.897L 46.8706 142.334L 59.6178 155.098L 53.5453 161.178L 41.4952 161.178C 41.4699 156.678 41.4095 152.251 41.3152 147.897ZM 73.9474 155.097L 85.9151 143.115L 98.6623 155.878L 93.3694 161.178L 80.0199 161.178L 73.9474 155.097ZM 112.992 155.878L 125.739 143.115L 138.486 155.878L 133.193 161.178L 118.284 161.178L 112.992 155.878ZM 152.815 155.878L 165.562 143.115L 178.309 155.878L 173.016 161.178L 158.108 161.178L 152.815 155.878ZM 192.639 155.878L 205.387 143.115L 218.134 155.878L 212.841 161.178L 197.932 161.178L 192.639 155.878ZM 232.463 155.878L 245.21 143.115L 257.178 155.098L 251.105 161.178L 237.756 161.178L 232.463 155.878ZM 307.573 26.451L 304.946 29.0817L 292.199 16.318L 298.363 10.1455L 314.961 10.1455L 315.463 10.1455C 314.575 11.5787 313.637 13.2142 312.666 15.0755C 311.037 18.1966 309.314 21.9521 307.573 26.451ZM 10.1327 181.966L 10.1327 21.319C 12.1703 25.4266 14.415 30.7743 16.654 37.6631C 28.5751 74.3434 31.269 126.095 31.3737 163.906L 10.1327 181.966ZM 320.867 181.966L 299.626 163.906C 299.731 126.095 302.425 74.3438 314.346 37.6634C 316.585 30.7746 318.829 25.427 320.867 21.3194L 320.867 181.966Z"></path> </defs> </svg> 日程 <component-wavify></component-wavify> </a> </tab> <tab active="{args .tab === \'teams\'}"> <a href="#team/profile"> <svg width="488" height="317" viewbox="0 0 488 317" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:figma="http://www.figma.com/figma/ns"> <title>XMLID 277</title> <desc>Created using Figma</desc> <g id="Canvas" transform="translate(-399 2070)" figma:type="canvas"> <g id="XMLID 277" style="mix-blend-mode:normal;" figma:type="frame"> <g id="XMLID 282" style="mix-blend-mode:normal;" figma:type="vector"> <use xlink:href="#5a24b380-6132-4103-8fa4-3d879de4a3f1" transform="translate(399.518 -1996.27)" style="mix-blend-mode:normal;"></use> </g> <g id="XMLID 281" style="mix-blend-mode:normal;" figma:type="vector"> <use xlink:href="#288ac5dc-70e1-48c3-aaab-a3f3abc2a536" transform="translate(433.629 -2067.08)" style="mix-blend-mode:normal;"></use> </g> <g id="XMLID 280" style="mix-blend-mode:normal;" figma:type="vector"> <use xlink:href="#76ece709-e5c4-4a86-ac04-70160e15bbc2" transform="translate(761.299 -1998.76)" style="mix-blend-mode:normal;"></use> </g> <g id="XMLID 279" style="mix-blend-mode:normal;" figma:type="vector"> <use xlink:href="#00df6ba7-348e-491e-a6ec-fcd4d3481414" transform="translate(787.917 -2069.57)" style="mix-blend-mode:normal;"></use> </g> <g id="XMLID 278" style="mix-blend-mode:normal;" figma:type="vector"> <use xlink:href="#1b3f03ed-fc83-46d7-9f16-f5e428c59764" transform="translate(688.462 -1833.35)" style="mix-blend-mode:normal;"></use> </g> </g> </g> <defs> <path id="5a24b380-6132-4103-8fa4-3d879de4a3f1" d="M 83.461 94.686L 83.461 72.273L 97.256 68.377C 106.378 65.795 111.674 56.307 109.092 47.188C 106.529 38.052 96.94 32.788 87.904 35.335L 83.462 36.593L 83.462 25.748C 83.462 11.523 71.929 1.09863e-06 57.715 1.09863e-06C 48.326 1.09863e-06 40.179 5.08599 35.688 12.596C 32.922 16.093 5.07899 60.213 2.68199 63.975C -1.14101 69.985 -0.856014 77.73 3.40299 83.437C 7.57599 89.069 14.853 91.659 21.843 89.706L 31.967 86.839L 32.214 101.441C 32.295 106.205 33.089 110.927 34.571 115.455C 38.691 128.037 47.195 153.977 48.646 158.158L 37.952 223.223C 36.409 232.587 42.746 241.412 52.1 242.955C 61.621 244.488 70.303 238.009 71.814 228.806L 76.122 202.606C 77.446 208.339 81.42 213.334 87.454 215.213C 96.605 218.086 106.161 212.899 108.96 203.964L 126.645 147.464C 128.641 141.094 126.764 134.137 121.835 129.645L 83.461 94.686ZM 79.12 184.386L 83.225 159.432C 83.697 156.6 83.444 153.707 82.508 151.001L 77.041 135.294L 90.619 147.657L 79.12 184.386Z"></path> <path id="288ac5dc-70e1-48c3-aaab-a3f3abc2a536" d="M 32.184 64.371C 49.971 64.371 64.37 49.962 64.37 32.185C 64.37 14.408 49.972 1.89209e-06 32.184 1.89209e-06C 14.4 1.89209e-06 -4.88281e-07 14.408 -4.88281e-07 32.185C 0.000999512 49.962 14.4 64.371 32.184 64.371Z"></path> <path id="76ece709-e5c4-4a86-ac04-70160e15bbc2" d="M 122.419 63.977C 120.021 60.212 92.1785 16.092 89.4125 12.598C 84.9205 5.079 76.7715 -4.39453e-06 67.3855 -4.39453e-06C 53.1685 -4.39453e-06 41.6395 11.525 41.6395 25.748L 41.6395 69.853L 34.3795 71.412C 25.1085 73.398 19.2075 82.526 21.2025 91.787C 22.7275 98.878 28.4785 103.757 35.2165 104.879L 12.9725 134.014C 11.2465 136.277 10.1065 138.933 9.67052 141.749L 0.216506 201.443C -1.27649 210.805 5.11052 219.597 14.4815 221.081C 23.8185 222.548 32.6355 216.187 34.1125 206.808L 42.8935 151.405L 57.5455 132.213L 56.6725 150.073C 56.6215 151.163 56.6725 152.261 56.8225 153.335L 66.4795 221.232C 67.7705 230.317 76.1195 237.115 85.8925 235.815C 95.2795 234.475 101.799 225.784 100.475 216.404L 91.0545 150.122L 93.1325 93.915L 111.539 89.967C 117.02 88.795 121.598 85.006 123.758 79.817C 125.938 74.639 125.436 68.721 122.419 63.977Z"></path> <path id="00df6ba7-348e-491e-a6ec-fcd4d3481414" d="M 32.185 64.37C 49.97 64.37 64.371 49.963 64.371 32.185C 64.371 14.408 49.971 -3.60107e-06 32.185 -3.60107e-06C 14.398 -3.60107e-06 -6.10352e-06 14.408 -6.10352e-06 32.185C -6.10352e-06 49.963 14.398 64.37 32.185 64.37Z"></path> <path id="1b3f03ed-fc83-46d7-9f16-f5e428c59764" d="M 29.67 6.34766e-06C 13.292 6.34766e-06 7.32422e-06 13.293 7.32422e-06 29.679C 7.32422e-06 46.072 13.292 59.366 29.67 59.366C 46.065 59.366 59.373 46.072 59.373 29.679C 59.373 13.293 46.064 6.34766e-06 29.67 6.34766e-06Z"></path> </defs> </svg> 球隊 <component-wavify></component-wavify> </a> </tab> </tabs>', '', '', function(opts) {
(function (self, args, my, me) {

		self
			.establish ('tabs', property (['matches', 'todos', 'teams']))

			.establish ('highlight-position', computed (function () {
				return 100 * my ('tabs') .indexOf (args .tab) / 3
			}))

}) (this, opts, this .my, this .me);
});
riot.tag2('component-time-highlight', '<span>{self .dialogue (args .time__from) ? my (args .time__from) : \'5:00PM\'}</span>', '', '', function(opts) {
});
riot.tag2('component-time-picker', '<input ref="input">', '', '', function(opts) {
(function (self, args, my, me) {

		var picker;
		var duration;
		self .on ('mount', function () {
			picker =	new Flatpickr (self .root .firstElementChild, {
							inline: true,
							enableTime: true,
							hourIncrement: 1,
							minuteIncrement: 30,
							defaultDate: new Date (new Date() .setHours (19, 30, 0, 0)),
							dateFormat: 'h:i K'
						});
			picker .hourElement .setAttribute ('readonly', true);
			picker .minuteElement .setAttribute ('readonly', true);
			var duration_picker = picker .timeContainer .cloneNode (true);
			picker .timeContainer .parentNode .insertBefore (duration_picker, null);
			duration_picker .removeChild (duration_picker .firstElementChild);
			duration_picker .removeChild (duration_picker .firstElementChild);
			duration = duration_picker .firstElementChild .firstElementChild;
			duration .value = 90;
			duration_picker .lastElementChild .textContent = '分鐘';

			var duration_value = duration .value;
			duration .addEventListener ('change', function () {
				if (+ duration .value !== 60
					&& + duration .value !== 90
					&& + duration .value !== 120
					&& + duration .value !== 150
					&& + duration .value !== 180)
					duration .value = duration_value;
				else
					duration_value = duration .value;
			});
			duration_picker .firstElementChild .querySelector ('.arrowUp') .addEventListener ('click', function () {
				if (+ duration .value < 180)
					duration_value = duration .value = + duration .value + 30;
			})
			duration_picker .firstElementChild .querySelector ('.arrowDown') .addEventListener ('click', function () {
				if (+ duration .value > 60)
					duration_value = duration .value = + duration .value - 30;
			})

			var minutes = picker .minuteElement;
			var minutes_value = minutes .value;
			minutes .addEventListener ('change', function () {
				if (+ minutes .value !== 0
					&& + minutes .value !== 30)
					minutes .value = minutes_value;
				else
					minutes_value = minutes .value;
			});
			minutes .addEventListener ('blur', function () {
				if (+ minutes .value !== 0
					&& + minutes .value !== 30)
					minutes .value = minutes_value;
				else
					minutes_value = minutes .value;
			});
		})

		self .establish ('input', ref)
		self .findings ('input') .thru (tap, function (input) {
			self .root .addEventListener ('click', function (event) {
				if (event .target === self .root) {
					var h = +picker .hourElement .value;
					var i = picker .minuteElement .value;
					var K = picker .amPM .textContent;
					var l = duration .value;

					if (i >= 45) {
						h = h + 1;
						i = '00';

						if (h === 13) {
							h = 1;
							K = K === 'AM' ? 'PM' : 'AM';
						}
					}
					else if (i <= 15) {
						i = '00';
					}
					else {
						i = '30';
					}

					self .ask (args .time__to, h + ':' + i + ' ' + K);
					self .ask (args .duration__to, l);
				}
			});
		})

}) (this, opts, this .my, this .me);
});
riot.tag2('component-title', '<h1>FOFI</h1>', '', '', function(opts) {
});
riot.tag2('component-todo-highlight-status--applying', '<span>約戰中</span>', '', '', function(opts) {
});
riot.tag2('component-todo-highlight-status--completed', '<span>完成</span>', '', '', function(opts) {
});
riot.tag2('component-todo-highlight-status--confirm', '<span>約戰成功</span>', '', '', function(opts) {
});
riot.tag2('component-todo-highlight-status--considering', '<span>約戰中</span>', '', '', function(opts) {
});
riot.tag2('component-todo-highlight-status--waiting', '<span>約戰中</span>', '', '', function(opts) {
});
riot.tag2('component-todo-highlight-status--withdrawn', '<span>約戰失敗</span>', '', '', function(opts) {
});
riot.tag2('component-todos-check-item--applying', '<a> <match> <match-graphic> <image-holder size="64x64"> <box-highlight> <box-top> <component-todo-highlight-status--applying></component-todo-highlight-status--applying> </box-top> <box-bottom> <component-time-highlight time__from=":time"></component-time-highlight> </box-bottom> </box-highlight> </image-holder> </match-graphic> <match-info> <info-holder> <match-date>{my (\'date\')} {my (\'day-of-week\')}</match-date> <br> <match-location><icon-holder><icon class="fa-map-marker"></icon></icon-holder>{my (\'location\')}</match-location> <match-field-type>{my (\'field-type\')}</match-field-type> <match-number-of-players>{my (\'num-of-players\')}人</match-number-of-players> <br> <match-team-name>{my (\'team-name\')}</match-team-name> <match-team-strength><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon></match-team-strength> </info-holder> </match-info> <match-status>等確認<svg width="10" height="18" viewbox="0 0 10 14" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:figma="http://www.figma.com/figma/ns"><title>hourglass</title><desc>Created using Figma</desc><g id="Canvas" transform="translate(687 -15)" figma:type="canvas"><g id="hourglass" style="mix-blend-mode:normal;" figma:type="frame"><g id="Group" style="mix-blend-mode:normal;" figma:type="frame"><g id="Group" style="mix-blend-mode:normal;" figma:type="frame"><g id="Vector" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#387e952c-9090-495c-a2a8-70ef8b7b454a" transform="translate(-685.027 15.3235)" fill="#000055" style="mix-blend-mode:normal;"></use></g></g></g><mask id="mask0_alpha" mask-type="alpha"><path d="M -687.939 15.3235L -674.704 15.3235L -674.704 28.5588L -687.939 28.5588L -687.939 15.3235Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask0_alpha)" figma:type="frame"></g><mask id="mask1_alpha" mask-type="alpha"><path d="M -687.939 15.3235L -674.704 15.3235L -674.704 28.5588L -687.939 28.5588L -687.939 15.3235Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask1_alpha)" figma:type="frame"></g><mask id="mask2_alpha" mask-type="alpha"><path d="M -687.939 15.3235L -674.704 15.3235L -674.704 28.5588L -687.939 28.5588L -687.939 15.3235Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask2_alpha)" figma:type="frame"></g><mask id="mask3_alpha" mask-type="alpha"><path d="M -687.939 15.3235L -674.704 15.3235L -674.704 28.5588L -687.939 28.5588L -687.939 15.3235Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask3_alpha)" figma:type="frame"></g><mask id="mask4_alpha" mask-type="alpha"><path d="M -687.939 15.3235L -674.704 15.3235L -674.704 28.5588L -687.939 28.5588L -687.939 15.3235Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask4_alpha)" figma:type="frame"></g><mask id="mask5_alpha" mask-type="alpha"><path d="M -687.939 15.3235L -674.704 15.3235L -674.704 28.5588L -687.939 28.5588L -687.939 15.3235Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask5_alpha)" figma:type="frame"></g><mask id="mask6_alpha" mask-type="alpha"><path d="M -687.939 15.3235L -674.704 15.3235L -674.704 28.5588L -687.939 28.5588L -687.939 15.3235Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask6_alpha)" figma:type="frame"></g><mask id="mask7_alpha" mask-type="alpha"><path d="M -687.939 15.3235L -674.704 15.3235L -674.704 28.5588L -687.939 28.5588L -687.939 15.3235Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask7_alpha)" figma:type="frame"></g><mask id="mask8_alpha" mask-type="alpha"><path d="M -687.939 15.3235L -674.704 15.3235L -674.704 28.5588L -687.939 28.5588L -687.939 15.3235Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask8_alpha)" figma:type="frame"></g><mask id="mask9_alpha" mask-type="alpha"><path d="M -687.939 15.3235L -674.704 15.3235L -674.704 28.5588L -687.939 28.5588L -687.939 15.3235Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask9_alpha)" figma:type="frame"></g><mask id="mask10_alpha" mask-type="alpha"><path d="M -687.939 15.3235L -674.704 15.3235L -674.704 28.5588L -687.939 28.5588L -687.939 15.3235Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask10_alpha)" figma:type="frame"></g><mask id="mask11_alpha" mask-type="alpha"><path d="M -687.939 15.3235L -674.704 15.3235L -674.704 28.5588L -687.939 28.5588L -687.939 15.3235Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask11_alpha)" figma:type="frame"></g><mask id="mask12_alpha" mask-type="alpha"><path d="M -687.939 15.3235L -674.704 15.3235L -674.704 28.5588L -687.939 28.5588L -687.939 15.3235Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask12_alpha)" figma:type="frame"></g><mask id="mask13_alpha" mask-type="alpha"><path d="M -687.939 15.3235L -674.704 15.3235L -674.704 28.5588L -687.939 28.5588L -687.939 15.3235Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask13_alpha)" figma:type="frame"></g><mask id="mask14_alpha" mask-type="alpha"><path d="M -688.38 11L -673.38 11L -673.38 26L -688.38 26L -688.38 11Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask14_alpha)" figma:type="frame"></g></g></g><defs><path id="387e952c-9090-495c-a2a8-70ef8b7b454a" d="M 7.41176 3.02929C 7.41176 1.61325 7.41176 1.47481 7.41176 1.47481C 7.41176 0.952676 5.75259 0 3.70588 0C 1.65904 0 0 0.952676 0 1.47481C 0 1.47481 0 1.61312 0 3.02929C 0 4.44521 2.56553 5.61507 2.56553 6.61765C 2.56553 7.62022 0 8.78996 0 10.206C 0 11.622 0 11.7606 0 11.7606C 0 12.2826 1.65904 13.2353 3.70588 13.2353C 5.75259 13.2353 7.41176 12.2826 7.41176 11.7606C 7.41176 11.7606 7.41176 11.6222 7.41176 10.206C 7.41176 8.78982 4.84624 7.62022 4.84624 6.61765C 4.84624 5.61507 7.41176 4.44521 7.41176 3.02929ZM 1.01951 1.54099C 1.47997 1.25047 2.34331 0.824691 3.74201 0.824691C 5.14085 0.824691 6.39318 1.54099 6.39318 1.54099C 6.48675 1.5979 6.85509 1.79484 6.60309 1.944C 6.04813 2.27263 4.96297 2.61887 3.70588 2.61887C 2.44879 2.61887 1.3999 2.23729 0.844809 1.90853C 0.592809 1.75924 1.01951 1.54099 1.01951 1.54099ZM 4.03769 6.61765C 4.03769 7.40713 4.69668 7.91563 5.39497 8.59407C 5.90506 9.08974 6.60322 9.76844 6.60322 10.206L 6.60322 11.085C 5.96184 10.7652 4.04126 10.4523 4.04126 9.42803C 4.04126 8.90934 3.37076 8.90934 3.37076 9.42803C 3.37076 10.4523 1.45006 10.7652 0.808809 11.085L 0.808809 10.206C 0.808809 9.76831 1.50697 9.08974 2.01706 8.59407C 2.71482 7.91563 3.37407 7.40713 3.37407 6.61765C 3.37407 5.82816 2.71482 5.31979 2.01679 4.64135C 1.50671 4.14556 0.808544 3.46685 0.808544 3.02929L 0.777309 2.36779C 1.45641 2.73335 2.53271 3.0821 3.70588 3.0821C 4.87906 3.0821 5.96038 2.73335 6.63935 2.36779L 6.60322 3.02929C 6.60322 3.46699 5.90506 4.14569 5.39497 4.64135C 4.69668 5.31979 4.03769 5.82816 4.03769 6.61765Z"></path></defs></svg ></match-status> </match> </a>', '', '', function(opts) {
(function (self, args, my, me) {

		self
			.establish ('location', computed (function () {
				return location_from_api (my (args .todo__from) .location);
			}))
			.establish ('num-of-players', computed (function () {
				return my (args .todo__from) .match_type_value;
			}))
			.establish ('team-name', computed (function () {
				return my (args .todo__from) .home_team .long_name;
			}))
			.establish ('field-type', computed (function () {
				return field_type_to_chi (my (args .todo__from) .pitch_type);
			}))

			.establish (':time', computed (function () {
				var date_time = new Date (my (args .todo__from) .start_at);
				return fecha .format (date_time, 'h:mmA');
			}))
	        .establish ('date', computed (function () {

	            return date_to_chi (new Date (my (args .todo__from) .start_at));
	        }))
	        .establish ('day-of-week', computed (function () {

	            return day_of_week_to_chi (new Date (my (args .todo__from) .start_at));
	        }))

			.establish ('id', computed (function () {
				return my (args .todo__from) .id;
			}))

}) (this, opts, this .my, this .me);
});
riot.tag2('component-todos-check-item--confirmed', '<a> <match> <match-graphic> <image-holder size="64x64"> <box-highlight> <box-top> <component-todo-highlight-status--confirm></component-todo-highlight-status--confirm> </box-top> <box-bottom> <component-time-highlight time__from=":time"></component-time-highlight> </box-bottom> </box-highlight> </image-holder> </match-graphic> <match-info> <info-holder> <match-date>{my (\'date\')} {my (\'day-of-week\')}</match-date> <br> <match-location><icon-holder><icon class="fa-map-marker"></icon></icon-holder>{my (\'location\')}</match-location> <match-field-type>{my (\'field-type\')}</match-field-type> <match-number-of-players>{my (\'num-of-players\')}人</match-number-of-players> <br> <match-team-name>傻明無敵隊</match-team-name> <match-team-strength><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon></match-team-strength> </info-holder> </match-info> <match-status>開波<svg width="12" height="16" viewbox="0 0 12 13" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:figma="http://www.figma.com/figma/ns"><title>football-player-attempting-to-kick-ball</title><desc>Created using Figma</desc><g id="Canvas" transform="translate(688 -112)" figma:type="canvas"><g id="football-player-attempting-to-kick-ball" style="mix-blend-mode:normal;" figma:type="frame"><g id="Group" style="mix-blend-mode:normal;" figma:type="frame"><g id="Group" style="mix-blend-mode:normal;" figma:type="frame"><g id="Vector" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#fc40c6a4-a651-4fcd-b812-245638a2b147" transform="translate(-682.571 110.839)" fill="#000055" style="mix-blend-mode:normal;"></use></g><g id="Vector" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#2efb6aad-b458-4f11-bbf9-a47befad4e85" transform="translate(-687.083 110.867)" fill="#000055" style="mix-blend-mode:normal;"></use></g><g id="Vector" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#adbeab15-d55d-4562-b721-a7fab6cb6df6" transform="translate(-683.167 120.97)" fill="#000055" style="mix-blend-mode:normal;"></use></g></g></g><mask id="mask0_alpha" mask-type="alpha"><path d="M -690.089 110.839L -686.381 110.839L -686.381 114.545L -690.089 114.545L -690.089 110.839Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask0_alpha)" figma:type="frame"></g><mask id="mask1_alpha" mask-type="alpha"><path d="M -690.089 110.839L -686.381 110.839L -686.381 114.545L -690.089 114.545L -690.089 110.839Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask1_alpha)" figma:type="frame"></g><mask id="mask2_alpha" mask-type="alpha"><path d="M -690.089 110.839L -686.381 110.839L -686.381 114.545L -690.089 114.545L -690.089 110.839Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask2_alpha)" figma:type="frame"></g><mask id="mask3_alpha" mask-type="alpha"><path d="M -690.089 110.839L -686.381 110.839L -686.381 114.545L -690.089 114.545L -690.089 110.839Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask3_alpha)" figma:type="frame"></g><mask id="mask4_alpha" mask-type="alpha"><path d="M -690.089 110.839L -686.381 110.839L -686.381 114.545L -690.089 114.545L -690.089 110.839Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask4_alpha)" figma:type="frame"></g><mask id="mask5_alpha" mask-type="alpha"><path d="M -690.089 110.839L -686.381 110.839L -686.381 114.545L -690.089 114.545L -690.089 110.839Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask5_alpha)" figma:type="frame"></g><mask id="mask6_alpha" mask-type="alpha"><path d="M -690.089 110.839L -686.381 110.839L -686.381 114.545L -690.089 114.545L -690.089 110.839Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask6_alpha)" figma:type="frame"></g><mask id="mask7_alpha" mask-type="alpha"><path d="M -690.089 110.839L -686.381 110.839L -686.381 114.545L -690.089 114.545L -690.089 110.839Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask7_alpha)" figma:type="frame"></g><mask id="mask8_alpha" mask-type="alpha"><path d="M -690.089 110.839L -686.381 110.839L -686.381 114.545L -690.089 114.545L -690.089 110.839Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask8_alpha)" figma:type="frame"></g><mask id="mask9_alpha" mask-type="alpha"><path d="M -690.089 110.839L -686.381 110.839L -686.381 114.545L -690.089 114.545L -690.089 110.839Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask9_alpha)" figma:type="frame"></g><mask id="mask10_alpha" mask-type="alpha"><path d="M -690.089 110.839L -686.381 110.839L -686.381 114.545L -690.089 114.545L -690.089 110.839Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask10_alpha)" figma:type="frame"></g><mask id="mask11_alpha" mask-type="alpha"><path d="M -690.089 110.839L -686.381 110.839L -686.381 114.545L -690.089 114.545L -690.089 110.839Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask11_alpha)" figma:type="frame"></g><mask id="mask12_alpha" mask-type="alpha"><path d="M -690.089 110.839L -686.381 110.839L -686.381 114.545L -690.089 114.545L -690.089 110.839Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask12_alpha)" figma:type="frame"></g><mask id="mask13_alpha" mask-type="alpha"><path d="M -690.089 110.839L -686.381 110.839L -686.381 114.545L -690.089 114.545L -690.089 110.839Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask13_alpha)" figma:type="frame"></g><mask id="mask14_alpha" mask-type="alpha"><path d="M -690.089 110.839L -686.381 110.839L -686.381 114.545L -690.089 114.545L -690.089 110.839Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask14_alpha)" figma:type="frame"></g></g></g><defs><path id="fc40c6a4-a651-4fcd-b812-245638a2b147" d="M 0.867259 0C 1.34609 0 1.73452 0.38803 1.73452 0.866861C 1.73452 1.34558 1.34609 1.73372 0.867259 1.73372C 0.388209 1.73372 9.50491e-08 1.34558 9.50491e-08 0.866861C 9.50491e-08 0.38803 0.388209 0 0.867259 0Z"></path><path id="2efb6aad-b458-4f11-bbf9-a47befad4e85" d="M 0.917762 6.98686C 0.640343 6.80934 0.271711 6.89013 0.0942178 7.16743C -0.0833867 7.44438 -0.00255619 7.81322 0.2749 7.99052L 1.98902 9.08782C 2.2492 9.25401 2.59325 9.19456 2.78216 8.95044L 4.87882 6.24112L 6.50734 8.34152L 6.74582 11.2353C 6.77133 11.5466 7.03229 11.7822 7.3393 11.7822C 7.35557 11.7822 7.37233 11.7815 7.38883 11.7803C 7.71694 11.7533 7.96117 11.4656 7.93407 11.1374L 7.68123 8.06768C 7.67181 7.95253 7.62903 7.84279 7.55839 7.75144L 6.22995 5.74235L 6.3373 3.01505C 6.3373 3.01505 6.36744 2.85806 6.37322 2.6649C 6.542 2.46725 6.76414 2.19089 7.06077 1.80178C 7.50522 1.21896 7.91419 0.648624 7.91842 0.642954C 8.04912 0.460354 8.00711 0.20667 7.82454 0.0759552C 7.64211 -0.0546483 7.38809 -0.012621 7.25735 0.16972C 6.81271 0.790717 6.2951 1.47776 5.9182 1.9415C 5.43937 1.88576 4.76451 1.88432 4.36804 1.95859C 4.22688 1.98516 4.138 2.04609 4.08157 2.11625C 4.06804 2.13037 4.05487 2.14512 4.04327 2.16165C 3.3373 3.1474 2.44739 4.30008 2.22862 4.46077C 2.03845 4.56384 1.96148 4.79922 2.05717 4.99575C 2.12751 5.14033 2.2723 5.22449 2.42302 5.22449C 2.48283 5.22449 2.54342 5.21137 2.60063 5.18343C 2.71112 5.12958 2.89629 5.0396 3.84686 3.79371C 3.88105 3.74883 3.91494 3.70428 3.94853 3.65988L 3.89859 5.16412L 3.90782 5.16653L 2.17293 7.79039L 0.917762 6.98686Z"></path><path id="adbeab15-d55d-4562-b721-a7fab6cb6df6" d="M 0.935001 -2.98589e-07C 1.4515 -2.98589e-07 1.87004 0.418569 1.87004 0.934795C 1.87004 1.45083 1.4515 1.8694 0.935001 1.8694C 0.418724 1.8694 -1.94624e-07 1.45083 -1.94624e-07 0.934795C -1.94624e-07 0.418569 0.418724 -2.98589e-07 0.935001 -2.98589e-07Z"></path></defs></svg ></match-status> </match> </a>', '', '', function(opts) {
(function (self, args, my, me) {

		self
			.establish ('location', computed (function () {
				return location_from_api (my (args .todo__from) .location);
			}))
			.establish ('num-of-players', computed (function () {
				return my (args .todo__from) .match_type_value;
			}))
			.establish ('team-name', computed (function () {
				return my (args .todo__from) .home_team .long_name;
			}))
			.establish ('field-type', computed (function () {
				return field_type_to_chi (my (args .todo__from) .pitch_type);
			}))

			.establish (':time', computed (function () {
				var date_time = new Date (my (args .todo__from) .start_at);
				return fecha .format (date_time, 'h:mmA');
			}))
	        .establish ('date', computed (function () {

	            return date_to_chi (new Date (my (args .todo__from) .start_at));
	        }))
	        .establish ('day-of-week', computed (function () {

	            return day_of_week_to_chi (new Date (my (args .todo__from) .start_at));
	        }))

			.establish ('id', computed (function () {
				return my (args .todo__from) .id;
			}))

}) (this, opts, this .my, this .me);
});
riot.tag2('component-todos-check-item--considering', '<a href="#todo/choose" ref="todo-button"> <match> <match-graphic> <image-holder size="64x64"> <box-highlight> <box-top> <component-todo-highlight-status--considering></component-todo-highlight-status--considering> </box-top> <box-bottom> <component-time-highlight time__from=":time"></component-time-highlight> </box-bottom> </box-highlight> </image-holder> </match-graphic> <match-info> <info-holder> <match-date>{my (\'date\')} {my (\'day-of-week\')}</match-date> <br> <match-location><icon-holder><icon class="fa-map-marker"></icon></icon-holder>{my (\'location\')}</match-location> <match-field-type>{my (\'field-type\')}</match-field-type> <match-number-of-players>{my (\'num-of-players\')}人</match-number-of-players> <br> </info-holder> </match-info> <match-status>搵對手<svg width="10" height="18" viewbox="0 0 10 14" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:figma="http://www.figma.com/figma/ns"><title>hourglass</title><desc>Created using Figma</desc><g id="Canvas" transform="translate(687 -15)" figma:type="canvas"><g id="hourglass" style="mix-blend-mode:normal;" figma:type="frame"><g id="Group" style="mix-blend-mode:normal;" figma:type="frame"><g id="Group" style="mix-blend-mode:normal;" figma:type="frame"><g id="Vector" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#387e952c-9090-495c-a2a8-70ef8b7b454a" transform="translate(-685.027 15.3235)" fill="#000055" style="mix-blend-mode:normal;"></use></g></g></g><mask id="mask0_alpha" mask-type="alpha"><path d="M -687.939 15.3235L -674.704 15.3235L -674.704 28.5588L -687.939 28.5588L -687.939 15.3235Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask0_alpha)" figma:type="frame"></g><mask id="mask1_alpha" mask-type="alpha"><path d="M -687.939 15.3235L -674.704 15.3235L -674.704 28.5588L -687.939 28.5588L -687.939 15.3235Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask1_alpha)" figma:type="frame"></g><mask id="mask2_alpha" mask-type="alpha"><path d="M -687.939 15.3235L -674.704 15.3235L -674.704 28.5588L -687.939 28.5588L -687.939 15.3235Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask2_alpha)" figma:type="frame"></g><mask id="mask3_alpha" mask-type="alpha"><path d="M -687.939 15.3235L -674.704 15.3235L -674.704 28.5588L -687.939 28.5588L -687.939 15.3235Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask3_alpha)" figma:type="frame"></g><mask id="mask4_alpha" mask-type="alpha"><path d="M -687.939 15.3235L -674.704 15.3235L -674.704 28.5588L -687.939 28.5588L -687.939 15.3235Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask4_alpha)" figma:type="frame"></g><mask id="mask5_alpha" mask-type="alpha"><path d="M -687.939 15.3235L -674.704 15.3235L -674.704 28.5588L -687.939 28.5588L -687.939 15.3235Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask5_alpha)" figma:type="frame"></g><mask id="mask6_alpha" mask-type="alpha"><path d="M -687.939 15.3235L -674.704 15.3235L -674.704 28.5588L -687.939 28.5588L -687.939 15.3235Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask6_alpha)" figma:type="frame"></g><mask id="mask7_alpha" mask-type="alpha"><path d="M -687.939 15.3235L -674.704 15.3235L -674.704 28.5588L -687.939 28.5588L -687.939 15.3235Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask7_alpha)" figma:type="frame"></g><mask id="mask8_alpha" mask-type="alpha"><path d="M -687.939 15.3235L -674.704 15.3235L -674.704 28.5588L -687.939 28.5588L -687.939 15.3235Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask8_alpha)" figma:type="frame"></g><mask id="mask9_alpha" mask-type="alpha"><path d="M -687.939 15.3235L -674.704 15.3235L -674.704 28.5588L -687.939 28.5588L -687.939 15.3235Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask9_alpha)" figma:type="frame"></g><mask id="mask10_alpha" mask-type="alpha"><path d="M -687.939 15.3235L -674.704 15.3235L -674.704 28.5588L -687.939 28.5588L -687.939 15.3235Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask10_alpha)" figma:type="frame"></g><mask id="mask11_alpha" mask-type="alpha"><path d="M -687.939 15.3235L -674.704 15.3235L -674.704 28.5588L -687.939 28.5588L -687.939 15.3235Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask11_alpha)" figma:type="frame"></g><mask id="mask12_alpha" mask-type="alpha"><path d="M -687.939 15.3235L -674.704 15.3235L -674.704 28.5588L -687.939 28.5588L -687.939 15.3235Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask12_alpha)" figma:type="frame"></g><mask id="mask13_alpha" mask-type="alpha"><path d="M -687.939 15.3235L -674.704 15.3235L -674.704 28.5588L -687.939 28.5588L -687.939 15.3235Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask13_alpha)" figma:type="frame"></g><mask id="mask14_alpha" mask-type="alpha"><path d="M -688.38 11L -673.38 11L -673.38 26L -688.38 26L -688.38 11Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask14_alpha)" figma:type="frame"></g></g></g><defs><path id="387e952c-9090-495c-a2a8-70ef8b7b454a" d="M 7.41176 3.02929C 7.41176 1.61325 7.41176 1.47481 7.41176 1.47481C 7.41176 0.952676 5.75259 0 3.70588 0C 1.65904 0 0 0.952676 0 1.47481C 0 1.47481 0 1.61312 0 3.02929C 0 4.44521 2.56553 5.61507 2.56553 6.61765C 2.56553 7.62022 0 8.78996 0 10.206C 0 11.622 0 11.7606 0 11.7606C 0 12.2826 1.65904 13.2353 3.70588 13.2353C 5.75259 13.2353 7.41176 12.2826 7.41176 11.7606C 7.41176 11.7606 7.41176 11.6222 7.41176 10.206C 7.41176 8.78982 4.84624 7.62022 4.84624 6.61765C 4.84624 5.61507 7.41176 4.44521 7.41176 3.02929ZM 1.01951 1.54099C 1.47997 1.25047 2.34331 0.824691 3.74201 0.824691C 5.14085 0.824691 6.39318 1.54099 6.39318 1.54099C 6.48675 1.5979 6.85509 1.79484 6.60309 1.944C 6.04813 2.27263 4.96297 2.61887 3.70588 2.61887C 2.44879 2.61887 1.3999 2.23729 0.844809 1.90853C 0.592809 1.75924 1.01951 1.54099 1.01951 1.54099ZM 4.03769 6.61765C 4.03769 7.40713 4.69668 7.91563 5.39497 8.59407C 5.90506 9.08974 6.60322 9.76844 6.60322 10.206L 6.60322 11.085C 5.96184 10.7652 4.04126 10.4523 4.04126 9.42803C 4.04126 8.90934 3.37076 8.90934 3.37076 9.42803C 3.37076 10.4523 1.45006 10.7652 0.808809 11.085L 0.808809 10.206C 0.808809 9.76831 1.50697 9.08974 2.01706 8.59407C 2.71482 7.91563 3.37407 7.40713 3.37407 6.61765C 3.37407 5.82816 2.71482 5.31979 2.01679 4.64135C 1.50671 4.14556 0.808544 3.46685 0.808544 3.02929L 0.777309 2.36779C 1.45641 2.73335 2.53271 3.0821 3.70588 3.0821C 4.87906 3.0821 5.96038 2.73335 6.63935 2.36779L 6.60322 3.02929C 6.60322 3.46699 5.90506 4.14569 5.39497 4.64135C 4.69668 5.31979 4.03769 5.82816 4.03769 6.61765Z"></path></defs></svg ></match-status> <match-substatus>{my (\'apply-numbers\')}隊已報名</match-substatus> </match> </a>', '', '', function(opts) {
(function (self, args, my, me) {

		self
			.establish ('location', computed (function () {
				var location_parts = my (args .todo__from) .location .split (',');
				return location_parts .reverse () [0];
			}))
			.establish ('num-of-players', computed (function () {
				return my (args .todo__from) .match_type_value;
			}))
			.establish ('team-name', computed (function () {
				return my (args .todo__from) .home_team .long_name;
			}))
			.establish ('field-type', computed (function () {
				return field_type_to_chi (my (args .todo__from) .pitch_type);
			}))
			.establish ('apply-numbers', computed (function () {
				return my (args .todo__from) .applied_opponent_count;
			}))

			.establish (':time', computed (function () {
				var date_time = new Date (my (args .todo__from) .start_at);
				return fecha .format (date_time, 'h:mmA');
			}))
	        .establish ('date', computed (function () {

	            return fecha .format (new Date (my (args .todo__from) .start_at), 'YYYY年M月D日');
	        }))
	        .establish ('day-of-week', computed (function () {

	            return '星期' + (function (day) {
									if (day === '0') return '日'
									if (day === '1') return '一'
									if (day === '2') return '二'
									if (day === '3') return '三'
									if (day === '4') return '四'
									if (day === '5') return '五'
									if (day === '6') return '六'
								}) (fecha .format (new Date (my (args .todo__from) .start_at), 'd'));
	        }))

			.establish ('id', computed (function () {
				return my (args .todo__from) .id;
			}))

			.establish ('todo-button', ref)
		self .findings ('todo-button') .thru (tap, function (ref) {
			ref .addEventListener ('click', function (e) {
				e .preventDefault ();
				window .location .hash = ref .hash + '/#' + stringify (my ('id'))
			})
		})

}) (this, opts, this .my, this .me);
});
riot.tag2('component-todos-check-item--drawn', '<a> <match> <match-graphic> <image-holder size="64x64"> <box-highlight> <box-top> <component-todo-highlight-status--completed></component-todo-highlight-status--completed> </box-top> <box-bottom> <component-time-highlight></component-time-highlight> </box-bottom> </box-highlight> </image-holder> </match-graphic> <match-info> <info-holder> <match-date>2016年12日35日 星期五</match-date> <br> <match-location><icon-holder><icon class="fa-map-marker"></icon></icon-holder>賈炳達道</match-location> <match-field-type>仿真草</match-field-type> <match-number-of-players>9人</match-number-of-players> <br> <match-team-name>北區之友U100</match-team-name> </info-holder> </match-info> <match-status>和2:2</match-status> </match> </a>', '', '', function(opts) {
});
riot.tag2('component-todos-check-item--waiting', '<a href="#todo/choose" ref="todo-button"> <match> <match-graphic> <image-holder size="64x64"> <box-highlight> <box-top> <component-todo-highlight-status--waiting></component-todo-highlight-status--waiting> </box-top> <box-bottom> <component-time-highlight time__from=":time"></component-time-highlight> </box-bottom> </box-highlight> </image-holder> </match-graphic> <match-info> <info-holder> <match-date>{my (\'date\')} {my (\'day-of-week\')}</match-date> <br> <match-location><icon-holder><icon class="fa-map-marker"></icon></icon-holder>{my (\'location\')}</match-location> <match-field-type>{my (\'field-type\')}</match-field-type> <match-number-of-players>{my (\'num-of-players\')}人</match-number-of-players> <br> </info-holder> </match-info> <match-status>搵對手<svg width="10" height="18" viewbox="0 0 10 14" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:figma="http://www.figma.com/figma/ns"><title>hourglass</title><desc>Created using Figma</desc><g id="Canvas" transform="translate(687 -15)" figma:type="canvas"><g id="hourglass" style="mix-blend-mode:normal;" figma:type="frame"><g id="Group" style="mix-blend-mode:normal;" figma:type="frame"><g id="Group" style="mix-blend-mode:normal;" figma:type="frame"><g id="Vector" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#387e952c-9090-495c-a2a8-70ef8b7b454a" transform="translate(-685.027 15.3235)" fill="#000055" style="mix-blend-mode:normal;"></use></g></g></g><mask id="mask0_alpha" mask-type="alpha"><path d="M -687.939 15.3235L -674.704 15.3235L -674.704 28.5588L -687.939 28.5588L -687.939 15.3235Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask0_alpha)" figma:type="frame"></g><mask id="mask1_alpha" mask-type="alpha"><path d="M -687.939 15.3235L -674.704 15.3235L -674.704 28.5588L -687.939 28.5588L -687.939 15.3235Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask1_alpha)" figma:type="frame"></g><mask id="mask2_alpha" mask-type="alpha"><path d="M -687.939 15.3235L -674.704 15.3235L -674.704 28.5588L -687.939 28.5588L -687.939 15.3235Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask2_alpha)" figma:type="frame"></g><mask id="mask3_alpha" mask-type="alpha"><path d="M -687.939 15.3235L -674.704 15.3235L -674.704 28.5588L -687.939 28.5588L -687.939 15.3235Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask3_alpha)" figma:type="frame"></g><mask id="mask4_alpha" mask-type="alpha"><path d="M -687.939 15.3235L -674.704 15.3235L -674.704 28.5588L -687.939 28.5588L -687.939 15.3235Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask4_alpha)" figma:type="frame"></g><mask id="mask5_alpha" mask-type="alpha"><path d="M -687.939 15.3235L -674.704 15.3235L -674.704 28.5588L -687.939 28.5588L -687.939 15.3235Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask5_alpha)" figma:type="frame"></g><mask id="mask6_alpha" mask-type="alpha"><path d="M -687.939 15.3235L -674.704 15.3235L -674.704 28.5588L -687.939 28.5588L -687.939 15.3235Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask6_alpha)" figma:type="frame"></g><mask id="mask7_alpha" mask-type="alpha"><path d="M -687.939 15.3235L -674.704 15.3235L -674.704 28.5588L -687.939 28.5588L -687.939 15.3235Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask7_alpha)" figma:type="frame"></g><mask id="mask8_alpha" mask-type="alpha"><path d="M -687.939 15.3235L -674.704 15.3235L -674.704 28.5588L -687.939 28.5588L -687.939 15.3235Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask8_alpha)" figma:type="frame"></g><mask id="mask9_alpha" mask-type="alpha"><path d="M -687.939 15.3235L -674.704 15.3235L -674.704 28.5588L -687.939 28.5588L -687.939 15.3235Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask9_alpha)" figma:type="frame"></g><mask id="mask10_alpha" mask-type="alpha"><path d="M -687.939 15.3235L -674.704 15.3235L -674.704 28.5588L -687.939 28.5588L -687.939 15.3235Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask10_alpha)" figma:type="frame"></g><mask id="mask11_alpha" mask-type="alpha"><path d="M -687.939 15.3235L -674.704 15.3235L -674.704 28.5588L -687.939 28.5588L -687.939 15.3235Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask11_alpha)" figma:type="frame"></g><mask id="mask12_alpha" mask-type="alpha"><path d="M -687.939 15.3235L -674.704 15.3235L -674.704 28.5588L -687.939 28.5588L -687.939 15.3235Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask12_alpha)" figma:type="frame"></g><mask id="mask13_alpha" mask-type="alpha"><path d="M -687.939 15.3235L -674.704 15.3235L -674.704 28.5588L -687.939 28.5588L -687.939 15.3235Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask13_alpha)" figma:type="frame"></g><mask id="mask14_alpha" mask-type="alpha"><path d="M -688.38 11L -673.38 11L -673.38 26L -688.38 26L -688.38 11Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask14_alpha)" figma:type="frame"></g></g></g><defs><path id="387e952c-9090-495c-a2a8-70ef8b7b454a" d="M 7.41176 3.02929C 7.41176 1.61325 7.41176 1.47481 7.41176 1.47481C 7.41176 0.952676 5.75259 0 3.70588 0C 1.65904 0 0 0.952676 0 1.47481C 0 1.47481 0 1.61312 0 3.02929C 0 4.44521 2.56553 5.61507 2.56553 6.61765C 2.56553 7.62022 0 8.78996 0 10.206C 0 11.622 0 11.7606 0 11.7606C 0 12.2826 1.65904 13.2353 3.70588 13.2353C 5.75259 13.2353 7.41176 12.2826 7.41176 11.7606C 7.41176 11.7606 7.41176 11.6222 7.41176 10.206C 7.41176 8.78982 4.84624 7.62022 4.84624 6.61765C 4.84624 5.61507 7.41176 4.44521 7.41176 3.02929ZM 1.01951 1.54099C 1.47997 1.25047 2.34331 0.824691 3.74201 0.824691C 5.14085 0.824691 6.39318 1.54099 6.39318 1.54099C 6.48675 1.5979 6.85509 1.79484 6.60309 1.944C 6.04813 2.27263 4.96297 2.61887 3.70588 2.61887C 2.44879 2.61887 1.3999 2.23729 0.844809 1.90853C 0.592809 1.75924 1.01951 1.54099 1.01951 1.54099ZM 4.03769 6.61765C 4.03769 7.40713 4.69668 7.91563 5.39497 8.59407C 5.90506 9.08974 6.60322 9.76844 6.60322 10.206L 6.60322 11.085C 5.96184 10.7652 4.04126 10.4523 4.04126 9.42803C 4.04126 8.90934 3.37076 8.90934 3.37076 9.42803C 3.37076 10.4523 1.45006 10.7652 0.808809 11.085L 0.808809 10.206C 0.808809 9.76831 1.50697 9.08974 2.01706 8.59407C 2.71482 7.91563 3.37407 7.40713 3.37407 6.61765C 3.37407 5.82816 2.71482 5.31979 2.01679 4.64135C 1.50671 4.14556 0.808544 3.46685 0.808544 3.02929L 0.777309 2.36779C 1.45641 2.73335 2.53271 3.0821 3.70588 3.0821C 4.87906 3.0821 5.96038 2.73335 6.63935 2.36779L 6.60322 3.02929C 6.60322 3.46699 5.90506 4.14569 5.39497 4.64135C 4.69668 5.31979 4.03769 5.82816 4.03769 6.61765Z"></path></defs></svg ></match-status> </match> </a>', '', '', function(opts) {
(function (self, args, my, me) {

		self
			.establish ('location', computed (function () {
				return location_from_api (my (args .todo__from) .location);
			}))
			.establish ('num-of-players', computed (function () {
				return my (args .todo__from) .match_type_value;
			}))
			.establish ('team-name', computed (function () {
				return my (args .todo__from) .home_team .long_name;
			}))
			.establish ('field-type', computed (function () {
				return field_type_to_chi (my (args .todo__from) .pitch_type);
			}))

			.establish (':time', computed (function () {
				var date_time = new Date (my (args .todo__from) .start_at);
				return fecha .format (date_time, 'h:mmA');
			}))
	        .establish ('date', computed (function () {

	            return date_to_chi (new Date (my (args .todo__from) .start_at));
	        }))
	        .establish ('day-of-week', computed (function () {

	            return day_of_week_to_chi (new Date (my (args .todo__from) .start_at));
	        }))

			.establish ('id', computed (function () {
				return my (args .todo__from) .id;
			}))

			.establish ('todo-button', ref)
		self .findings ('todo-button') .thru (tap, function (ref) {
			ref .addEventListener ('click', function (e) {
				e .preventDefault ();
				window .location .hash = ref .hash + '/#' + stringify (my ('id'))
			})
		})

}) (this, opts, this .my, this .me);
});
riot.tag2('component-todos-check-item--won', '<a> <match> <match-graphic> <image-holder size="64x64"> <box-highlight> <box-top> <component-todo-highlight-status--completed></component-todo-highlight-status--completed> </box-top> <box-bottom> <component-time-highlight></component-time-highlight> </box-bottom> </box-highlight> </image-holder> </match-graphic> <match-info> <info-holder> <match-date>2016年10日16日 星期日</match-date> <br> <match-location><icon-holder><icon class="fa-map-marker"></icon></icon-holder>九龍灣公園</match-location> <match-field-type>硬地</match-field-type> <match-number-of-players>5人</match-number-of-players> <br> <match-team-name>北區之友U100</match-team-name> </info-holder> </match-info> <match-status>贏40:0</match-status> </match> </a>', '', '', function(opts) {
});
riot.tag2('component-todos-check-wrap', '<component-todos-check-item--confirmed todo__from="{args .todo__from}" if="{my (args .todo__from) .status === \'STARTED\'}"></component-todos-check-item--confirmed> <component-todos-check-item--applying todo__from="{args .todo__from}" if="{my (args .todo__from) .status === \'PENDING_APPROVAL\' && ! my (args .todo__from) .away_team}"></component-todos-check-item--applying> <component-todos-check-item--considering todo__from="{args .todo__from}" if="{my (args .todo__from) .status === \'PENDING_APPROVAL\' && my (args .todo__from) .away_team}"></component-todos-check-item--considering> <component-todos-check-item--waiting todo__from="{args .todo__from}" if="{my (args .todo__from) .status === \'VERIFIED\'}"></component-todos-check-item--waiting>', '', '', function(opts) {
});
riot.tag2('component-todos-tabs', '<tabs> <tab active="{args .tab === \'todos\'}"> <a href="#todos/check"> 所有球賽 <component-wavify></component-wavify> </a> </tab> <tab active="{args .tab === \'history\'}"> <a href="#history/check"> 友隊球賽 <component-wavify></component-wavify> </a> </tab> <highlight riot-style="left: {my (\'highlight-position\')}%;"></highlight> </tabs>', '', '', function(opts) {
(function (self, args, my, me) {

		self
			.establish ('tabs', property (['todos', 'history']))

			.establish ('highlight-position', computed (function () {
				return 100 * my ('tabs') .indexOf (args .tab) / 2
			}))

}) (this, opts, this .my, this .me);
});
riot.tag2('component-tree-list-picker', '<virtual each="{child, item in my (\'selected\')}"> <item ref="item" item="{item}"> <left> <svg if="{me (\'zeroed\') (child)}" viewbox="0 0 24 24"><path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"></path></svg> <svg if="{! me (\'zeroed\') (child) && ! me (\'filled\') (child)}" viewbox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2z"></path></svg> <svg if="{me (\'filled\') (child)}" viewbox="0 0 24 24"><path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path></svg> </left> <label>{item}</label> <right if="{typeof child !== \'boolean\'}"> <button type="button"> <svg if="{! me (\'zeroed\') (child)}" viewbox="0 0 24 24"><path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z"></path></svg> <svg if="{me (\'zeroed\') (child)}" viewbox="0 0 24 24"><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"></path></svg> <component-wavify center></component-wavify> </button> </right> <component-wavify></component-wavify> </item> <level if="{typeof child !== \'boolean\' && ! me (\'zeroed\') (child)}"> <component-tree-list-picker items__from="{my (\'sublist\') (item) .items__from}" tree__from="{my (\'sublist\') (item) .tree__from}" items__to="{my (\'sublist\') (item) .items__to}"></component-tree-list-picker> </level> </virtual>', '', '', function(opts) {
(function (self, args, my, me) {

		var tree =	function (nested_list) {
						var tree_ = {};
						for (var nth = 0; nth < nested_list .length; nth ++) {
							var item = nested_list [nth];
							if (typeof item === 'string') {
								tree_ [item] = false;
							}
							else {
								tree_ [item .item] = tree (item .list);
							}
						}
						return tree_;
					};
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
			.establish ('id', property (self ._riot_id))

			.establish ('toggle', function (toggles) {
				return 	toggles .thru (tap, function (toggle) {
							var tree = my ('selected');
							self .ask ('selected', {
								item: toggle,
								sub: me ('zeroed') (tree [toggle]) ? fill (tree [toggle]) : zero (tree [toggle])
							})
						})
			})
			.establish ('selected', function (reqs) {
				return 	reqs .thru (scan, [function (tree, sub) {
							return with_ (sub .item, sub .sub) (tree)
						}, args .tree__from ? my (args .tree__from) : tree (my (args .items__from))])
			})
			.establish ('item', ref)

			.establish ('zeroed', property (one_cache (function (inp) {
				if (typeof inp === 'boolean') {
					return ! inp;
				}
				else {
					var list = Object .keys (inp);
					for (var nth = 0; nth < list .length; nth ++) {
						var item = list [nth];
						if (! me ('zeroed') (inp [item]))
							return false;
					}
					return true;
				}
			})))
			.establish ('filled', property (one_cache (function (inp) {
				if (typeof inp === 'boolean') {
					return inp;
				}
				else {
					var list = Object .keys (inp);
					for (var nth = 0; nth < list .length; nth ++) {
						var item = list [nth];
						if (! me ('filled') (inp [item]))
							return false;
					}
					return true;
				}
			})))

		var items_list = my (args .items__from);
		self
			.establish ('sublist', property (function (item) {
				var items__from = my ('id') + ':' + item + ':' + 'from';
				var tree__from = my ('id') + ':' + item + ':' + 'tree';
				var items__to = my ('id') + ':' + item + ':' + 'to';

				if (! self .dialogue (tree__from))
					self
						.establish (items__from, property
							(items_list [index (function (child) {
								return child .item === item;
							}) (items_list)] .list)
						)
						.establish (tree__from, computed (function () {
							return my ('selected') [item]
						}))
						.establish (items__to, function (reqs) {
							return 	reqs .thru (tap, function (sub) {
										self .ask ('selected', {
											item: item,
											sub: sub
										})
									})
						})

				return 	{
							items__from: items__from,
							tree__from: tree__from,
							items__to: items__to
						}
			}))

		self .findings ('item') .thru (tap, function (ref) {
			ref .addEventListener ('click', function () {
				self .ask ('toggle', ref .getAttribute ('item'));
			}, true)
		})

		self .findings ('selected') .thru (tap, self .render)
		self .findings ('selected') .thru (tap, self .ask .bind (self, args .items__to))

}) (this, opts, this .my, this .me);
});
riot.tag2('component-verify-picker', '<label>請輸入驗證碼：</label> <input ref="attempt" disabled> <icon-holder ref="feedback"> <icon></icon> </icon-holder>', '', '', function(opts) {
(function (self, args, my, me) {

	    self
			.establish ('attempt', ref)
			.establish ('feedback', ref)

			.remembers ('verification-code', 'D7689')

		self
		    .establish (':load', transient)
		    .establish (':unload', transient)

		self .findings (':load') .thru (tap, function () {
			me ('attempt') .removeAttribute ('disabled')
		})
		self .findings (':unload') .thru (tap, function () {
			me ('attempt') .setAttribute ('disabled', 'disabled')
		})

		self .findings (':load')
			.thru (map, function (loads) {
			    var cycle = stream ('load');
			    promise (self .findings (':unload'))
			        .then (cycle .end .bind (cycle .end, 'unload'));
				return cycle;
			})
			.thru (map, function (cycle) {
				var cycle_result = stream ();
				cycle
					.thru (tap, [function () {
						var wrongs =
							mergeAll ([now (), my ('attempt') .event ('input')])
								.thru (takeUntil, [cycle .end])
								.thru (tap, [function () {
									my ('feedback') .removeAttribute ('correct')
									my ('feedback') .removeAttribute ('incorrect');
								}])
								.thru (afterSilence, [700])
								.map (function () {
									return 	wait (500) .then (function () {
												return my ('attempt') .value;
											})
								})
								.thru (dropRepeatsWith, [json_equal])
								.thru (tap, [function (guess) {
									if (guess !== my ('verification-code'))
										my ('feedback') .setAttribute ('incorrect', true);
									else {
										wrongs .end (true);
										self .ask (args .verified__to, true)
									}
								}])
						cycle_result ('on');
					}])
					.end .thru (tap, [function () {
						cycle_result .end ('off');
					}])

				return cycle_result;
			})

		self
			.findings (args .verified__to) .thru (tap, [function () {
				my ('feedback') .setAttribute ('correct', true);
			}])

}) (this, opts, this .my, this .me);
});
riot.tag2('component-wavify', '', '', '', function(opts) {
(function (self, args, my, me) {

	    var parent = self .root .parentElement;
	    parent .addEventListener ('click', function (e) {
	        e .stopPropagation ();
	        var rect = parent .getBoundingClientRect ();
	        var x_base = parent .offsetWidth;
	        var y_base = parent .offsetHeight;
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
	        self .root .insertBefore (wave, null);
	        wait (40) .then
	            (wave .setAttribute .bind (wave, 'move', true))
	        wait (100) .then
	            (wave .setAttribute .bind (wave, 'done', true))
	        wait (2000) .then
	            (self .root .removeChild .bind (self .root, wave))
	    });

}) (this, opts, this .my, this .me);
});
riot.tag2('component-withdrawn-todos-item--eliminated', '<a> <match> <match-graphic> <image-holder size="64x64"> <box-highlight> <box-top> <component-todo-highlight-status--withdrawn></component-todo-highlight-status--withdrawn> </box-top> <box-bottom> <component-time-highlight></component-time-highlight> </box-bottom> </box-highlight> </image-holder> </match-graphic> <match-info> <info-holder> <match-date>2016年12日14日 星期三</match-date> <br> <match-location><icon-holder><icon class="fa-map-marker"></icon></icon-holder>海心公園</match-location> <match-field-type>硬地</match-field-type> <match-number-of-players>5人</match-number-of-players> </info-holder> </match-info> <match-status>已過期<svg width="10" height="18" viewbox="0 0 10 14" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:figma="http://www.figma.com/figma/ns"><title>hourglass</title><desc>Created using Figma</desc><g id="Canvas" transform="translate(687 -15)" figma:type="canvas"><g id="hourglass" style="mix-blend-mode:normal;" figma:type="frame"><g id="Group" style="mix-blend-mode:normal;" figma:type="frame"><g id="Group" style="mix-blend-mode:normal;" figma:type="frame"><g id="Vector" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#387e952c-9090-495c-a2a8-70ef8b7b454a" transform="translate(-685.027 15.3235)" fill="#000055" style="mix-blend-mode:normal;"></use></g></g></g><mask id="mask0_alpha" mask-type="alpha"><path d="M -687.939 15.3235L -674.704 15.3235L -674.704 28.5588L -687.939 28.5588L -687.939 15.3235Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask0_alpha)" figma:type="frame"></g><mask id="mask1_alpha" mask-type="alpha"><path d="M -687.939 15.3235L -674.704 15.3235L -674.704 28.5588L -687.939 28.5588L -687.939 15.3235Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask1_alpha)" figma:type="frame"></g><mask id="mask2_alpha" mask-type="alpha"><path d="M -687.939 15.3235L -674.704 15.3235L -674.704 28.5588L -687.939 28.5588L -687.939 15.3235Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask2_alpha)" figma:type="frame"></g><mask id="mask3_alpha" mask-type="alpha"><path d="M -687.939 15.3235L -674.704 15.3235L -674.704 28.5588L -687.939 28.5588L -687.939 15.3235Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask3_alpha)" figma:type="frame"></g><mask id="mask4_alpha" mask-type="alpha"><path d="M -687.939 15.3235L -674.704 15.3235L -674.704 28.5588L -687.939 28.5588L -687.939 15.3235Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask4_alpha)" figma:type="frame"></g><mask id="mask5_alpha" mask-type="alpha"><path d="M -687.939 15.3235L -674.704 15.3235L -674.704 28.5588L -687.939 28.5588L -687.939 15.3235Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask5_alpha)" figma:type="frame"></g><mask id="mask6_alpha" mask-type="alpha"><path d="M -687.939 15.3235L -674.704 15.3235L -674.704 28.5588L -687.939 28.5588L -687.939 15.3235Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask6_alpha)" figma:type="frame"></g><mask id="mask7_alpha" mask-type="alpha"><path d="M -687.939 15.3235L -674.704 15.3235L -674.704 28.5588L -687.939 28.5588L -687.939 15.3235Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask7_alpha)" figma:type="frame"></g><mask id="mask8_alpha" mask-type="alpha"><path d="M -687.939 15.3235L -674.704 15.3235L -674.704 28.5588L -687.939 28.5588L -687.939 15.3235Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask8_alpha)" figma:type="frame"></g><mask id="mask9_alpha" mask-type="alpha"><path d="M -687.939 15.3235L -674.704 15.3235L -674.704 28.5588L -687.939 28.5588L -687.939 15.3235Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask9_alpha)" figma:type="frame"></g><mask id="mask10_alpha" mask-type="alpha"><path d="M -687.939 15.3235L -674.704 15.3235L -674.704 28.5588L -687.939 28.5588L -687.939 15.3235Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask10_alpha)" figma:type="frame"></g><mask id="mask11_alpha" mask-type="alpha"><path d="M -687.939 15.3235L -674.704 15.3235L -674.704 28.5588L -687.939 28.5588L -687.939 15.3235Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask11_alpha)" figma:type="frame"></g><mask id="mask12_alpha" mask-type="alpha"><path d="M -687.939 15.3235L -674.704 15.3235L -674.704 28.5588L -687.939 28.5588L -687.939 15.3235Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask12_alpha)" figma:type="frame"></g><mask id="mask13_alpha" mask-type="alpha"><path d="M -687.939 15.3235L -674.704 15.3235L -674.704 28.5588L -687.939 28.5588L -687.939 15.3235Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask13_alpha)" figma:type="frame"></g><mask id="mask14_alpha" mask-type="alpha"><path d="M -688.38 11L -673.38 11L -673.38 26L -688.38 26L -688.38 11Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask14_alpha)" figma:type="frame"></g></g></g><defs><path id="387e952c-9090-495c-a2a8-70ef8b7b454a" d="M 7.41176 3.02929C 7.41176 1.61325 7.41176 1.47481 7.41176 1.47481C 7.41176 0.952676 5.75259 0 3.70588 0C 1.65904 0 0 0.952676 0 1.47481C 0 1.47481 0 1.61312 0 3.02929C 0 4.44521 2.56553 5.61507 2.56553 6.61765C 2.56553 7.62022 0 8.78996 0 10.206C 0 11.622 0 11.7606 0 11.7606C 0 12.2826 1.65904 13.2353 3.70588 13.2353C 5.75259 13.2353 7.41176 12.2826 7.41176 11.7606C 7.41176 11.7606 7.41176 11.6222 7.41176 10.206C 7.41176 8.78982 4.84624 7.62022 4.84624 6.61765C 4.84624 5.61507 7.41176 4.44521 7.41176 3.02929ZM 1.01951 1.54099C 1.47997 1.25047 2.34331 0.824691 3.74201 0.824691C 5.14085 0.824691 6.39318 1.54099 6.39318 1.54099C 6.48675 1.5979 6.85509 1.79484 6.60309 1.944C 6.04813 2.27263 4.96297 2.61887 3.70588 2.61887C 2.44879 2.61887 1.3999 2.23729 0.844809 1.90853C 0.592809 1.75924 1.01951 1.54099 1.01951 1.54099ZM 4.03769 6.61765C 4.03769 7.40713 4.69668 7.91563 5.39497 8.59407C 5.90506 9.08974 6.60322 9.76844 6.60322 10.206L 6.60322 11.085C 5.96184 10.7652 4.04126 10.4523 4.04126 9.42803C 4.04126 8.90934 3.37076 8.90934 3.37076 9.42803C 3.37076 10.4523 1.45006 10.7652 0.808809 11.085L 0.808809 10.206C 0.808809 9.76831 1.50697 9.08974 2.01706 8.59407C 2.71482 7.91563 3.37407 7.40713 3.37407 6.61765C 3.37407 5.82816 2.71482 5.31979 2.01679 4.64135C 1.50671 4.14556 0.808544 3.46685 0.808544 3.02929L 0.777309 2.36779C 1.45641 2.73335 2.53271 3.0821 3.70588 3.0821C 4.87906 3.0821 5.96038 2.73335 6.63935 2.36779L 6.60322 3.02929C 6.60322 3.46699 5.90506 4.14569 5.39497 4.64135C 4.69668 5.31979 4.03769 5.82816 4.03769 6.61765Z"></path></defs></svg ></match-status> </match> </a>', '', '', function(opts) {
});
riot.tag2('component-withdrawn-todos-item--lapsed', '<a> <match> <match-graphic> <image-holder size="64x64"> <box-highlight> <box-top> <component-todo-highlight-status--withdrawn></component-todo-highlight-status--withdrawn> </box-top> <box-bottom> <component-time-highlight></component-time-highlight> </box-bottom> </box-highlight> </image-holder> </match-graphic> <match-info> <info-holder> <match-date>2016年12日14日 星期三</match-date> <br> <match-location><icon-holder><icon class="fa-map-marker"></icon></icon-holder>海心公園</match-location> <match-field-type>硬地</match-field-type> <match-number-of-players>5人</match-number-of-players> </info-holder> </match-info> <match-status>被淘汰</match-status> </match> </a>', '', '', function(opts) {
});
riot.tag2('component-x-button', '<icon-holder nav-button><svg width="13" height="13" viewbox="0 0 13 13" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:figma="http://www.figma.com/figma/ns"><title>cancel</title><desc>Created using Figma</desc><g id="Canvas" transform="translate(1022 334)" figma:type="canvas"><g id="cancel" style="mix-blend-mode:normal;" figma:type="frame"><g id="Group" style="mix-blend-mode:normal;" figma:type="frame"><g id="Vector" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#1c8fcd43-ce74-4b25-b1b4-2f698b0c61a8" transform="translate(-1022 -334)" fill="#5DADE2" style="mix-blend-mode:normal;"></use></g></g></g></g><defs><path id="1c8fcd43-ce74-4b25-b1b4-2f698b0c61a8" d="M 5.87831 6.50199L 0.123962 12.2965C -0.0359037 12.4575 -0.0359037 12.7183 0.123962 12.8793C 0.203793 12.9599 0.30861 13 0.413223 13C 0.51804 13 0.622653 12.9599 0.702484 12.8793L 6.5001 7.04119L 12.2977 12.8793C 12.3778 12.9599 12.4824 13 12.587 13C 12.6916 13 12.7964 12.9599 12.8762 12.8793C 13.0361 12.7183 13.0361 12.4575 12.8762 12.2965L 7.12209 6.50199L 12.8801 0.703352C 13.04 0.54237 13.04 0.281566 12.8801 0.120583C 12.7202 -0.0401945 12.4612 -0.0401945 12.3016 0.120583L 6.5003 5.96279L 0.698422 0.120788C 0.538556 -0.0399899 0.279765 -0.0399899 0.119899 0.120788C -0.0399664 0.28177 -0.0399664 0.542574 0.119899 0.703557L 5.87831 6.50199Z"></path></defs></svg></icon-holder>', '', '', function(opts) {
});
riot.tag2('page-hack', '', '', '', function(opts) {
(function (self, args, my, me) {

		self .establish (':load', transient)

		self .findings (':load')
			.thru (tap, function () {
				if (! my (':api') .hack_login) {
					alert ('Cant hack')
					window .location .hash = '#matches/find'
				}
				else {
					my (':api') .test_user .ask ();
					promise (my (':api') .test_user .findings) .then (function (user) {
						my (':api') .hack_login .ask (user .uuid);
						login_value .user .uuid = user .uuid;
						return promise (my (':api') .hack_login .findings)
					}) .then (function () {
						window .location .hash = '#team/open'
					})
				}
			})

}) (this, opts, this .my, this .me);
});
riot.tag2('page-history-check', '<nav> <nav-title> <component-page-title page="我的球賽"></component-page-title> </nav-title> </nav> <component-main-content> <check-todos> <component-search-bar></component-search-bar> <component-todos-tabs tab="history"></component-todos-tabs> <component-dynamic-load items_to_load="13" interval_for_loading="35" items__from=":todos"> <component-todos-check-wrap todo__from=":item"></component-todos-check-wrap> </component-dynamic-load> </check-todos> </component-main-content> <component-tabs tab="todos"></component-tabs>', '', '', function(opts) {
(function (self, args, my, me) {

		self .establish (':load', function (reqs) {
			return 	reqs .thru (tap, function () {
						if (! my (':api') .teams)
							window .location .hash = '#login'
					})
		})

		self
			.establish (':todos', function (requests) {
				return 	self .findings (':load')
							.thru (filter, function () {
								return my (':api') .teams;
							})
							.thru (map, function () {
								my (':api') .teams .ask ();
								return 	gotten (my (':api') .teams) .then (function (teams) {
											var team_id = teams [0] .id;
											return 	Promise .all
														([
															gotten (my (':api') .matches (team_id)),
															gotten (my (':api') .matches_applied (team_id))
														]);
										})
							})
							.thru (map, function (mine_and_applied) {
								return mine_and_applied [0] .concat (mine_and_applied [1]);
							})
							.thru (map, function (match_list) {

								var now = new Date ();

								var history = 	match_list .filter (function (match) {
													return now > new Date (match .start_at)
												})
								history .sort (function (a, b) {
									return new Date (a .start_at) < new Date (b .start_at)
								})

								return history;
							});
			})

}) (this, opts, this .my, this .me);
});
riot.tag2('page-league-table', '<nav> <nav-buttons> <a href="#team/profile"> <component-x-button></component-x-button> </a> </nav-buttons> <nav-title> <component-page-title page="聯賽表"></component-page-title> </nav-title> </nav> <component-main-content> <table> <tr> <th>Rank</th> <th>Name</th> <th></th> <th>Score</th> <th>勝率</th> </tr> <tr> <td>1</td> <td>Happy Footbro FC</td> <td><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon></td> <td>1654</td> <td>92%</td> </tr> <tr> <td>1</td> <td>Happy Footbro FC</td> <td><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon></td> <td>1654</td> <td>92%</td> </tr> <tr> <td>1</td> <td>Happy Footbro FC</td> <td><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon></td> <td>1654</td> <td>92%</td> </tr> <tr active> <td>1</td> <td>Happy Footbro FC</td> <td><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon></td> <td>1654</td> <td>92%</td> </tr> <tr> <td>1</td> <td>Happy Footbro FC</td> <td><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon></td> <td>1654</td> <td>92%</td> </tr> <tr> <td>1</td> <td>Happy Footbro FC</td> <td><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon></td> <td>1654</td> <td>92%</td> </tr> <tr> <td>1</td> <td>Happy Footbro FC</td> <td><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon></td> <td>1654</td> <td>92%</td> </tr> <tr> <td>1</td> <td>Happy Footbro FC</td> <td><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon></td> <td>1654</td> <td>92%</td> </tr> <tr> <td>1</td> <td>Happy Footbro FC</td> <td><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon></td> <td>1654</td> <td>92%</td> </tr> <tr> <td>1</td> <td>Happy Footbro FC</td> <td><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon></td> <td>1654</td> <td>92%</td> </tr> <tr> <td>1</td> <td>Happy Footbro FC</td> <td><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon></td> <td>1654</td> <td>92%</td> </tr> <tr> <td>1</td> <td>Happy Footbro FC</td> <td><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon></td> <td>1654</td> <td>92%</td> </tr> <tr> <td>1</td> <td>Happy Footbro FC</td> <td><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon></td> <td>1654</td> <td>92%</td> </tr> <tr> <td>1</td> <td>Happy Footbro FC</td> <td><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon></td> <td>1654</td> <td>92%</td> </tr> <tr> <td>1</td> <td>Happy Footbro FC</td> <td><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon></td> <td>1654</td> <td>92%</td> </tr> <tr> <td>1</td> <td>Happy Footbro FC</td> <td><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon><icon class="fa-star"></icon></td> <td>1654</td> <td>92%</td> </tr> </table> <rest></rest> </component-main-content> <component-tabs tab="teams"></component-tabs>', '', '', function(opts) {
});
riot.tag2('page-login', '<img ref="login-button" src="https://i.stack.imgur.com/ZW4QC.png">', '', '', function(opts) {
(function (self, args, my, me) {

		self
			.establish (':load', transient)

		mergeAll
			([self .findings (':load') , self .findings (':api')])
				.thru (filter, function () {
					return my (':api') .teams;
				})
				.thru (map, function () {
					return gotten (my (':api') .teams);
				})
				.thru (map, function (teams) {
					if (teams [0])
						window .location .hash = '#team/profile';
					else
						window .location .hash = '#team/open';
				})

		self
			.establish ('login-button', ref)
			.findings ('login-button')
				.thru (tap, function (ref) {
					ref .addEventListener ('click', function () {
						openFB .login (
							function (authentication) {
								if (authentication && authentication .status === 'connected' && authentication .authResponse .accessToken) {
									var login_info = authentication .authResponse;
									my (':api') .login .ask ({
										access_token: login_info .accessToken,
										device_id: "1234",
										device_type: "android"
									});
									promise (logged(my (':api') .login .findings)) .then (function (login) {
										self .ask (':api', { login: login });
									})
								}
								else {
									alert ('We could not login to Facebook!');
								}
							}, { scope: 'email' });
					})
				})

}) (this, opts, this .my, this .me);
});
riot.tag2('page-logout', '', '', '', function(opts) {
(function (self, args, my, me) {

		self .establish (':load', transient)

		self .findings (':load')
			.thru (tap, function () {
				localforage .clear () .then (function () {
					login_value = undefined;
					self .ask (':api', { logout: true })
					self .findings (':api') .thru (promise) .then (function () {
						window .location .hash = '#matches/find'
					})
				})
			})

}) (this, opts, this .my, this .me);
});
riot.tag2('page-match-open', '<nav> <nav-buttons> <a href="#matches/find"> <component-cancel-button></component-cancel-button> </a> </nav-buttons> <nav-title> <component-page-title page="建立球賽"></component-page-title> </nav-title> </nav> <component-main-content> <open-match> <info-area info="match"> <info-holder> <info-header> 賽事資料 </info-header> <component-separator></component-separator> <match-date> <label> <svg width="16" height="15" viewbox="0 0 16 15" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:figma="http://www.figma.com/figma/ns"><title>Group</title><desc>Created using Figma</desc><g id="Canvas" transform="translate(1157 296)" figma:type="canvas"><g id="Group" style="mix-blend-mode:normal;" figma:type="frame"><g id="Vector" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#84ad6479-2db8-4c8a-a2bf-a12046b20303" transform="translate(-1156.52 -296)" fill="#1A5276" style="mix-blend-mode:normal;"></use></g><g id="Vector" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#96694655-9fe0-4957-9fa4-3de07b67134f" transform="translate(-1154.11 -290.25)" fill="#1A5276" style="mix-blend-mode:normal;"></use></g></g></g><defs><path id="84ad6479-2db8-4c8a-a2bf-a12046b20303" d="M 14.7321 1L 12.8571 1L 12.8571 0.25C 12.8571 0.11175 12.7374 0 12.5893 0L 10.7143 0C 10.5662 0 10.4464 0.11175 10.4464 0.25L 10.4464 1L 4.55357 1L 4.55357 0.25C 4.55357 0.11175 4.43384 0 4.28571 0L 2.41071 0C 2.26259 0 2.14286 0.11175 2.14286 0.25L 2.14286 1L 0.267857 1C 0.119732 1 0 1.11175 0 1.25L 0 4L 0 14.75C 0 14.8883 0.119732 15 0.267857 15L 14.7321 15C 14.8803 15 15 14.8883 15 14.75L 15 4L 15 1.25C 15 1.11175 14.8803 1 14.7321 1ZM 10.9821 0.5L 12.3214 0.5L 12.3214 1.25L 12.3214 2L 10.9821 2L 10.9821 1.25L 10.9821 0.5ZM 2.67857 0.5L 4.01786 0.5L 4.01786 1.25L 4.01786 2L 2.67857 2L 2.67857 1.25L 2.67857 0.5ZM 0.535714 1.5L 2.14286 1.5L 2.14286 2.25C 2.14286 2.38825 2.26259 2.5 2.41071 2.5L 4.28571 2.5C 4.43384 2.5 4.55357 2.38825 4.55357 2.25L 4.55357 1.5L 10.4464 1.5L 10.4464 2.25C 10.4464 2.38825 10.5662 2.5 10.7143 2.5L 12.5893 2.5C 12.7374 2.5 12.8571 2.38825 12.8571 2.25L 12.8571 1.5L 14.4643 1.5L 14.4643 3.75L 0.535714 3.75L 0.535714 1.5ZM 0.535714 14.5L 0.535714 4.25L 14.4643 4.25L 14.4643 14.5L 0.535714 14.5Z"></path><path id="96694655-9fe0-4957-9fa4-3de07b67134f" d="M 7.23214 0L 5.35714 0L 4.82143 0L 2.94643 0L 2.41071 0L 0 0L 0 2.25L 0 2.75L 0 4.5L 0 5L 0 7.25L 2.41071 7.25L 2.94643 7.25L 4.82143 7.25L 5.35714 7.25L 7.23214 7.25L 7.76786 7.25L 10.1786 7.25L 10.1786 5L 10.1786 4.5L 10.1786 2.75L 10.1786 2.25L 10.1786 0L 7.76786 0L 7.23214 0ZM 5.35714 0.5L 7.23214 0.5L 7.23214 2.25L 5.35714 2.25L 5.35714 0.5ZM 7.23214 4.5L 5.35714 4.5L 5.35714 2.75L 7.23214 2.75L 7.23214 4.5ZM 2.94643 2.75L 4.82143 2.75L 4.82143 4.5L 2.94643 4.5L 2.94643 2.75ZM 2.94643 0.5L 4.82143 0.5L 4.82143 2.25L 2.94643 2.25L 2.94643 0.5ZM 0.535714 0.5L 2.41071 0.5L 2.41071 2.25L 0.535714 2.25L 0.535714 0.5ZM 0.535714 2.75L 2.41071 2.75L 2.41071 4.5L 0.535714 4.5L 0.535714 2.75ZM 2.41071 6.75L 0.535714 6.75L 0.535714 5L 2.41071 5L 2.41071 6.75ZM 4.82143 6.75L 2.94643 6.75L 2.94643 5L 4.82143 5L 4.82143 6.75ZM 7.23214 6.75L 5.35714 6.75L 5.35714 5L 7.23214 5L 7.23214 6.75ZM 9.64286 6.75L 7.76786 6.75L 7.76786 5L 9.64286 5L 9.64286 6.75ZM 9.64286 4.5L 7.76786 4.5L 7.76786 2.75L 9.64286 2.75L 9.64286 4.5ZM 9.64286 0.5L 9.64286 2.25L 7.76786 2.25L 7.76786 0.5L 9.64286 0.5Z"></path></defs></svg> 日期 </label> <control-holder> <component-table-control message__from=":date"> <component-date-picker date__to=":date"></component-date-picker> </component-table-control> </control-holder> </match-date> <component-separator></component-separator> <match-time> <label> <svg width="15" height="15" viewbox="0 0 15 15" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:figma="http://www.figma.com/figma/ns"><title>Group</title><desc>Created using Figma</desc><g id="Canvas" transform="translate(1157 267)" figma:type="canvas"><g id="Group" style="mix-blend-mode:normal;" figma:type="frame"><g id="Vector" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#e182a5c5-d7f4-48a7-a83e-7f5e09a4b64c" transform="translate(-1157 -267)" fill="#8E44AD" style="mix-blend-mode:normal;"></use></g><g id="Vector" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#2f493b0a-c7a8-4323-ae6f-91c03ef1cc52" transform="translate(-1153.88 -265.56)" fill="#8E44AD" style="mix-blend-mode:normal;"></use></g></g></g><defs><path id="e182a5c5-d7f4-48a7-a83e-7f5e09a4b64c" d="M 7.2 0C 3.22992 0 0 3.22992 0 7.2C 0 11.1701 3.22992 14.4 7.2 14.4C 11.1701 14.4 14.4 11.1701 14.4 7.2C 14.4 3.22992 11.1701 0 7.2 0ZM 7.2 13.92C 3.49464 13.92 0.48 10.9054 0.48 7.2C 0.48 3.49464 3.49464 0.48 7.2 0.48C 10.9054 0.48 13.92 3.49464 13.92 7.2C 13.92 10.9054 10.9054 13.92 7.2 13.92Z"></path><path id="2f493b0a-c7a8-4323-ae6f-91c03ef1cc52" d="M 4.08 0C 3.94752 0 3.84 0.10728 3.84 0.24L 3.84 5.76L 0.24 5.76C 0.10752 5.76 0 5.86728 0 6C 0 6.13272 0.10752 6.24 0.24 6.24L 4.08 6.24C 4.21248 6.24 4.32 6.13272 4.32 6L 4.32 0.24C 4.32 0.10728 4.21248 0 4.08 0Z"></path></defs></svg> 時間 </label> <control-holder> <component-table-control message__from="time-duration"> <component-time-picker time__to=":time" duration__to=":duration"></component-time-picker> </component-table-control> </control-holder> </match-time> <component-separator></component-separator> <match-location> <label> <svg width="14" height="19" viewbox="0 0 14 19" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:figma="http://www.figma.com/figma/ns"><title>placeholder</title><desc>Created using Figma</desc><g id="Canvas" transform="translate(1156 240)" figma:type="canvas"><g id="placeholder" style="mix-blend-mode:normal;" figma:type="frame"><g id="Vector" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#63932ca2-69f6-4206-8065-36e54db2dad2" transform="translate(-1155.88 -240)" fill="#EE3840" style="mix-blend-mode:normal;"></use></g></g></g><defs><path id="63932ca2-69f6-4206-8065-36e54db2dad2" d="M 11.238 1.94151C 8.66733 -0.647169 4.49916 -0.647169 1.92814 1.94151C -0.388274 4.27416 -0.649034 8.6663 1.31681 11.3057L 6.58307 18.9645L 11.8493 11.3057C 13.8152 8.6663 13.5544 4.27416 11.238 1.94151ZM 6.64717 8.75274C 5.44695 8.75274 4.47417 7.77314 4.47417 6.56451C 4.47417 5.35588 5.44695 4.37628 6.64717 4.37628C 7.84739 4.37628 8.82017 5.35588 8.82017 6.56451C 8.82017 7.77314 7.84739 8.75274 6.64717 8.75274Z"></path></defs></svg> 地點 </label> <control-holder> <component-table-control message__from=":location"> <component-football-field-picker location__to=":location"></component-football-field-picker> </component-table-control> </control-holder> </match-location> <component-separator></component-separator> <match-type-number-of-players> <label> <svg width="14" height="19" viewbox="0 0 14 19" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:figma="http://www.figma.com/figma/ns"><title>people</title><desc>Created using Figma</desc><g id="Canvas" transform="translate(1157 32)" figma:type="canvas"><g id="people" style="mix-blend-mode:normal;" figma:type="frame"><g id="Group" style="mix-blend-mode:normal;" figma:type="frame"><g id="Group" style="mix-blend-mode:normal;" figma:type="frame"><g id="XMLID 2038" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#56178ad8-59fa-4481-ab2a-cb6ddea229be" transform="translate(-1151.18 -28.1659)" fill="#A7A9AC" style="mix-blend-mode:normal;"></use></g><g id="XMLID 2039" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#48c1c4c1-e6a8-47cf-aca6-942ef11301e0" transform="translate(-1152.48 -23.7096)" fill="#A7A9AC" style="mix-blend-mode:normal;"></use></g><g id="Vector" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#4d4b89ab-a4b0-4a8c-8a38-24289e2946ce" transform="translate(-1157 -23.2427)" style="mix-blend-mode:normal;"></use></g><g id="Vector" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#54e17de2-2417-4e01-9cf7-39f13e91a977" transform="translate(-1155.78 -27.4191)" style="mix-blend-mode:normal;"></use></g><g id="Vector" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#64733042-8ec3-4fac-b1ca-769ce78bcd18" transform="translate(-1147.51 -23.2456)" style="mix-blend-mode:normal;"></use></g><g id="Vector" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#c29ea2c3-7373-466e-b0d2-87e5940fb610" transform="translate(-1147.05 -27.4191)" style="mix-blend-mode:normal;"></use></g><g id="Vector" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#ca8b21ef-a843-4748-abd8-d25ccc471637" transform="translate(-1152.79 -24.0434)" style="mix-blend-mode:normal;"></use></g><g id="Vector" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#00ad5f2a-5da3-4c05-a667-db4226456e87" transform="translate(-1151.49 -28.5)" style="mix-blend-mode:normal;"></use></g></g></g><mask id="mask0_alpha" mask-type="alpha"><path d="M -1157 -27L -1154.35 -27L -1154.35 -24.1405L -1157 -24.1405L -1157 -27Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask0_alpha)" figma:type="frame"></g><mask id="mask1_alpha" mask-type="alpha"><path d="M -1157 -27L -1154.35 -27L -1154.35 -24.1405L -1157 -24.1405L -1157 -27Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask1_alpha)" figma:type="frame"></g><mask id="mask2_alpha" mask-type="alpha"><path d="M -1157 -27L -1154.35 -27L -1154.35 -24.1405L -1157 -24.1405L -1157 -27Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask2_alpha)" figma:type="frame"></g><mask id="mask3_alpha" mask-type="alpha"><path d="M -1157 -27L -1154.35 -27L -1154.35 -24.1405L -1157 -24.1405L -1157 -27Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask3_alpha)" figma:type="frame"></g><mask id="mask4_alpha" mask-type="alpha"><path d="M -1157 -27L -1154.35 -27L -1154.35 -24.1405L -1157 -24.1405L -1157 -27Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask4_alpha)" figma:type="frame"></g><mask id="mask5_alpha" mask-type="alpha"><path d="M -1157 -27L -1154.35 -27L -1154.35 -24.1405L -1157 -24.1405L -1157 -27Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask5_alpha)" figma:type="frame"></g><mask id="mask6_alpha" mask-type="alpha"><path d="M -1157 -27L -1154.35 -27L -1154.35 -24.1405L -1157 -24.1405L -1157 -27Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask6_alpha)" figma:type="frame"></g><mask id="mask7_alpha" mask-type="alpha"><path d="M -1157 -27L -1154.35 -27L -1154.35 -24.1405L -1157 -24.1405L -1157 -27Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask7_alpha)" figma:type="frame"></g><mask id="mask8_alpha" mask-type="alpha"><path d="M -1157 -27L -1154.35 -27L -1154.35 -24.1405L -1157 -24.1405L -1157 -27Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask8_alpha)" figma:type="frame"></g><mask id="mask9_alpha" mask-type="alpha"><path d="M -1157 -27L -1154.35 -27L -1154.35 -24.1405L -1157 -24.1405L -1157 -27Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask9_alpha)" figma:type="frame"></g><mask id="mask10_alpha" mask-type="alpha"><path d="M -1157 -27L -1154.35 -27L -1154.35 -24.1405L -1157 -24.1405L -1157 -27Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask10_alpha)" figma:type="frame"></g><mask id="mask11_alpha" mask-type="alpha"><path d="M -1157 -27L -1154.35 -27L -1154.35 -24.1405L -1157 -24.1405L -1157 -27Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask11_alpha)" figma:type="frame"></g><mask id="mask12_alpha" mask-type="alpha"><path d="M -1157 -27L -1154.35 -27L -1154.35 -24.1405L -1157 -24.1405L -1157 -27Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask12_alpha)" figma:type="frame"></g><mask id="mask13_alpha" mask-type="alpha"><path d="M -1157 -27L -1154.35 -27L -1154.35 -24.1405L -1157 -24.1405L -1157 -27Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask13_alpha)" figma:type="frame"></g><mask id="mask14_alpha" mask-type="alpha"><path d="M -1157 -27L -1154.35 -27L -1154.35 -24.1405L -1157 -24.1405L -1157 -27Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask14_alpha)" figma:type="frame"></g></g></g><defs><path id="56178ad8-59fa-4481-ab2a-cb6ddea229be" d="M 1.18104 3.31295C 1.18441 3.31295 1.18777 3.31295 1.18777 3.31295C 2.54714 3.29825 2.34862 1.31295 2.34862 1.31295C 2.29478 -0.0142538 1.28199 -0.00322437 1.18104 0.000452105C 1.0801 -0.00322437 0.0673067 -0.0142538 0.0101057 1.30928C 0.0101057 1.30928 -0.188415 3.29457 1.17432 3.30928C 1.17432 3.31295 1.17768 3.31295 1.18104 3.31295Z"></path><path id="48c1c4c1-e6a8-47cf-aca6-942ef11301e0" d="M 2.47974 1.32353L 3.35795 1.12197e-07C 3.35795 1.12197e-07 3.97706 0.272059 4.48178 0.680147C 4.613 0.786765 4.67357 0.849265 4.79134 0.977941C 5.07061 1.28309 4.95284 3.05147 4.79134 3.69853C 4.62983 4.34559 4.15539 5.27574 4.15539 5.27574C 4.06118 5.51103 4.00062 5.76471 3.97706 6.01838L 3.3714 12.5074C 3.35122 12.7132 3.19307 12.8713 3.00464 12.8713L 2.47974 12.8713L 1.95484 12.8713C 1.76641 12.8713 1.6049 12.7132 1.58808 12.5074L 0.98242 6.01838C 0.958866 5.76103 0.898301 5.51103 0.804087 5.27574C 0.804087 5.27574 0.329655 4.34926 0.168146 3.69853C 0.00663766 3.05147 -0.111129 1.28309 0.168146 0.977941C 0.285913 0.849265 0.346479 0.786765 0.477705 0.680147C 0.98242 0.275735 1.60154 1.12197e-07 1.60154 1.12197e-07L 2.47974 1.32353Z"></path><path id="4d4b89ab-a4b0-4a8c-8a38-24289e2946ce" d="M 0.16683 3.88974C 0.318245 4.49268 0.722016 5.30518 0.782582 5.43018C 0.856607 5.61768 0.903714 5.81254 0.920538 6.01474L 1.48918 12.103C 1.52283 12.4669 1.80211 12.7427 2.13858 12.7427L 3.12109 12.7427C 3.45757 12.7427 3.73685 12.4669 3.77049 12.103L 4.33914 6.01474C 4.35933 5.80886 4.40644 5.60665 4.48383 5.41915C 4.55112 5.25004 4.48046 5.05518 4.32905 4.98165C 4.17427 4.90812 3.99593 4.98533 3.92864 5.15077C 3.8277 5.40445 3.7604 5.67283 3.73685 5.94856L 3.1682 12.0368C 3.16484 12.0589 3.14801 12.0772 3.12782 12.0772L 2.14531 12.0772C 2.12512 12.0772 2.10494 12.0589 2.10494 12.0368L 1.52956 5.94489C 1.50264 5.66915 1.43871 5.40077 1.33777 5.14709C 1.3344 5.13606 1.33104 5.12871 1.32431 5.11768C 1.32094 5.11033 0.896984 4.27577 0.755664 3.71327C 0.600885 3.08459 0.557143 1.71695 0.685004 1.4743C 0.785947 1.36401 0.829689 1.31989 0.933997 1.23533C 1.19981 1.02209 1.50601 0.8493 1.70453 0.746359L 2.38421 1.76842C 2.44141 1.85298 2.53226 1.90445 2.62984 1.90445C 2.72742 1.90445 2.81827 1.85298 2.87547 1.76842L 3.69983 0.529447C 3.79741 0.382388 3.76713 0.17283 3.63254 0.0625354C 3.49795 -0.0440822 3.30616 -0.010994 3.20521 0.136065L 2.62647 1.00371L 2.05446 0.139742C 1.97371 0.0147415 1.8223 -0.0293763 1.69443 0.0257707C 1.67088 0.0368001 1.07195 0.301506 0.573967 0.702242C 0.432647 0.816212 0.365351 0.886065 0.247584 1.01474C -0.183106 1.48533 0.0557928 3.44121 0.16683 3.88974Z"></path><path id="54e17de2-2417-4e01-9cf7-39f13e91a977" d="M 1.38579 3.76838C 1.39252 3.76838 1.39925 3.76838 1.40598 3.76838C 1.40935 3.76838 1.41607 3.76838 1.41944 3.76838C 1.42617 3.76838 1.4329 3.76838 1.44299 3.76838C 1.83331 3.75735 2.16305 3.60294 2.39859 3.3125C 2.89994 2.69485 2.82928 1.66544 2.81582 1.53676C 2.76535 0.400735 2.04192 -1.40246e-08 1.43963 -1.40246e-08C 1.42953 -1.40246e-08 1.41944 -1.40246e-08 1.41271 -1.40246e-08C 1.40598 -1.40246e-08 1.39589 -1.40246e-08 1.38579 -1.40246e-08C 0.783499 -1.40246e-08 0.0634386 0.404412 0.00960238 1.53676C -0.000491915 1.66544 -0.0745167 2.69485 0.426833 3.3125C 0.665732 3.60294 0.995479 3.76103 1.38579 3.76838ZM 0.618625 1.59559C 0.618625 1.58824 0.618625 1.58088 0.618625 1.57353C 0.652273 0.779412 1.11325 0.661765 1.38579 0.661765L 1.39925 0.661765C 1.40598 0.661765 1.41607 0.661765 1.4228 0.661765L 1.43626 0.661765C 1.70881 0.661765 2.16978 0.779412 2.20343 1.57353C 2.20343 1.58088 2.20343 1.58824 2.20343 1.59191C 2.22698 1.82721 2.22025 2.51471 1.93425 2.86765C 1.80975 3.02206 1.63815 3.09926 1.41271 3.09926C 1.40935 3.09926 1.40935 3.09926 1.40598 3.09926C 1.18054 3.09559 1.00894 3.02206 0.884442 2.86765C 0.601801 2.51838 0.598436 1.83088 0.618625 1.59559Z"></path><path id="64733042-8ec3-4fac-b1ca-769ce78bcd18" d="M 0.182246 4.98088C 0.0274668 5.05441 -0.0431935 5.25294 0.0274666 5.41838C 0.104856 5.60956 0.151964 5.80808 0.172152 6.01397L 0.740798 12.1022C 0.774445 12.4662 1.05372 12.7419 1.3902 12.7419L 2.37271 12.7419C 2.70919 12.7419 2.98846 12.4662 3.02211 12.1022L 3.59076 6.01397C 3.61094 5.81176 3.65469 5.61691 3.72871 5.42941C 3.78928 5.30809 4.19641 4.49558 4.34446 3.88897C 4.4555 3.44044 4.69776 1.48456 4.26707 1.01397C 4.14931 0.885291 4.08201 0.815438 3.94069 0.701467C 3.44271 0.300732 2.84714 0.036026 2.82022 0.0249966C 2.689 -0.0338269 2.54095 0.0139669 2.46019 0.138967L 1.88145 1.00661L 1.29935 0.142644C 1.20177 -0.00809172 1.00998 -0.0375035 0.872023 0.0691142C 0.737433 0.175732 0.70715 0.385291 0.804728 0.536026L 1.6291 1.775C 1.6863 1.85956 1.77715 1.91103 1.87472 1.91103C 1.9723 1.91103 2.06315 1.85956 2.12035 1.775L 2.80004 0.752937C 2.99856 0.855879 3.30475 1.02867 3.57057 1.24191C 3.67151 1.32279 3.71525 1.37058 3.81956 1.48088C 3.94742 1.72353 3.90368 3.09117 3.7489 3.71985C 3.60758 4.28235 3.18362 5.11691 3.18025 5.12426C 3.17689 5.13161 3.17016 5.14264 3.16679 5.15367C 3.06585 5.40735 2.99856 5.67573 2.975 5.95147L 2.40636 12.0397C 2.40299 12.0618 2.38617 12.0801 2.36598 12.0801L 1.38347 12.0801C 1.36328 12.0801 1.34309 12.0618 1.34309 12.0397L 0.774445 5.95147C 0.747527 5.67573 0.683596 5.40735 0.582653 5.15367C 0.515358 4.98088 0.337025 4.90735 0.182246 4.98088Z"></path><path id="c29ea2c3-7373-466e-b0d2-87e5940fb610" d="M 1.38243 3.76838C 1.38916 3.76838 1.39589 3.76838 1.40598 3.76838C 1.40935 3.76838 1.41607 3.76838 1.41944 3.76838C 1.42617 3.76838 1.4329 3.76838 1.43963 3.76838C 1.82994 3.76103 2.15969 3.60294 2.39859 3.3125C 2.89994 2.69485 2.82928 1.66544 2.81582 1.53676C 2.76535 0.400735 2.04529 -1.40246e-08 1.43963 -1.40246e-08C 1.42953 -1.40246e-08 1.41944 -1.40246e-08 1.41271 -1.40246e-08C 1.40598 -1.40246e-08 1.39589 -1.40246e-08 1.38579 -1.40246e-08C 0.783499 -1.40246e-08 0.0634389 0.404412 0.00960259 1.53676C -0.000491709 1.66544 -0.0745168 2.69485 0.426833 3.3125C 0.662367 3.60294 0.992114 3.75735 1.38243 3.76838ZM 0.615261 1.59559C 0.615261 1.58824 0.615261 1.58088 0.615261 1.57353C 0.648908 0.779412 1.10988 0.661765 1.38243 0.661765L 1.39589 0.661765C 1.40262 0.661765 1.41271 0.661765 1.41944 0.661765L 1.4329 0.661765C 1.70544 0.661765 2.16642 0.779412 2.20007 1.57353C 2.20007 1.58088 2.20007 1.58824 2.20007 1.59191C 2.22362 1.82721 2.21689 2.51471 1.93088 2.86765C 1.80639 3.02206 1.63478 3.09559 1.40935 3.09926C 1.40598 3.09926 1.40598 3.09926 1.40262 3.09926C 1.17718 3.09559 1.00557 3.02206 0.881077 2.86765C 0.598437 2.51838 0.595072 1.83088 0.615261 1.59559Z"></path><path id="ca8b21ef-a843-4748-abd8-d25ccc471637" d="M 0.259304 1.07647C -0.194939 1.57279 0.0607833 3.64264 0.181915 4.12059C 0.343424 4.76397 0.774114 5.63161 0.838044 5.75661C 0.918799 5.95882 0.96927 6.16838 0.989459 6.38529L 1.59512 12.8743C 1.62876 13.2529 1.91813 13.536 2.26807 13.536L 3.31451 13.536C 3.66108 13.536 3.95045 13.2493 3.98747 12.8743L 4.59312 6.38529C 4.61331 6.16838 4.66378 5.95514 4.74454 5.75661C 4.80847 5.62794 5.23916 4.76397 5.40067 4.12059C 5.51844 3.64264 5.77752 1.57279 5.32328 1.07647C 5.19878 0.940438 5.12812 0.866908 4.98007 0.745585C 4.4518 0.319114 3.81586 0.0397023 3.78894 0.0249965C 3.65772 -0.0338271 3.50967 0.013967 3.42891 0.138967L 2.78624 1.09117L 2.15367 0.138967C 2.07291 0.013967 1.9215 -0.0301506 1.79364 0.0249965C 1.76672 0.0360259 1.13414 0.319114 0.602511 0.745585C 0.454461 0.866908 0.380436 0.940438 0.259304 1.07647ZM 0.696724 1.5397C 0.807761 1.41838 0.854868 1.37059 0.965905 1.28235C 1.25528 1.04706 1.59175 0.859556 1.8071 0.749261L 2.54062 1.8522C 2.59782 1.93676 2.68867 1.98823 2.78624 1.98823C 2.88382 1.98823 2.97467 1.93676 3.03187 1.8522L 3.76539 0.749261C 3.97737 0.859556 4.31385 1.04706 4.60658 1.28235C 4.71762 1.37059 4.76473 1.41838 4.87576 1.5397C 5.01708 1.7897 4.97334 3.26397 4.80174 3.94411C 4.65032 4.54706 4.19945 5.43676 4.19272 5.44411C 4.18935 5.45147 4.18262 5.4625 4.17926 5.47353C 4.07158 5.74191 4.00092 6.025 3.97401 6.31912L 3.36835 12.8081C 3.36498 12.8449 3.33807 12.8706 3.30442 12.8706L 2.25798 12.8706C 2.22433 12.8706 2.19741 12.8449 2.19405 12.8081L 1.58839 6.31912C 1.56147 6.02867 1.49417 5.74191 1.38314 5.47353C 1.37977 5.4625 1.37641 5.45514 1.36968 5.44411C 1.36631 5.43676 0.912069 4.54338 0.760655 3.94044C 0.599146 3.26397 0.555404 1.7897 0.696724 1.5397Z"></path><path id="00ad5f2a-5da3-4c05-a667-db4226456e87" d="M 1.45705 3.97794C 1.46378 3.97794 1.47387 3.97794 1.4806 3.97794C 1.48397 3.97794 1.49406 3.97794 1.49743 3.97794C 1.50416 3.97794 1.51089 3.97794 1.51762 3.97794C 1.93485 3.97059 2.27132 3.80882 2.52368 3.49632C 3.05531 2.84559 2.97456 1.75 2.96447 1.61765C 2.91063 0.422794 2.15356 0 1.51762 0C 1.50752 0 1.49743 0 1.48733 0C 1.4806 0 1.47051 0 1.45705 0C 0.824475 0 0.0640378 0.422794 0.0102015 1.61765C 0.000107191 1.75 -0.0806475 2.84191 0.450986 3.49265C 0.703343 3.80515 1.04318 3.96691 1.45705 3.97794ZM 0.619224 1.68015C 0.619224 1.67279 0.619224 1.66544 0.619224 1.65809C 0.656236 0.761029 1.21815 0.665441 1.45705 0.665441L 1.47387 0.665441C 1.4806 0.665441 1.4907 0.665441 1.49743 0.665441L 1.51425 0.665441C 1.75315 0.665441 2.31507 0.761029 2.35208 1.65809C 2.35208 1.66544 2.35208 1.67279 2.35208 1.67647C 2.37563 1.93015 2.37227 2.67279 2.06271 3.05147C 1.92475 3.22059 1.73633 3.30515 1.4907 3.30515C 1.48733 3.30515 1.48397 3.30515 1.4806 3.30515C 1.23498 3.30147 1.04655 3.22059 0.908594 3.05147C 0.599036 2.67647 0.595671 1.93382 0.619224 1.68015Z"></path></defs></svg> 人數 </label> <control-holder> <component-select-control select__to=":number-of-players"> <a>5v5</a> <a>7v7</a> <a>9v9</a> <a>11v11</a> </component-select-control> </control-holder> </match-type-number-of-players> <component-separator></component-separator> <match-type-pitch> <label> <svg width="14" height="18" viewbox="0 0 14 18" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:figma="http://www.figma.com/figma/ns"><title>soccer-field</title><desc>Created using Figma</desc><g id="Canvas" transform="translate(1157 208)" figma:type="canvas"><g id="soccer-field" style="mix-blend-mode:normal;" figma:type="frame"><g id="Soccer-field 1" style="mix-blend-mode:normal;" figma:type="frame"><g id="Soccer-field" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#62b9d1df-7938-4819-a4b7-65740c8bf388" transform="translate(-1156.76 -208)" fill="#1D8348" style="mix-blend-mode:normal;"></use></g></g></g></g><defs><path id="62b9d1df-7938-4819-a4b7-65740c8bf388" d="M 13.16 0L 0.28 0C 0.12544 0 0 0.12096 0 0.27L 0 17.01C 0 17.159 0.12544 17.28 0.28 17.28L 13.16 17.28C 13.3148 17.28 13.44 17.159 13.44 17.01L 13.44 0.27C 13.44 0.12096 13.3148 0 13.16 0ZM 7.42 2.67759C 7.42 3.02481 7.10612 3.3075 6.72 3.3075C 6.33388 3.3075 6.02 3.02508 6.02 2.67759C 6.02 2.61657 6.0298 2.55582 6.04912 2.4975L 7.3906 2.4975C 7.4102 2.55582 7.42 2.61657 7.42 2.67759ZM 4.88292 1.8981L 4.88292 0.5481L 8.55708 0.5481L 8.55708 1.8981L 4.88292 1.8981ZM 4.32292 0.54L 4.32292 2.1681C 4.32292 2.31714 4.44808 2.4381 4.60292 2.4381L 5.4894 2.4381C 5.47176 2.51694 5.46 2.59686 5.46 2.67759C 5.46 3.32262 6.02504 3.8475 6.72 3.8475C 7.41468 3.8475 7.98 3.32289 7.98 2.67759C 7.98 2.59659 7.96824 2.51667 7.9506 2.4381L 8.83736 2.4381C 8.9922 2.4381 9.11736 2.31714 9.11736 2.1681L 9.11736 0.54L 12.88 0.54L 12.88 8.16588L 9.50572 8.16588C 9.36488 6.80346 8.16928 5.73588 6.72 5.73588C 5.27072 5.73588 4.07512 6.80346 3.93428 8.16588L 0.56 8.16588L 0.56 0.54L 4.32292 0.54ZM 4.49932 8.16588C 4.63792 7.10208 5.57984 6.27588 6.72 6.27588C 7.86016 6.27588 8.80208 7.10208 8.94068 8.16588L 4.49932 8.16588ZM 8.94068 8.70588C 8.80208 9.76968 7.86016 10.5959 6.72 10.5959C 5.57984 10.5959 4.63792 9.76968 4.49932 8.70588L 8.94068 8.70588ZM 6.02 14.5349C 6.02 14.1877 6.33388 13.905 6.72 13.905C 7.10612 13.905 7.42 14.1874 7.42 14.5349C 7.42 14.5959 7.4102 14.6567 7.39088 14.715L 6.0494 14.715C 6.0298 14.6567 6.02 14.5959 6.02 14.5349ZM 8.55736 15.3144L 8.55736 16.6644L 4.88292 16.6644L 4.88292 15.3144L 8.55736 15.3144ZM 9.11736 16.74L 9.11736 15.0444C 9.11736 14.8954 8.9922 14.7744 8.83736 14.7744L 7.9506 14.7744C 7.96824 14.6956 7.98 14.6159 7.98 14.5349C 7.98 13.8899 7.41468 13.365 6.72 13.365C 6.02504 13.365 5.46 13.8896 5.46 14.5349C 5.46 14.6159 5.47176 14.6958 5.4894 14.7744L 4.60292 14.7744C 4.44808 14.7744 4.32292 14.8954 4.32292 15.0444L 4.32292 16.74L 0.56 16.74L 0.56 8.70588L 3.93428 8.70588C 4.07512 10.0683 5.27072 11.1359 6.72 11.1359C 8.16928 11.1359 9.36488 10.0683 9.50572 8.70588L 12.88 8.70588L 12.88 16.74L 9.11736 16.74Z"></path></defs></svg> 場地 </label> <control-holder> <component-select-control select__to=":pitch-type"> <a>硬地</a> <a>人造草</a> <a>仿真草</a> <a>真草</a> </component-select-control> </control-holder> </match-type-pitch> <component-separator></component-separator> <team-shirt-color> <label> <svg width="19" height="16" viewbox="0 0 19 16" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:figma="http://www.figma.com/figma/ns"><title>soccer-jersey</title><desc>Created using Figma</desc><g id="Canvas" transform="translate(1160 61)" figma:type="canvas"><g id="soccer-jersey" style="mix-blend-mode:normal;" figma:type="frame"><g id="Group" style="mix-blend-mode:normal;" figma:type="frame"><g id="Group" style="mix-blend-mode:normal;" figma:type="frame"><g id="Vector" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#7502afb2-9d1b-4ce3-b036-3ee6ec531c22" transform="translate(-1159 -61)" fill="#0E6655" style="mix-blend-mode:normal;"></use></g><g id="Vector" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#44438887-890f-424c-88e1-324366c0b033" transform="translate(-1152.1 -55.7636)" fill="#0E6655" style="mix-blend-mode:normal;"></use></g></g></g></g></g><defs><path id="7502afb2-9d1b-4ce3-b036-3ee6ec531c22" d="M 17.9543 6.24586L 14.9543 1.59133C 14.9231 1.54304 14.8778 1.50435 14.8241 1.48078L 12.5336 0.471041C 12.5333 0.471041 12.5333 0.47075 12.533 0.47075L 11.5241 0.0262427C 11.4401 -0.0109935 11.3435 -0.0083753 11.2616 0.0326427C 11.1803 0.0739517 11.1221 0.149006 11.1053 0.236569C 10.7333 2.13911 9.37255 2.44194 8.97326 2.48994C 8.96966 2.49023 8.96636 2.48849 8.96276 2.48907C 8.90216 2.49663 8.86076 2.49925 8.86106 2.49954C 8.85806 2.49954 8.85056 2.49896 8.84306 2.49838C 8.83976 2.49809 8.83766 2.49809 8.83346 2.4978C 8.82476 2.49722 8.81126 2.49547 8.79896 2.49402C 8.79086 2.49314 8.78396 2.49256 8.77436 2.49111C 8.76116 2.48936 8.74406 2.48616 8.72816 2.48354C 8.71526 2.48151 8.70386 2.47976 8.68946 2.47685C 8.67266 2.47336 8.65256 2.46842 8.63396 2.46405C 8.61716 2.45998 8.60156 2.45678 8.58326 2.45183C 8.56316 2.4466 8.54066 2.43874 8.51936 2.43234C 8.49926 2.42623 8.48006 2.42071 8.45846 2.41314C 8.43656 2.40558 8.41256 2.39511 8.38916 2.38609C 8.36576 2.37678 8.34296 2.36863 8.31866 2.35787C 8.29496 2.3474 8.26976 2.33372 8.24516 2.32151C 8.21966 2.30871 8.19446 2.29736 8.16806 2.28282C 8.14286 2.26885 8.11676 2.2514 8.09096 2.23569C 8.06396 2.21911 8.03726 2.20398 8.00966 2.18507C 7.98386 2.16733 7.95747 2.1458 7.93107 2.12602C 7.90317 2.10478 7.87527 2.08558 7.84707 2.06202C 7.82097 2.0402 7.79487 2.01373 7.76877 1.98958C 7.74057 1.9634 7.71237 1.93925 7.68417 1.91045C 7.65807 1.88369 7.63257 1.85169 7.60677 1.8226C 7.57917 1.79118 7.55127 1.76209 7.52427 1.72747C 7.49877 1.69518 7.47447 1.65707 7.44957 1.62216C 7.42317 1.58493 7.39647 1.55031 7.37097 1.51016C 7.34667 1.47147 7.32387 1.42667 7.30047 1.38507C 7.27617 1.34202 7.25097 1.30187 7.22787 1.25533C 7.20357 1.20675 7.18197 1.15147 7.15917 1.09911C 7.13907 1.05257 7.11747 1.00951 7.09857 0.960057C 7.07457 0.897803 7.05387 0.827403 7.03197 0.759913C 7.01697 0.713076 7.00017 0.670604 6.98607 0.621441C 6.95187 0.501005 6.92127 0.373005 6.89457 0.23686C 6.87747 0.149297 6.81957 0.0739516 6.73827 0.0329336C 6.65667 -0.00837532 6.55978 -0.0107025 6.47578 0.0265337L 5.46688 0.471041C 5.46658 0.471041 5.46658 0.471332 5.46628 0.471332L 3.1758 1.48078C 3.1221 1.50435 3.0768 1.54304 3.0456 1.59133L 0.0456211 6.24586C -0.0368783 6.37385 -0.00477849 6.54229 0.120021 6.63276L 2.52 8.37821C 2.6463 8.47043 2.8254 8.45123 2.9274 8.33487L 4.19999 6.89545L 4.19999 15.7091C 4.19999 15.87 4.33409 16 4.49999 16L 13.4999 16C 13.6658 16 13.7999 15.87 13.7999 15.7091L 13.7999 7.01676L 14.756 8.3145C 14.8499 8.44192 15.032 8.4745 15.1664 8.38752L 17.8664 6.64207C 18.0014 6.5548 18.0404 6.37938 17.9543 6.24586ZM 11.6123 0.704058L 11.9405 0.84864L 12.1682 0.949003L 12.7757 2.61794L 10.4024 2.61794C 10.8677 2.28252 11.3462 1.70333 11.6123 0.704058ZM 5.83138 0.949294L 6.38758 0.704058C 6.42388 0.840203 6.46468 0.967039 6.50818 1.08806C 6.52288 1.12878 6.53908 1.16573 6.55468 1.20471C 6.58528 1.28209 6.61617 1.35802 6.64917 1.429C 6.66897 1.47118 6.68937 1.51075 6.71007 1.5506C 6.74157 1.61227 6.77397 1.67249 6.80727 1.72922C 6.82977 1.76762 6.85257 1.80485 6.87597 1.84122C 6.90987 1.89387 6.94437 1.9442 6.97977 1.99249C 7.00377 2.02565 7.02777 2.05882 7.05237 2.08994C 7.08957 2.13678 7.12737 2.18013 7.16517 2.2226C 7.18887 2.24907 7.21197 2.27671 7.23567 2.30172C 7.28097 2.34885 7.32687 2.39132 7.37277 2.43292C 7.39377 2.45183 7.41417 2.47191 7.43517 2.48965C 7.48947 2.53591 7.54407 2.57896 7.59867 2.61823L 5.22388 2.61823L 5.83138 0.949294ZM 13.1999 15.4182L 4.79999 15.4182L 4.79999 14.5455L 13.1999 14.5455L 13.1999 15.4182ZM 13.1999 13.9636L 4.79999 13.9636L 4.79999 13.6727L 13.1999 13.6727L 13.1999 13.9636ZM 15.0752 7.74723L 13.7438 5.94011C 13.6682 5.83713 13.5326 5.79378 13.4081 5.83218C 13.2842 5.87087 13.1999 5.98287 13.1999 6.10913L 13.1999 13.0909L 4.79999 13.0909L 4.79999 6.10913C 4.79999 5.98724 4.72169 5.87844 4.60409 5.83626C 4.48589 5.79378 4.35389 5.82724 4.27259 5.91975L 2.655 7.74927L 0.700217 6.3276L 3.5064 1.97387L 5.07329 1.28326L 4.51679 2.81227C 4.48469 2.90158 4.49849 3.0002 4.55489 3.07699C 4.61129 3.15438 4.70279 3.20005 4.79999 3.20005L 8.99996 3.20005L 13.1999 3.20005C 13.2971 3.20005 13.3886 3.15438 13.4447 3.07699C 13.5011 2.9999 13.5149 2.90129 13.4828 2.81227L 12.9263 1.28326L 14.4932 1.97387L 17.291 6.3148L 15.0752 7.74723Z"></path><path id="44438887-890f-424c-88e1-324366c0b033" d="M 4.19997 1.59999C 4.19997 0.717961 3.45958 0 2.54998 0L 1.64999 0C 0.740395 0 0 0.717961 0 1.59999C 0 2.14108 0.279298 2.61934 0.704395 2.90908C 0.278998 3.19882 0 3.67708 0 4.21817C 0 5.1002 0.740395 5.81816 1.64999 5.81816L 2.54998 5.81816C 3.45958 5.81816 4.19997 5.1002 4.19997 4.21817C 4.19997 3.67708 3.92067 3.19882 3.49558 2.90908C 3.92067 2.61934 4.19997 2.14108 4.19997 1.59999ZM 3.59997 4.21817C 3.59997 4.77962 3.12898 5.23634 2.54998 5.23634L 1.64999 5.23634C 1.07099 5.23634 0.599996 4.77962 0.599996 4.21817C 0.599996 3.65671 1.07099 3.19999 1.64999 3.19999L 2.54998 3.19999C 3.12898 3.19999 3.59997 3.65671 3.59997 4.21817ZM 2.54998 2.61817L 1.64999 2.61817C 1.07099 2.61817 0.599996 2.16145 0.599996 1.59999C 0.599996 1.03854 1.07099 0.581816 1.64999 0.581816L 2.54998 0.581816C 3.12898 0.581816 3.59997 1.03854 3.59997 1.59999C 3.59997 2.16145 3.12898 2.61817 2.54998 2.61817Z"></path></defs></svg> 顏色 </label> <control-holder> <component-color-control color__to=":color"></component-color-control> </control-holder> </team-shirt-color> <component-separator></component-separator> <match-fee> <label> <svg width="14" height="16" viewbox="0 0 8 16" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:figma="http://www.figma.com/figma/ns"><title>$</title><desc>Created using Figma</desc><g id="Canvas" transform="translate(1155 179)" figma:type="canvas"><g id="$" style="mix-blend-mode:normal;" figma:type="text"><use xlink:href="#55dbad54-3561-454e-9acb-ce7a9745b561" transform="translate(-1155.15 -179)" fill="#B7950B" style="mix-blend-mode:normal;"></use></g></g><defs><path id="55dbad54-3561-454e-9acb-ce7a9745b561" d="M 6.36719 11.2773C 6.36719 10.8086 6.20052 10.4102 5.86719 10.082C 5.53906 9.7487 4.99219 9.45182 4.22656 9.19141C 3.17448 8.8737 2.38021 8.44922 1.84375 7.91797C 1.30729 7.38672 1.03906 6.67839 1.03906 5.79297C 1.03906 4.93359 1.28646 4.23307 1.78125 3.69141C 2.27604 3.14974 2.95573 2.82422 3.82031 2.71484L 3.82031 0.988281L 5.05469 0.988281L 5.05469 2.72266C 5.92448 2.84766 6.59896 3.22266 7.07812 3.84766C 7.5625 4.46745 7.80469 5.30078 7.80469 6.34766L 6.27344 6.34766C 6.27344 5.63932 6.10938 5.06641 5.78125 4.62891C 5.45833 4.19141 5.00521 3.97266 4.42188 3.97266C 3.80729 3.97266 3.34635 4.13411 3.03906 4.45703C 2.73177 4.77474 2.57812 5.21224 2.57812 5.76953C 2.57812 6.27474 2.73698 6.68359 3.05469 6.99609C 3.3724 7.30859 3.94271 7.60547 4.76562 7.88672C 5.82812 8.23047 6.61719 8.66016 7.13281 9.17578C 7.64844 9.6862 7.90625 10.3815 7.90625 11.2617C 7.90625 12.1576 7.63802 12.8711 7.10156 13.4023C 6.5651 13.9336 5.82812 14.2487 4.89062 14.3477L 4.89062 15.8398L 3.67188 15.8398L 3.67188 14.3477C 2.77604 14.2539 2.04167 13.9284 1.46875 13.3711C 0.895833 12.8086 0.619792 11.9857 0.640625 10.9023L 0.65625 10.8633L 2.14062 10.8633C 2.14062 11.6654 2.34115 12.2383 2.74219 12.582C 3.14844 12.9206 3.64583 13.0898 4.23438 13.0898C 4.90625 13.0898 5.42969 12.931 5.80469 12.6133C 6.17969 12.2904 6.36719 11.8451 6.36719 11.2773Z"></path></defs></svg> 費用 <small>每隊</small> </label> <control-holder> <component-input-control change__to=":fee" placeholder="免費或輸入" type="number"></component-input-control> </match-fee> <component-separator></component-separator> </info-holder> </info-area> <a href="#match/preview/open" disabled="{! me (\'can-open\')}" ref="open-button">確定</a> </open-match> <rest></rest> </component-main-content> <component-tabs tab="matches"></component-tabs>', '', '', function(opts) {
(function (self, args, my, me) {

		self .establish (':load', function (reqs) {
			return 	reqs .thru (tap, function () {
						if (my (':api') .login)
							window .location .hash = '#login'
					})
		})

		self
			.remembers (':date')
			.remembers (':time')
			.remembers (':duration')
			.remembers (':color')
			.remembers (':location')
			.remembers (':fee')
			.remembers (':number-of-players')
			.remembers (':pitch-type')

			.establish ('time-duration', dependent (function () {
				if ( (my (':time') && my (':duration')) )
					return my (':time') + ' ' + my (':duration') + ' ' + '分鐘'
			}, mergeAll ([self .findings (':time'), self .findings (':duration')])))

			.establish ('can-open', dependent (function () {
				if (! me (':date'))
					return false;
				if (! me (':time'))
					return false;
				if (! me (':duration'))
					return false;
				if (! me (':color'))
					return false;
				if (! me (':location'))
					return false;
				if (! me (':number-of-players'))
					return false;
				if (! me (':pitch-type'))
					return false;

				return true;
			}, mergeAll
				([self .findings (':date'), self .findings (':time'), self .findings (':duration'), self .findings (':color'), self .findings (':location'), self .findings (':number-of-players'), self .findings (':pitch-type')])
			))
			.findings ('can-open')
				.thru (trans, R .dropRepeats)
				.thru (tap, self .render)

		self .establish ('open-button', ref)
			.findings ('open-button') .thru (tap, function (ref) {
				ref .addEventListener ('click', function (e) {
					e .preventDefault ();
					window .location .hash = ref .hash + '/#' + [ my (':date'), my (':time'), my (':duration'), my (':color'), my (':location'), my (':fee'), my (':number-of-players'), my (':pitch-type') ] .map (stringify) .join ('/')
				})
			})

}) (this, opts, this .my, this .me);
});
riot.tag2('page-match-preview-find', '<nav> <nav-buttons> <a href="#matches/find"> <component-back-button></component-back-button> </a> </nav-buttons> <nav-title> <component-page-title page="球賽預覽"></component-page-title> </nav-title> </nav> <component-main-content> <match-preview> <info-area info="match"> <info-holder> <info-header> 賽事資料 </info-header> <component-separator></component-separator> <match-date> <label> <svg width="16" height="15" viewbox="0 0 16 15" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:figma="http://www.figma.com/figma/ns"><title>Group</title><desc>Created using Figma</desc><g id="Canvas" transform="translate(1157 296)" figma:type="canvas"><g id="Group" style="mix-blend-mode:normal;" figma:type="frame"><g id="Vector" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#84ad6479-2db8-4c8a-a2bf-a12046b20303" transform="translate(-1156.52 -296)" fill="#1A5276" style="mix-blend-mode:normal;"></use></g><g id="Vector" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#96694655-9fe0-4957-9fa4-3de07b67134f" transform="translate(-1154.11 -290.25)" fill="#1A5276" style="mix-blend-mode:normal;"></use></g></g></g><defs><path id="84ad6479-2db8-4c8a-a2bf-a12046b20303" d="M 14.7321 1L 12.8571 1L 12.8571 0.25C 12.8571 0.11175 12.7374 0 12.5893 0L 10.7143 0C 10.5662 0 10.4464 0.11175 10.4464 0.25L 10.4464 1L 4.55357 1L 4.55357 0.25C 4.55357 0.11175 4.43384 0 4.28571 0L 2.41071 0C 2.26259 0 2.14286 0.11175 2.14286 0.25L 2.14286 1L 0.267857 1C 0.119732 1 0 1.11175 0 1.25L 0 4L 0 14.75C 0 14.8883 0.119732 15 0.267857 15L 14.7321 15C 14.8803 15 15 14.8883 15 14.75L 15 4L 15 1.25C 15 1.11175 14.8803 1 14.7321 1ZM 10.9821 0.5L 12.3214 0.5L 12.3214 1.25L 12.3214 2L 10.9821 2L 10.9821 1.25L 10.9821 0.5ZM 2.67857 0.5L 4.01786 0.5L 4.01786 1.25L 4.01786 2L 2.67857 2L 2.67857 1.25L 2.67857 0.5ZM 0.535714 1.5L 2.14286 1.5L 2.14286 2.25C 2.14286 2.38825 2.26259 2.5 2.41071 2.5L 4.28571 2.5C 4.43384 2.5 4.55357 2.38825 4.55357 2.25L 4.55357 1.5L 10.4464 1.5L 10.4464 2.25C 10.4464 2.38825 10.5662 2.5 10.7143 2.5L 12.5893 2.5C 12.7374 2.5 12.8571 2.38825 12.8571 2.25L 12.8571 1.5L 14.4643 1.5L 14.4643 3.75L 0.535714 3.75L 0.535714 1.5ZM 0.535714 14.5L 0.535714 4.25L 14.4643 4.25L 14.4643 14.5L 0.535714 14.5Z"></path><path id="96694655-9fe0-4957-9fa4-3de07b67134f" d="M 7.23214 0L 5.35714 0L 4.82143 0L 2.94643 0L 2.41071 0L 0 0L 0 2.25L 0 2.75L 0 4.5L 0 5L 0 7.25L 2.41071 7.25L 2.94643 7.25L 4.82143 7.25L 5.35714 7.25L 7.23214 7.25L 7.76786 7.25L 10.1786 7.25L 10.1786 5L 10.1786 4.5L 10.1786 2.75L 10.1786 2.25L 10.1786 0L 7.76786 0L 7.23214 0ZM 5.35714 0.5L 7.23214 0.5L 7.23214 2.25L 5.35714 2.25L 5.35714 0.5ZM 7.23214 4.5L 5.35714 4.5L 5.35714 2.75L 7.23214 2.75L 7.23214 4.5ZM 2.94643 2.75L 4.82143 2.75L 4.82143 4.5L 2.94643 4.5L 2.94643 2.75ZM 2.94643 0.5L 4.82143 0.5L 4.82143 2.25L 2.94643 2.25L 2.94643 0.5ZM 0.535714 0.5L 2.41071 0.5L 2.41071 2.25L 0.535714 2.25L 0.535714 0.5ZM 0.535714 2.75L 2.41071 2.75L 2.41071 4.5L 0.535714 4.5L 0.535714 2.75ZM 2.41071 6.75L 0.535714 6.75L 0.535714 5L 2.41071 5L 2.41071 6.75ZM 4.82143 6.75L 2.94643 6.75L 2.94643 5L 4.82143 5L 4.82143 6.75ZM 7.23214 6.75L 5.35714 6.75L 5.35714 5L 7.23214 5L 7.23214 6.75ZM 9.64286 6.75L 7.76786 6.75L 7.76786 5L 9.64286 5L 9.64286 6.75ZM 9.64286 4.5L 7.76786 4.5L 7.76786 2.75L 9.64286 2.75L 9.64286 4.5ZM 9.64286 0.5L 9.64286 2.25L 7.76786 2.25L 7.76786 0.5L 9.64286 0.5Z"></path></defs></svg> 日期 </label> <data-holder> <span data>{my (\'date\')}</span> </data-holder> </match-date> <component-separator></component-separator> <match-time> <label> <svg width="15" height="15" viewbox="0 0 15 15" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:figma="http://www.figma.com/figma/ns"><title>Group</title><desc>Created using Figma</desc><g id="Canvas" transform="translate(1157 267)" figma:type="canvas"><g id="Group" style="mix-blend-mode:normal;" figma:type="frame"><g id="Vector" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#e182a5c5-d7f4-48a7-a83e-7f5e09a4b64c" transform="translate(-1157 -267)" fill="#8E44AD" style="mix-blend-mode:normal;"></use></g><g id="Vector" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#2f493b0a-c7a8-4323-ae6f-91c03ef1cc52" transform="translate(-1153.88 -265.56)" fill="#8E44AD" style="mix-blend-mode:normal;"></use></g></g></g><defs><path id="e182a5c5-d7f4-48a7-a83e-7f5e09a4b64c" d="M 7.2 0C 3.22992 0 0 3.22992 0 7.2C 0 11.1701 3.22992 14.4 7.2 14.4C 11.1701 14.4 14.4 11.1701 14.4 7.2C 14.4 3.22992 11.1701 0 7.2 0ZM 7.2 13.92C 3.49464 13.92 0.48 10.9054 0.48 7.2C 0.48 3.49464 3.49464 0.48 7.2 0.48C 10.9054 0.48 13.92 3.49464 13.92 7.2C 13.92 10.9054 10.9054 13.92 7.2 13.92Z"></path><path id="2f493b0a-c7a8-4323-ae6f-91c03ef1cc52" d="M 4.08 0C 3.94752 0 3.84 0.10728 3.84 0.24L 3.84 5.76L 0.24 5.76C 0.10752 5.76 0 5.86728 0 6C 0 6.13272 0.10752 6.24 0.24 6.24L 4.08 6.24C 4.21248 6.24 4.32 6.13272 4.32 6L 4.32 0.24C 4.32 0.10728 4.21248 0 4.08 0Z"></path></defs></svg> 時間 </label> <data-holder> <span data>{my (\'times\')}</span> </data-holder> </match-time> <component-separator></component-separator> <match-location> <label> <svg width="14" height="19" viewbox="0 0 14 19" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:figma="http://www.figma.com/figma/ns"><title>placeholder</title><desc>Created using Figma</desc><g id="Canvas" transform="translate(1156 240)" figma:type="canvas"><g id="placeholder" style="mix-blend-mode:normal;" figma:type="frame"><g id="Vector" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#63932ca2-69f6-4206-8065-36e54db2dad2" transform="translate(-1155.88 -240)" fill="#EE3840" style="mix-blend-mode:normal;"></use></g></g></g><defs><path id="63932ca2-69f6-4206-8065-36e54db2dad2" d="M 11.238 1.94151C 8.66733 -0.647169 4.49916 -0.647169 1.92814 1.94151C -0.388274 4.27416 -0.649034 8.6663 1.31681 11.3057L 6.58307 18.9645L 11.8493 11.3057C 13.8152 8.6663 13.5544 4.27416 11.238 1.94151ZM 6.64717 8.75274C 5.44695 8.75274 4.47417 7.77314 4.47417 6.56451C 4.47417 5.35588 5.44695 4.37628 6.64717 4.37628C 7.84739 4.37628 8.82017 5.35588 8.82017 6.56451C 8.82017 7.77314 7.84739 8.75274 6.64717 8.75274Z"></path></defs></svg> 地點 </label> <data-holder> <span data>{my (\'location\')}</span> </data-holder> </match-location> <component-separator></component-separator> <match-type> <label> <svg width="14" height="18" viewbox="0 0 14 18" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:figma="http://www.figma.com/figma/ns"><title>soccer-field</title><desc>Created using Figma</desc><g id="Canvas" transform="translate(1157 208)" figma:type="canvas"><g id="soccer-field" style="mix-blend-mode:normal;" figma:type="frame"><g id="Soccer-field 1" style="mix-blend-mode:normal;" figma:type="frame"><g id="Soccer-field" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#62b9d1df-7938-4819-a4b7-65740c8bf388" transform="translate(-1156.76 -208)" fill="#1D8348" style="mix-blend-mode:normal;"></use></g></g></g></g><defs><path id="62b9d1df-7938-4819-a4b7-65740c8bf388" d="M 13.16 0L 0.28 0C 0.12544 0 0 0.12096 0 0.27L 0 17.01C 0 17.159 0.12544 17.28 0.28 17.28L 13.16 17.28C 13.3148 17.28 13.44 17.159 13.44 17.01L 13.44 0.27C 13.44 0.12096 13.3148 0 13.16 0ZM 7.42 2.67759C 7.42 3.02481 7.10612 3.3075 6.72 3.3075C 6.33388 3.3075 6.02 3.02508 6.02 2.67759C 6.02 2.61657 6.0298 2.55582 6.04912 2.4975L 7.3906 2.4975C 7.4102 2.55582 7.42 2.61657 7.42 2.67759ZM 4.88292 1.8981L 4.88292 0.5481L 8.55708 0.5481L 8.55708 1.8981L 4.88292 1.8981ZM 4.32292 0.54L 4.32292 2.1681C 4.32292 2.31714 4.44808 2.4381 4.60292 2.4381L 5.4894 2.4381C 5.47176 2.51694 5.46 2.59686 5.46 2.67759C 5.46 3.32262 6.02504 3.8475 6.72 3.8475C 7.41468 3.8475 7.98 3.32289 7.98 2.67759C 7.98 2.59659 7.96824 2.51667 7.9506 2.4381L 8.83736 2.4381C 8.9922 2.4381 9.11736 2.31714 9.11736 2.1681L 9.11736 0.54L 12.88 0.54L 12.88 8.16588L 9.50572 8.16588C 9.36488 6.80346 8.16928 5.73588 6.72 5.73588C 5.27072 5.73588 4.07512 6.80346 3.93428 8.16588L 0.56 8.16588L 0.56 0.54L 4.32292 0.54ZM 4.49932 8.16588C 4.63792 7.10208 5.57984 6.27588 6.72 6.27588C 7.86016 6.27588 8.80208 7.10208 8.94068 8.16588L 4.49932 8.16588ZM 8.94068 8.70588C 8.80208 9.76968 7.86016 10.5959 6.72 10.5959C 5.57984 10.5959 4.63792 9.76968 4.49932 8.70588L 8.94068 8.70588ZM 6.02 14.5349C 6.02 14.1877 6.33388 13.905 6.72 13.905C 7.10612 13.905 7.42 14.1874 7.42 14.5349C 7.42 14.5959 7.4102 14.6567 7.39088 14.715L 6.0494 14.715C 6.0298 14.6567 6.02 14.5959 6.02 14.5349ZM 8.55736 15.3144L 8.55736 16.6644L 4.88292 16.6644L 4.88292 15.3144L 8.55736 15.3144ZM 9.11736 16.74L 9.11736 15.0444C 9.11736 14.8954 8.9922 14.7744 8.83736 14.7744L 7.9506 14.7744C 7.96824 14.6956 7.98 14.6159 7.98 14.5349C 7.98 13.8899 7.41468 13.365 6.72 13.365C 6.02504 13.365 5.46 13.8896 5.46 14.5349C 5.46 14.6159 5.47176 14.6958 5.4894 14.7744L 4.60292 14.7744C 4.44808 14.7744 4.32292 14.8954 4.32292 15.0444L 4.32292 16.74L 0.56 16.74L 0.56 8.70588L 3.93428 8.70588C 4.07512 10.0683 5.27072 11.1359 6.72 11.1359C 8.16928 11.1359 9.36488 10.0683 9.50572 8.70588L 12.88 8.70588L 12.88 16.74L 9.11736 16.74Z"></path></defs></svg> 場地 </label> <data-holder> <span data>{my (\'match-type\')}</span> </data-holder> </match-type> <component-separator></component-separator> <match-fee> <label> <svg width="14" height="16" viewbox="0 0 8 16" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:figma="http://www.figma.com/figma/ns"><title>$</title><desc>Created using Figma</desc><g id="Canvas" transform="translate(1155 179)" figma:type="canvas"><g id="$" style="mix-blend-mode:normal;" figma:type="text"><use xlink:href="#55dbad54-3561-454e-9acb-ce7a9745b561" transform="translate(-1155.15 -179)" fill="#B7950B" style="mix-blend-mode:normal;"></use></g></g><defs><path id="55dbad54-3561-454e-9acb-ce7a9745b561" d="M 6.36719 11.2773C 6.36719 10.8086 6.20052 10.4102 5.86719 10.082C 5.53906 9.7487 4.99219 9.45182 4.22656 9.19141C 3.17448 8.8737 2.38021 8.44922 1.84375 7.91797C 1.30729 7.38672 1.03906 6.67839 1.03906 5.79297C 1.03906 4.93359 1.28646 4.23307 1.78125 3.69141C 2.27604 3.14974 2.95573 2.82422 3.82031 2.71484L 3.82031 0.988281L 5.05469 0.988281L 5.05469 2.72266C 5.92448 2.84766 6.59896 3.22266 7.07812 3.84766C 7.5625 4.46745 7.80469 5.30078 7.80469 6.34766L 6.27344 6.34766C 6.27344 5.63932 6.10938 5.06641 5.78125 4.62891C 5.45833 4.19141 5.00521 3.97266 4.42188 3.97266C 3.80729 3.97266 3.34635 4.13411 3.03906 4.45703C 2.73177 4.77474 2.57812 5.21224 2.57812 5.76953C 2.57812 6.27474 2.73698 6.68359 3.05469 6.99609C 3.3724 7.30859 3.94271 7.60547 4.76562 7.88672C 5.82812 8.23047 6.61719 8.66016 7.13281 9.17578C 7.64844 9.6862 7.90625 10.3815 7.90625 11.2617C 7.90625 12.1576 7.63802 12.8711 7.10156 13.4023C 6.5651 13.9336 5.82812 14.2487 4.89062 14.3477L 4.89062 15.8398L 3.67188 15.8398L 3.67188 14.3477C 2.77604 14.2539 2.04167 13.9284 1.46875 13.3711C 0.895833 12.8086 0.619792 11.9857 0.640625 10.9023L 0.65625 10.8633L 2.14062 10.8633C 2.14062 11.6654 2.34115 12.2383 2.74219 12.582C 3.14844 12.9206 3.64583 13.0898 4.23438 13.0898C 4.90625 13.0898 5.42969 12.931 5.80469 12.6133C 6.17969 12.2904 6.36719 11.8451 6.36719 11.2773Z"></path></defs></svg> 費用 <small>每隊</small> </label> <data-holder> <span data>{my (\'fee\')}</span> </data-holder> </match-fee> <component-separator></component-separator> <match-tags> <tags> <tag>聯賽</tag> <tag>競爭性</tag> </tags> </match-tags> <component-separator></component-separator> </info-holder> </info-area> <info-area info="opponent-team"> <info-holder> <info-header> 對手資料 </info-header> <component-separator></component-separator> <team-stats> <label> {my (\'team-name\')} <team-approval><icon-holder> <svg width="15" height="14" viewbox="0 0 15 14" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:figma="http://www.figma.com/figma/ns"><title>Vector</title><desc>Created using Figma</desc><g id="Canvas" transform="translate(990 107)" figma:type="canvas"><g id="Vector" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#62b21ff8-9ef6-47dc-b2a2-6ec5f87777a0" transform="translate(-990 -107)" fill="#2980B9" style="mix-blend-mode:normal;"></use></g></g><defs><path id="62b21ff8-9ef6-47dc-b2a2-6ec5f87777a0" d="M 14.5498 9.51777C 14.8661 9.15182 15.0177 8.75951 14.9984 8.3555C 14.979 7.9105 14.7596 7.56211 14.5789 7.34839C 14.7886 6.87411 14.8693 6.12756 14.1691 5.54789C 13.656 5.12338 12.7847 4.93308 11.5779 4.98578C 10.7292 5.02091 10.0193 5.16437 9.9903 5.17022L 9.98707 5.17022C 9.82573 5.19657 9.65471 5.22877 9.48046 5.26391C 9.46755 5.07654 9.50305 4.61104 9.88381 3.56294C 10.3356 2.31577 10.3098 1.36136 9.79992 0.723128C 9.26426 0.0526976 8.40915 0 8.15745 0C 7.91544 0 7.69279 0.090757 7.53467 0.257633C 7.17649 0.635299 7.21844 1.33208 7.26362 1.65412C 6.83767 2.69051 5.64374 5.2317 4.63374 5.93726C 4.61438 5.94898 4.59825 5.96361 4.58211 5.97825C 4.28524 6.26223 4.08518 6.56964 3.94965 6.83898C 3.75927 6.7453 3.54307 6.6926 3.31074 6.6926L 1.34237 6.6926C 0.600192 6.6926 0 7.24007 0 7.9105L 0 12.6679C 0 13.3413 0.603419 13.8858 1.34237 13.8858L 3.31074 13.8858C 3.59793 13.8858 3.86575 13.8038 4.08518 13.6633L 4.84349 13.7453C 4.95965 13.7599 7.02483 13.9971 9.14487 13.959C 9.52886 13.9854 9.89027 14 10.2259 14C 10.8035 14 11.3069 13.959 11.7263 13.877C 12.7138 13.6867 13.3882 13.3061 13.7302 12.747C 13.9916 12.3195 13.9916 11.895 13.9496 11.6257C 14.5918 11.0987 14.7047 10.5161 14.6821 10.1062C 14.6692 9.86909 14.6111 9.66708 14.5498 9.51777ZM 1.34237 13.0954C 1.08099 13.0954 0.871247 12.9021 0.871247 12.6679L 0.871247 7.90757C 0.871247 7.67043 1.08422 7.48013 1.34237 7.48013L 3.31074 7.48013C 3.57211 7.48013 3.78186 7.67336 3.78186 7.90757L 3.78186 12.665C 3.78186 12.9021 3.56889 13.0924 3.31074 13.0924L 1.34237 13.0924L 1.34237 13.0954ZM 13.7238 9.17524C 13.5882 9.30406 13.5624 9.50021 13.6657 9.65245C 13.6657 9.65537 13.798 9.86031 13.8141 10.1414C 13.8367 10.5249 13.6334 10.8645 13.2075 11.1543C 13.0558 11.2597 12.9945 11.4412 13.059 11.6052C 13.059 11.6081 13.1978 11.9946 12.9719 12.3605C 12.7557 12.7118 12.2749 12.9636 11.5456 13.1041C 10.9616 13.2183 10.1678 13.2388 9.19327 13.1685C 9.18036 13.1685 9.16423 13.1685 9.14809 13.1685C 7.07323 13.2095 4.97579 12.9636 4.9532 12.9607L 4.94997 12.9607L 4.62406 12.9256C 4.64342 12.8436 4.6531 12.7558 4.6531 12.6679L 4.6531 7.90757C 4.6531 7.78168 4.63052 7.65872 4.59179 7.54454C 4.64988 7.34839 4.81122 6.91217 5.19199 6.54036C 6.64084 5.49812 8.05742 1.98202 8.11873 1.82978C 8.14455 1.7683 8.151 1.70096 8.13809 1.63363C 8.08324 1.30573 8.1026 0.904642 8.18004 0.784609C 8.35106 0.787537 8.8125 0.831451 9.09001 1.17984C 9.41915 1.59264 9.40624 2.33041 9.05129 3.30824C 8.50918 4.79841 8.464 5.58302 8.89317 5.92848C 9.10614 6.10121 9.39011 6.11 9.59662 6.04266C 9.79346 6.00167 9.98062 5.96654 10.1581 5.94019C 10.171 5.93726 10.1871 5.93434 10.2 5.93141C 11.1907 5.73526 12.9654 5.61522 13.5818 6.12463C 14.1045 6.55793 13.7334 7.13174 13.6915 7.19322C 13.5721 7.35717 13.6076 7.57089 13.7689 7.70263C 13.7722 7.70556 14.111 7.9954 14.1271 8.38478C 14.14 8.64534 14.0045 8.91175 13.7238 9.17524Z"></path></defs></svg> </icon-holder >{my (\'approve-number\')}/{my (\'opponent-number\')} </team-approval> </label> <data-holder> <image-holder size="64x64" data> <team-ranking> <league-table> <svg width="98" height="93" viewbox="0 0 98 93" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:figma="http://www.figma.com/figma/ns"><title>Vector</title><desc>Created using Figma</desc><g id="Canvas" transform="translate(870 331)" figma:type="canvas"><g id="Vector" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#c9194e77-48d8-47f9-b662-8cd5aa87544f" transform="translate(-869.5 -330.628)" fill="#5DADE2" fill-opacity="0.7" style="mix-blend-mode:normal;"></use></g></g><defs><path id="c9194e77-48d8-47f9-b662-8cd5aa87544f" d="M 48.473 -2.09808e-08L 0 35.219L 18.515 92.203L 78.432 92.203L 96.947 35.219L 48.473 -2.09808e-08ZM 49.023 4.27L 92.48 35.842L 81.398 38.33C 81.046 37.48 80.21 36.879 79.232 36.879C 79.029 36.879 78.836 36.914 78.648 36.961L 50.749 13.456C 50.791 13.28 50.819 13.099 50.819 12.911C 50.819 11.806 50.052 10.886 49.023 10.638L 49.023 4.27ZM 64.893 75.351L 27.719 80.134C 27.64 79.972 27.542 79.822 27.429 79.683L 33.662 70.091C 33.897 70.169 34.145 70.222 34.407 70.222C 35.703 70.222 36.754 69.171 36.754 67.876C 36.754 67.874 36.754 67.872 36.754 67.872L 56.357 63.022C 56.765 63.712 57.509 64.182 58.37 64.182C 58.708 64.182 59.027 64.108 59.316 63.979L 65.583 73.62C 65.154 74.046 64.889 74.634 64.889 75.284C 64.887 75.308 64.893 75.331 64.893 75.351ZM 34.354 42.445C 34.305 42.213 34.214 41.998 34.103 41.797L 46.96 32.457C 47.235 32.689 47.56 32.863 47.922 32.951L 47.922 45.482L 34.354 42.445ZM 47.645 46.548L 35.212 65.681C 35.073 65.63 34.929 65.593 34.779 65.568L 32.852 45.13C 33.56 44.874 34.104 44.292 34.31 43.562L 47.645 46.548ZM 46.127 30.676C 46.127 30.994 46.191 31.295 46.306 31.571L 33.359 40.979C 32.987 40.731 32.541 40.584 32.061 40.584C 31.3 40.584 30.63 40.951 30.202 41.514L 19.477 39.114C 19.452 39.005 19.418 38.899 19.378 38.798L 47.545 15.066C 47.666 15.117 47.793 15.154 47.922 15.187L 47.922 28.404C 46.894 28.65 46.127 29.57 46.127 30.676ZM 19.452 40.236L 29.752 42.543C 29.731 42.67 29.713 42.797 29.713 42.93C 29.713 44.121 30.605 45.096 31.755 45.246L 33.679 65.656C 32.741 65.963 32.058 66.836 32.058 67.877C 32.058 68.513 32.313 69.086 32.723 69.509L 26.551 79.006C 26.428 78.953 26.298 78.912 26.165 78.881L 18.693 41.428C 19.059 41.122 19.327 40.709 19.452 40.236ZM 57.768 59.577L 49.368 46.65L 62.67 43.665C 62.833 44.159 63.148 44.587 63.571 44.874L 58.807 59.536C 58.664 59.51 58.518 59.491 58.369 59.491C 58.158 59.491 57.96 59.525 57.768 59.577ZM 60.188 63.3C 60.512 62.898 60.713 62.392 60.713 61.835C 60.713 61.087 60.358 60.429 59.813 59.999L 64.606 45.249C 64.699 45.261 64.791 45.276 64.887 45.276C 66.182 45.276 67.233 44.225 67.233 42.93C 67.233 42.832 67.215 42.739 67.204 42.643L 77.21 40.398C 77.406 40.736 77.68 41.017 78.014 41.222L 67.692 72.986C 67.543 72.958 67.39 72.939 67.232 72.939C 66.985 72.939 66.752 72.989 66.528 73.058L 60.188 63.3ZM 49.023 15.186C 49.154 15.153 49.281 15.116 49.402 15.065L 77.054 38.362C 76.948 38.63 76.884 38.921 76.884 39.227C 76.884 39.266 76.894 39.303 76.896 39.34L 66.818 41.604C 66.396 40.991 65.687 40.586 64.886 40.586C 64.406 40.586 63.959 40.731 63.587 40.979L 50.64 31.571C 50.753 31.296 50.819 30.995 50.819 30.676C 50.819 29.571 50.052 28.651 49.023 28.403L 49.023 15.186ZM 49.023 32.952C 49.386 32.864 49.711 32.69 49.986 32.458L 62.843 41.8C 62.714 42.032 62.621 42.284 62.576 42.558L 49.022 45.601L 49.022 32.952L 49.023 32.952ZM 56.797 60.105C 56.323 60.536 56.022 61.148 56.022 61.835C 56.022 61.88 56.033 61.923 56.035 61.966L 36.483 66.804C 36.387 66.618 36.27 66.448 36.129 66.292L 48.473 47.298L 56.797 60.105ZM 47.922 4.27L 47.922 10.637C 46.894 10.885 46.127 11.805 46.127 12.91C 46.127 13.098 46.155 13.279 46.197 13.455L 17.8 37.38C 17.606 37.327 17.405 37.29 17.194 37.29C 16.447 37.29 15.789 37.645 15.36 38.19L 4.562 35.773L 47.922 4.27ZM 3.78 36.729L 14.889 39.215C 14.864 39.352 14.847 39.492 14.847 39.637C 14.847 40.746 15.618 41.67 16.652 41.914L 24.122 79.355C 23.604 79.785 23.267 80.425 23.267 81.152C 23.267 81.84 23.567 82.451 24.037 82.881L 20.53 88.276L 3.78 36.729ZM 21.326 89.075L 25.006 83.411C 25.2 83.464 25.402 83.501 25.613 83.501C 26.507 83.501 27.275 82.995 27.671 82.26L 66.078 77.319C 66.42 77.514 66.81 77.635 67.232 77.635C 67.532 77.635 67.816 77.573 68.08 77.471L 75.621 89.075L 21.326 89.075ZM 76.417 88.275L 68.982 76.837C 69.349 76.421 69.578 75.885 69.578 75.286C 69.578 74.995 69.517 74.719 69.422 74.46L 80.172 41.374C 80.94 41.038 81.484 40.298 81.559 39.423L 93.135 36.823L 76.417 88.275Z"></path></defs></svg> </league-table> <rank-stars> <icon-holder><icon class="fa-star"></icon></icon-holder> <icon-holder><icon class="fa-star"></icon></icon-holder> <icon-holder><icon class="fa-star"></icon></icon-holder> <icon-holder><icon class="fa-star"></icon></icon-holder> <icon-holder><icon class="fa-star"></icon></icon-holder> </rank-stars> <rank-number>12</rank-number> </team-ranking> </image-holder> </data-holder> </team-stats> <component-separator></component-separator> <team-shirt-color> <label> <svg width="19" height="16" viewbox="0 0 19 16" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:figma="http://www.figma.com/figma/ns"><title>soccer-jersey</title><desc>Created using Figma</desc><g id="Canvas" transform="translate(1160 61)" figma:type="canvas"><g id="soccer-jersey" style="mix-blend-mode:normal;" figma:type="frame"><g id="Group" style="mix-blend-mode:normal;" figma:type="frame"><g id="Group" style="mix-blend-mode:normal;" figma:type="frame"><g id="Vector" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#7502afb2-9d1b-4ce3-b036-3ee6ec531c22" transform="translate(-1159 -61)" fill="#0E6655" style="mix-blend-mode:normal;"></use></g><g id="Vector" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#44438887-890f-424c-88e1-324366c0b033" transform="translate(-1152.1 -55.7636)" fill="#0E6655" style="mix-blend-mode:normal;"></use></g></g></g></g></g><defs><path id="7502afb2-9d1b-4ce3-b036-3ee6ec531c22" d="M 17.9543 6.24586L 14.9543 1.59133C 14.9231 1.54304 14.8778 1.50435 14.8241 1.48078L 12.5336 0.471041C 12.5333 0.471041 12.5333 0.47075 12.533 0.47075L 11.5241 0.0262427C 11.4401 -0.0109935 11.3435 -0.0083753 11.2616 0.0326427C 11.1803 0.0739517 11.1221 0.149006 11.1053 0.236569C 10.7333 2.13911 9.37255 2.44194 8.97326 2.48994C 8.96966 2.49023 8.96636 2.48849 8.96276 2.48907C 8.90216 2.49663 8.86076 2.49925 8.86106 2.49954C 8.85806 2.49954 8.85056 2.49896 8.84306 2.49838C 8.83976 2.49809 8.83766 2.49809 8.83346 2.4978C 8.82476 2.49722 8.81126 2.49547 8.79896 2.49402C 8.79086 2.49314 8.78396 2.49256 8.77436 2.49111C 8.76116 2.48936 8.74406 2.48616 8.72816 2.48354C 8.71526 2.48151 8.70386 2.47976 8.68946 2.47685C 8.67266 2.47336 8.65256 2.46842 8.63396 2.46405C 8.61716 2.45998 8.60156 2.45678 8.58326 2.45183C 8.56316 2.4466 8.54066 2.43874 8.51936 2.43234C 8.49926 2.42623 8.48006 2.42071 8.45846 2.41314C 8.43656 2.40558 8.41256 2.39511 8.38916 2.38609C 8.36576 2.37678 8.34296 2.36863 8.31866 2.35787C 8.29496 2.3474 8.26976 2.33372 8.24516 2.32151C 8.21966 2.30871 8.19446 2.29736 8.16806 2.28282C 8.14286 2.26885 8.11676 2.2514 8.09096 2.23569C 8.06396 2.21911 8.03726 2.20398 8.00966 2.18507C 7.98386 2.16733 7.95747 2.1458 7.93107 2.12602C 7.90317 2.10478 7.87527 2.08558 7.84707 2.06202C 7.82097 2.0402 7.79487 2.01373 7.76877 1.98958C 7.74057 1.9634 7.71237 1.93925 7.68417 1.91045C 7.65807 1.88369 7.63257 1.85169 7.60677 1.8226C 7.57917 1.79118 7.55127 1.76209 7.52427 1.72747C 7.49877 1.69518 7.47447 1.65707 7.44957 1.62216C 7.42317 1.58493 7.39647 1.55031 7.37097 1.51016C 7.34667 1.47147 7.32387 1.42667 7.30047 1.38507C 7.27617 1.34202 7.25097 1.30187 7.22787 1.25533C 7.20357 1.20675 7.18197 1.15147 7.15917 1.09911C 7.13907 1.05257 7.11747 1.00951 7.09857 0.960057C 7.07457 0.897803 7.05387 0.827403 7.03197 0.759913C 7.01697 0.713076 7.00017 0.670604 6.98607 0.621441C 6.95187 0.501005 6.92127 0.373005 6.89457 0.23686C 6.87747 0.149297 6.81957 0.0739516 6.73827 0.0329336C 6.65667 -0.00837532 6.55978 -0.0107025 6.47578 0.0265337L 5.46688 0.471041C 5.46658 0.471041 5.46658 0.471332 5.46628 0.471332L 3.1758 1.48078C 3.1221 1.50435 3.0768 1.54304 3.0456 1.59133L 0.0456211 6.24586C -0.0368783 6.37385 -0.00477849 6.54229 0.120021 6.63276L 2.52 8.37821C 2.6463 8.47043 2.8254 8.45123 2.9274 8.33487L 4.19999 6.89545L 4.19999 15.7091C 4.19999 15.87 4.33409 16 4.49999 16L 13.4999 16C 13.6658 16 13.7999 15.87 13.7999 15.7091L 13.7999 7.01676L 14.756 8.3145C 14.8499 8.44192 15.032 8.4745 15.1664 8.38752L 17.8664 6.64207C 18.0014 6.5548 18.0404 6.37938 17.9543 6.24586ZM 11.6123 0.704058L 11.9405 0.84864L 12.1682 0.949003L 12.7757 2.61794L 10.4024 2.61794C 10.8677 2.28252 11.3462 1.70333 11.6123 0.704058ZM 5.83138 0.949294L 6.38758 0.704058C 6.42388 0.840203 6.46468 0.967039 6.50818 1.08806C 6.52288 1.12878 6.53908 1.16573 6.55468 1.20471C 6.58528 1.28209 6.61617 1.35802 6.64917 1.429C 6.66897 1.47118 6.68937 1.51075 6.71007 1.5506C 6.74157 1.61227 6.77397 1.67249 6.80727 1.72922C 6.82977 1.76762 6.85257 1.80485 6.87597 1.84122C 6.90987 1.89387 6.94437 1.9442 6.97977 1.99249C 7.00377 2.02565 7.02777 2.05882 7.05237 2.08994C 7.08957 2.13678 7.12737 2.18013 7.16517 2.2226C 7.18887 2.24907 7.21197 2.27671 7.23567 2.30172C 7.28097 2.34885 7.32687 2.39132 7.37277 2.43292C 7.39377 2.45183 7.41417 2.47191 7.43517 2.48965C 7.48947 2.53591 7.54407 2.57896 7.59867 2.61823L 5.22388 2.61823L 5.83138 0.949294ZM 13.1999 15.4182L 4.79999 15.4182L 4.79999 14.5455L 13.1999 14.5455L 13.1999 15.4182ZM 13.1999 13.9636L 4.79999 13.9636L 4.79999 13.6727L 13.1999 13.6727L 13.1999 13.9636ZM 15.0752 7.74723L 13.7438 5.94011C 13.6682 5.83713 13.5326 5.79378 13.4081 5.83218C 13.2842 5.87087 13.1999 5.98287 13.1999 6.10913L 13.1999 13.0909L 4.79999 13.0909L 4.79999 6.10913C 4.79999 5.98724 4.72169 5.87844 4.60409 5.83626C 4.48589 5.79378 4.35389 5.82724 4.27259 5.91975L 2.655 7.74927L 0.700217 6.3276L 3.5064 1.97387L 5.07329 1.28326L 4.51679 2.81227C 4.48469 2.90158 4.49849 3.0002 4.55489 3.07699C 4.61129 3.15438 4.70279 3.20005 4.79999 3.20005L 8.99996 3.20005L 13.1999 3.20005C 13.2971 3.20005 13.3886 3.15438 13.4447 3.07699C 13.5011 2.9999 13.5149 2.90129 13.4828 2.81227L 12.9263 1.28326L 14.4932 1.97387L 17.291 6.3148L 15.0752 7.74723Z"></path><path id="44438887-890f-424c-88e1-324366c0b033" d="M 4.19997 1.59999C 4.19997 0.717961 3.45958 0 2.54998 0L 1.64999 0C 0.740395 0 0 0.717961 0 1.59999C 0 2.14108 0.279298 2.61934 0.704395 2.90908C 0.278998 3.19882 0 3.67708 0 4.21817C 0 5.1002 0.740395 5.81816 1.64999 5.81816L 2.54998 5.81816C 3.45958 5.81816 4.19997 5.1002 4.19997 4.21817C 4.19997 3.67708 3.92067 3.19882 3.49558 2.90908C 3.92067 2.61934 4.19997 2.14108 4.19997 1.59999ZM 3.59997 4.21817C 3.59997 4.77962 3.12898 5.23634 2.54998 5.23634L 1.64999 5.23634C 1.07099 5.23634 0.599996 4.77962 0.599996 4.21817C 0.599996 3.65671 1.07099 3.19999 1.64999 3.19999L 2.54998 3.19999C 3.12898 3.19999 3.59997 3.65671 3.59997 4.21817ZM 2.54998 2.61817L 1.64999 2.61817C 1.07099 2.61817 0.599996 2.16145 0.599996 1.59999C 0.599996 1.03854 1.07099 0.581816 1.64999 0.581816L 2.54998 0.581816C 3.12898 0.581816 3.59997 1.03854 3.59997 1.59999C 3.59997 2.16145 3.12898 2.61817 2.54998 2.61817Z"></path></defs></svg> 顏色 </label> <data-holder> <image-holder size="32x32" data riot-style="background: {my (\'shirt-color\')};"></image-holder> </data-holder> </team-shirt-color> <component-separator></component-separator> <team-age> <label> <svg width="14" height="19" viewbox="0 0 14 19" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:figma="http://www.figma.com/figma/ns"><title>people</title><desc>Created using Figma</desc><g id="Canvas" transform="translate(1157 32)" figma:type="canvas"><g id="people" style="mix-blend-mode:normal;" figma:type="frame"><g id="Group" style="mix-blend-mode:normal;" figma:type="frame"><g id="Group" style="mix-blend-mode:normal;" figma:type="frame"><g id="XMLID 2038" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#56178ad8-59fa-4481-ab2a-cb6ddea229be" transform="translate(-1151.18 -28.1659)" fill="#A7A9AC" style="mix-blend-mode:normal;"></use></g><g id="XMLID 2039" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#48c1c4c1-e6a8-47cf-aca6-942ef11301e0" transform="translate(-1152.48 -23.7096)" fill="#A7A9AC" style="mix-blend-mode:normal;"></use></g><g id="Vector" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#4d4b89ab-a4b0-4a8c-8a38-24289e2946ce" transform="translate(-1157 -23.2427)" style="mix-blend-mode:normal;"></use></g><g id="Vector" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#54e17de2-2417-4e01-9cf7-39f13e91a977" transform="translate(-1155.78 -27.4191)" style="mix-blend-mode:normal;"></use></g><g id="Vector" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#64733042-8ec3-4fac-b1ca-769ce78bcd18" transform="translate(-1147.51 -23.2456)" style="mix-blend-mode:normal;"></use></g><g id="Vector" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#c29ea2c3-7373-466e-b0d2-87e5940fb610" transform="translate(-1147.05 -27.4191)" style="mix-blend-mode:normal;"></use></g><g id="Vector" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#ca8b21ef-a843-4748-abd8-d25ccc471637" transform="translate(-1152.79 -24.0434)" style="mix-blend-mode:normal;"></use></g><g id="Vector" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#00ad5f2a-5da3-4c05-a667-db4226456e87" transform="translate(-1151.49 -28.5)" style="mix-blend-mode:normal;"></use></g></g></g><mask id="mask0_alpha" mask-type="alpha"><path d="M -1157 -27L -1154.35 -27L -1154.35 -24.1405L -1157 -24.1405L -1157 -27Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask0_alpha)" figma:type="frame"></g><mask id="mask1_alpha" mask-type="alpha"><path d="M -1157 -27L -1154.35 -27L -1154.35 -24.1405L -1157 -24.1405L -1157 -27Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask1_alpha)" figma:type="frame"></g><mask id="mask2_alpha" mask-type="alpha"><path d="M -1157 -27L -1154.35 -27L -1154.35 -24.1405L -1157 -24.1405L -1157 -27Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask2_alpha)" figma:type="frame"></g><mask id="mask3_alpha" mask-type="alpha"><path d="M -1157 -27L -1154.35 -27L -1154.35 -24.1405L -1157 -24.1405L -1157 -27Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask3_alpha)" figma:type="frame"></g><mask id="mask4_alpha" mask-type="alpha"><path d="M -1157 -27L -1154.35 -27L -1154.35 -24.1405L -1157 -24.1405L -1157 -27Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask4_alpha)" figma:type="frame"></g><mask id="mask5_alpha" mask-type="alpha"><path d="M -1157 -27L -1154.35 -27L -1154.35 -24.1405L -1157 -24.1405L -1157 -27Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask5_alpha)" figma:type="frame"></g><mask id="mask6_alpha" mask-type="alpha"><path d="M -1157 -27L -1154.35 -27L -1154.35 -24.1405L -1157 -24.1405L -1157 -27Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask6_alpha)" figma:type="frame"></g><mask id="mask7_alpha" mask-type="alpha"><path d="M -1157 -27L -1154.35 -27L -1154.35 -24.1405L -1157 -24.1405L -1157 -27Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask7_alpha)" figma:type="frame"></g><mask id="mask8_alpha" mask-type="alpha"><path d="M -1157 -27L -1154.35 -27L -1154.35 -24.1405L -1157 -24.1405L -1157 -27Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask8_alpha)" figma:type="frame"></g><mask id="mask9_alpha" mask-type="alpha"><path d="M -1157 -27L -1154.35 -27L -1154.35 -24.1405L -1157 -24.1405L -1157 -27Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask9_alpha)" figma:type="frame"></g><mask id="mask10_alpha" mask-type="alpha"><path d="M -1157 -27L -1154.35 -27L -1154.35 -24.1405L -1157 -24.1405L -1157 -27Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask10_alpha)" figma:type="frame"></g><mask id="mask11_alpha" mask-type="alpha"><path d="M -1157 -27L -1154.35 -27L -1154.35 -24.1405L -1157 -24.1405L -1157 -27Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask11_alpha)" figma:type="frame"></g><mask id="mask12_alpha" mask-type="alpha"><path d="M -1157 -27L -1154.35 -27L -1154.35 -24.1405L -1157 -24.1405L -1157 -27Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask12_alpha)" figma:type="frame"></g><mask id="mask13_alpha" mask-type="alpha"><path d="M -1157 -27L -1154.35 -27L -1154.35 -24.1405L -1157 -24.1405L -1157 -27Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask13_alpha)" figma:type="frame"></g><mask id="mask14_alpha" mask-type="alpha"><path d="M -1157 -27L -1154.35 -27L -1154.35 -24.1405L -1157 -24.1405L -1157 -27Z" fill="#FFFFFF"></path></mask><g id="Group" style="mix-blend-mode:normal;" mask="url(#mask14_alpha)" figma:type="frame"></g></g></g><defs><path id="56178ad8-59fa-4481-ab2a-cb6ddea229be" d="M 1.18104 3.31295C 1.18441 3.31295 1.18777 3.31295 1.18777 3.31295C 2.54714 3.29825 2.34862 1.31295 2.34862 1.31295C 2.29478 -0.0142538 1.28199 -0.00322437 1.18104 0.000452105C 1.0801 -0.00322437 0.0673067 -0.0142538 0.0101057 1.30928C 0.0101057 1.30928 -0.188415 3.29457 1.17432 3.30928C 1.17432 3.31295 1.17768 3.31295 1.18104 3.31295Z"></path><path id="48c1c4c1-e6a8-47cf-aca6-942ef11301e0" d="M 2.47974 1.32353L 3.35795 1.12197e-07C 3.35795 1.12197e-07 3.97706 0.272059 4.48178 0.680147C 4.613 0.786765 4.67357 0.849265 4.79134 0.977941C 5.07061 1.28309 4.95284 3.05147 4.79134 3.69853C 4.62983 4.34559 4.15539 5.27574 4.15539 5.27574C 4.06118 5.51103 4.00062 5.76471 3.97706 6.01838L 3.3714 12.5074C 3.35122 12.7132 3.19307 12.8713 3.00464 12.8713L 2.47974 12.8713L 1.95484 12.8713C 1.76641 12.8713 1.6049 12.7132 1.58808 12.5074L 0.98242 6.01838C 0.958866 5.76103 0.898301 5.51103 0.804087 5.27574C 0.804087 5.27574 0.329655 4.34926 0.168146 3.69853C 0.00663766 3.05147 -0.111129 1.28309 0.168146 0.977941C 0.285913 0.849265 0.346479 0.786765 0.477705 0.680147C 0.98242 0.275735 1.60154 1.12197e-07 1.60154 1.12197e-07L 2.47974 1.32353Z"></path><path id="4d4b89ab-a4b0-4a8c-8a38-24289e2946ce" d="M 0.16683 3.88974C 0.318245 4.49268 0.722016 5.30518 0.782582 5.43018C 0.856607 5.61768 0.903714 5.81254 0.920538 6.01474L 1.48918 12.103C 1.52283 12.4669 1.80211 12.7427 2.13858 12.7427L 3.12109 12.7427C 3.45757 12.7427 3.73685 12.4669 3.77049 12.103L 4.33914 6.01474C 4.35933 5.80886 4.40644 5.60665 4.48383 5.41915C 4.55112 5.25004 4.48046 5.05518 4.32905 4.98165C 4.17427 4.90812 3.99593 4.98533 3.92864 5.15077C 3.8277 5.40445 3.7604 5.67283 3.73685 5.94856L 3.1682 12.0368C 3.16484 12.0589 3.14801 12.0772 3.12782 12.0772L 2.14531 12.0772C 2.12512 12.0772 2.10494 12.0589 2.10494 12.0368L 1.52956 5.94489C 1.50264 5.66915 1.43871 5.40077 1.33777 5.14709C 1.3344 5.13606 1.33104 5.12871 1.32431 5.11768C 1.32094 5.11033 0.896984 4.27577 0.755664 3.71327C 0.600885 3.08459 0.557143 1.71695 0.685004 1.4743C 0.785947 1.36401 0.829689 1.31989 0.933997 1.23533C 1.19981 1.02209 1.50601 0.8493 1.70453 0.746359L 2.38421 1.76842C 2.44141 1.85298 2.53226 1.90445 2.62984 1.90445C 2.72742 1.90445 2.81827 1.85298 2.87547 1.76842L 3.69983 0.529447C 3.79741 0.382388 3.76713 0.17283 3.63254 0.0625354C 3.49795 -0.0440822 3.30616 -0.010994 3.20521 0.136065L 2.62647 1.00371L 2.05446 0.139742C 1.97371 0.0147415 1.8223 -0.0293763 1.69443 0.0257707C 1.67088 0.0368001 1.07195 0.301506 0.573967 0.702242C 0.432647 0.816212 0.365351 0.886065 0.247584 1.01474C -0.183106 1.48533 0.0557928 3.44121 0.16683 3.88974Z"></path><path id="54e17de2-2417-4e01-9cf7-39f13e91a977" d="M 1.38579 3.76838C 1.39252 3.76838 1.39925 3.76838 1.40598 3.76838C 1.40935 3.76838 1.41607 3.76838 1.41944 3.76838C 1.42617 3.76838 1.4329 3.76838 1.44299 3.76838C 1.83331 3.75735 2.16305 3.60294 2.39859 3.3125C 2.89994 2.69485 2.82928 1.66544 2.81582 1.53676C 2.76535 0.400735 2.04192 -1.40246e-08 1.43963 -1.40246e-08C 1.42953 -1.40246e-08 1.41944 -1.40246e-08 1.41271 -1.40246e-08C 1.40598 -1.40246e-08 1.39589 -1.40246e-08 1.38579 -1.40246e-08C 0.783499 -1.40246e-08 0.0634386 0.404412 0.00960238 1.53676C -0.000491915 1.66544 -0.0745167 2.69485 0.426833 3.3125C 0.665732 3.60294 0.995479 3.76103 1.38579 3.76838ZM 0.618625 1.59559C 0.618625 1.58824 0.618625 1.58088 0.618625 1.57353C 0.652273 0.779412 1.11325 0.661765 1.38579 0.661765L 1.39925 0.661765C 1.40598 0.661765 1.41607 0.661765 1.4228 0.661765L 1.43626 0.661765C 1.70881 0.661765 2.16978 0.779412 2.20343 1.57353C 2.20343 1.58088 2.20343 1.58824 2.20343 1.59191C 2.22698 1.82721 2.22025 2.51471 1.93425 2.86765C 1.80975 3.02206 1.63815 3.09926 1.41271 3.09926C 1.40935 3.09926 1.40935 3.09926 1.40598 3.09926C 1.18054 3.09559 1.00894 3.02206 0.884442 2.86765C 0.601801 2.51838 0.598436 1.83088 0.618625 1.59559Z"></path><path id="64733042-8ec3-4fac-b1ca-769ce78bcd18" d="M 0.182246 4.98088C 0.0274668 5.05441 -0.0431935 5.25294 0.0274666 5.41838C 0.104856 5.60956 0.151964 5.80808 0.172152 6.01397L 0.740798 12.1022C 0.774445 12.4662 1.05372 12.7419 1.3902 12.7419L 2.37271 12.7419C 2.70919 12.7419 2.98846 12.4662 3.02211 12.1022L 3.59076 6.01397C 3.61094 5.81176 3.65469 5.61691 3.72871 5.42941C 3.78928 5.30809 4.19641 4.49558 4.34446 3.88897C 4.4555 3.44044 4.69776 1.48456 4.26707 1.01397C 4.14931 0.885291 4.08201 0.815438 3.94069 0.701467C 3.44271 0.300732 2.84714 0.036026 2.82022 0.0249966C 2.689 -0.0338269 2.54095 0.0139669 2.46019 0.138967L 1.88145 1.00661L 1.29935 0.142644C 1.20177 -0.00809172 1.00998 -0.0375035 0.872023 0.0691142C 0.737433 0.175732 0.70715 0.385291 0.804728 0.536026L 1.6291 1.775C 1.6863 1.85956 1.77715 1.91103 1.87472 1.91103C 1.9723 1.91103 2.06315 1.85956 2.12035 1.775L 2.80004 0.752937C 2.99856 0.855879 3.30475 1.02867 3.57057 1.24191C 3.67151 1.32279 3.71525 1.37058 3.81956 1.48088C 3.94742 1.72353 3.90368 3.09117 3.7489 3.71985C 3.60758 4.28235 3.18362 5.11691 3.18025 5.12426C 3.17689 5.13161 3.17016 5.14264 3.16679 5.15367C 3.06585 5.40735 2.99856 5.67573 2.975 5.95147L 2.40636 12.0397C 2.40299 12.0618 2.38617 12.0801 2.36598 12.0801L 1.38347 12.0801C 1.36328 12.0801 1.34309 12.0618 1.34309 12.0397L 0.774445 5.95147C 0.747527 5.67573 0.683596 5.40735 0.582653 5.15367C 0.515358 4.98088 0.337025 4.90735 0.182246 4.98088Z"></path><path id="c29ea2c3-7373-466e-b0d2-87e5940fb610" d="M 1.38243 3.76838C 1.38916 3.76838 1.39589 3.76838 1.40598 3.76838C 1.40935 3.76838 1.41607 3.76838 1.41944 3.76838C 1.42617 3.76838 1.4329 3.76838 1.43963 3.76838C 1.82994 3.76103 2.15969 3.60294 2.39859 3.3125C 2.89994 2.69485 2.82928 1.66544 2.81582 1.53676C 2.76535 0.400735 2.04529 -1.40246e-08 1.43963 -1.40246e-08C 1.42953 -1.40246e-08 1.41944 -1.40246e-08 1.41271 -1.40246e-08C 1.40598 -1.40246e-08 1.39589 -1.40246e-08 1.38579 -1.40246e-08C 0.783499 -1.40246e-08 0.0634389 0.404412 0.00960259 1.53676C -0.000491709 1.66544 -0.0745168 2.69485 0.426833 3.3125C 0.662367 3.60294 0.992114 3.75735 1.38243 3.76838ZM 0.615261 1.59559C 0.615261 1.58824 0.615261 1.58088 0.615261 1.57353C 0.648908 0.779412 1.10988 0.661765 1.38243 0.661765L 1.39589 0.661765C 1.40262 0.661765 1.41271 0.661765 1.41944 0.661765L 1.4329 0.661765C 1.70544 0.661765 2.16642 0.779412 2.20007 1.57353C 2.20007 1.58088 2.20007 1.58824 2.20007 1.59191C 2.22362 1.82721 2.21689 2.51471 1.93088 2.86765C 1.80639 3.02206 1.63478 3.09559 1.40935 3.09926C 1.40598 3.09926 1.40598 3.09926 1.40262 3.09926C 1.17718 3.09559 1.00557 3.02206 0.881077 2.86765C 0.598437 2.51838 0.595072 1.83088 0.615261 1.59559Z"></path><path id="ca8b21ef-a843-4748-abd8-d25ccc471637" d="M 0.259304 1.07647C -0.194939 1.57279 0.0607833 3.64264 0.181915 4.12059C 0.343424 4.76397 0.774114 5.63161 0.838044 5.75661C 0.918799 5.95882 0.96927 6.16838 0.989459 6.38529L 1.59512 12.8743C 1.62876 13.2529 1.91813 13.536 2.26807 13.536L 3.31451 13.536C 3.66108 13.536 3.95045 13.2493 3.98747 12.8743L 4.59312 6.38529C 4.61331 6.16838 4.66378 5.95514 4.74454 5.75661C 4.80847 5.62794 5.23916 4.76397 5.40067 4.12059C 5.51844 3.64264 5.77752 1.57279 5.32328 1.07647C 5.19878 0.940438 5.12812 0.866908 4.98007 0.745585C 4.4518 0.319114 3.81586 0.0397023 3.78894 0.0249965C 3.65772 -0.0338271 3.50967 0.013967 3.42891 0.138967L 2.78624 1.09117L 2.15367 0.138967C 2.07291 0.013967 1.9215 -0.0301506 1.79364 0.0249965C 1.76672 0.0360259 1.13414 0.319114 0.602511 0.745585C 0.454461 0.866908 0.380436 0.940438 0.259304 1.07647ZM 0.696724 1.5397C 0.807761 1.41838 0.854868 1.37059 0.965905 1.28235C 1.25528 1.04706 1.59175 0.859556 1.8071 0.749261L 2.54062 1.8522C 2.59782 1.93676 2.68867 1.98823 2.78624 1.98823C 2.88382 1.98823 2.97467 1.93676 3.03187 1.8522L 3.76539 0.749261C 3.97737 0.859556 4.31385 1.04706 4.60658 1.28235C 4.71762 1.37059 4.76473 1.41838 4.87576 1.5397C 5.01708 1.7897 4.97334 3.26397 4.80174 3.94411C 4.65032 4.54706 4.19945 5.43676 4.19272 5.44411C 4.18935 5.45147 4.18262 5.4625 4.17926 5.47353C 4.07158 5.74191 4.00092 6.025 3.97401 6.31912L 3.36835 12.8081C 3.36498 12.8449 3.33807 12.8706 3.30442 12.8706L 2.25798 12.8706C 2.22433 12.8706 2.19741 12.8449 2.19405 12.8081L 1.58839 6.31912C 1.56147 6.02867 1.49417 5.74191 1.38314 5.47353C 1.37977 5.4625 1.37641 5.45514 1.36968 5.44411C 1.36631 5.43676 0.912069 4.54338 0.760655 3.94044C 0.599146 3.26397 0.555404 1.7897 0.696724 1.5397Z"></path><path id="00ad5f2a-5da3-4c05-a667-db4226456e87" d="M 1.45705 3.97794C 1.46378 3.97794 1.47387 3.97794 1.4806 3.97794C 1.48397 3.97794 1.49406 3.97794 1.49743 3.97794C 1.50416 3.97794 1.51089 3.97794 1.51762 3.97794C 1.93485 3.97059 2.27132 3.80882 2.52368 3.49632C 3.05531 2.84559 2.97456 1.75 2.96447 1.61765C 2.91063 0.422794 2.15356 0 1.51762 0C 1.50752 0 1.49743 0 1.48733 0C 1.4806 0 1.47051 0 1.45705 0C 0.824475 0 0.0640378 0.422794 0.0102015 1.61765C 0.000107191 1.75 -0.0806475 2.84191 0.450986 3.49265C 0.703343 3.80515 1.04318 3.96691 1.45705 3.97794ZM 0.619224 1.68015C 0.619224 1.67279 0.619224 1.66544 0.619224 1.65809C 0.656236 0.761029 1.21815 0.665441 1.45705 0.665441L 1.47387 0.665441C 1.4806 0.665441 1.4907 0.665441 1.49743 0.665441L 1.51425 0.665441C 1.75315 0.665441 2.31507 0.761029 2.35208 1.65809C 2.35208 1.66544 2.35208 1.67279 2.35208 1.67647C 2.37563 1.93015 2.37227 2.67279 2.06271 3.05147C 1.92475 3.22059 1.73633 3.30515 1.4907 3.30515C 1.48733 3.30515 1.48397 3.30515 1.4806 3.30515C 1.23498 3.30147 1.04655 3.22059 0.908594 3.05147C 0.599036 2.67647 0.595671 1.93382 0.619224 1.68015Z"></path></defs></svg> 年齡 </label> <data-holder> <span data>{my (\'age-range\')}</span> </data-holder> </team-age> <component-separator></component-separator> </info-holder> </info-area> <a href="#todos/check" ref="apply-button" disabled="{me (\'applying\')}">齊人報名</a> </match-preview> <rest></rest> </component-main-content> <component-tabs tab="matches"></component-tabs>', '', '', function(opts) {
(function (self, args, my, me) {

		self
			.establish ('apply-button', ref)
			.remembers ('applying')
		self .findings ('applying') .thru (tap, self .render)
		self .findings ('apply-button') .thru (tap, function (ref) {
			ref .addEventListener ('click', function (e) {
				e .preventDefault ();

				self .ask ('applying', true);

				gotten (my (':api') .teams) .then (function (teams) {
					return teams [0] .id
				}) .then (function (team_id) {
					var applier = my (':api') .match_apply (team_id, parse (args .params [0]))
					applier .ask ()
					promise (applier .findings) .then (function (data) {
						self .ask ('applying', false);
						if (data)
							window .location .hash = ref .hash;
					})
				})
			})
		})

		self .establish (':load', transient) .establish (':unload', transient)

		self .findings (':load') .thru (tap, function () {
			if (! my (':api') .match_to_find_info)
				window .location .hash = '#login'
		})

		self .findings (':load')
			.thru (filter, function () {
				return my (':api') .match_to_find_info;
			}) .thru (tap, function () {
				var api = my (':api') .match_to_find_info (parse (args .params [0]))
				api .ask ();
				all_gotten (api) .thru (takeUntil, self .findings (':unload'))
					.thru (tap, self .dialogue ('raw-match-info') .ask);
			})

		self
			.remembers ('raw-match-info')
		self .findings ('raw-match-info') .thru (tap, self .render);
		self
			.establish ('date', dependent (function () {

				if (my ('raw-match-info')) {
					var date_time = new Date (my ('raw-match-info') .start_at);
					return date_to_chi (date_time) + ' ' + day_of_week_to_chi (date_time);
				}
			}, self .findings ('raw-match-info')))
			.establish ('times', dependent (function () {

				if (my ('raw-match-info')) {
					var duration = my ('raw-match-info') .duration;

					var start_date_time = new Date (my ('raw-match-info') .start_at)
					var end_date_time = new Date (start_date_time .getTime () + duration * 60000);

					return times (start_date_time, end_date_time)
				}
			}, self .findings ('raw-match-info')))
			.establish ('location', dependent (function () {

				if (my ('raw-match-info'))
					return location_from_api (my ('raw-match-info') .location)
			}, self .findings ('raw-match-info')))
			.establish ('match-type', dependent (function () {

				if (my ('raw-match-info'))
					return num_of_players_to_text (my ('raw-match-info') .match_type_value) + ' - ' + pitch_type_to_chi (my ('raw-match-info') .pitch_type);
			}, self .findings ('raw-match-info')))
			.establish ('fee', dependent (function () {

				if (my ('raw-match-info'))
					return fee_to_chi (my ('raw-match-info') .fee_per_team);
			}, self .findings ('raw-match-info')))

			.establish ('team-name', dependent (function () {
				if (my ('raw-match-info'))
					return my ('raw-match-info') .home_team .long_name;
			}, self .findings ('raw-match-info')))
			.establish ('approve-number', dependent (function () {
				if (my ('raw-match-info'))
					return my ('raw-match-info') .home_team .num_of_opponent_acceptance;
			}, self .findings ('raw-match-info')))
			.establish ('opponent-number', dependent (function () {
				if (my ('raw-match-info'))
					return my ('raw-match-info') .home_team .num_of_played_against_team;
			}, self .findings ('raw-match-info')))
			.establish ('shirt-color', dependent (function () {
				if (my ('raw-match-info'))
					return my ('raw-match-info') .home_team_color;
			}, self .findings ('raw-match-info')))
			.establish ('age-range', dependent (function () {
				if (my ('raw-match-info')) {
					var lower = my ('raw-match-info') .home_team .age_group_lower;
					var upper = my ('raw-match-info') .home_team .age_group_upper;

					if (lower == '10') lower = 'U10'
					if (upper == '50') upper = 'A50'

					return lower + '-' + upper;
				}
			}, self .findings ('raw-match-info')))

}) (this, opts, this .my, this .me);
});
riot.tag2('page-match-preview-open', '<nav> <nav-buttons> <a href="#match/open"> <component-back-button></component-back-button> </a> </nav-buttons> <nav-title> <component-page-title page="球賽預覽"></component-page-title> </nav-title> </nav> <component-main-content> <match-preview> <info-area info="match"> <info-holder> <info-header> 賽事資料 </info-header> <component-separator></component-separator> <match-date> <label> <svg width="16" height="15" viewbox="0 0 16 15" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:figma="http://www.figma.com/figma/ns"><title>Group</title><desc>Created using Figma</desc><g id="Canvas" transform="translate(1157 296)" figma:type="canvas"><g id="Group" style="mix-blend-mode:normal;" figma:type="frame"><g id="Vector" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#84ad6479-2db8-4c8a-a2bf-a12046b20303" transform="translate(-1156.52 -296)" fill="#1A5276" style="mix-blend-mode:normal;"></use></g><g id="Vector" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#96694655-9fe0-4957-9fa4-3de07b67134f" transform="translate(-1154.11 -290.25)" fill="#1A5276" style="mix-blend-mode:normal;"></use></g></g></g><defs><path id="84ad6479-2db8-4c8a-a2bf-a12046b20303" d="M 14.7321 1L 12.8571 1L 12.8571 0.25C 12.8571 0.11175 12.7374 0 12.5893 0L 10.7143 0C 10.5662 0 10.4464 0.11175 10.4464 0.25L 10.4464 1L 4.55357 1L 4.55357 0.25C 4.55357 0.11175 4.43384 0 4.28571 0L 2.41071 0C 2.26259 0 2.14286 0.11175 2.14286 0.25L 2.14286 1L 0.267857 1C 0.119732 1 0 1.11175 0 1.25L 0 4L 0 14.75C 0 14.8883 0.119732 15 0.267857 15L 14.7321 15C 14.8803 15 15 14.8883 15 14.75L 15 4L 15 1.25C 15 1.11175 14.8803 1 14.7321 1ZM 10.9821 0.5L 12.3214 0.5L 12.3214 1.25L 12.3214 2L 10.9821 2L 10.9821 1.25L 10.9821 0.5ZM 2.67857 0.5L 4.01786 0.5L 4.01786 1.25L 4.01786 2L 2.67857 2L 2.67857 1.25L 2.67857 0.5ZM 0.535714 1.5L 2.14286 1.5L 2.14286 2.25C 2.14286 2.38825 2.26259 2.5 2.41071 2.5L 4.28571 2.5C 4.43384 2.5 4.55357 2.38825 4.55357 2.25L 4.55357 1.5L 10.4464 1.5L 10.4464 2.25C 10.4464 2.38825 10.5662 2.5 10.7143 2.5L 12.5893 2.5C 12.7374 2.5 12.8571 2.38825 12.8571 2.25L 12.8571 1.5L 14.4643 1.5L 14.4643 3.75L 0.535714 3.75L 0.535714 1.5ZM 0.535714 14.5L 0.535714 4.25L 14.4643 4.25L 14.4643 14.5L 0.535714 14.5Z"></path><path id="96694655-9fe0-4957-9fa4-3de07b67134f" d="M 7.23214 0L 5.35714 0L 4.82143 0L 2.94643 0L 2.41071 0L 0 0L 0 2.25L 0 2.75L 0 4.5L 0 5L 0 7.25L 2.41071 7.25L 2.94643 7.25L 4.82143 7.25L 5.35714 7.25L 7.23214 7.25L 7.76786 7.25L 10.1786 7.25L 10.1786 5L 10.1786 4.5L 10.1786 2.75L 10.1786 2.25L 10.1786 0L 7.76786 0L 7.23214 0ZM 5.35714 0.5L 7.23214 0.5L 7.23214 2.25L 5.35714 2.25L 5.35714 0.5ZM 7.23214 4.5L 5.35714 4.5L 5.35714 2.75L 7.23214 2.75L 7.23214 4.5ZM 2.94643 2.75L 4.82143 2.75L 4.82143 4.5L 2.94643 4.5L 2.94643 2.75ZM 2.94643 0.5L 4.82143 0.5L 4.82143 2.25L 2.94643 2.25L 2.94643 0.5ZM 0.535714 0.5L 2.41071 0.5L 2.41071 2.25L 0.535714 2.25L 0.535714 0.5ZM 0.535714 2.75L 2.41071 2.75L 2.41071 4.5L 0.535714 4.5L 0.535714 2.75ZM 2.41071 6.75L 0.535714 6.75L 0.535714 5L 2.41071 5L 2.41071 6.75ZM 4.82143 6.75L 2.94643 6.75L 2.94643 5L 4.82143 5L 4.82143 6.75ZM 7.23214 6.75L 5.35714 6.75L 5.35714 5L 7.23214 5L 7.23214 6.75ZM 9.64286 6.75L 7.76786 6.75L 7.76786 5L 9.64286 5L 9.64286 6.75ZM 9.64286 4.5L 7.76786 4.5L 7.76786 2.75L 9.64286 2.75L 9.64286 4.5ZM 9.64286 0.5L 9.64286 2.25L 7.76786 2.25L 7.76786 0.5L 9.64286 0.5Z"></path></defs></svg> 日期 </label> <data-holder> <span data>{my (\'date\')}</span> </data-holder> </match-date> <component-separator></component-separator> <match-time> <label> <svg width="15" height="15" viewbox="0 0 15 15" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:figma="http://www.figma.com/figma/ns"><title>Group</title><desc>Created using Figma</desc><g id="Canvas" transform="translate(1157 267)" figma:type="canvas"><g id="Group" style="mix-blend-mode:normal;" figma:type="frame"><g id="Vector" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#e182a5c5-d7f4-48a7-a83e-7f5e09a4b64c" transform="translate(-1157 -267)" fill="#8E44AD" style="mix-blend-mode:normal;"></use></g><g id="Vector" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#2f493b0a-c7a8-4323-ae6f-91c03ef1cc52" transform="translate(-1153.88 -265.56)" fill="#8E44AD" style="mix-blend-mode:normal;"></use></g></g></g><defs><path id="e182a5c5-d7f4-48a7-a83e-7f5e09a4b64c" d="M 7.2 0C 3.22992 0 0 3.22992 0 7.2C 0 11.1701 3.22992 14.4 7.2 14.4C 11.1701 14.4 14.4 11.1701 14.4 7.2C 14.4 3.22992 11.1701 0 7.2 0ZM 7.2 13.92C 3.49464 13.92 0.48 10.9054 0.48 7.2C 0.48 3.49464 3.49464 0.48 7.2 0.48C 10.9054 0.48 13.92 3.49464 13.92 7.2C 13.92 10.9054 10.9054 13.92 7.2 13.92Z"></path><path id="2f493b0a-c7a8-4323-ae6f-91c03ef1cc52" d="M 4.08 0C 3.94752 0 3.84 0.10728 3.84 0.24L 3.84 5.76L 0.24 5.76C 0.10752 5.76 0 5.86728 0 6C 0 6.13272 0.10752 6.24 0.24 6.24L 4.08 6.24C 4.21248 6.24 4.32 6.13272 4.32 6L 4.32 0.24C 4.32 0.10728 4.21248 0 4.08 0Z"></path></defs></svg> 時間 </label> <data-holder> <span data>{my (\'times\')}</span> </data-holder> </match-time> <component-separator></component-separator> <match-location> <label> <svg width="14" height="19" viewbox="0 0 14 19" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:figma="http://www.figma.com/figma/ns"><title>placeholder</title><desc>Created using Figma</desc><g id="Canvas" transform="translate(1156 240)" figma:type="canvas"><g id="placeholder" style="mix-blend-mode:normal;" figma:type="frame"><g id="Vector" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#63932ca2-69f6-4206-8065-36e54db2dad2" transform="translate(-1155.88 -240)" fill="#EE3840" style="mix-blend-mode:normal;"></use></g></g></g><defs><path id="63932ca2-69f6-4206-8065-36e54db2dad2" d="M 11.238 1.94151C 8.66733 -0.647169 4.49916 -0.647169 1.92814 1.94151C -0.388274 4.27416 -0.649034 8.6663 1.31681 11.3057L 6.58307 18.9645L 11.8493 11.3057C 13.8152 8.6663 13.5544 4.27416 11.238 1.94151ZM 6.64717 8.75274C 5.44695 8.75274 4.47417 7.77314 4.47417 6.56451C 4.47417 5.35588 5.44695 4.37628 6.64717 4.37628C 7.84739 4.37628 8.82017 5.35588 8.82017 6.56451C 8.82017 7.77314 7.84739 8.75274 6.64717 8.75274Z"></path></defs></svg> 地點 </label> <data-holder> <span data>{my (\'location\')}</span> </data-holder> </match-location> <component-separator></component-separator> <match-type> <label> <svg width="14" height="18" viewbox="0 0 14 18" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:figma="http://www.figma.com/figma/ns"><title>soccer-field</title><desc>Created using Figma</desc><g id="Canvas" transform="translate(1157 208)" figma:type="canvas"><g id="soccer-field" style="mix-blend-mode:normal;" figma:type="frame"><g id="Soccer-field 1" style="mix-blend-mode:normal;" figma:type="frame"><g id="Soccer-field" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#62b9d1df-7938-4819-a4b7-65740c8bf388" transform="translate(-1156.76 -208)" fill="#1D8348" style="mix-blend-mode:normal;"></use></g></g></g></g><defs><path id="62b9d1df-7938-4819-a4b7-65740c8bf388" d="M 13.16 0L 0.28 0C 0.12544 0 0 0.12096 0 0.27L 0 17.01C 0 17.159 0.12544 17.28 0.28 17.28L 13.16 17.28C 13.3148 17.28 13.44 17.159 13.44 17.01L 13.44 0.27C 13.44 0.12096 13.3148 0 13.16 0ZM 7.42 2.67759C 7.42 3.02481 7.10612 3.3075 6.72 3.3075C 6.33388 3.3075 6.02 3.02508 6.02 2.67759C 6.02 2.61657 6.0298 2.55582 6.04912 2.4975L 7.3906 2.4975C 7.4102 2.55582 7.42 2.61657 7.42 2.67759ZM 4.88292 1.8981L 4.88292 0.5481L 8.55708 0.5481L 8.55708 1.8981L 4.88292 1.8981ZM 4.32292 0.54L 4.32292 2.1681C 4.32292 2.31714 4.44808 2.4381 4.60292 2.4381L 5.4894 2.4381C 5.47176 2.51694 5.46 2.59686 5.46 2.67759C 5.46 3.32262 6.02504 3.8475 6.72 3.8475C 7.41468 3.8475 7.98 3.32289 7.98 2.67759C 7.98 2.59659 7.96824 2.51667 7.9506 2.4381L 8.83736 2.4381C 8.9922 2.4381 9.11736 2.31714 9.11736 2.1681L 9.11736 0.54L 12.88 0.54L 12.88 8.16588L 9.50572 8.16588C 9.36488 6.80346 8.16928 5.73588 6.72 5.73588C 5.27072 5.73588 4.07512 6.80346 3.93428 8.16588L 0.56 8.16588L 0.56 0.54L 4.32292 0.54ZM 4.49932 8.16588C 4.63792 7.10208 5.57984 6.27588 6.72 6.27588C 7.86016 6.27588 8.80208 7.10208 8.94068 8.16588L 4.49932 8.16588ZM 8.94068 8.70588C 8.80208 9.76968 7.86016 10.5959 6.72 10.5959C 5.57984 10.5959 4.63792 9.76968 4.49932 8.70588L 8.94068 8.70588ZM 6.02 14.5349C 6.02 14.1877 6.33388 13.905 6.72 13.905C 7.10612 13.905 7.42 14.1874 7.42 14.5349C 7.42 14.5959 7.4102 14.6567 7.39088 14.715L 6.0494 14.715C 6.0298 14.6567 6.02 14.5959 6.02 14.5349ZM 8.55736 15.3144L 8.55736 16.6644L 4.88292 16.6644L 4.88292 15.3144L 8.55736 15.3144ZM 9.11736 16.74L 9.11736 15.0444C 9.11736 14.8954 8.9922 14.7744 8.83736 14.7744L 7.9506 14.7744C 7.96824 14.6956 7.98 14.6159 7.98 14.5349C 7.98 13.8899 7.41468 13.365 6.72 13.365C 6.02504 13.365 5.46 13.8896 5.46 14.5349C 5.46 14.6159 5.47176 14.6958 5.4894 14.7744L 4.60292 14.7744C 4.44808 14.7744 4.32292 14.8954 4.32292 15.0444L 4.32292 16.74L 0.56 16.74L 0.56 8.70588L 3.93428 8.70588C 4.07512 10.0683 5.27072 11.1359 6.72 11.1359C 8.16928 11.1359 9.36488 10.0683 9.50572 8.70588L 12.88 8.70588L 12.88 16.74L 9.11736 16.74Z"></path></defs></svg> 場地 </label> <data-holder> <span data>{my (\'match-type\')}</span> </data-holder> </match-type> <component-separator></component-separator> <match-fee> <label> <svg width="14" height="16" viewbox="0 0 8 16" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:figma="http://www.figma.com/figma/ns"><title>$</title><desc>Created using Figma</desc><g id="Canvas" transform="translate(1155 179)" figma:type="canvas"><g id="$" style="mix-blend-mode:normal;" figma:type="text"><use xlink:href="#55dbad54-3561-454e-9acb-ce7a9745b561" transform="translate(-1155.15 -179)" fill="#B7950B" style="mix-blend-mode:normal;"></use></g></g><defs><path id="55dbad54-3561-454e-9acb-ce7a9745b561" d="M 6.36719 11.2773C 6.36719 10.8086 6.20052 10.4102 5.86719 10.082C 5.53906 9.7487 4.99219 9.45182 4.22656 9.19141C 3.17448 8.8737 2.38021 8.44922 1.84375 7.91797C 1.30729 7.38672 1.03906 6.67839 1.03906 5.79297C 1.03906 4.93359 1.28646 4.23307 1.78125 3.69141C 2.27604 3.14974 2.95573 2.82422 3.82031 2.71484L 3.82031 0.988281L 5.05469 0.988281L 5.05469 2.72266C 5.92448 2.84766 6.59896 3.22266 7.07812 3.84766C 7.5625 4.46745 7.80469 5.30078 7.80469 6.34766L 6.27344 6.34766C 6.27344 5.63932 6.10938 5.06641 5.78125 4.62891C 5.45833 4.19141 5.00521 3.97266 4.42188 3.97266C 3.80729 3.97266 3.34635 4.13411 3.03906 4.45703C 2.73177 4.77474 2.57812 5.21224 2.57812 5.76953C 2.57812 6.27474 2.73698 6.68359 3.05469 6.99609C 3.3724 7.30859 3.94271 7.60547 4.76562 7.88672C 5.82812 8.23047 6.61719 8.66016 7.13281 9.17578C 7.64844 9.6862 7.90625 10.3815 7.90625 11.2617C 7.90625 12.1576 7.63802 12.8711 7.10156 13.4023C 6.5651 13.9336 5.82812 14.2487 4.89062 14.3477L 4.89062 15.8398L 3.67188 15.8398L 3.67188 14.3477C 2.77604 14.2539 2.04167 13.9284 1.46875 13.3711C 0.895833 12.8086 0.619792 11.9857 0.640625 10.9023L 0.65625 10.8633L 2.14062 10.8633C 2.14062 11.6654 2.34115 12.2383 2.74219 12.582C 3.14844 12.9206 3.64583 13.0898 4.23438 13.0898C 4.90625 13.0898 5.42969 12.931 5.80469 12.6133C 6.17969 12.2904 6.36719 11.8451 6.36719 11.2773Z"></path></defs></svg> 費用 <small>每隊</small> </label> <data-holder> <span data>{my (\'fee\')}</span> </data-holder> </match-fee> <component-separator></component-separator> <match-tags> <tags> <tag>聯賽</tag> <tag>競爭性</tag> </tags> </match-tags> <component-separator></component-separator> </info-holder> </info-area> <a href="#todos/check" ref="open-button" disabled="{me (\'opening\')}">建立</a> </match-preview> <rest></rest> </component-main-content> <component-tabs tab="matches"></component-tabs>', '', '', function(opts) {
(function (self, args, my, me) {

		self
			.remembers ('opening')
			.establish ('open-button', ref)
		self .findings ('opening') .thru (tap, self .render)
		self .findings ('open-button') .thru (tap, function (ref) {
			ref .addEventListener ('click', function (e) {
				e .preventDefault ();

				self .ask ('opening', true);

				gotten (my (':api') .teams) .then (function (teams) {
					return teams [0] .id
				}) .then (function (team_id) {
					var opener = my (':api') .match_open (team_id)
					opener .ask ({
				        start_at: 	fecha .format
				        				(fecha .parse (parse (args .params [0]) + ' ' + parse (args .params [1]), 'YYYY年M月D日 h:mm A'),
				        				'YYYY-MM-DDTHH:mm:ss+08:00'),
				        duration: parse (args .params [2]),
				        pitch_type: (function (chinese) {
							        	if (chinese === '硬地') return 'HARD_SURFACE'
							        	if (chinese === '人造草') return 'GRASS_CARPET'
							        	if (chinese === '仿真草') return 'ARTIFICIAL_TURF'
							        	if (chinese === '真草') return 'REAL_GRASS'
							        }) (parse (args .params [7])),
				        home_team_color: parse (args .params [3]),
				        fee_per_team: parse (args .params [5]) || 0,
				        pitch_name: parse (args .params [4]),
				        match_type: + (parse (args .params [6]) .split ('v') [0]),
				        country: 'HKG',
				        city: 'Hong Kong',
				        region: 'Hong Kong'
					})
					promise (opener .findings) .then (function (data) {
						self .ask ('opening', false);
						if (data)
							window .location .hash = ref .hash;
					})
				})
			})
		})

		self
			.establish ('date', computed (function () {

				var date = parse (args .params [0]);
				var date_time = date_from_chi (date)
				return date + ' ' + day_of_week_to_chi (date_time);
			}))
			.establish ('times', computed (function () {

				var date = parse (args .params [0]);
				var time = parse (args .params [1]);
				var duration = parse (args .params [2]);

				var start_date_time = fecha .parse (date + ' ' + time, 'YYYY年M月D日 h:mm A')
				var end_date_time = new Date (start_date_time .getTime () + duration * 60000);

				return times (start_date_time, end_date_time)
			}))
			.establish ('location', computed (function () {

				return parse (args .params [4])
			}))
			.establish ('match-type', computed (function () {

				return parse (args .params [6]) + ' - ' + parse (args .params [7]);
			}))
			.establish ('fee', computed (function () {

				var fee = parse (args .params [5]);
				return fee_to_chi (fee)
			}))

}) (this, opts, this .my, this .me);
});
riot.tag2('page-matches-find', '<nav> <nav-title> <component-title></component-title> </nav-title> <nav-buttons> <a href="#match/open"> <component-create-button></component-create-button> </a> </nav-buttons> </nav> <component-main-content> <find-match> <component-search-bar></component-search-bar> <component-dynamic-load items_to_load="13" interval_for_loading="35" items__from=":matches"> <component-matches-find-wrap item__from=":item"></component-matches-find-wrap> </component-dynamic-load> </find-match> </component-main-content> <component-tabs tab="matches"></component-tabs>', '', '', function(opts) {
(function (self, args, my, me) {

		self .establish (':load', transient) .establish (':unload', transient)

		self
			.establish (':matches', function (requests) {
				return 	self .findings (':load')
							.thru (filter, function () {
								return my (':api') .matches_to_find;
							})
							.thru (flatMap, function () {
								return all_gotten (my (':api') .matches_to_find);
							})

							.thru (filter, id)
							.thru (map, function (match_list) {
								var last_date;
								return 	match_list .map (function (match) {
											var curr = '' + fecha .format (new Date (match .start_at), 'YYYYMMDD');
											if (last_date === curr)
												return 	{ match: match };
											else {
												last_date = curr;
												return 	{ date: curr, match: match };
											}
										});
							})
							.thru (trans, R .dropRepeatsWith (json_equal)) ;
			})

}) (this, opts, this .my, this .me);
});
riot.tag2('page-team-edit', '<nav> <nav-title> <component-page-title page="修改球隊"></component-page-title> </nav-title> </nav> <component-main-content> <open-team> <info-area> <info-holder> <info-header>球隊資料</info-header> <component-separator></component-separator> <team-name> <label>隊名</label> <control-holder> <component-input-control type="text" placeholder="黃銀馬德里" change__to=":name"></component-input-control> </control-holder> </team-name> <component-separator></component-separator> <team-active-region> <label>活躍地區</label> <control-holder> <component-select-control multiple select__to=":active-region"> <a>香港</a> <a>九龍</a> <a>新界</a> </component-select-control> </control-holder> </team-active-region> <component-separator></component-separator> <team-age-range> <label>年齡</label> <control-holder><component-age-range-picker min="10" max="50" range__to=":age-range"></component-age-range-picker></control-holder> </team-age-range> <component-separator></component-separator> <team-is-league-active> <label>聯賽球隊</label> <control-holder> <component-select-control select__to=":is-league?"> <a>是</a> <a>否</a> </component-select-control> </control-holder> </team-is-league-active> <component-separator></component-separator> </info-holder> </info-area> <info-area> <info-holder> <info-header>偏好</info-header> <component-separator></component-separator> <team-number-of-players> <label>人數</label> <control-holder> <component-select-control multiple select__to=":number-of-players-preference"> <a>5v5</a> <a>7v7</a> <a>9v9</a> <a>11v11</a> </component-select-control> </control-holder> </team-number-of-players> <component-separator></component-separator> <team-day-of-week> <label>幾時得閒</label> <control-holder> <component-day-of-week-picker days__to=":day-preference"></component-day-of-week-picker> </control-holder> </team-day-of-week> <component-separator></component-separator> </info-holder> </info-area> <a href="#team/profile">確認</a> </open-team> <rest></rest> </component-main-content> <component-tabs tab="teams"></component-tabs>', '', '', function(opts) {
(function (self, args, my, me) {

		self
			.remembers (':name')
			.remembers (':active-region')
			.remembers (':age-range')
			.remembers (':is-league?')
			.remembers (':number-of-players-preference')
			.remembers (':day-preference')

}) (this, opts, this .my, this .me);
});
riot.tag2('page-team-open-phone', '<nav> <nav-buttons> <a href="#team/open"> <component-back-button></component-back-button> </a> </nav-buttons> <nav-title> <component-page-title page="電話認證"></component-page-title> </nav-title> </nav> <component-main-content> <phone-verification> 請輸入手機號碼 <component-input-control placeholder="999" input__to=":phone" type="number"></component-input-control> <a href="#team/open/verify" ref="phone-button" disabled="{me (\'phone-ok\') !== \'ok\'}" maybe="{me (\'phone-ok\') === \'maybe\'}">確定</a> </phone-verification> </component-main-content>', '', '', function(opts) {
(function (self, args, my, me) {

		self
			.remembers (':phone')
			.remembers ('phone-ok', 'not-ok')

		self .findings (':phone')
			.thru (tap, function () {
				self .ask ('phone-ok', 'maybe')
			})
			.thru (map, function (phone_num) {
				if ((phone_num + '') .length === 8) {
					return 	stream ({
								phone_number: '+852' + phone_num
							})
							.thru (map, function (phone_info) {
								my (':api') .contact .ask (phone_info);
								return promise (my (':api') .contact .findings .thru (news))
							})
							.thru (map, wait .bind (null, 400))
				}
				else
					return stream ({ error: 'invalid input' });
			})
			.thru (switchLatest)
			.thru (tap, function (res) {
				if (res .error)
					self .ask ('phone-ok', 'not-ok')
				else
					self .ask ('phone-ok', 'ok')
			})
		self .findings ('phone-ok') .thru (tap, self .render);

		self .establish ('phone-button', ref)
			.findings ('phone-button') .thru (tap, function (ref) {
				ref .addEventListener ('click', function (e) {
					e .preventDefault ();
					window .location .hash = ref .hash  + '/#' + (args .params .concat ([ stringify ('+852' + my (':phone')) ])) .join ('/')
				})
			})

}) (this, opts, this .my, this .me);
});
riot.tag2('page-team-open-verify', '<nav> <nav-buttons> <a href="#team/open/phone/#{args .params .slice (0, -1) .join (\'/\')}"> <component-back-button></component-back-button> </a> </nav-buttons> <nav-title> <component-page-title page="電話認證"></component-page-title> </nav-title> </nav> <component-main-content> <phone-verification> 請輸入手機驗證碼 <component-input-control type="text" placeholder="689" maxlength="5" input__to=":verification"></component-input-control> <a href="#team/profile" ref="verify-button" disabled="{me (\'verify-ok\') !== \'ok\'}" maybe="{me (\'verify-ok\') === \'maybe\'}">確認</a> </phone-verification> </component-main-content> <unloading ref="unloading"> <smoke ref="smoke"></smoke> </unloading>', '', '', function(opts) {
(function (self, args, my, me) {

		self
			.remembers (':verification')
			.remembers ('verify-ok', 'verify-ok')

		self .findings (':verification')
			.thru (tap, function () {
				self .ask ('verify-ok', 'maybe')
			})
			.thru (map, function (verify_num) {
				if ((verify_num + '') .length === 5) {
					return	stream (verify_num === 'D7689' ? { data: 'verified' } : { error: 'incorrect verification' })
								.thru (map, wait .bind (null, 400))
				}
				else {
					return stream ({ error: 'invalid code' });
				}
			})
			.thru (switchLatest)
			.thru (tap, function (res) {
				if (res .error)
					self .ask ('verify-ok', 'not-ok')
				else
					self .ask ('verify-ok', 'ok')
			})
		self .findings ('verify-ok') .thru (tap, self .render);

		self
			.establish ('unloading', ref)
			.establish (':unload', function (reqs) {
				return 	reqs .thru (map, function () {
							my ('unloading') .setAttribute ('active', true);
							my (':api') .team_open .ask ({
						        phone_number: parse (args .params [6]),
						        long_name: parse (args .params [0]),
						        age_group_lower: parse (args .params [2]) .min,
						        age_group_upper: parse (args .params [2]) .max,
						        is_frequent_league_player: parse (args .params [3]) === '是',
						        home_shirt_color: '#000000',
						        preferred_day_of_week_list:	parse (args .params [5]) .map (capitalize),
						        preferred_match_type_list: 	parse (args .params [4]) .map (num_of_players_to_num)
							});
							return promise (news (my (':api') .team_open .findings))
						})
			})

}) (this, opts, this .my, this .me);
});
riot.tag2('page-team-open', '<nav> <nav-title> <component-page-title page="建立球隊"></component-page-title> </nav-title> </nav> <component-main-content> <open-team> <info-area> <info-holder> <info-header>球隊資料</info-header> <component-separator></component-separator> <team-name> <label>隊名</label> <control-holder> <component-input-control type="text" placeholder="黃銀馬德里" change__to=":name"></component-input-control> </control-holder> </team-name> <component-separator></component-separator> <team-active-region> <label>活躍地區</label> <control-holder> <component-select-control multiple select__to=":active-region"> <a>香港</a> <a>九龍</a> <a>新界</a> </component-select-control> </control-holder> </team-active-region> <component-separator></component-separator> <team-age-range> <label>年齡</label> <control-holder><component-age-range-picker min="10" max="50" range__to=":age-range"></component-age-range-picker></control-holder> </team-age-range> <component-separator></component-separator> <team-is-league-active> <label>聯賽球隊</label> <control-holder> <component-select-control select__to=":is-league?"> <a>是</a> <a>否</a> </component-select-control> </control-holder> </team-is-league-active> <component-separator></component-separator> </info-holder> </info-area> <info-area> <info-holder> <info-header>偏好</info-header> <component-separator></component-separator> <team-number-of-players> <label>人數</label> <control-holder> <component-select-control multiple select__to=":number-of-players-preference"> <a>5v5</a> <a>7v7</a> <a>9v9</a> <a>11v11</a> </component-select-control> </control-holder> </team-number-of-players> <component-separator></component-separator> <team-day-of-week> <label>幾時得閒</label> <control-holder> <component-day-of-week-picker days__to=":day-preference"></component-day-of-week-picker> </control-holder> </team-day-of-week> <component-separator></component-separator> </info-holder> </info-area> <a href="#team/open/phone" disabled="{! me (\'can-open\')}" ref="open-button">建立</a> </open-team> <rest></rest> </component-main-content>', '', '', function(opts) {
(function (self, args, my, me) {

		self
			.remembers (':name')
			.remembers (':active-region')
			.remembers (':age-range')
			.remembers (':is-league?')
			.remembers (':number-of-players-preference')
			.remembers (':day-preference')

			.establish ('open-button', ref)

			.establish ('can-open', dependent (function () {
				if (! me (':name'))
					return false;
				if (! me (':active-region') || ! me (':active-region') .length)
					return false;
				if (! me (':is-league?'))
					return false;
				if (! me (':number-of-players-preference') || ! me (':number-of-players-preference') .length)
					return false;
				if (! me (':day-preference') || ! me (':day-preference') .length)
					return false;

				return true;
			}, mergeAll
				([self .findings (':name'), self .findings (':active-region'), self .findings (':is-league?'), self .findings (':number-of-players-preference'), self .findings (':day-preference')])
			))
		self .findings ('can-open')
			.thru (trans, R .dropRepeats)
			.thru (tap, self .render)

		self .findings ('open-button') .thru (tap, function (ref) {
			ref .addEventListener ('click', function (e) {
				e .preventDefault ();
				window .location .hash = ref .hash  + '/#' + [ my (':name'), my (':active-region'), my (':age-range'), my (':is-league?'), my (':number-of-players-preference'), my (':day-preference') ] .map (stringify) .join ('/')
			})
		})

}) (this, opts, this .my, this .me);
});
riot.tag2('page-team-profile', '<nav> <nav-title> <component-page-title page="球隊資料"></component-page-title> </nav-title> </nav> <component-main-content> <team-profile> <info-graphic> <diagrams row> <team-picture> <img src="http://placehold.it/128x128"> </team-picture> <team-ranking> <a href="#league/table"> <league-table> <svg width="98" height="93" viewbox="0 0 98 93" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:figma="http://www.figma.com/figma/ns"><title>Vector</title><desc>Created using Figma</desc><g id="Canvas" transform="translate(870 331)" figma:type="canvas"><g id="Vector" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#c9194e77-48d8-47f9-b662-8cd5aa87544f" transform="translate(-869.5 -330.628)" fill="#5DADE2" fill-opacity="0.7" style="mix-blend-mode:normal;"></use></g></g><defs><path id="c9194e77-48d8-47f9-b662-8cd5aa87544f" d="M 48.473 -2.09808e-08L 0 35.219L 18.515 92.203L 78.432 92.203L 96.947 35.219L 48.473 -2.09808e-08ZM 49.023 4.27L 92.48 35.842L 81.398 38.33C 81.046 37.48 80.21 36.879 79.232 36.879C 79.029 36.879 78.836 36.914 78.648 36.961L 50.749 13.456C 50.791 13.28 50.819 13.099 50.819 12.911C 50.819 11.806 50.052 10.886 49.023 10.638L 49.023 4.27ZM 64.893 75.351L 27.719 80.134C 27.64 79.972 27.542 79.822 27.429 79.683L 33.662 70.091C 33.897 70.169 34.145 70.222 34.407 70.222C 35.703 70.222 36.754 69.171 36.754 67.876C 36.754 67.874 36.754 67.872 36.754 67.872L 56.357 63.022C 56.765 63.712 57.509 64.182 58.37 64.182C 58.708 64.182 59.027 64.108 59.316 63.979L 65.583 73.62C 65.154 74.046 64.889 74.634 64.889 75.284C 64.887 75.308 64.893 75.331 64.893 75.351ZM 34.354 42.445C 34.305 42.213 34.214 41.998 34.103 41.797L 46.96 32.457C 47.235 32.689 47.56 32.863 47.922 32.951L 47.922 45.482L 34.354 42.445ZM 47.645 46.548L 35.212 65.681C 35.073 65.63 34.929 65.593 34.779 65.568L 32.852 45.13C 33.56 44.874 34.104 44.292 34.31 43.562L 47.645 46.548ZM 46.127 30.676C 46.127 30.994 46.191 31.295 46.306 31.571L 33.359 40.979C 32.987 40.731 32.541 40.584 32.061 40.584C 31.3 40.584 30.63 40.951 30.202 41.514L 19.477 39.114C 19.452 39.005 19.418 38.899 19.378 38.798L 47.545 15.066C 47.666 15.117 47.793 15.154 47.922 15.187L 47.922 28.404C 46.894 28.65 46.127 29.57 46.127 30.676ZM 19.452 40.236L 29.752 42.543C 29.731 42.67 29.713 42.797 29.713 42.93C 29.713 44.121 30.605 45.096 31.755 45.246L 33.679 65.656C 32.741 65.963 32.058 66.836 32.058 67.877C 32.058 68.513 32.313 69.086 32.723 69.509L 26.551 79.006C 26.428 78.953 26.298 78.912 26.165 78.881L 18.693 41.428C 19.059 41.122 19.327 40.709 19.452 40.236ZM 57.768 59.577L 49.368 46.65L 62.67 43.665C 62.833 44.159 63.148 44.587 63.571 44.874L 58.807 59.536C 58.664 59.51 58.518 59.491 58.369 59.491C 58.158 59.491 57.96 59.525 57.768 59.577ZM 60.188 63.3C 60.512 62.898 60.713 62.392 60.713 61.835C 60.713 61.087 60.358 60.429 59.813 59.999L 64.606 45.249C 64.699 45.261 64.791 45.276 64.887 45.276C 66.182 45.276 67.233 44.225 67.233 42.93C 67.233 42.832 67.215 42.739 67.204 42.643L 77.21 40.398C 77.406 40.736 77.68 41.017 78.014 41.222L 67.692 72.986C 67.543 72.958 67.39 72.939 67.232 72.939C 66.985 72.939 66.752 72.989 66.528 73.058L 60.188 63.3ZM 49.023 15.186C 49.154 15.153 49.281 15.116 49.402 15.065L 77.054 38.362C 76.948 38.63 76.884 38.921 76.884 39.227C 76.884 39.266 76.894 39.303 76.896 39.34L 66.818 41.604C 66.396 40.991 65.687 40.586 64.886 40.586C 64.406 40.586 63.959 40.731 63.587 40.979L 50.64 31.571C 50.753 31.296 50.819 30.995 50.819 30.676C 50.819 29.571 50.052 28.651 49.023 28.403L 49.023 15.186ZM 49.023 32.952C 49.386 32.864 49.711 32.69 49.986 32.458L 62.843 41.8C 62.714 42.032 62.621 42.284 62.576 42.558L 49.022 45.601L 49.022 32.952L 49.023 32.952ZM 56.797 60.105C 56.323 60.536 56.022 61.148 56.022 61.835C 56.022 61.88 56.033 61.923 56.035 61.966L 36.483 66.804C 36.387 66.618 36.27 66.448 36.129 66.292L 48.473 47.298L 56.797 60.105ZM 47.922 4.27L 47.922 10.637C 46.894 10.885 46.127 11.805 46.127 12.91C 46.127 13.098 46.155 13.279 46.197 13.455L 17.8 37.38C 17.606 37.327 17.405 37.29 17.194 37.29C 16.447 37.29 15.789 37.645 15.36 38.19L 4.562 35.773L 47.922 4.27ZM 3.78 36.729L 14.889 39.215C 14.864 39.352 14.847 39.492 14.847 39.637C 14.847 40.746 15.618 41.67 16.652 41.914L 24.122 79.355C 23.604 79.785 23.267 80.425 23.267 81.152C 23.267 81.84 23.567 82.451 24.037 82.881L 20.53 88.276L 3.78 36.729ZM 21.326 89.075L 25.006 83.411C 25.2 83.464 25.402 83.501 25.613 83.501C 26.507 83.501 27.275 82.995 27.671 82.26L 66.078 77.319C 66.42 77.514 66.81 77.635 67.232 77.635C 67.532 77.635 67.816 77.573 68.08 77.471L 75.621 89.075L 21.326 89.075ZM 76.417 88.275L 68.982 76.837C 69.349 76.421 69.578 75.885 69.578 75.286C 69.578 74.995 69.517 74.719 69.422 74.46L 80.172 41.374C 80.94 41.038 81.484 40.298 81.559 39.423L 93.135 36.823L 76.417 88.275Z"></path></defs></svg> </league-table> <rank-stars> <icon-holder><icon class="fa-star"></icon></icon-holder> <icon-holder><icon class="fa-star"></icon></icon-holder> <icon-holder><icon class="fa-star"></icon></icon-holder> <icon-holder><icon class="fa-star"></icon></icon-holder> <icon-holder><icon class="fa-star"></icon></icon-holder> </rank-stars> <rank-number>12</rank-number> </a> </team-ranking> </diagrams> <stats row> <strength-stats> <stats-labels> <ranking>排名</ranking> <rating>分數</rating> <win-rate>勝率</win-rate> </stats-labels> <stats-info> <ranking>689</ranking> <rating>7</rating> <win-rate>{my (\'win-rate\')}</win-rate> </stats-info> </strength-stats> <reviews-stats> <svg width="27" height="28" viewbox="0 0 27 28" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:figma="http://www.figma.com/figma/ns"><title>Group</title><desc>Created using Figma</desc><g id="Canvas" transform="translate(1340 -5)" figma:type="canvas"><g id="Group" style="mix-blend-mode:normal;" figma:type="frame"><g id="like" style="mix-blend-mode:normal;" figma:type="frame"><g id="Group" style="mix-blend-mode:normal;" figma:type="frame"><g id="Group" style="mix-blend-mode:normal;" figma:type="frame"><g id="XMLID 1929" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#004cd4b8-c756-488b-9772-e256f127953b" transform="translate(-1339.49 16.7686)" fill="#3C92CA" style="mix-blend-mode:normal;"></use></g><g id="Vector" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#576b6ba1-560d-405c-aa20-a4ec0702e1ab" transform="translate(-1340 5.5)" fill="#FFFFFF" style="mix-blend-mode:normal;"></use><use xlink:href="#7bf3e937-4340-4f22-8d0a-6f1c14164da8" transform="translate(-1340 5.5)" fill="#FFFFFF" style="mix-blend-mode:normal;"></use></g><g id="Vector" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#1ed19ef4-81e7-4093-9f1d-b918781f9f6b" transform="translate(-1340 5.5)" style="mix-blend-mode:normal;"></use></g></g></g></g></g></g><defs><path id="004cd4b8-c756-488b-9772-e256f127953b" d="M 5.5834 14.7633L 0.217101 14.7633C 0.100201 14.7633 2.12353e-08 14.6596 2.12353e-08 14.5386L 2.12353e-08 0.224734C 2.12353e-08 0.103723 0.100201 2.11026e-08 0.217101 2.11026e-08L 5.5834 2.11026e-08C 5.7003 2.11026e-08 5.8005 0.103723 5.8005 0.224734L 5.8005 14.5386C 5.8005 14.6596 5.70586 14.7633 5.5834 14.7633Z"></path><path id="576b6ba1-560d-405c-aa20-a4ec0702e1ab" d="M 15.8428 0.700382C 14.273 -0.492437 12.102 0.19329 12.0129 0.222102C 11.8014 0.291251 11.6622 0.492935 11.6622 0.717669L 11.6622 5.66181C 11.6622 7.33867 10.894 8.75622 9.37432 9.87989C 8.19974 10.75 6.99734 11.1073 6.9862 11.113C 6.97507 11.113 6.9695 11.1188 6.95837 11.1246L 6.67447 11.2225C 6.50747 10.9402 6.21243 10.75 5.8673 10.75L 0.940772 10.75C 0.423069 10.75 0 11.188 0 11.7239L 0 25.5824C 0 26.1184 0.423069 26.5563 0.940772 26.5563L 5.87286 26.5563C 6.3182 26.5563 6.69117 26.2336 6.7858 25.8072C 7.44824 26.539 8.38901 27 9.43555 27L 21.1145 27C 23.5972 27 25.1837 25.6574 25.4621 23.3121L 26.9539 13.5044C 27.171 12.0811 26.6088 10.6405 25.5177 9.83379C 24.8998 9.3728 24.1706 9.13078 23.408 9.13078L 17.3347 9.13078L 17.3347 4.54391C 17.3347 2.74604 16.8337 1.45526 15.8428 0.700382ZM 5.8005 25.5075L 1.00757 25.5075L 1.00757 11.793L 5.8005 11.793L 5.8005 25.5075ZM 23.408 10.1738C 23.9591 10.1738 24.4823 10.3466 24.9277 10.6809C 25.707 11.2629 26.1134 12.3059 25.9519 13.3431L 24.4656 23.1565C 24.4656 23.1622 24.4656 23.168 24.4656 23.1738C 24.1929 25.4672 22.495 25.9512 21.1145 25.9512L 9.43555 25.9512C 7.98821 25.9512 6.81364 24.7354 6.81364 23.2372L 6.81364 12.2771L 7.27567 12.1157C 7.43711 12.0696 8.67848 11.6778 9.93655 10.75C 11.7235 9.43619 12.6698 7.67865 12.6698 5.66757L 12.6698 1.13832C 13.2487 1.02308 14.4122 0.907828 15.2527 1.54746C 15.9653 2.08912 16.3271 3.09754 16.3271 4.54391L 16.3271 9.65516C 16.3271 9.94328 16.5554 10.1795 16.8337 10.1795L 23.408 10.1795L 23.408 10.1738Z"></path><path id="7bf3e937-4340-4f22-8d0a-6f1c14164da8" d="M 23.408 10.1738C 23.9591 10.1738 24.4823 10.3466 24.9277 10.6809C 25.707 11.2629 26.1134 12.3059 25.9519 13.3431L 24.4656 23.1565L 24.4656 23.1738C 24.1929 25.4672 22.495 25.9512 21.1145 25.9512L 9.43555 25.9512C 7.98821 25.9512 6.81364 24.7354 6.81364 23.2372L 6.81364 12.2771L 7.27567 12.1157C 7.43711 12.0696 8.67848 11.6778 9.93655 10.75C 11.7235 9.43619 12.6698 7.67865 12.6698 5.66757L 12.6698 1.13832C 13.2487 1.02308 14.4122 0.907828 15.2527 1.54746C 15.9653 2.08912 16.3271 3.09754 16.3271 4.54391L 16.3271 9.65516C 16.3271 9.94328 16.5554 10.1795 16.8337 10.1795L 23.408 10.1795L 23.408 10.1738Z"></path><path id="1ed19ef4-81e7-4093-9f1d-b918781f9f6b" d="M 15.8428 0.700382C 14.273 -0.492437 12.102 0.19329 12.0129 0.222102C 11.8014 0.291251 11.6622 0.492935 11.6622 0.717669L 11.6622 5.66181C 11.6622 7.33867 10.894 8.75622 9.37432 9.87989C 8.19974 10.75 6.99734 11.1073 6.9862 11.113C 6.97507 11.113 6.9695 11.1188 6.95837 11.1246L 6.67447 11.2225C 6.50747 10.9402 6.21243 10.75 5.8673 10.75L 0.940772 10.75C 0.423069 10.75 0 11.188 0 11.7239L 0 25.5824C 0 26.1184 0.423069 26.5563 0.940772 26.5563L 5.87286 26.5563C 6.3182 26.5563 6.69117 26.2336 6.7858 25.8072C 7.44824 26.539 8.38901 27 9.43555 27L 21.1145 27C 23.5972 27 25.1837 25.6574 25.4621 23.3121L 26.9539 13.5044C 27.171 12.0811 26.6088 10.6405 25.5177 9.83379C 24.8998 9.3728 24.1706 9.13078 23.408 9.13078L 17.3347 9.13078L 17.3347 4.54391C 17.3347 2.74604 16.8337 1.45526 15.8428 0.700382ZM 5.8005 25.5075L 1.00757 25.5075L 1.00757 11.793L 5.8005 11.793L 5.8005 25.5075ZM 23.408 10.1738C 23.9591 10.1738 24.4823 10.3466 24.9277 10.6809C 25.707 11.2629 26.1134 12.3059 25.9519 13.3431L 24.4656 23.1565C 24.4656 23.1622 24.4656 23.168 24.4656 23.1738C 24.1929 25.4672 22.495 25.9512 21.1145 25.9512L 9.43555 25.9512C 7.98821 25.9512 6.81364 24.7354 6.81364 23.2372L 6.81364 12.2771L 7.27567 12.1157C 7.43711 12.0696 8.67848 11.6778 9.93655 10.75C 11.7235 9.43619 12.6698 7.67865 12.6698 5.66757L 12.6698 1.13832C 13.2487 1.02308 14.4122 0.907828 15.2527 1.54746C 15.9653 2.08912 16.3271 3.09754 16.3271 4.54391L 16.3271 9.65516C 16.3271 9.94328 16.5554 10.1795 16.8337 10.1795L 23.408 10.1795L 23.408 10.1738Z"></path></defs></svg> <info>{my (\'approve-number\')}/{my (\'opponent-number\')}</info> </reviews-stats> </stats> </info-graphic> <info-area info="general"> <info-holder> <component-separator></component-separator> <team-name> <label>名稱</label> <data-holder> <h3 data>{my (\'name\')}</h3> </data-holder> </team-name> <component-separator></component-separator> <team-active-region> <label>地區</label> <data-holder> <span data>香港//九龍//新界</span> </data-holder> </team-active-region> <component-separator></component-separator> <team-age-range> <label>年齡</label> <data-holder> <span data>{my (\'age-lower\')}-{my (\'age-higher\')}</span> </data-holder> </team-age-range> <component-separator></component-separator> <team-shirt-color> <label>球衣</label> <data-holder> <span data> <svg width="20" height="18" viewbox="0 0 20 18" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:figma="http://www.figma.com/figma/ns"><title>Group</title><desc>Created using Figma</desc><g id="Canvas" transform="translate(766 112)" figma:type="canvas"><g id="Group" style="mix-blend-mode:normal;" figma:type="frame"><g id="Vector" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#2ad1c79f-242c-4970-ab98-bd7cba55901d" transform="translate(-765.5 -111.725)" fill="#229954" style="mix-blend-mode:normal;"></use></g><g id="Vector" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#e7084b01-cad4-48e1-8c98-404c7a56237d" transform="translate(-758.37 -106.145)" fill="#229954" style="mix-blend-mode:normal;"></use></g></g></g><defs><path id="2ad1c79f-242c-4970-ab98-bd7cba55901d" d="M 18.5529 6.65576L 15.4529 1.69576C 15.4207 1.6443 15.3739 1.60308 15.3184 1.57797L 12.9515 0.501955C 12.9512 0.501955 12.9512 0.501645 12.9509 0.501645L 11.9084 0.027965C 11.8216 -0.011715 11.7217 -0.00892497 11.6371 0.034785C 11.5531 0.078805 11.493 0.158785 11.4756 0.252095C 11.0912 2.2795 9.68504 2.6022 9.27243 2.65335C 9.26871 2.65366 9.2653 2.6518 9.26158 2.65242C 9.19896 2.66048 9.15618 2.66328 9.15649 2.66358C 9.15339 2.66358 9.14564 2.66297 9.13789 2.66234C 9.13448 2.66203 9.13231 2.66203 9.12797 2.66173C 9.11898 2.6611 9.10503 2.65924 9.09232 2.65769C 9.08395 2.65676 9.07682 2.65614 9.0669 2.65459C 9.05326 2.65273 9.03559 2.64932 9.01916 2.64653C 9.00583 2.64436 8.99405 2.6425 8.97917 2.6394C 8.96181 2.63568 8.94104 2.63041 8.92182 2.62577C 8.90446 2.62142 8.88834 2.61802 8.86943 2.61275C 8.84866 2.60717 8.82541 2.59879 8.8034 2.59197C 8.78263 2.58546 8.76279 2.57957 8.74047 2.57151C 8.71784 2.56345 8.69304 2.55229 8.66886 2.54268C 8.64468 2.53276 8.62112 2.52408 8.59601 2.51261C 8.57152 2.50145 8.54548 2.48688 8.52006 2.47386C 8.49371 2.46022 8.46767 2.44813 8.44039 2.43263C 8.41435 2.41775 8.38738 2.39916 8.36072 2.38242C 8.33282 2.36475 8.30523 2.34862 8.27671 2.32847C 8.25005 2.30956 8.22277 2.28662 8.19549 2.26554C 8.16666 2.24291 8.13783 2.22246 8.10869 2.19735C 8.08172 2.17409 8.05475 2.14588 8.02778 2.12015C 7.99864 2.09225 7.9695 2.06652 7.94036 2.03584C 7.91339 2.00732 7.88704 1.97321 7.86038 1.94222C 7.83186 1.90874 7.80303 1.87773 7.77513 1.84084C 7.74878 1.80643 7.72367 1.76583 7.69794 1.72863C 7.67066 1.68895 7.64307 1.65205 7.61672 1.60927C 7.59161 1.56804 7.56805 1.52031 7.54387 1.47598C 7.51876 1.43009 7.49272 1.38732 7.46885 1.33772C 7.44374 1.28594 7.42142 1.22704 7.39786 1.17124C 7.37709 1.12164 7.35477 1.07577 7.33524 1.02307C 7.31044 0.956725 7.28905 0.881705 7.26642 0.809785C 7.25092 0.759875 7.23356 0.714615 7.21899 0.662225C 7.18365 0.533885 7.15203 0.397485 7.12444 0.252405C 7.10677 0.159095 7.04694 0.078805 6.96293 0.035095C 6.87861 -0.00892499 6.77848 -0.0114049 6.69168 0.0282751L 5.64915 0.501955C 5.64884 0.501955 5.64884 0.502265 5.64853 0.502265L 3.28168 1.57797C 3.22619 1.60308 3.17938 1.6443 3.14714 1.69576L 0.0471422 6.65576C -0.0381078 6.79216 -0.00493781 6.97165 0.124022 7.06806L 2.60402 8.92806C 2.73453 9.02633 2.9196 9.00587 3.025 8.88187L 4.34002 7.34799L 4.34002 16.7401C 4.34002 16.9115 4.47859 17.0501 4.65002 17.0501L 13.95 17.0501C 14.1215 17.0501 14.26 16.9115 14.26 16.7401L 14.26 7.47726L 15.248 8.86017C 15.345 8.99595 15.5332 9.03067 15.6721 8.93798L 18.4621 7.07798C 18.6016 6.98498 18.6419 6.79805 18.5529 6.65576ZM 11.9995 0.750265L 12.3386 0.904335L 12.5739 1.01129L 13.2017 2.78975L 10.7493 2.78975C 11.2301 2.43232 11.7245 1.81511 11.9995 0.750265ZM 6.0258 1.0116L 6.60054 0.750265C 6.63805 0.895345 6.68021 1.0305 6.72516 1.15946C 6.74035 1.20286 6.75709 1.24223 6.77321 1.28377C 6.80483 1.36623 6.83676 1.44714 6.87086 1.52279C 6.89132 1.56773 6.9124 1.60989 6.93379 1.65236C 6.96634 1.71808 6.99982 1.78226 7.03423 1.84271C 7.05748 1.88363 7.08104 1.92331 7.10522 1.96206C 7.14025 2.01817 7.1759 2.07179 7.21248 2.12326C 7.23728 2.15859 7.26208 2.19393 7.2875 2.2271C 7.32594 2.27701 7.365 2.3232 7.40406 2.36846C 7.42855 2.39668 7.45242 2.42612 7.47691 2.45278C 7.52372 2.503 7.57115 2.54826 7.61858 2.59259C 7.64028 2.61274 7.66136 2.63413 7.68306 2.65304C 7.73917 2.70233 7.79559 2.74821 7.85201 2.79006L 5.39805 2.79006L 6.0258 1.0116ZM 13.64 16.4301L 4.96002 16.4301L 4.96002 15.5001L 13.64 15.5001L 13.64 16.4301ZM 13.64 14.8801L 4.96002 14.8801L 4.96002 14.5701L 13.64 14.5701L 13.64 14.8801ZM 15.5778 8.25567L 14.2021 6.32996C 14.1239 6.22021 13.9838 6.17402 13.8552 6.21494C 13.7271 6.25617 13.64 6.37552 13.64 6.51006L 13.64 13.9501L 4.96002 13.9501L 4.96002 6.51006C 4.96002 6.38017 4.87911 6.26423 4.75759 6.21929C 4.63545 6.17402 4.49905 6.20967 4.41504 6.30826L 2.74352 8.25784L 0.723562 6.74287L 3.6233 2.10341L 5.24243 1.36747L 4.66738 2.99683C 4.63421 3.092 4.64847 3.19709 4.70675 3.27893C 4.76503 3.36139 4.85958 3.41006 4.96002 3.41006L 9.30002 3.41006L 13.64 3.41006C 13.7405 3.41006 13.835 3.36139 13.893 3.27893C 13.9513 3.19678 13.9655 3.09169 13.9324 2.99683L 13.3573 1.36747L 14.9764 2.10341L 17.8675 6.72923L 15.5778 8.25567Z"></path><path id="e7084b01-cad4-48e1-8c98-404c7a56237d" d="M 4.34 1.705C 4.34 0.76508 3.57492 0 2.635 0L 1.705 0C 0.76508 0 0 0.76508 0 1.705C 0 2.2816 0.28861 2.79124 0.72788 3.1C 0.2883 3.40876 0 3.9184 0 4.495C 0 5.43492 0.76508 6.2 1.705 6.2L 2.635 6.2C 3.57492 6.2 4.34 5.43492 4.34 4.495C 4.34 3.9184 4.05139 3.40876 3.61212 3.1C 4.05139 2.79124 4.34 2.2816 4.34 1.705ZM 3.72 4.495C 3.72 5.0933 3.2333 5.58 2.635 5.58L 1.705 5.58C 1.1067 5.58 0.62 5.0933 0.62 4.495C 0.62 3.8967 1.1067 3.41 1.705 3.41L 2.635 3.41C 3.2333 3.41 3.72 3.8967 3.72 4.495ZM 2.635 2.79L 1.705 2.79C 1.1067 2.79 0.62 2.3033 0.62 1.705C 0.62 1.1067 1.1067 0.62 1.705 0.62L 2.635 0.62C 3.2333 0.62 3.72 1.1067 3.72 1.705C 3.72 2.3033 3.2333 2.79 2.635 2.79Z"></path></defs></svg> </span> </data-holder> </team-shirt-color> <component-separator></component-separator> <team-is-league-active> <label>聯賽</label> <data-holder> <span data>{my (\'is-league?\')}</span> </data-holder> </team-is-league-active> <component-separator></component-separator> </info-holder> </info-area> <info-area info="preferences"> <info-holder> <info-header>偏好</info-header> <component-separator></component-separator> <preferred-match-type> <label>人數</label> <data-holder> <span data>{my (\'preferred-match-type\')}</span> </data-holder> </preferred-match-type> <component-separator></component-separator> <preferred-pitch-type> <label>球場</label> <data-holder> <span data>真草//仿真草//人造草//石地</span> </data-holder> </preferred-pitch-type> <component-separator></component-separator> <preferred-day-of-week> <label>日期</label> <data-holder> <span data>星期六//星期日</span> </data-holder> </preferred-day-of-week> </info-holder> </info-area> </team-profile> </component-main-content> <component-tabs tab="teams"></component-tabs>', '', '', function(opts) {
(function (self, args, my, me) {

		self .establish (':load', function (reqs) {
			return 	reqs .thru (tap, function () {
						if (! my (':api') .teams)
							window .location .hash = '#login'
					})
		}) .establish (':unload', transient)

		self .findings (':load')
			.thru (filter, function () {
				return my (':api') .teams;
			}) .thru (tap, function () {
				my (':api') .teams .ask ();
				all_gotten (my (':api') .teams) .thru (takeUntil, next (self .findings (':unload')))
					.thru (tap, self .dialogue ('raw-teams') .ask);
			})

		self
			.remembers ('raw-teams')
			.establish ('team', viewpoint_of (
				(function () {
					var teams =	self .findings ('raw-teams')
									.thru (filter, function (res) {
										return res [0]
									})
					 				.thru (map, function (res) {
										return res [0]
									})
					 				.thru (map, function (team) {
										return 	{
													win_rate: 			win_rate (team .team_statistic .won, team .team_statistic .played_match) + '%',
													approve_number:			team .team_statistic .num_of_opponent_acceptance,
													opponent_number:		team .team_statistic .num_of_played_against_team,
													name: 					team .long_name,
													age_lower: 				team .age_group_lower,
													age_higher: 			team .age_group_upper,
													is_league: 			is_league (team .is_frequent_league_player),
													preferred_match_type: 	team .team_preference .match_type_list .map (num_of_players_to_text) .join ('//')
												}
									});

					return teams;
				}) ()
			))

		self
			.establish ('win-rate', dependent (function () {
				return (my ('team') || {}) .win_rate
			}, self .findings ('team')))
			.establish ('approve-number', dependent (function () {
				return (my ('team') || {}) .approve_number
			}, self .findings ('team')))
			.establish ('opponent-number', dependent (function () {
				return (my ('team') || {}) .opponent_number
			}, self .findings ('team')))
			.establish ('name', dependent (function () {
				return (my ('team') || {}) .name
			}, self .findings ('team')))
			.establish ('age-lower', dependent (function () {
				return (my ('team') || {}) .age_lower
			}, self .findings ('team')))
			.establish ('age-higher', dependent (function () {
				return (my ('team') || {}) .age_higher
			}, self .findings ('team')))
			.establish ('is-league?', dependent (function () {
				return (my ('team') || {}) .is_league
			}, self .findings ('team')))
			.establish ('preferred-match-type', dependent (function () {
				return (my ('team') || {}) .preferred_match_type
			}, self .findings ('team')))

		self .findings ('team') .thru (tap, self .render)

}) (this, opts, this .my, this .me);
});
riot.tag2('page-test-list', '<nav> <nav-title> <component-page-title page="建立球隊"></component-page-title> </nav-title> </nav> <component-main-content> <test-list> 接受球賽通知 <br>當球賽即將開始時，你願意接受球賽通知？ <component-tree-list-picker items__from=":test" items__to=":test"></component-tree-list-picker> </test-list> </component-main-content>', '', '', function(opts) {
(function (self, args, my, me) {

		self
			.remembers (':test', [
			    {
			        item: '香港',
			        list: ['中西區', '東區', '南區', '灣仔區']
			    },
			    {
			        item: '九龍',
			        list: ['深水埗區', '九龍城區', '觀塘區', '黃大仙區', '油尖旺區']
			    },
			    {
			        item: '新界',
			        list: ['離島區', '葵青區', '北區', '西貢區', '沙田區', '大埔區', '荃灣區', '屯門區', '元朗區']
			    }
			])

}) (this, opts, this .my, this .me);
});
riot.tag2('page-todo-choose', '<nav> <nav-buttons> <a href="#todos/check"> <component-back-button></component-back-button> </a> </nav-buttons> <nav-title> <component-page-title page="選擇對手"></component-page-title> </nav-title> </nav> <component-main-content> <choose-opponent> <info-area info="match"> <info-holder> <info-header data> 球賽 </info-header> <component-separator></component-separator> <match-date> <label> <svg width="16" height="15" viewbox="0 0 16 15" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:figma="http://www.figma.com/figma/ns"><title>Group</title><desc>Created using Figma</desc><g id="Canvas" transform="translate(1157 296)" figma:type="canvas"><g id="Group" style="mix-blend-mode:normal;" figma:type="frame"><g id="Vector" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#84ad6479-2db8-4c8a-a2bf-a12046b20303" transform="translate(-1156.52 -296)" fill="#1A5276" style="mix-blend-mode:normal;"></use></g><g id="Vector" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#96694655-9fe0-4957-9fa4-3de07b67134f" transform="translate(-1154.11 -290.25)" fill="#1A5276" style="mix-blend-mode:normal;"></use></g></g></g><defs><path id="84ad6479-2db8-4c8a-a2bf-a12046b20303" d="M 14.7321 1L 12.8571 1L 12.8571 0.25C 12.8571 0.11175 12.7374 0 12.5893 0L 10.7143 0C 10.5662 0 10.4464 0.11175 10.4464 0.25L 10.4464 1L 4.55357 1L 4.55357 0.25C 4.55357 0.11175 4.43384 0 4.28571 0L 2.41071 0C 2.26259 0 2.14286 0.11175 2.14286 0.25L 2.14286 1L 0.267857 1C 0.119732 1 0 1.11175 0 1.25L 0 4L 0 14.75C 0 14.8883 0.119732 15 0.267857 15L 14.7321 15C 14.8803 15 15 14.8883 15 14.75L 15 4L 15 1.25C 15 1.11175 14.8803 1 14.7321 1ZM 10.9821 0.5L 12.3214 0.5L 12.3214 1.25L 12.3214 2L 10.9821 2L 10.9821 1.25L 10.9821 0.5ZM 2.67857 0.5L 4.01786 0.5L 4.01786 1.25L 4.01786 2L 2.67857 2L 2.67857 1.25L 2.67857 0.5ZM 0.535714 1.5L 2.14286 1.5L 2.14286 2.25C 2.14286 2.38825 2.26259 2.5 2.41071 2.5L 4.28571 2.5C 4.43384 2.5 4.55357 2.38825 4.55357 2.25L 4.55357 1.5L 10.4464 1.5L 10.4464 2.25C 10.4464 2.38825 10.5662 2.5 10.7143 2.5L 12.5893 2.5C 12.7374 2.5 12.8571 2.38825 12.8571 2.25L 12.8571 1.5L 14.4643 1.5L 14.4643 3.75L 0.535714 3.75L 0.535714 1.5ZM 0.535714 14.5L 0.535714 4.25L 14.4643 4.25L 14.4643 14.5L 0.535714 14.5Z"></path><path id="96694655-9fe0-4957-9fa4-3de07b67134f" d="M 7.23214 0L 5.35714 0L 4.82143 0L 2.94643 0L 2.41071 0L 0 0L 0 2.25L 0 2.75L 0 4.5L 0 5L 0 7.25L 2.41071 7.25L 2.94643 7.25L 4.82143 7.25L 5.35714 7.25L 7.23214 7.25L 7.76786 7.25L 10.1786 7.25L 10.1786 5L 10.1786 4.5L 10.1786 2.75L 10.1786 2.25L 10.1786 0L 7.76786 0L 7.23214 0ZM 5.35714 0.5L 7.23214 0.5L 7.23214 2.25L 5.35714 2.25L 5.35714 0.5ZM 7.23214 4.5L 5.35714 4.5L 5.35714 2.75L 7.23214 2.75L 7.23214 4.5ZM 2.94643 2.75L 4.82143 2.75L 4.82143 4.5L 2.94643 4.5L 2.94643 2.75ZM 2.94643 0.5L 4.82143 0.5L 4.82143 2.25L 2.94643 2.25L 2.94643 0.5ZM 0.535714 0.5L 2.41071 0.5L 2.41071 2.25L 0.535714 2.25L 0.535714 0.5ZM 0.535714 2.75L 2.41071 2.75L 2.41071 4.5L 0.535714 4.5L 0.535714 2.75ZM 2.41071 6.75L 0.535714 6.75L 0.535714 5L 2.41071 5L 2.41071 6.75ZM 4.82143 6.75L 2.94643 6.75L 2.94643 5L 4.82143 5L 4.82143 6.75ZM 7.23214 6.75L 5.35714 6.75L 5.35714 5L 7.23214 5L 7.23214 6.75ZM 9.64286 6.75L 7.76786 6.75L 7.76786 5L 9.64286 5L 9.64286 6.75ZM 9.64286 4.5L 7.76786 4.5L 7.76786 2.75L 9.64286 2.75L 9.64286 4.5ZM 9.64286 0.5L 9.64286 2.25L 7.76786 2.25L 7.76786 0.5L 9.64286 0.5Z"></path></defs></svg> 日期 </label> <data-holder> <span data>{my (\'date\')}</span> </data-holder> </match-date> <component-separator></component-separator> <match-time> <label> <svg width="15" height="15" viewbox="0 0 15 15" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:figma="http://www.figma.com/figma/ns"><title>Group</title><desc>Created using Figma</desc><g id="Canvas" transform="translate(1157 267)" figma:type="canvas"><g id="Group" style="mix-blend-mode:normal;" figma:type="frame"><g id="Vector" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#e182a5c5-d7f4-48a7-a83e-7f5e09a4b64c" transform="translate(-1157 -267)" fill="#8E44AD" style="mix-blend-mode:normal;"></use></g><g id="Vector" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#2f493b0a-c7a8-4323-ae6f-91c03ef1cc52" transform="translate(-1153.88 -265.56)" fill="#8E44AD" style="mix-blend-mode:normal;"></use></g></g></g><defs><path id="e182a5c5-d7f4-48a7-a83e-7f5e09a4b64c" d="M 7.2 0C 3.22992 0 0 3.22992 0 7.2C 0 11.1701 3.22992 14.4 7.2 14.4C 11.1701 14.4 14.4 11.1701 14.4 7.2C 14.4 3.22992 11.1701 0 7.2 0ZM 7.2 13.92C 3.49464 13.92 0.48 10.9054 0.48 7.2C 0.48 3.49464 3.49464 0.48 7.2 0.48C 10.9054 0.48 13.92 3.49464 13.92 7.2C 13.92 10.9054 10.9054 13.92 7.2 13.92Z"></path><path id="2f493b0a-c7a8-4323-ae6f-91c03ef1cc52" d="M 4.08 0C 3.94752 0 3.84 0.10728 3.84 0.24L 3.84 5.76L 0.24 5.76C 0.10752 5.76 0 5.86728 0 6C 0 6.13272 0.10752 6.24 0.24 6.24L 4.08 6.24C 4.21248 6.24 4.32 6.13272 4.32 6L 4.32 0.24C 4.32 0.10728 4.21248 0 4.08 0Z"></path></defs></svg> 時間 </label> <data-holder> <span data>{my (\'times\')}</span> </data-holder> </match-time> <component-separator></component-separator> <match-location> <label> <svg width="14" height="19" viewbox="0 0 14 19" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:figma="http://www.figma.com/figma/ns"><title>placeholder</title><desc>Created using Figma</desc><g id="Canvas" transform="translate(1156 240)" figma:type="canvas"><g id="placeholder" style="mix-blend-mode:normal;" figma:type="frame"><g id="Vector" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#63932ca2-69f6-4206-8065-36e54db2dad2" transform="translate(-1155.88 -240)" fill="#EE3840" style="mix-blend-mode:normal;"></use></g></g></g><defs><path id="63932ca2-69f6-4206-8065-36e54db2dad2" d="M 11.238 1.94151C 8.66733 -0.647169 4.49916 -0.647169 1.92814 1.94151C -0.388274 4.27416 -0.649034 8.6663 1.31681 11.3057L 6.58307 18.9645L 11.8493 11.3057C 13.8152 8.6663 13.5544 4.27416 11.238 1.94151ZM 6.64717 8.75274C 5.44695 8.75274 4.47417 7.77314 4.47417 6.56451C 4.47417 5.35588 5.44695 4.37628 6.64717 4.37628C 7.84739 4.37628 8.82017 5.35588 8.82017 6.56451C 8.82017 7.77314 7.84739 8.75274 6.64717 8.75274Z"></path></defs></svg> 地點 </label> <data-holder> <span data>{my (\'location\')}</span> </data-holder> </match-location> <component-separator></component-separator> <match-type> <label> <svg width="14" height="18" viewbox="0 0 14 18" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:figma="http://www.figma.com/figma/ns"><title>soccer-field</title><desc>Created using Figma</desc><g id="Canvas" transform="translate(1157 208)" figma:type="canvas"><g id="soccer-field" style="mix-blend-mode:normal;" figma:type="frame"><g id="Soccer-field 1" style="mix-blend-mode:normal;" figma:type="frame"><g id="Soccer-field" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#62b9d1df-7938-4819-a4b7-65740c8bf388" transform="translate(-1156.76 -208)" fill="#1D8348" style="mix-blend-mode:normal;"></use></g></g></g></g><defs><path id="62b9d1df-7938-4819-a4b7-65740c8bf388" d="M 13.16 0L 0.28 0C 0.12544 0 0 0.12096 0 0.27L 0 17.01C 0 17.159 0.12544 17.28 0.28 17.28L 13.16 17.28C 13.3148 17.28 13.44 17.159 13.44 17.01L 13.44 0.27C 13.44 0.12096 13.3148 0 13.16 0ZM 7.42 2.67759C 7.42 3.02481 7.10612 3.3075 6.72 3.3075C 6.33388 3.3075 6.02 3.02508 6.02 2.67759C 6.02 2.61657 6.0298 2.55582 6.04912 2.4975L 7.3906 2.4975C 7.4102 2.55582 7.42 2.61657 7.42 2.67759ZM 4.88292 1.8981L 4.88292 0.5481L 8.55708 0.5481L 8.55708 1.8981L 4.88292 1.8981ZM 4.32292 0.54L 4.32292 2.1681C 4.32292 2.31714 4.44808 2.4381 4.60292 2.4381L 5.4894 2.4381C 5.47176 2.51694 5.46 2.59686 5.46 2.67759C 5.46 3.32262 6.02504 3.8475 6.72 3.8475C 7.41468 3.8475 7.98 3.32289 7.98 2.67759C 7.98 2.59659 7.96824 2.51667 7.9506 2.4381L 8.83736 2.4381C 8.9922 2.4381 9.11736 2.31714 9.11736 2.1681L 9.11736 0.54L 12.88 0.54L 12.88 8.16588L 9.50572 8.16588C 9.36488 6.80346 8.16928 5.73588 6.72 5.73588C 5.27072 5.73588 4.07512 6.80346 3.93428 8.16588L 0.56 8.16588L 0.56 0.54L 4.32292 0.54ZM 4.49932 8.16588C 4.63792 7.10208 5.57984 6.27588 6.72 6.27588C 7.86016 6.27588 8.80208 7.10208 8.94068 8.16588L 4.49932 8.16588ZM 8.94068 8.70588C 8.80208 9.76968 7.86016 10.5959 6.72 10.5959C 5.57984 10.5959 4.63792 9.76968 4.49932 8.70588L 8.94068 8.70588ZM 6.02 14.5349C 6.02 14.1877 6.33388 13.905 6.72 13.905C 7.10612 13.905 7.42 14.1874 7.42 14.5349C 7.42 14.5959 7.4102 14.6567 7.39088 14.715L 6.0494 14.715C 6.0298 14.6567 6.02 14.5959 6.02 14.5349ZM 8.55736 15.3144L 8.55736 16.6644L 4.88292 16.6644L 4.88292 15.3144L 8.55736 15.3144ZM 9.11736 16.74L 9.11736 15.0444C 9.11736 14.8954 8.9922 14.7744 8.83736 14.7744L 7.9506 14.7744C 7.96824 14.6956 7.98 14.6159 7.98 14.5349C 7.98 13.8899 7.41468 13.365 6.72 13.365C 6.02504 13.365 5.46 13.8896 5.46 14.5349C 5.46 14.6159 5.47176 14.6958 5.4894 14.7744L 4.60292 14.7744C 4.44808 14.7744 4.32292 14.8954 4.32292 15.0444L 4.32292 16.74L 0.56 16.74L 0.56 8.70588L 3.93428 8.70588C 4.07512 10.0683 5.27072 11.1359 6.72 11.1359C 8.16928 11.1359 9.36488 10.0683 9.50572 8.70588L 12.88 8.70588L 12.88 16.74L 9.11736 16.74Z"></path></defs></svg> 場地 </label> <data-holder> <span data>{my (\'match-type\')}</span> </data-holder> </match-type> <component-separator></component-separator> <match-fee> <label> <svg width="14" height="16" viewbox="0 0 8 16" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:figma="http://www.figma.com/figma/ns"><title>$</title><desc>Created using Figma</desc><g id="Canvas" transform="translate(1155 179)" figma:type="canvas"><g id="$" style="mix-blend-mode:normal;" figma:type="text"><use xlink:href="#55dbad54-3561-454e-9acb-ce7a9745b561" transform="translate(-1155.15 -179)" fill="#B7950B" style="mix-blend-mode:normal;"></use></g></g><defs><path id="55dbad54-3561-454e-9acb-ce7a9745b561" d="M 6.36719 11.2773C 6.36719 10.8086 6.20052 10.4102 5.86719 10.082C 5.53906 9.7487 4.99219 9.45182 4.22656 9.19141C 3.17448 8.8737 2.38021 8.44922 1.84375 7.91797C 1.30729 7.38672 1.03906 6.67839 1.03906 5.79297C 1.03906 4.93359 1.28646 4.23307 1.78125 3.69141C 2.27604 3.14974 2.95573 2.82422 3.82031 2.71484L 3.82031 0.988281L 5.05469 0.988281L 5.05469 2.72266C 5.92448 2.84766 6.59896 3.22266 7.07812 3.84766C 7.5625 4.46745 7.80469 5.30078 7.80469 6.34766L 6.27344 6.34766C 6.27344 5.63932 6.10938 5.06641 5.78125 4.62891C 5.45833 4.19141 5.00521 3.97266 4.42188 3.97266C 3.80729 3.97266 3.34635 4.13411 3.03906 4.45703C 2.73177 4.77474 2.57812 5.21224 2.57812 5.76953C 2.57812 6.27474 2.73698 6.68359 3.05469 6.99609C 3.3724 7.30859 3.94271 7.60547 4.76562 7.88672C 5.82812 8.23047 6.61719 8.66016 7.13281 9.17578C 7.64844 9.6862 7.90625 10.3815 7.90625 11.2617C 7.90625 12.1576 7.63802 12.8711 7.10156 13.4023C 6.5651 13.9336 5.82812 14.2487 4.89062 14.3477L 4.89062 15.8398L 3.67188 15.8398L 3.67188 14.3477C 2.77604 14.2539 2.04167 13.9284 1.46875 13.3711C 0.895833 12.8086 0.619792 11.9857 0.640625 10.9023L 0.65625 10.8633L 2.14062 10.8633C 2.14062 11.6654 2.34115 12.2383 2.74219 12.582C 3.14844 12.9206 3.64583 13.0898 4.23438 13.0898C 4.90625 13.0898 5.42969 12.931 5.80469 12.6133C 6.17969 12.2904 6.36719 11.8451 6.36719 11.2773Z"></path></defs></svg> 費用 <small>每隊</small> </label> <data-holder> <span data>{my (\'fee\')}</span> </data-holder> </match-fee> <component-separator></component-separator> <match-tags> <tags> <tag>聯賽</tag> <tag>競爭性</tag> </tags> </match-tags> <component-separator></component-separator> </info-holder> </info-area> <info-area info="choices"> <info-holder> <info-header data> {my (\'apply-number\')}隊報名 </info-header> <separator></separator> </info-area> <component-choose-opponent-item></component-choose-opponent-item> <component-choose-opponent-item></component-choose-opponent-item> <component-choose-opponent-item></component-choose-opponent-item> </choose-opponent> </component-main-content> <component-tabs tab="todos"></component-tabs>', '', '', function(opts) {
(function (self, args, my, me) {

		self .establish (':load', function (reqs) {
			return 	reqs .thru (tap, function () {
						if (! my (':api') .match_to_find_info)
							window .location .hash = '#login'
					})
		}) .establish (':unload', transient)

		self .findings (':load')
			.thru (filter, function () {
				return my (':api') .match_to_find_info;
			})
			.thru (tap, function () {
				var api = my (':api') .match_to_find_info (parse (args .params [0]))
				api .ask ();
				all_gotten (api) .thru (takeUntil, next (self .findings (':unload')))
					.thru (tap, self .dialogue ('raw-match-info') .ask);

				my (':api') .teams .ask ();
				gotten (my (':api') .teams) .then (function (teams) {
					return teams [0] .id;
				}) .then (function (team_id) {
					var api = my (':api') .match_applications (team_id, parse (args .params [0]))
					api .ask ();
					all_gotten (api) .thru (takeUntil, next (self .findings (':unload')))
						.thru (tap, self .dialogue ('raw-applications-info') .ask);
				})
			})

		self
			.remembers ('raw-match-info')
			.remembers ('raw-applications-info');
		self .findings ('raw-match-info') .thru (tap, self .render);
		self .findings ('raw-applications-info') .thru (tap, self .render);

		self
			.establish ('date', dependent (function () {

				if (my ('raw-match-info')) {
					var date_time = new Date (my ('raw-match-info') .start_at);
					return date_to_chi (date_time) + ' ' + day_of_week_to_chi (date_time);
				}
			}, self .findings ('raw-match-info')))
			.establish ('times', dependent (function () {

				if (my ('raw-match-info')) {
					var duration = my ('raw-match-info') .duration;

					var start_date_time = new Date (my ('raw-match-info') .start_at)
					var end_date_time = new Date (start_date_time .getTime () + duration * 60000);

					return times (start_date_time, end_date_time)
				}
			}, self .findings ('raw-match-info')))
			.establish ('location', dependent (function () {

				if (my ('raw-match-info'))
					return location_from_api (my ('raw-match-info') .location)
			}, self .findings ('raw-match-info')))
			.establish ('match-type', dependent (function () {

				if (my ('raw-match-info'))
					return num_of_players_to_text (my ('raw-match-info') .match_type_value) + ' - ' + pitch_type_to_chi (my ('raw-match-info') .pitch_type);
			}, self .findings ('raw-match-info')))
			.establish ('fee', dependent (function () {

				if (my ('raw-match-info'))
					return fee_to_chi (my ('raw-match-info') .fee_per_team);
			}, self .findings ('raw-match-info')))

			.establish ('apply-number', dependent (function () {

				if (my ('raw-applications-info'))
					return my ('raw-applications-info') .length;
			}, self .findings ('raw-applications-info')))

}) (this, opts, this .my, this .me);
});
riot.tag2('page-todo-followup', '<nav> <nav-title> <component-page-title page="輸入比數"></component-page-title> </nav-title> </nav> <component-main-content> <match-followup> <info-graphic> <score-control> <label row> <home-team-label> <label>主隊</label> <team-name active>Happy Footbro FC</team-name> </home-team-label> <away-team-label> <label>客隊</label> <team-name>九西之友</team-name> </away-team-label> </label> <control-holder row> <image-holder size="128x128"> <score-input> <input placeholder="0" type="number"> </score-input> </image-holder> <versus>:</versus> <image-holder size="128x128"> <score-input> <input placeholder="0" type="number"> </score-input> </image-holder> </control-holder> </score-control> </info-graphic> <info-area info="general"> <info-holder> <component-separator></component-separator> <match-date> <label> <svg width="16" height="15" viewbox="0 0 16 15" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:figma="http://www.figma.com/figma/ns"><title>Group</title><desc>Created using Figma</desc><g id="Canvas" transform="translate(1157 296)" figma:type="canvas"><g id="Group" style="mix-blend-mode:normal;" figma:type="frame"><g id="Vector" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#84ad6479-2db8-4c8a-a2bf-a12046b20303" transform="translate(-1156.52 -296)" fill="#1A5276" style="mix-blend-mode:normal;"></use></g><g id="Vector" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#96694655-9fe0-4957-9fa4-3de07b67134f" transform="translate(-1154.11 -290.25)" fill="#1A5276" style="mix-blend-mode:normal;"></use></g></g></g><defs><path id="84ad6479-2db8-4c8a-a2bf-a12046b20303" d="M 14.7321 1L 12.8571 1L 12.8571 0.25C 12.8571 0.11175 12.7374 0 12.5893 0L 10.7143 0C 10.5662 0 10.4464 0.11175 10.4464 0.25L 10.4464 1L 4.55357 1L 4.55357 0.25C 4.55357 0.11175 4.43384 0 4.28571 0L 2.41071 0C 2.26259 0 2.14286 0.11175 2.14286 0.25L 2.14286 1L 0.267857 1C 0.119732 1 0 1.11175 0 1.25L 0 4L 0 14.75C 0 14.8883 0.119732 15 0.267857 15L 14.7321 15C 14.8803 15 15 14.8883 15 14.75L 15 4L 15 1.25C 15 1.11175 14.8803 1 14.7321 1ZM 10.9821 0.5L 12.3214 0.5L 12.3214 1.25L 12.3214 2L 10.9821 2L 10.9821 1.25L 10.9821 0.5ZM 2.67857 0.5L 4.01786 0.5L 4.01786 1.25L 4.01786 2L 2.67857 2L 2.67857 1.25L 2.67857 0.5ZM 0.535714 1.5L 2.14286 1.5L 2.14286 2.25C 2.14286 2.38825 2.26259 2.5 2.41071 2.5L 4.28571 2.5C 4.43384 2.5 4.55357 2.38825 4.55357 2.25L 4.55357 1.5L 10.4464 1.5L 10.4464 2.25C 10.4464 2.38825 10.5662 2.5 10.7143 2.5L 12.5893 2.5C 12.7374 2.5 12.8571 2.38825 12.8571 2.25L 12.8571 1.5L 14.4643 1.5L 14.4643 3.75L 0.535714 3.75L 0.535714 1.5ZM 0.535714 14.5L 0.535714 4.25L 14.4643 4.25L 14.4643 14.5L 0.535714 14.5Z"></path><path id="96694655-9fe0-4957-9fa4-3de07b67134f" d="M 7.23214 0L 5.35714 0L 4.82143 0L 2.94643 0L 2.41071 0L 0 0L 0 2.25L 0 2.75L 0 4.5L 0 5L 0 7.25L 2.41071 7.25L 2.94643 7.25L 4.82143 7.25L 5.35714 7.25L 7.23214 7.25L 7.76786 7.25L 10.1786 7.25L 10.1786 5L 10.1786 4.5L 10.1786 2.75L 10.1786 2.25L 10.1786 0L 7.76786 0L 7.23214 0ZM 5.35714 0.5L 7.23214 0.5L 7.23214 2.25L 5.35714 2.25L 5.35714 0.5ZM 7.23214 4.5L 5.35714 4.5L 5.35714 2.75L 7.23214 2.75L 7.23214 4.5ZM 2.94643 2.75L 4.82143 2.75L 4.82143 4.5L 2.94643 4.5L 2.94643 2.75ZM 2.94643 0.5L 4.82143 0.5L 4.82143 2.25L 2.94643 2.25L 2.94643 0.5ZM 0.535714 0.5L 2.41071 0.5L 2.41071 2.25L 0.535714 2.25L 0.535714 0.5ZM 0.535714 2.75L 2.41071 2.75L 2.41071 4.5L 0.535714 4.5L 0.535714 2.75ZM 2.41071 6.75L 0.535714 6.75L 0.535714 5L 2.41071 5L 2.41071 6.75ZM 4.82143 6.75L 2.94643 6.75L 2.94643 5L 4.82143 5L 4.82143 6.75ZM 7.23214 6.75L 5.35714 6.75L 5.35714 5L 7.23214 5L 7.23214 6.75ZM 9.64286 6.75L 7.76786 6.75L 7.76786 5L 9.64286 5L 9.64286 6.75ZM 9.64286 4.5L 7.76786 4.5L 7.76786 2.75L 9.64286 2.75L 9.64286 4.5ZM 9.64286 0.5L 9.64286 2.25L 7.76786 2.25L 7.76786 0.5L 9.64286 0.5Z"></path></defs></svg> 日期 </label> <data-holder> <span data>2016年12月14日 星期三</span> </data-holder> </match-date> <component-separator></component-separator> <match-time> <label> <svg width="15" height="15" viewbox="0 0 15 15" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:figma="http://www.figma.com/figma/ns"><title>Group</title><desc>Created using Figma</desc><g id="Canvas" transform="translate(1157 267)" figma:type="canvas"><g id="Group" style="mix-blend-mode:normal;" figma:type="frame"><g id="Vector" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#e182a5c5-d7f4-48a7-a83e-7f5e09a4b64c" transform="translate(-1157 -267)" fill="#8E44AD" style="mix-blend-mode:normal;"></use></g><g id="Vector" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#2f493b0a-c7a8-4323-ae6f-91c03ef1cc52" transform="translate(-1153.88 -265.56)" fill="#8E44AD" style="mix-blend-mode:normal;"></use></g></g></g><defs><path id="e182a5c5-d7f4-48a7-a83e-7f5e09a4b64c" d="M 7.2 0C 3.22992 0 0 3.22992 0 7.2C 0 11.1701 3.22992 14.4 7.2 14.4C 11.1701 14.4 14.4 11.1701 14.4 7.2C 14.4 3.22992 11.1701 0 7.2 0ZM 7.2 13.92C 3.49464 13.92 0.48 10.9054 0.48 7.2C 0.48 3.49464 3.49464 0.48 7.2 0.48C 10.9054 0.48 13.92 3.49464 13.92 7.2C 13.92 10.9054 10.9054 13.92 7.2 13.92Z"></path><path id="2f493b0a-c7a8-4323-ae6f-91c03ef1cc52" d="M 4.08 0C 3.94752 0 3.84 0.10728 3.84 0.24L 3.84 5.76L 0.24 5.76C 0.10752 5.76 0 5.86728 0 6C 0 6.13272 0.10752 6.24 0.24 6.24L 4.08 6.24C 4.21248 6.24 4.32 6.13272 4.32 6L 4.32 0.24C 4.32 0.10728 4.21248 0 4.08 0Z"></path></defs></svg> 時間 </label> <data-holder> <span data>9:00pm - 10:00pm</span> </data-holder> </match-time> <component-separator></component-separator> <match-location> <label> <svg width="14" height="19" viewbox="0 0 14 19" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:figma="http://www.figma.com/figma/ns"><title>placeholder</title><desc>Created using Figma</desc><g id="Canvas" transform="translate(1156 240)" figma:type="canvas"><g id="placeholder" style="mix-blend-mode:normal;" figma:type="frame"><g id="Vector" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#63932ca2-69f6-4206-8065-36e54db2dad2" transform="translate(-1155.88 -240)" fill="#EE3840" style="mix-blend-mode:normal;"></use></g></g></g><defs><path id="63932ca2-69f6-4206-8065-36e54db2dad2" d="M 11.238 1.94151C 8.66733 -0.647169 4.49916 -0.647169 1.92814 1.94151C -0.388274 4.27416 -0.649034 8.6663 1.31681 11.3057L 6.58307 18.9645L 11.8493 11.3057C 13.8152 8.6663 13.5544 4.27416 11.238 1.94151ZM 6.64717 8.75274C 5.44695 8.75274 4.47417 7.77314 4.47417 6.56451C 4.47417 5.35588 5.44695 4.37628 6.64717 4.37628C 7.84739 4.37628 8.82017 5.35588 8.82017 6.56451C 8.82017 7.77314 7.84739 8.75274 6.64717 8.75274Z"></path></defs></svg> 地點 </label> <data-holder> <span data>跑馬地7號場</span> </data-holder> </match-location> <component-separator></component-separator> </info-holder> </info-area> <info-graphic> <opponent-rating row> <like active> <svg width="27" height="28" viewbox="0 0 27 28" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:figma="http://www.figma.com/figma/ns"><title>Group</title><desc>Created using Figma</desc><g id="Canvas" transform="translate(1340 -5)" figma:type="canvas"><g id="Group" style="mix-blend-mode:normal;" figma:type="frame"><g id="like" style="mix-blend-mode:normal;" figma:type="frame"><g id="Group" style="mix-blend-mode:normal;" figma:type="frame"><g id="Group" style="mix-blend-mode:normal;" figma:type="frame"><g id="XMLID 1929" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#004cd4b8-c756-488b-9772-e256f127953b" transform="translate(-1339.49 16.7686)" fill="#3C92CA" style="mix-blend-mode:normal;"></use></g><g id="Vector" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#576b6ba1-560d-405c-aa20-a4ec0702e1ab" transform="translate(-1340 5.5)" fill="#FFFFFF" style="mix-blend-mode:normal;"></use><use xlink:href="#7bf3e937-4340-4f22-8d0a-6f1c14164da8" transform="translate(-1340 5.5)" fill="#FFFFFF" style="mix-blend-mode:normal;"></use></g><g id="Vector" style="mix-blend-mode:normal; fill: #555;" figma:type="vector"><use xlink:href="#1ed19ef4-81e7-4093-9f1d-b918781f9f6b" transform="translate(-1340 5.5)" style="mix-blend-mode:normal;"></use></g></g></g></g></g></g><defs><path id="004cd4b8-c756-488b-9772-e256f127953b" d="M 5.5834 14.7633L 0.217101 14.7633C 0.100201 14.7633 2.12353e-08 14.6596 2.12353e-08 14.5386L 2.12353e-08 0.224734C 2.12353e-08 0.103723 0.100201 2.11026e-08 0.217101 2.11026e-08L 5.5834 2.11026e-08C 5.7003 2.11026e-08 5.8005 0.103723 5.8005 0.224734L 5.8005 14.5386C 5.8005 14.6596 5.70586 14.7633 5.5834 14.7633Z"></path><path id="576b6ba1-560d-405c-aa20-a4ec0702e1ab" d="M 15.8428 0.700382C 14.273 -0.492437 12.102 0.19329 12.0129 0.222102C 11.8014 0.291251 11.6622 0.492935 11.6622 0.717669L 11.6622 5.66181C 11.6622 7.33867 10.894 8.75622 9.37432 9.87989C 8.19974 10.75 6.99734 11.1073 6.9862 11.113C 6.97507 11.113 6.9695 11.1188 6.95837 11.1246L 6.67447 11.2225C 6.50747 10.9402 6.21243 10.75 5.8673 10.75L 0.940772 10.75C 0.423069 10.75 0 11.188 0 11.7239L 0 25.5824C 0 26.1184 0.423069 26.5563 0.940772 26.5563L 5.87286 26.5563C 6.3182 26.5563 6.69117 26.2336 6.7858 25.8072C 7.44824 26.539 8.38901 27 9.43555 27L 21.1145 27C 23.5972 27 25.1837 25.6574 25.4621 23.3121L 26.9539 13.5044C 27.171 12.0811 26.6088 10.6405 25.5177 9.83379C 24.8998 9.3728 24.1706 9.13078 23.408 9.13078L 17.3347 9.13078L 17.3347 4.54391C 17.3347 2.74604 16.8337 1.45526 15.8428 0.700382ZM 5.8005 25.5075L 1.00757 25.5075L 1.00757 11.793L 5.8005 11.793L 5.8005 25.5075ZM 23.408 10.1738C 23.9591 10.1738 24.4823 10.3466 24.9277 10.6809C 25.707 11.2629 26.1134 12.3059 25.9519 13.3431L 24.4656 23.1565C 24.4656 23.1622 24.4656 23.168 24.4656 23.1738C 24.1929 25.4672 22.495 25.9512 21.1145 25.9512L 9.43555 25.9512C 7.98821 25.9512 6.81364 24.7354 6.81364 23.2372L 6.81364 12.2771L 7.27567 12.1157C 7.43711 12.0696 8.67848 11.6778 9.93655 10.75C 11.7235 9.43619 12.6698 7.67865 12.6698 5.66757L 12.6698 1.13832C 13.2487 1.02308 14.4122 0.907828 15.2527 1.54746C 15.9653 2.08912 16.3271 3.09754 16.3271 4.54391L 16.3271 9.65516C 16.3271 9.94328 16.5554 10.1795 16.8337 10.1795L 23.408 10.1795L 23.408 10.1738Z"></path><path id="7bf3e937-4340-4f22-8d0a-6f1c14164da8" d="M 23.408 10.1738C 23.9591 10.1738 24.4823 10.3466 24.9277 10.6809C 25.707 11.2629 26.1134 12.3059 25.9519 13.3431L 24.4656 23.1565L 24.4656 23.1738C 24.1929 25.4672 22.495 25.9512 21.1145 25.9512L 9.43555 25.9512C 7.98821 25.9512 6.81364 24.7354 6.81364 23.2372L 6.81364 12.2771L 7.27567 12.1157C 7.43711 12.0696 8.67848 11.6778 9.93655 10.75C 11.7235 9.43619 12.6698 7.67865 12.6698 5.66757L 12.6698 1.13832C 13.2487 1.02308 14.4122 0.907828 15.2527 1.54746C 15.9653 2.08912 16.3271 3.09754 16.3271 4.54391L 16.3271 9.65516C 16.3271 9.94328 16.5554 10.1795 16.8337 10.1795L 23.408 10.1795L 23.408 10.1738Z"></path><path id="1ed19ef4-81e7-4093-9f1d-b918781f9f6b" d="M 15.8428 0.700382C 14.273 -0.492437 12.102 0.19329 12.0129 0.222102C 11.8014 0.291251 11.6622 0.492935 11.6622 0.717669L 11.6622 5.66181C 11.6622 7.33867 10.894 8.75622 9.37432 9.87989C 8.19974 10.75 6.99734 11.1073 6.9862 11.113C 6.97507 11.113 6.9695 11.1188 6.95837 11.1246L 6.67447 11.2225C 6.50747 10.9402 6.21243 10.75 5.8673 10.75L 0.940772 10.75C 0.423069 10.75 0 11.188 0 11.7239L 0 25.5824C 0 26.1184 0.423069 26.5563 0.940772 26.5563L 5.87286 26.5563C 6.3182 26.5563 6.69117 26.2336 6.7858 25.8072C 7.44824 26.539 8.38901 27 9.43555 27L 21.1145 27C 23.5972 27 25.1837 25.6574 25.4621 23.3121L 26.9539 13.5044C 27.171 12.0811 26.6088 10.6405 25.5177 9.83379C 24.8998 9.3728 24.1706 9.13078 23.408 9.13078L 17.3347 9.13078L 17.3347 4.54391C 17.3347 2.74604 16.8337 1.45526 15.8428 0.700382ZM 5.8005 25.5075L 1.00757 25.5075L 1.00757 11.793L 5.8005 11.793L 5.8005 25.5075ZM 23.408 10.1738C 23.9591 10.1738 24.4823 10.3466 24.9277 10.6809C 25.707 11.2629 26.1134 12.3059 25.9519 13.3431L 24.4656 23.1565C 24.4656 23.1622 24.4656 23.168 24.4656 23.1738C 24.1929 25.4672 22.495 25.9512 21.1145 25.9512L 9.43555 25.9512C 7.98821 25.9512 6.81364 24.7354 6.81364 23.2372L 6.81364 12.2771L 7.27567 12.1157C 7.43711 12.0696 8.67848 11.6778 9.93655 10.75C 11.7235 9.43619 12.6698 7.67865 12.6698 5.66757L 12.6698 1.13832C 13.2487 1.02308 14.4122 0.907828 15.2527 1.54746C 15.9653 2.08912 16.3271 3.09754 16.3271 4.54391L 16.3271 9.65516C 16.3271 9.94328 16.5554 10.1795 16.8337 10.1795L 23.408 10.1795L 23.408 10.1738Z"></path></defs></svg> </like> <dislike> <svg width="27" height="28" viewbox="0 0 27 28" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:figma="http://www.figma.com/figma/ns"><title>dislike</title><desc>Created using Figma</desc><g id="Canvas" transform="translate(1195 -7)" figma:type="canvas"><g id="dislike" style="mix-blend-mode:normal;" figma:type="frame"><g id="Group" style="mix-blend-mode:normal;" figma:type="frame"><g id="Group" style="mix-blend-mode:normal;" figma:type="frame"><g id="XMLID 113" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#b0954f75-0245-4d8f-aa38-c3abf4eb2a89" transform="translate(-1174.31 8.46819)" fill="#E04524" style="mix-blend-mode:normal;"></use></g><g id="Vector" style="mix-blend-mode:normal;" figma:type="vector"><use xlink:href="#f122cc3f-876e-433d-b765-60701ff102a9" transform="translate(-1195 7.5)" fill="#FFFFFF" style="mix-blend-mode:normal;"></use><use xlink:href="#65e3d0a7-c4b7-45e8-9417-5624aa88ec40" transform="translate(-1195 7.5)" fill="#FFFFFF" style="mix-blend-mode:normal;"></use></g><g id="Vector" style="mix-blend-mode:normal; fill: #555;" figma:type="vector"><use xlink:href="#76a250b1-a950-48ec-8d05-e5afb0686bed" transform="translate(-1195 7.5)" style="mix-blend-mode:normal;"></use></g></g></g></g></g><defs><path id="b0954f75-0245-4d8f-aa38-c3abf4eb2a89" d="M 0.217102 -4.74863e-08L 5.5834 -4.74863e-08C 5.7003 -4.74863e-08 5.8005 0.103735 5.8005 0.22476L 5.8005 14.5402C 5.8005 14.6613 5.7003 14.765 5.5834 14.765L 0.217102 14.765C 0.100201 14.765 -5.70804e-07 14.6613 -5.70804e-07 14.5402L -5.70804e-07 0.22476C -5.70804e-07 0.103735 0.0946346 -4.74863e-08 0.217102 -4.74863e-08Z"></path><path id="f122cc3f-876e-433d-b765-60701ff102a9" d="M 11.1572 26.3027C 11.8809 26.8502 12.727 27 13.4451 27C 14.2857 27 14.937 26.7925 14.9871 26.7752C 15.1986 26.7061 15.3378 26.5044 15.3378 26.2796L 15.3378 21.3407C 15.3378 19.6636 16.106 18.2459 17.6257 17.1221C 18.8003 16.2519 20.0027 15.8946 20.0138 15.8888C 20.0249 15.8888 20.0305 15.883 20.0416 15.8773L 20.3255 15.7793C 20.4925 16.0617 20.7876 16.2519 21.1327 16.2519L 26.0592 16.2519C 26.5769 16.2519 27 15.8139 27 15.2779L 27 1.41772C 27 0.88175 26.5769 0.443757 26.0592 0.443757L 21.1271 0.443757C 20.6818 0.443757 20.3088 0.766489 20.2142 1.19296C 19.5518 0.461046 18.611 0 17.5645 0L 5.88552 0C 3.40278 0 1.81627 1.3428 1.53793 3.68837L 0.0460593 13.4971C -0.171042 14.9206 0.391194 16.3614 1.48227 17.1682C 2.10017 17.6292 2.82941 17.8713 3.59204 17.8713L 9.66531 17.8713L 9.66531 22.4587C 9.66531 24.2568 10.1663 25.5477 11.1572 26.3027ZM 21.1995 1.49264L 25.9924 1.49264L 25.9924 15.2145L 21.1995 15.2145L 21.1995 1.49264ZM 3.59204 16.8282C 3.04094 16.8282 2.51767 16.6553 2.07234 16.321C 1.293 15.739 0.88663 14.6958 1.04806 13.6585L 2.53437 3.84397C 2.53437 3.83821 2.53437 3.83244 2.53437 3.82668C 2.80714 1.53298 4.50498 1.04888 5.88552 1.04888L 17.5645 1.04888C 19.0118 1.04888 20.1864 2.26489 20.1864 3.76329L 20.1864 14.7247L 19.7243 14.886C 19.5629 14.9321 18.3215 15.324 17.0634 16.2519C 15.2765 17.5658 14.3302 19.3236 14.3302 21.3349L 14.3302 25.8647C 13.7568 25.9799 12.599 26.101 11.7528 25.4555C 11.0403 24.9138 10.6784 23.9052 10.6784 22.4587L 10.6784 17.3469C 10.6784 17.0587 10.4502 16.8224 10.1719 16.8224L 3.59204 16.8224L 3.59204 16.8282Z"></path><path id="65e3d0a7-c4b7-45e8-9417-5624aa88ec40" d="M 3.59204 16.8282C 3.04094 16.8282 2.51767 16.6553 2.07234 16.321C 1.293 15.739 0.88663 14.6958 1.04806 13.6585L 2.53437 3.84397L 2.53437 3.82668C 2.80714 1.53298 4.50498 1.04888 5.88552 1.04888L 17.5645 1.04888C 19.0118 1.04888 20.1864 2.26489 20.1864 3.76329L 20.1864 14.7247L 19.7243 14.886C 19.5629 14.9321 18.3215 15.324 17.0634 16.2519C 15.2765 17.5658 14.3302 19.3236 14.3302 21.3349L 14.3302 25.8647C 13.7568 25.9799 12.599 26.101 11.7528 25.4555C 11.0403 24.9138 10.6784 23.9052 10.6784 22.4587L 10.6784 17.3469C 10.6784 17.0587 10.4502 16.8224 10.1719 16.8224L 3.59204 16.8224L 3.59204 16.8282Z"></path><path id="76a250b1-a950-48ec-8d05-e5afb0686bed" d="M 11.1572 26.3027C 11.8809 26.8502 12.727 27 13.4451 27C 14.2857 27 14.937 26.7925 14.9871 26.7752C 15.1986 26.7061 15.3378 26.5044 15.3378 26.2796L 15.3378 21.3407C 15.3378 19.6636 16.106 18.2459 17.6257 17.1221C 18.8003 16.2519 20.0027 15.8946 20.0138 15.8888C 20.0249 15.8888 20.0305 15.883 20.0416 15.8773L 20.3255 15.7793C 20.4925 16.0617 20.7876 16.2519 21.1327 16.2519L 26.0592 16.2519C 26.5769 16.2519 27 15.8139 27 15.2779L 27 1.41772C 27 0.88175 26.5769 0.443757 26.0592 0.443757L 21.1271 0.443757C 20.6818 0.443757 20.3088 0.766489 20.2142 1.19296C 19.5518 0.461046 18.611 -3.51751e-09 17.5645 -3.51751e-09L 5.88552 -3.51751e-09C 3.40278 -3.51751e-09 1.81627 1.3428 1.53793 3.68837L 0.0460593 13.4971C -0.171042 14.9206 0.391194 16.3614 1.48227 17.1682C 2.10017 17.6292 2.82941 17.8713 3.59204 17.8713L 9.66531 17.8713L 9.66531 22.4587C 9.66531 24.2568 10.1663 25.5477 11.1572 26.3027ZM 21.1995 1.49264L 25.9924 1.49264L 25.9924 15.2145L 21.1995 15.2145L 21.1995 1.49264ZM 3.59204 16.8282C 3.04094 16.8282 2.51767 16.6553 2.07234 16.321C 1.293 15.739 0.88663 14.6958 1.04806 13.6585L 2.53437 3.84397C 2.53437 3.83821 2.53437 3.83244 2.53437 3.82668C 2.80714 1.53298 4.50498 1.04888 5.88552 1.04888L 17.5645 1.04888C 19.0118 1.04888 20.1864 2.26489 20.1864 3.76329L 20.1864 14.7247L 19.7243 14.886C 19.5629 14.9321 18.3215 15.324 17.0634 16.2519C 15.2765 17.5658 14.3302 19.3236 14.3302 21.3349L 14.3302 25.8647C 13.7568 25.9799 12.599 26.101 11.7528 25.4555C 11.0403 24.9138 10.6784 23.9052 10.6784 22.4587L 10.6784 17.3469C 10.6784 17.0587 10.4502 16.8224 10.1719 16.8224L 3.59204 16.8224L 3.59204 16.8282Z"></path></defs></svg> </dislike> </opponent-rating> </info-graphic> <a href="#todos/check">確定</a> </match-followup> </component-main-content>', '', '', function(opts) {
});
riot.tag2('page-todos-check-ui', '<nav> <nav-title> <component-page-title page="我的球賽"></component-page-title> </nav-title> </nav> <component-main-content> <check-todos> <component-todos-check-item--confirmed todo__from=":example"></component-todos-check-item--confirmed> <component-todos-check-item--applying todo__from=":example"></component-todos-check-item--applying> <component-todos-check-item--considering todo__from=":example"></component-todos-check-item--considering> <component-todos-check-item--waiting todo__from=":example"></component-todos-check-item--waiting> <component-todos-check-item--drawn></component-todos-check-item--drawn> <component-todos-check-item--won></component-todos-check-item--won> </check-todos> </component-main-content> <component-tabs tab="todos"></component-tabs>', '', '', function(opts) {
(function (self, args, my, me) {

		self .remembers (':example', {"id":"5","start_at":"2017-02-08T18:00:00Z","duration":"90","pitch_type":"ARTIFICIAL_TURF","home_team_color":"#1E8449","away_team_color":null,"fee_per_team":"0","is_friendly":1,"status":"PENDING_APPROVAL","home_score":"","away_score":"","is_pitch_proved":0,"is_home_team_walked":null,"is_away_team_walked":null,"has_home_team_complained":null,"has_away_team_complained":null,"home_team":{"long_name":"fake team 1","status":"VERIFIED","age_group_upper":"40","age_group_lower":"20","num_of_played_against_team":"0","num_of_opponent_acceptance":"0","fofi_rating":"800.00"},"away_team":{"long_name":null,"status":null,"age_group_upper":"","age_group_lower":"","num_of_played_against_team":"","num_of_opponent_acceptance":"","fofi_rating":null},"applied_opponent_count":"1","tag_list":[],"location":"HKG,Hong Kong,Hong Kong,垃圾屎球場","match_type_value":"9"})

}) (this, opts, this .my, this .me);
});
riot.tag2('page-todos-check', '<nav> <nav-title> <component-page-title page="我的球賽"></component-page-title> </nav-title> </nav> <component-main-content> <check-todos> <component-search-bar></component-search-bar> <component-todos-tabs tab="todos"></component-todos-tabs> <component-dynamic-load items_to_load="13" interval_for_loading="35" items__from=":todos"> <component-todos-check-wrap todo__from=":item"></component-todos-check-wrap> </component-dynamic-load> </check-todos> </component-main-content> <component-tabs tab="todos"></component-tabs>', '', '', function(opts) {
(function (self, args, my, me) {

		self .establish (':load', function (reqs) {
			return 	reqs .thru (tap, function () {
						if (! my (':api') .teams)
							window .location .hash = '#login'
					})
		})

		self
			.establish (':todos', function (requests) {
				return 	self .findings (':load')
							.thru (filter, function () {
								return my (':api') .teams;
							})
							.thru (map, function () {
								my (':api') .teams .ask ();
								return 	gotten (my (':api') .teams) .then (function (teams) {
											var team_id = teams [0] .id;
											return 	Promise .all
														([
															gotten (my (':api') .matches (team_id)),
															gotten (my (':api') .matches_applied (team_id))
														]);
										})
							})
							.thru (map, function (mine_and_applied) {
								return mine_and_applied [0] .concat (mine_and_applied [1]);
							})
							.thru (map, function (match_list) {

								var now = new Date ();

								var to_play = 	match_list .filter (function (match) {
													return now <= new Date (match .start_at)
												})

								to_play .sort (function (a, b) {
									return new Date (a .start_at) > new Date (b .start_at)
								})

								return to_play;
							});
			})

}) (this, opts, this .my, this .me);
});
riot.tag2('page-todos-withdrawn', '<nav> <nav-buttons> <a href="#todos/check"> <component-x-button></component-x-button> </a> </nav-buttons> <nav-title> <component-page-title page="約戰取消"></component-page-title> </nav-title> </nav> <component-main-content> <todos-withdraw> <component-withdrawn-todos-item--lapsed></component-withdrawn-todos-item--lapsed> <component-withdrawn-todos-item--eliminated></component-withdrawn-todos-item--eliminated> </todos-withdraw> </component-main-content>', '', '', function(opts) {
});
