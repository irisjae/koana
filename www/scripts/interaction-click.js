var click = function (dom, handler) {
    ['touchend', 'click'] .forEach (function (click) {
        dom .addEventListener (click, R .cond ([
            [function () {return window .dragging}, noop],
            [R .T, handler]
        ]))
    })
}