import * as core from '@actions/core'

const run = async (): Promise<void> => {
    const channel = core.getInput('slack-channel')
    core.debug(`👋 Hello! I will notify ${channel}! 🙌`)
  }

run()

export default run