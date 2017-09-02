var use_db = require ('api/use_db')
                
Promise .resolve ()
    .then (function (x) {
        console .log ('fetching kk subcategories from google sheets...');
    })
    .then (function () {
        return require ('api/subcategories')
    })
    .then (function (x) {
        console .log ('inserting subcategories into database...');
        return x;
    })
    .then (function (kk_subcategories) {
        return  use_db (function (session) {
                    var categories = Object .keys (kk_subcategories);
            
                    return  Promise .all (categories .map (function (category) {
                                return  Promise .all (kk_subcategories [category] .map (function (subcategory) {
                                            return  session .run (
                                                        'MERGE (category:Category { name: { category } }) ' +
                                                        'MERGE (subcategory:Subcategory { name: { subcategory } }) ' +
                                                        'MERGE (category)-[:Contains]->(subcategory) ' +
                                                        'SET subcategory .image = { image } ' +,
                                                    { 
                                                        category: category,
                                                        subcategory: subcategory [0],
                                                        image: subcategory [1]
                                                    })
                                        }))
                            }))
                })
    })
    .then (function (x) {
        console .log ('fetching kk questions from google sheets...');
    })
    .then (function () {
        return require ('api/questions')
    })
    .then (function (x) {
        console .log ('inserting questions into database...');
        return x;
    })
    .then (function (kk_questions) {
        return  use_db (function (session) {
                    var subcategories = Object .keys (kk_questions);
            
                    return  Promise .all (subcategories .map (function (subcategory) {
                                return  Promise .all (kk_questions [subcategory] .map (function (question) {
                                            return  session .run (
                                                        'MERGE (subcategory:Subcategory { name: { subcategory } }) ' +
                                                        'MERGE (question:Question { id: { id } }) ' +
                                                        'MERGE (subcategory)-[:Owns]->(question) ' +
                                                        'SET question .answer = { answer } ' +
                                                        'SET question .difficulty = { difficulty } ' +
                                                        'SET question .text = { text } ' +
                                                        'SET question .image = { image } ' +
                                                        'SET question .traps = { traps } ',
                                                    { 
                                                        subcategory: subcategory,
                                                        id: question .id,
                                                        answer: question .answer,
                                                        difficulty: +question .ref_difficulty,
                                                        text: question .text,
                                                        image: question .image,
                                                        traps: question .traps
                                                    })
                                        }))
                            }))
                })
    })
    .then (function () {
        console .log ('completed import')
    })
    .catch (function (err) {
        console .error ('ERRORED:', err)
    })
    .then (function () {
        use_db .driver .close ();
    })
                    