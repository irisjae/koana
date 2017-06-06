var use_db = require ('./use_db')
                
require ('./kk_index')
    .then (function (kk_questions) {
        return  use_db (function (session) {
                    var categories = Object .keys (kk_questions);
                    
                    return  Promise .all (categories .map (function (category) {
                                return  Promise .all (kk_questions [category] .map (function (question) {
                                            return  session .run (
                                                        'MERGE (category:Subcategory {name : { category } }) ' +
                                                        'MERGE (question:Question { id: { id } }) ' +
                                                        'MERGE (category)-[:Owns]->(question) ' +
                                                        'SET question .answer = { answer } ' +
                                                        'SET question .difficulty = { difficulty } ' +
                                                        'SET question .text = { text } ' +
                                                        'SET question .image = { image } ' +
                                                        'SET question .traps = { traps } ',
                                                    { 
                                                        category: category,
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
        console .log ('done')
    })
    .catch (function (err) {
        console .error ('ERRORED:', err)
    })
    .then (function () {
        use_db .driver .close ();
    })
                    