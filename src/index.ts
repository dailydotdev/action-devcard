import * as core from '@actions/core'
import * as github from '@actions/github'
import type { GraphQlQueryResponseData } from '@octokit/graphql'
import fetch from 'node-fetch'

import { finished } from 'stream/promises'

import sgit from 'simple-git'
import fs from 'fs/promises'
import path from 'path'

process.on('unhandledRejection', (error) => {
	throw error
})

type DevCardType = 'default' | 'wide'

const devcardURL = (user_id: string, type: DevCardType = 'default'): string =>
	`https://api.daily.dev/devcards/v2/${user_id}.png?type=${type}&r=${new Date().valueOf()}&ref=action`

;(async function () {
	try {
		const user_id = core.getInput('user_id')
		const type = core.getInput('type') as DevCardType
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

		// throw an error if type is invalid, must be either "default" or "wide"
		if (type && !['default', 'wide'].includes(type)) {
			throw new Error('Invalid type. Must be either "default" or "wide"')
		}

		console.log(`Dryrun`, dryrun)

		// Fetch the latest devcard
		try {
			const { body } = await fetch(devcardURL(user_id, type))
			if (body === null) {
				const message = `Empty response from devcard URL: ${devcardURL(user_id, type)}`
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
