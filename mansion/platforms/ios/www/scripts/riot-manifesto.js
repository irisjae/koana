riot .mixin (
	{
		init:	function () {
					(function (self) {
						Object .defineProperty
							(self, 'args', { get: function () { return self .opts } });
						self .render =	function () {
											var args = arguments;
											return	next_tick () .then (function () {
														if (self .isMounted)
															return self .update .apply (self, args);
													})
										};
										
						dialetic (self .__parent || self ._parent || self .parent) 
							(self, {
								//logging
								impressed:	function (what, how) {
												if (what && what [0] === ':')
									            	log (self .tag || self .root .localName, what, how);
											}
							});
						self .self = self;
						self .my = function (topic) { return self .dialogue (topic) && self .consensus (topic); };
						self .me = self .my;
													
						self .have =	function (child) {
											child (self);
											return this || self;
										};
						
						self .event = events_for (self);
						self .uses = belongs_to (self);

						
						/*(function (node) {
							node .event = events_for (node);
			    			node .uses = belongs_to (node);	
			    			
			    			self .on ('unmount', function () {
			    				delete node ['event']
			    				delete node ['uses']
			    			})
						}) (self .root)*/
					}) (this);			
				}
	} );