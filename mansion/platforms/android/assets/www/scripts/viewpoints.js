var viewpoint_of = constant;
var objectivity = id;
var none = stream (); none .end (true);
var forever = stream ();
var now = function (x) { return stream (x || undefined) };
var transient =	having ({
					compromise: noop	
				}) (objectivity);
var property =	function (prop) {
					return	having ({
								impression: constant (prop)
							}) (viewpoint_of (none));
				};
var dependent =	function (func/*, from viewpoints */) {
					var samplers = [] .slice .call (arguments, 1);
									
					return	having ({
								impression: func
							}) (viewpoint_of (combine (func, samplers)));
				};
var computed =	function (func/*, from viewpoints */) {
					var samplers = [] .slice .call (arguments, 1);
	
					return	having ({
								impression: func,
								compromise: constant (func)
							}) (viewpoint_of (combine (func, samplers)));
				};
var delegation =  function (other_dialogue, stance) {
					if (stance)
						return	stance .bind
									(null,
									function (questions) {
										questions .thru (tap, other_dialogue .ask);
										return other_dialogue .findings
									})
					else
						return	having ({
									impression: other_dialogue .consensus,
									compromise: constant (other_dialogue .consensus)
								}) (function (questions) {
									questions .thru (tap, function (question) {
										//debugger;
										other_dialogue .ask (question);
									});
									return other_dialogue .findings
								})
				};
				
var cache =	function (cache_key, conversation_to_cache, cache_options) {
				var cached_value;
				var cache_retrieval =	stream
											(localforage .getItem (cache_key) .then (function (data) {
												cached_value = data != null ? data : undefined;
											}) .catch (noop));
				var cached_converstaion =	function (questions) {
												if (cache_options .idempotent) {
													var self = stream ();
													var cached_findings =	questions
																				.thru (takeUntil, [
																					mergeAll ([cache_retrieval, self])
																						.thru (trans, [R. filter (id)])])
																				.thru (conversation_to_cache);
													cached_findings
														.thru (tap, [self])
												}
												else 
													var cached_findings = questions .thru (conversation_to_cache);
											
												cached_findings
													.thru (tap, [localforage .setItem .bind (localforage, cache_key)])
												return cached_findings;
											};
				
				return	having ({
							impression: function () { return cached_value; },
							compromise: conversation_to_cache .consensus
						}) (cached_converstaion);
			};
			
var now_and_on =	function (dialogue) {
						var now = (dialogue .consensus () ? stream (dialogue .consensus ()) : stream ());
						dialogue .findings .thru (tap, now);
						return now;
					};
					
					
var placeholder =	function () {
						var compromise = constant;
						var impression = noop;
						
						return	having ({
									impression: function () {
													return impression .apply (this, arguments);
												},
									compromise: function () {
													return compromise .apply (this, arguments);
												}
								}) (function (inputs) {
									var head = promise (inputs);
									var tail = inputs .thru (trans, R .drop (1));
									
									var prospective_findings = stream ();
									
									head .then (function (viewpoint) {
										compromise = viewpoint .compromise || compromise;
										impression = viewpoint .impression || impression;
										
										tail .thru (viewpoint)
											.thru (tap, prospective_findings)
											.end .thru (tap, function () {
												prospective_findings .end (true);
											})
									})
									
									return prospective_findings;
								}) ;
					};
					
var loaded =	function (self) {
					return	dependent (function (load_signal) {
								return (load_signal && load_signal () === 'load')
							}, mergeAll ([ self .findings (':load') .thru (map, constant ('load')), self .findings (':unload') .thru (map, constant ('unload')) ]))
				};