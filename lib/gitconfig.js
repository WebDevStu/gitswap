

var _       = require('underscore'),
    fs      = require('fs'),


    /**
     * GitConfig
     *
     * @constructor
     */
    GitConfig = function () {

    };


_.extend(GitConfig.prototype, {


    read: function (file) {

        return new Promise(function (fulfill, reject) {

            fs.exists(file, function (exists) {

                if (!exists) {
                    reject();
                    return;
                }

                fs.stat(file, function (error, stats) {

                    fs.open(file, "r", function (error, fd) {

                        buffer = new Buffer(stats.size);

                        fs.read(fd, buffer, 0, buffer.length, null, function (error, bytesRead, buffer) {

                            fulfill(JSON.parse(buffer.toString("utf8", 0, buffer.length)));

                            fs.close(fd);
                        });
                    });
                });
            });

        });
    }

});




// expose the class
module.exports = new GitConfig();