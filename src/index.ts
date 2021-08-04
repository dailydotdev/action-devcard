import * as core from '@actions/core'
import * as github from '@actions/github'

const devcardURL = (hash: string): string => `https://api.daily.dev/devcards/${hash}.svg`

const run = async () => {
	try {
		const hash = core.getInput('hash')
		core.debug(`Fetching devcard for hash: ${hash}`)
		console.log(devcardURL(hash))

		// Get github context data
		const { repo } = github.context
		console.log(`We can even get context data, like the repo: ${repo.repo}`)
	} catch (error) {
		core.setFailed(error.message)
	}
}

run()
