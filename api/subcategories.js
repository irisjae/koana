var kk_account = require ('api/gaccount');
//categories index
var index_id = '1sqymcnK-KfbhIqxZIeNHroB5Ejpnli6lnvylNr5P1q0'
var subcategories_id = '1dh8WUf-vZURl6-yOuSr2oTPCuKCLP1iXAZW0GyuaBGQ'

var categories_schema =	function (rows) {
							return	rows 
										.filter (function (row) {
											return row .category
										})
										.map (function (row) {
											var _ =	{
														label: row .category,
														items: []
													}
										    var next;
											for (var i = 1; next = 'subcategory' + i, row [next]; i ++) {
											    _ .items .push (row [next])
											}
											return _;
										});
						};
var subcategories_schema =	function (rows) {
	return	rows 
				.filter (function (row) {
					return row .subcategory
				})
				.map (function (row) {
					return	{
								label: row .subcategory,
								item: row .image
							}
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
									return categories_schema (rows);
								})
								.then (function (categories) {
									return kk_subcategories (subcategories_id) .then (function (images) {
									    return categories .map (function (item) {
									        return {
									            label: item .label,
									            items: item .items .map (function (subcategory) {
									                return [subcategory, images [subcategory] || '']
									            }) 
									        }
									    })
									});
								})
								.then (function (categories) {
									return	categories .reduce (function (total, category) {
												total [category .label] = (total [category .label] || []) .concat (category .items)
												return total;
											}, {})
								})
				};
var kk_subcategories = function (id) {
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
					return subcategories_schema (rows);
				})
				.catch (function () {
					return [];
				})
				.then (function (items) {
					return	items .reduce (function (total, item) {
								total [item .label] = item .item;
								return total;
							}, {})
				})
}
				
module .exports = kk_index (index_id)