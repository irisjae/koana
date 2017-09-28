var interaction_step = function (dom) {
    var stepped_nodes = [] .slice .call (dom .querySelectorAll ('[step]'));
    var step = R .pipe (
        R .chain (function (node) {
            return node .getAttribute ('step') .split (',') .map (function (x) {
                return [node, x]
            });
        }),
        R .groupBy (R .prop (1)),
        R .map (R .map (R .prop (0)))
    ) (stepped_nodes);
    
    return interaction (transition (function (intent, license) {
        var from = intent [0];
        var to = intent [1];
        if (from) {
            step [from] .forEach (function (node) {
                node .style .visibility = 'hidden';
            })
        }
        else {
            R .forEachObjIndexed (function (step, from) {
                if (from !== to)
                    step .forEach (function (node) {
                        node .style .visibility = 'hidden';
                    })
            }) (step)
        }
        step [to] .forEach (function (node) {
            node .style .visibility = '';
        });
        return only_ (to);
    }));
}