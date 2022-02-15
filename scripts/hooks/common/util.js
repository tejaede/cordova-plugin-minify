var fs = require("fs");


module.exports = {
    concatenateFiles: function (files) {
        var self = this,
            result = "";
        try {
            files.forEach(function (file) {
                result += self.readFile(file) + "\n";
            });
        } catch (e) {
            console.warn("Failed to concatenate files", e);
            result = null;
        }
        return result;
    },
    copyFile: function copyFile(src, target) {
        if (fs.existsSync(target)) {
            fs.unlinkSync(target);
        }
        return fs.copyFileSync(src, target);
    },
    readFile: function readFile(file) {
        return fs.readFileSync(file, {encoding: "utf8"})
    },
    writeFile: function writeFile(file, content) {
        if (fs.existsSync(file)) {
            fs.unlinkSync(file);
        }
        return fs.writeFileSync(file, content, {encoding: "utf8"});
    }
}