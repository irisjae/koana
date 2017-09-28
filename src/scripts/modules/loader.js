var _loader_type = (cordova .platformId === 'browser') ? 'browser' : 'cordova';
var _loader;
var _loader_ok = Promise .resolve ();
var _loader_on = false;


var loader = function (msg) {
    if (_loader_type === 'cordova')
        window .plugins .spinnerDialog .show (null, msg || null, true);    
    else if (! _loader_on) {
		_loader_on = true;
        if (! _loader) {
    		_loader = riot .mount (document .createElement ('modules-loader'), 'modules-loader') [0];
        }
        _loader_ok = _loader_ok .then (function () {
    		document .body .insertBefore (_loader .root, null);
    		return	Promise .resolve ()
    					.then (function () {
    						_loader .root .setAttribute ('active', 'active');
    					})
    					.then (function () {
    						return wait (300)
    					})
        })
    }
    return null;
}
loader .stop = function () {
    if (_loader_type === 'cordova')
        window .plugins .spinnerDialog .hide ();
    else if (_loader_on) {
		_loader_on = false;
        _loader_ok = _loader_ok 
    					.then (function () {
    						return wait (100)
    					})
    					.then (function () {
    						_loader .root .removeAttribute ('active');
    					})
    					.then (function () {
    						return wait (200)
    					}) 
    }
    return null;
}
