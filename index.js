"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const run = async () => {
    try {
        console.log({ payload: github.context.payload });
        const includePrerelease = parseBoolean(core.getInput('include-prerelease', {
            required: false,
        }));
        const token = process.env['GITHUB_TOKEN'];
        if (!token)
            return;
        const octokit = new github.GitHub(token);
        const nwo = process.env['GITHUB_REPOSITORY'] || '/';
        const [owner, repo] = nwo.split('/');
        const { data: releases } = await octokit.repos.listReleases({
            owner,
            repo
        });
        if (releases.length == 0)
            return;
        const latestRelease = releases.find(element => element.prerelease == includePrerelease);
        if (latestRelease == null)
            return;
        const { data: comparison } = await octokit.repos.compareCommits({
            owner,
            repo,
            base: latestRelease.tag_name,
            head: 'master'
        });
        console.log(comparison.total_commits);
        core.debug(`Master is ${comparison.status} by ${comparison.total_commits} commits`);
        core.setOutput('unreleased-commits-count', comparison.total_commits.toString());
        core.setOutput('unreleased-commits', comparison.commits.map(commit => commit.commit.message).toString());
    }
    catch (error) {
        core.setFailed(`repo-compare failure: ${error}`);
    }
};
run();
exports.default = run;
function parseBoolean(toParse) {
    return !!(toParse && toParse.toLowerCase() == 'true');
}
