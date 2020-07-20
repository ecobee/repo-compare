import * as core from '@actions/core'
import * as github from '@actions/github'

const run = async (): Promise<void> => {
  try {
    const includePrerelease: boolean = parseBoolean(
      core.getInput('include-prerelease', {
        required: false
      })
    )
    const token = process.env['GITHUB_TOKEN']
    if (!token) return

    const octokit = github.getOctokit(token)
    const nwo = process.env['GITHUB_REPOSITORY'] || '/'
    const [owner, repo] = nwo.split('/')
    const {data: releases} = await octokit.repos.listReleases({
      owner,
      repo
    })
    if (releases.length === 0) return
    const latestRelease = releases.find(
      element => element.prerelease === includePrerelease
    )
    if (latestRelease === null) return
    const {data: comparison} = await octokit.repos.compareCommits({
      owner,
      repo,
      base: latestRelease.tag_name,
      head: 'master'
    })
    core.debug(
      `Master is ${comparison.status} by ${comparison.total_commits} commits`
    )
    core.setOutput(
      'unreleased-commit-count',
      comparison.total_commits.toString()
    )
    core.setOutput(
      'unreleased-commit-messages',
      comparison.commits
        .map(commit => `@${commit.author.login} - ${commit.commit.message}\n`)
        .join('')
    )
    core.setOutput('unreleased-diff-url', comparison.html_url)
  } catch (error) {
    core.setFailed(`repo-compare failure: ${error}`)
  }
}

run()

export default run

function parseBoolean(toParse: string): boolean {
  return !!(toParse && toParse.toLowerCase() === 'true')
}
