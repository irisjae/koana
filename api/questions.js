var kk_account = require ('api/gaccount');
//subcategories index
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
															subcategory: row .subcategory,
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
																				label: subcategory .subcategory,
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