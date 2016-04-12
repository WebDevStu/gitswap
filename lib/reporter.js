"use strict";

var Reporter = function (err) {

    // TODO:

};


// static methods
Reporter.msg = {
    "default":      "Error",
    "copyConfig":   "Copying current config from .gitconfig file",
    "noGitConfig":  "There is no .gitconfig file, please save git globals first",
    "noProfile":    ".gitswap file exists, please provide profile to swap to. Possible profiles are:",
    "tagExists":    "The tag you are creating already exists, please enter a different tag.",
    "noTag":        "That tag does not exist in your .gitswap file"
};


Reporter.prototype.get = function (identifier) {
    return (Reporter.msg[identifier] || Reporter.msg.default);
};

module.exports = new Reporter();