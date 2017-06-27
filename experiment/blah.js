var names_from_location_age = {
    'Cyberport': {
        'All': ['Kids (Age 5-7)', 'Junior (Age 7-11)', 'Teens (Age 11-15)', 'Level 2', 'Minecraft', 'Challenger'],
        'Kids (Age 5-7)': ['Kids (Age 5-7)'],
        'Junior (Age 7-11)': ['Junior (Age 7-11)', 'Level 2'],
        'Teens (Age 11-15)': ['Teens (Age 11-15)', 'Level 2'],
        'Minecraft': ['Minecraft'],
        'Challenger': ['Challenger']
    },
    'Lai Chi Kok': {
        'All': ['Kids (Age 5-7)', 'Junior (Age 7-11)', 'Teens (Age 11-15)', 'Level 2', 'Minecraft', 'Challenger'],
        'Kids (Age 5-7)': ['Kids (Age 5-7)'],
        'Junior (Age 7-11)': ['Junior (Age 7-11)', 'Level 2'],
        'Teens (Age 11-15)': ['Teens (Age 11-15)', 'Level 2'],
        'Minecraft': ['Minecraft'],
        'Challenger': ['Challenger']
    },
    'Kwun Tong': {
        'All': ['Kids (Age 5-7)', 'Junior (Age 7-11)', 'Teens (Age 11-15)', 'Level 2', 'Minecraft', 'Challenger'],
        'Kids (Age 5-7)': ['Kids (Age 5-7)'],
        'Junior (Age 7-11)': ['Junior (Age 7-11)', 'Level 2'],
        'Teens (Age 11-15)': ['Teens (Age 11-15)', 'Level 2'],
        'Minecraft': ['Minecraft'],
        'Challenger': ['Challenger']
    },
    'Science Park': {
        'All': ['Kids (Age 5-7)', 'Junior (Age 7-11)', 'Teens (Age 11-15)', 'Level 2', 'Minecraft', 'Challenger'],
        'Kids (Age 5-7)': ['Kids (Age 5-7)'],
        'Junior (Age 7-11)': ['Junior (Age 7-11)', 'Level 2'],
        'Teens (Age 11-15)': ['Teens (Age 11-15)', 'Level 2'],
        'Minecraft': ['Minecraft'],
        'Challenger': ['Challenger']
    }
};
document .addEventListener ('DOMContentLoaded', function () {
    var names_selected =    function (location, age) {
        return (names_from_location_age [location] || {}) [age] || []
    };
    
    
    var decks = {};
    decks .location = 'please choose one';
    decks .age = 'please choose one';
    
    var template_init = 'Cyberport';
    var template_nodes = [];
    var update_templates = false;
    var clock;
    var update_ui =  function () {
        var me = setTimeout (function () {
            if (clock === me) {
                clock = null;
                [] .forEach .call (
                    location_buttons,
                    function (button) {
                        if (location_from_button (button) === decks .location)
                            button .classList .add ('ui-tabs-active')
                        else
                            button .classList .remove ('ui-tabs-active')
                    });
                [] .forEach .call (
                    age_buttons,
                    function (button) {
                        if (age_from_button (button) === decks .age)
                            button .classList .add ('ui-tabs-active')
                        else
                            button .classList .remove ('ui-tabs-active')
                    });
                var selected_nodes =    [] .concat .apply (
                                            [],
                                            names_selected (decks .location, decks .age)
                                                .map (nodes_from_name)
                                        );
                if (update_templates)
                    template_nodes .forEach (function (node) {
                        var prop = node .templated_prop;
                        if (prop !== 'href')
                            node [prop] = node [prop] .replace (template_init, update_templates) .replace (update_templates, decks .location)
                        else
                            node [prop] = encodeURI (decodeURI (node [prop]) .replace (template_init, update_templates) .replace (update_templates, decks .location))
                    })
                var started = false;
                deck_nodes
                    .forEach (
                    function (node) {
                        if (selected_nodes .indexOf (node) === -1)
                            node .classList .add ('hidden-deck')
                        else {
                            node .classList .remove ('hidden-deck');
                            if (is_title (node)) {
                                if (started) {
                                    node .firstElementChild .style .marginTop = '30px';
                                }
                                else {
                                    node .firstElementChild .style .marginTop = '0px';
                                    started = true;
                                }
                            }
                        }
                    })
                update_templates = false;
            }
        }, 150);
        clock = me;
    };
    
    var add_rule = (function () {
        var addRule;
        
        if (typeof document.styleSheets != 'undefined' && document.styleSheets) {
            addRule = function(selector, rule) {
                var styleSheets = document.styleSheets, styleSheet;
                if (styleSheets && styleSheets.length) {
                    styleSheet = styleSheets[styleSheets.length - 1];
                    if (styleSheet.addRule) {
                        styleSheet.addRule(selector, rule)
                    } else if (typeof styleSheet.cssText == 'string') {
                        styleSheet.cssText = selector + ' {' + rule + '}';
                    } else if (styleSheet.insertRule && styleSheet.cssRules) {
                        styleSheet.insertRule(selector + ' {' + rule + '}', styleSheet.cssRules.length);
                    }
                }
            }
        } else {
            addRule = function(selector, rule, el, doc) {
                el.appendChild(doc.createTextNode(selector + ' {' + rule + '}'));
            };
        }
        
        return function createCssRule(selector, rule, doc) {
            doc = doc || document;
            var head = doc.getElementsByTagName('head')[0];
            if (head && addRule) {
                var styleEl = doc.createElement('style');
                styleEl.type = 'text/css';
                styleEl.media = 'screen';
                head.appendChild(styleEl);
                addRule(selector, rule, styleEl, doc);
                styleEl = null;
            }
        }
    }) ();
    add_rule ('.hidden-deck', 'display: none');
    
    
    var is_title = function (node) {
        return node .querySelector ('span.text > strong') && node .querySelector ('span.text > strong') .nextSibling;
    };
    var subtitle_from_title =   function (node) {
        return node .querySelector ('span.text > strong') .nextSibling;
    }
    var name_from_title =   function (node) {
        return node .querySelector ('span.text > strong') .textContent;
    };
    var deck_from_title = function (node) {
        return node .nextElementSibling;
    }
    
    var master_area_selector = 'ul + #cyberport';
    var deck_title_selector = 'ul + div > * > .kc-elm.kc-title-wrap.stcode_title5.stcode_title5';
    
    var deck_nodes = [];
    var nodes_from_names = {};
    var nodes_from_name =    function (name) {
        return nodes_from_names [name]
    };
    
    
    var master_area = document .querySelector (master_area_selector);
    var master_deck_titles = master_area .querySelectorAll (deck_title_selector);

    var selected_names = names_selected (decks .location, decks .age);
    [] .forEach .call (master_deck_titles, function (node) {
        var name = name_from_title (node);
        var subtitle = subtitle_from_title (node);
        var deck = deck_from_title (node);
        var items = deck .querySelectorAll ('a');
        
        subtitle .templated_prop = 'textContent';
        [] .forEach .call (
            items,
            function (item) {
                item .templated_prop = 'href';
            })
        template_nodes .push (subtitle);
        [] .forEach .call (
            items,
            function (item) {
                template_nodes .push (item);
            })
        
        if (selected_names .indexOf (name) === -1) {
            node .classList .add ('hidden-deck');
            deck .classList .add ('hidden-deck');
        }
        
        deck_nodes .push (node);
        deck_nodes .push (deck);
        nodes_from_names [name] = [node, deck];
    })
    
    
    
    var location_from_button =  function (node) {
        return node .querySelector ('a') .textContent;
    }
    var age_from_button =  function (node) {
        return node .querySelector ('a') .textContent;
    }
    
    var buttons_from_locations = {};
    var button_from_location =  function (location) {
        return buttons_from_locations [location]
    };
    var buttons_from_ages = {};
    var button_from_age =  function (age) {
        return buttons_from_ages [age]
    };
    
    
    var location_selector = '.kc-col-container > * > * > ul.kc_tabs_nav.ui-tabs-nav.kc_clearfix > li';
    var age_selector = 'ul + #cyberport ul.kc_tabs_nav.ui-tabs-nav.kc_clearfix > li';
    
    var location_buttons = document .querySelectorAll (location_selector);
    var age_buttons = document .querySelectorAll (age_selector);
    
    [] .forEach .call (
        location_buttons, function (button) {
            buttons_from_locations [location_from_button (button)] = button;
            button .addEventListener ('click', function (e) {
                e .stopPropagation ();
                e .preventDefault ();
                e .target .blur ();
                update_templates = decks .location;
                decks .location = location_from_button (button);
                update_ui ();
            }, true)
            if (location_from_button (button) === decks .location)
                button .classList .add ('ui-tabs-active')
            else
                button .classList .remove ('ui-tabs-active')
        });
    [] .forEach .call (
        age_buttons, function (button) {
            buttons_from_ages [age_from_button (button)] = button;
            button .addEventListener ('click', function (e) {
                e .stopPropagation ();
                e .preventDefault ();
                e .target .blur ();
                decks .age = age_from_button (button);
                update_ui ();
            }, true)
            if (age_from_button (button) === decks .age)
                button .classList .add ('ui-tabs-active')
            else
                button .classList .remove ('ui-tabs-active')
        });
        
    window .decks_scope = function () {};
}, false);