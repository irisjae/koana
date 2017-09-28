var _toast_type = (cordova .platformId === 'browser') ? 'browser' : 'cordova';

var toast = function (text) {
	toast .last =	toast .last
						.then (_toast_type === 'browser' ? function () {
							var root = document .createElement ('modules-snackbar');
							root .textContent = text;
							var component = riot .mount (root, 'modules-snackbar') [0];
							document .body .insertBefore (root, null);
							return	wait (100)
										.then (function () {
											root .setAttribute ('active', 'active');
										})
										.then (function () {
											return wait (toast .duration)
										})
										.then (function () {
											root .removeAttribute ('active');
										})
										.then (function () {
											return wait (500)
										})
										.then (function () {
											component .unmount ();
										})
						} : function () {
							return	new Promise (function (resolve) {
										window .plugins .toast .showWithOptions ({
												message: text,
												duration: toast .duration,
												position: 'bottom',
											}, function (result) {
												if (result && result .event) {
													if (result .event === 'hide') {
														resolve ();
													}
												}
											}, function (error) {
												/*document .body ._tag .impressions (':exception') ({
													source: 'toast',
													data: error
												});*/
												resolve ();
											}
										);
									}) .then (function () {
										return wait (500)
									})
						})
	return null;
};
toast .last = Promise .resolve ();
toast .duration = 2000;