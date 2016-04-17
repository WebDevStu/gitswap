"use strict";

var chai     = require('chai'),
    Promise  = require('bluebird'),
    // index = require('../index'),
    file     = require('../lib/file'),
    reporter = require('../lib/reporter'),
    should   = chai.should();

/**
 * main flow tests
 */
// describe('Main', function () {
//
//     it('should pass', function (done) {
//         done();
//     });
// });


/**
 * file mangement tests
 */
describe('File Management', function () {

    var fileTest = file('./tests/test.txt'),
        defaultContent = 'abc123';

    describe('exposed methods', function () {
        it('should have predefined methods exposed', function (done) {
            fileTest.should.have.property('exists');
            fileTest.should.have.property('read');
            fileTest.should.have.property('write');
            fileTest.should.have.property('create');
            fileTest.should.have.property('update');
            fileTest.should.have.property('getUser');
            fileTest.should.have.property('updateSwap');
            Object.keys(fileTest).length.should.equal(7);
            done();
        });
    });

    describe('read method', function () {
        it('should return a Promise', function (done) {
            fileTest.read().should.be.an('object');
            fileTest.read().then.should.be.a('function');
            done();
        });
    });

    describe('write method', function () {
        it('should pass', function () {
            fileTest.write('abc123', 'message');
        });
    });
});


/**
 * reporter tests
 */
describe('Reporter', function () {

    describe('exposed methods', function () {
        it('should only have two methods', function (done) {
            reporter.should.have.property('get');
            reporter.should.have.property('wrap');
            Object.keys(reporter).length.should.equal(2);

            reporter.get.should.be.a('function');
            reporter.wrap.should.be.a('function');
            done();
        });
    });

    describe('pre-defined strings', function () {
        it('should return expected string', function (done) {
            reporter.get('default').should.equal(reporter.wrap("Error"));
            done();
        });

        it('should return default string', function (done) {
            reporter.get('#%_willNeverExists').should.equal(reporter.wrap("Error"));
            done();
        });
    });

    describe('wrao method - for wrapping strings for command line formatting', function () {

        var uniqString = 'STRING',
            boldStart = '\u001b[1m',
            boldEnd = '\u001b[22m';

        it('should return bold white as default', function (done) {
            reporter.wrap(uniqString).should.equal(boldStart + '\u001b[37m' + uniqString + '\u001b[39m' + boldEnd);
            done();
        });
        it('should return black text', function (done) {
            reporter.wrap(uniqString, 'black').should.equal(boldStart + '\u001b[30m' + uniqString + '\u001b[39m' + boldEnd);
            done();
        });
        it('should return blue text', function (done) {
            reporter.wrap(uniqString, 'blue').should.equal(boldStart + '\u001b[34m' + uniqString + '\u001b[39m' + boldEnd);
            done();
        });
        it('should return cyan text', function (done) {
            reporter.wrap(uniqString, 'cyan').should.equal(boldStart + '\u001b[36m' + uniqString + '\u001b[39m' + boldEnd);
            done();
        });
        it('should return green text', function (done) {
            reporter.wrap(uniqString, 'green').should.equal(boldStart + '\u001b[32m' + uniqString + '\u001b[39m' + boldEnd);
            done();
        });
        it('should return grey text', function (done) {
            reporter.wrap(uniqString, 'grey').should.equal(boldStart + '\u001b[90m' + uniqString + '\u001b[39m' + boldEnd);
            done();
        });
        it('should return magenta text', function (done) {
            reporter.wrap(uniqString, 'magenta').should.equal(boldStart + '\u001b[35m' + uniqString + '\u001b[39m' + boldEnd);
            done();
        });
        it('should return red text', function (done) {
            reporter.wrap(uniqString, 'red').should.equal(boldStart + '\u001b[31m' + uniqString + '\u001b[39m' + boldEnd);
            done();
        });
        it('should return yellow text', function (done) {
            reporter.wrap(uniqString, 'yellow').should.equal(boldStart + '\u001b[33m' + uniqString + '\u001b[39m' + boldEnd);
            done();
        });
        it('should return white text', function (done) {
            reporter.wrap(uniqString, 'white').should.equal(boldStart + '\u001b[37m' + uniqString + '\u001b[39m' + boldEnd);
            done();
        });
    });
});