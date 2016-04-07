
var Reporter = function (err) {


};


// static methods
Reporter.msg = {
    "default":      "Error",
    "copyConfig":   "Copying current config from .gitconfig file",
    "noGitConfig":  "There is no .gitconfig file, please save git globals first",
    "noProfile":    ".gitswap file exists, please provide profile to swap to. Possible profiles are:"
};


Reporter.prototype.get = function (identifier) {
    return (Reporter.msg[identifier] || Reporter.msg.default);
};

module.exports = new Reporter();