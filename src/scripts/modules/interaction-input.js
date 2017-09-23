var interaction_input = function (dom) {
    var _ = interaction (transition (function (intent, license) {
        if (intent [0] === 'input')
            return only_ (intent [1]);
        else if (intent [0] === 'reset') {
            dom .value = '';
            dom .dispatchEvent (new Event ('input'));
        }
		else {
			console .error ('unknown intent passed', intent);
			return project (none)
		}
    }));
    dom .addEventListener ('input', function () {
        _ .intent (['input', dom .value]);
    })
    return interaction_product ({
        _: _,
        dom: {
            intent: none,
            state: stream (dom)
        }
    });
}

var interaction_placeholder = function (dom, input) {
	dom .style .transition = 'all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms'; 
	var extension = interaction (transition (function (intent, license) {
	    //license .thru (tap, logged_with ('what the fuck?'))
	    
		if (intent [0] === 'appear') {
			return function (tenure) {
				dom .style .opacity = 1;
				wait (450)
					.then (function () {
					    tenure ('on');
						tenure .end (true);
					})
			}
		}
		else if (intent [0] === 'disappear') {
			return function (tenure) {
				dom .style .opacity = 0;
				wait (450)
					.then (function () {
					    tenure ('off');
						tenure .end (true);
					})
			}
		}
		else if (intent [0] === 'reset') {
			return function (tenure) {
				input .intent (['reset']);
				tenure .end (true);
			}
		}
		else {
			console .error ('unknown intent passed', intent);
			return project (none)
		}
	}));
	
	extension .state ('off');
	
	input .state .thru (map, function (x) {
	    return !! x ._;
	}) .thru (dropRepeats) .thru (tap, function (x) {
	    if (x)
	        extension .intent (['disappear'])
        else
	        extension .intent (['appear'])
	})
	
	return interaction_key_sum (input, interaction_product ({
		placeholder_dom: {
			intent: none,
			state: stream (dom)
		},
		placeholding: extension
	}))
}