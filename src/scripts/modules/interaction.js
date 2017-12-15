var interaction = function (coupling) {
	var intent = stream ();
	var state = stream ();
	
	coupling (intent, state);

	return {
		intent: intent,
		state: state
	}
}

var transition = function (fn) {
	return function (intent, state) {
		var last_segue = stream (undefined);
		[intent]
			.map (split_on (last_segue))
			.map (map (function (_intent) {
				return	[_intent]
							/*.map (tap (function (x) {
								log ('intent', x);
							}))*/
							.map (trans (R .take (1)))
							/*.map (tap (function (x) {
								log ('intention', x);
							}))*/
							.map (map (function (first) {
								return fn (first, [news (intent)] .map (takeUntil (news (last_segue))) [0])
							}))
							.map (tap (function (tend) {
								if (typeof tend !== 'function')
									throw new Error ('did not return tend function');
							}))
						[0]
			}))
			.forEach (tap (function (x) {
				promise (x)
					.then (function (tend) {
						var _state = stream ();
						[_state] .forEach (tap (state));
						[_state .end] .forEach (tap (function () {
							last_segue (undefined);
						}));
						tend (_state);
					})
			}));
	}
};