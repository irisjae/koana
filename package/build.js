//constants
var R = require ('ramda');
var jsdom = require ('jsdom');
var compiler = require ('riot-compiler');
var scss = require ('node-sass');
var path = require ('path');
var primary_src = path .join (__dirname, '/../src/&.html');
var primary_dist = path .join (__dirname, '/../www/index.html');
var scripts_src = path .join (__dirname, '/../src/scripts');
var scripts_dist = path .join (__dirname, '/../www/scripts');
var tags_src = path .join (__dirname, '/../src/ui');
var tags_dist = path .join (__dirname, '/../www/scripts/ui.js');
var styles_src = path .join (__dirname, '/../src/styles');
var styles_cache = path .join (__dirname, '/../www/styles/cache');
var styles_copy = path .join (__dirname, '/../www/styles/copy');
var styles_dir = path .join (__dirname, '/../www/styles');
var styles_dist = path .join (__dirname, '/../www/styles/styles.css');

//cps functor/identity natural transformation
var mapper =	function (x) {
					return	{
								unwrapped:	x,
								map:	function (fn) {
									return mapper (fn (x));
								}
							}
				}
				
				
//utils
var fs = require ('fs-extra');
var files =	function (extension) {
				return	function (dir) {
							var results = [];
							var list = fs .readdirSync (dir);
							list .forEach (function (file) {
								file = path .join (dir, file);
								var stat = fs .statSync (file);
								if (stat && stat .isDirectory ())
									results = results .concat (files (extension) (file));
								else if (file .endsWith (extension))
									results .push (file);
							});
							return results;
						}
			};
var file =	function (path) {
				return fs .readFileSync (path) .toString ();
			};
var write =	function (path) {
				return	function (string) {		
							fs .outputFileSync (path, string);
						}
			};
var time =	function (name, what) {
				var start = new Date ();
				try {
					var x = what ();
					console .log (name, 'took', (new Date () - start) / 1000, 's');
				}
				catch (e) {
					if (! (e && e .reported)) {
						console .log (name, 'failed', (new Date () - start) / 1000, 's');
					}
					else {
						console .log (name, 'failed', (new Date () - start) / 1000, 's', e);
						if (e)
							e .reported = true;
					}
					throw e;
				}
				return x;
			};
