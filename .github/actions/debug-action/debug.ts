import * as core from '@actions/core'
import * as github from '@actions/github'

const run = async (): Promise<void> => {
    try {
        console.log({ payload: github.context.payload })
        
        const includePrerelease = core.getInput("include-prerelease");
        const message = `👋 Hello! I will include pre-releases ${includePrerelease}! 🙌`;

        const token = process.env['GITHUB_TOKEN']
        if (!token) return

        const octokit: github.GitHub = new github.GitHub(token)
        const nwo = process.env['GITHUB_REPOSITORY'] || '/'
        const [owner, repo] = nwo.split('/')
        const { data: releases } = await octokit.repos.listReleases({
            owner,
            repo
        });
        if (releases.length == 0) return
        
        const { data: comparison } = await octokit.repos.compareCommits({
            owner,
            repo,
            base: releases[0].tag_name,
            head: 'master'
        });
        console.log(comparison);
        core.debug(message);
        core.setOutput("latest-release", message);
    } catch (error) {
        core.setFailed(`Debug-action failure: ${error}`);
    }
};

run();

export default run;
