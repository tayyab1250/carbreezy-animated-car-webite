const fs = require('fs');
const path = require('path');

const filePath = path.join('c:/Users/Bismillah Enterprise/Desktop/carbeez', 'reviews.html');
let html = fs.readFileSync(filePath, 'utf8');

// 1. Replace the REVIEWS array
const oldReviewsBlockRegex = /var REVIEWS = \[[\s\S]*?\];/;
const newReviewsBlock = `var REVIEWS = [
    { name: 'Maria L.', meta: 'Volt E-Drive GT · Electric', score: 5, cat: 'New cars', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', text: 'The range estimate matched reality almost exactly. Finance was approved in a day and the handover took under an hour.' },
    { name: 'David R.', meta: 'Apex Velocity · New car', score: 5, cat: 'Finance', img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80', text: 'Honest guidance throughout. They showed me the cheaper insurance class up front rather than after I signed.' },
    { name: 'Nina S.', meta: 'Horizon Cruiser · New car', score: 4, cat: 'New cars', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80', text: 'Great specification detail. Slight delay on delivery day but kept me updated the whole time.' },
    { name: 'Priya K.', meta: 'Urban Sprint · Used car', score: 5, cat: 'Used cars', img: 'https://images.unsplash.com/photo-1531123897727-8f129e1ebfa6?auto=format&fit=crop&w=150&q=80', text: 'The inspection report listed every scratch. No surprises at collection, which is exactly what I wanted.' },
    { name: 'Tom H.', meta: 'Summit Trek X7 · Used car', score: 5, cat: 'Used cars', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80', text: 'Traded in my old car and got a fair price the same week. No haggling, just the number they quoted.' },
    { name: 'Elena V.', meta: 'Nationwide transport · Delivery', score: 5, cat: 'Delivery', img: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80', text: 'Tracked the transport from Leeds to my door. Two days early and the car arrived spotless.' },
    { name: 'Sam D.', meta: 'Aero Roadster · New car', score: 4, cat: 'New cars', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', text: 'Beautiful car and a smooth purchase. I would have liked a longer test drive window.' },
    { name: 'Grace O.', meta: 'Vega Performance Hybrid · Finance', score: 5, cat: 'Finance', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80', text: 'The monthly calculator matched the final offer almost exactly. No surprises in the paperwork.' },
    { name: 'Owen F.', meta: 'Titan Crew · Used car', score: 5, cat: 'Used cars', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80', text: 'Honest about the tow rating being close to the limit. Respected that I needed it for the actual job.' },
    { name: 'Ivy N.', meta: 'Home delivery · Delivery', score: 5, cat: 'Delivery', img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80', text: 'They brought the car to my workplace and walked me through every function before I signed.' },
    { name: 'Leo M.', meta: 'Lumen City EV · New car', score: 4, cat: 'New cars', img: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=150&q=80', text: 'Excellent value and the charging cable was included. Slight wait on paperwork.' },
    { name: 'Amara J.', meta: 'Certified purchase · Used car', score: 5, cat: 'Used cars', img: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=150&q=80', text: 'The warranty made the decision easy. One call and it was sorted with no argument.' }
];`;

html = html.replace(oldReviewsBlockRegex, newReviewsBlock);

// 2. Replace renderReviews avatar generation
const oldAvatarStr = '\'<div class="who"><span class="avatar">\' + initials(r.name) + \'</span>\' +';
const newAvatarStr = '\'<div class="who">\' + (r.img ? \'<img class="avatar" style="object-fit:cover;" src="\' + r.img + \'" alt="\' + r.name + \'">\' : \'<span class="avatar">\' + initials(r.name) + \'</span>\') +';

html = html.replace(oldAvatarStr, newAvatarStr);

fs.writeFileSync(filePath, html);
console.log('Reviews updated with distinct profile images.');
