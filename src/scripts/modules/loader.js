var _loader_type = (cordova .platformId === 'browser') ? 'browser' : 'cordova';
var _loader_ok = Promise .resolve ();
var _loader_on = false;


var loader = function (msg) {
    if (_loader_type === 'cordova')
        window .plugins .spinnerDialog .show (null, msg || null, true);    
    else if (! _loader_on)
        _loader_ok = _loader_ok .then (function () {
    		var root = document .createElement ('modules-loader');
    		var component = riot .mount (root, 'modules-loader') [0];
    		_loader_on = component;
    		document .body .insertBefore (root, null);
    		return	Promise .resolve ()
    					.then (function () {
    						root .setAttribute ('active', 'active');
    					})
    					.then (function () {
    						return wait (300)
    					})
        })
    return null;
}
loader .stop = function () {
    if (_loader_type === 'cordova')
        window .plugins .spinnerDialog .hide ();
    else if (_loader_on)
        _loader_ok = _loader_ok 
    					.then (function () {
    						return wait (100)
    					})
    					.then (function () {
    						_loader_on .root .removeAttribute ('active');
    					})
    					.then (function () {
    						return wait (200)
    					}) 
    					.then (function () {
    						_loader_on .unmount ()
    					})
    					.then (function () {
    						_loader_on = false;
    					})
    return null;
}
