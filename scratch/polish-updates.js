const fs = require('fs');
const path = require('path');
const dir = 'c:/Users/Bismillah Enterprise/Desktop/carbeez';

// 1. Update contact.html
let contactPath = path.join(dir, 'contact.html');
let contact = fs.readFileSync(contactPath, 'utf8');
if (!contact.includes('Corporate details')) {
    contact = contact.replace('<!-- FAQ -->', `<!-- Corporate details -->
        <section class="section-tight" style="padding-bottom: 0;">
            <div class="wrap-wide">
                <div class="card card-pad reveal" style="background: linear-gradient(135deg, rgba(142,31,45,0.05), transparent); border: 1px solid var(--accent-line);">
                    <h2 class="h3" style="margin-bottom: 12px; color: var(--accent-text);">Corporate Headquarters</h2>
                    <p style="color: var(--text-soft); font-size: 0.95rem; line-height: 1.6; max-width: 60ch;">
                        <strong>CarBreezy Ltd.</strong><br>
                        Karachi, Pakistan<br><br>
                        Registration Number: 12948302<br>
                        VAT ID: GB 982 374 881
                    </p>
                </div>
            </div>
        </section>

        <!-- FAQ -->`);
    fs.writeFileSync(contactPath, contact);
}

// 2. Update css/base.css card zoom and border radius
let basePath = path.join(dir, 'css', 'base.css');
let base = fs.readFileSync(basePath, 'utf8');
base = base.replace('--card-zoom: 1.25;', '--card-zoom: 1.04;');
base = base.replace('--r-sm: 0px;', '--r-sm: 6px;');
base = base.replace('--r-md: 0px;', '--r-md: 10px;');
base = base.replace('--r-lg: 0px;', '--r-lg: 14px;');
base = base.replace('--r-xl: 0px;', '--r-xl: 20px;');
fs.writeFileSync(basePath, base);

// 3. Update site.js for GSAP reveals
let sitePath = path.join(dir, 'js', 'site.js');
let site = fs.readFileSync(sitePath, 'utf8');
if (!site.includes('window.ScrollTrigger')) {
    const oldObserve = /function observeReveals\(\) \{[\s\S]*?\}\);[\s\S]*?\}/;
    const newObserve = `function observeReveals() {
        var reveals = document.querySelectorAll('.reveal');
        if (reveals.length === 0) return;
        
        if (window.gsap && window.ScrollTrigger) {
            // Use GSAP for premium staggering
            reveals.forEach(function(el) {
                gsap.fromTo(el, 
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1, y: 0,
                        duration: 0.8,
                        ease: "power2.out",
                        scrollTrigger: {
                            trigger: el,
                            start: "top 85%",
                            toggleActions: "play none none none"
                        }
                    }
                );
                el.classList.add('visible');
            });
        } else {
            // Fallback to IntersectionObserver
            var observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (e) {
                    if (e.isIntersecting) {
                        e.target.classList.add('visible');
                        observer.unobserve(e.target);
                    }
                });
            }, { rootMargin: '0px 0px -50px 0px', threshold: 0.1 });

            reveals.forEach(function (r) { observer.observe(r); });
        }
    }`;
    site = site.replace(oldObserve, newObserve);
    fs.writeFileSync(sitePath, site);
}

console.log('Final polish applied successfully.');
