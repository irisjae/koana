var cache_prefix = 'rest:cache;';


var stateful =	function (opts) {
					var key = opts .key;
					var per = opts .per || 'none';
					var request = opts .request;
					var value = opts .value;
					var error = opts .error;
					var estimate = opts .estimate;
					
					return function (inquiries) {
							
								var states = stream ();
								var states_persistence = persistance (states, key, cache_prefix);
								var states_init = states_persistence .init;
								
								
								inquiries
									.thru (tap, function (_inquiry) {
										states_init .then (function () {
											var id = _inquiry .label;
											var item = _inquiry .item;
											
											var _estimate = estimate && estimate (item);
											var _request = request (item);
											
											var prev = states ();
											var curr = like (prev || {});
											
											if (_estimate)
												curr .estimate =	{
																		label: id,
																		item: _estimate .item
																	};
											curr .request = 	(curr .request || []) .concat ([{
																	label: id,
																	item: _request
																}]);
																
											states (curr);
										})
									})
									
									
		
								
								var prev_state;
								var fetching =	states
													.thru (dropRepeatsWith, json_equal)
													.thru (filter, function (state) {
														if (! state)
															return false;
														if (! state .request)
															return false;
														if (! state .interrupt) {
															if (prev_state && state &&
																prev_state .request && state .request &&
																json_equal (prev_state .request [0], state .request [0])
															)
																return false;
														}
														return true;
													})
													.thru (map, function (state) {
														prev_state = like (state);
														return state .request [0];
													})
													.thru (map, function (req) {
														var id = req .label;
														return	{
															item:	Promise .resolve ((fetching () || {}) .item)
																		.then (function () {
																			/*var _state = states ();
																			if ((per === 'all' && (_state && _state .value)) ||
																				(per === 'lump' && (_state && _state .request))
																			) {
																				return {
																					result: 'value',
																					label: id,
																					item: _state .value .item
																				}
																			}*/
																			return	query (req .item)
																						.then (function (response) {
																							var _error = error && error (response);
																							
																							if (_error)
																								return {
																									result: 'error',
																									label: id,
																									item: _error .item
																								}
																								
																							return	{
																								result: 'value',
																								label: id,
																								item: value (response)
																							};
																						})
																						.catch (function (_interrupt) {
																							return {
																								result: 'interrupt',
																								label: id,
																								item: _interrupt 
																							};
																						})
																		})
														};
													})
													.thru (tap, function () {
														fetching () .item
															.then (function (_fetch) {
																var prev = states ();
																var curr = like (prev);
																	
																if (_fetch .result === 'interrupt') {
																	curr .interrupt = {
																		label: _fetch .label,
																		item: _fetch .item
																	};
																}
																else {
																	if (_fetch .result === 'value') {
																		curr .value = {
																			label: _fetch .label,
																			item: _fetch .item
																		};
																		delete curr ['error'];
																		delete curr ['estimate'];
																	}
																	else if (_fetch .result === 'error') {
																		curr .error = {
																			label: _fetch .label,
																			item: _fetch .item
																		};
																	}
																	
																	delete curr ['interrupt'];
																	var requests = curr .request .slice (0);
																	requests .splice (
																		index (function (_request) {
																			return _request .label === _fetch .label
																		}) (requests), 1)
																	curr .request = requests;
																	if (curr .request .length === 0)
																		delete curr ['request'];
																}
																	
																states (curr)
															})
													})
		
								var query =	function (request) {
												if (request .method === 'process') {
													return	Promise .resolve (
																request .fetch (request .path, request
															))
																.then (function (response) {
																	log ('queryied local', request .path, request, response);
																	return response;
																});
												}
												else {
													return	fetch (request .path, request)
																.then (function (response) {//log (response);
																    return	response .json ()
																    			.then (function (json) {
																    				return	{
																    					json: json,
																    					response: response
																    				}
																    			});
																})
																.then (function (response) {
																	log ('queryied network', request .path, request, response);
																	return response;
																});
												}
											};
								
								states .key = key;
								states .init = states_init;
								states .caching = states_persistence .caching;
								states .cached = states_persistence .cached;
								
								return states;
						}
					};



						
						
var restoration =	localforage .keys ()
						.then (function (labels) {
							return	R .fromPairs (
										labels
											/*.filter (function (label) {
												return label .startsWith (cache_prefix)
											})*/
											.map (function (cache_label) {
												//var key = cache_label .slice (cache_prefix .length)
												return [ cache_label, localforage .getItem (cache_label) ]
											}))
						})
						.catch (constant ({}))
							
var persistance =	function (s, key, prefix) {
						var persist =	function (state) {
											return localforage .setItem (prefix + key, state) .catch (noop)
										}
						var caching = s .thru (dropRepeatsWith, json_equal);
										
						return	{
									init: restoration
											.then (function (initials) {
												return initials [prefix + key]
											})
											.then (tap_ (function (_state) {
												if (_state)
													s (_state)
											})),
									caching: caching,
									cached:	combine (function (self) {
												var _state = caching ();
												return {
													item:	Promise .resolve ((self () || {}) .item)
																.then (function () {
																	return persist (_state)
																})
												};
											}, [ caching ])

								}
					}
	
var query =	function (path, request) {
				if (request .method === 'local') {
					return	Promise .resolve (parse (request .body))
								.then (function (response) {
									log ('queryied local', path, request, response);
									return response;
								});
				}
				else {
					return	fetch (path, request)
								.then (function (response) {//log (response);
								    return	response .json ()
								    			.then (function (json) {
								    				return	retaining ({
										    					json: json
										    				}) (response)
								    			});
								})
								.then (function (response) {
									log ('queryied network', path, request, response);
									return response;
								});
				}
			};

			

					
var new_label =	function () {
					return (new Date ()) .getTime () + '-' + Math .random ();
				}
					
					
					
var inquire_details =	function (state_dialogue, inquiry) {
							var id = new_label ();
							
							var details =	from (function (details) {
												state_dialogue .impressions
													.thru (filter, function (state) {
														return state .request && state .request [0] .label === id;
													})
													.thru (tap, function (state) {
														details (state);
													});
												state_dialogue .impressions
													.thru (filter, function (state) {
														return state .request && state .request [1] && state .request [1] .label === id;
													})
													.thru (trans, R .take (1))
													.thru (tap, function (state) {
														details (state);
													});
												state_dialogue .impressions
													.thru (filter, function (state) {
														return (state .error && state .error .label === id) || (state .value && state .value .label === id);
													})
													.thru (tap, function (state) {
														details (state);
														details .end (true);
													});
											})
							
							state_dialogue .mention ({
								label: id,
								item: inquiry
							})
							
							return details;
						}	
var inquire =	function (dialogue, inquiry) {
					var details = inquire_details (dialogue, inquiry)
					return	promise (details .end)
								.then (function () {
									return details ()
								})
								.then (function (state) {
									if (state .error)
										return Promise .reject (state .error .item);
									else
										return state .value .item;
								});
				}	