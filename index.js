#! /usr/bin/env node


var homeDir = process.env.HOME || process.env.USERPROFILE,

    fs      = require('fs'),

    gitSwap = require('./lib/gitSwap'),
    gitConfig = require('./lib/gitConfig');



gitSwap.exists(homeDir + '.gitswap')
    .then(function () {
        process.exit(1);
    });






