var paper = function (impl) {
				return	function (args, yield_) {
							return	function (parent) {
										return  (function (self) {
													self .args = args;
													self .parent = parent;
							
													dialetic (self .parent)
														(self);
													self .self = self;
													self .my = function (topic) { return self .dialogue (topic) && self .consensus (topic); };
													self .me = self .my;		
													
													self .have =	function (child) {
																		child (self);
																		return this || self;
																	};
													
													impl (self, args, self .me, self .my, yield_);
													
													return self;
												}) ({});
									}
						};
			};