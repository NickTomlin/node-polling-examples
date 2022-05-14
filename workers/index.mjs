
/*
Threads may seem like the most natural fit when coming from a language like Java.

## Pros

- Simpler mental model (work per process)
- Clean separation of work and error handling (supervisor can terminate and start workers easily)

## Cons

- No advantage for I/O intensive work
  - The node docs sum this up best: "Workers (threads) are useful for performing CPU-intensive JavaScript operations. They do not help much with I/O-intensive work. The Node.js built-in asynchronous I/O operations are more efficient than Workers can be."
 */
import {fileURLToPath} from 'url'
import {Worker} from "worker_threads"
import {dirname} from 'path';

// https://stackoverflow.com/a/50052194/1048479
const __dirname = dirname(fileURLToPath(import.meta.url));
const workerPath = `${__dirname}/worker.mjs`

export default async function superviseTasks () {
  const workers = []
  const workerPromises = []
  for (let i = 0; i < 3; i++) {
    const worker = new Worker(workerPath, {
      workerData: {
        idx: i,
        throwCount: i % 2 === 0 ? 2 : null
      }
    });
    workers.push(worker)
    workerPromises.push(new Promise((resolve, reject) => {
      worker.on('message', (event) => {
        console.log('response from', i, event)
      });
      worker.on('error', reject);
      worker.on('exit', (code) => {
        if (code !== 0)
          reject(new Error(`Worker stopped with exit code ${code}`));
      });
    }))
  }

  try {
    await Promise.all(workerPromises)
  } catch(error) {
    console.error('Supervisor caught worker error', error)
    console.error('Supervisor terminating workers')
    await Promise.all(workers.map(worker => worker.terminate()))
  }
}

await superviseTasks()
