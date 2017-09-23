var interaction_date_picker = function (dom) {
    dom .setAttribute ('readonly', '');
    var _ = interaction (transition (function (intent, license) {
        return function (tenure) {
            pick_date ()
                .then (R .tap (function (date) {
                    dom .value = date;
                }))
                .then (function (date) {
                    tenure (date);
                    tenure .end (true);
                })
        }
    }));
    click (dom, function () {
        _ .intent ('pick');
    });
    return interaction_product ({
        _: _,
        dom: {
            intent: none,
            state: stream (dom)
        }
    });
}