import * as core from '@actions/core'
import * as github from '@actions/github'
import {Block} from '@slack/web-api'
import {IncomingWebhook} from '@slack/webhook'

const run = async (): Promise<void> => {
  try {
    const includePrerelease: boolean = parseBoolean(
      core.getInput('include-prerelease', {
        required: false
      })
    )
    const slackWebhook = process.env['SLACK_WEBHOOK']
    if (!slackWebhook) return

    const webhook = new IncomingWebhook(slackWebhook)

    const githubToken = process.env['GITHUB_TOKEN']
    if (!githubToken) return

    const octokit = github.getOctokit(githubToken)
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
      base: latestRelease?.tag_name || '',
      head: 'master'
    })
    core.debug(
      `Master is ${comparison.status} by ${comparison.total_commits} commit(s)`
    )

    const lastReleaseDate = latestRelease?.published_at || ''
    core.setOutput('latest-release-date', lastReleaseDate)

    core.setOutput(
      'unreleased-commit-count',
      comparison.total_commits.toString()
    )
    const commits = comparison.commits
      .map(commit => `@${commit.author.login} - ${commit.commit.message}\n`)
      .join('')

    core.setOutput('unreleased-commit-messages', commits)
    core.setOutput('unreleased-diff-url', comparison.html_url)

    if (!comparison.total_commits) {
      return
    }

    ;(async () => {
      await webhook.send({
        text: `${repo} Last Shipped Notification`,
        blocks: slackMessage(
          repo,
          lastReleaseDate,
          comparison.html_url,
          comparison.total_commits,
          commits
        )
      })
    })()
  } catch (error) {
    core.setFailed(`repo-compare failure: ${error}`)
  }
}

run()

export default run

function parseBoolean(toParse: string): boolean {
  return !!(toParse && toParse.toLowerCase() === 'true')
}

function slackMessage(
  repoName: string,
  lastShippedDate: string,
  comparisonURL: string,
  totalCommits: number,
  commits: string
): Block[] {
  const parsedDate = new Date(lastShippedDate)
  const header = {
    type: 'header',
    text: {
      type: 'plain_text',
      text: `${repoName} was last shipped on ${parsedDate.toLocaleString()}`,
      emoji: true
    }
  }
  const summary = {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `There are ${totalCommits} commit(s) ready to ship.`
    }
  }
  const compareLink = {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `Commits in ${comparisonURL}:`
    }
  }
  const commitsSummary = {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `\`\`\`${commits}\`\`\``
    }
  }
  return [
    header,
    summary,
    {
      type: 'divider'
    },
    compareLink,
    commitsSummary
  ]
}
