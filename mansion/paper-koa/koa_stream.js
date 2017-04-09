/*
//partitioned middle
var async_tap =	function (async_tapper) {
					return	 function (stream) {
								return	stream .map (function (x) {
											return (async_tapper (x) || Promise .resolve ()) .then (function () { return x; })
										}) .await ();
							};
				};
				
function (middleware) {
					return	function (contexts, bridge) {
								return	contexts
											.map (function (ctx) {
												ctx .wait = ctx .wait || [];
												ctx .middle = ctx .middle || [];
												
												return ctx;
											})
											.map (function (ctx) {
												ctx .wait .push (new Promise (function (resolve) { ctx .wait .reverse () [0] .resolve = resolve }));
												ctx .middle .push (middleware (ctx, ctx .wait));
												
												return ctx;
											})
											.thru (bridge)
											.map (function (ctx) {
												ctx .wait .pop () .resolve ();
												return  ctx .middle .pop ()
												            .then (function () {
												                return ctx;
												            });
											}) .await ();
							};
				};*/
/*
//total middle
var middle =	function (/*middleware.../) {
					var compose = require ('koa-compose');
					var middleware = compose ([] .slice .call (arguments));
					var next = constant (Promise .resolve ());
					return	 function (stream) {
								return	stream .map (function (ctx) {
											return middleware (ctx, next) .then (constant (ctx));
										}) .await ();
							};
				};*/
				
//delegation middle
var Map = require ('es6-map');
var middle =	function (middleware) {
					return	function (delegation, contexts) {
								var resolves = new Map ();
								var waits = new Map ();
								return	contexts
											.tap (function (ctx) {
												waits .add (ctx, new Promise (function (resolve) { resolves .add (ctx, resolve); }));
												middleware (ctx, waits .get (ctx))
											})
											.thru (delegation)
											.map (function (ctx) {
												var resolve = resolves .get (ctx); resolves .delete (ctx);
												var wait = waits .get (ctx); waits .delete (ctx);
												resolve (); return wait .then (constant (ctx));
											}) .await ();
							};
				};
var body =	function (pathway) {
				return	function (ctx, next) {
							ctx .response = pathway (most .fromReadableStream (ctx .request));
							return next ();
						};
			};
				