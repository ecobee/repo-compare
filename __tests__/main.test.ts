import * as core from '@actions/core'
import run from '../src/main'
import fs from 'fs'
import yaml from 'js-yaml'

const nock = require('nock')
const comparisonResponse = {
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
const tagResponse = [{tag_name: 'v1.0.0', prerelease: false}]

beforeEach(() => {
  jest.resetModules()
  const doc = yaml.safeLoad(
    fs.readFileSync(__dirname + '/../action.yml', 'utf8')
  )
  Object.keys(doc.inputs).forEach(name => {
    const envVar = `INPUT_${name.replace(/ /g, '_').toUpperCase()}`
    process.env[envVar] = doc.inputs[name]['default']
  })
  process.env.GITHUB_TOKEN = 'token'
  process.env.GITHUB_REPOSITORY = 'foo/bar'
  nock('https://api.github.com')
    .persist()
    .get('/repos/foo/bar/releases')
    .reply(200, tagResponse)
  nock('https://api.github.com')
    .persist()
    .get('/repos/foo/bar/compare/v1.0.0...master')
    .reply(200, comparisonResponse)
})

afterEach(() => {
  const doc = yaml.safeLoad(
    fs.readFileSync(__dirname + '/../action.yml', 'utf8')
  )
  Object.keys(doc.inputs).forEach(name => {
    const envVar = `INPUT_${name.replace(/ /g, '_').toUpperCase()}`
    delete process.env[envVar]
  })
})

describe('Run', () => {
  it('calculates how many commits the repo is behind', async () => {
    const debugMock = jest.spyOn(core, 'debug')
    await run()
    expect(debugMock).toHaveBeenCalledWith(
      'Master is behind by 1 commits'
    )
  })

  it('sets `unreleased-commit-count', async () => {
    const setOutput = jest.spyOn(core, 'setOutput')
    await run()
    expect(setOutput).toHaveBeenCalledWith(
      'unreleased-commit-count',
      '1'
    )
  })

  it('sets `unreleased-commit-messages', async () => {
    const setOutput = jest.spyOn(core, 'setOutput')
    await run()
    expect(setOutput).toHaveBeenCalledWith(
      'unreleased-commit-messages',
      '@octocat - Fix all the bugs\n'
    )
  })

  it('sets `unreleased-diff-url', async () => {
    const setOutput = jest.spyOn(core, 'setOutput')
    await run()
    expect(setOutput).toHaveBeenCalledWith(
      'unreleased-diff-url',
      'https://github.com/octocat/Hello-World/compare/master...topic'
    )
  })
})
