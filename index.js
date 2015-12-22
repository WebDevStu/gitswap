#! /usr/bin/env node


var homeDir     = process.env.HOME || process.env.USERPROFILE,

    _           = require('underscore'),
    fs          = require('fs'),
    File        = require('./lib/file'),

    gitSwap     = new File(homeDir + '/.gitswap'),
    gitConfig   = new File(homeDir + '/.gitconfigbak'),

    args        = process.argv.slice(2),

    config;


console.log(args);

if (!args.length) {}


/**
 1. read config -
    1.1. No config - bomb out -
    1.2. Config present continue -
 2. read gitswap -
    2.1. No .gitswap - create it? -
    2.2. gitswap present - change the params and change config -
 3. add new creds
 */



/**
 * first read the .gitConfig file, check all details, then check for a .gitswap
 * file, if it doesn't exist, as the user if they want to create and add the
 * default details from the .gitconfig file.
 *
 * this is the set up (first run)
 */


// git config first
gitConfig
    .exists()

    // read the file
    .then(function () {
        return gitConfig.read();
    }, function () {
        console.error('There is no .gitconfig file, please save git globals first');
        process.exit(1);
    })

    // read the users config
    .then(function (contents) {

        config = contents;
        return gitConfig.getUser(contents);
    })

    // write the user check file exists
    .then(function (credentials) {

        gitSwap
            .exists()
            .then(function () {

                return gitSwap.read();

            }, function () {

                return gitSwap.create({
                    orig: credentials
                });
            })

            .then(function (contents) {

                var swapProfile;

                if (contents) {

                    contents = JSON.parse(contents);

                    if (!args.length) {

                        console.info('.gitswap file exists, please provide profile to swap to');
                        console.log('Possible profiles are:');

                        _.each(contents, function (value, profile) {
                            console.log('    ' + profile);
                        });

                        process.exit();
                    } else {


                        swapProfile = contents[args[0]];

                        gitConfig.updateSwap(swapProfile, config);
                    }
                }




            });
    });



function swap (profile) {

}



/**
 * Next is to accept parameters to change the git profile to the stored label
 *
 */