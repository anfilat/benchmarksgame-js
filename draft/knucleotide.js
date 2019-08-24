/* The Computer Language Benchmarks Game
   https://salsa.debian.org/benchmarksgame-team/benchmarksgame/

   Contributed by Jesse Millikan
   Modified by Matt Baker
   Ported, modified, and parallelized by Roman Pletnev
*/

'use strict';

const rd = require('readline');
const cluster = require('cluster');

function RefNum(num) {
    this.num = num;
}

RefNum.prototype.toString = function() {
    return this.num.toString();
};

cluster.isMaster ? master() : worker();

function master() {
    const maxBuf = 2048;
    const workers = [];
    let reading = false;
    let seq = '';

    for (let i = 0; i < 4; ++i ) {
        workers.push(cluster.fork({workerId: i}));
    }

    rd.createInterface(process.stdin, process.stdout)
        .on('line', lineHandler)
        .on('close', () => flush(true));

    function lineHandler(line) {
        if (reading) {
            if (line[0] !== '>' && (seq += line.toUpperCase()).length >= maxBuf) {
                flush();
            }
        } else {
            reading = line.substr(0, 6) === '>THREE';
        }
    }

    function flush(close) {
        for (let worker of workers) {
            worker.send(seq);
        }
        if (close) {
            for (let worker of workers) {
                worker.send('eof');
            }
        }
        seq = '';
    }

    const results = [];
    let jobs = workers.length;

    function messageHandler(i) {
        return function(message) {
            results[i] = message;
            if (!(--jobs)) {
                process.stdout.write(results.join(''));
                process.exit(0);
            }
        };
    }

    for (let i = 0; i < workers.length; i++) {
        workers[i].on('message', messageHandler(i));
    }
}

function worker() {
    let seq = '';

    process.on('message', message => {
        if (message === 'eof') {
            let res = '';
            switch (process.env.workerId) {
                case '0':
                    res += sort(seq, 1);
                    res += sort(seq, 2);
                    res += find(seq, 'GGT');
                    break;
                case '1':
                    res += find(seq, 'GGTA');
                    res += find(seq, 'GGTATT');
                    break;
                case '2':
                    res += find(seq, 'GGTATTTTAATT');
                    break;
                case '3':
                    res += find(seq, 'GGTATTTTAATTTATAGT');
                    break;
            }
            process.send(res);
            process.exit();
        } else {
            seq += message;
        }
    });
}

function sort(seq, length) {
    const f = frequency(seq, length);
    const keys = Array.from(f.keys());
    const n = seq.length - length + 1;
    let res = '';

    keys.sort((a, b) => f.get(b) - f.get(a));
    for (let key of keys) {
        res += `${key} ${(f.get(key) * 100 / n).toFixed(3)}\n`;
    }
    res += '\n';
    return res;
}

function find(seq, s) {
    const f = frequency(seq, s.length);
    return `${f.get(s) || 0}\t${s}\n`;
}

function frequency(seq, length) {
    const freq = new Map();
    const n = seq.length - length + 1;
    for(let i = 0; i < n ; i++) {
        const key = seq.substr(i, length);
        const cur = freq.get(key);
        if (cur === undefined) {
            freq.set(key, new RefNum(1))
        } else {
            ++cur.num;
        }
    }
    return freq;
}
