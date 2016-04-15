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
    }
};