"use strict";

var _ = require('./utils'),
    defaults = {
        'g':  'global',
        'l':  'local',
        'ls': 'list',
        'a':  'add'
    };

module.exports = function (args) {

    var flags = {},
        shortHands = Object.keys(defaults),
        longHands  = Object.keys(defaults).map(function (key) {
            return defaults[key];
        });

    _.each(args, function (param) {

        param = param.replace(/\-/g, '');

        if (shortHands.indexOf(param.toString()) >= 0) {
            flags[defaults[param]] = true;
        }

        if (longHands.indexOf(param.toString()) >= 0) {
            flags[param] = true;
        }
    });

    return flags;
};