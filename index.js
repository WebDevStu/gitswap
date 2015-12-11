#! /usr/bin/env node


var homeDir = process.env.HOME || process.env.USERPROFILE,

    fs      = require('fs'),
    File    = require('./lib/file'),

    gitSwap     = new File(homeDir + '/.gitswap'),
    gitConfig   = new File(homeDir + '/.gitConfig');


/**
 * get the git config
 */
gitConfig
    .exists()

    .then(function () {

        return gitConfig.read();
    }, function () {

        console.log('There is .gitconfig file, please save globals first');
        process.exit(1);
    })

    .then(function (contents) {

        return gitConfig.getUser(contents);
    });


/**
 * get the git swap file
 */
gitSwap
    .exists()

    .then(function () {
        // exists
    }, function () {
        // best create offer creation
        return gitSwap.create();
    })
    .then(function () {
        // create the file
        console.log('create the file');
    }, function () {
        // meh, they're only bloody happy with it
    });









