document .addEventListener("DOMContentLoaded", function () {
  var done = document .querySelector ('body > dialog > action');

  done .addEventListener ('click', function () {
    var username = document .querySelector ('input[username]');
    var password = document .querySelector ('input[password]');

    fetch (window.location.protocol + '//' + window.location.hostname + ':3000/register', {
        method: 'POST',
        mode: 'cors',
        body: JSON .stringify ({
          username: username .value,
          password: password .value
        }),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
    }) .then (function (res) {
      return res .json ();
    }) .then (function (res) {
      if (res .error) {
        alert ('The username has already been taken');
      }
      else {
        localStorage .setItem ('session', res .session);
        window .location .href = 'feed.html';
      }
    });
  });
});
