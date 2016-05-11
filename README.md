# NPM Auto Version

[![npm](https://img.shields.io/npm/v/npm-auto-version.svg?maxAge=2592000)](https://www.npmjs.com/package/npm-auto-version)
[![downloads](https://img.shields.io/npm/dt/npm-auto-version.svg?maxAge=2592000)](https://www.npmjs.com/package/npm-auto-version)

This script is used to automatically generate new NPM versions based on Git tags when publishing.

## Usage

Recommended contents of your package.json:

```json
{
    "version": "1.0.0",
    "scripts": {
        "prepublish": "npm-auto-version",
        "postpublish": "git push origin --tags"
    }
}
```

This will (under the hood) do the following when you run `npm publish`:

 - Get the MAJOR.MINOR version from your package.json version field (call them M and N respectively)
 - Get the list of git tags that match `M.N.*`
 - Use semver to generate the next appropriate patch value `M.N.P`
 - Update the package.json version field with `M.N.P`
 - Generate a new git tag in the NPM syntax: `vM.N.P`
 - Publish the package to NPM (via `npm publish`)
 - Push the tags to your git origin

## Requirements

This script requires:

 - Node 0.12+
 - Git client and grep installed in `$PATH`
 - Shell that supports pipe `|`

## License

Code licensed under the BSD 3-Clause license. See LICENSE file for terms.
