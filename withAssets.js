"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var path_1 = require("path");
var config_plugins_1 = require("@expo/config-plugins");
var androidResRawFolderPath = ['app', 'src', 'main', 'res', 'raw'];
var androidResXmlFolderPath = ['app', 'src', 'main', 'res', 'xml'];
var withAssets = function (expoConfig, assetsMapping) {
    (0, config_plugins_1.withDangerousMod)(expoConfig, [
        'android',
        function (modConfig) {
            if (modConfig.modRequest.platform === 'android') {
                var androidRawPath = path_1.join.apply(void 0, __spreadArray([modConfig.modRequest.platformProjectRoot], androidResRawFolderPath, false));
                copyFiles(androidRawPath, assetsMapping.raw);
                var androidXmlPath = path_1.join.apply(void 0, __spreadArray([modConfig.modRequest.platformProjectRoot], androidResXmlFolderPath, false));
                copyFiles(androidXmlPath, assetsMapping.xml);
            }
            return modConfig;
        },
    ]);
    (0, config_plugins_1.withAndroidManifest)(expoConfig, function (newConfig) {
        var _a;
        var contents = newConfig.modResults;
        /*
        let application = contents.manifest.application;
        if (!application) {
          application = [{}]
        }
        */
        var appAttributes = (_a = contents.manifest.application) === null || _a === void 0 ? void 0 : _a[0].$;
        if (appAttributes) {
            appAttributes['android:networkSecurityConfig'] = '@xml/network_security_config';
        }
        //['android:networkSecurityConfig'] = '@xml/network_security_config';
        return newConfig;
    });
    return expoConfig;
};
function copyFiles(source, targets) {
    var files = targets;
    if (!Array.isArray(files)) {
        files = [files];
    }
    files.forEach(function (file) {
        var isFile = (0, fs_1.lstatSync)(file).isFile();
        if (isFile) {
            (0, fs_1.copyFileSync)(file, (0, path_1.join)(source, (0, path_1.basename)(file)));
        }
        else {
            copyFolderRecursiveSync(file, source);
        }
    });
}
function copyFolderRecursiveSync(source, target) {
    if (!(0, fs_1.existsSync)(target))
        (0, fs_1.mkdirSync)(target);
    var files = (0, fs_1.readdirSync)(source);
    files.forEach(function (file) {
        var sourcePath = (0, path_1.join)(source, file);
        var targetPath = (0, path_1.join)(target, file);
        if ((0, fs_1.lstatSync)(sourcePath).isDirectory()) {
            copyFolderRecursiveSync(sourcePath, targetPath);
        }
        else {
            (0, fs_1.copyFileSync)(sourcePath, targetPath);
        }
    });
}
exports.default = withAssets;
