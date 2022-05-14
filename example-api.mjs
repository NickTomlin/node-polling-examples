import {setTimeout} from "timers/promises"

export async function exampleApiCall (interval = 500) {
  await setTimeout(interval)
  return {
    body:  {
      hi: "from api"
    },
    statusCode: 200
  }
}
