"use strict";

var _ = require('./utils'),
    defaults = {
        'g': 'global',
        // 'd': 'delete',
        'l': 'list',
        'a': 'add',
        'c': 'current'
    };

module.exports = function (args) {

    var flags = {},
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

            if (shortHands.indexOf(param.toString()) >= 0) {
                flags[defaults[param]] = true;
            }

            if (longHands.indexOf(param.toString()) >= 0) {
                flags[param] = true;
            }
        }
    });

    return flags;
};