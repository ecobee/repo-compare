<p align="center">
  <a href="https://github.com/ecobee/repo-compare/actions"><img alt="typescript-action status" src="https://github.com/ecobee/repo-compare/workflows/build-test/badge.svg"></a>
</p>

# Repo Compare

Use this action to compare what's at the HEAD of your default branch, compared to what was lasted included in last release

# Usage
Create a new workflow in your repository with the following configuration

```yaml
name: 'Daily Release Workflow'
on:
  schedule:
    - cron:  '0 13 * * 1-5'

jobs:
  build:
    name: Stale Commits Notifier
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v1
        with:
          fetch-depth: 1
      - uses: ecobee/repo-compare@master
        with:
            include-prerelease: false
            default-branch: master
            slack-username: shipit
            slack-channel: '#springfield'
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SLACK_WEBHOOK: ${{ secrets.SLACK_WEBHOOK }}
```


## Development

Install the dependencies
```bash
$ npm install
```

Build the typescript and package it for distribution
```bash
$ npm run build && npm run pack
```

Run the tests :heavy_check_mark:
```bash
$ npm test

 PASS  __tests__/main.test.ts
  Run
    ✓ calculates how many commits the repo is behind (38ms)
    ✓ sets `unreleased-commit-count (33ms)
    ✓ sets `unreleased-commit-messages (18ms)
    ✓ sets `unreleased-diff-url (15ms)
    ✓ sets `latest-release-date (16ms)
...
```

## Publish to a distribution branch

Actions are run from GitHub repos so we will checkin the packed dist folder.

Then run [ncc](https://github.com/zeit/ncc) and push the results:
```bash
$ npm run pack
$ git add dist
$ git commit -a -m "prod dependencies"
$ git push origin releases/v1
```

The action is now published! :rocket:

See the [versioning documentation](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md)

## Validate

You can now validate the action by referencing `./` in a workflow in your repo (see [test.yml](.github/workflows/test.yml))

```yaml
uses: ./
with:
  milliseconds: 1000
```

See the [actions tab](https://github.com/ecobee/repo-compare/actions) for runs of this action! :rocket:

## Usage:

After testing you can [create a v1 tag](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md) to reference the stable and latest V1 action