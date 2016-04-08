"use strict";

var _        = require('underscore'),
    yesno    = require('yesno'),
    fs       = require('fs'),
    Promise  = require('bluebird'),
    reporter = require('./reporter'),


    /**
     * GitConfig
     *
     * @constructor
     * @param file {string}
     */
    File = function (file) {

        this.file = file;

        _.bindAll(this, 'read', 'write');
    };


_.extend(File.prototype, {


    /**
     * exists
     *
     * @returns {Promise}
     */
    exists: function () {

        var file = this.file;

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
     * read
     *
     * @returns {Promise}
     */
    read: function () {

        var file = this.file,
            buffer;

        return new Promise(function (fulfill, reject) {

            fs.stat(file, function (err, stats) {

                if (err) {
                    return reject();
                }

                fs.open(file, "r", function (err, fd) {

                    if (err) {
                        return reject();
                    }

                    buffer = new Buffer(stats.size);

                    fs.read(fd, buffer, 0, buffer.length, null, function (err, bytesRead, buffer) {

                        if (err) {
                            return reject();
                        }

                        fulfill(buffer.toString("utf8", 0, buffer.length));

                        fs.close(fd);
                    });
                });
            });
        });
    },


    /**
     * write
     * main write file method, takes content and writes to file
     *
     * @param content {String|Object}
     * @param msg {String}
     */
    write: function (content, msg) {

        var file = this.file,
            callback = Array.prototype.slice.call(arguments).pop();

        fs.writeFile(file, content, function (err) {

            if (err) {
                return reporter(err);
            }

            console.log(msg);

            if (callback && _.isFunction(callback)) {
                callback();
            }
        });
    },


    /**
     * create
     * creates the main .gitswap config file
     *
     * @param defaults {Object}
     * @returns {Promise}
     */
    create: function (defaults) {

        var file = this.file,
            write = this.write;

        return new Promise(function (fulfill, reject) {

            yesno.ask(file + ' doesn\'t exists, would you like to create it? (y/n)', true, function (ok) {

                if (ok) {

                    console.log('Copying current config from .gitconfig file');

                    write(JSON.stringify(defaults), 'Content copied', fulfill);
                } else {
                    reject();
                }
            });
        });
    },


    /**
     * update
     * updates the file contents
     *
     * @param newProfile
     */
    update: function (newProfile) {

        var read = this.read,
            write = this.write;

        return new Promise(function (fulfill, reject) {

            read().then(function (contents) {

                try {
                    contents = JSON.parse(contents);
                } catch (e) {
                    reject();
                }

                contents[newProfile['Profile tag']] = {
                    username: newProfile.username,
                    email: newProfile.email
                };

                write(JSON.stringify(contents), 'Config updated', fulfill);
            }, reject);
        });
    },


    /**
     * getUser
     * gets the default user creds from the .gitconfig
     *
     * @param contents {String}
     * @returns {Promise}
     */
    getUser: function (contents) {

        var nameRe = new RegExp(/name\ ?=\ ?(.*?)\n/i),
            emailRe = new RegExp(/email\ ?=\ ?(.*?)\n/i),
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
     * updateSwap
     *
     * @param profile
     * @param config
     * @param msg
     */
    updateSwap: function (profile, config, msg) {

        config = config.replace(/(name\ =\ )(.*?)\n/i, 'name = ' + profile.username + '\n');
        config = config.replace(/(email\ =\ )(.*?)\n/i, 'email = ' + profile.email + '\n');

        this.write(config, msg);
    }
});




// expose the class
module.exports = File;