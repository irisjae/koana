/*
	global stream,
	global R,
	global localforage,
	global constant,
	global noop,
	global tap,
	global like,
*/

var dialogue =	function (cycle, to) {
					to = to || stream ();
					var from = to .thru (cycle);
					if (! from .from)
						var _ = {
							to: to,
							from: from,
							thru: function (func, args) {
								return having ({
									from: from .thru (func, args)
								}) (_);
							}
						};
					else {
						var _ = having ({
							to: to,
							thru: function (func, args) { 
								return having ({
									from: from .from .thru (func, args)
								}) (_);
							}
						}) (from)
					}
					return _;
				};

var cycle_fetch =	function (fetch) {
						return function (from) {
							return	stream_pushes (function (push) {
										from
											.thru (tap, function (req) {
												fetch (req)
													.then (push)
											});
									})
						}
					}

var cycle_network =	R .pipe (
						R .applySpec ({
							to: R .identity,
							from:	cycle_fetch (function (req) {
										var res;
										return	fetch (req .path, req)
													.then (function (_) {
														res = _;
														return res;
													})
													.then (function () {
														return res .json ()
													})
													.then (function (json) {
														res .json = json;
													})
													.then (function () {
														res .req = req;
														log ('queryied network', req .path, req, res);
													})
													.then (function () {
														return res;
													})
									})
						}),
						R .applySpec ({
							to: R .prop ('to'),
							from: R .prop ('from'), 
							pair: function (dialogue) {
								return function (req) {
									dialogue .to (req);
									return promise (dialogue .from
										.thru (filter, function (res) {
											return res .req === req;
										}))
								}
							}
						})
					);
					
var cycle_translate =	function (translate_from, cycle_from, translate_to) {
							return	function (from) {
										var _ =	dialogue (
													cycle_from,
													from
														.thru (map, translate_from)
												)
												.thru (map, translate_to);
										var prior_pair = _ .pair;
										if (prior_pair)
											_ .pair =	function (in_) {
												return Promise .resolve (translate_from (in_))
														.then (prior_pair)
														.then (translate_to);
											}
										return _;
									}
						};

var prefix_persisted = 'rest:cache;';
var restoration =	localforage .keys ()
						.then (function (labels) {
							return	R .fromPairs (
										labels
											.map (function (cache_label) {
												return [ cache_label, localforage .getItem (cache_label) ]
											}))
						})
						.catch (constant ({}))
var persisted =	function (key, cycle_from) {
					return	function (from) {
						var cycle = dialogue (cycle_from, from);
						var init = restoration
									.then (function (initials) {
										return initials [prefix_persisted + key]
									});
						var to_persist = cycle .from;
						var persisting =	to_persist
												.thru (map, function (_val) {
													return	Promise .resolve (persisting && persisting ())
																.then (function () {
																	return localforage .setItem (prefix_persisted + key, _val)
																})
																.catch (noop)//todo: catch sth
																.then (constant (_val))
												});
										
						return	having ({
									init: init,
									to_persist: to_persist,
									persisting: persisting,
									from:	stream_pushes (function (push) {
												init
													.then (function (value) {
														if (value)
															begins_with (value, push)
													})
												persisting
													.thru (tap, function (persist) {
														persist
															.then (push)
													})
											})
								}) (cycle)
					}
				}
						
						

//persisted (':login', cycle_translate (R .spec ({}), cycle_network ('path/to/api'), R .prop ('json')))
var inquire =	function (stateful, inquiry) {
					return	stateful .pair (inquiry);
				}	
var inquire_last =	function (stateful) {
						if (stateful .from ())
							return Promise .resolve (stateful .from ());
						else
							return inquire (stateful)
					}