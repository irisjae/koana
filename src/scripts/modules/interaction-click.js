var click = function (dom, handler) {
    dom .setAttribute ('interactable', '');
    [document .ontouchend ? 'touchend' : 'click'] .forEach (function (click) {
        dom .addEventListener (click, R .cond ([
            [function () {return window .dragging}, noop],
            [R .T, handler]
        ]))
    })
}

var stream_from_click_on = function (dom) {
    return from (function (x) {
        click (dom, x)
    })
}