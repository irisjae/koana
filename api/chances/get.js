var use_db = require ('api/use_db');
var config = require ('api/config');
var decode = require ('api/decode');
var detokenizer = require ('api/detokenizer');
var neonum = require ('api/neonum');

module .exports = function (ctx, next) {
    var user = { id: detokenizer (decode (ctx .request .headers .user) .token) };
    return  use_db (function (session) {
                return  Promise .resolve ()
                        .then (function () {
                            return  session .run (
                                        'MATCH (user:User) WHERE ID (user) = {user} .id ' +
                                        'RETURN user',
                                        {
                                            user: user
                                        })
                        })
                        .then (function (results) {
                            var now = new Date ();
                            var today = new Date (now .getFullYear (), now .getMonth (), now .getDate ());
                            var timestamp = today / 1000;
                            
                            var latest_quizes = results .records [0] .fields [0] .properties .latest_quizes || [];;
                            return 6 - latest_quizes .filter (function (date) {
                                    return date > today;
                            }) .length;
                        })
                        .then (function (_) {
                            return {
                                _: _
                            };
                        })
                        .catch (function (err) {
                            return {
                                error: err .message
                            }
                        })
            })
            .then (function (x) {
                ctx .body = x;
            })
            .then (function () {
                return next ();
            })
};