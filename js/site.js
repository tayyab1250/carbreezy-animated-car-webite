/* ============================================================
   CarBreezy — Shared behaviour (nav, reveal, ticker, accordion)
   ============================================================ */
(function () {
    'use strict';

    /* ---------- Mobile navigation ---------- */
    function initNav() {
        var toggle = document.querySelector('.nav-toggle');
        var nav = document.querySelector('.nav');
        if (!toggle || !nav) return;

        toggle.addEventListener('click', function () {
            var open = nav.classList.toggle('open');
            toggle.classList.toggle('open', open);
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });

        nav.addEventListener('click', function (e) {
            if (e.target.closest('a')) {
                nav.classList.remove('open');
                toggle.classList.remove('open');
                toggle.setAttribute('aria-expanded', 'false');
            }
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                nav.classList.remove('open');
                toggle.classList.remove('open');
                toggle.setAttribute('aria-expanded', 'false');
            }
        });

        window.addEventListener('resize', function () {
            if (window.innerWidth > 1120) {
                nav.classList.remove('open');
                toggle.classList.remove('open');
                toggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    /* ---------- Lenis smooth scroll ---------- */
    var lenis = null;

    function headerOffset() {
        var pad = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop);
        return isNaN(pad) ? 0 : -pad;
    }

    function initSmoothScroll() {
        var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduced || typeof window.Lenis !== 'function') return;

        lenis = new window.Lenis({
            duration: 1.4,
            easing: function (t) {
                return Math.min(1, 1.001 - Math.pow(2, -10 * t));
            },
            smoothWheel: true,
            allowNestedScroll: true,
            touch: false
        });

        if (window.gsap && window.ScrollTrigger) {
            /* Index page: keep ScrollTrigger in sync with Lenis */
            lenis.on('scroll', window.ScrollTrigger.update);
            window.gsap.ticker.add(function (time) {
                lenis.raf(time * 1000);
            });
            window.gsap.ticker.lagSmoothing(0);
        } else {
            /* Every other page: drive Lenis with its own rAF loop */
            (function raf(time) {
                lenis.raf(time);
                requestAnimationFrame(raf);
            })(performance.now());
        }

        /* Same-page anchors glide with Lenis instead of jumping */
        document.addEventListener('click', function (e) {
            var link = e.target.closest ? e.target.closest('a[href^="#"]') : null;
            if (!link) return;
            var hash = link.getAttribute('href');
            if (hash.length < 2) return;
            var target = document.querySelector(hash);
            if (!target) return;
            e.preventDefault();
            lenis.scrollTo(target, { offset: headerOffset(), duration: 1.4 });
        });

        /* Cross-page hash links: ease in on arrival when the browser has not jumped yet */
        if (location.hash && window.scrollY === 0) {
            var initial = document.querySelector(location.hash);
            if (initial) {
                lenis.scrollTo(initial, { offset: headerOffset(), duration: 1.6 });
            }
        }

        if (window.CarBreezy) window.CarBreezy.lenis = lenis;
    }

    /* ---------- Scroll reveal ---------- */
    var revealObserver = null;

    function showAll(items) {
        items.forEach(function (el) { el.classList.add('visible'); });
    }

    function observeReveals(root) {
        var items = (root || document).querySelectorAll('.reveal:not(.visible)');
        if (!items.length) return;

        if (!('IntersectionObserver' in window)) {
            showAll(items);
            return;
        }

        if (!revealObserver) {
            revealObserver = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        revealObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.12, rootMargin: '0px 0px -40px' });
        }

        items.forEach(function (el) { revealObserver.observe(el); });
    }

    /* ---------- Accordion ---------- */
    function initAccordions() {
        document.querySelectorAll('[data-accordion]').forEach(function (root) {
            root.addEventListener('click', function (e) {
                var btn = e.target.closest('.acc-btn');
                if (!btn) return;
                var item = btn.closest('.acc-item');
                var panel = item.querySelector('.acc-panel');
                var isOpen = item.classList.toggle('open');

                btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
                panel.style.maxHeight = isOpen ? panel.scrollHeight + 'px' : '0px';
            });
        });
    }

    /* ---------- Cursor dot ---------- */
    function initCursorDot() {
        // Only for precise pointers (mouse/trackpad), never on touch
        if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

        var dot = document.createElement('div');
        dot.className = 'cursor-dot';
        dot.setAttribute('aria-hidden', 'true');
        document.body.appendChild(dot);

        var x = 0, y = 0, queued = false;

        // Half the dot's width, so the circle sits centred on the pointer
        var radius = (parseFloat(getComputedStyle(dot).width) || 14) / 2;

        function paint() {
            queued = false;
            dot.style.transform =
                'translate3d(' + (x - radius) + 'px,' + (y - radius) + 'px,0)';
        }

        document.addEventListener('pointermove', function (e) {
            if (e.pointerType && e.pointerType !== 'mouse') return;
            x = e.clientX;
            y = e.clientY;
            dot.classList.add('visible');
            if (!queued) {
                queued = true;
                requestAnimationFrame(paint);
            }
        }, { passive: true });

        document.addEventListener('pointerleave', function () {
            dot.classList.remove('visible');
        });

        window.addEventListener('blur', function () {
            dot.classList.remove('visible');
        });
    }

    /* ---------- Fixed background parallax ---------- */
    function initParallaxBg() {
        var bg = document.querySelector('.page-bg');
        if (!bg) return;

        var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduced) return;

        bg.classList.add('is-parallax');

        var ticking = false;

        function update() {
            ticking = false;
            var doc = document.documentElement;
            var max = doc.scrollHeight - window.innerHeight;
            var progress = max > 0 ? Math.min(1, Math.max(0, window.pageYOffset / max)) : 0;
            bg.style.setProperty('--bg-shift', progress.toFixed(4));
        }

        function onScroll() {
            if (!ticking) {
                ticking = true;
                requestAnimationFrame(update);
            }
        }

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll, { passive: true });
        update();
    }

    /* ---------- Broken image fallback ----------
       Image error events do not bubble, so listen in the capture
       phase. A failed image fades out, leaving the placeholder
       background of its container visible instead of a broken icon. */
    function initImageFallback() {
        document.addEventListener('error', function (e) {
            var target = e.target;
            if (!target || target.tagName !== 'IMG') return;
            target.classList.add('img-failed');
        }, true);
    }

    /* ---------- Footer year ---------- */
    function initYear() {
        document.querySelectorAll('[data-year]').forEach(function (el) {
            el.textContent = new Date().getFullYear();
        });
    }

    /* Exposed immediately so page scripts can register slides that render later */
    window.CarBreezy = window.CarBreezy || {};
    window.CarBreezy.observeReveals = observeReveals;

    document.addEventListener('DOMContentLoaded', function () {
        initSmoothScroll();
        initNav();
        observeReveals();
        initAccordions();
        initCursorDot();
        initParallaxBg();
        initImageFallback();
        initYear();
    });
})();
