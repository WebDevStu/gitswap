

var _       = require('underscore'),
    yesno   = require('yesno'),
    fs      = require('fs'),


    /**
     * GitConfig
     *
     * @constructor
     * @param file {string}
     */
    File = function (file) {
        this.file = file;
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
                    reject()
                } else {
                    fulfill()
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

        var file = this.file;

        return new Promise(function (fulfill, reject) {

            fs.stat(file, function (error, stats) {

                fs.open(file, "r", function (error, fd) {

                    buffer = new Buffer(stats.size);

                    fs.read(fd, buffer, 0, buffer.length, null, function (error, bytesRead, buffer) {

                        fulfill(buffer.toString("utf8", 0, buffer.length));

                        fs.close(fd);
                    });
                });
            });
        });
    },


    /**
     * create
     *
     * @returns {Promise}
     */
    create: function () {

        var file = this.file;

        return new Promise(function (fulfill, reject) {

            yesno.ask(file + ' doesn\'t exists, would you like to create it? (y/n)', true, function (ok) {

                if (ok) {
                    fulfill();
                } else {
                    reject();
                }

            });
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
            name,
            email;

        return new Promise(function (fulfill, reject) {

            // first check they have [user] settings applied
            if (!contents.match(/\[user\]/gi)) {
                return reject();
            }

            // now get name & email
            name = nameRe.exec(contents);
            email = emailRe.exec(contents);

            if (name && email) {
                fulfill({
                    name: name[1],
                    email: email[1]
                });
            } else {
                reject();
            }
        });
    }
});




// expose the class
module.exports = File;