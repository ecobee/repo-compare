import * as core from '@actions/core'
import * as github from '@actions/github'

const run = async (): Promise<void> => {
    try {
        const includePrerelease = core.getInput("include-prerelease");
        const message = `👋 Hello! I will include pre-releases ${includePrerelease}! 🙌`;
        core.debug(message);
        core.setOutput("latest-release", message);
        
        console.log({payload: github.context.payload})
    } catch (error) {
        core.setFailed(`Debug-action failure: ${error}`);
    }
};

run();

export default run;
