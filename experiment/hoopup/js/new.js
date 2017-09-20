if (!Element.prototype.matches)
    Element.prototype.matches = Element.prototype.msMatchesSelector ||
                                Element.prototype.webkitMatchesSelector;

if (!Element.prototype.closest)
    Element.prototype.closest = function(s) {
        var el = this;
        var ancestor = this;
        if (!document.documentElement.contains(el)) return null;
        do {
            if (ancestor.matches(s)) return ancestor;
            ancestor = ancestor.parentElement;
        } while (ancestor !== null);
        return null;
    };

document .addEventListener("DOMContentLoaded", function () {
  var selections = [];

  var player_of = function (position, level) {
    var row = document .querySelector ('th[position="'+position+'"]') .parentElement;
    var player_img = [] .slice .call (row .querySelectorAll ('td > player-frame > img')) .reverse () [level - 1];
    return player_img .getAttribute ('player');
  }

  var normalize_selection = function (s) {
    s = s .filter (function (x, i) {
      return s .slice (i + 1) .map (function (_) {
        return _ .position
      }) .indexOf (x .position) === -1
    })

    s .forEach (function (x, i) {
      var x = s [i];
      var level = x .level;
      var taken = false;
      var left = [1,2,3,4,5];
      var remove = function (_) {
        left .splice (left .indexOf (_), 1);
      }
      s .slice (0, i) .concat (s .slice (i + 1)) .forEach (function (y) {
        if (y .level === level) taken = true;
        remove (y .level);
      })
      if (taken) {
        x .level = left [0]
        x .player = player_of (x .position, x .level);
      }
    })

    return s;
  }

  var render = function () {
    [] .forEach .call (document .querySelectorAll ('player-frame'), function (_) {
      _ .removeAttribute ('clicked');
    });
    selections .forEach (function (x) {
      var header = document .querySelector ('[position="' + x .position + '"]');
      var row = header .closest ('tr');
      var frame = row .querySelectorAll ('player-frame') [5 - x .level];
      frame .setAttribute ('clicked', true);
    })
  };

  [] .forEach .call (document .querySelectorAll ('img'), function (_) {
    _ .addEventListener ('click', function () {
      var row = _ .closest ('tr');
      var td = _ .closest ('td');
      var position = row .querySelector ('th') .getAttribute ('position');
      var level = 5 - [] .indexOf .call (row .querySelectorAll ('td'), td);

      selections = normalize_selection (selections .concat ([{ position: position, level: level, player: _ .getAttribute ('player') }]))
      render ();
    })
  })

  document .querySelector ('share') .addEventListener ('click', function () {
    if (selections .length !== 5) {
      alert ('You must pick all five positions');
    }
    else {
      var team = {};
      selections .forEach (function (x) {
        team [x .position] = { player: x .player, level: x .level };
      });

      fetch (window.location.protocol + '//' + window.location.hostname + ':3000/new', {
          method: 'POST',
          mode: 'cors',
          body: JSON .stringify ({
            session: localStorage .getItem ('session'),
            team: team
          }),
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
      }) .then (function (res) {
        return res .json ();
      }) .then (function (res) {
        if (res .error) {
          alert ('There was a problem sharing your screen');
        }
        else {
          window .location .href = 'feed.html';
        }
      });;
    }
  });
});
