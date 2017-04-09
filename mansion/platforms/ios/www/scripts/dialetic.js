var dialogue =	function (viewpoint, compromise, impression) {
					var questions = stream ();
	
					var conversation =	{
											ask: function (q) { questions (q || undefined) },
											findings: (viewpoint || id) (questions),
											consensus:	function () {
															return (conversation .last_consensus || noop) ();
														},
											last_consensus: impression
										};

					conversation .findings .thru (tap, function (finding) {
						conversation .last_consensus = (compromise || constant) (finding);
					})
					
					return conversation;
				};
var dialogify =	function (viewpoint) {
					return dialogue (viewpoint, viewpoint .compromise, viewpoint .impression);
				};
				
var dialetic =	function (parent) {
	                return	function (self, aux) {
								self .__dialogues = {};
							    self .__parent = parent;
								
								
								self .establish =	function (topic, conversation) {
														conversation =	typeof conversation === 'function'
																		? dialogify (conversation)
																		: conversation || dialogue ();
														//dialogue = dialogue || dialogue ();
														self .__dialogues [topic] = conversation;
														self .__dialogues [topic] .findings .thru (tap,
															((aux || {}) .impressed || noop) .bind (self, topic))
														
														return this || self;
													};
								self .destruct =	function (topic) {
														delete self .__dialogues [topic];
			
														return this || self;
													};
		
								self .dialogue =	function (topic) {
														if (topic in self .__dialogues)
															return self .__dialogues [topic];
														else if (self .__parent)
															return self .__parent .dialogue (topic);
													};
													
								self .ask =	function (topic, question) {
												self .dialogue (topic) .ask (question);
												
												return this || self;
											};	
								self .findings =	function (topic) {
														return self .dialogue (topic) .findings;
													};
								self .consensus =	function (topic) {
														return self .dialogue (topic) .consensus ();
			    									};
													
								self .remembers =	function (topic, impression) {
														if (impression)
															return	self .establish
																		(topic, dialogue (id, constant, constant (impression)));
														else
															return	self .establish
																		(topic);
													};
													
								self .thru = function (thru) { return thru (self) };
							    
							    return self;
			                };
				};	