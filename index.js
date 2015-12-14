#! /usr/bin/env node


var homeDir     = process.env.HOME || process.env.USERPROFILE,

    _           = require('underscore'),
    fs          = require('fs'),
    File        = require('./lib/file'),

    gitSwap     = new File(homeDir + '/.gitswap'),
    gitConfig   = new File(homeDir + '/.gitConfig'),

    args        = process.argv.slice(2),

    defaults;


console.log(args)

if (!args.length) {}


/**
 * first read the .gitConfig file, check all details, then check for a .gitswap
 * file, if it doesn't exist, as the user if they want to create and add the
 * default details from the .gitconfig file.
 *
 * this is hte set up (first run)
 */
gitConfig
    .exists()

    // read the file
    .then(function () {
        return gitConfig.read();
    }, function () {
        console.error('There is no .gitconfig file, please save globals first');
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
    .then(function () {

        return gitSwap.read();

    }, function () {

        return gitSwap.create({
            orig: defaults
        });
    })

    // ok they want it
    .then(function (contents) {

        if (contents && !args.length) {

            console.info('.gitswap file exists, please provide profile to swap to');
            console.log('Possible profiles are:');

            _.each(JSON.parse(contents), function (value, profile) {
                console.log('    ' + profile);
            });

            process.exit();
        }
    }, process.exit);



/**
 * Next is to accept parameters to change the git profile to the stored label
 *
 */