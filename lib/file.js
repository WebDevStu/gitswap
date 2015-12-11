

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


    getUser: function (contents) {

        console.log(content);
    }
});




// expose the class
module.exports = File;