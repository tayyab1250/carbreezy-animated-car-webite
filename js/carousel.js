/* ============================================================
   ContentCarousel
   Data-driven, page-snapping horizontal carousel.

   Markup contract (see index.html for the live instance):
     <div class="carousel" data-carousel>
       <button class="carousel-nav prev" aria-label="Show previous items"></button>
       <div class="carousel-viewport" tabindex="0">
         <div class="carousel-track" data-carousel-track></div>
       </div>
       <button class="carousel-nav next" aria-label="Show next items"></button>
       <div class="carousel-progress"><span></span></div>
     </div>

   Usage:
     new ContentCarousel(root, { items: [...], render: item => '<article>…</article>' })
   ============================================================ */
(function (window, document) {
    'use strict';

    function ContentCarousel(root, options) {
        if (!root) return;

        this.root = root;
        this.options = options || {};

        this.viewport = root.querySelector('.carousel-viewport');
        this.track = root.querySelector('[data-carousel-track], .carousel-track');
        this.prev = root.querySelector('.carousel-nav.prev');
        this.next = root.querySelector('.carousel-nav.next');
        this.progress = root.querySelector('.carousel-progress span');

        if (!this.viewport || !this.track) {
            console.warn('[ContentCarousel] missing .carousel-viewport or [data-carousel-track]');
            return;
        }

        this.items = [];
        this.offset = 0;
        this.step = 0;
        this.max = 0;
        this.pages = 1;
        this.pageSize = 0;
        this.visible = 1;
        this.drag = null;
        this._suppressUntil = 0;

        this.onScroll = this.onScroll.bind(this);
        this.onResize = this.onResize.bind(this);
        this.onKey = this.onKey.bind(this);

        this.bind();
        this.setItems(this.options.items || []);
        this.measure();

        // Fired only once the slides exist, so onReady hooks can post-process them
        if (typeof this.options.onReady === 'function') this.options.onReady(this);
    }

    /* ---------- Data ---------- */
    ContentCarousel.prototype.setItems = function (items) {
        this.items = items.slice();

        if (!this.items.length || !this.options.render) return;

        this.track.innerHTML = this.items
            .map(this.options.render)
            .join('');

        this.offset = 0;
        this.apply();
    };

    /* ---------- Measurements (all derived, never hardcoded) ---------- */
    ContentCarousel.prototype.measure = function () {
        var slide = this.track.firstElementChild;
        if (!slide) return;

        var gap = parseFloat(getComputedStyle(this.track).columnGap || 0) || 0;
        var slideWidth = slide.getBoundingClientRect().width;
        var viewportWidth = this.viewport.clientWidth;

        if (!slideWidth) return;

        // How many slides actually fit right now (fractional-safe)
        this.visible = Math.max(1, Math.round((viewportWidth + gap) / (slideWidth + gap)));

        // Page-based movement with a one-slide overlap, e.g. 5 visible -> 4 per page
        this.step = Math.max(1, this.visible - 1) * (slideWidth + gap);

        // Travel = full content width, minus a peek of the next slide so the
        // list feels continuous instead of stopping flush at the end.
        var contentWidth = this.items.length * slideWidth + Math.max(0, this.items.length - 1) * gap;
        var peek = this.visible < this.items.length ? slideWidth * 0.18 : 0;
        this.max = Math.max(0, contentWidth - viewportWidth - peek);

        // Spread the travel evenly across whole pages so the last click always
        // lands flush at the end instead of overshooting into a tiny last step.
        this.pages = Math.max(1, Math.ceil(this.max / this.step));
        this.pageSize = this.max > 0 ? this.max / this.pages : 0;
        this.step = this.pageSize || this.step;

        this.clamp();
        this.apply();
    };

    /* ---------- Rendering (single transform write per frame) ---------- */
    ContentCarousel.prototype.apply = function () {
        var x = -(this.drag ? this.drag.offset : this.offset);

        this.track.style.transform = 'translate3d(' + x + 'px, 0, 0)';

        if (this.progress) {
            var ratio = this.max > 0 ? this.offset / this.max : 1;
            var visibleRatio = Math.min(1, this.visible / Math.max(this.items.length, 1));
            this.progress.style.setProperty('--progress', Math.max(0.12, visibleRatio + ratio * (1 - visibleRatio)));
        }

        this.updateEdges();
    };

    ContentCarousel.prototype.updateEdges = function () {
        var atStart = this.offset <= 0.5;
        var atEnd = this.offset >= this.max - 0.5;

        if (this.prev) {
            this.prev.setAttribute('aria-disabled', atStart ? 'true' : 'false');
            this.prev.tabIndex = atStart ? -1 : 0;
        }

        if (this.next) {
            this.next.setAttribute('aria-disabled', atEnd ? 'true' : 'false');
            this.next.tabIndex = atEnd ? -1 : 0;
        }

        this.root.classList.toggle('at-start', atStart);
        this.root.classList.toggle('at-end', atEnd);
    };

    ContentCarousel.prototype.clamp = function () {
        this.offset = Math.max(0, Math.min(this.offset, this.max));
    };

    /* ---------- Navigation ---------- */
    ContentCarousel.prototype.snapTo = function (target) {
        var page = this.pageSize || this.step;
        this.offset = Math.round(target / page) * page;
        this.clamp();
        this.apply();
    };

    ContentCarousel.prototype.scrollBy = function (direction) {
        this.snapTo(this.offset + this.step * direction);
    };

    ContentCarousel.prototype.scrollTo = function (target) {
        this.snapTo(target);
    };

    ContentCarousel.prototype.onKey = function (e) {
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            this.scrollBy(-1);
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            this.scrollBy(1);
        }
    };

    /* ---------- Touch / pointer drag ---------- */
    ContentCarousel.prototype.onPointerDown = function (e) {
        if (e.button !== undefined && e.button !== 0) return;
        if (e.target.closest('a, button')) return;
        if (this.max <= 0) return;

        this.drag = {
            id: e.pointerId,
            startX: e.clientX,
            startY: e.clientY,
            offset: this.offset,
            delta: 0,
            axis: null,
            moved: false
        };

        this.viewport.classList.add('is-dragging');
    };

    ContentCarousel.prototype.onPointerMove = function (e) {
        if (!this.drag || e.pointerId !== this.drag.id) return;

        var dx = e.clientX - this.drag.startX;
        var dy = e.clientY - this.drag.startY;

        // Lock the axis once the gesture is clearly horizontal or vertical
        if (!this.drag.axis && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
            this.drag.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
        }

        if (this.drag.axis !== 'x') return;

        e.preventDefault();
        this.drag.delta = dx;
        this.drag.moved = this.drag.moved || Math.abs(dx) > 4;

        var next = this.drag.offset - dx;
        this.drag.offset = Math.max(-60, Math.min(next, this.max + 60));
        this.apply();
    };

    ContentCarousel.prototype.onPointerUp = function (e) {
        if (!this.drag || e.pointerId !== this.drag.id) return;

        var drag = this.drag;
        this.drag = null;
        this.viewport.classList.remove('is-dragging');

        // Suppress the click that follows a drag
        if (drag.moved) {
            this._suppressUntil = Date.now() + 350;
        }

        var flick = Math.abs(drag.delta) > 48;
        var pages = flick ? (drag.delta < 0 ? 1 : -1) : Math.round(-drag.delta / this.step);

        this.scrollTo(drag.offset + pages * this.step);
    };

    /* ---------- Trackpad / wheel ---------- */
    ContentCarousel.prototype.onWheel = function (e) {
        if (this.max <= 0) return;

        var delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;

        // Only claim the gesture when we can still move in that direction,
        // otherwise the page must keep scrolling normally.
        if (delta < 0 && this.offset >= this.max - 0.5) return;
        if (delta > 0 && this.offset <= 0.5) return;

        e.preventDefault();

        this._wheelRemainder = (this._wheelRemainder || 0) + delta;
        var threshold = this.step * 0.35;

        if (Math.abs(this._wheelRemainder) >= threshold) {
            var pages = this._wheelRemainder > 0 ? -1 : 1;
            this._wheelRemainder = 0;
            this.scrollBy(pages);
        }
    };

    /* ---------- Wiring ---------- */
    ContentCarousel.prototype.bind = function () {
        var self = this;

        if (this.prev) {
            this.prev.addEventListener('click', function () { self.scrollBy(-1); });
        }

        if (this.next) {
            this.next.addEventListener('click', function () { self.scrollBy(1); });
        }

        this.viewport.addEventListener('keydown', this.onKey);

        this.viewport.addEventListener('pointerdown', this.onPointerDown);
        this.viewport.addEventListener('pointermove', this.onPointerMove, { passive: false });
        this.viewport.addEventListener('pointerup', this.onPointerUp);
        this.viewport.addEventListener('pointercancel', this.onPointerUp);
        this.viewport.addEventListener('dragstart', function (e) { e.preventDefault(); });

        this.viewport.addEventListener('click', function (e) {
            if (this._suppressUntil && Date.now() < this._suppressUntil) {
                e.preventDefault();
                e.stopPropagation();
            }
        }, true);

        this.viewport.addEventListener('wheel', this.onWheel, { passive: false });

        window.addEventListener('resize', this.onResize);

        if ('ResizeObserver' in window) {
            this.resizeObserver = new ResizeObserver(this.onResize);
            this.resizeObserver.observe(this.viewport);
        }
    };

    ContentCarousel.prototype.onResize = function () {
        if (this._raf) cancelAnimationFrame(this._raf);
        this._raf = requestAnimationFrame(this.onScroll);
    };

    ContentCarousel.prototype.onScroll = function () {
        this._raf = null;
        this.measure();
    };

    ContentCarousel.prototype.destroy = function () {
        window.removeEventListener('resize', this.onResize);
        if (this.resizeObserver) this.resizeObserver.disconnect();
    };

    /* ---------- Auto-mount ---------- */
    window.ContentCarousel = ContentCarousel;
})(window, document);
