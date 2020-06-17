/*
 * The Computer Language Benchmarks Game
 * https://salsa.debian.org/benchmarksgame-team/benchmarksgame/
 *
 * contributed by Andrey Filatkin
 * based on Go source code by Oleg Mazurov
 *
 */

const fact = [];

function fillFact(n) {
    fact[0] = 1;
    for (let i = 1; i <= n; i++) {
        fact[i] = fact[i - 1] * i;
    }
}

function div(val, by) {
    return (val - val % by) / by;
}

const n = +Deno.args[0];

fillFact(n);

const nchunks = 720;
let chunkSize = div((fact[n] + nchunks - 1), nchunks);
chunkSize += chunkSize % 2;

const tasks = [];
const len = div((fact[n] + chunkSize - 1), chunkSize);
for (let i = 0; i < len; i++) {
    const idxMin = chunkSize * i;
    const idxMax = Math.min(fact[n], idxMin + chunkSize);
    tasks.push({idxMin, idxMax});
}

let flips = 0;
let chk = 0;

await threadReduce(tasks, n, ({maxFlips, checkSum}) => {
    if (flips < maxFlips) {
        flips = maxFlips;
    }
    chk += checkSum;
});
console.log(`${chk}\nPfannkuchen(${n}) = ${flips}`);

function threadReduce(tasks, workerData, reducer) {
    return new Promise(resolve => {
        const size = 4;
        const workers = new Set();
        let ind = 0;

        for (let i = 0; i < size; i++) {
            const worker = new Worker(new URL('fannkuchredux_worker.js', import.meta.url).href, {type: 'module'});

            worker.postMessage({name: 'workerData', workerData});
            worker.onmessage = ({data}) => {
                const name = data.name;

                if (name === 'result') {
                    reducer(data.data);
                }
                if (name === 'ready' || name === 'result') {
                    if (ind < tasks.length) {
                        const data = tasks[ind];
                        ind++;
                        worker.postMessage({name: 'work', data});
                    } else {
                        worker.postMessage({name: 'exit'});
                    }
                } else if (name === 'exit') {
                    workers.delete(worker);
                    if (workers.size === 0) {
                        resolve();
                    }
                }
            };

            workers.add(worker);
        }
    });
}
