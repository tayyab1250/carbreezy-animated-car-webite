const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const root = process.argv[2] || '.';
const page = process.argv[3] || 'index.html';
const hash = process.argv[4] || '';

const errors = [];
const vc = new VirtualConsole();
vc.on('jsdomError', (e) => errors.push('jsdomError: ' + (e.detail ? e.detail.stack || e.detail.message : e.message)));
vc.on('error', (...a) => errors.push('console.error: ' + a.join(' ')));

const dom = new JSDOM(fs.readFileSync(path.join(root, page), 'utf8'), {
  url: 'https://carbreezy.test/' + page + hash,
  runScripts: 'dangerously',
  pretendToBeVisual: true,
  virtualConsole: vc
});

const win = dom.window;

['js/site.js', 'js/carousel.js'].forEach((file) => {
  const full = path.join(root, file);
  if (fs.existsSync(full)) {
    try { win.eval(fs.readFileSync(full, 'utf8')); }
    catch (e) { errors.push('eval ' + file + ': ' + e.stack); }
  }
});

win.document.querySelectorAll('script:not([src])').forEach((s) => {
  try { win.eval(s.textContent); }
  catch (e) { errors.push('inline script: ' + e.stack); }
});

try {
  win.document.dispatchEvent(new win.Event('DOMContentLoaded', { bubbles: true }));
  win.dispatchEvent(new win.Event('DOMContentLoaded', { bubbles: true }));
} catch (e) { errors.push('DOMContentLoaded: ' + e.stack); }

setTimeout(() => {
  const doc = win.document;

  console.log('--- errors ---');
  console.log(errors.length ? errors.join('\n') : 'none');

  console.log('--- featured cards ---');
  const cards = doc.querySelectorAll('#featuredGrid > a');
  console.log('clickable cards:', cards.length);
  if (cards.length) {
    console.log('first href:', cards[0].getAttribute('href'));
    console.log('first aria-label:', cards[0].getAttribute('aria-label'));
    const inner = cards[0].querySelectorAll('a, button').length;
    console.log('nested interactive elements inside card:', inner, inner === 0 ? '(good)' : '(invalid)');
    console.log('unique hrefs:', new Set([...cards].map(c => c.getAttribute('href'))).size);
  }

  console.log('--- deep link ---');
  const backdrop = doc.getElementById('drawerBackdrop');
  if (backdrop) {
    console.log('detail opened from hash:', backdrop.classList.contains('open') ? 'yes' : 'no');
    const title = doc.getElementById('drawerTitle');
    console.log('detail title:', title ? title.textContent : 'n/a');
  }

  process.exit(0);
}, 400);
