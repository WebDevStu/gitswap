#! /usr/bin/env node

var homeDir     = process.env.HOME || process.env.USERPROFILE,

    fs          = require('fs'),
    path        = require('path'),
    prompt      = require('prompt'),

    _           = require('./lib/utils'),
    reporter    = require('./lib/reporter'),
    file        = require('./lib/file'),
    flags       = require('./lib/flags'),

    Promise     = require('bluebird'),

    gitSwap     = file(homeDir + '/.gitswap'),
    gitConfig   = file(homeDir + '/.gitconfig'),
    localConfig = file([process.cwd(), '.git', 'config'].join(path.sep)),

    args        = process.argv.slice(2),

    application,
    app;


// console table
require('console.table');

application = function () {

    var _globalCurrent,
        _globalConfig,
        _localCurrent,
        _localConfig,
        _swap,
        _isGlobal = true,


        /**
         * run the swap based on flags
         *
         * @method  _delegateSwap
         * @param   {String}        contents [contents of swap file]
         */
        _delegateSwap = function (contents) {

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
                _doSwap(swapProfile);
            } else {
                console.log(reporter.get('noTag', 'red'));
            }
        },


        /**
         * swap the profile
         *
         * @method  _doSwap
         * @param   {Object} swapProfile [profile to swap to]
         */
        _doSwap = function (swapProfile) {

            if (_isGlobal || flags.global) {
                gitConfig.updateSwap(swapProfile, _globalConfig, '.gitconfig swapped to: ' + swapProfile.username + ' <' + swapProfile.email + '>');
            } else {
                localConfig.updateSwap(swapProfile, _localConfig, './.git/config swapped to: ' + swapProfile.username + ' <' + swapProfile.email + '>');
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

            console.log(reporter.wrap('Curernt Global Profile: ' + _globalCurrent.username + ' <' + _globalCurrent.email + '>', 'blue'));

            if (_isGlobal) {
                return;
            }

            if (_localCurrent) {
                console.log(reporter.wrap('Curernt Project Profile: ' + _localCurrent.username + ' <' + _localCurrent.email + '>', 'blue'));
            } else {
                console.log(reporter.wrap('No Project user set', 'blue'));
            }
        },


        /**
         * reads the local config
         *
         * @method  _readLocal
         * @returns {Promise}   [promise chaining]
         */
        _readLocal = function () {

            return new Promise(function (fulfill, reject) {

                localConfig.exists()
                    // if local is present read it
                    .then(function () {
                        _isGlobal = false;
                        return localConfig.read();
                    }, function () {
                        _isGlobal = true;
                    })
                    // we've got contents get the user
                    .then(function (localConfigContents) {
                        _localConfig = localConfigContents;
                        return gitConfig.getUser(localConfigContents);
                    })
                    // if the user exists store it
                    .then(function (credentials) {
                        _localCurrent = credentials;
                        fulfill();
                    }, function (cre) {
                        _localCurrent = null;
                        fulfill();
                    });
                });
        },


        /**
         * reads the global config
         *
         * @method  _readGlobal
         * @returns {Promise}    [promise chaining]
         */
        _readGlobal = function () {

            return new Promise(function (fulfill, reject) {

                // git config first
                gitConfig.exists()
                    // read the  git config file
                    .then(function () {
                        return gitConfig.read();
                    }, function () {
                        // error no file found
                        console.error(reporter.get('noGitConfig', 'red'));
                        _exit();
                    })
                    // read the users config
                    .then(function (gitConfigContents) {
                        _globalConfig = gitConfigContents;
                        return gitConfig.getUser(gitConfigContents);
                    })
                    .then(fulfill);
                });
        },


        /**
         * reads the swap file
         *
         * @method  _readSwap
         * @param   {String}  credentials [contents of global config]
         */
        _readSwap = function (credentials) {

            _globalCurrent = credentials;

            gitSwap.exists()

                // git swap is present
                .then(function () {
                    return gitSwap.read();
                }, function () {
                    return gitSwap.create({
                        orig: credentials
                    })
                    .then(_exit, _exit);
                })
                // resolved
                .then(_delegateSwap);
        },


        /**
         * exit process
         *
         * @method  _exit
         */
        _exit = function exit () {
            process.exit();
        };

    // exposed methods
    return {

        /**
         * initialisation method
         *
         * @method  init
         */
        init: function () {

            _readLocal()
                .then(_readGlobal)
                .then(_readSwap);
        }
    };
};

// set flags
flags = flags(args);

// start app
app = application();
app.init();