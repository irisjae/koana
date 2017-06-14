var paper = function (impl) {
				return	function (args) {
							return	{
										realize:	function (parent) {
														return  (function (self) {
																	self .args = args;
											
																	dialectic ({ parent: parent,
																		//logging
																		impressed:	function (what, how) {
																						//if (what && what [0] === ':')
																			            	log ('paper', what, how);
																					}
																	}, self);
																	self .self = self;
																	self .my = function (topic) { return self .affiliated (topic) && self .impression (topic); };
																	
																	self .recognize =	function (paper) {
																							paper .realize (self);
																							return self;
																						};
																	self .thru =	function (func, args) {
																						return	func .apply (
																									self, [] .concat .call (args || [], [self])
																								);
																					};
																	
																	impl (self, args, self .my);
																	
																	return self;
																}) ({});
													}
									}
						};
			};