#! /usr/bin/env node

"use strict";

var homeDir     = process.env.HOME || process.env.USERPROFILE,
    // requires
    path        = require('path'),
    prompt      = require('prompt'),
    Promise     = require('bluebird'),
    // local libs
    _           = require('./lib/utils'),
    reporter    = require('./lib/reporter'),
    file        = require('./lib/file'),
    flags       = require('./lib/flags'),
    // files
    pkg         = file(__dirname + '/package.json'),
    gitSwap     = file(homeDir + '/.gitswap'),
    gitConfig   = file(homeDir + '/.gitconfig'),
    localConfig = file([process.cwd(), '.git', 'config'].join(path.sep)),
    // arguments
    args        = process.argv.slice(2),
    // app
    application,
    app;


// console table
require('console.table');

/**
 * main application factory
 *
 * @method  application
 * @returns {Object}    [object of exposed methods]
 */
application = function () {

    var _version,
        _globalCurrent,
        _globalConfig,
        _localCurrent,
        _localConfig,
        _swap,
        _isGlobal = true,


        /**
         * run the swap based on flags
         *
         * @method  _delegateSwap
         * @param   {String} contents [contents of swap file]
         */
        _delegateSwap = function (contents) {

            var swapProfile,
                config = {
                    version: _printVersion,
                    delete:  _deleteProfile,
                    list:    _printAllProfiles,
                    add:     _addNewProfile,
                    current: _printCurrent,
                    help:    _printHelp
                },
                running = true;

            try{
                contents = JSON.parse(contents);
                _swap = contents;
            } catch (e) {}

            // iterate the config and run method if flag is present
            _.each(config, function (method, key) {

                if (running && flags[key]) {
                    running = false;
                    return method();
                }
            });

            if (!running) {
                return;
            }

            // no profile supplied
            if (!flags.profile) {

                _printCurrent();
                console.log(reporter.get('no.profile', 'yellow'));
                _printAllProfiles();
                return;
            }

            // profile check for local / gloabl flag
            swapProfile = contents[flags.profile];

            if (swapProfile) {
                _doSwap(swapProfile);
            } else {
                console.log(reporter.get('no.tag', 'red'));
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
         * @method  _printAllProfiles
         * @returns {Array}        [sorted array of profiles]
         */
        _printAllProfiles = function () {

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
         * @method  _addNewProfile
         */
        _addNewProfile = function () {

            prompt.start();

            prompt.get(['Profile tag', 'username', 'email'], function (err, result) {

                if (err) {
                    return;
                }

                if (_.contains(Object.keys(_swap), result['Profile tag'])) {
                    console.log(reporter.get('tag.exists', 'red'));
                    return _addNewProfile();
                }

                gitSwap.update(result);
            });
        },


        /**
         * prints the current swap profile
         *
         * @method  _printCurrent
         * @returns {[type]}     [description]
         */
        _printCurrent = function () {

            console.log(reporter.wrap('Curernt Global Profile: ' + _globalCurrent.username + ' <' + _globalCurrent.email + '>', 'blue'));

            // no further if we are globally positioned
            if (_isGlobal) {
                return;
            }

            // check for local credentials
            if (_localCurrent) {
                console.log(reporter.wrap('Curernt Project Profile: ' + _localCurrent.username + ' <' + _localCurrent.email + '>', 'blue'));
            } else {
                console.log(reporter.wrap('No Project user set', 'blue'));
            }
        },


        /**
         * prints the version of the package
         *
         * @method  _printVersion
         */
        _printVersion = function () {
            console.log('gitswap v' + _version);
        },


        /**
         * delete a profile from the swap cache
         *
         * @method  _deleteProfile
         */
        _deleteProfile = function () {

            if (!flags.profile) {
                return console.log(reporter.get('prov.delete', 'red'));
            }

            if (!_swap[flags.profile]) {
                return console.log(reporter.get('no.tag', 'red'));
            }

            delete _swap[flags.profile];

            gitSwap.update(null, _swap);
        },


        /**
         * prints a help table
         *
         * @method _printHelp
         */
        _printHelp = function () {

            console.table([
                {
                    "Flag":         '',
                    "Short Hand":   '',
                    "Description":  'Swap to a new profile',
                    "Usage":        'gitswap [tag]'
                },
                {
                    "Flag":         '--global',
                    "Short Hand":   '-g',
                    "Description":  'Force to swap the global profile',
                    "Usage":        'gitswap [tag] --global]'
                },
                {
                    "Flag":         '--list',
                    "Short Hand":   '-l',
                    "Description":  'List all saved profiles',
                    "Usage":        'gitswap --list'
                },
                {
                    "Flag":         '--add',
                    "Short Hand":   '-a',
                    "Description":  'Prompt to add a new profile',
                    "Usage":        'gitswap --add'
                },
                {
                    "Flag":         '--delete',
                    "Short Hand":   '-d',
                    "Description":  'Delete a profile from your gitswap file',
                    "Usage":        'gitswap [tag] --delete'
                },
                {
                    "Flag":         '--current',
                    "Short Hand":   '-c',
                    "Description":  'Prints out the global and local profile',
                    "Usage":        'gitswap --current'
                },
                {
                    "Flag":         '--help',
                    "Short Hand":   '',
                    "Description":  'List help for gitswap',
                    "Usage":        'gitswap --help'
                },
                {
                    "Flag":         '--version',
                    "Short Hand":   '-v',
                    "Description":  'Show the gitswap version you have',
                    "Usage":        'gitswap --version'
                }
            ]);
        },


        /**
         * reads the package for version
         *
         * @method  _readPackage
         * @returns {Promise}     [new promise for chaining]
         */
        _readPackage = function () {

            return new Promise(function (fulfill, reject) {

                pkg.read()
                    .then(function (pkgContents) {

                        try {
                            pkgContents = JSON.parse(pkgContents);
                        } catch (e) {}

                        _version = pkgContents.version;

                        fulfill();
                    }, reject);
            });
        },


        /**
         * reads the local config
         *
         * @method  _readLocal
         * @returns {Promise}   [promise chaining]
         */
        _readLocal = function () {

            return new Promise(function (fulfill) {

                localConfig
                    // does it exists
                    .exists()
                    // if local is present read it
                    .then(function () {

                        _isGlobal = false;

                        return localConfig.read();
                    })
                    // catch error
                    .catch(function () {
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
                    })
                    // catch errors
                    .catch(function () {

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

            return new Promise(function (fulfill) {

                gitConfig
                    // git config first
                    .exists()
                    // read the  git config file
                    .then(function () {
                        return gitConfig.read();
                    })
                    // error no file found
                    .catch(function () {

                        console.error(reporter.get('no.git.config', 'red'));

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

            gitSwap
                // does it exists
                .exists()
                // git swap is present
                .then(function () {
                    return gitSwap.read();
                })
                // no file ask to create one
                .catch(function () {

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
        },

        // todo
        _error = function () {};

    // exposed methods
    return {

        /**
         * initialisation method
         *
         * @method  init
         */
        init: function () {

            _readPackage()
                .then(_readLocal).catch(_error)
                .then(_readGlobal).catch(_error)
                .then(_readSwap).catch(_error);
        }

    };
};

// set flags
flags = flags(args);

// start app
app = application();
app.init();
