#! /usr/bin/env node

var homeDir     = process.env.HOME || process.env.USERPROFILE,

    fs          = require('fs'),
    prompt      = require('prompt'),

    _           = require('./lib/utils'),
    reporter    = require('./lib/reporter'),
    file        = require('./lib/file'),
    flags       = require('./lib/flags'),

    Promise     = require('bluebird'),

    gitSwap     = file(homeDir + '/.gitswap'),
    gitConfig   = file(homeDir + '/.gitconfig'),

    args        = process.argv.slice(2),

    application,
    app,
    current,
    config,
    swap;

// console table
require('console.table');

app = function () {

    var _allFilesExists = function (contents) {

            var swapProfile;

            if (contents) {
                contents = JSON.parse(contents);
                swap = contents;
            }

            // list all profiles
            if (flags.list) {
                return console.table(_getAllProfiles());
            }

            // add new profile
            if (flags.add) {
                return _getNewProfile();
            }

            // show current profile
            if (flags.current) {
                return console.log(reporter.wrap('Curernt Profile: ' + current.username + ' <' + current.email + '>', 'blue'));
            }

            // no profile supplied
            if (!flags.profile) {
                console.info(reporter.get('noProfile', 'yellow'));
                return console.table(_getAllProfiles());
            }

            // profile check for local / gloabl flag
            swapProfile = contents[flags.profile];

            if (swapProfile) {
                gitConfig.updateSwap(swapProfile, config, '.gitconfig swapped to: ' + swapProfile.username + ' <' + swapProfile.email + '>');
            } else {
                console.log(reporter.get('noTag', 'red'));
            }
        },

        _getAllProfiles = function () {

            var profileTable = [];

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
        },

        _getNewProfile = function () {

            prompt.start();

            prompt.get(['Profile tag', 'username', 'email'], function (err, result) {

                if (err) {
                    return;
                }

                if (Object.keys(swap).indexOf(result['Profile tag']) >= 0) {

                    console.log(reporter.get('tagExists', 'red'));
                    return _getNewProfile();
                }

                gitSwap.update(result);
            });
        },

        _exit = function exit () {
            process.exit();
        };

    return {

        init: function () {

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
                    _exit();
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
                            .then(_exit, _exit);
                        })

                        //
                        // resolved
                        //
                        .then(_allFilesExists);
                });
        }
    };
};

// set flags
flags = flags(args);

// start app
application = app();
application.init();