/* global describe, it, beforeEach, afterEach */
// Copyright 2016 Yahoo Inc.
// Licensed under the terms of the BSD 3-Clause license. Please see LICENSE file in the project root for terms.
var chai = require('chai'),
    mktemp = require('mktmp'),
    shell = require('shelljs'),
    fs = require('fs'),
    path = require('path'),
    expect = chai.expect,
    script = require('../index.js'),
    directory;

shell.config.fatal = true;

describe('functional', function () {
    beforeEach(function () {
        directory = mktemp.createDirSync('XXXXXX');
    });

    afterEach(function () {
        shell.rm('-rf', directory);
    });

    it('should create a new major version if no tags exist', function () {
        var packageJson = JSON.stringify({
                version: '1.0.0'
            }),
            tags;

        shell.cd(directory);
        shell.exec('git init');
        shell.exec('git config user.email "foobar@example.com"');
        shell.exec('git config user.name "foobar"');
        fs.writeFileSync(path.join(directory, 'package.json'), packageJson);
        shell.exec('git add --all');
        shell.exec('git commit --message "foo"');

        script();

        tags = shell.exec('git tag').stdout.split('\n');

        expect(tags).to.contain('v1.0.0');
    });

    it('should create a new patch version if major.minor.patch already exists', function () {
        var packageJson = JSON.stringify({
                version: '1.2.3'
            }),
            tags;

        shell.cd(directory);
        shell.exec('git init');
        shell.exec('git config user.email "foobar@example.com"');
        shell.exec('git config user.name "foobar"');
        fs.writeFileSync(path.join(directory, 'package.json'), packageJson);
        shell.exec('git add --all');
        shell.exec('git commit --message "foo"');
        shell.exec('git tag v1.2.3');

        script();

        tags = shell.exec('git tag').stdout.split('\n');

        expect(tags).to.contain('v1.2.4');
    });

    it('should create a new patch version if package.json does not change', function () {
        var packageJson = JSON.stringify({
                version: '1.0.0'
            }, null, 4),
            tags;

        shell.cd(directory);
        shell.exec('git init');
        shell.exec('git config user.email "foobar@example.com"');
        shell.exec('git config user.name "foobar"');
        fs.writeFileSync(path.join(directory, 'package.json'), packageJson);
        shell.exec('git add --all');
        shell.exec('git commit --message "foo"');

        script();

        tags = shell.exec('git tag').stdout.split('\n');

        expect(tags).to.contain('v1.0.0');
    });

    it('should fail if no package.json', function () {
        shell.cd(directory);
        shell.exec('git init');

        expect(script).to.throw(/Could not load package.json, please make sure it exists/);
    });

    it('should fail if bad version number', function () {
        var packageJson = JSON.stringify({
                version: 'abc'
            }, null, 4),
            tags;

        shell.cd(directory);
        shell.exec('git init');
        shell.exec('git config user.email "foobar@example.com"');
        shell.exec('git config user.name "foobar"');
        fs.writeFileSync(path.join(directory, 'package.json'), packageJson);
        shell.exec('git add --all');
        shell.exec('git commit --message "foo"');

        expect(script).to.throw(/Invalid version number found in package.json, please make sure it is valid/);
    });
});
