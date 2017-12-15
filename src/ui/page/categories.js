+ function () {
	var ui_info = pre (function () {
		var ui = frame ('categories');
	
		var scroll_hints = ui .querySelectorAll ('#hint[for=scroll]');
		[] .forEach .call (scroll_hints, fulfill_scroll);
	    
	
	    var category_title_dy, quiz_dx;
	    exemplify (ui .querySelectorAll ('#category[template]'), [function (categories) {
	        var areas = categories .map (function (category) {
	            return category .querySelector ('#hint');
	        });
	        category_title_dy = y_translation (areas [1]) - y_translation (areas [0]);
	    }, function (category) {
			var category_title = category .querySelector ('#title #hint[for=text]');
	            category_title .outerHTML = text_ify (category_title);
	
			exemplify (category .querySelectorAll ('#quiz[template]'), [function (quizes) {
	            var areas = quizes .map (function (category) {
	                return category .querySelector ('#hint[for=click]');
	            });
	            quiz_dx = x_translation (quizes [1]) - x_translation (quizes [0]);
			}, function (quiz) {
	            var name_area = quiz .querySelector ('#name #hint[for=text]');
	                name_area .outerHTML = text_ify (name_area);
	            var icon_area = quiz .querySelector ('#icon #hint[for=image]');
	                icon_area .outerHTML = image_ify (icon_area);
			}]);
	    }]);
		
		/*scripts .unshift (`
		    var category_title_dy = ${category_title_dy};
		    var quiz_dx = ${quiz_dx};
	    `);*/
	
		return {
			dom: serve (ui),
			category_title_dy: category_title_dy,
			quiz_dx: quiz_dx
		};
	});
	
	
	var dom_of_categories = function (dom_, dom_of_category) {
		return function (data) {
	    	var _ = dom_ ();
	        var order = 0;
	        [data] .map (R .forEachObjIndexed (function (subcategories, category) {
	            _ .appendChild (
	            	layout_ (
	            		'y', order ++ * ui_info .category_title_dy,
	            		dom_of_category (subcategories, category)
	        		));
	        }))
	        return _;
		}
	}
	var dom_of_category = function (dom_, dom_of_title, dom_of_subcategories_box,  dom_of_subcategories) {
		return function (subcategories, name) {
	    	var _ = dom_ ();
	        dom_of_title (_) .textContent = name;
	        dom_of_subcategories_box (_) .appendChild (dom_of_subcategories (subcategories));
	        return _;
	    }
	}
	
	var dom_of_subcategories = function (dom_, dom_of_subcategory) {
		return function (data) {
	    	var _ = dom_ ();
	        var order = 0;
	        data .forEach (function (subcategory) {
	            _ .appendChild (
	            	layout_ (
	            		'x', order ++ * ui_info .quiz_dx,
	            		dom_of_subcategory (subcategory)));
	        })
	        return _;
	    }
	}
	var dom_of_subcategory = function (dom_, dom_of_name, dom_of_image) {
		return function (data) {
	        var name = data [0];
	        var image = data [1];
	        var hyphenation = data [2];
	        
	        var _ = dom_ ();
	        	_ .setAttribute ('_name', name);
	            dom_of_name (_) .querySelector ('[text]') .textContent = hyphenation;
	            dom_of_image (_) .querySelector ('img') .setAttribute ('src', image);
	        return _;
	    }
	};
		
	var interaction_ = function (dom_of_categories_box, dom_of_categories) {
		return function (components, unions) {
	        var back = components .back;
	        var category_scroll = components .category_scroll;
	        var categories = components .categories;
	        
	        var dom = components .dom;
	        var nav = unions .nav;
		    
		    var interactions_of_categories = stream ();
		    
		    var extension = interaction (transition (function (intent, license) {
		    	if (intent [0] === 'update') {
		    		return function (tenure) {
			            loader ('Updating with new quizes...');
			            while (dom_of_categories_box .firstChild) dom_of_categories_box .removeChild (dom_of_categories_box .firstChild);
			            return inquire (api () .subcategories) .then (function (subcategories) {
			                dom_of_categories_box .appendChild (dom_of_categories (subcategories));
			            	interactions_of_categories (
			            		categories (dom_of_categories_box));
				            loader .stop ();
				            tenure (subcategories);
				            tenure .end (true);
				        })
		    		}
		    	}
		    	else
		    		return decline_ (intent);
		    }));
	             
			[back]
				.forEach (tap (function () {
					nav .state (['back']);
				})); 
	
		    [nav .intent]
			    .map (filter (function (x) {
					return R .head (x) === 'prepare'
			    }))
			    .forEach (tap (function (x) {
			    	extension .intent (['update']);
			    }));
		    
		    return {
		    	_: extension,
		    	category_scroll: category_scroll,
		    	categories: interactions_of_categories,
		    	dom: {
		    		intent: none,
		    		state: stream (dom)
		    	}
		    }
		}
	}

	window .uis = R .assoc (
		'categories', function (components, unions) {
			var nav = unions .nav;
			
			var dom = ui_info .dom .cloneNode (true);
		
			var back_dom = dom .querySelector ('#header') .querySelector ('#back');
			var back_stream = stream_from_click_on (back_dom);
		
			var category_box_dom = dom .querySelector ('#categories[scroll]');
			var category_scroll_interaction = scroll_interaction ('y') (category_box_dom);
		
			var dom_for_category = function () { return category_dom_template .cloneNode (true); }
				var category_dom_template = dom .querySelector ('#category[template]') .cloneNode (true);
					category_dom_template .removeAttribute ('template');
			var dom_for_category_title = function (category) { return category .querySelector ('#title #hint[for=text]') };
			var dom_for_subcategory_box = function (category) { return category .querySelector ('#subcategories[scroll]') };
			
			var dom_for_subcategory = function () { return subcategory_dom_template .cloneNode (true); }
				var subcategory_dom_template = dom .querySelector ('#quiz[template]') .cloneNode (true);
					subcategory_dom_template .removeAttribute ('template');
			var dom_for_name = function (category) { return category .querySelector ('#name #hint[for=text]') };
			var dom_for_image = function (category) { return category .querySelector ('#icon #hint[for=image]') };
			
			var all_subcategory = function (dom) { return dom .querySelectorAll ('#quiz:not([template])'); }
			var all_subcategory_scroll_box = function (dom) { return dom .querySelectorAll ('#subcategories[scroll]'); }
			
			//detect when svg is properly loaded
			var svg = dom;
		    svg .addEventListener ('load', (x)=>console.log(x));
			
			return R .merge (R .__, {
				nav: nav,
				dom: dom
			}) (interaction_ (
				category_box_dom,
				dom_of_categories (create_document_fragment,
					dom_of_category (dom_for_category,
						dom_for_category_title,
						dom_for_subcategory_box,
						dom_of_subcategories (create_document_fragment,
							dom_of_subcategory (dom_for_subcategory,
								dom_for_name,
								dom_for_image))))
			) (
				{
					back: back_stream,
					category_scroll: category_scroll_interaction,
					categories: R .converge (function (subcategory_scroll_boxes, subcategories) {
						[] .forEach .call (subcategories, function (_) {
							var name = _ .getAttribute ('_name');
							[stream_from_click_on (_)]
								.forEach (tap (function () {
									nav .state (['subcategory', name]);
								}));
						});
						return [] .map .call (subcategory_scroll_boxes, scroll_interaction ('x'))
					}, [all_subcategory_scroll_box, all_subcategory]),
					dom: dom
				},
				{
					nav: nav
				}
			));
		}
	) (window .uis)	
} ();