import * as core from '@actions/core'
import run from '../src/main'
import fs from 'fs'
import yaml from 'js-yaml'
import {
  successfulComparisonResponse,
  successfulTagResponse,
  expectedSlackPost,
  preReleaseTagResponse,
  upToDateComparisonResponse
} from './mockResponses'

const nock = require('nock')
const slackWebhook = 'https://hooks.slack.com/services/foo/bar'

beforeEach(() => {
  jest.resetModules()
  jest.resetAllMocks()
  const doc = yaml.safeLoad(
    fs.readFileSync(__dirname + '/../action.yml', 'utf8')
  )
  Object.keys(doc.inputs).forEach(name => {
    const envVar = `INPUT_${name.replace(/ /g, '_').toUpperCase()}`
    process.env[envVar] = doc.inputs[name]['default']
  })
  process.env['INPUT_SLACK-CHANNEL'] = '#general'
  process.env['INPUT_SLACK-USERNAME'] = 'whoami'
  process.env.GITHUB_REPOSITORY = 'foo/bar'
  process.env.SLACK_WEBHOOK = slackWebhook
  process.env.GITHUB_TOKEN = 'token'
})

afterEach(() => {
  const doc = yaml.safeLoad(
    fs.readFileSync(__dirname + '/../action.yml', 'utf8')
  )
  Object.keys(doc.inputs).forEach(name => {
    const envVar = `INPUT_${name.replace(/ /g, '_').toUpperCase()}`
    delete process.env[envVar]
  })
  nock.cleanAll()
})

describe('Run', () => {
  it('sets all the outputs on a successful run', async () => {
    nock('https://api.github.com')
      .persist()
      .get('/repos/foo/bar/releases')
      .reply(200, successfulTagResponse)
    nock('https://api.github.com')
      .persist()
      .get('/repos/foo/bar/compare/v1.0.0...master')
      .reply(200, successfulComparisonResponse)
    nock('https://hooks.slack.com')
      .persist()
      .post('/services/foo/bar', expectedSlackPost)
      .reply(200, 'success')

    const setOutput = jest.spyOn(core, 'setOutput')
    const debugMock = jest.spyOn(core, 'debug')
    await run()

    expect(debugMock).toHaveBeenCalledWith('master is behind by 1 commit(s)')
    expect(debugMock).toHaveBeenCalledWith(
      'latest release date is 2013-02-27T19:35:32Z'
    )
    expect(debugMock).toHaveBeenCalledWith(
      'Slack response: success'
    )
    expect(setOutput).toHaveBeenCalledWith('unreleased-commit-count', '1')
    expect(setOutput).toHaveBeenCalledWith(
      'unreleased-commit-messages',
      '@octocat - Fix all the bugs\n'
    )
    expect(setOutput).toHaveBeenCalledWith(
      'unreleased-diff-url',
      'https://github.com/octocat/Hello-World/compare/master...topic'
    )
    expect(setOutput).toHaveBeenCalledWith(
      'latest-release-date',
      '2013-02-27T19:35:32Z'
    )
  })

  it('does not execute if the slack webhook env variable is not set', async () => {
    process.env.SLACK_WEBHOOK = ''
    const errorMock = jest.spyOn(core, 'error')
    await run()
    expect(errorMock).toHaveBeenCalledWith(
      "environment variable 'SLACK_WEBHOOK' is not set"
    )
  })

  it('does not execute if the github token env variable is not set', async () => {
    process.env.GITHUB_TOKEN = ''
    const errorMock = jest.spyOn(core, 'error')
    await run()
    expect(errorMock).toHaveBeenCalledWith(
      "environment variable 'GITHUB_TOKEN' is not set"
    )
  })

  it('does not notify if the repo does not contain any releases', async () => {
    nock('https://api.github.com')
      .persist()
      .get('/repos/foo/bar/releases')
      .reply(200, [])
    const errorMock = jest.spyOn(core, 'error')
    await run()
    expect(errorMock).toHaveBeenCalledWith(
      'No releases for "foo/bar" has been found'
    )
  })

  it('does not notify if the latest release is not found', async () => {
    nock('https://api.github.com')
      .persist()
      .get('/repos/foo/bar/releases')
      .reply(200, preReleaseTagResponse)
    const errorMock = jest.spyOn(core, 'error')
    await run()
    expect(errorMock).toHaveBeenCalledWith(
      'Latest release for "foo/bar" could not be found'
    )
  })

  it('does not notify if there are no unreleased commits ', async () => {
    const debugMock = jest.spyOn(core, 'debug')
    nock('https://api.github.com')
      .persist()
      .get('/repos/foo/bar/releases')
      .reply(200, successfulTagResponse)
    nock('https://api.github.com')
      .persist()
      .get('/repos/foo/bar/compare/v1.0.0...master')
      .reply(200, upToDateComparisonResponse)
    await run()
    expect(debugMock).toHaveBeenCalledWith(
      'Release is up-to-date'
    )
  })
})
