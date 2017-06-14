var dialogue =	function (thought) {
					var mentions = stream ();
					var impressions = (thought || id) (mentions);
					
					var mention =	function (x) {
										mentions (x)
									}
					var impression =	function () {
											return impressions ();
										}
					
					return	{
								mention: mention,
								impressions: impressions,
								impression: impression,
							};
				};
				
var dialectic =	function (aux, self) {
					self .__parent = aux .parent;
					self .__dialogues = {};
					
					
					self .establish =	function (topic, thought) {
											self .__dialogues [topic] =	typeof thought === 'function'
																		? dialogue (thought)
																		: thought || dialogue ();
											self .__dialogues [topic] .impressions .thru (tap,
												((aux || {}) .impressed || noop) .bind (self, topic))
											
											return self;
										};

					self .personal =	function (topic) {
											return self .__dialogues [topic];
										};
					self .inherited =	function (topic) {
											if (self .__parent)
												return self .__parent .affiliated (topic);
										};
					self .affiliated =	function (topic) {
											return self .personal (topic) || self .inherited (topic);
										};
										
					self .mention =	function (topic, x) {
										self .affiliated (topic) && self .affiliated (topic) .mention (x);
										
										return self;
									};	
					self .impression =	function (topic, x) {
											return self .affiliated (topic) .impression (x);
										};
					self .impressions =	function (topic) {
											return self .affiliated (topic) .impressions;
										};
										
					self .remembers =	function (topic, impression) {
											if (impression !== undefined)
												return	self .establish
															(topic,
															dialogue (function (mentions) {
																return	from (function (memory) {
																			memory (impression);
																			mentions .thru (project, memory);
																		});
															}));
											else
												return	self .establish
															(topic);
										};
				    
				    return self;
				};	