const fs = require('fs');
const path = require('path');
const https = require('https');

const dir = 'c:/Users/Bismillah Enterprise/Desktop/carbeez';

// A helper to make HTTP GET requests
function fetchJson(url) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); } catch (e) { resolve({ results: [] }); }
            });
        }).on('error', reject);
    });
}

const usedIds = new Set();

async function getUniqueImageFor(query) {
    const url = `https://unsplash.com/napi/search/photos?query=${encodeURIComponent(query)}&per_page=15&orientation=landscape`;
    const data = await fetchJson(url);
    if (data && data.results) {
        for (let photo of data.results) {
            if (!usedIds.has(photo.id)) {
                usedIds.add(photo.id);
                return `https://images.unsplash.com/photo-${photo.id}?auto=format&fit=crop&w=1000&q=80`;
            }
        }
    }
    // Fallback if we run out of unique ones or API fails
    return `https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1000&q=80`;
}

async function processFile(filename, arrayRegex) {
    const filePath = path.join(dir, filename);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Find the array definition (e.g. var VEHICLES = [...])
    const match = content.match(arrayRegex);
    if (!match) return;
    
    let arrayStr = match[1];
    
    // We will parse the array using eval to get the objects, 
    // but to replace exactly in the file string, we use regex replacement on the properties.
    // Let's extract each object block manually.
    
    // A regex to find each object block and its properties
    const objectRegex = /\{[^}]*id:\s*'([^']+)'[^}]*name:\s*'([^']+)'[^}]*body:\s*'([^']+)'[^}]*fuel:\s*'([^']+)'[^}]*image:\s*'([^']+)'[^}]*\}/g;
    
    let modifiedContent = content;
    
    let objMatch;
    // We'll reset regex index
    const regex2 = /id:\s*'([^']+)'[\s\S]*?name:\s*'([^']+)'[\s\S]*?body:\s*'([^']+)'[\s\S]*?fuel:\s*'([^']+)'[\s\S]*?image:\s*'([^']+)'/g;
    
    let matches = [];
    let m;
    while ((m = regex2.exec(content)) !== null) {
        matches.push({
            fullMatch: m[0],
            id: m[1],
            name: m[2],
            body: m[3],
            fuel: m[4],
            oldImage: m[5]
        });
    }

    for (let car of matches) {
        // Construct a highly specific query
        let query = `${car.fuel} ${car.body} car ${car.name.split(' ')[0]}`;
        if (car.body === 'Truck') query = 'pickup truck car';
        if (car.body === 'Convertible') query = 'convertible sports car';
        if (car.name.includes('GT-R')) query = 'nissan gtr sports car';
        if (car.name.includes('Limo')) query = 'luxury sedan limo car';
        if (car.name.includes('M4')) query = 'bmw m4 coupe';
        
        let newImgUrl = await getUniqueImageFor(query);
        console.log(`Mapped ${car.id} (${car.name}) to ${newImgUrl}`);
        
        // Replace in the file content
        modifiedContent = modifiedContent.replace(
            car.oldImage,
            newImgUrl.replace('https://images.unsplash.com/', '') // just a safe replace trick
        );
        // wait, simple string replace might replace multiple if they share the old URL.
        // We only want to replace the first occurrence of oldImage that comes after the ID.
        // Better to replace the whole fullMatch.
        
        let newMatchStr = car.fullMatch.replace(car.oldImage, newImgUrl);
        modifiedContent = modifiedContent.replace(car.fullMatch, newMatchStr);
    }
    
    fs.writeFileSync(filePath, modifiedContent);
}

async function run() {
    console.log('Processing new-cars.html...');
    await processFile('new-cars.html', /var VEHICLES = \[\s*([\s\S]*?)\];/);
    
    console.log('Processing used-cars.html...');
    await processFile('used-cars.html', /var CARS = \[\s*([\s\S]*?)\];/);
    
    // Now index.html (which shares the same FEATURED_CARS array structurally, but we just need to replace the image urls based on IDs)
    // Actually, index.html FEATURED_CARS also has `id, name, body` etc? Wait, in index.html, cars have `badge` and `image`, but not `body` or `fuel`.
    // Let's just update index.html using the image URLs we fetched for new-cars.html.
    console.log('Processing index.html...');
    let ncContent = fs.readFileSync(path.join(dir, 'new-cars.html'), 'utf8');
    let idxContent = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
    
    // Extract ID -> Image mapping from new-cars.html
    const mapRegex = /id:\s*'([^']+)'[\s\S]*?image:\s*'([^']+)'/g;
    let map = {};
    let m;
    while ((m = mapRegex.exec(ncContent)) !== null) {
        map[m[1]] = m[2];
    }
    
    // Update index.html
    let idxMatches = [];
    const idxRegex = /id:\s*'([^']+)'[\s\S]*?image:\s*'([^']+)'/g;
    while ((m = idxRegex.exec(idxContent)) !== null) {
        if (map[m[1]]) {
            let newMatchStr = m[0].replace(m[2], map[m[1]]);
            idxContent = idxContent.replace(m[0], newMatchStr);
        }
    }
    fs.writeFileSync(path.join(dir, 'index.html'), idxContent);
    
    console.log('Done!');
}

run().catch(console.error);
