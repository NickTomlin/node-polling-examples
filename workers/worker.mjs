import {parentPort, workerData} from "worker_threads"
import {exampleApiCall} from "../example-api.mjs"

async function doWork () {
  let count = 0
  while (true) {
    console.log(workerData)
    if (workerData.throwCount && count >= workerData.throwCount) {
      throw new Error(`Worker purposefully raising error: ${workerData}`)
    }
    const response = await exampleApiCall()
    const result = {...response}
    parentPort.postMessage(result);
    count++
  }
}

await doWork()
