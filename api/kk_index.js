var kk_account =	{
						type: "service_account",
						project_id: "lyrical-epigram-155809",
						private_key_id: "21dd60d9059d04edebd107feca9953549b3a8211",
						private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDJVRUuPGIGLkEH\nEZKYSn7EvGlIzTsUd3pRvctIBBoMImAoNh7Yt4XkY40LSE6W6OvHq8zAO8yJgAkg\nPLl4HoxzWiCcYF7vfu9Sm+F9uHZP5/VuLQz3A7/78Dx5gapZGlpLrctuCqKxG+Tv\nzBsq9kcpfMdJKJY/99WdiC7+EfBAY3tEnIAhwQcpOMiJ0zuVq0bl2hskUtcJVk3u\n5L/x0392tZTap9FnmGBAEo96Q19xCJ8UgJaHIYCPRpV0CaHt+pU+7pGAftX5ag8m\n7nCSbfjp7qgl04DJdCHfPvcmzVUoekfcKwb3FhDldjFzrZ6QMDUL/Wuhgyo9QCTF\nihC6ax8DAgMBAAECggEAMqoChnwTftKs8oZtiX1VoVR4eiWLNH9MfL1yJlFB7MPJ\nxtS3tnmYa/zRRYGQpVE/5CNLhySFOCTMJxyg36VwWqbXhgKKYWJj/znS6Lw+qaUJ\nkgwsMwzyhwfRcBI9N+b1yg2WH771afRHDEEkpQ8MoVgRHkvkY3yOePIIQU9qUglE\nbBlEe5v1O8hpRch2hcz6UIz+60F8hJp/TncuQH0iOoN/yyym9oNC0msn0bFHZMtU\n0b48eyKppswPP2zIZkvy//njmhzDOAT4I+21yhtZGvXHTZFnzkSZG0pGmFUccM7f\n9GWdyod3wV7M/lXXLzDVBgDScYHbbAHX8Xywpa7yYQKBgQDq3Bhhh43rJs888JJA\nNU26/OPu7ojAgCi3wZe9UdPpBTdWMnC/JtMJOr7eFFhmiSnuMslaUU+kIN/pLFTM\nlW7SiT/LXCS3PjCV5KuYkaGK84rmJ/GAmCbGFvh+CHcMfDKt9FrP8WlwGcCSlBF8\n1IL+VrMx5o+AM4Yo40nOmP99HQKBgQDbdGlJjjWUeCw+0go2k2lncGRkVhH+Gg0N\ncDItCb+XkQIm1bh/TBlT88lh2MTFBx8N0JfoLiJBnc/SqQCGUZYcDzQmwU/K1awX\nNCNGZzsGe8chP8AEDBqEFLfyF8KO3iYvPrdIV9zmMzyxe6l1KsGzR7u4a9f1E6Qw\n24kOvqPynwKBgQCEtH6WRUj8kT5SOcD5xOS5/oEwldnxo7jeM+ZwlBcAOPFOpEuu\nxtpCAc6tn6NftKtbq5i4ju9IV0cN8v2rZ9hp4CGK3/LjE6HSYJZRLCCyafCXIgTE\n27Q1A++/Dzttc5QTVNonW0pvjC2S5VWISnAGFKlGTffRwctRuTQQJ8VdRQKBgCV+\nbSKpDlRwd7a/8gjDBMYseKp/3hEY6FP8cEYrnTVLDCAQcbYmDUm/pA94lp3HCrI0\nik+b2jR1vvUR9Mn+FHR00Icyjexstzs7qC82IeqIqUvv9WF7o+gfFhJhptb783As\n+el9QXt/E4aLRzeCd5em0NbAbiQsF+hVCcSgI6inAoGAT+rl2X3QNDVCT6HaqnHo\ncJH3ieOz8x5l4P+FLNjzexj97C0ozE15ou7D8u433j6I+nl9WzIJpvnFQWPOiuDA\n7Entjhfu2FYSlM+RipJIt2UOGR+ToysCUPcv85cs2PBU2ROCn4EL6Wf98a5yTSPA\nUhJih4ajzGks1/q+ax+TcD0=\n-----END PRIVATE KEY-----\n",
						client_email: "kkapp-146@lyrical-epigram-155809.iam.gserviceaccount.com",
						client_id: "109625559452058786760",
						auth_uri: "https://accounts.google.com/o/oauth2/auth",
						token_uri: "https://accounts.google.com/o/oauth2/token",
						auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
						client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/kkapp-146%40lyrical-epigram-155809.iam.gserviceaccount.com"
					};
