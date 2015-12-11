

var _       = require('underscore'),
    yesno   = require('yesno'),
    fs      = require('fs'),


    /**
     * GitSwap
     *
     * @constructor
     */
    GitSwap = function () {

    };


_.extend(GitSwap.prototype, {


    /**
     * exists
     */
    exists: function (file) {

        return new Promise(function (fulfill, reject) {

            fs.exists(file, function (exists) {

                if (!exists) {

                    yesno.ask(file + ' doesn\'t exists, would you like to create it? (y/n)', true, function (ok) {

                        if (ok) {
                            fulfill();
                        } else {
                            reject()
                            process.exit(1);
                        }

                    });
                } else {
                    process.exit(1);
                }
            });
        });
    }

});




// expose the class
module.exports = new GitSwap();