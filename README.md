Prepare
```
node fasta 5000000 > input5000000.txt
node fasta 25000000 > input25000000.txt
node fasta 100000000 > input100000000.txt
```
Bench
```
node binarytrees.js 21
node fannkuchredux.js 12
node fasta.js 25000000
node knucleotide.js < input25000000.txt > out.txt
node mandelbrot.js 16000
node nbody.js 50000000
node pidigits.js 10000
node regexredux.js < input5000000.txt
node revcomp.js < input100000000.txt > out.txt
node spectralnorm.js 5500
```
