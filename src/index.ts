import * as core from '@actions/core'
import * as github from '@actions/github'
import type { GraphQlQueryResponseData } from '@octokit/graphql'
import fetch from 'node-fetch'

import { finished } from 'stream/promises'

import sgit from 'simple-git'
import fs from 'fs/promises'
import path from 'path'
import { validate } from 'uuid'

process.on('unhandledRejection', (error) => {
	throw error
})

const devcardURL = (devcard_id: string): string =>
	`https://api.daily.dev/devcards/v2/${devcard_id}.png?r=${new Date().valueOf()}&ref=action`

const validateDevcardIdAsUUID = (devcard_id: string): boolean => {
	// An UUIDv4 regex without hyphens
	const uuid4Regex = /^([0-9A-F]{8})([0-9A-F]{4})(4[0-9A-F]{3})([89AB][0-9A-F]{3})([0-9A-F]{12})$/i
	return validate(devcard_id.replace(uuid4Regex, '$1-$2-$3-$4-$5'))
}

;(async function () {
	try {
		const devcard_id = core.getInput('devcard_id')
		const token = core.getInput('token')
		const branch = core.getInput('commit_branch')
		const message = core.getInput('commit_message')
		const filename = core.getInput('commit_filename')
		const email = core.getInput('committer_email')
		const name = core.getInput('committer_name')
		const dryrun = core.getBooleanInput('dryrun')

		// throw an error if filename is empty
		if (!filename || filename.length === 0) {
			throw new Error('Filename is required')
		}

		if (!validateDevcardIdAsUUID(devcard_id)) {
			throw new Error(`Invalid devcard_id: ${devcard_id}`)
		}

		console.log(`Dryrun`, dryrun)

		// Fetch the latest devcard
		try {
			const { body } = await fetch(devcardURL(devcard_id))
			if (body === null) {
				const message = `Empty response from devcard URL: ${devcardURL(devcard_id)}`
				core.setFailed(message)
				console.debug(message)
				process.exit(1)
			}

			await fs.mkdir(path.dirname(path.join(`/tmp`, filename)), {
				recursive: true,
			})
			const file = await fs.open(path.join(`/tmp`, filename), 'w')
			const stream = file.createWriteStream()
			await finished(body.pipe(stream))
			await file.close()
			console.log(`Saved to ${path.join(`/tmp`, filename)}`, 'ok')
		} catch (error) {
			console.debug(error)
		}

		const committer = {
			commit: true,
			message: message.replace(/[$][{]filename[}]/g, filename),
			branch: branch || github.context.ref.replace(/^refs[/]heads[/]/, ''),
			sha: undefined,
			email: email,
			name: name,
		}

		const octokit = github.getOctokit(token)
		console.log('Committer REST API', 'ok')
		try {
			console.log('Committer account', (await octokit.rest.users.getAuthenticated()).data.login)
		} catch {
			console.log('Committer account', '(github-actions)')
		}

		console.log('Using branch', committer.branch)

		//Create head branch if needed
		try {
			await octokit.rest.git.getRef({
				...github.context.repo,
				ref: `heads/${committer.branch}`,
			})
			console.log('Committer head branch status', 'ok')
		} catch (error) {
			if (/not found/i.test(`${error}`)) {
				const {
					data: { object },
				} = await octokit.rest.git.getRef({
					...github.context.repo,
					ref: github.context.ref.replace(/^refs[/]/, ''),
				})

				console.log('Committer branch current sha', object.sha)
				await octokit.rest.git.createRef({
					...github.context.repo,
					ref: `refs/heads/${committer.branch}`,
					sha: object.sha,
				})
				console.log('Committer head branch status', '(created)')
			} else throw error
		}

		// Retrieve previous SHA of devcard file to be able to update content through the API
		try {
			const {
				repository: {
					object: { oid },
				},
			} = await octokit.graphql<GraphQlQueryResponseData>(
				`
				query Sha {
					repository(owner: "${github.context.repo.owner}", name: "${github.context.repo.repo}") {
						object(expression: "${committer.branch}:${filename}") { ... on Blob { oid } }
					}
				}
			`,
				{ headers: { authorization: `token ${token}` } },
			)
			committer.sha = oid
		} catch (error) {
			console.debug(error)
		}
		console.log('Previous render sha', committer.sha ?? '(none)')

		// Compare previous to current devcard
		const git = sgit()
		const sha = await git.hashObject(path.join(`/tmp`, filename))
		console.log('Current devcard sha', sha)
		if (committer.sha === sha) {
			console.log(`Commit to branch ${committer.branch}`, '(no changes)')
			committer.commit = false
		}

		if (committer.commit && !dryrun) {
			const fileContent = await fs.readFile(path.join(`/tmp`, filename))
			await octokit.rest.repos.createOrUpdateFileContents({
				...github.context.repo,
				path: filename,
				message: committer.message,
				content: fileContent.toString('base64'),
				branch: committer.branch,
				committer: { name: committer.name, email: committer.email },
				...(committer.sha ? { sha: committer.sha } : {}),
			})
		}
	} catch (error) {
		if (error instanceof Error) {
			core.setFailed(error.message)
			console.debug(error)
			process.exit(1)
		}
	}
})()
