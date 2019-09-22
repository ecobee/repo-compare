import * as core from '@actions/core'

const run = async (): Promise<void> => {
    core.debug('👋 Hello!')
  }

run()

export default run