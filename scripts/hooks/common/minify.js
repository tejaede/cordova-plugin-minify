var path = require('path');

var Uglify = require('uglify-js');
var PluginInfoProvider = require('cordova-common').PluginInfoProvider;
var PlatformJson = require('cordova-common').PlatformJson;
var CordovaPlatforms = require("cordova-lib").cordova_platforms;
var events = require('cordova-common').events;

var util = require("./util");


function collectModules (files, platformApi) {
    var pluginRootDir = "plugins",
        platform = platformApi.platform,
        platformJson = PlatformJson.load(pluginRootDir, platform),
        plugins = Object.keys(platformJson.root.installed_plugins).concat(Object.keys(platformJson.root.dependent_plugins)),
        pluginInfoProvider = new PluginInfoProvider(),
        modules = [
            files.cordova,
            files.pluginManifest
        ];

    events.emit('verbose', 'Iterating over plugins in project:', plugins);
    plugins.forEach(function (plugin) {
        var pluginDir = path.join(pluginRootDir, plugin),
            pluginInfo = pluginInfoProvider.get(pluginDir),
            pluginWww = path.join(platformApi.locations.www, pluginInfo.dir)

        pluginInfo.getJsModules(platform).forEach(function (jsModule) {
            modules.push(path.join(pluginWww, jsModule.src));
        })
    });
    return modules;
}

function doubleDigit(integer) {
    return integer < 10 ? "0" + integer : integer;
}

function getTimeStamp() {
    var date = new Date(),
        timeStamp = doubleDigit(date.getMonth() + 1);
        
    timeStamp += "-";
    timeStamp += doubleDigit(date.getDate());
    timeStamp += "-";
    timeStamp += date.getFullYear();
    timeStamp += " ";
    timeStamp += doubleDigit(date.getHours() + 1);
    timeStamp += ":";
    timeStamp += doubleDigit(date.getMinutes() + 1);
    timeStamp += ":";
    timeStamp += doubleDigit(date.getSeconds() + 1);
    return timeStamp;
}

function minify(content, version) {
    var minified = Uglify.minify(content, {
            mangle: {
                reserved: [
                    "cordova",
                    "module",
                    "exports",
                    "require"
                ]
            }
        }),
        content = ["/**************************************************"];
    if (version) {
        content.push("* Version: " + version);
    }
    content.push("* Build Time: " + getTimeStamp());
    content.push("**************************************************/");
    content.push(minified.code);
    return content.join("\n");
} 

function getBuildFilePaths(buildWww) {
    return {
        cordova: path.join(buildWww, "cordova.js"),
        cordovaBackup: path.join(buildWww, "cordova.orig.js"),
        cordovaPreMinify: path.join(buildWww, "cordova.preminify.js"),
        pluginManifest: path.join(buildWww, "cordova_plugins.js")
    }
}

module.exports = function (platform, version) {
    var platformApi = CordovaPlatforms.getPlatformApi(platform),
        concatenated, files, minified, modules;

    if (!platformApi) {
        throw new Error("Platform '" + platform + "' is not configured in config.json");
    }
    files = getBuildFilePaths(platformApi.locations.www);
    modules = collectModules(files, platformApi);

    try {
        concatenated = util.concatenateFiles(modules);
        minified = minify(concatenated, version);
        util.copyFile(files.cordova, files.cordovaBackup);
        util.writeFile(files.cordova, minified);
        util.writeFile(files.cordovaPreMinify, concatenated);
    } catch (e) {
        console.error("[Minify] Failed to minify platform '" + platform + "'", e);
    }
}