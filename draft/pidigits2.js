const ffi = require('ffi-napi');
const ref = require('ref-napi');
const Struct = require('ref-struct-di')(ref);

const MpzStruct = Struct({
    _mp_alloc: ref.types.int,
    _mp_size: ref.types.int,
    _mp_d: 'int *',
});

const MpzStructPtr = ref.refType(MpzStruct);

const gmp = ffi.Library('libgmp', {
    '__gmpz_init': ['void', [MpzStructPtr]],
    '__gmpz_init_set_ui': ['void', [MpzStructPtr, 'ulong']],
    '__gmpz_addmul_ui': ['void', [MpzStructPtr, MpzStructPtr, 'ulong']],
    '__gmpz_mul_ui': ['void', [MpzStructPtr, MpzStructPtr, 'ulong']],
    '__gmpz_cmp': ['void', [MpzStructPtr, MpzStructPtr]],
    '__gmpz_add': ['void', [MpzStructPtr, MpzStructPtr, MpzStructPtr]],
    '__gmpz_tdiv_q': ['void', [MpzStructPtr, MpzStructPtr, MpzStructPtr]],
    '__gmpz_get_ui': ['ulong', [MpzStructPtr]],
    '__gmpz_submul_ui': ['void', [MpzStructPtr, MpzStructPtr, 'ulong']],
});

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

const tmp1 = ref.alloc(MpzStruct);
const tmp2 = ref.alloc(MpzStruct);
const acc = ref.alloc(MpzStruct);
const den = ref.alloc(MpzStruct);
const num = ref.alloc(MpzStruct);

gmp.__gmpz_init(tmp1);
gmp.__gmpz_init(tmp2);
gmp.__gmpz_init_set_ui(acc, 0);
gmp.__gmpz_init_set_ui(den, 1);
gmp.__gmpz_init_set_ui(num, 1);

let i = 0;
let k = 0;

while (i < n) {
    k++;

    const k2 = (k << 1) + 1;

    gmp.__gmpz_addmul_ui(acc, num, 2);
    gmp.__gmpz_mul_ui(acc, acc, k2);
    gmp.__gmpz_mul_ui(den, den, k2);
    gmp.__gmpz_mul_ui(num, num, k);

    if (gmp.__gmpz_cmp(num, acc) > 0) {
        continue;
    }

    gmp.__gmpz_mul_ui(tmp1, num, 3);
    gmp.__gmpz_add(tmp1, tmp1, acc);
    gmp.__gmpz_tdiv_q(tmp2, tmp1, den);
    const d3 = gmp.__gmpz_get_ui(tmp2);

    gmp.__gmpz_add(tmp1, tmp1, num);
    gmp.__gmpz_tdiv_q(tmp2, tmp1, den);
    const d4 = gmp.__gmpz_get_ui(tmp2);

    if (d3 !== d4) {
        continue;
    }

    buf.writeInt8(Number(d3) + chr_0, bufoffs++);

    i++;
    if (i % 10 === 0) {
        buf.writeInt8(chr_t, bufoffs++);
        buf.writeInt8(chr_c, bufoffs++);

        let str = i.toString();
        buf.write(str, bufoffs, bufoffs += str.length);

        buf.writeInt8(chr_n, bufoffs++);
    }

    gmp.__gmpz_submul_ui(acc, den, d3);
    gmp.__gmpz_mul_ui(acc, acc, 10);
    gmp.__gmpz_mul_ui(num, num, 10);
}

process.stdout.write(buf);