//john index
var index_id = '1dh8WUf-vZURl6-yOuSr2oTPCuKCLP1iXAZW0GyuaBGQ'
//test index
//var index_id = '1SiLdNpNaI0LBQoNIPi7tnlSsCOCph8q1H9tSV8dRNdA';

var subcategories_schema =	function (rows) {
								return	rows 
											.filter (function (row) {
												return row .subcategory && row .spreadsheet
											})
											.map (function (row) {
												return	{
															category: row .subcategory,
															id: row .spreadsheet
														}
											});
							};
var questions_schema =	function (rows) {
							return	rows
										.filter (function (row) {
											return row .id .length && row .id !== 'type a unique id for your question here (e.g. 123456)' && row .text .length;
										})
										.map (function (row) {
											return	{
														id: row .id,
														ref_difficulty: row .refdifficulty || 0,
														text: row .text,
														image: row .image,
														answer: row .answer,
														traps:	Object .keys (row) .filter (function (trap) {
																	return trap .startsWith ('trap') && row [trap];
																}) .map (function (trap) {
																	return row [trap];
																})
													};
										});
						};
						
						
						
						
						
						
	
var spreadsheet = require ('google-spreadsheet');
var promisify = require ('es6-promisify');
var kk_index =	function (id) {
					var index = new spreadsheet (id);
					return	promisify (index .useServiceAccountAuth) (kk_account)
								.then (function () {
									return promisify (index .getInfo) ()
								})
								.then (function (info) {
									return info .worksheets;
								})
								.then (function (sheets) { 
									return	sheets .map (function (sheet) {
												return promisify (sheet .getRows) ();
											});
								})
								.then (
									Promise .all .bind (Promise)
								)
								.then (function (sheets_rows) {
									return	sheets_rows .reduce (function (total, sheet_rows) {
												return total .concat (sheet_rows);
											}, [])
								})
								.then (function (rows) {
									return subcategories_schema (rows);
								})
								.then (function (subcategories) {
									return	subcategories
												.map (function (subcategory) { 
													return	kk_questions (subcategory .id)
																.then (function (questions) {
																	return	{
																				label: subcategory .category,
																				items:	questions
																							.map (function (question) {
																								question .id = subcategory .id + '__' + question .id;
																								return question;
																							})
																			};
																})
												});
								})
								.then (
									Promise .all .bind (Promise)
								)
								.then (function (subcategories) {
									return	subcategories .reduce (function (total, subcategory) {
												total [subcategory .label] = (total [subcategory .label] || []) .concat (subcategory .items)
												return total;
											}, {})
								})
				};
var kk_questions =	function (id) {
						var category = new spreadsheet (id);
						return	promisify (category .useServiceAccountAuth) (kk_account)
									.then (function () {
										return promisify (category .getInfo) ()
									})
									.then (function (info) {
										return info .worksheets;
									})
									.then (function (sheets) {
										return	sheets .map (function (sheet) {
													return promisify (sheet .getRows) ();
												});
									})
									.then (
										Promise .all .bind (Promise)
									)
									.then (function (sheets_rows) {
										return	sheets_rows .reduce (function (total, sheet_rows) {
													return total .concat (sheet_rows);
												}, [])
									})
									.then (function (rows) {
										return questions_schema (rows);
									})
									.catch (function () {
										return [];
									})
					}
				
module .exports = kk_index (index_id)