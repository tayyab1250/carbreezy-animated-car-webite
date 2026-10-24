/* ============================================================
   CarBreezy — Homepage Animation Controller
   Splits section headings into animated lines,
   wires up IntersectionObserver for all animated elements,
   and staggers card reveals.
   ============================================================ */
(function () {
    'use strict';

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ─────────────────────────────────────────────────────────
       1. HEADING SPLITTER
       Wraps every element with [data-anim-heading] into
       .anim-heading-line > span blocks (one per text line).
       We split on <br> tags first, then wrap the result.
    ───────────────────────────────────────────────────────── */
    function splitHeading(el) {
        /* Collect text segments split by <br> tags */
        var segments = [];
        el.childNodes.forEach(function (node) {
            if (node.nodeType === Node.TEXT_NODE) {
                var text = node.textContent.trim();
                if (text) segments.push({ type: 'text', content: text });
            } else if (node.nodeName === 'BR') {
                segments.push({ type: 'br' });
            } else if (node.nodeName === 'SPAN' || node.nodeName === 'EM' || node.nodeName === 'STRONG') {
                segments.push({ type: 'html', content: node.outerHTML });
            }
        });

        /* Build lines: split at <br> boundaries */
        var lines = [[]];
        segments.forEach(function (seg) {
            if (seg.type === 'br') {
                lines.push([]);
            } else {
                lines[lines.length - 1].push(seg);
            }
        });

        /* Remove empty trailing lines */
        lines = lines.filter(function (l) { return l.length > 0; });

        /* If we got nothing useful, fall back to full text */
        if (!lines.length) {
            lines = [[{ type: 'text', content: el.textContent.trim() }]];
        }

        /* Clear the heading and rebuild with animated lines */
        el.innerHTML = '';
        el.classList.add('anim-heading');

        lines.forEach(function (line) {
            var lineEl = document.createElement('span');
            lineEl.className = 'anim-heading-line';

            var innerEl = document.createElement('span');
            line.forEach(function (seg) {
                if (seg.type === 'text') {
                    innerEl.appendChild(document.createTextNode(seg.content));
                } else {
                    innerEl.insertAdjacentHTML('beforeend', seg.content);
                }
            });

            lineEl.appendChild(innerEl);
            el.appendChild(lineEl);
        });
    }

    /* ─────────────────────────────────────────────────────────
       2. INTERSECTION OBSERVER — single shared observer
       Handles: anim-heading, anim-eyebrow, anim-text,
                anim-cta, anim-card
    ───────────────────────────────────────────────────────── */
    function revealEl(el) {
        if (el.classList.contains('anim-heading')) {
            el.classList.add('is-revealed');
        } else {
            el.classList.add('is-revealed');
        }
    }

    function initObserver() {
        var selector = [
            '[data-anim-heading]',
            '.anim-eyebrow',
            '.anim-text',
            '.anim-cta',
            '.anim-card'
        ].join(', ');

        var targets = document.querySelectorAll(selector);
        if (!targets.length) return;

        if (!('IntersectionObserver' in window)) {
            targets.forEach(function (el) { el.classList.add('is-revealed'); });
            return;
        }

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    revealEl(entry.target);
                    observer.unobserve(entry.target); /* fire once */
                }
            });
        }, { threshold: 0.14, rootMargin: '0px 0px -40px 0px' });

        targets.forEach(function (el) { observer.observe(el); });
    }

    /* ─────────────────────────────────────────────────────────
       3. CARD STAGGER
       Any .anim-card inside a grid gets an nth-child delay
       so cards cascade in from left to right.
    ───────────────────────────────────────────────────────── */
    function staggerCards() {
        document.querySelectorAll('.anim-card').forEach(function (card, i) {
            /* Cap delay at 5 to avoid huge waits in long lists */
            var delay = Math.min(i % 4, 3) * 0.12;
            card.style.transitionDelay = delay + 's';
        });
    }

    /* ─────────────────────────────────────────────────────────
       4. MARK UP HEADINGS in existing sections
       Adds [data-anim-heading] and processes each one.
    ───────────────────────────────────────────────────────── */
    function markupHeadings() {
        /* Target section-level h1/h2 elements that aren't already
           inside the editorial cb- sections (those handle themselves). */
        var headings = document.querySelectorAll(
            '.section-head .h2, ' +
            '.stack-section .h2, ' +
            '.cta-band h2, ' +
            '.interactive-hero .display, ' +
            '.finale-headline h2'
        );

        headings.forEach(function (h) {
            /* Skip if already inside editorial sections */
            if (h.closest('.cb-editorial-sections')) return;
            h.setAttribute('data-anim-heading', '');
            if (!reduceMotion) {
                splitHeading(h);
            } else {
                h.classList.add('anim-heading', 'is-revealed');
            }
        });
    }

    /* ─────────────────────────────────────────────────────────
       5. MARK UP EYEBROWS, LEAD TEXT, CTAS
    ───────────────────────────────────────────────────────── */
    function markupText() {
        /* Eyebrows inside sections (not editorial) */
        document.querySelectorAll(
            '.section-head .eyebrow, ' +
            '.cta-band .eyebrow, ' +
            '.interactive-hero .eyebrow'
        ).forEach(function (el) {
            if (el.closest('.cb-editorial-sections')) return;
            el.classList.add('anim-eyebrow');
        });

        /* Lead paragraphs */
        document.querySelectorAll(
            '.section-head .lead, ' +
            '.cta-band .lead, ' +
            '.interactive-hero .lead'
        ).forEach(function (el) {
            if (el.closest('.cb-editorial-sections')) return;
            el.classList.add('anim-text');
        });

        /* CTA buttons inside hero / cta-band */
        document.querySelectorAll(
            '.interactive-hero .hero-actions, ' +
            '.cta-band .hero-actions'
        ).forEach(function (el) {
            if (el.closest('.cb-editorial-sections')) return;
            el.classList.add('anim-cta');
        });

        /* Section-head CTA buttons */
        document.querySelectorAll('.section-head > .btn').forEach(function (el) {
            el.classList.add('anim-cta');
        });
    }

    /* ─────────────────────────────────────────────────────────
       6. MARK UP CARDS (feature cards rendered by JS)
       The featured carousel and stack cards handle their own
       reveals; we only touch the feature grid here.
    ───────────────────────────────────────────────────────── */
    function markupCards(root) {
        var target = root || document;
        target.querySelectorAll(
            '#featureGrid .card, ' +
            '#featureGrid article'
        ).forEach(function (el) {
            el.classList.add('anim-card');
        });
        staggerCards();
        /* Re-observe newly added cards */
        initObserver();
    }

    /* ─────────────────────────────────────────────────────────
       INIT
    ───────────────────────────────────────────────────────── */
    function init() {
        markupHeadings();
        markupText();
        initObserver();

        /* Watch for dynamically rendered cards (featureGrid injected by DOMContentLoaded) */
        var featureGrid = document.getElementById('featureGrid');
        if (featureGrid) {
            var mo = new MutationObserver(function (mutations) {
                var added = false;
                mutations.forEach(function (m) {
                    if (m.addedNodes.length) added = true;
                });
                if (added) {
                    mo.disconnect();
                    markupCards(featureGrid.parentElement);
                }
            });
            mo.observe(featureGrid, { childList: true });
        }
    }

    /* Run after the DOM is ready but before DOMContentLoaded fires
       on slower devices — use DOMContentLoaded to be safe.          */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
