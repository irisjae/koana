var R = require ('ramda');
var jsdom = require ('jsdom');
var esprima = require ('esprima');

var uis_utils_src = require ('./config') .paths .uis .utils_src;


var file = require ('./util') .file;

var node_transformable = function (node) {
    return (node .type === 'CallExpression') && node .callee .name === 'pre';
};

var pre_transform = function (source, transformer) {
    var items = [];
    esprima .parseScript (source, {}, function (node, meta) {
        if (node_transformable (node)) {
        	//console .log (meta .start .offset, meta .end .offset, source .slice (meta .start .offset, meta .end .offset));
            items .push ({
                start: meta.start.offset,
                end: meta.end.offset
            });
        }
    });
    items .sort (function (a, b) { return b.end - a.end })
	    .forEach (function (item) {
	        source = source .slice (0, item .start) + transformer (source .slice (item .start, item .end)) + source .slice (item .end);
	    });
    return source;
};

var window = (new jsdom .JSDOM ()) .window;
with (window) {
	eval (file (uis_utils_src));
	
	var hydrators = [];
	var dehydrate = function (data) {
		if (data === undefined)
			return undefined;
		else if (data === null)
			return 'null';
		else if (data .constructor === String)
			return '"' + data .replace (/"/g, '\\"') + '"';
		else if (data .constructor === Number)
			return String (data)
		else if (data .constructor === Boolean)
			return data ? 'true' : 'false'
		else if (data .constructor === Array)
			return '[ ' + data .reduce (function (acc, v) {
				if (v === undefined)
					return acc .concat (['null'])
				else
					return acc .concat ([dehydrate (v)])
			}, []) .join(', ') + ' ]'
		else if (data instanceof Node) {
			var serialization = '__hydrators [' + hydrators .length + ']';
			hydrators .push (data);
			return serialization;
		}
		else if (data .constructor === Object)
			return '{ ' + Object .keys (data) .reduce (function (acc, k) {
				if (data [k] === undefined)
					return acc
				else
					return acc .concat ([dehydrate (k) + ':' + dehydrate (data [k])])
			}, []) .join (', ') + ' }'
		else
			return '{}'
	};
}
var pre = function (fn) { return fn (); };
var process = function (def, scope) {
	with (scope || {}) {
		return pre_transform (def, R .pipe (
			function (pre_fn) {
				with (window) {
					return eval (pre_fn);
				}
			},
			dehydrate
		))
	}
};

module .exports = {
	hydrators: hydrators,
	process: process,
	hydration: function () {
		//maybe switch to parse5?
		return 'var __hydrators = [' + '\n' +
				hydrators .map (function (node) {
					return 'frag (' + '`' + /*time ('get outerhtml', () => */node .outerHTML/*)*/ + '`' + ') .childNodes [0]'
					//HACK: hack for speed. replace with actual stringify in production
					//return 'frag (' + JSON .stringify (node .outerHTML) + ') .childNodes [0]'
				}) .join (',' + '\n') +
			'];';
	}
}