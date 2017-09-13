var debug = true;

if (debug) {
    module .exports =   function () {
                            console .error .apply (console, [
                                (new Array (Math .max (5, 100 - require ('get-cursor-position') .sync () .col))) .join (' ') + '#'
                            ] .concat ([] .slice .call (arguments)));
                        };
    module .exports .indent = function (n) {
        return function () {
            module .exports .apply (this, [(new Array (n + 1)) .join ('  ')] .concat ([] .slice .call (arguments)));
        }
    }                    
}
else {
    module .exports = function () {}   
}
/*
    module .exports =   function () {
                            console .log .apply (console, ['#'] .concat ([] .slice .call (arguments)));
                        }   
*/