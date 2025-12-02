/* Improved, robust, accessible UI script
   - IntersectionObserver with safe unobserve
   - honors prefers-reduced-motion
   - efficient hero parallax using rAF
   - accessible countdown with pause-on-hidden and days support
   - smoother anchor fallback
*/

(() => {
  'use strict';

  /* ---------- Utils ---------- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const isElement = v => v && v.nodeType === 1;

  /* ---------- Respect prefers-reduced-motion ---------- */
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  function reduceMotionApply() {
    if (motionQuery.matches) {
      // Add a helper class so CSS can opt-out cleanly
      document.documentElement.classList.add('reduced-motion');
    } else {
      document.documentElement.classList.remove('reduced-motion');
    }
  }
  reduceMotionApply();
  if (typeof motionQuery.addEventListener === 'function') {
    motionQuery.addEventListener('change', reduceMotionApply);
  } else if (typeof motionQuery.addListener === 'function') {
    motionQuery.addListener(reduceMotionApply);
  }

  /* ---------- IntersectionObserver for in-view animations ---------- */
  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -100px 0px'
  };

  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      // If reduced motion, simply add class immediately but do not animate
      if (document.documentElement.classList.contains('reduced-motion')) {
        el.classList.add('animate-in', 'reduced-motion-applied');
      } else {
        el.classList.add('animate-in');
      }

      // Animate known children for instructor card
      if (el.classList.contains('instructor-card')) {
        const badge = $('.instructor-badge', el);
        const image = $('.instructor-image', el);
        const details = $('.instructor-details', el);
        if (badge) badge.classList.add('animate-in');
        if (image) image.classList.add('animate-in');
        if (details) details.classList.add('animate-in');
      }

      // Unobserve to reduce work (safe if you don't want repeated trigger)
      try { obs.unobserve(el); } catch (e) { /* ignore */ }
    });
  }, observerOptions);

  // Observe elements we care about
  document.addEventListener('DOMContentLoaded', () => {
    const selectors = ['.instructor-card', '.video-container', '.bonus-banner', '.companies-section'];
    selectors.forEach(sel => {
      $$(sel).forEach(el => io.observe(el));
    });
  });

  /* ---------- Smooth scroll for same-page anchors (progressive & accessible) ---------- */
  function smoothScrollInit() {
    // Only enable if browser supports scrollIntoView with behavior
    const supportsSmooth = 'scrollBehavior' in document.documentElement.style;
    $$('a[href^="#"]').forEach(a => {
      a.addEventListener('click', function (evt) {
        const href = this.getAttribute('href');
        if (!href || href === '#') return; // allow normal behaviour for #
        const target = document.querySelector(href);
        if (!target) return;
        evt.preventDefault();

        // ensure target is focusable for accessibility after scroll
        const prevTabindex = target.getAttribute('tabindex');
        if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');

        if (supportsSmooth) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // move focus after a small delay to let the scroll settle (works with reduced-motion off)
          setTimeout(() => target.focus({ preventScroll: true }), 400);
        } else {
          // fallback: jump and focus immediately
          target.scrollIntoView(true);
          target.focus({ preventScroll: true });
        }

        // restore tabindex if it was not present originally
        if (prevTabindex === null) {
          setTimeout(() => target.removeAttribute('tabindex'), 1200);
        } else if (prevTabindex !== null) {
          target.setAttribute('tabindex', prevTabindex);
        }
      }, { passive: true });
    });
  }
  document.addEventListener('DOMContentLoaded', smoothScrollInit);

  /* ---------- Hero parallax / transform (rAF + passive scroll) ---------- */
  (function heroParallax() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    // micro-optimizations
    hero.style.willChange = 'transform, opacity';

    let latestY = 0;
    let ticking = false;
    const windowH = () => (window.innerHeight || document.documentElement.clientHeight);

    function onScroll() {
      latestY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
      requestTick();
    }
    function requestTick() {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }
    function update() {
      const scrolled = latestY;
      const vh = windowH();
      if (scrolled < vh) {
        // gentle transform — clamp values
        const translateY = Math.min(80, Math.round(scrolled * 0.25));
        const opacity = Math.max(0.5, 1 - (scrolled / (vh * 1.6)));
        hero.style.transform = `translateY(${translateY}px)`;
        hero.style.opacity = String(opacity);
      } else {
        // keep it simple once out of view
        hero.style.transform = '';
        hero.style.opacity = '';
      }
      ticking = false;
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => requestTick(), { passive: true });
    // initial tick in case page loads mid-scroll
    requestTick();
  })();

  /* ---------- Accessible Countdown Timer ---------- */
  (function countdownFactory() {
    const el = document.getElementById('sticky-countdown');
    if (!el) return;

    // ARIA live container for screen readers
    let liveRegion = document.getElementById('sticky-countdown-live');
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = 'sticky-countdown-live';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.style.position = 'absolute';
      liveRegion.style.left = '-9999px';
      liveRegion.style.width = '1px';
      liveRegion.style.height = '1px';
      liveRegion.style.overflow = 'hidden';
      document.body.appendChild(liveRegion);
    }

    // Accept ISO timestamp or fallback (12 hours)
    const OFFER_ENDS_AT = (typeof window.OFFER_ENDS_AT === 'string') ? window.OFFER_ENDS_AT.trim() : '';
    let target;
    if (OFFER_ENDS_AT) {
      const parsed = new Date(OFFER_ENDS_AT);
      if (!isNaN(parsed)) target = parsed;
    }
    if (!target) {
      target = new Date();
      target.setHours(target.getHours() + 12); // default 12 hours
    }

    // Format helper - include days if > 24h
    function formatTime(ms) {
      const totalSecs = Math.floor(ms / 1000);
      const days = Math.floor(totalSecs / 86400);
      const hrs = Math.floor((totalSecs % 86400) / 3600);
      const mins = Math.floor((totalSecs % 3600) / 60);
      const secs = totalSecs % 60;
      const hh = String(hrs).padStart(2, '0');
      const mm = String(mins).padStart(2, '0');
      const ss = String(secs).padStart(2, '0');

      if (days > 0) {
        return `${days}d ${hh}:${mm}:${ss}`;
      }
      return `${hh}:${mm}:${ss}`;
    }

    // Update loop with visibility optimization
    let intervalId = null;
    let running = false;

    function updateOnce() {
      const now = new Date();
      const diff = Math.max(0, target - now);
      el.textContent = formatTime(diff);
      liveRegion.textContent = `Offer ends in ${diff > 0 ? formatTime(diff) : 'now'}`;
      if (diff <= 0) {
        stop();
        // optional: fire an event so page can react
        const doneEvent = new CustomEvent('offer-ended', { detail: { target } });
        window.dispatchEvent(doneEvent);
      }
    }

    function start() {
      if (running) return;
      updateOnce();
      intervalId = window.setInterval(updateOnce, 1000);
      running = true;
    }

    function stop() {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      running = false;
    }

    // Pause the timer when the tab is hidden (saves CPU)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop();
      else start();
    });

    // Start initially, but defer first tick so fast loads don't block paint
    if (document.hidden) {
      // wait until visible
      document.addEventListener('visibilitychange', function onv() {
        if (!document.hidden) {
          document.removeEventListener('visibilitychange', onv);
          start();
        }
      });
    } else {
      start();
    }
  })();

  /* ---------- Safe DOMContentLoaded helpers for other init code ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    // Example: attach click handler for sticky register button to focus first form input (optional)
    const reg = document.getElementById('sticky-register');
    if (reg) {
      reg.addEventListener('click', (e) => {
        // If you have a registration form, focus the primary input for accessibility
        const firstInput = document.querySelector('form input, form button, #register-form input, #register-form button');
        if (firstInput) {
          firstInput.focus({ preventScroll: true });
        }
        // Otherwise, navigate to a registration anchor (progressive)
        const href = reg.getAttribute('data-href') || '#';
        if (href && href !== '#') window.location.href = href;
      });
    }
  });

})(); // end IIFE
