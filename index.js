// Copyright 2016 Yahoo Inc.
// Licensed under the terms of the BSD 3-Clause license. Please see LICENSE file in the project root for terms.
var path = require('path'),
    semver = require('semver'),
    exec = require('child_process').execSync,
    fs = require('fs');

/**
 * Get the current version from the package.json
 * @method getPackageVersion
 * @return {String} MAJOR.MINOR version
 */
function getPackageVersion() {
    var packageJson = path.join(process.cwd(), 'package.json'),
        version;
    try {
        version = require(packageJson).version;
    } catch (unused) {
        throw new Error('Could not load package.json, please make sure it exists');
    }

    if (!semver.valid(version)) {
        throw new Error('Invalid version number found in package.json, please make sure it is valid');
    }

    return [semver.major(version), semver.minor(version)].join('.');
}

/**
 * Removes the 'v' in version git tags
 * @method stripPrefix
 * @param  {String} version Git tag (v1.0.0)
 * @return {String}         Version (1.0.0)
 */
function stripPrefix(version) {
    return version.substr(1);
}

/**
 * Get the versions from git tags
 * @method getGitTags
 * @param  {String} baseVersion MAJOR.MINOR version
 * @return {Array}              List of npm versions from git tags
 */
function getGitTags(baseVersion) {
    var tags = [];

    try {
        tags = exec('git tag | grep "v' + baseVersion + '."').toString().split('\n').map(stripPrefix);
    } catch (unused) {}

    return tags.filter(function (version) {
        return semver.valid(version);
    });
}

/**
 * Updates the package.json with the new version number
 * @method writePackageVersion
 * @param  {String} newVersion New version string MAJOR.MINOR.PATCH
 */
function writePackageVersion(newVersion) {
    var packageJson = path.join(process.cwd(), 'package.json'),
        raw = require(packageJson);

    raw.version = newVersion;

    fs.writeFileSync(packageJson, JSON.stringify(raw, null, 2));
}

/**
 * Generates the next unused version number based on Git tags
 * @method npm-auto-version
 */
module.exports = function () {
    // Get the MAJOR.MINOR version from your package.json version field (call them M and N respectively)
    var baseVersion = getPackageVersion();
    // Get the list of git tags that match `M.N.*`
    var tags = getGitTags(baseVersion);
    var maxSatisfy = semver.maxSatisfying(tags, baseVersion + '.*');
    // Use semver to generate the next appropriate patch value `M.N.P`
    var newVersion;
    if (maxSatisfy) {
        newVersion = semver.inc(maxSatisfy, 'patch');
    } else {
        newVersion = baseVersion + '.0';
    }
    // Update the package.json version field with `M.N.P`
    writePackageVersion(newVersion);
    // Generate a new git tag in the NPM syntax: `vM.N.P`
    exec('git tag v' + newVersion);
};
