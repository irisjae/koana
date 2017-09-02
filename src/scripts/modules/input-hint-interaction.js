var interaction_input = function (dom) {
    var _ = interaction (transition (function (intent, license) {
        return only_ (intent);
    }));
    dom .addEventListener ('input', function () {
        _ .intent (dom .value);
    })
    return interaction_product ({
        _: _,
        dom: {
            intent: stream (),
            state: stream (dom)
        }
    });
}

var interaction_placeholder = function (dom, input) {
	var components = interaction_key_sum (input, interaction_product ({
		placeholder_dom: {
			intent: stream (),
			state: stream (dom)
		}
	}));
	var extension = interaction (transition (function (intent, license) {
		if (intent === 'appear') {
			return from (function (tenure) {
				dom .style .opacity = 1;
				wait (450)
					.then (function () {
					    tenure ('on');
						tenure .end ();
					})
			})
		} if (intent === 'disappear') {
			return from (function (tenure) {
				dom .style .opacity = 0;
				wait (450)
					.then (function () {
					    tenure ('off');
						tenure .end ();
					})
			})
		}
		else {
			console .error ('unknown intent passed', intent);
			return only_ ()
		}
	}));
	
	extension .state ('off');
	
	dom .style .transition = 'all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms';
	input .state .thru (map, function (x) {
	    return !! x ._;
	}) .thru (dropRepeats) .thru (tap, function (x) {
	    if (x)
	        extension .intent ('disappear')
        else
	        extension .intent ('appear')
	})
	
	return interaction_key_sum (components, interaction_product ({ placeholding: extension }))
}