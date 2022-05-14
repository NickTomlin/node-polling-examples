/*
 * This provides a promise setTimeout based promise poller
 * for simple in process polling.
 *
 * pros:
 *   - simple
 *   - no need for worker threads
 * cons:
 *   - BYO Error handling / management
 *   - Classic evented concurrency issues
 */

import {exampleApiCall} from "./example-api.mjs"

async function loop (id, signal, throwCount = null) {
  console.log(id, 'starting to poll')
  let count = 0
  while (!signal.aborted) {
    if (throwCount && count >= throwCount) {
      throw new Error(`Purposefully throwing because ${count} >= ${throwCount}`)
    }
    await exampleApiCall()
    console.log(id, 'polled', count, 'times')
    count++
  }
}

async function supervisor () {
  const controller = new AbortController();
  console.log('starting to poll')
  const workers = Array.from({ length: 3 })
    .map((_, idx) => loop(idx, controller.signal, idx % 2 === 0 ? 4: null))
  try {
    await Promise.all(workers)
  } catch (error) {
    console.error('Error encountered, aborting', error)
    // ensure all other work stops
    controller.abort()
  }
}

await supervisor()
