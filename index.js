#! /usr/bin/env node

var homeDir     = process.env.HOME || process.env.USERPROFILE,

    _           = require('underscore'),
    fs          = require('fs'),
    yesno       = require('yesno'),
    prompt      = require('prompt'),
    File        = require('./lib/file'),
    onError     = require('./lib/error'),

    gitSwap     = new File(homeDir + '/.gitswap'),
    gitConfig   = new File(homeDir + '/.gitconfigbak'),

    args        = process.argv.slice(2),
    config;

// git config first
gitConfig.exists()
    // read the  git config file
    .then(function () {
        return gitConfig.read();
    }, function () {
        // error no file found
        console.error('There is no .gitconfig file, please save git globals first');
        exit();
    })
    // read the users config
    .then(function (gitConfigContents) {

        config = gitConfigContents;

        return gitConfig.getUser(gitConfigContents);
    })
    // write the user check file exists
    .then(function (credentials) {

        gitSwap.exists()
            .then(function () {
                return gitSwap.read();
            }, function () {
                return gitSwap.create({
                    orig: credentials
                }).then(exit);
            })
            .then(allFilesExists);
    });


/**
 * exit
 */
function exit () {
    process.exit();
}


/**
 * allFilesExists
 *
 * @param contents
 */
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

            return askForNewProfile();
        }

        swapProfile = contents[args[0]];

        gitConfig.updateSwap(swapProfile, config, '.gitconfig swapped to: ' + swapProfile.name + ' <' + swapProfile.email + '>');
    }
}


/**
 * askForNewProfile
 * asks the user if they wish to add a new profile
 */
function askForNewProfile () {

    yesno.ask('Do you want to add a new profile? (y/n)', true, function (ok) {

        if (ok) {
            prompt.start();

            prompt.get(['Profile key', 'name', 'email'], function (err, result) {

                if (err) {
                    return onError(err);
                }

                gitSwap.update(result);
            });
        } else {
            exit();
        }
    });
}