var md5 = function (string) { function RotateLeft(lValue, iShiftBits) { return (lValue<<iShiftBits) | (lValue>>>(32-iShiftBits)); } function AddUnsigned(lX,lY) { var lX4,lY4,lX8,lY8,lResult; lX8 = (lX & 0x80000000); lY8 = (lY & 0x80000000); lX4 = (lX & 0x40000000); lY4 = (lY & 0x40000000); lResult = (lX & 0x3FFFFFFF)+(lY & 0x3FFFFFFF); if (lX4 & lY4) { return (lResult ^ 0x80000000 ^ lX8 ^ lY8); } if (lX4 | lY4) { if (lResult & 0x40000000) { return (lResult ^ 0xC0000000 ^ lX8 ^ lY8); } else { return (lResult ^ 0x40000000 ^ lX8 ^ lY8); } } else { return (lResult ^ lX8 ^ lY8); } } function F(x,y,z) { return (x & y) | ((~x) & z); } function G(x,y,z) { return (x & z) | (y & (~z)); } function H(x,y,z) { return (x ^ y ^ z); } function I(x,y,z) { return (y ^ (x | (~z))); } function FF(a,b,c,d,x,s,ac) { a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac)); return AddUnsigned(RotateLeft(a, s), b); }; function GG(a,b,c,d,x,s,ac) { a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac)); return AddUnsigned(RotateLeft(a, s), b); }; function HH(a,b,c,d,x,s,ac) { a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac)); return AddUnsigned(RotateLeft(a, s), b); }; function II(a,b,c,d,x,s,ac) { a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac)); return AddUnsigned(RotateLeft(a, s), b); }; function ConvertToWordArray(string) { var lWordCount; var lMessageLength = string.length; var lNumberOfWords_temp1=lMessageLength + 8; var lNumberOfWords_temp2=(lNumberOfWords_temp1-(lNumberOfWords_temp1 % 64))/64; var lNumberOfWords = (lNumberOfWords_temp2+1)*16; var lWordArray=Array(lNumberOfWords-1); var lBytePosition = 0; var lByteCount = 0; while ( lByteCount < lMessageLength ) { lWordCount = (lByteCount-(lByteCount % 4))/4; lBytePosition = (lByteCount % 4)*8; lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount)<<lBytePosition)); lByteCount++; } lWordCount = (lByteCount-(lByteCount % 4))/4; lBytePosition = (lByteCount % 4)*8; lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80<<lBytePosition); lWordArray[lNumberOfWords-2] = lMessageLength<<3; lWordArray[lNumberOfWords-1] = lMessageLength>>>29; return lWordArray; }; function WordToHex(lValue) { var WordToHexValue="",WordToHexValue_temp="",lByte,lCount; for (lCount = 0;lCount<=3;lCount++) { lByte = (lValue>>>(lCount*8)) & 255; WordToHexValue_temp = "0" + lByte.toString(16); WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length-2,2); } return WordToHexValue; }; function Utf8Encode(string) { string = string.replace(/\r\n/g,"\n"); var utftext = ""; for (var n = 0; n < string.length; n++) { var c = string.charCodeAt(n); if (c < 128) { utftext += String.fromCharCode(c); } else if((c > 127) && (c < 2048)) { utftext += String.fromCharCode((c >> 6) | 192); utftext += String.fromCharCode((c & 63) | 128); } else { utftext += String.fromCharCode((c >> 12) | 224); utftext += String.fromCharCode(((c >> 6) & 63) | 128); utftext += String.fromCharCode((c & 63) | 128); } } return utftext; }; var x=Array(); var k,AA,BB,CC,DD,a,b,c,d; var S11=7, S12=12, S13=17, S14=22; var S21=5, S22=9 , S23=14, S24=20; var S31=4, S32=11, S33=16, S34=23; var S41=6, S42=10, S43=15, S44=21; string = Utf8Encode(string); x = ConvertToWordArray(string); a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476; for (k=0;k<x.length;k+=16) { AA=a; BB=b; CC=c; DD=d; a=FF(a,b,c,d,x[k+0], S11,0xD76AA478); d=FF(d,a,b,c,x[k+1], S12,0xE8C7B756); c=FF(c,d,a,b,x[k+2], S13,0x242070DB); b=FF(b,c,d,a,x[k+3], S14,0xC1BDCEEE); a=FF(a,b,c,d,x[k+4], S11,0xF57C0FAF); d=FF(d,a,b,c,x[k+5], S12,0x4787C62A); c=FF(c,d,a,b,x[k+6], S13,0xA8304613); b=FF(b,c,d,a,x[k+7], S14,0xFD469501); a=FF(a,b,c,d,x[k+8], S11,0x698098D8); d=FF(d,a,b,c,x[k+9], S12,0x8B44F7AF); c=FF(c,d,a,b,x[k+10],S13,0xFFFF5BB1); b=FF(b,c,d,a,x[k+11],S14,0x895CD7BE); a=FF(a,b,c,d,x[k+12],S11,0x6B901122); d=FF(d,a,b,c,x[k+13],S12,0xFD987193); c=FF(c,d,a,b,x[k+14],S13,0xA679438E); b=FF(b,c,d,a,x[k+15],S14,0x49B40821); a=GG(a,b,c,d,x[k+1], S21,0xF61E2562); d=GG(d,a,b,c,x[k+6], S22,0xC040B340); c=GG(c,d,a,b,x[k+11],S23,0x265E5A51); b=GG(b,c,d,a,x[k+0], S24,0xE9B6C7AA); a=GG(a,b,c,d,x[k+5], S21,0xD62F105D); d=GG(d,a,b,c,x[k+10],S22,0x2441453); c=GG(c,d,a,b,x[k+15],S23,0xD8A1E681); b=GG(b,c,d,a,x[k+4], S24,0xE7D3FBC8); a=GG(a,b,c,d,x[k+9], S21,0x21E1CDE6); d=GG(d,a,b,c,x[k+14],S22,0xC33707D6); c=GG(c,d,a,b,x[k+3], S23,0xF4D50D87); b=GG(b,c,d,a,x[k+8], S24,0x455A14ED); a=GG(a,b,c,d,x[k+13],S21,0xA9E3E905); d=GG(d,a,b,c,x[k+2], S22,0xFCEFA3F8); c=GG(c,d,a,b,x[k+7], S23,0x676F02D9); b=GG(b,c,d,a,x[k+12],S24,0x8D2A4C8A); a=HH(a,b,c,d,x[k+5], S31,0xFFFA3942); d=HH(d,a,b,c,x[k+8], S32,0x8771F681); c=HH(c,d,a,b,x[k+11],S33,0x6D9D6122); b=HH(b,c,d,a,x[k+14],S34,0xFDE5380C); a=HH(a,b,c,d,x[k+1], S31,0xA4BEEA44); d=HH(d,a,b,c,x[k+4], S32,0x4BDECFA9); c=HH(c,d,a,b,x[k+7], S33,0xF6BB4B60); b=HH(b,c,d,a,x[k+10],S34,0xBEBFBC70); a=HH(a,b,c,d,x[k+13],S31,0x289B7EC6); d=HH(d,a,b,c,x[k+0], S32,0xEAA127FA); c=HH(c,d,a,b,x[k+3], S33,0xD4EF3085); b=HH(b,c,d,a,x[k+6], S34,0x4881D05); a=HH(a,b,c,d,x[k+9], S31,0xD9D4D039); d=HH(d,a,b,c,x[k+12],S32,0xE6DB99E5); c=HH(c,d,a,b,x[k+15],S33,0x1FA27CF8); b=HH(b,c,d,a,x[k+2], S34,0xC4AC5665); a=II(a,b,c,d,x[k+0], S41,0xF4292244); d=II(d,a,b,c,x[k+7], S42,0x432AFF97); c=II(c,d,a,b,x[k+14],S43,0xAB9423A7); b=II(b,c,d,a,x[k+5], S44,0xFC93A039); a=II(a,b,c,d,x[k+12],S41,0x655B59C3); d=II(d,a,b,c,x[k+3], S42,0x8F0CCC92); c=II(c,d,a,b,x[k+10],S43,0xFFEFF47D); b=II(b,c,d,a,x[k+1], S44,0x85845DD1); a=II(a,b,c,d,x[k+8], S41,0x6FA87E4F); d=II(d,a,b,c,x[k+15],S42,0xFE2CE6E0); c=II(c,d,a,b,x[k+6], S43,0xA3014314); b=II(b,c,d,a,x[k+13],S44,0x4E0811A1); a=II(a,b,c,d,x[k+4], S41,0xF7537E82); d=II(d,a,b,c,x[k+11],S42,0xBD3AF235); c=II(c,d,a,b,x[k+2], S43,0x2AD7D2BB); b=II(b,c,d,a,x[k+9], S44,0xEB86D391); a=AddUnsigned(a,AA); b=AddUnsigned(b,BB); c=AddUnsigned(c,CC); d=AddUnsigned(d,DD); } var temp = WordToHex(a)+WordToHex(b)+WordToHex(c)+WordToHex(d); return temp.toLowerCase(); };


