#! /usr/bin/env node

var homeDir     = process.env.HOME || process.env.USERPROFILE,

    _           = require('underscore'),
    fs          = require('fs'),
    yesno       = require('yesno'),
    prompt      = require('prompt'),
    File        = require('./lib/file'),

    gitSwap     = new File(homeDir + '/.gitswap'),
    gitConfig   = new File(homeDir + '/.gitconfigbak'),

    args        = process.argv.slice(2),

    config;


if (!args.length) {}



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

    // read the  git config file
    .then(function () {

        return gitConfig.read();

    }, function () {
        // error no file found
        console.error('There is no .gitconfig file, please save git globals first');

        process.exit(1);
    })

    // read the users config
    .then(function (gitConfigContents) {

        config = gitConfigContents;

        return gitConfig.getUser(gitConfigContents);
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

            .then(allFilesExists);
    });


function allFilesExists (contents) {

    var swapProfile;

    if (contents) {

        contents = JSON.parse(contents);

        if (!args.length) {

            console.info('.gitswap file exists, please provide profile to swap to');
            console.log('Possible profiles are:');

            _.each(contents, function (value, profile) {
                console.log('    ' + profile);
            });

            yesno.ask('Do you want to add a new profile? (y/n)', true, function (ok) {
                if (ok) {
                    prompt.start();

                    prompt.get(['Profile key', 'name', 'email'], function (err, result) {

                        if (err) {
                            return onErr(err);
                        }

                        gitSwap.update(result);
                    });
                } else {
                    process.exit(1);
                }
            });
        } else {

            swapProfile = contents[args[0]];

            console.log(swapProfile);

            gitConfig.updateSwap(swapProfile, config);
        }
    }
}