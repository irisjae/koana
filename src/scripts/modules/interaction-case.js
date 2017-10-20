var interaction_case = function (cases) {
    return interaction (transition (function (intent, license) {
        var from = intent [0];
        var to = intent [1];
        if (from) {
            cases [from] .forEach (function (node) {
                node .style .visibility = 'hidden';
            })
        }
        else {
            R .forEachObjIndexed (function (case_, from) {
                if (from !== to)
                    case_ .forEach (function (node) {
                        node .style .visibility = 'hidden';
                    })
            }) (cases)
        }
        cases [to] .forEach (function (node) {
            node .style .visibility = '';
        });
        return only_ (to);
    }));
}