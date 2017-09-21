var interaction_date_picker = function (dom) {
    dom .setAttribute ('readonly', '');
    var _ = interaction (transition (function (intent, license) {
        return from_promise (
            pick_date () .then (R .tap (function (date) {
                dom .value = date;
            }))
        )
    }));
    click (dom, function () {
        _ .intent ('pick');
    });
    return interaction_product ({
        _: _,
        dom: {
            intent: only_ (),
            state: only_ (dom)
        }
    });
}