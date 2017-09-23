var interaction_date_picker = function (dom) {
    dom .setAttribute ('readonly', '');
    var _ = interaction (transition (function (intent, license) {
        if (intent [0] === 'pick')
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
        else if (intent [0] === 'reset') {
            dom .value = '';
            dom .dispatchEvent (new Event ('input'));
        }
		else {
			console .error ('unknown intent passed', intent);
			return project (none)
		}
    }));
    click (dom, function () {
        _ .intent (['pick']);
    });
    return interaction_product ({
        _: _,
        dom: {
            intent: none,
            state: stream (dom)
        }
    });
}