const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/Bismillah Enterprise/Desktop/carbeez';

// --- INDEX.HTML ---
let idxPath = path.join(dir, 'index.html');
let idx = fs.readFileSync(idxPath, 'utf8');

// Hero replacement
const oldHeroRegex = /<!-- Scroll-scrubbed hero[\s\S]*?<\/section>/;
const newHero = `<!-- Interactive 3D Hero -->
        <section class="interactive-hero">
            <div class="wrap-wide hero-split">
                <div class="hero-content">
                    <span class="eyebrow reveal">Premium vehicle marketplace</span>
                    <h1 class="display reveal" style="transition-delay: 0.1s">Beyond Luxury.<br>Beyond Performance.</h1>
                    <p class="lead reveal" style="transition-delay: 0.2s">A cross-brand collection of inspected vehicles, market-level pricing, and people who know cars.</p>
                    <div class="hero-actions reveal" style="transition-delay: 0.3s">
                        <a class="btn btn-primary" href="new-cars.html">Shop new cars <i class="fa-solid fa-arrow-right"></i></a>
                        <a class="btn btn-ghost" href="used-cars.html">Browse certified used</a>
                    </div>
                </div>
                <div class="hero-visual reveal" style="transition-delay: 0.4s">
                    <div class="car-3d-container" id="car3dContainer">
                        <img src="https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=1200&q=80" alt="Sports Car" class="car-3d-image" id="car3dImage" crossorigin="anonymous">
                        <div class="car-3d-shadow"></div>
                    </div>
                </div>
            </div>
        </section>`;
idx = idx.replace(oldHeroRegex, newHero);

// Scripts replacement
idx = idx.replace('<script src="js/frame-sequence.js" defer></script>\r\n', '');
idx = idx.replace('<script src="js/frame-sequence.js" defer></script>\n', '');
idx = idx.replace('<script src="js/scroll-scrub-hero.js" defer></script>', '<script src="js/interactive-hero.js" defer></script>');

// FEATURED_CARS replacement mapping
const brandMapping = {
    'nc-01': 'Aero',
    'nc-02': 'Volt',
    'nc-03': 'Horizon',
    'nc-04': 'Apex',
    'nc-05': 'Summit',
    'nc-06': 'Urban',
    'nc-07': 'Apex',
    'nc-08': 'Lumen',
    'nc-09': 'Titan',
    'nc-10': 'Vega',
    'nc-11': 'Aurora',
    'nc-12': 'Nordwind',
    'nc-13': 'Marlin',
    'nc-14': 'Onyx',
    'nc-15': 'Kestrel',
    'nc-16': 'Valencienne',
    'nc-17': 'Ardenne',
    'nc-18': 'Corvina',
    'nc-19': 'Solstice'
};

// Update FEATURED_CARS array definition with brands
let inCars = false;
let lines = idx.split('\n');
let currentId = null;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('var FEATURED_CARS = [')) inCars = true;
    if (inCars && lines[i].includes('];')) inCars = false;
    
    if (inCars) {
        const idMatch = lines[i].match(/id:\s*'([^']+)'/);
        if (idMatch) currentId = idMatch[1];
        
        // Add brand right after id if it doesn't already have it
        if (idMatch && brandMapping[currentId] && !lines[i].includes('brand:')) {
            lines[i] = lines[i].replace(/(id:\s*'[^']+',)/, `$1 brand: '${brandMapping[currentId]}',`);
        }
    }
}
idx = lines.join('\n');