//domain functions
var indent =	function (string) {
					return '\t' + string .split ('\n') .join ('\n\t');
				};
var css = require ('css');


scss .compile =	function (metastyles) {
					return	(scss .renderSync ({
								data: metastyles || '/**/'/*,
								omitSourceMapUrl: true,
								sourceMap: false,
								sourceMapContents: false,
								sourceMapEmbed: false,
								sourceMapRoot: false*/
							})) .css .toString ();
				};
var stringify =	function (node_array) {
					return	css .stringify ({
								type: 'stylesheet',
								stylesheet:	{
												rules: node_array,
												parsingErrors: []
											}
							});
				};
var union =	function (styles_set) {
				/*if (styles_set .length === 1)
					return styles_set [0];*/
	
				var NodeSet = require ('css-semdiff/dist/css_utils') .NodeSet;
				var uniformNode = require ('css-semdiff/dist/css_utils') .uniformNode;
				var flatMap = require ('css-semdiff/dist/collection_utils') .flatMap;
				
				return	stringify (
							styles_set .map (function (styles) {
								var rules = css .parse (styles) .stylesheet .rules;
								var uniformed_nodes = flatMap (rules, uniformNode);
								return new NodeSet (uniformed_nodes);
							}) .reduce (function (union_set, node_set) {
								for (var node of node_set .nodes) {
									union_set .add (node);
								}
								return union_set;
							}) .toArray ()
						);
			};
