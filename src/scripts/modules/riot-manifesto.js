riot .mixin ({
	init:	function () {
				var self = this;			
				if (! self .self) {
					var first = true;
					self .renders = [];
					self .render_promises = [];
					self .shouldUpdate =	function () {
												if (first) {
													first = false;
													//return logged_with ('first run free', self)(true);/*
													return true;//*/
												}
												//return logged_with ('render', self)(self .renders .length);/*
												return self .renders .length//*/
													|| (self .__ .isLoop && self .__ .parent .renders .length)
													|| ((self .__ .parent .__ .tagName === 'virtual')  && self .__ .parent .shouldUpdate ());//*/
											}
					self .render =	function () {//var stack = new Error ().stack;
										if (! self .isMounted) return new Promise (function (resolve) { self .one ('mount', resolve); });
										var args = arguments;
										if (self .renders .length && self .renders [0] .length === 0) {
											self .renders [0] = args;
											return self .render_promises [0];
										}
										else {
											self .renders .unshift (args);
											self .render_promises .unshift (
												next_tick () .then (function () {//var q = stack;
													if (self .isMounted) {
														self .update .apply (self, self .renders [self .renders .length - 1]);
														self .renders .pop ();
														self .render_promises .pop ();
													}
												})
											)	
											return self .render_promises [0];												
										}
									};
				}
			}
});

var ref_diff =	function (name, ref_diffs) {
					return	[ref_diffs]
								.map (spread)
								.map (filter (function (diff) {
									return diff .type === 'add' && diff .ref === name;
								}))
								.map (map (function (diff) {
									return diff .node;
								}))
							[0];
				};
var ref_set_diff =	function (name, ref_diffs) {//TODO: add hashmap from node id (is there such a thing?) to index, so becomes O(1)
						var refs = [];
						return	[ref_diffs]
									.map (tap (function (diffs) {
										diffs .forEach (function (diff) {
											if (diff .type === 'add')
												refs .push (diff .node);
											if (diff .type === 'remove')
												refs .splice (refs .indexOf (diff .node), 1);
										})
									}))
									.map (map (function () {
										return refs .slice ();
									}))
								[0];
					};	
var diff_refs =	function (refs) {
					var last_refs = {};
					return	refs
								.map (function (current) {
									var prev_refs = last_refs;
									last_refs = current;
								    return diff_ref (prev_refs, current);
								})
				}
				
var yield_refs =	function (refs) {
						var _refs = {};
						for (var yield_name in refs) {
							if (yield_name .startsWith ('yield:'))
								_refs [yield_name .slice ('yield:' .length)] = refs [yield_name]
						}
						return _refs;
					}
var self_refs =	function (refs) {
					var _refs = {};
					for (var yield_name in refs) {
						if (yield_name .startsWith ('self:'))
							_refs [yield_name .slice ('self:' .length)] = refs [yield_name]
					}
					return _refs;
				}
var diff_ref =	function (last_refs, now_refs) {
			    var diff = [];
			    for (var ref in now_refs) {
			    	for (var node of now_refs [ref]) {
			    		var node_index;
			    		if (last_refs [ref] && (node_index = last_refs [ref] .indexOf (node)) !== -1) {
			    			last_refs [ref] .splice (node_index, 1);
			    		}
			    		else {
			    			diff .unshift ({ ref: ref, type: 'add', node: node });
			    		}
			    	}
			    } 
			    for (var ref in last_refs) {
			    	for (var node of last_refs [ref]) {
			    		diff .unshift ({ ref: ref, type: 'remove', node: node });
			    	}
			    } 
			    return diff;
			};
							
var consistentfy =	function (original_refs) {
						var shallow_refs = {};
						for (var ref in original_refs) {
							shallow_refs [ref] = original_refs [ref]
							if (! shallow_refs [ref] .length)
								shallow_refs [ref] = [shallow_refs [ref]];
							else
								shallow_refs [ref] = shallow_refs [ref] .slice ();
							shallow_refs [ref] = shallow_refs [ref] .map (function (frag) {
								if (frag .root)
									return frag .root;
								else
									return frag;
							})
						}
						return shallow_refs;
					};
