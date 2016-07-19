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

    var _nameRegExp  = /name\s?=\s?(.*?)\n/i,
        _emailRegExp = /email\s?=\s?(.*?)\n/i,

        /**
         * checks that the file path exists
         *
         * @method _exists
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
         * reads the file and passes back the promise
         *
         * @method _read
         * @returns {Promise}
         */
        _read = function () {

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
         * main write file method, takes content and writes to file
         *
         * @method _write
         * @param  {String|Object} content [content to write]
         * @param  {String}        msg     [message to post]
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
         * creates the main .gitswap config file
         *
         * @method _create
         * @param  {Object} defaults [defaults object]
         * @return {Promise}         [returned promise]
         */
        _create = function (defaults) {

            return new Promise(function (fulfill, reject) {

                yesno.ask(file + ' doesn\'t exists, would you like to create it? (y/n)', true, function (ok) {

                    if (ok) {

                        console.log(reporter.get('copy.config', 'blue'));

                        _write(JSON.stringify(defaults), 'Content copied', fulfill);
                    } else {
                        reject();
                    }
                });
            });
        },


        /**
         * updates the file contents
         *
         * @method _update
         * @param  {Object} newProfile    [new profile credentials]
         * @param  {String} updateContent [new file update]
         * @return {Promise}              [new promise returned]
         */
        _update = function (newProfile, updateContent) {

            return new Promise(function (fulfill, reject) {

                _read().then(function (contents) {

                    try {
                        contents = JSON.parse(contents);
                    } catch (e) {
                        reject();
                    }

                    if (newProfile) {
                        contents[newProfile['Profile tag']] = {
                            username: newProfile.username,
                            email: newProfile.email
                        };
                    }

                    contents = updateContent || contents;

                    _write(JSON.stringify(contents), 'Config updated', fulfill);
                }, reject);
            });
        },


        /**
         * gets the default user creds from the .gitconfig
         *
         * @method _getUser
         * @param  {String} contents [string contents]
         * @return {Promise}         [returned promise]
         */
        _getUser = function (contents) {

            var nameRe  = new RegExp(_nameRegExp),
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
                email    = emailRe.exec(contents);

                if (username && email) {
                    return fulfill({
                        username: username[1],
                        email:    email[1]
                    });
                }

                reject();
            });
        },


        /**
         * updates the .git/config file with the new credentials
         *
         * @method _updateSwap
         * @param  {Object}    profile [profile object]
         * @param  {Object}    config  [config object]
         * @param  {String}    msg     [message to report]
         */
        _updateSwap = function (profile, config, msg) {

            var pad     = '\n' + (new Array(8).join(' ')),
                name    = 'name = ',
                email   = 'email = ',
                prepend = '';

            // if the user doesn't exists we need to append to the end
            if (!config.match(/\[user\]/gi)) {

                prepend = [
                    "[user]",
                    pad, name,  profile.username,
                    pad, email, profile.email
                ].join('');

                config = [prepend, config].join('\n');
            } else {
                config = config.replace(_nameRegExp,  name +  profile.username + '\n');
                config = config.replace(_emailRegExp, email + profile.email    + '\n');
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
