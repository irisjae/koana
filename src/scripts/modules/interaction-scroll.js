var drags = R .memoize (function (dom) {
    dom .style .touchAction = 'none';
    return from (function (drag) {
        var _;
        interact (dom) .draggable({
            inertia: true,
            onstart: function (e) {
                window .dragging = true;

                _ = stream (e);
                drag (_);
            },
            onmove: function (e) {
                _ (e)
            },
            onend: function (e) {
                _ (e)
                _ .end (true)
                
                setTimeout (function () {
                    window .dragging = false;
                }, 0)
            }
        })// .dropzone (true);
    })
})


		
var scroll_interaction = function (direction) {
    var direction = direction === 'x' ? 'x' : 'y';
    return function (dom) {
        var svg = dom .ownerSVGElement;
        
    	var ugly_max = function () {
    	    var p = svg .createSVGPoint ();
		    p .x = dom .getBoundingClientRect () .right;
		    p .y = dom .getBoundingClientRect () .bottom;
    	    p = p .matrixTransform (dom .getScreenCTM () .inverse ())
	        return p;
		};
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

        //var scrolled = false;
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
                
                /*var threshold = 2000;
                if (scroll_ - scroll > threshold || scroll - scroll_ > threshold) {
                    var positivity = scroll_ - scroll > 0 ? +1 : -1;
                    var adjusted_scroll = scroll + positivity * threshold;
                    var residue = scroll_ - adjusted_scroll;
                    scroll_ = adjusted_scroll;
                    requestAnimationFrame (function () {
                        _ .intent (['drag', R .assoc (direction, residue) ({}), _ .state ()]);
                    });
                }*/
                
                /*if (scroll_ !== scroll && ! scrolled) {
                    scrolled = true;
                    setTimeout (function () {
                        var scroll_ = _ .state ()
                        //console .log (scroll_ - scroll, scroll_);
                        if (direction === 'x') {
                            dom .setAttribute ('transform', 'translate(-' + (scroll_ - max [direction]) + ' 0)');
                        }
                        else if (direction === 'y') {
                            dom .setAttribute ('transform', 'translate(0 -' + (scroll_ - max [direction]) + ')');
                        }
                        scrolled = false;
                    }, 0)
                }*/
                
                return only_ (scroll_);
            }
            else {
                //fuked
            }
        }));
        
        _ .state (max [direction]);

		[drags (svg)]
			.map (filter (function (drag) {
			    var drag_start = svg .createSVGPoint ();
			    drag_start .x = drag () .x0;
			    drag_start .y = drag () .y0;
			    drag_start = drag_start .matrixTransform (dom .getScreenCTM () .inverse ())
			    
			    var _max = ugly_max ();
			    return min .x <= drag_start .x && drag_start .x <= _max .x &&
	                min .y <= drag_start .y && drag_start .y <= _max .y
		    }))
		    .map (switchLatest) 
		    .map (map (function (e) {
			    return {
			        x: e .dx,
			        y: e .dy
			    }
			}))
			.forEach (tap (function (x) {
			    _ .intent (['drag', x, _ .state ()]);
			}))
        
        return {
            _: _,
            dom: dom 
        };
	}
}