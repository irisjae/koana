/*
	global stream,
	global R,
	global localforage,
	global constant,
	global noop,
	global tap,
	global like,
*/
var as_cycler =	function (to_cycle) {
						if (to_cycle .as_cycler)
							return to_cycle .as_cycler;
						else {
							var cycler =	function (_/* Cycle | Stream */) {
												if (! _)
													_ = {
														to: stream (),
														from: stream ()
													}
												else if (typeof _ === 'function')
													_ = {
														to: _,
														from: stream ()
													};
												else
													_ = like (_);
												var x = to_cycle (_);
												for (var n in x) {
													_ [n] = x [n];
												}
												return _;
											}
							cycler .as_cycler = cycler;
							return cycler;
						}
					}

var cycle_by_fetch =	function (fetch) {
							return as_cycler (function (cycle) {
								var _ = {
									from:	stream_pushes (function (push) {
												cycle .to
													.thru (tap, function (req) {
														fetch (req)
															.then (push)
													});
											}),
									pair:	function (req) {
												return fetch (req)
													.then (R .tap (_ .from))
											}
								}
								return _;
							})
						};//TODO: move pair into cycle_by_fetch

var cycle_from_network =	as_cycler (
								R .pipe (
									cycle_by_fetch (function (req) {
										var res;
										return	fetch (req .path, req)
													.then (function (_) {
														res = _;
														return res;
													})
													.then (function () {
														return res .text ()
													})
													.then (function (text) {
														try {
															res .json = JSON .parse (text);
														}
														catch (e) {
															res .json = undefined;
														}
														finally {
															res .text = text;
														}
													})
													.then (function () {
														//res .req = req;
														log ('queryied network', req .path, req, res);
													})
													.then (function () {
														return res;
													})
									})
								)
							)
							
var cycle_by_translate =	function (translate_from, cycler, translate_to) {
								return	as_cycler (function (cycle) {
											cycle .to = cycle .to .thru (map, translate_from);
											var _ =	cycler (cycle);
											_ .from = _ .from .thru (map, translate_to);
											var prior_pair;
											if (prior_pair = _ .pair)
												_ .pair =	function (in_) {
																return Promise .resolve (translate_from (in_))
																		.then (prior_pair)
																		.then (translate_to);
															}
											return _;
										})
							};

var prefix_for_persistence = 'rest:cache;';
var restoration =	localforage .keys ()
						.then (function (labels) {
							return	R .fromPairs (
										labels
											.map (function (cache_label) {
												return [ cache_label, localforage .getItem (cache_label) ]
											}))
						})
						.catch (constant ({}))
var cycle_persisted =	function (key) {
							return	as_cycler (function (cycle) {
										var init = restoration
													.then (function (initials) {
														return initials [prefix_for_persistence + key]
													});
										var to_persist = cycle .from;
										var persisting =	to_persist
																.thru (map, function (_val) {
																	return	Promise .resolve (persisting && persisting ())
																				.then (function () {//log (_val)
																					/*if (_val === undefined)
																						return localforage .removeItem (prefix_for_persistence + key)
																					else*/
																						return localforage .setItem (prefix_for_persistence + key, _val)
																				})
																				.catch (noop)//todo: catch sth
																				.then (constant (_val))
																});
														
										return	{
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
												}
									})
						}
var re_cycle =  function () {
    var x = stream ();
    return {
        to: x,
        from: x
    }
}
						

//persisted (':login', cycle_by_translate (R .spec ({}), cycle_network ('path/to/api'), R .prop ('json')))
var inquire =	function (cycle, inquiry) {
					return	cycle .pair (inquiry);
				}	
var last_or_inquire =	function (cycle) {
						if (cycle .from ())
							return Promise .resolve (cycle .from ());
						else
							return inquire (cycle)
					}