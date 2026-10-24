/* ============================================================
   Stacking Showcase — GSAP ScrollTrigger scrub stack
   Data-driven: AutomotiveStack(track, cars) renders one
   AutomotiveCard per entry and scrubs each card from the
   bottom of the viewport into the sticky stack.
   ============================================================ */
(function (window, document) {
    'use strict';

    function prefersReducedMotion() {
        return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }

    function specTemplate(spec) {
        return '<div><span>' + spec.label + '</span><strong>' + spec.value + '</strong></div>';
    }

    function AutomotiveCard(car, index, total) {
        var card = document.createElement('article');
        card.className = 'stack-card';
        card.style.zIndex = index + 1;
        card.style.setProperty('--stack-offset', (index * 12) + 'px');

        var specs = car.specs.map(specTemplate).join('');

        card.innerHTML =
            '<div class="stack-card-inner">' +
                '<div class="stack-media">' +
                    '<img src="' + car.image + '" alt="' + car.name + '" loading="lazy" width="900" height="560" decoding="async">' +
                    '<span class="stack-index">' + car.number + ' / ' + total + '</span>' +
                '</div>' +
                '<div class="stack-content">' +
                    '<span class="stack-category">' + car.category + '</span>' +
                    '<h3 class="stack-title">' + car.name + '</h3>' +
                    '<p class="stack-desc">' + car.description + '</p>' +
                    '<div class="stack-specs">' + specs + '</div>' +
                    '<a class="stack-cta" href="' + car.href + '">' + car.cta + ' <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>' +
                '</div>' +
            '</div>';

        return card;
    }

    function AutomotiveStack(track, cars) {
        if (!track || !cars || !cars.length) return;

        var total = cars.length;
        var cards = cars.map(function (car, i) {
            var card = AutomotiveCard(car, i, total);
            track.appendChild(card);
            return card;
        });

        /* No GSAP or reduced motion: cards stay in normal flow, fully visible */
        if (prefersReducedMotion() || !window.gsap || !window.ScrollTrigger) return;

        window.gsap.registerPlugin(window.ScrollTrigger);

        cards.forEach(function (card) {
            var tween = window.gsap.fromTo(card,
                { y: 140, scale: 0.94, opacity: 0.65 },
                { y: 0, scale: 1, opacity: 1, ease: 'none', force3D: true }
            );

            window.ScrollTrigger.create({
                trigger: card,
                start: 'top bottom',
                end: function () {
                    var stickyTop = parseFloat(window.getComputedStyle(card).top) || 0;
                    return 'top+=' + stickyTop;
                },
                scrub: true,
                animation: tween,
                invalidateOnRefresh: true
            });
        });
    }

    window.AutomotiveStack = AutomotiveStack;
    window.AutomotiveCard = AutomotiveCard;
})(window, document);
