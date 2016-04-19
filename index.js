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
    app;

// console table
require('console.table');

application = function () {

    var _current,
        _config,
        _swap;


        /**
         * run the swap based on flags
         *
         * @method  _allFilesExists
         * @param   {String}        contents [contents of swap file]
         */
        _allFilesExists = function (contents) {

            var swapProfile;

            try{
                contents = JSON.parse(contents);
                _swap = contents;
            } catch (e) {}

            // list all profiles
            if (flags.list) {
                return _getAllProfiles();
            }

            // add new profile
            if (flags.add) {
                return _getNewProfile();
            }

            // show current profile
            if (flags.current) {
                return _showCurrent();
            }

            // no profile supplied
            if (!flags.profile) {
                console.info(reporter.get('noProfile', 'yellow'));
                return _getAllProfiles();
            }

            // profile check for local / gloabl flag
            swapProfile = contents[flags.profile];

            if (swapProfile) {
                gitConfig.updateSwap(swapProfile, _config, '.gitconfig swapped to: ' + swapProfile.username + ' <' + swapProfile.email + '>');
            } else {
                console.log(reporter.get('noTag', 'red'));
            }
        },


        /**
         * gets all profiles in the swap file formulates into a pretty format
         * for the console.table
         *
         * @method  _getAllProfiles
         * @returns {Array}        [sorted array of profiles]
         */
        _getAllProfiles = function () {

            var profileTable = [];

            _.each(_swap, function (value, profile) {

                profileTable.push({
                    tag:      profile,
                    username: value.username,
                    email:    value.email
                });
            });

            console.table(profileTable.sort(function (a, b) {
                return a.tag.toLowerCase() > b.tag.toLowerCase();
            }));
        },


        /**
         * asks the user for the new profile
         *
         * @method  _getNewProfile
         */
        _getNewProfile = function () {

            prompt.start();

            prompt.get(['Profile tag', 'username', 'email'], function (err, result) {

                if (err) {
                    return;
                }

                if (Object.keys(_swap).indexOf(result['Profile tag']) >= 0) {
                    console.log(reporter.get('tagExists', 'red'));
                    return _getNewProfile();
                }

                gitSwap.update(result);
            });
        },


        /**
         * prints the current swap profile
         *
         * @TODO check for git repo
         *
         * @method  _showCurrent
         * @returns {[type]}     [description]
         */
        _showCurrent = function () {
            console.log(reporter.wrap('Curernt Profile: ' + current.username + ' <' + current.email + '>', 'blue'));
        },


        /**
         * exit process
         *
         * @method  _exit
         */
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

                    _config = gitConfigContents;

                    return gitConfig.getUser(gitConfigContents);
                })

                //
                // write the user check file exists
                //
                .then(function (credentials) {

                    _current = credentials;

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
app = application();
app.init();