import * as core from '@actions/core'
import * as github from '@actions/github'
import sgit from 'simple-git'
import fetch from 'node-fetch'
import fs from 'fs/promises'
import path from 'path'
import jsdom from 'jsdom'
// import imageType from 'image-type'

// if (process.env.NODE_ENV !== 'production') {
// 	const dotenv = await import('dotenv')
// 	dotenv.config()
// }

process.on('unhandledRejection', (error) => {
	throw error
})

const convertImageToBase64 = async (url: string): Promise<string> => {
	const resp = await fetch(url)
	const contentType = resp.headers.get('content-type')

	return `data:${contentType};base64,${(await resp.buffer()).toString('base64')}`
}

const fetchImagesFromSVG = async (svg: string): Promise<Record<string, string>> => {
	const dom = new jsdom.JSDOM(svg)

	dom.serialize()

	const images: Record<string, string> = {}

	dom.window.document.querySelectorAll('image').forEach((image) => {
		const src = image.getAttribute('xlink:href')
		src && (images[src] = src)
	})

	return images
}

const devcardURL = (hash: string): string => `https://api.daily.dev/devcards/${hash}.svg`

;(async function () {
	try {
		let devCardContent = ''

		const hash = core.getInput('hash')
		const token = core.getInput('token')
		const branch = core.getInput('commit_branch')
		const message = core.getInput('commit_message')
		const filename = core.getInput('commit_filename')

		// Fetch the latest devcard
		try {
			const res = await fetch(devcardURL(hash))
			devCardContent = await res.text()
			const images = await fetchImagesFromSVG(devCardContent)

			// devCardContent = devCardContent.replaceAll('<image', '<img')
			// devCardContent = devCardContent.replaceAll('xlink:href', 'src')
			// devCardContent = devCardContent.replaceAll('></image>', '/>')

			for (const image in images) {
				if (Object.prototype.hasOwnProperty.call(images, image)) {
					devCardContent = devCardContent.replace(image, await convertImageToBase64(images[image]))
				}
			}

			await fs.mkdir(path.dirname(path.join(`/tmp`, filename)), { recursive: true })
			await fs.writeFile(path.join(`/tmp`, filename), devCardContent)
			console.log(`Saved to ${path.join(`/tmp`, filename)}`, 'ok')
		} catch (error) {
			console.debug(error)
		}

		const committer = {
			commit: true,
			message: message.replace(/[$][{]filename[}]/g, filename),
			branch: branch || github.context.ref.replace(/^refs[/]heads[/]/, ''),
			sha: '',
		}

		const octokit = github.getOctokit(token)
		console.log('Committer REST API', 'ok')
		try {
			console.log('Committer account', (await octokit.rest.users.getAuthenticated()).data.login)
		} catch {
			console.log('Committer account', '(github-actions)')
		}

		//Create head branch if needed
		try {
			await octokit.rest.git.getRef({ ...github.context.repo, ref: `heads/${committer.branch}` })
			console.log('Committer head branch status', 'ok')
		} catch (error) {
			if (/not found/i.test(`${error}`)) {
				const {
					data: {
						object: { sha },
					},
				} = await octokit.rest.git.getRef({
					...github.context.repo,
					ref: github.context.ref.replace(/^refs[/]/, ''),
				})

				console.log('Committer branch current sha', sha)
				await octokit.rest.git.createRef({ ...github.context.repo, ref: `refs/heads/${committer.branch}`, sha })
				console.log('Committer head branch status', '(created)')
			} else throw error
		}

		// Retrieve previous SHA of devcard file to be able to update content through the API
		try {
			const {
				repository: {
					object: { oid },
				},
			} = await octokit.graphql(
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

		if (committer.commit) {
			await octokit.rest.repos.createOrUpdateFileContents({
				...github.context.repo,
				path: filename,
				message: committer.message,
				content: Buffer.from(devCardContent).toString('base64'),
				branch: committer.branch,
				...(committer.sha ? { sha: committer.sha } : {}),
			})
		}
	} catch (error) {
		core.setFailed(error.message)
		console.debug(error)
		process.exit(1)
	}
})()
