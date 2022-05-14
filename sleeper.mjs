/*
 * This provides a promise setTimeout based promise poller
 * for simple in process polling.
 *
 * pros:
 *   - simple
 *   - no need for worker threads
 * cons:
 *   - Error handling / shutdown is... not really handled
 *   - Classic evented concurrency issues
 */

import {exampleApiCall} from "./example-api.mjs"

async function pollster (id, throwCount = null) {
  console.log(id, 'starting to poll')
  let count = 0
  while (true) {
    if (throwCount && count >= throwCount) {
      throw new Error(`Purposefully throwing because ${count} >= ${throwCount}`)
    }
    await exampleApiCall()
    console.log(id, 'polled')
    count++
  }
}

async function sleeper () {
  console.log('starting to poll')
  const workers = Array.from({ length: 3 })
    .map((_, idx) => pollster(idx, idx % 2 === 0 ? 2: null))
  try {
    await Promise
      .all(workers)
  } catch (error) {
    console.log('fatal error', error)
    // other workers will happily continue to work...
  }
}

await sleeper()
