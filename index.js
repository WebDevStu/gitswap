#! /usr/bin/env node


var homeDir = process.env.HOME || process.env.USERPROFILE,

    fs      = require('fs'),
    File    = require('./lib/file'),

    gitSwap     = new File(homeDir + '/.gitswap'),
    gitConfig   = new File(homeDir + '/.gitConfig');


/**
 * get the git config
 */
gitConfig
    .exists()

    .then(function () {
        return gitConfig.read();
    }, function () {
        throw 'There is .gitconfig file, please save globals first';
    })

    .then(function (contents) {
        return gitConfig.getUser(contents);
    })
    .then(function (creds) {
        console.log(creds);
    });


/**
 * get the git swap file
 */
//gitSwap
//    .exists()
//
//    .then(function () {
//        // exists
//    }, function () {
//        // best create offer creation
//        return gitSwap.create();
//    })
//    .then(function () {
//        // create the file
//        console.log('create the file');
//    }, function () {
//        // meh, they're only bloody happy with it
//    });









