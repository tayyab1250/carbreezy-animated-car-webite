const fs = require('fs');
const path = require('path');
const dir = 'c:/Users/Bismillah Enterprise/Desktop/carbeez';

const idToImage = {
    'nc-01': 'https://images.unsplash.com/photo-1549429188-6927a7c93cb6?auto=format&fit=crop&w=1000&q=80',
    'nc-02': 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=1000&q=80',
    'nc-03': 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1000&q=80',
    'nc-04': 'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=1000&q=80',
    'nc-05': 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=1000&q=80',
    'nc-06': 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1000&q=80',
    'nc-07': 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&w=1000&q=80',
    'nc-08': 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&w=1000&q=80',
    'nc-09': 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1000&q=80',
    'nc-10': 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1000&q=80',
    'nc-11': 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1000&q=80',
    'nc-12': 'https://images.unsplash.com/photo-1568844293986-8d0400bd4745?auto=format&fit=crop&w=1000&q=80',
    'nc-13': 'https://images.unsplash.com/photo-1583267746897-f542456e5454?auto=format&fit=crop&w=1000&q=80',
    'nc-14': 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1000&q=80',
    'nc-15': 'https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1000&q=80',
    'nc-16': 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=1000&q=80',
    'nc-17': 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&w=1000&q=80',
    'nc-18': 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?auto=format&fit=crop&w=1000&q=80',
    'nc-19': 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=1000&q=80',

    'uc-01': 'https://images.unsplash.com/photo-1536700503339-1e4b06520771?auto=format&fit=crop&w=1000&q=80',
    'uc-02': 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1000&q=80',
    'uc-03': 'https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&w=1000&q=80',
    'uc-04': 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1000&q=80',
    'uc-05': 'https://images.unsplash.com/photo-1582006733220-410a08e1a11f?auto=format&fit=crop&w=1000&q=80',
    'uc-06': 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1000&q=80',
    'uc-07': 'https://images.unsplash.com/photo-1559404287-6e9f90f23f00?auto=format&fit=crop&w=1000&q=80',
    'uc-08': 'https://images.unsplash.com/photo-1520050735087-1ed65d9b0273?auto=format&fit=crop&w=1000&q=80'
};

function fixFile(filename) {
    const filePath = path.join(dir, filename);
    let content = fs.readFileSync(filePath, 'utf8');

    for (const [id, newImage] of Object.entries(idToImage)) {
        const regex = new RegExp("id:\\s*'" + id + "'([\\s\\S]*?)image:\\s*(?:'|\")[^'\"]+(?:'|\")", 'g');
        content = content.replace(regex, "id: '" + id + "'$1image: '" + newImage + "'");
    }

    fs.writeFileSync(filePath, content);
}

fixFile('new-cars.html');
fixFile('used-cars.html');
fixFile('index.html');

console.log('Fixed all car images!');
