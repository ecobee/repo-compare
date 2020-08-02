export const successfulComparisonResponse = {
  html_url: 'https://github.com/octocat/Hello-World/compare/master...topic',
  status: 'behind',
  ahead_by: 1,
  behind_by: 2,
  total_commits: 1,
  commits: [
    {
      commit: {
        message: 'Fix all the bugs'
      },
      author: {
        login: 'octocat'
      }
    }
  ]
}

export const upToDateComparisonResponse = {
  html_url: 'https://github.com/octocat/Hello-World/compare/master...topic',
  status: 'up-to-date',
  ahead_by: 0,
  behind_by: 0,
  total_commits: 0,
  commits: []
}

export const successfulTagResponse = [
  {
    tag_name: 'v1.0.0',
    prerelease: false,
    published_at: '2013-02-27T19:35:32Z'
  }
]

export const preReleaseTagResponse = [
  {
    tag_name: 'v1.0.0',
    prerelease: true,
    published_at: '2013-02-27T19:35:32Z'
  }
]

export const expectedSlackPost = {
  text: 'bar Last Shipped Notification',
  username: 'whoami',
  channel: '#general',
  blocks: [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: 'bar was last shipped on Wed, 27 Feb 2013 19:35:32 GMT',
        emoji: true
      }
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: 'There are 1 commit(s) ready to ship.'
      }
    },
    {
      type: 'divider'
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text:
          'Commits in https://github.com/octocat/Hello-World/compare/master...topic:'
      }
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '```@octocat - Fix all the bugs\n```'
      }
    }
  ]
}
