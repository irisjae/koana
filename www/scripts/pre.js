var ui;
var frag = function (html) {
    var container = document .createElement ('template');
	container .innerHTML = html;
	return container .content;
}; 
var bound_rectangle =	function (hint) {
	var id = hint .getAttribute ('xlink:href') || hint .getAttribute ('href');
	var hint_path = ui .querySelector (id);
	var d = hint_path .getAttribute ('d');
	var path_segments = require ('svg-path-parser') .makeAbsolute (require ('svg-path-parser') (d));
	var path_points = path_segments .map (function (segment) {
			return {
				x: segment .x0,
				y: segment .y0
			}
		}) .concat ([ path_segments .reverse () [0] ] .map (function (segment) {
			return {
				x: segment .x,
				y: segment .y
			}
		}));
	var point_xs = path_points .map (function (path) { return path .x })
	var point_ys = path_points .map (function (path) { return path .y })
	return {
		x_min: Math .min .apply (null, point_xs),
		x_max: Math .max .apply (null, point_xs),
		y_min: Math .min .apply (null, point_ys),
		y_max: Math .max .apply (null, point_ys),
	}
};
var fulfill_input =	function (hint) {
	var use_hint = hint .querySelector ('g') .querySelector ('use');
	var bounding_box = bound_rectangle (use_hint)
	
	/*hint .outerHTML =
	    `<foreignObject
	        data-is="modules-hint-input"
	        ${[] .map .call (
	            hint .attributes,
	            function (attr) {
	                return `${attr .nodeName}="${attr .nodeValue}"` 
                }
            ) .join (' ')}
	        transform="${use_hint .getAttribute ('transform')}"
	        width="${bounding_box .x_max - bounding_box .x_min}"
	        height="${bounding_box .y_max - bounding_box .y_min}"
        />`/
	/*/hint .outerHTML =
	    '<foreignObject ' +
	        'data-is="modules-hint-input" ' +
	        ([] .map .call (
	            hint .attributes,
	            function (attr) {
	                return attr .nodeName + '="' + attr .nodeValue + '"'
                }
            ) .join (' ')) + ' ' +
	        'transform="' + use_hint .getAttribute ('transform') + '" ' +
	        'width="' + (bounding_box .x_max - bounding_box .x_min) + '" ' +
	        'height="' + (bounding_box .y_max - bounding_box .y_min) + '" ' +
        '/>';//*/
};
var placeholder = function (hint) {
	var use_hint = hint .querySelector ('use');
	var bounding_box = bound_rectangle (use_hint)
	
	return '<rect ' +
        'transform="' + use_hint .getAttribute ('transform') + '" ' +
        'width="' + (bounding_box .x_max - bounding_box .x_min) + '" ' +
        'height="' + (bounding_box .y_max - bounding_box .y_min) + '" ' +
    '>' +
    '</rect>';
};
var text_ify = function (hint, text) {
    text = text || '';
    
	var use_hint = hint .querySelector ('use');
	var bounding_box = bound_rectangle (use_hint)
	
	return '<foreignObject ' +
        ([] .map .call (
            hint .attributes,
            function (attr) {
                return attr .nodeName + '="' + attr .nodeValue + '"'
            }
        ) .join (' ')) + ' ' +
        'transform="' + use_hint .getAttribute ('transform') + '" ' +
        'width="' + (bounding_box .x_max - bounding_box .x_min) + '" ' +
        'height="' + (bounding_box .y_max - bounding_box .y_min) + '" ' +
    '>' +
        text .replace (/&/g, "&amp;") .replace (/</g, "&lt;") .replace (/>/g, "&gt;") +
    '</foreignObject>';
};
var image_ify = function (hint, src) {
	var use_hint = hint .querySelector ('use');
	var bounding_box = bound_rectangle (use_hint)
	
	return '<foreignObject ' +
        ([] .map .call (
            hint .attributes,
            function (attr) {
                return attr .nodeName + '="' + attr .nodeValue + '"'
            }
        ) .join (' ')) + ' ' +
        'transform="' + use_hint .getAttribute ('transform') + '" ' +
        'width="' + (bounding_box .x_max - bounding_box .x_min) + '" ' +
        'height="' + (bounding_box .y_max - bounding_box .y_min) + '" ' +
    '>' +
        (src ?
            '<img src="' + src + '">' :
            '<img>'
        ) +
    '</foreignObject>';
}
var fulfill_scroll = function (scroll) {
	var hinted = scroll .parentElement;
	
	var hint = scroll .querySelector ('use');
	var transform = hint .getAttribute ('transform');
	var bounding_box = bound_rectangle (hint);
	if (transform && transform .startsWith ('translate(')) {
	    var translation = transform .slice ('translate(' .length, transform .indexOf (')'));
	    var numbers = translation .split (' ') .map (function (x) {
	        return +x;
	    })
	    bounding_box .x_min += numbers [0];
	    bounding_box .x_max += numbers [0];
	    bounding_box .y_min += numbers [1];
	    bounding_box .y_max += numbers [1];
	}
	
	scroll .outerHTML = '';
	
	hinted .setAttribute ('scroll-x-min', bounding_box .x_min);
	hinted .setAttribute ('scroll-x-max', bounding_box .x_max);
	hinted .setAttribute ('scroll-y-min', bounding_box .y_min);
	hinted .setAttribute ('scroll-y-max', bounding_box .y_max);
};

var recitify =  function (dom) {
    [] .forEach .call (dom .querySelectorAll ('[id*=":"]'), function (node) {
        var id = node .getAttribute ('id');
        var parts = id .split (' ');
        node .setAttribute ('id', parts [0]);
        parts .slice (1) .forEach (function (attr) {
            var parts = attr .split (':');
            node .setAttribute (parts [0], parts .slice (1) .join (':'))
        })
    })
}


var exemplify = function (instances, processing) {
    var list = [] .slice .call (instances) .reverse ();
    var x = list [0];
    if (processing && ! processing .apply) processing [0] (list);
    list .slice (1) .forEach (function (u) {
        u .outerHTML = '';
    })
    if (processing && ! processing .apply) processing [1] (x);
    else if (processing) processing (x);
    [] .forEach .call (x .querySelectorAll ('[id*=template]:not([template])'), function (y) {
        y .outerHTML = '';
    });
    return x;
}
var y_translation = function (g) {
    return + g .querySelector ('use') .getAttribute ('transform') .match (/translate\(\d+ (\d+)\)/) [1]
}
var x_translation = function (g) {
    return + g .querySelector ('use') .getAttribute ('transform') .match (/translate\((\d+) \d+\)/) [1]
}
