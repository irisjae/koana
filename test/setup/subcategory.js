var casual = require ('casual');
var write = require ('test/utils/write')	
var use_db = require ('api/use_db')	

use_db (function (session/* of db */) {
    return  session .run (
        'MATCH (subcategory:Subcategory) ' +
        'MATCH (category:Category) ' +
        'MATCH (category)<-[:in]-(:is)-[:_]->(subcategory) ' +
        'MATCH (:Question)<-[:_]-(:is)-[:in]->(subcategory) ' +
        'RETURN DISTINCT category, subcategory '
    )
})
.then (function (results/* of query */) {
    var choice = casual .integer (0, results .records .length - 1);
    write ('category', results .records [choice] ._fields [0] .properties);
    write ('subcategory', results .records [choice] ._fields [1] .properties);
})
.then (function () {
	use_db .driver .close ();
})
.catch (function (e) {
    console .error (e)
})