/* The Computer Language Benchmarks Game
   https://salsa.debian.org/benchmarksgame-team/benchmarksgame/

   contributed by Léo Sarrazin
   multi thread by Andrey Filatkin
*/
import {itemCheck, bottomUpTree} from './binarytrees_code.js';

const maxDepth = Math.max(6, parseInt(Deno.args[0]));

const stretchDepth = maxDepth + 1;
const check = itemCheck(bottomUpTree(stretchDepth));
console.log(`stretch tree of depth ${stretchDepth}\t check: ${check}`);

const longLivedTree = bottomUpTree(maxDepth);

const tasks = [];
for (let depth = 4; depth <= maxDepth; depth += 2) {
    const iterations = 1 << maxDepth - depth + 4;
    tasks.push({iterations, depth});
}

const results = await runTasks(tasks);
for (const result of results) {
    console.log(result);
}

console.log(`long lived tree of depth ${maxDepth}\t check: ${itemCheck(longLivedTree)}`);

function runTasks(tasks) {
    return new Promise(resolve => {
        const results = [];
        let tasksSize = tasks.length;

        for (let i = 0; i < tasks.length; i++) {
            const worker = new Worker(new URL('binarytrees_worker.js', import.meta.url).href, {type: 'module'});

            worker.postMessage({task: tasks[i]});
            worker.onmessage = ({data}) => {
                results[i] = data.result;
                tasksSize--;
                if (tasksSize === 0) {
                    resolve(results);
                }
            };
        }
    });
}
