var minify = require("./common/minify"),
    fs = require("fs");

function parseVersion(projectRoot) {
    var version;
    try {
        var packageJson = fs.readFileSync(projectRoot + "/package.json", {encoding: "utf8"});
        packageJson = JSON.parse(packageJson);
        version = packageJson.version;
    } catch (e) {
        console.warn(e);
    }
    return version;
}

module.exports = function (context) {
    var platforms = context.opts && context.opts.platforms || [],
        projectRoot = context.opts && context.opts.projectRoot,
        version = projectRoot && parseVersion(projectRoot);

    
    platforms.forEach(function (platform) {
        console.log("[AfterBuild][" + platform + "] Minify cordova and plugins");
        try {
            minify(platform, version);
            console.log("[AfterBuild][" + platform + "] Minification SUCCESS");
        } catch (e) {
            console.error("[AfterBuild][" + platform + "] Minification FAIL");
        }
    });
}