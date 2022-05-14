import {exampleApiCall} from "./example-api.mjs"

async function * poller (id) {
  console.log(id, 'starting to poll')
  let count = 0
  while (true) {
    await exampleApiCall()
    yield count++
  }
}

async function generator () {
  console.log(this.name, 'starting to poll')
  const workers = Array.from({ length: 3 }).map((_, idx) => poller(idx))
  // an array of generators
  // for ()
}

await generator()
