import {itemCheck, bottomUpTree} from './binarytrees_code.js';

self.onmessage = ({data}) => {
    const {iterations, depth} = data.task;

    self.postMessage({
        result: work(iterations, depth)
    });
    self.close();
}

function work(iterations, depth) {
    let check = 0;
    for (let i = 0; i < iterations; i++) {
        check += itemCheck(bottomUpTree(depth));
    }
    return `${iterations}\t trees of depth ${depth}\t check: ${check}`;
}
