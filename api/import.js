var use_db = require ('api/use_db')

var subcategories;
var questions;
                
Promise .resolve ()

.then (function (x) {
    console .log ('fetching kk subcategories from google sheets...');
    return require ('api/subcategories')
})
.then (function (_) {
    subcategories = _;
})

.then (function () {
    console .log ('fetching kk questions from google sheets...');
    return require ('api/questions')
})
.then (function (_) {
    questions = _;
})

.then (function () {
    console .log ('invalidating subcategories in database...');
    return  use_db (function (session) {
                return  session .run (
                            'MATCH (category:Category) ' +
                            'MERGE (subcategory:Subcategory) ' +
                            'SET category:Invalidated ' +
                            'SET subcategory:Invalidated ')
            })
})

.then (function () {
    console .log ('inserting subcategories into database...');
    return  use_db (function (session) {
                return  Promise .all (Object .keys (subcategories) .map (function (x) {
                            var category = { name: x };
                            return  Promise .all (subcategories [category .name] .map (function (subcategory) {
                                        return  session .run (
                                                    'MERGE (category:Category { name: {category} .name }) ' +
                                                    'MERGE (subcategory:Subcategory { name: {subcategory} [0] }) ' +
                                                    'MERGE (subcategory)<-[:_]-(:is)-[:in]->(category) ' +
                                                    
                                                    'REMOVE category:Invalidated ' +
                                                    'REMOVE subcategory:Invalidated ' +
                                                    
                                                    'SET subcategory .image = {subcategory} [1] ' +
                                                    'SET subcategory .hyphenation = {subcategory} [2] ',
                                                    { 
                                                        category: category,
                                                        subcategory: subcategory
                                                    })
                                    }))
                        }))
            })
})

.then (function () {
    console .log ('flushing subcategories in database...');
    return  use_db (function (session) {
                return  Promise .all (['Category', 'Subcategory'] .map (function (label) {
                            return  session .run (
                                        'MATCH (invalid:Invalidated:' + label + ') ' +
                                        
                                        'REMOVE invalid:Invalidated:' + label + ' ' +
                                        'SET invalid:_' + label + ' ')
                        }))
            })
})

.then (function () {
    console .log ('invalidating questions in database...');
    return  use_db (function (session) {
                return  session .run (
                            'MATCH (question:Question) ' +
                            'SET question:Invalidated '
                        )
            })
})
.then (function () {
    console .log ('inserting questions into database...');
    return  use_db (function (session) {
                return  Promise .all (Object .keys (questions) .map (function (x) {
                            var subcategory = [ x ];
                            return  Promise .all (questions [subcategory [0]] .map (function (question) {
                                        /* question:
                                            id: question .id,
                                            answer: question .answer,
                                            difficulty: +question .ref_difficulty,
                                            text: question .text,
                                            image: question .image,
                                            traps: question .traps
                                        */
                                        return  session .run (
                                                    'MATCH (subcategory:Subcategory { name: {subcategory} [0] }) ' +
                                                    'MERGE (question:Question { id: {question} .id }) ' +
                                                    'MERGE (question)<-[:_]-(:is)-[:in]->(subcategory) ' +
                                                    
                                                    'REMOVE question:Invalidated ' +
                                                    
                                                    'SET question .answer       = {question} .answer ' +
                                                    'SET question .difficulty   = {question} .difficulty ' +
                                                    'SET question .text         = {question} .text ' +
                                                    'SET question .image        = {question} .image ' +
                                                    'SET question .traps        = {question} .traps ',
                                                    { 
                                                        subcategory: subcategory,
                                                        question: question
                                                    })
                                    }))
                        }))
            })
})
.then (function () {
    console .log ('flushing questions in database...');
    return  use_db (function (session) {
                return  Promise .all (['Category', 'Subcategory', 'Question'] .map (function (label) {
                            return  session .run (
                                        'MATCH (invalid:Invalidated:' + label + ') ' +
                                        
                                        'REMOVE invalid:Invalidated:' + label + ' ' +
                                        'SET invalid:_' + label + ' ')
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
                