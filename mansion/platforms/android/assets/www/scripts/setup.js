/*
Use app
*/
riot .settings .skipAnonymousTags = false;
document .addEventListener ('DOMContentLoaded', function () {
	riot .mount ('*');
});
/*
Catch errors
*/
riot .util .tmpl .errorHandler = log .error;/* now riot throws automatically. still catch with log? */
window .onerror =   function (message, source, lineno, colno, error) {
						if ((((message || {}) .srcElement || {}) .outerHTML || {} ) [0] === '<script src="cordova.js') {
							log .error ('does not contain real cordova');
						}
						else if (message && message === "Uncaught TypeError: Cannot read property 'OneSignal' of undefined"
								&& ((source || {}) .indexOf || noop) ('/scripts/setup.js') !== -1) {
							log .error ('does not contain cordova onesignal');
						}
						else {
							log .error ('error', arguments);
							log .error ('stack', (error || {}) .stack);
						}
					};
/*
Use flatpickr
*/
Flatpickr .localize (Flatpickr .l10ns .hk);
/*
Use Leaflet
*/
L .Icon .Default .imagePath = 'imgs/';
/*
Register Open FB
*/
openFB .init (
	{
		appId: 825433247584933,
		cordova: true,
		oauthRedirectURL: frontend_path + '/fb/login.html',
		cordovaOAuthRedirectURL: frontend_path + '/fb/login.html',
		logoutRedirectURL: frontend_path
	}
);
/*
Register OneSignal
*/
document .addEventListener ('deviceready', function () {
	// Enable to debug issues.
	// window.plugins.OneSignal.setLogLevel({logLevel: 4, visualLevel: 4});
	
	var notificationOpenedCallback =	function (jsonData) {
											alert ('didReceiveRemoteNotificationCallBack: ' + JSON .stringify (jsonData));
										};
	
	window .plugins .OneSignal .init ("bc053930-f661-4267-8ef9-dbb378eb58b9",{
		googleProjectNumber: "972661889806"
	}, notificationOpenedCallback);
	
	// Show an alert box if a notification comes in when the user is in your app.
	window .plugins .OneSignal .enableInAppAlertNotification (true);
}, false);