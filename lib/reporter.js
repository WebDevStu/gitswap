"use strict";

var reporter = function () {

    /**
     * stored messages for use via id
     *
     * @type {Object}
     */
    var _msg = {
            "default":       "Error",
            "copy.config":   "Copying current config from .gitconfig file",
            "no.git.config": "There is no .gitconfig file, please save git globals first, run the following to set up:\ngit config --global user.name \"Your name\";\ngit config --global user.email \"Your email\";",
            "no.profile":    ".gitswap file exists, please provide profile to swap to. Possible profiles are:",
            "no.tag":        "That tag does not exist in your .gitswap file",
            "tag.exists":    "The tag you are creating already exists, please enter a different tag.",
            "prov.delete":   "Please provide profile to delete"
        },


        /**
         * available colours
         *
         * @type {Object}
         */
        _colours = {
            black:   [30, 39],
            blue:    [34, 39],
            cyan:    [36, 39],
            green:   [32, 39],
            grey:    [90, 39],
            magenta: [35, 39],
            red:     [31, 39],
            yellow:  [33, 39],
            white:   [37, 39],
        },


        /**
         * converts the co-ordinates to strings
         *
         * @method  _convert
         * @param   {Number} val [number to insert into the string]
         * @returns {String}     [formatted string]
         */
        _convert = function (val) {
            return '\u001b[' + val + 'm';
        },


        /**
         * wraps the string as bold and white if no colour is supplied
         *
         * @method  _wrapString
         * @param   {String}    string [string to wrap]
         * @param   {String}    colour [optional colour]
         * @returns {String}           [formatted string]
         */
        _wrapString = function (string, colour) {

            var codes = _colours[colour] || _colours.white;

            return [
                _convert(1),
                _convert(codes[0]),
                string,
                _convert(codes[1]),
                _convert(22)
            ].join('');
        };

    return {

        /**
         * main getter to return from the private stored strings
         *
         * @method  get
         * @param   {String} identifier [id of the string to return]
         * @param   {String} colour     [optional colour to style the text as]
         * @returns {String}            [formatted string to print]
         */
        get: function (identifier, colour) {
            return _wrapString(_msg[identifier] || _msg.default, colour);
        },


        /**
         * alias to the wrap string method
         *
         * @type {Function}
         */
        wrap: _wrapString
    };
};


module.exports = reporter();