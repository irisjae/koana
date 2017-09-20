var interaction =	function (coupling) {
	var intent = stream ();
	var state = stream ();
	
	coupling (intent, state);

	return {
		intent: intent,
		state: state
	}
}

var transition =	function (fn) {
	return function (intent, state) {
		var last_segue = stream (undefined);
		intent .thru (split_on, last_segue)
			.thru (map, function (_intent) {
				return	_intent .thru (trans, R .take (1))
							.thru (map, function (first) {
								return fn (first, news (intent) .thru (takeUntil, news (last_segue)))
							})
							.thru (switchLatest)
			})
			.thru (tap, function (_state) {
				_state .thru (tap, state);
				_state .end .thru (tap, function () {
					last_segue (undefined);
				})
			})
	}
}

var interaction_product =	function (interactions) {
	return {
		intent: product (R .map (R .prop ('intent')) (interactions)),
		state: product (R .map (R .prop ('state')) (interactions))
	}
}
var interaction_product_array =	function (interactions) {
	return {
		intent: array_product (R .map (R .prop ('intent')) (interactions)),
		state: array_product (R .map (R .prop ('state')) (interactions))
	}
}
var interaction_key_sum = 	function (i1, i2) {
	return {
		intent: key_sum (i1 .intent) (i2 .intent),
		state: key_sum (i1 .state) (i2 .state)
	}
}
var interaction_flatten = function (stream_of_interactions) {
    return {
        intent: stream_of_interactions .thru (map, R .prop ('intent')) .thru (switchLatest),
        state: stream_of_interactions .thru (map, R .prop ('state')) .thru (switchLatest)
    }
}
var interaction_to_be = function (interactor) {
    var i = {
        intent: stream (),
        state: stream ()
    }
    
    var intents = [];
    i .intent .thru (takeUntil, from_promise (interactor)) .thru (tap, function (x) {
        intents .push (x);
    });
    interactor .then (function (interaction) {
        intents .forEach (function (x) {
            interaction .intent (x);
        })
        interaction .intent .thru (project, i .intent);
        interaction .state .thru (project, i .state);
    })
    return i;
}