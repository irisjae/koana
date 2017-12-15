var interaction_input = function (dom) {
    var _ = interaction (transition (function (intent, license) {
        if (intent [0] === 'input')
            return only_ (intent [1]);
        else if (intent [0] === 'reset') {
            dom .value = '';
            dom .dispatchEvent (new Event ('input'));
        }
		else {
			return decline_ (intent)
		}
    }));
	_ .intent (['input', dom .value]);
    dom .addEventListener ('input', function () {
        _ .intent (['input', dom .value]);
    });
    return {
        _: _,
        dom: dom 
    };
}

var interaction_placeholder = function (dom, input) {
	dom .style .transition = 'all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms'; 
	var extension = interaction (transition (function (intent, license) {
	    //[license] .forEach (tap (logged_with ('what the fuck?')))
	    
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
				input ._ .intent (['reset']);
				tenure .end (true);
			}
		}
		else {
			return decline_ (intent)
		}
	}));
	
	extension .state ('off');
	
	[input ._ .state]
		.map (map (function (x) {
		    return !! x;
		}))
		.map (dropRepeats) 
		.forEach (tap (function (x) {
		    if (x)
		        extension .intent (['disappear'])
	        else
		        extension .intent (['appear'])
		}))
	
	return R .merge (input, {
		placeholder_dom: dom,
		placeholding: extension
	})
}