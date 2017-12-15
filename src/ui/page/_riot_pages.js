+ function () {
	window ._riot_pages = pre (function () {
		var pages_src = require ('./config') .paths .pages .src;
		var files = require ('./util') .files;
		
		var pages =	files ('.ejs') (pages_src)
						.map (function (tag_path) {
							var tag_relative_path = tag_path .slice (pages_src .length + 1);
							var tag_name =	R .head (tag_relative_path
												.split ('/') .join ('-')
												.split ('.')
											);
							return tag_name
						})
						.filter (R .identity)
						.filter (R .compose (R .not, R .equals ('_')));
		return pages;
	});
} ();