/* The Computer Language Benchmarks Game
 * https://salsa.debian.org/benchmarksgame-team/benchmarksgame/
 *
 * contributed by Denis Gribov
 *    a translation of the C program contributed by Mr Ledhug
 */

const n = +process.argv[2];

const chr_0 = "0".charCodeAt(0);
const chr_t = "\t".charCodeAt(0);
const chr_n = "\n".charCodeAt(0);
const chr_c = ":".charCodeAt(0);

let bufsize = (10 + 2 + n.toString().length + 1) * (n / 10);
for (let i = 10, ii = 10 ** (Math.log10(n) >>> 0); i < ii; i *= 10) {
    bufsize -= i - 1;
}

const buf = Buffer.allocUnsafe(bufsize);
let bufoffs = 0;

let i = 0;
let k = 0;
let acc = 0n;
let den = 1n;
let num = 1n;

while (i < n) {
    k++;

    let k2 = BigInt((k << 1) + 1);
    acc += num << 1n;
    acc = k2 * acc;
    den = k2 * den;
    num = BigInt(k) * num;

    if (num > acc) {
        continue;
    }

    let tmp = 3n * num + acc;
    const d3 = tmp / den;

    tmp = tmp + num;
    const d4 = tmp / den;

    if (d3 !== d4) {
        continue;
    }

    buf.writeInt8(Number(d3) + chr_0, bufoffs++);

    if (++i % 10 === 0) {
        buf.writeInt8(chr_t, bufoffs++);
        buf.writeInt8(chr_c, bufoffs++);

        let str = i.toString();
        buf.write(str, bufoffs, bufoffs += str.length);

        buf.writeInt8(chr_n, bufoffs++);
    }

    acc -= d3 * den;
    acc = 10n * acc;
    num = 10n * num;
}

process.stdout.write(buf);
