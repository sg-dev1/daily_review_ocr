//
// # Purpose of this custom expo plugin:
//   - Copies certificate file from /assets/withAssets/{raw,xml} to app/src/main/res/{raw,xml}
//   - Adds android:networkSecurityConfig="@xml/network_security_config" to the application element in AndroidManifest.xml
//
//   Inspired by (/further resources)
//   - Update config of expo app to copy files to app, modify manifest etc. (using @expo/config-plugins)
//   https://stackoverflow.com/a/76773373
//   https://stackoverflow.com/a/70762575
//   https://github.com/search?q=expo+withandroidmanifest&type=code
//   https://github.com/ReactVision/viro/blob/d6b51f0fe292709dede871e26de2675ad8071943/plugins/withViroAndroid.ts#L248
//
//   - Adding a custom certificate to an android app (generic solution, non react native)
//   https://stackoverflow.com/a/71542188
//
//
// # Usage instructions:
//
// - Add it to app.json in "plugins" section, e.g. add the following array
//    ["./withAssets.js", {"raw": "./assets/withAssets/raw", "xml": "./assets/withAssets/xml"}]
//
// - Need to be compile to javascript using typescript compiler:
//   > npx tsc withAssets.ts
//   Outputs the withAssets.js file (but prints error messages, but it seems they can be ignored)
/*
node_modules/@expo/config-plugins/build/ios/Swift.d.ts:1:23 - error TS2688: Cannot find type definition file for 'xcode'.

1 /// <reference types="xcode" />
                        ~~~~~

node_modules/@expo/config-plugins/build/ios/XcodeProjectFile.d.ts:1:23 - error TS2688: Cannot find type definition file for 'xcode'.

1 /// <reference types="xcode" />
                        ~~~~~


Found 2 errors in 2 files.

Errors  Files
     1  node_modules/@expo/config-plugins/build/ios/Swift.d.ts:1
     1  node_modules/@expo/config-plugins/build/ios/XcodeProjectFile.d.ts:1
*/
//
import type { ConfigPlugin, ExportedConfigWithProps } from '@expo/config-plugins';

import { existsSync, mkdirSync, lstatSync, readdirSync, copyFileSync } from 'fs';
import { join, basename } from 'path';

import { withDangerousMod, withAndroidManifest } from '@expo/config-plugins';
import { Manifest } from '@expo/config-plugins/build/android';

const androidResRawFolderPath = ['app', 'src', 'main', 'res', 'raw'];
const androidResXmlFolderPath = ['app', 'src', 'main', 'res', 'xml'];

interface AssetsMapping {
  raw: string | string[];
  xml: string | string[];
}

const withAssets: ConfigPlugin<AssetsMapping> = (expoConfig, assetsMapping) => {
  withDangerousMod(expoConfig, [
    'android',
    (modConfig) => {
      if (modConfig.modRequest.platform === 'android') {
        const androidRawPath = join(modConfig.modRequest.platformProjectRoot, ...androidResRawFolderPath);
        copyFiles(androidRawPath, assetsMapping.raw);

        const androidXmlPath = join(modConfig.modRequest.platformProjectRoot, ...androidResXmlFolderPath);
        copyFiles(androidXmlPath, assetsMapping.xml);
      }
      return modConfig;
    },
  ]);

  withAndroidManifest(expoConfig, (newConfig: ExportedConfigWithProps<Manifest.AndroidManifest>) => {
    const contents = newConfig.modResults;
    /*
    let application = contents.manifest.application;
    if (!application) {
      application = [{}]
    }
    */
    const appAttributes = contents.manifest.application?.[0].$;
    if (appAttributes) {
      appAttributes['android:networkSecurityConfig'] = '@xml/network_security_config';
    }
    //['android:networkSecurityConfig'] = '@xml/network_security_config';
    return newConfig;
  });

  return expoConfig;
};

function copyFiles(source: string, targets: string | string[]) {
  let files = targets;
  if (!Array.isArray(files)) {
    files = [files];
  }
  files.forEach((file) => {
    const isFile = lstatSync(file).isFile();
    if (isFile) {
      copyFileSync(file, join(source, basename(file)));
    } else {
      copyFolderRecursiveSync(file, source);
    }
  });
}

function copyFolderRecursiveSync(source: string, target: string) {
  if (!existsSync(target)) mkdirSync(target);

  const files = readdirSync(source);

  files.forEach((file) => {
    const sourcePath = join(source, file);
    const targetPath = join(target, file);

    if (lstatSync(sourcePath).isDirectory()) {
      copyFolderRecursiveSync(sourcePath, targetPath);
    } else {
      copyFileSync(sourcePath, targetPath);
    }
  });
}

export default withAssets;
