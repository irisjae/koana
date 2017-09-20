var events = new (require ('eventemitter3')) ();
var express = require ('express');
var sse = require ('sse-nodejs');
var low = require ('lowdb');

var uuid = require('uuid');
var cors = require ('cors');
var body_parser = require ('body-parser');
var cookie_parser = require ('cookie-parser');


var db = low ('db.json', { storage: require ('lowdb/lib/storages/file-async') });
db .defaults ({
  users: []
}) .write ()

var app = express ();
app .use (cors ());
app .use (body_parser .json ());
app .use (cookie_parser ());

app .post ('/login', function (req, res) {
  //console .log (req .body);
  var username = req .body .username;
  var password = req .body .password;

  var user = db .get ('users') .find ({ username: username, password: password }) .value ();

  if (! user) {
    res .json ({ error: 'doesn\'t exists', success: false });
  }
  else {
    res .json ({ success: true, session: username });
  }
})
app .post ('/register', function (req, res) {
  //console .log (req .body);
  var username = req .body .username;
  var password = req .body .password;
  if (db .get ('users') .find ({ username: username }) .value ()) {
    res .json ({ error: 'already exists', success: false });
  }
  else {
    db .get ('users') .push ({
      username: username,
      password: password,
      posts: []
    }) .write () .then (function () {
      /*res .cookie ('login', username, {
        maxAge: 1000 * 60 * 60 * 24 * 2
      });*/
      res .json ({ success: true, session: username });
    }) .catch (function (e) {
      console .error (e);
      res .json ({ error: 'unknown error', success: false });
    })
  }
})
app .post ('/new', function (req, res) {
    var session = req .body .session;
    var team = req .body .team;

    var user = db .get ('users') .find ({ username: session }) .value ();

    if (! user) {
      res .json ({ error: 'user doesnt exist', success: false });
    }
    else {
      var new_post = { user: user .username, team: team, comments: [], time: new Date () };

      var posts = user .posts;
      posts = posts .concat ([ new_post ]);
      db .get ('users') .find ({ username: session }) .assign ({
        posts: posts
      }) .write () .then (function () {
        res .json ({ success: true });
        events .emit ('new-post', new_post);
      }) .catch (function (e) {
        console .error (e);
        res .json ({ error: 'unknown error', success: false });
      })
    }
});
app .get ('/feed', function (req, res) {
    var app = sse (res);

    app .sendEvent ('posts', function () {
        return  [] .concat .apply ([], db .get ('users') .value () .map (function (user) {
                  return user .posts;
                })) .sort (function (a, b) {
                  var a_time = new Date (a .time);
                  var b_time = new Date (b .time);
                  if (a_time < b_time)
                    return -1;
                  else if (a_time > b_time)
                    return 1;
                  else {
                    return 0;
                  }
                })
    });

    var listener = function (post) {
        app .sendEvent ('posts', function () {
            return [ post ]
        });
    };

    events .on ('new-post', listener);

    app .disconnect (function () {
        events .removeListener ('new-post', listener);
    });
});
app .post ('/x/comments/:user/:date', function (req, res) {
    var user = req .params .user;
    var date = req .params .date;

    var session = req .body .session;
    var comment = req .body .comment;

    console .log (user, date, session, comment);

    if (! db .get ('users') .find ({ username: session }) .value ()) {
      res .json ({ error: 'you dont exist', success: false });
    }
    else {
      var user_ = db .get ('users') .find ({ username: user }) .value ();

      if (! user_) {
        res .json ({ error: 'user doesnt exist', success: false });
      }
      else {
        var post_index;
        var post = user_ .posts .filter (function (x, i) {
          if (x .time === date) {
            post_index = i;
            return true;
          }
        }) [0];

        if (! post) {
          res .json ({ error: 'post doesnt exist', success: false });
        }
        else {
          var new_post = {};
          for (var i in post) {
            new_post [i] = post [i];
          }
          var new_comments = new_post .comments .concat ([ { user: session, comment: comment } ]);
          new_post .comments = new_comments;
          var posts = user_ .posts;
          posts = posts .slice (0, post_index) .concat ([new_post]) .concat (posts .slice (post_index + 1));
          db .get ('users') .find ({ username: user }) .assign ({
            posts: posts
          }) .write () .then (function () {
            res .json ({ success: true });
            events .emit ('comments-' + user + '-' + date, new_comments);
          }) .catch (function (e) {
            console .error (e);
            res .json ({ error: 'unknown error', success: false });
          })
        }
      }
    }
});
app .get ('/comments/:user/:date', function (req, res) {
    var app = sse (res);

    var user = req .params .user;
    var date = req .params .date;

    var post =  db .get ('users') .find ({ username: user }) .value ()
                  .posts
                  .filter (function (x) {
                    return x .time === date;
                  }) [0];

    app .sendEvent ('comments', function () {
        return post .comments;
    });

    var listener = function (comments) {
        app .sendEvent ('comments', function () {
            return comments;
        });
    };

    events .on ('comments-' + user + '-' + date, listener);

    app .disconnect (function () {
        events .removeListener ('comments-' + user + '-' + date, listener);
    });
});


app .listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
express ()
  .use(express.static(__dirname))
  .listen(8080, function () {
    console.log('Example app serving on port 8080!')
});
