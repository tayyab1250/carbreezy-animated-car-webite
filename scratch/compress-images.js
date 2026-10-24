const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const jobs = [
  { src: 'assets/hero-img3d.jpg',              out: 'assets/hero-img3d.webp',              w: 1600, q: 80 },
  { src: 'assets/doom-img-1600.jpg',           out: 'assets/doom-img-1600.webp',           w: 1600, q: 82 },
  { src: 'assets/ferrari.png',                 out: 'assets/ferrari.webp',                 w: 500,  q: 85 },
  { src: 'assets/apex velocity turbo.jpg',     out: 'assets/apex velocity turbo.webp',     w: 900,  q: 82 },
  { src: 'assets/urban sprint gts.jpg',        out: 'assets/urban sprint gts.webp',        w: 900,  q: 82 },
  { src: 'assets/volt edrive-gt.jpg',          out: 'assets/volt edrive-gt.webp',          w: 900,  q: 82 },
  { src: 'assets/sumit track x7.jpg',          out: 'assets/sumit track x7.webp',          w: 900,  q: 82 },
  { src: 'assets/vega performance hybrid.jpg', out: 'assets/vega performance hybrid.webp', w: 900,  q: 82 },
];

Promise.all(jobs.map(j =>
  sharp(j.src)
    .resize({ width: j.w, withoutEnlargement: true })
    .webp({ quality: j.q })
    .toFile(j.out)
    .then(() => {
      const kb    = (fs.statSync(j.out).size / 1024).toFixed(1);
      const origKb = (fs.statSync(j.src).size / 1024).toFixed(1);
      console.log(path.basename(j.out) + ': ' + origKb + ' KB -> ' + kb + ' KB');
    })
)).catch(console.error);
