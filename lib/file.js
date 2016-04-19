"use strict";

var yesno    = require('yesno'),
    fs       = require('fs'),
    Promise  = require('bluebird'),
    reporter = require('./reporter'),
    file;

/**
 * File method factory
 *
 * @param file {string}
 */
file = function (file) {

    var _nameRegExp = /name\s?=\s?(.*?)\n/i,
        _emailRegExp = /email\s?=\s?(.*?)\n/i,

        /**
         * _exists
         *
         * @returns {Promise}
         */
        _exists = function () {

            return new Promise(function (fulfill, reject) {

                fs.exists(file, function (exists) {

                    if (!exists) {
                        reject();
                    } else {
                        fulfill();
                    }
                });
            });
        },


        /**
         * _read
         *
         * @returns {Promise}
         */
        _read = function () {

            var buffer;

            return new Promise(function (fulfill, reject) {

                fs.readFile(file, "utf8", function (err, data) {

                    if (err) {
                        return reject();
                    }

                    fulfill(data);
                });
            });
        },


        /**
         * _write
         * main write file method, takes content and writes to file
         *
         * @param content {String|Object}
         * @param msg {String}
         */
        _write = function (content, msg) {

            var callback = Array.prototype.slice.call(arguments).pop();

            fs.writeFile(file, content, function (err) {

                if (err) {
                    return reporter(err);
                }

                console.log(msg);

                if (callback && (typeof callback === 'function')) {
                    callback();
                }
            });
        },


        /**
         * _create
         * creates the main .gitswap config file
         *
         * @param defaults {Object}
         * @returns {Promise}
         */
        _create = function (defaults) {

            return new Promise(function (fulfill, reject) {

                yesno.ask(file + ' doesn\'t exists, would you like to create it? (y/n)', true, function (ok) {

                    if (ok) {

                        console.log(reporter.get('copyConfig', 'blue'));

                        _write(JSON.stringify(defaults), 'Content copied', fulfill);
                    } else {
                        reject();
                    }
                });
            });
        },


        /**
         * _update
         * updates the file contents
         *
         * @param newProfile
         */
        _update = function (newProfile) {

            return new Promise(function (fulfill, reject) {

                _read().then(function (contents) {

                    try {
                        contents = JSON.parse(contents);
                    } catch (e) {
                        reject();
                    }

                    contents[newProfile['Profile tag']] = {
                        username: newProfile.username,
                        email: newProfile.email
                    };

                    _write(JSON.stringify(contents), 'Config updated', fulfill);
                }, reject);
            });
        },


        /**
         * _getUser
         * gets the default user creds from the .gitconfig
         *
         * @param contents {String}
         * @returns {Promise}
         */
        _getUser = function (contents) {

            var nameRe = new RegExp(_nameRegExp),
                emailRe = new RegExp(_emailRegExp),
                username,
                email;

            return new Promise(function (fulfill, reject) {

                // first check they have [user] settings applied
                if (!contents.match(/\[user\]/gi)) {
                    return reject();
                }

                // now get name & email
                username = nameRe.exec(contents);
                email = emailRe.exec(contents);

                if (username && email) {

                    return fulfill({
                        username: username[1],
                        email: email[1]
                    });
                }

                reject();
            });
        },


        /**
         * _updateSwap
         *
         * @param profile
         * @param config
         * @param msg
         */
        _updateSwap = function (profile, config, msg) {

            var pad = '\n' + new Array(7).join(' ');

            // if the user doesn exists we need to append to the end
            if (!config.match(/\[user\]/gi)) {
                config += "[user]";
                config += pad + 'name = ' + profile.username;
                config += pad + 'email = ' + profile.email;
            } else {
                config = config.replace(_nameRegExp, 'name = ' + profile.username + '\n');
                config = config.replace(_emailRegExp, 'email = ' + profile.email + '\n');
            }

            this.write(config, msg);
        };

    // expose methods
    return {
        exists:     _exists,
        read:       _read,
        write:      _write,
        create:     _create,
        update:     _update,
        getUser:    _getUser,
        updateSwap: _updateSwap
    };
};


// expose the class
module.exports = file;