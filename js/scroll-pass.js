(function () {
    'use strict';

    function initScrollPass() {
        var stage = document.getElementById('finaleStage');
        if (!stage || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        if (!window.gsap || !window.ScrollTrigger) {
            console.error('The home-page finale requires GSAP and ScrollTrigger.');
            return;
        }

        var first = document.getElementById('finaleFirst');
        var cars = document.getElementById('finaleCars');
        var car = document.getElementById('finalePass');
        var leftCar = document.getElementById('finalePassLeft');
        var rightCar = document.getElementById('finalePassRight');
        var leftImage = leftCar.querySelector('img');
        var rightImage = rightCar.querySelector('img');
        var second = document.getElementById('finaleSecond');
        var image = car.querySelector('img');
        var sideImages = cars.querySelectorAll('.finale-pass-side img');

        window.gsap.registerPlugin(window.ScrollTrigger);
        window.gsap.context(function () {
            var timeline = window.gsap.timeline({
                scrollTrigger: {
                    trigger: stage,
                    start: 'top top',
                    end: '+=350%',
                    pin: true,
                    scrub: 1,
                    invalidateOnRefresh: true
                }
            });

            timeline
                .to(first, { yPercent: -60, opacity: 0, ease: 'none', duration: 3 }, 0)
                .fromTo(cars, { y: '110vh' }, {
                    y: 0,
                    ease: 'none',
                    duration: 1.5
                }, 0.2)
                .fromTo([leftCar, rightCar], {
                    marginLeft: 0,
                    opacity: 0
                }, {
                    marginLeft: function (index) {
                        var maxSpread = (stage.clientWidth - leftCar.offsetWidth) / 2 - 12;
                        var requestedSpread = stage.clientWidth * (window.innerWidth <= 640 ? 0.23 : 0.17);
                        var spread = Math.min(requestedSpread, Math.max(0, maxSpread));
                        return index === 0 ? -spread : spread;
                    },
                    opacity: 1,
                    ease: 'power1.out',
                    duration: 1.8
                }, 2.8)
                .fromTo([leftImage, rightImage], { scale: 0.7 }, {
                    scale: 1,
                    ease: 'power1.out',
                    duration: 1.8
                }, 2.8)
                .to(cars, { y: '-130vh', ease: 'none', duration: 1.8 }, 4.8)
                .fromTo(second, { yPercent: 120, opacity: 0 }, {
                    yPercent: 0,
                    opacity: 1,
                    ease: 'power1.out',
                    duration: 2
                }, 5.1);
        }, stage);

        function refreshAfterImagesLoad() {
            window.ScrollTrigger.refresh();
        }

        [image].concat(Array.prototype.slice.call(sideImages)).forEach(function (carImage) {
            if (!carImage.complete) {
                carImage.addEventListener('load', refreshAfterImagesLoad, { once: true });
                carImage.addEventListener('error', refreshAfterImagesLoad, { once: true });
            }
        });
        refreshAfterImagesLoad();
    }

    document.addEventListener('DOMContentLoaded', initScrollPass, { once: true });
})();
