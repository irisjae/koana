var getSomeThing = () => Promise.resolve({});
var getTwoThings = () => Promise.resolve([{},1]);
var makeSomeOtherPromise = () => Promise.resolve(5);

var t = require('tap')
t.test('get thing', function (t) {
  return getSomeThing().then(function (result) {
    return t.test('check result', function (t) {
      return Promise .resolve ()
        .then (function () {
          t.equal(result.foo, 'bar')
        });
    })
  })
}).then(function () {
  return getTwoThings().then(function (things) {
    return t.test('the things', function (t) {
      t.equal(things.length, 2)
      return Promise.resolve()
    }) .then (makeSomeOtherPromise)
  }).then(function (otherPromiseResult) {
    return t.test('check other promise thing', function (t) {
      return Promise .resolve ()
        .then (function () {
          t.equal(otherPromiseResult, 7, 'it should be seven')
        });
    })
  })
}).catch(t.threw)