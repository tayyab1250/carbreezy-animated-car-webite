/* ============================================================
   CarBreezy — Editorial Story Sections JavaScript
   IntersectionObserver reveal + rAF image parallax
   ============================================================ */
(function () {
    'use strict';

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- Story section IntersectionObserver reveal ----------
       Adds/removes .cb-is-visible as each panel enters or leaves the
       viewport, triggering the clip-path image reveal and text entrances.  */
    function initStoryReveal() {
        var storySections = document.querySelectorAll('[data-cb-story]');
        if (!storySections.length) return;

        /* Graceful degradation: no IntersectionObserver → show everything */
        if (!('IntersectionObserver' in window)) {
            storySections.forEach(function (s) {
                s.classList.add('cb-is-visible');
            });
            return;
        }

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('cb-is-visible');
                } else {
                    /* Re-arm the animation when the section scrolls back above */
                    entry.target.classList.remove('cb-is-visible');
                }
            });
        }, {
            threshold: 0.17,
            rootMargin: '0px 0px -3% 0px'
        });

        storySections.forEach(function (s) {
            observer.observe(s);
        });
    }

    /* ---------- Image parallax (rAF-throttled) ----------
       Writes --cb-parallax-y on each parallax image. The CSS
       transition on the visible image reads this value so the
       parallax blends naturally with the entrance animation.   */
    function initParallax() {
        if (reduceMotion) return;

        var panels = document.querySelectorAll('[data-cb-parallax] img');
        if (!panels.length) return;

        var ticking = false;

        function update() {
            ticking = false;
            panels.forEach(function (img) {
                var rect = img.parentElement.getBoundingClientRect();
                var progress = (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight;
                var y = Math.max(-18, Math.min(18, progress * -14));
                img.style.setProperty('--cb-parallax-y', y + 'px');
            });
        }

        window.addEventListener('scroll', function () {
            if (!ticking) {
                window.requestAnimationFrame(update);
                ticking = true;
            }
        }, { passive: true });

        /* Run once on load so images are positioned correctly before scrolling */
        update();
    }

    /* ---------- Broken image fallback ----------
       If a remote car image fails to load, keep the panel dark
       instead of showing a broken-image icon.                   */
    function initImageFallback() {
        document.querySelectorAll('.cb-visual img').forEach(function (img) {
            img.addEventListener('error', function () {
                img.style.display = 'none';
                img.parentElement.style.background =
                    'radial-gradient(ellipse at 60% 35%, #333 0%, #181818 48%, #0b0b0b 100%)';
            }, { once: true });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initStoryReveal();
        initParallax();
        initImageFallback();
    });

})();
