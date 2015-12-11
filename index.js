#! /usr/bin/env node


var homeDir     = process.env.HOME || process.env.USERPROFILE,

    fs          = require('fs'),
    File        = require('./lib/file'),

    gitSwap     = new File(homeDir + '/.gitswap'),
    gitConfig   = new File(homeDir + '/.gitConfig'),
    defaults;


/**
 * first read the .gitConfig file, check all details, then check for a .gitswap
 * file, if it doesn't exist, as the user if they want to create and add the
 * default details from the .gitconfig file.
 */
gitConfig
    .exists()

    // read the file
    .then(function () {
        return gitConfig.read();
    }, function () {
        throw 'There is no .gitconfig file, please save globals first';
    })

    // read the user
    .then(function (contents) {
        return gitConfig.getUser(contents);
    })

    // write the user check file exists
    .then(function (credentials) {

        defaults = credentials;

        return gitSwap.exists()
    })

    // doesn't exist lets ask the user
    .then(process.exit, function () {
        return gitSwap.create();
    })

    // ok they want it
    .then(function () {
        // create the file
        console.log('create the file', defaults);

    }, process.exit);