// Replace the carCardTemplate to use the brand CTA
const oldTemplate = /function carCardTemplate\(car\) \{[\s\S]*?return \([\s\S]*?'<\/div><\/a>'\r?\n\s*\);\r?\n\s*\}/;
const newTemplate = `function carCardTemplate(car) {
        return (
            '<div class="card car-card reveal"' +
            ' aria-label="' + car.name + ' — ' + car.price + '">' +
            '<a href="new-cars.html#' + car.id + '" class="car-media" style="display:block;"><span class="chip chip-accent car-tag">' + car.badge + '</span>' +
            '<img src="' + car.image + '" alt="' + car.name + '" loading="lazy" width="600" height="375" decoding="async"></a>' +
            '<div class="car-body">' +
            '<a href="new-cars.html#' + car.id + '" class="car-title"><h3>' + car.name + '</h3><span class="car-price">' + car.price + '</span></a>' +
            '<div class="spec-row">' +
            '<div><span>Engine</span><strong>' + car.engine + '</strong></div>' +
            '<div><span>Output</span><strong>' + car.power + '</strong></div>' +
            '<div><span>Drive</span><strong>' + car.drive + '</strong></div>' +
            '</div>' +
            '<a class="car-cta" style="text-decoration:none;" href="new-cars.html?brand=' + encodeURIComponent(car.brand) + '">Check more ' + car.brand + ' models <i class="fa-solid fa-arrow-right"></i></a>' +
            '</div></div>'
        );
    }`;
idx = idx.replace(oldTemplate, newTemplate);

fs.writeFileSync(idxPath, idx);

// --- NEW-CARS.HTML ---
let ncPath = path.join(dir, 'new-cars.html');
let nc = fs.readFileSync(ncPath, 'utf8');

const oldMatches = /function matches\(v\) \{[\s\S]*?return [\s\S]*?matchPrice\(v\);\r?\n\s*\}/;
const newMatches = `var activeBrand = new URLSearchParams(window.location.search).get('brand');
        function matches(v) {
            var brandMatch = activeBrand ? v.brand.toLowerCase() === activeBrand.toLowerCase() : true;
            return brandMatch &&
                (state.body === 'All' || v.body === state.body) &&
                (state.fuel === 'All' || v.fuel === state.fuel) &&
                matchPrice(v);
        }`;
nc = nc.replace(oldMatches, newMatches);

const countUpdate = /document\.getElementById\('resultCount'\)\.textContent = list\.length;/;
const newCountUpdate = `document.getElementById('resultCount').textContent = list.length;
            var countEl = document.getElementById('resultCount');
            if (activeBrand) {
                countEl.nextSibling.textContent = " " + activeBrand + " vehicles match";
            } else {
                countEl.nextSibling.textContent = " vehicles match";
            }`;
nc = nc.replace(countUpdate, newCountUpdate);

fs.writeFileSync(ncPath, nc);

// --- USED-CARS.HTML ---
let ucPath = path.join(dir, 'used-cars.html');
let uc = fs.readFileSync(ucPath, 'utf8');

const oldUcApply = /var list = CARS\.filter\(function \(c\) \{\r?\n\s*return \(filters\.body === 'All' \|\| c\.body === filters\.body\) &&[\s\S]*?\(filters\.miles === 0 \|\| c\.miles <= filters\.miles\);\r?\n\s*\}\);/;
const newUcApply = `var activeBrand = new URLSearchParams(window.location.search).get('brand');
            var list = CARS.filter(function (c) {
                var brandMatch = activeBrand ? c.brand.toLowerCase() === activeBrand.toLowerCase() : true;
                return brandMatch &&
                    (filters.body === 'All' || c.body === filters.body) &&
                    (filters.fuel === 'All' || c.fuel === filters.fuel) &&
                    (filters.price === 0 || c.price <= filters.price) &&
                    (filters.miles === 0 || c.miles <= filters.miles);
            });`;
uc = uc.replace(oldUcApply, newUcApply);

const ucCountUpdate = /document\.getElementById\('count'\)\.textContent = list\.length;/;
const newUcCountUpdate = `document.getElementById('count').textContent = list.length;
            var countEl = document.getElementById('count');
            if (activeBrand) {
                countEl.nextSibling.textContent = " certified " + activeBrand + " vehicles found";
            } else {
                countEl.nextSibling.textContent = " certified vehicles found";
            }`;
uc = uc.replace(ucCountUpdate, newUcCountUpdate);

fs.writeFileSync(ucPath, uc);
console.log('Update script executed successfully.');
