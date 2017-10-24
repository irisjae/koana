var path = require ('path');

var base_path = path .join (__dirname, '/../..');

module .exports = {
	paths: {
		primary: {
			src: path .join (base_path, '/src/&.html'),
			dist: path .join (base_path, '/www/index.html')
		},
		frames: {
			src: path .join (base_path, '/src/frames')
		},
		uis: {
			utils_src: path .join (base_path, '/src/scripts/modules/pre.js'),
			src: path .join (base_path, '/src/ui/page'),
			dist: path .join (base_path, '/www/scripts/ui.js'),
			hydrators_dist: path .join (base_path, '/www/scripts/ui-hydrators.js')
		},
		scripts: {
			src: path .join (base_path, '/src/scripts'),
			dist: path .join (base_path, '/www/scripts'),
			pre: path .join (base_path, '/src/scripts/modules/pre.js')
		},
		pages: {
			src: path .join (base_path, '/src/ui/page')
		},
		tags: {
			src: path .join (base_path, '/src/ui'),
			dist: path .join (base_path, '/www/scripts/tags.js'),
			strs_dist: path .join (base_path, '/www/scripts/tag-strs.js')
		},
		styles: {
			src: path .join (base_path, '/src/styles'),
			dist: path .join (base_path, '/www/styles/styles.css'),
			
			cache: path .join (base_path, '/www/styles/cache'),
			copy: path .join (base_path, '/www/styles/copy'),
			dir: path .join (base_path, '/www/styles')
		}
	}
}