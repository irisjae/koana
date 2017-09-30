var interaction_select_koders = function (options, data) {
    var left_dom = options .left;
    var right_dom = options .right;
    var img_dom = options .image;
    var name_dom = options .name;
    
    var left_edge_option = options .left_edge;
    var right_edge_option = options .right_edge;
    var _ = interaction (transition (function (intent, license) {
        if (intent [0] === 'reset') {
            return function (tenure) {
                tenure .end (true);
                _ .intent (['shift', - _ .state () .index, _ .state ()]);
            }
        }
        else if (intent [0] === 'data') {
            return function (tenure) {
                data = intent [1];
                tenure .end (true);
                _ .intent (['reset']);
            }
        }
        else if (intent [0] === 'shift') {
            var direction = intent [1];
            var index = intent [2] .index;
            index = index + direction;
            if (index < 0) {
                if (! left_edge_option) 
                    index += data .length;
                else {
                    index = 0;
                }
            }
            else if (index >= data .length) {
                if (! right_edge_option) 
                  index -= data .length;
                else {
                    index = data .length - 1;
                    if (index < 0)
                        index = 0;
                }
            }
            
            if (left_edge_option) {
                if (index === 0) {
                    left_dom .style .visibility = 'hidden';
                    if (typeof left_edge_option .nodeType === 'number')
                        left_edge_option .style .visibility = '';
                }
                else {
                    if (! data .length)
                        left_dom .style .visibility = 'hidden';
                    else
                        left_dom .style .visibility = ''; 
                    if (typeof left_edge_option .nodeType === 'number')
                        left_edge_option .style .visibility = 'hidden';
                }
            }
            if (right_edge_option) {
                if (index === data .length - 1) {
                    right_dom .style .visibility = 'hidden';
                    if (typeof right_edge_option .nodeType === 'number')
                        right_edge_option .style .visibility = '';
                }
                else {
                    if (! data .length)
                        right_dom .style .visibility = 'hidden';
                    else
                        right_dom .style .visibility = ''; 
                    if (typeof right_edge_option .nodeType === 'number')
                        right_edge_option .style .visibility = 'hidden';
                }
            }
                
            if (data .length) {
                img_dom .src = data [index] .src;
                if (name_dom)
                    name_dom .textContent = data [index] .koder_name || data [index] .name || '';
            }
            return only_ ({
                index: index,
                koder: data [index]
            });
        }
        else
            return decline_ (intent)
    }))
    
    _ .state ({
        index: 0,
        koder: data [0]
    })   
    _ .intent (['shift', 0, _ .state ()]);
    
    stream_from_click_on (left_dom) .thru (tap, function () {
        _ .intent (['shift', -1, _ .state ()])
    });
    stream_from_click_on (right_dom) .thru (tap, function () {
        _ .intent (['shift', +1, _ .state ()])
    });
    
    return _;
}