var root;
var _picking_of_date_last = Promise .resolve ();
var pick_date =	function () {
					if (! root) {
						root = document .createElement ('modules-date-picker');
						riot .mount (root, 'modules-date-picker') [0];
					}
					return _picking_of_date_last =	_picking_of_date_last
														.then (function () {
															document .body .insertBefore (root, null);
															var val;
															return	wait (100)
																		.then (function () {
																			root .setAttribute ('active', 'active');
																		})
																		.then (function () {
																			return promise_of (function (x) {
																				var w = root .querySelector ('input[date-picker]');
																				var y = function () {
																					val = w .value;
																					x (w .value);
																					w .removeEventListener ('input', y);
																				};
																				w .addEventListener ('input', y);
																			})
																		})
																		.then (function () {
																			root .removeAttribute ('active');
																		})
																		.then (function () {
																			return wait (500)
																		})
																		.then (function () {
																			document .body .removeChild (root);
																			return val;
																		})
														})
				}