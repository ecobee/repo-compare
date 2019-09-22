import * as core from '@actions/core'

const run = async (): Promise<void> => {
    const includePrerelease = core.getInput('include-prerelease')
    const message = `👋 Hello! I will include pre-releases ${includePrerelease}! 🙌`
    core.debug(message)
    core.setOutput('latest-release', message)
  }

run()

export default run