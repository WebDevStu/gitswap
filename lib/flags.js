"use strict";

var _        = require('./utils'),
    defaults = {
        'v':    'version',
        'g':    'global',
        'd':    'delete',
        // 'u': 'update',
        'l':    'list',
        'a':    'add',
        'c':    'current',
        'help': 'help'
    };

module.exports = function (args) {

    var flags      = {},
        shortHands = Object.keys(defaults),
        longHands  = Object.keys(defaults).map(function (key) {
            return defaults[key];
        });

    _.each(args, function (param) {

        // ignore none flags
        if (param.toString().charAt(0) !== '-') {
            flags.profile = param;
        } else {
            param = param.replace(/\-/g, '');

            if (_.contains(shortHands, param)) {
                flags[defaults[param]] = true;
            }

            if (_.contains(longHands, param)) {
                flags[param] = true;
            }
        }
    });

    return flags;
};
