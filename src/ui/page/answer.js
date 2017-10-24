+ function () {
	var ui_info = pre (function () {
		var ui = frame ('answer');
		
		return {
			dom: serve (ui)
		};
	})
	
	/*
	var font_string = function (weight, size, family) {
		return weight + ' ' + size + ' ' + family
	};
	if scroll > client,
		then it means overflow.
	… mark
	[$0].forEach(function (root) {
		var x = document .createElement ('div');
		x.style.width = '100%';
		x.style.wordBreak = 'break-all';
		x.style.height = '300px';
		x.textContent = 'hoohohohohohohohohohohohohohohohohohohoho';
		root .append (x);
		log (x.clientWidth, x.scrollWidth);
		log (x.clientHeight, x.scrollHeight);
		root .removeChild (x);
	})
	*/
	
	var interaction_ = function (components, dom) {
		var cases = components .cases;
	
		var remaining_questions = api () .set .from () .questions .filter (function (x) {
			return ! ('score' in x)
		});
		var question = remaining_questions [0];
	
	
		return interaction (transition (function (intent, state) {
			if (intent [0] === 'prepare') {
				
			}
			else
				return decline_ (intent);
		}))
	};


	window .uis = R .assoc (
		'answer', function (components, unions) {
			var nav = unions .nav;
			
			var dom = ui_info .dom .cloneNode (true);
			
			return interaction_ ({
				cases: dom_tree ({
					_: dom,
					_image: {
						_: '#_[image]',
						question: {
							_: '#question[template]',
							_long: '#_[long]',
							_middle: '#_[middle]',
							_short: '#_[short]' },
						answers: {
							_: '#answers',
							answer: {
								_: '#answer[template]',
								_long: '#_[long]',
								_short: '#_[short]' } } },
					_plain: {
						_: '#_[plain]',
						question: {
							_: '#question[template]',
							_long: '#_[long]',
							_middle: '#_[middle]',
							_short: '#_[short]' },
						answers: {
							_: '#answers',
							_long: {
								_: '#_[long]',
								answer: {
									_: '#answer[template]',
									_long: '#_[long]',
									_middle: '#_[middle]',
									_short: '#_[short]' } },
							_short: {
								_: '#_[short]',
								answer: {
									_: '#answer[template]' } } } }
				})
			});
		}
	) (window .uis)	
} ();
		

/*var is_fork = R .startsWith ('_');

var interaction_from_case_tree = function (cases) {
	var fork_info = R .memoize (function (state) {
		var path = get_paths (state) [0];
		if (! path)
			throw new Error ('no path');
		var fork_index = R .findLastIndex (is_fork) (path);
		var fork_path = path .slice (0, fork_index + 1);
		var fork = layer (cases, fork_path);
		return {
			_: fork,
			path: fork_path
		}
	});
	
	var node_of_leaf = function (node) {
		return node ._ || node;
	}
	
	var nodes_to_hide = function (state) {
		var fork = fork_info (state);
		return [fork ._]
			.map (filterObjIndexed (function (x, key) {
				return key !== '_'
			}))
			.map (filterObjIndexed (function (x, key) {
				return key !== R .last (fork .path)
			}))
			.map (R .values)
			.map (R .map (node_of_leaf))
		[0]
	};
	var nodes_to_show = function (state) {
		var fork = fork_info (state);
		return [fork ._ [R .last (fork .path)]] .map (node_of_leaf)
	};
	
	return interaction (transition (function (intent, license) {
		var new_state = intent;
		return function (tenure) {
			nodes_to_hide (new_state)
				.forEach (function (node) {
					node .style .visibility = 'hidden';
				})
			nodes_to_show (new_state)
				.forEach (function (node) {
					node .style .visibility = '';
				})
			tenure (new_state);
			tenure .end (true);
		}
	}))
};

var layer = function (trie, path) {
	if (path .length <= 1) return trie;
	else {
		var head = R .head (path);
		return layer (trie [head], R .tail (path));
	}
}

var make_trie = function (list_of_strings) {
	return [list_of_strings]
		.map (R .groupBy (R .head))
		.map (R .map (
			R .pipe (
				R .map (R .tail),
				R .filter (R .length),
				make_trie)
		))
	[0]
};
var get_paths = R .pipe (
	R .toPairs,
	R .map (function (pair) {
		var key = pair [0]
		var value = pair [1]
		if (R .is (Object) (value)) {
			return get_paths (value)
				.map (function (path) {
					return [key] .concat (path)
				})
		}
		else {
			return [[key]]
		}
	}),
	R .unnest
)*/