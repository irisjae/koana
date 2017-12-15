var path = require ('path');
var frames_src = require ('./config') .paths .frames .src;
var file = require ('./util') .file;

var time = require ('./util') .time;

var frame_string = function (_) {
	return file (path .join (frames_src, _ + '.svg'));
}					


var frame = function (x) {
	x = /*time ('parse ' + x, () =>*/ frag (frame_string (x))/*)*/ .children [0];
	recitify (x);
	//uniqify (x);
	//console .log (x .outerHTML)
	return x;
}
var serve = function (x) {
	return [x .cloneNode (true)] 
		.map (R .tap (function (x) {
			x .setAttribute ('page', '');
		}))
		.map (R .tap (function (x) {
			//when debugging
			/*[] .forEach .call (x .querySelectorAll ('[example]'), function (_) {
				_ .outerHTML = '';
			})*/
		})) [0];
}
var frag = function (html) {
	var container = document .createElement ('template');
	container .innerHTML = html;
	return container .content;
}; 
var bound_rectangle =	function (hint) {
	var svg = (function (el) {
		while (el .tagName .toUpperCase () !== 'SVG') {
			el = el .parentElement;
		} 
		return el;
	}) (hint);
	var id = hint .getAttribute ('xlink:href') || hint .getAttribute ('href');//console.log(id);
	var hint_path = svg .querySelector (id);
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
var input_ify = function (hint) {
	var use_hint = hint .querySelector ('g') .querySelector ('use');
	var bounding_box = bound_rectangle (use_hint)
	
	return  '<rect ' +
				'transform="' + use_hint .getAttribute ('transform') + '" ' +
				'width="' + (bounding_box .x_max - bounding_box .x_min) + '" ' +
				'height="' + (bounding_box .y_max - bounding_box .y_min) + '" ' +
				'fill-opacity="0.001"' +
			'>' +
				'<animate attributeName="fill" from="black" to="blue" dur="1s" repeatCount="indefinite" />' +
			'</rect>' +
			'<foreignObject ' +
				'style="' + hint .getAttribute ('style')+ '; display: block;" ' +
				'transform="' + use_hint .getAttribute ('transform') + '" ' +
				'width="' + (bounding_box .x_max - bounding_box .x_min) + '" ' +
				'height="' + (bounding_box .y_max - bounding_box .y_min) + '" ' +
			'>' +
				'<overflow-clip ' +
					'style="' + 
						'padding: 0;' +
						'background: transparent;' + 
						'width: 100%;' +
						'height: 100%;' + 
						'overflow: hidden;' + 
						'z-index: 9999;' + 
						'display: flex;' + 
						'flex-direction: column;' +
						'align-content: space-around;' +
				'">' +
					'<input ' +
						([] .filter .call (hint .attributes, function (attr) { return attr .nodeName !== 'style' })
							.map (function (attr) {
								return attr .nodeName + '="' + attr .nodeValue + '"'
							}
						) .join (' ')) + ' ' +
						'style="' +
							'outline: none;' + 
							'border: none;' + 
							'padding: 0px;' + 
							'margin: 0px;' + 
							'display: block;' +
							'background: transparent;' +
							'width: 1e+07vw;' + 
							'-webkit-appearance: none;' +
					'">' +
				'</overflow-clip>' +
			'</foreignObject>';
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
		'<positioner text style="' + (hint .getAttribute ('positioner-style') || '') + '">' +
			text .replace (/&/g, "&amp;") .replace (/</g, "&lt;") .replace (/>/g, "&gt;") +
		'</positioner>' +
	'</foreignObject>';
};
var image_ify = function (hint, src) {
	var use_hint = hint .querySelector ('use');
	var bounding_box = bound_rectangle (use_hint)
	
	return '<foreignObject ' +
		([] .filter .call (hint .attributes, function (attr) { return attr .nodeName !== 'style' })
			.map (function (attr) {
				return attr .nodeName + '="' + attr .nodeValue + '"'
			}
		) .join (' ')) + ' ' +
		'transform="' + use_hint .getAttribute ('transform') + '" ' +
		'width="' + (bounding_box .x_max - bounding_box .x_min) + '" ' +
		'height="' + (bounding_box .y_max - bounding_box .y_min) + '" ' +
	'>' +
		'<positioner style="' + (hint .getAttribute ('positioner-style') || '') + '">' +
			(src ?
				'<img src="' + src + '" style="' + (hint .getAttribute ('style') || '') + '">' :
				'<img style="' + (hint .getAttribute ('style') || '') + '">'
			) +
		'</positioner>' +
	'</foreignObject>';
}
var fun_loader_ify = function (hint) {
	if (hint) {
		var use_hint = hint .querySelector ('use');
		var bounding_box = bound_rectangle (use_hint)
		
		var match = use_hint .getAttribute ('transform') .match (/translate\((-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)\)/);
		var x = match [1];
		var y = match [2];
		
		return '<svg viewBox="-20 -20 140 140" ' +
				[] .map .call (hint .attributes, function (attr) {
					return attr .nodeName + '="' + attr .nodeValue + '"'
				}) .join (' ') + ' ' +
				'x="' + x + '" ' +
				'y="' + y + '" ' +
				'width="' + (bounding_box .x_max - bounding_box .x_min) + '" ' +
				'height="' + (bounding_box .y_max - bounding_box .y_min) + '" ' +
			'>' +
				'<g filter="url(#968cf0c5-f88b-458d-afae-646d01b91ab9)" >' +
					'<circle cx="50" cy="0" r="10" transform="rotate(0 50 50)" />' +
					'<circle cx="50" cy="0" r="10" transform="rotate(45 50 50)" />' +
					'<circle cx="50" cy="0" r="10" transform="rotate(90 50 50)" />' +
					'<circle cx="50" cy="0" r="10" transform="rotate(135 50 50)" />' +
					'<circle cx="50" cy="0" r="10" transform="rotate(180 50 50)" />' +
					'<circle cx="50" cy="0" r="10" transform="rotate(225 50 50)" />' +
					'<circle cx="50" cy="0" r="10" transform="rotate(270 50 50)" />' +
					'<circle cx="50" cy="0" r="10" transform="rotate(315 50 50)" />' +
					'<circle loader cx="50" cy="0" r="10" transform="" />' +
				'</g>' +
				'<defs>' +
				    '<filter id="968cf0c5-f88b-458d-afae-646d01b91ab9">' +
						'<feGaussianBlur in="SourceGraphic" result="blur" stdDeviation="10" />' +
						'<feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 21 -7" result="goo" />' +
						'<feBlend in2="goo" in="SourceGraphic" result="mix" />' +
				    '</filter>' +
				'</defs>' +
			'</svg>'
	}
	else 
		return '<svg viewBox="-20 -20 140 140">' +
				'<g filter="url(#968cf0c5-f88b-458d-afae-646d01b91ab9)" >' +
					'<circle cx="50" cy="0" r="10" transform="rotate(0 50 50)" />' +
					'<circle cx="50" cy="0" r="10" transform="rotate(45 50 50)" />' +
					'<circle cx="50" cy="0" r="10" transform="rotate(90 50 50)" />' +
					'<circle cx="50" cy="0" r="10" transform="rotate(135 50 50)" />' +
					'<circle cx="50" cy="0" r="10" transform="rotate(180 50 50)" />' +
					'<circle cx="50" cy="0" r="10" transform="rotate(225 50 50)" />' +
					'<circle cx="50" cy="0" r="10" transform="rotate(270 50 50)" />' +
					'<circle cx="50" cy="0" r="10" transform="rotate(315 50 50)" />' +
					'<circle loader cx="50" cy="0" r="10" transform="" />' +
				'</g>' +
				'<defs>' +
				    '<filter id="968cf0c5-f88b-458d-afae-646d01b91ab9">' +
						'<feGaussianBlur in="SourceGraphic" result="blur" stdDeviation="10" />' +
						'<feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 21 -7" result="goo" />' +
						'<feBlend in2="goo" in="SourceGraphic" result="mix" />' +
				    '</filter>' +
				'</defs>' +
			'</svg>'
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

var recitify = function (dom) {
	[] .forEach .call (dom .querySelectorAll ('[id*="/"]'), function (node) {
		var id = node .getAttribute ('id');
		var parts = id .split (' ');
		if (parts [0] [0] !== '/') {
			node .setAttribute ('id', parts [0]);
			var attribute_string = parts .slice (1) .join (' ');
		}
		else {
			var attribute_string = id;
		}
		
		var attributes = [];
		
		while (attribute_string) {
			var next_attribute = /^\/([^"/ =]+)(?:=([^"/ ]+)|="([^"/]+)")?/ .exec (attribute_string);
			if (! next_attribute)
				throw new Error ('invalid attribute string', id);
			else {
				var name = next_attribute [1];
				var value = next_attribute [2] || next_attribute [3] || '';
				node .setAttribute (name, value);
				attribute_string = attribute_string .slice (next_attribute [0] .length);
				if (attribute_string [0] === ' ')
					attribute_string = attribute_string .slice (1);
			}
		}
	})
}
var uniqify = function (dom) {
	var prefix = 'x-' + require ('uuid/v4') () + '-';
	var defs = dom .querySelector ('defs');
	var ids = [] .map .call (defs .children, function (def) {
		return def .getAttribute ('id');
	});
	[] .forEach .call (defs .children, function (def) {
		return def .setAttribute ('id', prefix + def .getAttribute ('id'));
	});
	walk_dom (dom, function (node) {
		[] .forEach .call (node .attributes, function (attribute) {
			ids .forEach (function (id) {
				if (attribute .nodeValue .includes ('#' + id))
					node .setAttribute (
						attribute .nodeName,
						attribute .nodeValue .split ('#' + id) .join ('#' + prefix + id)
					)
			})
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
	/*[] .forEach .call (x .querySelectorAll ('[example]'), function (y) {
		y .outerHTML = '';
	});*/
	return x;
}

/*var isolated_step = function (i) {
	return function (dom, selector, depth) {
		if (depth === undefined)
			depth = dom_depth (dom);
		if (depth === 0)
			return null;
		else {
			
		}
	}
}

var dom_depth = function (x, depth) {
	depth = depth || 5;
	var max = Math .Infinity;
	var min = 0;
	while (max !== min) {
		if (max === Math .Infinity) depth = depth * 2;
		else depth = Math .ceiling ((max + min) / 2);
		var works = x .querySelector ((new Array (depth)) .fill ('*') .join ('>'));
		if (works) min = depth;
		else max = depth - 1;
	}
	return max;
}*/

var y_translation = function (g) {
	return + g .querySelector ('use') .getAttribute ('transform') .match (/translate\(\d+ (\d+)\)/) [1]
}
var x_translation = function (g) {
	return + g .querySelector ('use') .getAttribute ('transform') .match (/translate\((\d+) \d+\)/) [1]
}
var walk_dom = function (node, func) {
	var continue_ = (func (node) !== false);                     //What does this do?
	node = node .firstElementChild;
	while (continue_ && node) {
		walk_dom (node, func);
		node = node .nextElementSibling;
	}
};
