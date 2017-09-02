var drags = R .memoize (function (dom) {
    return from (function (drag) {
        var _;
        interact (dom) .draggable({
            onstart: function (e) {
                _ = stream (e);
                drag (_);
            },
            onmove: function (e) {
                _ (e)
            },
            onend: function (e) {
                _ (e)
                _ .end (true)
            }
        });
    })
})


		
var scroll_interaction = function (direction) {
    var direction = direction === 'x' ? 'x' : 'y';
    return function (dom) {
        var svg = dom .ownerSVGElement;
        
    	var scroll_max = function () {
    	    var p = svg .createSVGPoint ();
    	    if (direction === 'x') {
    		    p .x = dom .getBoundingClientRect () .right;
    		    p .y = 0;
		    }
    	    else if (direction === 'y') {
    		    p .x = 0;
    		    p .y = dom .getBoundingClientRect () .bottom;
    	    }
    	    p = p .matrixTransform (dom .getScreenCTM () .inverse ())
		    if (p [direction] > max [direction])
		        return p [direction];
		    else
		        return max [direction];
		};
	
	    var min = svg .createSVGPoint ();
	    var max = svg .createSVGPoint ();
	    /*if (!dom .hasAttribute ('scroll-x-min')) {
	        throw ('fuk')
	    }//*/
	    min .x = + dom .getAttribute ('scroll-x-min');
	    min .y = + dom .getAttribute ('scroll-y-min');
	    max .x = + dom .getAttribute ('scroll-x-max');
	    max .y = + dom .getAttribute ('scroll-y-max');

        var _ = interaction (transition (function (intent, license) {
            if (intent [0] === 'drag') {
                var d = intent [1];
                var scroll = intent [2]
                var scroll_ = scroll - d [direction];
                //console .log (dom, scroll_, max [direction], scroll_max ());
                if (scroll_ < max [direction])
                    scroll_ = max [direction];
                if (scroll_ > scroll_max ())
                    scroll_ = scroll_max ();
                
                if (scroll_ !== scroll) {
                    if (direction === 'x') {
                        dom .setAttribute ('transform', 'translate(-' + (scroll_ - max [direction]) + ' 0)');
                    }
                    else if (direction === 'y') {
                        dom .setAttribute ('transform', 'translate(0 -' + (scroll_ - max [direction]) + ')');
                    }
                }
                
                return only_ (scroll_);
            }
            else {
                //fuked
            }
        }));
        
        _ .state (max [direction]);

		drags (svg) .thru (filter, function (drag) {
		    var drag_start = svg .createSVGPoint ();
		    drag_start .x = drag () .x0;
		    drag_start .y = drag () .y0;
		    drag_start = drag_start .matrixTransform (dom .getScreenCTM () .inverse ())
		    return min .x <= drag_start .x && drag_start .x <= max .x &&
                min .y <= drag_start .y && drag_start .y <= max .y
	    }) .thru (switchLatest) .thru (map, function (e) {
		    return {
		        x: e .dx,
		        y: e .dy
		    }
		}) .thru (tap, function (x) {
		    _ .intent (['drag', x, _ .state ()]);
		})
        
        return interaction_product ({
            _: _,
            dom: {
                intent: stream (),
                state: stream (dom)
            }
        });
	}
}