var extend =	function (base_styles, metastyles) {
					return scss .compile (base_styles + metastyles);
				};

var grow_nodes =	function (baby_nodes, grown_nodes) {
						grown_nodes = grown_nodes || [];
						
						if (! baby_nodes .length)
							return grown_nodes;
							
						var ready = baby_nodes .filter (function (node) {
										return node .dependencies .every (function (_) {
											for (var i in grown_nodes) {
												if (grown_nodes [i] .names .indexOf (_) !== -1)
													return true;
											}
											return false;
										});
									})
							
						var freshly_grown = mapper (ready)
							.map (R .groupBy (function (node) {
								return node .dependencies .join ('+')
							}))
							.map (R .mapObjIndexed (function (nodes, dependency_names) {
								var dir_path = dependency_names ? path .join (styles_dir, md5 (dependency_names)) : path .join (styles_dir, '-');
							
								var dependencies =	(dependency_names ? dependency_names .split ('+') : [])
														.map (function (name) {
															for (var i in grown_nodes) {
																if (grown_nodes [i] .names .indexOf (name) !== -1)
																	return grown_nodes [i];
															}
															throw name + ' not found'
														});
														
								var dependency_styles = dependencies
															.map (function (node) { return node .styles })
															.reduce (function (sum, next) { return sum + next; }, '');
								var dependency_path = path .join (dir_path, 'dependency.css');
								dependency_styles =	time ('cached dependency group ' + dependencies .map (function (node) {
														return node .names [0]
													}) .join (' + '), () =>
														cache_at (dependency_path .slice (styles_dir .length + 1),
															dependency_styles,
															() => union ([dependency_styles])
														)
													);
								var dependencies_json = JSON .stringify (dependencies .map (function (node) {
									var node_ = {};
									for (var i in node) {
										node_ [i] = node [i]
									}
									delete node_ .styles;
									delete node_ .metastyles;
									return node_
								}), null, 4); 
								cache_at (path .join (dir_path, 'dependencies.json') .slice (styles_dir .length + 1),
									dependencies_json,
									() => dependencies_json
								)
							
								return	nodes .map (function (node) {
											var path_ = path .join (dir_path, node .path);
											var metastyles = node .metastyles;
											
											var node_ = {};
											for (var i in node) {
												node_ [i] = node [i];
											}
											node_ .styles =	time ('cached extend ' + path_, () =>
																cache_at (path_ .slice (styles_dir .length + 1), dependency_styles + node .metastyles, () =>
																	extend (dependency_styles, metastyles)));
											return node_;
										})
							}))
							.unwrapped
						
						var freshly_grown_list =	R .values (freshly_grown)
														.reduce (function (sum, next) { return sum .concat (next); }, [])
						var new_grown_nodes = grown_nodes .concat (freshly_grown_list);
						var new_baby_nodes =	baby_nodes .filter (function (node) {
													for (var i in freshly_grown_list) {
														if (freshly_grown_list [i] .path == node .path)
															return false;
													}
													return true;
												})
												
						if (grown_nodes .length === new_grown_nodes .length) {
							var massacre =	function (node) {
												var node_ = {};
												for (var i in node) {
													node_ [i] = node [i]
												}
												node_ .styles = node .styles ? true : false;
												node_ .metastyles = node .metastyles ? true : false;
												return node_;
											}
							throw new Error (
								JSON .stringify (
									['cyclic dependency?', baby_nodes .map (massacre), grown_nodes .map (massacre)], null, 4)
							);
						}
						
						return	new_grown_nodes
									.concat (grow_nodes (new_baby_nodes, new_grown_nodes));
					};
				
