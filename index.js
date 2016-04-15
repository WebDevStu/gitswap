#! /usr/bin/env node

var homeDir     = process.env.HOME || process.env.USERPROFILE,

    fs          = require('fs'),
    yesno       = require('yesno'),
    prompt      = require('prompt'),

    _           = require('./lib/utils'),
    reporter    = require('./lib/reporter'),
    File        = require('./lib/file'),

    Promise     = require('bluebird'),

    gitSwap     = new File(homeDir + '/.gitswap'),
    gitConfig   = new File(homeDir + '/.gitconfig'),

    args        = process.argv.slice(2),

    current,
    config,
    swap;

// console table
require('console.table');

// git config first
gitConfig.exists()

    //
    // read the  git config file
    //
    .then(function () {
        return gitConfig.read();
    }, function () {
        // error no file found
        console.error(reporter.get('noGitConfig', 'red'));
        exit();
    })

    //
    // read the users config
    //
    .then(function (gitConfigContents) {

        config = gitConfigContents;

        return gitConfig.getUser(gitConfigContents);
    })

    //
    // write the user check file exists
    //
    .then(function (credentials) {

        current = credentials;

        gitSwap.exists()

            //
            // git swap is present
            //
            .then(function () {
                return gitSwap.read();
            }, function () {

                return gitSwap.create({
                    orig: credentials
                })
                .then(exit, exit);
            })

            //
            // resolved
            //
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

    var swapProfile,
        table = [];

    if (contents) {

        contents = JSON.parse(contents);
        swap = contents;

        if (!args.length) {
            console.info(reporter.get('noProfile', 'yellow'));
            console.log(reporter.wrap('Curernt Profile: ' + current.username + ' <' + current.email + '>', 'blue'));
            console.table(getAllProfiles());

            return askForNewProfile();
        }

        swapProfile = contents[args[0]];

        if (swapProfile) {
            gitConfig.updateSwap(swapProfile, config, '.gitconfig swapped to: ' + swapProfile.username + ' <' + swapProfile.email + '>');
        } else {
            console.log(reporter.get('noTag', 'red'));
            askForNewProfile();
        }
    }
}


/**
 * gets all the tags in a preety format
 *
 * @method  getAllProfiles
 * @returns {Array}   [array of profiles]
 */
function getAllProfiles () {

    var profileTable = [],
        prop;

    _.each(swap, function (value, profile) {

        profileTable.push({
            tag:      profile,
            username: value.username,
            email:    value.email
        });
    });

    return profileTable.sort(function (a, b) {
        return a.tag.toLowerCase() > b.tag.toLowerCase();
    });
}


/**
 * askForNewProfile
 * asks the user if they wish to add a new profile
 */
function askForNewProfile () {

    yesno.ask(reporter.wrap('Do you want to add a new profile? (y/n)', 'white'), true, function (ok) {

        if (ok) {
            getNewProfile();
        } else {
            exit();
        }
    });
};


/**
 * looping the getting of the tag details
 */
function getNewProfile () {

    prompt.start();

    prompt.get(['Profile tag', 'username', 'email'], function (err, result) {

        if (err) {
            return;
        }

        if (Object.keys(swap).indexOf(result['Profile tag']) >= 0) {

            console.log(reporter.get('tagExists', 'red'));
            return getNewProfile();
        }

        gitSwap.update(result);
    });
};