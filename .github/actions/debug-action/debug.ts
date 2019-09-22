import * as core from '@actions/core'
import * as github from '@actions/github'

const run = async (): Promise<void> => {
    try {
        console.log({ payload: github.context.payload })

        const includePrerelease: boolean = parseBoolean(
            core.getInput('include-prerelease', {
                required: false,
            }),
        )
        const token = process.env['GITHUB_TOKEN']
        if (!token) return

        const octokit: github.GitHub = new github.GitHub(token)
        const nwo = process.env['GITHUB_REPOSITORY'] || '/'
        const [owner, repo] = nwo.split('/')
        const { data: releases } = await octokit.repos.listReleases({
            owner,
            repo
        })
        if (releases.length == 0) return
        const latestRelease = releases.find(element => element.prerelease == includePrerelease)
        if (latestRelease == null) return
        const { data: comparison } = await octokit.repos.compareCommits({
            owner,
            repo,
            base: latestRelease.tag_name,
            head: 'master'
        })
        console.log(comparison.total_commits)
        core.debug(`Master is ${comparison.status} by ${comparison.total_commits} commits`)
        core.setOutput('unreleased-commits-count', comparison.total_commits.toString())
        core.setOutput('unreleased-commits', comparison.commits.map(commit => commit.commit.message).toString())
    } catch (error) {
        core.setFailed(`Debug-action failure: ${error}`)
    }
};

run();

export default run;

function parseBoolean(toParse: string): boolean {
    return !!(toParse && toParse.toLowerCase() == 'true');
}