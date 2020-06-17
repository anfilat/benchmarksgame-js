// The Computer Language Benchmarks Game
// https://salsa.debian.org/benchmarksgame-team/benchmarksgame/
//
// regex-dna program contributed by Jesse Millikan
// Base on the Ruby version by jose fco. gonzalez
// fixed by Matthew Wilson
// ported to Node.js and sped up by Roman Pletnev
// converted from regex-dna program
// fixed by Josh Goldfoot
// multi thread by Andrey Filatkin

const regExps = [
    /agggtaaa|tttaccct/ig,
    /[cgt]gggtaaa|tttaccc[acg]/ig,
    /a[act]ggtaaa|tttacc[agt]t/ig,
    /ag[act]gtaaa|tttac[agt]ct/ig,
    /agg[act]taaa|ttta[agt]cct/ig,
    /aggg[acg]aaa|ttt[cgt]ccct/ig,
    /agggt[cgt]aa|tt[acg]accct/ig,
    /agggta[cgt]a|t[acg]taccct/ig,
    /agggtaa[cgt]|[acg]ttaccct/ig
];

let data = new TextDecoder().decode(Deno.readAllSync(Deno.stdin));
const initialLen = data.length;

data = data.replace(/^>.*\n|\n/mg, '');
const cleanedLen = data.length;

const worker = replaceWork(data);

for (let j = 0; j < regExps.length; j++) {
    const re = regExps[j];
    const m = data.match(re);
    console.log(re.source, m ? m.length : 0);
}

const endLen = await worker;

console.log(`\n${initialLen}\n${cleanedLen}\n${endLen}`);

function replaceWork(data) {
    return new Promise(resolve => {
        const worker = new Worker(new URL('regexredux_worker.js', import.meta.url).href, {type: 'module'});

        worker.postMessage({data});
        worker.onmessage = ({data}) => {
            resolve(data.len);
        };
    });
}
