var interaction =	function (coupling) {
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
		intent .thru (split_on, last_segue)
			.thru (map, function (_intent) {
				return	_intent
            				/*.thru (tap, function (x) {
            				    log ('intent', x);
            				})*/
				            .thru (trans, R .take (1))
            				/*.thru (tap, function (x) {
            				    log ('intention', x);
            				})*/
							.thru (map, function (first) {
							    return fn (first, news (intent) .thru (takeUntil, news (last_segue)))
							})
							.thru (tap, function (tend) {
							    if (typeof tend !== 'function')
    							    throw new Error ('did not return tend function');
							})
			})
			.thru (tap, function (x) {
			    promise (x)
			        .then (function (tend) {
			            var _state = stream ();
        				_state .thru (tap, state);
        				_state .end .thru (tap, function () {
        					last_segue (undefined);
        				})
        				tend (_state);
			        })
			})
	}
}

var interaction_product =	function (interactions) {
	return {
		intent: stream () .thru (tap, R .forEachObjIndexed (function (x, k) {
		    if (interactions [k])
		        interactions [k] .intent (x);
		})),
		state: product (R .map (R .prop ('state')) (interactions))
	}
}
var interaction_product_array =	function (interactions) {
	return {
		intent: stream () .thru (tap, R .forEach (function (x, k) {
		    if (interactions [k])
		        interactions [k] .intent (x);
		})),
		state: array_product (R .map (R .prop ('state')) (interactions))
	}
}
var interaction_key_sum = 	function (i1, i2) {
	return {
		intent: stream () .thru (tap, R .forEachObjIndexed (function (x, k) {
		    if (k in i1 .state ())
		        i1 .intent (R .assoc (k, x) ({}));
		    else
		        i2 .intent (R .assoc (k, x) ({}));
		})),
		state: key_sum (i1 .state) (i2 .state)
	}
}
var interaction_flatten = function (stream_of_interactions) {
    return {
        intent: stream () .thru (tap, function (x) {
		    stream_of_interactions () .intent (x);
		}),
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
        news (i .intent) .thru (project, interaction .intent);
        interaction .state .thru (project, i .state);
    })
    return i;
}