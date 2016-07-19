"use strict";

module.exports = {


    /**
     * iteration over arrays or objects
     *
     * @method  each
     * @param   {Array|Object} subject  [subject to iterate]
     * @param   {Function} predicate    [method for each iteration]
     * @returns {Array|Object}          [return subject for chaining]
     */
    each: function (subject, predicate) {

        var prop;

        if (subject instanceof Array) {
            subject.forEach(predicate);
        } else {
            for (prop in subject) {
                if (subject.hasOwnProperty(prop)) {
                    predicate(subject[prop], prop);
                }
            }
        }

        return subject;
    },


    /**
     * checks to see it item is found within an array - doens't work if an
     * array of objects
     *
     * @method contains
     * @param  {Array}          haystack [the array to check]
     * @param  {String|Boolean} needle   [the item to find]
     * @return {Boolean}                 [does it contain it]
     */
    contains: function (haystack, needle) {

        var item = haystack.find(function (hay) {
            return (hay === needle);
        });

        return !!item;
    }
};