var cache_at =	function (name, copy_source, cache_source) {
					var copy_path = path .join (styles_copy, name) .replace (/\.css$|\.scss$/, '.cache.active')
					var cache_path = path .join (styles_cache, name) .replace (/\.css$|\.scss$/, '.cache.active')
					if (fs .existsSync (copy_path) && file (copy_path) === copy_source) {
						var cache = file (cache_path)
						
						var new_copy_path = copy_path .replace (/\.cache.active$/, '.cache.new')
						var new_cache_path = cache_path .replace (/\.cache.active$/, '.cache.new')
						fs .renameSync (copy_path, new_copy_path)
						fs .renameSync (cache_path, new_cache_path)
						
						return cache;
					}
					else {
						var cache = cache_source ();
						
						var new_copy_path = path .join (styles_copy, name) .replace (/\.css$|\.scss$/, '.cache.new')
						var new_cache_path = path .join (styles_cache, name) .replace (/\.css$|\.scss$/, '.cache.new')
						write (new_copy_path) (copy_source);
						write (new_cache_path) (cache);
						
						return cache;
					}
				};
var invalidate =	function (dir) {
						fs .readdirSync (dir) .forEach (function (file) {
							const file_path = path .resolve (dir, file);
							const file_info = fs .statSync (file_path);
							
							if (file_info .isDirectory ()) {
								invalidate (file_path)
							}
							else {
								if (file_path .endsWith ('.cache')) {
									fs .renameSync (file_path, file_path .replace (/\.cache$/, '.cache.active'))
								}
							}
						})
					};
var refresh =	function (dir) {
					fs .readdirSync (dir) .forEach (function (file) {
						const file_path = path .resolve (dir, file);
						const file_info = fs .statSync (file_path);
						
						if (file_info .isDirectory ()) {
							refresh (file_path)
						}
						else {
							if (file_path .endsWith ('.cache') || file_path .endsWith ('.cache.active')) {
								fs .unlinkSync (file_path)
							}
							if (file_path .endsWith ('.cache.new')) {
								fs .renameSync (file_path, file_path .replace (/\.cache\.new$/, '.cache'))
							}
						}
					})
				};
				
var invalidate_cache =	function () {
							invalidate (styles_cache)
							invalidate (styles_copy)
						}
var refresh_cache =	function () {
						refresh (styles_cache)
						refresh (styles_copy)
					};
					
					
					

var left_right_match = function (str, left, right) {
	var	g = true,
		x = new RegExp(left + "|" + right, "g"),
		l = new RegExp(left, ''),
		a = [],
		t, s, m;

	do {
		t = 0;
		while (m = x.exec(str)) {
			if (l.test(m[0])) {
				if (!t++) s = x.lastIndex;
			} else if (t) {
				if (!--t) {
					a.push(str.slice(s, m.index));
					if (!g) return a;
				}
			}
		}
	} while (t && (x.lastIndex = s));

	return a;
}

					


