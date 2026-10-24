/* ============================================================
   Interactive Hero — GSAP 3D Hover Effect
   ============================================================ */
(function (window, document) {
    'use strict';

    function initInteractiveHero() {
        const container = document.getElementById('car3dContainer');
        const image = document.getElementById('car3dImage');
        const video = document.querySelector('.hero-video-bg');
        
        if (video) {
            const playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(() => {});
            }
        }
        
        if (!container || !image || !window.gsap) return;

        // Animate the entrance of the hero
        window.gsap.fromTo(container, 
            { opacity: 0, scale: 0.9, y: 50 }, 
            { opacity: 1, scale: 1, y: 0, duration: 1.2, ease: "power3.out", delay: 0.3 }
        );

        // 3D Parallax Tilt Effect on Mouse Move
        container.addEventListener('mousemove', (e) => {
            const rect = container.getBoundingClientRect();
            
            // Calculate cursor position relative to the center of the container (-1 to 1)
            const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
            const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
            
            // Max rotation angles (degrees)
            const maxRotateX = 20;
            const maxRotateY = -30; 
            
            window.gsap.to(image, {
                rotateX: y * maxRotateX,
                rotateY: x * maxRotateY,
                x: x * 25,
                y: y * 25,
                scale: 1.08 + Math.abs(x) * 0.05 + Math.abs(y) * 0.05,
                duration: 0.3,
                ease: "power2.out",
                transformPerspective: 1500,
                transformOrigin: "center center"
            });
        });

        // Reset rotation on mouse leave
        container.addEventListener('mouseleave', () => {
            window.gsap.to(image, {
                rotateX: 0,
                rotateY: 0,
                x: 0,
                y: 0,
                scale: 1,
                duration: 0.8,
                ease: "power2.out"
            });
        });
    }

    document.addEventListener('DOMContentLoaded', initInteractiveHero);

})(window, document);
