+ function () {
	var ui_info = pre (function () {
		var ui = frame ('dashboard-create');
		
		[] .forEach .call (ui .querySelectorAll ('#hint[for=input]:not([type=date])'), function (_) {
			_ .outerHTML = input_ify (_);
		});

		[] .forEach .call (ui .querySelectorAll ('#hint[for=image]'), function (_) {
			_ .outerHTML = image_ify (_);
		});

		return {
			dom: serve (ui)
		};
	})

	var step_procession = {
		start: 1,
		1: 2,
		2: 3,
		3: 'done'
	};
	var interaction_ = function (components, unions) {
		var nav = unions .nav;
		
		var step = components .step;
		var steps = R .dissoc ('step') (components);
		

		var extension = interaction (transition (function (intent, license) {
			if (intent [0] === 'step') {
				var step_ = intent [1];
				if (step_procession [step_] !== 'done') {
					step .intent ([step .state (), step_procession [step_]])
					return reflect (none);
				}
				else {
					return function (tenure) {
						var _ = {
							name: steps [1] .state () .name ._,
							school_name: steps [1] .state () .school ._,
							date_of_birth: steps [1] .state () .date_of_birth ._,
							koder_archetype: steps [2] .state () .koder .name,
							koder_name: steps [3] .state () .koder_name ._,
						};
						loader ();
						inquire (api () .add_player, _)
							.then (tap_promise (function (res) {
								if (! res .error) {
									return inquire (api () .player, res)
								}
							}))
							.then (function (res) {
								if (res .error) {
									toast ('There was a problem creating the Koder');
								}
								else {
									toast ('Koder ' + _ .koder_name + ' has been created!');
								}
							})
							.catch (function () {
								toast ('We could not connect to the server. Are you offline?')
							})
							.then (function () {
								loader .stop ();
								nav .state (['done']);
							})
							.then (function () {
								R .forEachObjIndexed (function (x) {
									x .intent ({ _: ['reset'] });
								}) (steps);
								step .intent ([step .state (), 1]);
								tenure .end (true);
							})
					}
				}
			}
			else {
				return decline_ (intent);
			}
		}))
		
		R .forEachObjIndexed (function (x, i) {
			i = +i;
			x .state .thru (filter, R .propEq ('_', 'done')) .thru (tap, function () {
				extension .intent (['step', i]);
			})
		}) (steps)
		
		nav .intent .thru (filter, R .propEq (0, 'prepare')) .thru (tap, function () {
			extension .intent (['step', 'start'])
		});
		
		return interaction_product (R .merge (components) ({
			_: extension,
			
			stepper: extension
		}))
	}

	var _interaction_of_step_ = {
		1: function (components, unions) {
			var nav = unions .nav;
			
			var back = components .back;
			var done = components .done;
			
			var variable = components .variable;
			
			var name = components .name;
			var school = components .school;
			var date_of_birth = components .date_of_birth;
			
			var extension = interaction (transition (function (intent, license) {
				if (intent [0] === 'done') {
					if (! name .state () ._) {
						toast ('Please fill in your name')
						return reflect (none);
					}
					else if (! school .state () ._) {
						toast ('Please fill in your school name')
						return reflect (none);
					}
					else if (! date_of_birth .state () ._) {
						toast ('Please fill in your date of birth')
						return reflect (none);
					}
					else {
						return only_ ('done');
					}
				}
				else if (intent [0] === 'reset') {
					name .intent ({ _: ['reset'] });
					school .intent ({ _: ['reset'] });
					date_of_birth .intent ({ _: ['reset'] });
					return only_ (null);
				}
				else if (intent [0] === 'back') {
					nav .state (['back']);
					return reflect (none);
				}
				else {
					return decline_ (intent);
				}
			}));
			
			extension .state (null);
			
			back .thru (tap, function () {
				extension .intent (['back']);
			})
			done .thru (tap, function () {
				extension .intent (['done']);
			})
			
			var adders = [] .filter .call (variable, function (x) {
				return x .getAttribute ('intent') === 'add';
			}) 
			var unadders = [] .filter .call (variable, function (x) {
				return x .getAttribute ('intent') !== 'add';
			}) 
			nav .intent .thru (filter, R .propEq (0, 'prepare')) .thru (tap, function (x) {
				if (x [1] === 'add') {
					adders .forEach (function (x) {
						x .style .visibility = '';
					});
					unadders .forEach (function (x) {
						x .style .visibility = 'hidden';
					});
				}
				else {
					unadders .forEach (function (x) {
						x .style .visibility = '';
					});
					adders .forEach (function (x) {
						x .style .visibility = 'hidden';
					});
				}
			})

			
			return interaction_product ({
				_: extension,
				
				name: name,
				school: school,
				date_of_birth: date_of_birth
			})
		},
		2: function (components) {
			var go = components .go;
			
			var koder = components .koder;
			
			var extension = interaction (transition (function (intent, license) {
				if (intent [0] === 'go') {
					return only_ ('done')
				}
				else if (intent [0] === 'reset') {
					koder .intent (['reset']);
					return only_ (null);
				}
				else {
					return decline_ (intent);
				}
			}));
			
			extension .state (null);
			
			go .thru (tap, function () {
				extension .intent (['go']);
			})
			
			return interaction_key_sum (koder, interaction_product ({
				_: extension
			}))
		},
		3: function (components) {
			var all_done = components .all_done;
			
			var koder_name = components .koder_name;
			
			var extension = interaction (transition (function (intent, license) {
				if (intent [0] === 'done') {
					if (! koder_name .state () ._) {
						toast ('Please give a name to your Koder!')
						return reflect (none);
					}
					else {
						return only_ ('done');
					}
				}
				else if (intent [0] === 'reset') {
					koder_name .intent ({ _: ['reset'] });
					return only_ (null);
				}
				else {
					return decline_ (intent);
				}
			}));
			
			extension .state (null);
			
			all_done .thru (tap, function () {
				extension .intent (['done']);
			})
			
			return interaction_product ({
				_: extension,
				
				koder_name: koder_name
			})
		}
	}


	window .uis = R .assoc (
		'dashboard-create', function (components, unions) {
			var dom, _dom = ui_info .dom .cloneNode (true);
			
			var step_dom = [] .slice .call (dom .querySelectorAll ('[step]'));
		    var step_cases = [step_dom] .map (R .pipe (
		        R .chain (function (node) {
		            return node .getAttribute ('step') .split (',') .map (function (x) {
		                return [node, x]
		            });
		        }),
		        R .groupBy (R .prop (1)),
		        R .map (R .map (R .prop (0)))
		    )) [0];
			
			//TODO: general rule for getting isolated fragments of stepped dom
			dom = _dom .querySelector ('#dialog[step="1"]');
	
				var back_dom = dom .querySelector ('#back[action=nav]');
				var back_stream = stream_from_click_on (back_dom);
				var done_dom = dom .querySelector ('#done[action=focus]');
				var done_stream = stream_from_click_on (done_dom);
				
				var variable_dom = dom .querySelectorAll ('[intent]');
											
											
				var name_dom = dom .querySelector ('#name');
				var school_name_dom = dom .querySelector ('#school-name');
				var date_of_birth_dom = dom .querySelector ('#date-of-birth');
				
				var name_interaction =	interaction_placeholder (
											name_dom .querySelector ('#placeholder'),
											interaction_input (name_dom .querySelector ('input'))
										);
				var school_name_interaction =	interaction_placeholder (
													school_name_dom .querySelector ('#placeholder'), 
													interaction_input (school_name_dom .querySelector ('input'))
												);
				var date_of_birth_interaction =	interaction_placeholder (
													date_of_birth_dom .querySelector ('#placeholder'), 
													interaction_date_picker (date_of_birth_dom .querySelector ('input'))
												);
	
			dom = _dom;
	
				var go_dom = dom .querySelector ('#go[action=focus]');
				var go_stream = stream_from_click_on (go_dom);
											
				var koders_dom = dom .querySelector ('#koders');		
				var left_dom = koders_dom .querySelector ('#prev');
				var right_dom = koders_dom .querySelector ('#next');
				var image_dom = koders_dom .querySelector ('img');
				
				var koder_interaction =	interaction_select_koders (
											{
												left: left_dom,
												right: right_dom, 
												image: image_dom
											},
											config .koder .choices
										);
	
			dom = _dom .querySelector ('#dialog[step="3"]');
	
				var all_done_dom = dom .querySelector ('#all-done[action=focus]');
				var all_done_stream = stream_from_click_on (all_done_dom);
											
				var koder_name_dom = dom .querySelector ('#name');
				var koder_name_interaction =	interaction_placeholder (
													koder_name_dom .querySelector ('#placeholder'),
													interaction_input (koder_name_dom .querySelector ('input'))
												);
	
			dom = _dom;
			
			return interaction_key_sum (
				interaction_ (
					{
						step: interaction_case (step_cases),
						1: _interaction_of_step_ [1] ({
							back: back_stream,
							done: done_stream,
							
							variable: variable_dom,
							
							name: name_interaction,
							school: school_name_interaction,
							date_of_birth: date_of_birth_interaction
						},
						{
							nav: nav_interaction
						}),
						2: _interaction_of_step_ [2] ({
							go: go_stream,
							koder: koder_interaction
						}),
						3: _interaction_of_step_ [3] ({
							all_done: all_done_stream,
							koder_name: koder_name_interaction
						})
					},
					{
						nav: nav_interaction,
						dom: {
							intent: none,
							state: stream (dom)
						}
					})
			);			
		}
	) (window .uis)
} ();