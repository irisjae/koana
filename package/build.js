//constants
var R = require ('ramda');
var path = require ('path');

var primary_src = require ('./build/config') .paths .primary .src;
var primary_dist = require ('./build/config') .paths .primary .dist;
var uis_src = require ('./build/config') .paths .uis .src;
var uis_dist = require ('./build/config') .paths .uis .dist;
var uis_hydrators_dist = require ('./build/config') .paths .uis .hydrators_dist;
var scripts_src = require ('./build/config') .paths .scripts .src;
var scripts_dist = require ('./build/config') .paths .scripts .dist;
var tags_src = require ('./build/config') .paths .tags .src;
var tags_dist = require ('./build/config') .paths .tags .dist;
var styles_src = require ('./build/config') .paths .styles .src;
var styles_dist = require ('./build/config') .paths .styles .dist;


//utils
var fs = require ('fs-extra');
var time = require ('./build/util') .time;
var file = require ('./build/util') .file;
var files = require ('./build/util') .files;
var write = require ('./build/util') .write;
var prepare = require ('./build/util') .prepare;

var riot_tags = require ('./build/riot');
var uis = require ('./build/uis');
					
					
					


//build
time ('build', function () {
	[
		primary_dist,
		uis_dist,
		uis_hydrators_dist,
		scripts_dist,
		tags_dist,
		styles_dist
	]
	.forEach (prepare);
	
	fs .readdirSync (scripts_dist) .forEach (function (file) {
		const file_path = path .resolve (scripts_dist, file);
		
		fs .unlinkSync (file_path);
	});
	fs .copySync (primary_src, primary_dist);
	files ('.js') (scripts_src)
		.forEach (function (path_/* of file*/) {
			var name = path_ .split ('/') .reverse () [0];
			var dest_path = path .join (scripts_dist, name);
			fs .copySync (path_, dest_path);
		});
	write (uis_dist) (
		files ('.js') (uis_src)
			.map (function (_path) {
				var relative_path = _path .slice (uis_src .length + 1);
				var name =	relative_path
								.split ('/') .join ('_')
								.split ('.') [0];
											
				return time ('preprocessing ' + name, function () {
					return uis .process (file (_path));
				})
			})
			.map (function (src) {
			    return src + ';\n'
			})
			.reduce (function (sum, next) { return sum + next; }, '')
	);
	write (uis_hydrators_dist) (time ('serializing hydrators', uis .hydration));
	files ('.ejs') (tags_src)
		.forEach (function (path) {
			var tag_relative_path = path .slice (tags_src .length + 1);
			var tag_name =	tag_relative_path
								.split ('/') .join ('-')
								.split ('.') [0];
			R .uniq ([tag_name, tag_name .split ('-') .reverse () [0]])
				.forEach (function (name) {
					if (! riot_tags .name_resolution [name]) riot_tags .name_resolution [name] = [];
					riot_tags .name_resolution [name] .push (path)
				})
		})
	write (tags_dist) (
		[files ('.ejs') (tags_src)
			.map (function (tag_path) {
				var tag_relative_path = tag_path .slice (tags_src .length + 1);
				var tag_name =	tag_relative_path
									.split ('/') .join ('-')
									.split ('.') [0];
											
				return time ('parsing ' + tag_name, function () {
					return riot_tags .parse (file (tag_path), tag_name);
				})
			})
			.reduce (function (sum, next) { return sum + next; }, '')
		]
		.map (riot_tags .compile) [0]
	);
	write (styles_dist) (
		[files ('.css') (styles_src) .concat (files ('.scss') (styles_src))
			.map (function (path) {
				return {
					names: [path .split ('/') .reverse () [0] .split ('.') [0]],
					path: path .slice (styles_src .length + 1),
					dependencies: [],
					metastyles: file (path)
				}
			})
			.concat (
			    R .keys (riot_tags .metastyles_resolution) .map (function (name) {
					return {
						names: R .union ([name, name .split ('-') .reverse () [0]], []),
						path: name + '.css',
						dependencies: [],
						metastyles: [(riot_tags .metastyles_resolution [name] || []) .join ('\n')]
							/* implements custom selector */
							.map (function (def) {
								return def .replace (/-> ?{([^}]+)}/g, ' $1');//:not(& $1 $1)');
							})
							//R .tap ((x) => console .log (x)),
							.map (function (def) {
								/*return	tag + ',[data-is="' + tag + '"] {' + '\n' +*/
								return	name + ' {' + '\n' +
											def + '\n' +
										'}';
							})
						[0]
					}
				}))
		]
		.map (function (build_nodes) {
	        var styles = require ('./build/styles');
	
	        var tree = styles .weave (build_nodes);
	
			styles .invalidate ()
			var answer = styles .grow (tree);
			styles .clean ();
			for (var i in answer)
				if (answer [i] .path === '*')
					return answer [i] .styles
			throw 'can\'t find answer'
		}) [0]
    );
});