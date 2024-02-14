import * as fs from 'fs/promises'
import path from 'path'
import fetch from 'node-fetch'

import { finished } from 'stream/promises'

const devCardURL = `https://api.daily.dev/devcards/v2/l9AwmgMssuqCHDpEZpLjQ.png`
const filename = 'devcard.png'

const doStuff = async () => {
	const res = await fetch(devCardURL)

	const { body } = res

	if (body === null) {
		const message = `Empty response from devcard URL: ${devCardURL}`
		console.debug(message)
		process.exit(1)
	}

	await fs.mkdir(path.dirname(path.join(`/tmp`, filename)), {
		recursive: true,
	})
	const file = await fs.open(path.join(`/tmp`, filename), 'w')
	// await fs.writeFile(path.join(`/tmp`, filename), buffer);

	const stream = file.createWriteStream()

	await finished(body.pipe(stream))
	await file.close()

	console.log(`Saved to ${path.join(`/tmp`, filename)}`, 'ok')
}

doStuff()