//build
time ('build', function () {
	
	var name_resolution = {};
	
    					
    var transform = function (src, name) {
    	var subcomponents = {};
    	var expressions = [];
    	var eaches
    	var loop_expressions = [];
    	var scripts = [];
    	var prescripts = [];
    	var refs = /<[^>]+ ref=[^>]+>/ .test (src);
    	var yield_tag = /<yield \/>/ .test (src);
    	
        return mapper ('<' + name + '>' + '\n' +
        			indent (src) + '\n' +
        		'</' + name + '>')
        	/* Resolve & tags */
        	.map (function (def) {
        		var and_potential = true;
        		var resolve_and =	function (match, parent, _yield) {
        								and_potential = true;
        								if (! name_resolution [parent])
        									throw 'unresolved inheritance: ' + parent
        								else
        									return	file (name_resolution [parent] [0])
        												.replace (/<yield \/>/g, function (match) {
        													return _yield;
        												});
        							}
        		while (and_potential) {
        			and_potential = false;
        			def = def
        					.replace (/<&([^>\/\s]+)\s*>((?:(?!<\/&>)[^])+)<\/&>/g, resolve_and)
        					.replace (/<&([^>\/\s]+)\s*()\/\s*>/g, resolve_and);
        		}
        		return def;
        	})
        	/* & tags erasure */
        	.map (function (def) {
        		return def .replace (/<&(?:[^>]*)>|<& \/>|<&\/>|<\/&>/g, function (match) {
        			return '';
        		})
        	})
        	/* Extract styles */
        	.map (function (def) {
        		return def .replace (/<style>((?:(?!<\/)[^])*)<\/style>/g, function (match, metastyles) {
        			//styles .extend (tag_name, metastyles, parent_name);
        			return '';
        		})
        	})
        	/* Extract pre transforms  */
        	.map (function (def) {
        		return def .replace (/<script>\s*pre\s*(\(function\s*\((?:(?!<\/script>)[^)])*\)\s*\{(?:(?!<\/script>)[^])*}\))\s*<\/script>/g, function (match, prescript) {
        			prescripts .push (prescript);
        			return '';
        		})
        	})
        	/* Extract scripts  */
        	.map (function (def) {
        		return def .replace (/<script>((?:(?!<\/script>)[^])*)<\/script>/g, function (match, metascript) {
        			scripts .push (metascript);
        			return '';
        		})
        	}) 
        	/* Execute pre transforms  */
        	.map (function (def) {
        		if (prescripts .length) {
    			    (function () {
            			var window = (new jsdom .JSDOM ()) .window;
            			var _name = name;
            			with (window) {
            				var node/* = (function (html) {
            				    var container = document .createElement ('template');
            					container .innerHTML = html;
            					return container .content;
            				}) (def) .childNodes [0]*/;
            				eval (file (path .join (scripts_src, 'modules/pre.js')));
            				for (var _ in prescripts) {
            				    eval (prescripts [_]) (node);
            				}
            				//def = node .outerHTML;
            			}
    			    }) ();
        		}
        		return def;
        	})
        	/* Transform expressions  */
        	.map (function (def) {
        		return def .replace (/{((?=(?:(?:(?!\ in )[^({])*\()+(?:(?!\ in )[^({])*\ in[^{]+})(?:[^{]+)|(?:(?!\ in )[^{])+)}/g, function (match, expression) {
        			expressions .push (expression);
        			return '{ expression:' + name + ':' + expressions .length + ' }';
        		})
        	})
        	/* Transform looper expressions  */
        	.map (function (def) {
        		return def .replace (/{((?:(?!\ in )[^{])*)\ in ([^{]+)}/g, function (match, loop_syntax, expression) {
        			expressions .push (expression);
        			return '{' + loop_syntax + ' in expression:' + name + ':' + expressions .length + ' }';
        		})
        	})
        	/* Transform ref expressions  */
        	.map (function (def) {
        		return def .replace (/(<[^>]+ ref=")([^">]+)("[^>]*>)/g, function (match, before, ref, after) {
        			return before + '{ ref prefix }' + ref + after;
        		})
        	})
        	/* Inject scripts  */
        	.map (function (def) {
        		return def .replace (/\n<\/[^]+>$/g, function (match) {
        			return ((scripts .length || expressions .length || yield_tag || refs) ?
        				indent ('<script>\n(function (self, args) {\n'
        					+ '\n self ._loaded = true;'
        					+ '\n self ._scope = function () {};'
        					/*+ '\n self .on ("before-mount", function () { log ("' + tag_name + ' enter mount"); });'
        					+ '\n self .on ("mount", function () { log ("' + tag_name + ' exit mount"); });'
        					+ '\n self .on ("update", function () { log ("' + tag_name + ' enter update"); });'
        					+ '\n self .on ("updated", function () { log ("' + tag_name + ' exit update"); });'*/
        					+ (yield_tag
        						? '\nself ._yield_levels = 0;'
        							+ '\nself ._yield_level = 0;'
        							+ '\nself ._yield_on = function () { /*log ("' + name + ' yield enter");*/ self ._yielding = true; self ._yield_level++; if (self ._yield_level > self ._yield_levels) self ._yield_levels = self ._yield_level; return ""; };'
        							+ '\nself ._yield_off = function () { /*log ("' + name + ' yield exit");*/ self ._yielding = false; self ._yield_level--; return ""; };'
        						: '')
        					+ (yield_tag
        						? '\nvar _refs = mergeAll ([ from (function (when) { self .on ("mount", function () { when (self .refs); }); }), from (function (when) { self .on ("updated", function () { when (self .refs); }); }) ]) .thru (map, consistentfy) /*.thru (tap, function (how) { log (self .root .localName, "cons refs", how);})*/;'
        							+ '\nvar yield_scope = self .parent;'
        							+ '\nwhile (yield_scope && yield_scope ._yield_levels) yield_scope = climb (yield_scope ._yield_levels, yield_scope);'
        							//+ '\nlog (self .root .localName, "located father", yield_scope);'
        							+ '\nif (yield_scope && yield_scope .yielded_diff) _refs .thru (map, yield_refs) .thru (diff_refs) .thru (tap, yield_scope .yielded_diff);'
        						: '')
        					+ (refs || yield_tag
        						? '\nvar self_diff = stream ();'
        							+ '\nvar yielded_diff = stream ();'
        							+ '\nself .yielded_diff = yielded_diff/* .thru (tap, function (how) { log (self .root .localName, "recieved", how);})*/;'
        							+ '\nvar diffs = mergeAll ([ self_diff, yielded_diff ]);'
        							+ '\nvar ref = function (name) { return ref_diff (name, diffs) };'
        							+ '\nvar ref_set = function (name) { return ref_set_diff (name, diffs) };'
        							+ (! yield_tag
        								? '\nvar _refs = mergeAll ([ from (function (when) { self .on ("mount", function () { when (self .refs); }); }), from (function (when) { self .on ("updated", function () { when (self .refs); }); }) ]) .thru (map, consistentfy) /*.thru (tap, function (how) { log (self .root .localName, "cons refs", how);})*/;'
        								: '')
        							+ '\n_refs .thru (map, self_refs) .thru (diff_refs) .thru (tap, self_diff);'
        						: '')
        					+ (scripts .length
        						? '\nvar known_as = function (what) { return function (how) { log (self .root .localName, what, how);} };'
        							+ '\nself .on ("update", function () {args = self .opts});\n'
        						: '')
        					+ scripts .join (';\n')
        					+ (expressions .length
        						? '\nself .expressions = {};\n'
        							+ '\n' + expressions .map (function (expression, i) {
        								return 'self .expressions [' + i + '] = function (_item) { return ' + expression + ' };';
        							}) .join ('\n')
        						: '')
        					+ (yield_tag
        						? '\nif (! self .update_strategy || self .update_strategy === "push") self .shouldUpdate = R .T;'
        						: '')
        					+ '\nif (typeof self .update_strategy === "function") self .shouldUpdate = self .update_strategy;'
        					+ '\n}) (this, this .opts);\n</script>')
        				: '') + match;
        		})
        	})
        	/* Inject subcomponents  */
        	.map (function (def) {
        		return	[def] .concat (R. pipe (R .mapObjIndexed (transform), R .values) (subcomponents))
        					.reduce (function (sum, next) { return next + sum; }, ''); 
        	})
        	/* Inject yield hooks  */
        	.map (function (def) {
        		return def .replace (/<yield><\/yield>/g, function (match) {
        			return '{ enter yield }<yield></yield>{ exit yield }';
        		})
        	}) .unwrapped + '\n'
    }

	files ('.ejs') (tags_src)
		.forEach (function (path) {
			var tag_relative_path = path .slice (tags_src .length + 1);
			var tag_name =	tag_relative_path
								.split ('/') .join ('-')
								.split ('.') [0];
			R .union ([tag_name, tag_name .split ('-') .reverse () [0]], [])
				.forEach (function (name) {
					if (! name_resolution [name]) name_resolution [name] = [];
					name_resolution [name] .push (path)
				})
		})
	write (tags_dist) (
		mapper (files ('.ejs') (tags_src)
			.map (function (tag_path) {
				var tag_relative_path = tag_path .slice (tags_src .length + 1);
				var tag_name =	tag_relative_path
									.split ('/') .join ('-')
									.split ('.') [0];
									
				var tag_dir_path =	tag_relative_path
										.split ('.')
											.slice (0, -1)
										.join ('.');

				var tag_src = file (tag_path);

				try {
					console .log ('rendering ' + tag_name);
					return transform (tag_src, tag_name);
				}
				catch (error) {
					console .error ('failed!');
					throw error;
				}
			})
			.reduce (function (sum, next) { return sum + next; }, '')
		)
		.map (compiler .compile)
		.unwrapped
	);
	files ('.js') (scripts_src)
		.forEach (function (path_/* of file*/) {
			var name = path_ .split ('/') .reverse () [0];
			var dest_path = path .join (scripts_dist, name);
			fs .copySync (path_, dest_path);
		});
	write (styles_dist) (
		mapper (
			files ('.css') (styles_src) .concat (files ('.scss') (styles_src))
				.map (function (path) {
					return {
						names: [path .split ('/') .reverse () [0] .split ('.') [0]],
						path: path .slice (styles_src .length + 1),
						dependencies: [],
						metastyles: file (path)
					}
				})
				.concat (files ('.ejs') (tags_src)
					.map (function (path) {
						var tag_relative_path = path .slice (tags_src .length + 1);
						var tag_name =	tag_relative_path
											.split ('/') .join ('-')
											.split ('.') [0];
											
						var tag_dir_path =	tag_relative_path
												.split ('.')
													.slice (0, -1)
												.join ('.');
		
						var tag_src = file (path)
						
						var tag_metastyles = '';
						
						/* Resolve & tags */
						tag_src = (function (def) {
							var and_potential = true;
							while (and_potential) {
								and_potential = false;
								def = def .replace (/<&([^>\/\s]+)\s*>/g, function (match, inheritance) {
									and_potential = true;
									if (! name_resolution [inheritance])
										throw 'unresolved inheritance: ' + inheritance
									else
										return file (name_resolution [inheritance] [0]);
								})
							}
							return def;
						}) (tag_src);
						tag_src .replace (/<style>((?:(?!<\/)[^])*)<\/style>/g, function (match, metastyles) {
							tag_metastyles += '\n' + metastyles;
						})
						
						try {
							console .log ('extracting styles in ' + tag_name);
							return {
								names: R .union ([tag_name, tag_name .split ('-') .reverse () [0]], []),
								path: tag_name + '.css',
								dependencies: [],
								metastyles: mapper (tag_metastyles)
									/* implements custom selector */
									.map (function (def) {
										return def .replace (/-> ?{([^}]+)}/g, ' $1');//:not(& $1 $1)');
									})
									//R .tap ((x) => console .log (x)),
									.map (function (def) {
										/*return	tag + ',[data-is="' + tag + '"] {' + '\n' +*/
										return	tag_name + ' {' + '\n' +
													def + '\n' +
												'}';
									})
									.unwrapped
							}
						}
						catch (error) {
							console .error ('failed!');
							throw error;
						}
					}))
		)
		.map (function (nodes) {
			var resolution_list = {};
			nodes .forEach (function (node) {
				node .names .forEach (function (name) {
					if (! resolution_list [name]) resolution_list [name]= [];
					resolution_list [name] .push (name);
				})
			})
			return	nodes
					.map (function (node) {
						var dependencies = [];
						node .metastyles = node .metastyles .replace (/@require ([^;]+);/g, function (match, dependency) {
							dependencies .push (dependency);
							return '';
						});
						
						var node_ = {};
						for (var i in node) {
							node_ [i] = node [i];
						}
						node_ .dependencies = dependencies;
						return node_;
					})
					.concat ({
						names: [],
						path: '*',
						dependencies: nodes .map (function (node) {
							return node .names [0];
						}),
						metastyles: ''
					})
		})/*
		.map (function (x) {
			console .log (x .map (function (q) { var y = {}; for (var i in q) y [i] = q [i]; delete y .metastyles; return JSON .stringify(y) }));
			return x;
		})*/
		.map (function (tree) {
			fs .ensureDirSync (styles_copy)
			fs .ensureDirSync (styles_cache)
	
			invalidate_cache ()
			var answer = grow_nodes (tree);
			refresh_cache ();
			for (var i in answer)
				if (answer [i] .path === '*')
					return answer [i] .styles
			throw 'can\'t find answer'
		})
		.unwrapped);
	fs .copySync (primary_src, primary_dist);
});