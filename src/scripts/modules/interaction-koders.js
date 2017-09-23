var interaction_select_koders = function (left_dom, right_dom, img_dom, data) {
    var _ = interaction (transition (function (intent, license) {
        var direction = intent [0];
        var index = intent [1] .index;
        index = index + direction;
        if (index < 0)
            index += data .length;
        else if (index >= data .length)
            index -= data .length;
        img_dom .src = data [index] .src;
        return only_ ({
            index: index,
            koder: data [index]
        });
    }))
    
    img_dom .src = data [0] .src;
    _ .state ({
        index: 0,
        koder: data [0]
    })
    
    stream_from_click_on (left_dom) .thru (tap, function () {
        _ .intent ([-1, _ .state ()])
    });
    stream_from_click_on (right_dom) .thru (tap, function () {
        _ .intent ([+1, _ .state ()])
    });
    
    return _;
}