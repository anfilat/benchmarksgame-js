const fact = [];

function fillFact(n) {
    fact[0] = 1;
    for (let i = 1; i <= n; i++) {
        fact[i] = fact[i - 1] * i;
    }
}

function fannkuch(n) {
    return function ({idxMin, idxMax}) {
        const p = [];
        const pp = [];
        const count = Array(n);

        // first permutation
        for (let i = 0; i < n; i++) {
            p[i] = i;
        }
        let idx = idxMin;
        for (let i = n - 1; i > 0; i--) {
            const d = div(idx, fact[i]);
            count[i] = d;
            idx = idx % fact[i];

            for (let j = 0; j < n; j++) {
                pp[j] = p[j];
            }

            for (let j = 0; j <= i; j++) {
                if (j + d <= i) {
                    p[j] = pp[j + d];
                } else {
                    p[j] = pp[j + d - i - 1];
                }
            }
        }

        let maxFlips = 1;
        let checkSum = 0;

        idx = idxMin;
        for (let sign = true; ; sign = !sign) {
            let first = p[0];
            if (first !== 0) {
                let flips = 1;
                if (p[first] !== 0) {
                    for (let j = 1; j < n; j++) {
                        pp[j] = p[j];
                    }
                    let p0 = first;
                    while (true) {
                        flips++;
                        let i = 1;
                        let j = p0 - 1;
                        while (i < j) {
                            const t = pp[i];
                            pp[i] = pp[j];
                            pp[j] = t;
                            i++;
                            j--;
                        }
                        const t = pp[p0];
                        pp[p0] = p0;
                        p0 = t;
                        if (pp[p0] === 0) {
                            break;
                        }
                    }
                }
                if (maxFlips < flips) {
                    maxFlips = flips;
                }
                if (sign) {
                    checkSum += flips;
                } else {
                    checkSum -= flips;
                }
            }

            idx++;
            if (idx === idxMax) {
                break;
            }

            // next permutation
            if (sign) {
                p[0] = p[1];
                p[1] = first;
            } else {
                const t = p[1];
                p[1] = p[2];
                p[2] = t;
                for (let k = 2; ; k++) {
                    count[k]++;
                    if (count[k] <= k) {
                        break;
                    }
                    count[k] = 0;
                    for (let j = 0; j <= k; j++) {
                        p[j] = p[j + 1];
                    }
                    p[k + 1] = first;
                    first = p[0];
                }
            }
        }

        return {maxFlips, checkSum};
    }
}

function div(val, by) {
    return (val - val % by) / by;
}


let onWork;

self.onmessage = ({data}) => {
    const name = data.name;

    if (name === 'workerData') {
        const n = data.workerData;
        fillFact(n);
        onWork = fannkuch(n)
        self.postMessage({name: 'ready'});
    } else if (name === 'work') {
        self.postMessage({
            name: 'result',
            data: onWork(data.data),
        });
    } else if (name === 'exit') {
        self.postMessage({name: 'exit'});
        self.close();
    }
};
