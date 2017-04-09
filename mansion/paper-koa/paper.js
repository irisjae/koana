var paper = function (impl) {
				return	function (args, yield_) {
							return	function (parent) {
										return  (function (self) {
													self .args = args;
													self .parent = parent;
											
													dialectic (self .parent)
														(self);
													self .self = self;
													self .my =	self .impression;
													self .me = self .my;		
													
													self .have =	function (child) {
																		child (self);
																		return this || self;
																	};
													
													impl (self, self .me, self .my, yield_);
													
													return self;
												}) ({});
									}
						};
			};