


(() => {
  'use strict';

  /* ---------- tiny helpers ---------- */
  const $ = (sel, ctx = document) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from((ctx || document).querySelectorAll(sel));
  const isReducedMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Respect prefers-reduced-motion ---------- */
  (function applyReducedMotionClass() {
    try {
      const mq = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
      const setClass = () => {
        if (mq && mq.matches) document.documentElement.classList.add('reduced-motion');
        else document.documentElement.classList.remove('reduced-motion');
      };
      setClass();
      if (mq) {
        if (typeof mq.addEventListener === 'function') mq.addEventListener('change', setClass);
        else if (typeof mq.addListener === 'function') mq.addListener(setClass);
      }
    } catch (e) { /* ignore */ }
  })();

  /* --------------------------
     IntersectionObserver: reveal elements (cards, instructor, etc)
     -------------------------- */
  function initInViewObserver() {
    if (!('IntersectionObserver' in window)) {
      // fallback: add classes immediately
      $$('.instructor-card, .video-container, .bonus-banner, .companies-section, .card').forEach(el => el.classList.add('animate-in', 'visible'));
      return;
    }

    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        if (document.documentElement.classList.contains('reduced-motion')) el.classList.add('animate-in', 'reduced-motion-applied');
        else el.classList.add('animate-in');

        // if card(s), also reveal children nicely
        if (el.classList.contains('instructor-card')) {
          $('.instructor-badge', el)?.classList.add('animate-in');
          $('.instructor-image', el)?.classList.add('animate-in');
          $('.instructor-details', el)?.classList.add('animate-in');
        }

        try { obs.unobserve(el); } catch (err) { /* ignore */ }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -100px 0px' });

    // observe
    const watch = ['.instructor-card', '.video-container', '.bonus-banner', '.companies-section', '.card'];
    watch.forEach(sel => $$(sel).forEach(el => io.observe(el)));
  }

  /* --------------------------
     Smooth anchor scrolling (progressive, accessible)
     -------------------------- */
  function initSmoothAnchors() {
    const supportsSmooth = 'scrollBehavior' in document.documentElement.style;
    $$('a[href^="#"]').forEach(a => {
      a.addEventListener('click', function (evt) {
        const href = this.getAttribute('href');
        if (!href || href === '#') return;
        const target = document.querySelector(href);
        if (!target) return;
        evt.preventDefault();

        // make target focusable, then scroll and focus
        const hadTab = target.hasAttribute('tabindex');
        const prevTab = target.getAttribute('tabindex');
        if (!hadTab) target.setAttribute('tabindex', '-1');

        if (supportsSmooth) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setTimeout(() => target.focus({ preventScroll: true }), 420);
        } else {
          target.scrollIntoView(true);
          target.focus({ preventScroll: true });
        }

        // restore original tabindex after a moment
        setTimeout(() => {
          if (!hadTab) target.removeAttribute('tabindex');
          else if (prevTab !== null) target.setAttribute('tabindex', prevTab);
        }, 1200);
      }, { passive: true });
    });
  }

  /* --------------------------
     Hero parallax (rAF) — gentle transform + opacity
     -------------------------- */
  function initHeroParallax() {
    const hero = $('.hero');
    if (!hero) return;
    hero.style.willChange = 'transform, opacity';

    let latestY = window.scrollY || 0;
    let ticking = false;

    function update() {
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const scrolled = latestY;
      if (scrolled < vh) {
        const translateY = Math.min(80, Math.round(scrolled * 0.25));
        const opacity = Math.max(0.5, 1 - (scrolled / (vh * 1.6)));
        hero.style.transform = `translateY(${translateY}px)`;
        hero.style.opacity = String(opacity);
      } else {
        hero.style.transform = '';
        hero.style.opacity = '';
      }
      ticking = false;
    }

    function onScroll() {
      latestY = window.scrollY || window.pageYOffset || 0;
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => { if (!ticking) requestAnimationFrame(update); }, { passive: true });
    requestAnimationFrame(update);
  }

  /* --------------------------
     Countdown (accessible) — updates #sticky-countdown
     -------------------------- */
  function initCountdown() {
    const el = document.getElementById('sticky-countdown');
    if (!el) return;

    // create hidden live region for screen readers
    let live = document.getElementById('sticky-countdown-live');
    if (!live) {
      live = document.createElement('div');
      live.id = 'sticky-countdown-live';
      live.setAttribute('aria-live', 'polite');
      live.setAttribute('aria-atomic', 'true');
      live.style.position = 'absolute';
      live.style.left = '-9999px';
      live.style.width = '1px';
      live.style.height = '1px';
      live.style.overflow = 'hidden';
      document.body.appendChild(live);
    }

    const OFFER_ENDS_AT = (typeof window.OFFER_ENDS_AT === 'string') ? window.OFFER_ENDS_AT.trim() : '';
    let target = null;
    if (OFFER_ENDS_AT) {
      const parsed = new Date(OFFER_ENDS_AT);
      if (!isNaN(parsed)) target = parsed;
    }
    if (!target) {
      target = new Date();
target.setMinutes(target.getMinutes() + 15);
; // default 12 hours
    }

function formatTime(ms) {
  const totalSecs = Math.floor(ms / 1000);
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;

  const mm = String(mins).padStart(2, '0');
  const ss = String(secs).padStart(2, '0');

  return `${mm}:${ss} mins left`;
}

    let intervalId = null;
    function tick() {
      const now = new Date();
      const diff = Math.max(0, target - now);
      el.textContent = formatTime(diff);
      live.textContent = `Offer ends in ${diff > 0 ? formatTime(diff) : 'now'}`;
      if (diff <= 0) {
        stop();
        window.dispatchEvent(new CustomEvent('offer-ended', { detail: { target } }));
      }
    }
    function start() {
      if (intervalId) return;
      tick();
      intervalId = setInterval(tick, 1000);
    }
    function stop() {
      if (intervalId) clearInterval(intervalId);
      intervalId = null;
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop();
      else start();
    });

    if (document.hidden) {
      document.addEventListener('visibilitychange', function onv() {
        if (!document.hidden) {
          document.removeEventListener('visibilitychange', onv);
          start();
        }
      });
    } else start();
  }

  /* --------------------------
     Cards reveal (staggered) — uses data-delay attribute
     -------------------------- */
  function initCardReveal() {
    const cards = $$('.card');
    if (!cards.length) return;

    cards.forEach(card => {
      const d = card.getAttribute('data-delay') || '0';
      card.style.setProperty('--delay', `${d}ms`);
    });

    if (!('IntersectionObserver' in window)) {
      cards.forEach(c => c.classList.add('visible'));
      return;
    }

    const cardObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        // small extra micro-stagger so they pop in sequence visually
        setTimeout(() => el.classList.add('visible'), 20);
        try { obs.unobserve(el); } catch (e) { /* ignore */ }
      });
    }, { threshold: 0.12 });

    cards.forEach(c => cardObserver.observe(c));
  }

  /* --------------------------
     Carousel + thumbnails + modal
     -------------------------- */
  function initCarousel() {
    const carousel = $('.carousel');
    const track = $('.carousel-track');
    if (!carousel || !track) return;

    const slides = $$('.slide', track);
    if (!slides.length) return;

    const prevBtn = $('.nav.prev', carousel);
    const nextBtn = $('.nav.next', carousel);
    const dots = $$('.dot', carousel);
    const thumbs = $$('.thumbs img', carousel);
    const modal = $('.modal');
    const modalImg = $('.modal-img', modal || document);
    const modalClose = $('.modal-close', modal || document);
    const modalPrev = $('.modal-prev', modal || document);
    const modalNext = $('.modal-next', modal || document);

    // ensure slides have correct data-index if missing
    slides.forEach((s, i) => {
      if (!s.hasAttribute('data-index')) s.setAttribute('data-index', String(i));
      else s.setAttribute('data-index', String(i)); // normalize duplicates
    });

    // if dots exist but not matching slide count, try to create / fix them
    if (!dots.length) {
      const dotsWrap = document.createElement('div');
      dotsWrap.className = 'dots';
      dotsWrap.setAttribute('role', 'tablist');
      slides.forEach((_, i) => {
        const b = document.createElement('button');
        b.className = 'dot';
        b.setAttribute('role', 'tab');
        b.dataset.index = String(i);
        if (i === 0) b.setAttribute('aria-selected', 'true');
        else b.setAttribute('aria-selected', 'false');
        dotsWrap.appendChild(b);
      });
      carousel.appendChild(dotsWrap);
    }

    // re-query dots/ thumbs after possible creation
    const dotsList = $$('.dot', carousel);
    const thumbsList = $$('.thumbs img', carousel);

    let current = 0;
    let autoplay = true;
    const autoplayInterval = 4000;
    let timer = null;

  function updateUI() {
  const slide = slides[current];
  if (slide) {
    const left = (slide.offsetLeft + slide.offsetWidth / 2) - (track.clientWidth / 2);
    // use smooth for interactions, but allow 'auto' for initial paint by checking a flag
    track.scrollTo({ left, behavior: 'smooth' });
  }

  dotsList.forEach((d, i) => {
    d.setAttribute('aria-selected', i === current ? 'true' : 'false');
    d.classList.toggle('active', i === current);
  });

  thumbsList.forEach((t, i) => {
    t.classList.toggle('active', i === current);
  });
}


    function goto(index) {
      if (!slides.length) return;
      current = ((index % slides.length) + slides.length) % slides.length;
      updateUI();
    }

    // safe attachers
    prevBtn?.addEventListener('click', () => { goto(current - 1); pauseAutoplay(); });
    nextBtn?.addEventListener('click', () => { goto(current + 1); pauseAutoplay(); });

    dotsList.forEach(d => d.addEventListener('click', (e) => {
      const idx = Number(e.currentTarget.dataset.index || 0);
      goto(idx);
      pauseAutoplay();
    }));

    // keyboard left/right when track focused
    track.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { goto(current - 1); pauseAutoplay(); }
      if (e.key === 'ArrowRight') { goto(current + 1); pauseAutoplay(); }
    });

    function startAutoplay() {
      if (!autoplay || timer) return;
      timer = setInterval(() => goto(current + 1), autoplayInterval);
    }
    function pauseAutoplay() {
      autoplay = false;
      if (timer) clearInterval(timer);
      timer = null;
    }

    // pause on hover/focus
    carousel.addEventListener('mouseenter', () => { if (timer) clearInterval(timer); });
    carousel.addEventListener('mouseleave', () => { if (autoplay) startAutoplay(); });
    track.addEventListener('focusin', () => { if (timer) clearInterval(timer); });
    track.addEventListener('focusout', () => { if (autoplay) startAutoplay(); });

    // thumbs click
    thumbsList.forEach((t, i) => t.addEventListener('click', () => { goto(i); pauseAutoplay(); }));

    // click slide image to open modal
    slides.forEach((s, i) => {
      const img = $('img', s);
      if (!img) return;
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', () => openModal(i));
    });

    // modal helpers
    function openModal(index) {
      if (!modal) return;
      const slide = slides[index];
      if (!slide) return;
      const img = $('img', slide);
      if (!img) return;
      const full = img.dataset.full || img.currentSrc || img.src;
      modalImg && (modalImg.src = full);
      modalImg && (modalImg.alt = img.alt || '');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      modal.dataset.index = String(index);
      // ensure visible
      modal.style.display = 'flex';
      modal.focus?.();
    }
    function closeModal() {
      if (!modal) return;
      modal.setAttribute('aria-hidden', 'true');
      modal.style.display = 'none';
      if (modalImg) modalImg.src = '';
      document.body.style.overflow = '';
      delete modal.dataset.index;
    }

    modalClose?.addEventListener('click', closeModal);
    modal?.addEventListener('click', (ev) => { if (ev.target === modal) closeModal(); });
    modalPrev?.addEventListener('click', () => {
      const idx = Number(modal?.dataset.index || 0);
      openModal((idx - 1 + slides.length) % slides.length);
    });
    modalNext?.addEventListener('click', () => {
      const idx = Number(modal?.dataset.index || 0);
      openModal((idx + 1) % slides.length);
    });

    document.addEventListener('keydown', (e) => {
      if (!modal || modal.getAttribute('aria-hidden') !== 'false') return;
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowLeft') modalPrev?.click();
      if (e.key === 'ArrowRight') modalNext?.click();
    });

    // touch swipe on track (simple)
    (function addSwipe(node) {
      if (!node) return;
      let startX = 0, startTime = 0;
      node.addEventListener('touchstart', e => { startX = e.touches[0].pageX; startTime = Date.now(); }, { passive: true });
      node.addEventListener('touchend', e => {
        const dx = e.changedTouches[0].pageX - startX;
        const dt = Date.now() - startTime;
        if (dt < 600 && Math.abs(dx) > 40) {
          if (dx < 0) { goto(current + 1); pauseAutoplay(); } else { goto(current - 1); pauseAutoplay(); }
        }
      }, { passive: true });
    })(track);

    // update current index when user scrolls/drag
    let scrollTimeout = null;
    track.addEventListener('scroll', () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const trackRect = track.getBoundingClientRect();
        const centerX = trackRect.left + trackRect.width / 2;
        let best = 0, bestDist = Infinity;
        slides.forEach((s, idx) => {
          const r = s.getBoundingClientRect();
          const c = r.left + r.width / 2;
          const dist = Math.abs(centerX - c);
          if (dist < bestDist) { bestDist = dist; best = idx; }
        });
        current = best;
        updateUI();
      }, 80);
    }, { passive: true });

    // init state
    goto(0);
    startAutoplay();
  } // initCarousel

  /* --------------------------
     Sticky register click example
     -------------------------- */
  function initStickyRegister() {
    const reg = document.getElementById('sticky-register');
    if (!reg) return;
    reg.addEventListener('click', (e) => {
      // optionally focus first input in a register form
      const first = document.querySelector('form input, form button, #register-form input, #register-form button');
      if (first) {
        first.focus({ preventScroll: true });
        return;
      }
      // fallback: if reg has data-href attribute navigate
      const href = reg.getAttribute('data-href') || reg.closest('a')?.getAttribute('href') || null;
      if (href && href !== '#') window.location.href = href;
    });
  }

  /* --------------------------
     DOMContentLoaded init
     -------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    initInViewObserver();
    initSmoothAnchors();
    initHeroParallax();
    initCountdown();
    initCardReveal();
    initCarousel();
    initStickyRegister();
  });

})(); // IIFE end


// Trainer Metric Counter + Reveal
document.addEventListener("DOMContentLoaded", () => {
  const metrics = document.querySelectorAll(".metric");

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const metric = entry.target;
        metric.classList.add("visible");

        const numEl = metric.querySelector(".num");
        const target = +metric.dataset.target;
        let count = 0;

        const step = Math.ceil(target / 80);

        const update = () => {
          count += step;
          if (count >= target) {
            numEl.textContent = target >= 100000 
              ? "5 Lakh+" 
              : target + "+";
          } else {
            numEl.textContent = count;
            requestAnimationFrame(update);
          }
        };

        update();
        obs.unobserve(metric);
      }
    });
  }, { threshold: 0.3 });

  metrics.forEach(m => obs.observe(m));
});

// Bonus Section reveal (safe + accessible)
// Call after DOMContentLoaded (this file assumes it's loaded inside your main script or executed on DOM ready)
(function initBonusSectionReveal() {
  const section = document.getElementById('bonus-section');
  if (!section) return;

  // reveal the whole section header when it enters view
  if ('IntersectionObserver' in window) {
    const secObs = new IntersectionObserver((entries, obs) => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        section.classList.add('animate-in'); // triggers header animation
        try { obs.unobserve(en.target); } catch (e) {}
      });
    }, { threshold: 0.12 });
    secObs.observe(section);
  } else {
    // fallback
    section.classList.add('animate-in');
  }

  // cards stagger reveal
  const cards = Array.from(section.querySelectorAll('.bonus-card'));
  if (!cards.length) return;

  // apply CSS var from data-delay for transition-delay
  cards.forEach(c => {
    const d = c.getAttribute('data-delay') || '0';
    c.style.setProperty('--delay', `${d}ms`);
  });

  if ('IntersectionObserver' in window) {
    const cardObs = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        // small timeout so staggered values are visually obvious
        setTimeout(() => el.classList.add('in-view'), 20);
        try { obs.unobserve(el); } catch (e) {}
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -80px 0px' });

    cards.forEach(c => cardObs.observe(c));
  } else {
    // fallback: reveal all
    cards.forEach(c => c.classList.add('in-view'));
  }
})();

/* Reviews carousel — lightweight, accessible, autoplay + keyboard + swipe */
(function () {
  'use strict';
  const track = document.querySelector('.rc-track');
  if (!track) return;

  const slides = Array.from(track.querySelectorAll('.rc-slide'));
  const prev = document.querySelector('.rc-prev');
  const next = document.querySelector('.rc-next');
  const dots = Array.from(document.querySelectorAll('.rc-dot'));

  let current = 0;
  let autoplay = true;
  let timer = null;
  const interval = 4500;

  function setActive(idx, options = {}) {
    slides.forEach((s, i) => s.classList.toggle('active', i === idx));
    dots.forEach((d, i) => d.setAttribute('aria-selected', String(i === idx)));
    current = idx;
    if (options.scroll !== false) {
      // center chosen slide in the track
      const slide = slides[idx];
      if (slide) {
        const left = (slide.offsetLeft + slide.offsetWidth / 2) - (track.clientWidth / 2);
        track.scrollTo({ left, behavior: (options.instant ? 'auto' : 'smooth') });
      }
    }
  }

  function goto(idx) {
    const n = ((idx % slides.length) + slides.length) % slides.length;
    setActive(n);
  }

  // event listeners
  prev?.addEventListener('click', () => { goto(current - 1); stopAutoplay(); });
  next?.addEventListener('click', () => { goto(current + 1); stopAutoplay(); });

  dots.forEach(d => {
    d.addEventListener('click', (e) => {
      const idx = Number(e.currentTarget.dataset.index || 0);
      goto(idx);
      stopAutoplay();
    });
  });

  // keyboard support when track focused
  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { goto(current - 1); stopAutoplay(); }
    if (e.key === 'ArrowRight') { goto(current + 1); stopAutoplay(); }
  });

  // touch swipe
  (function addSwipe(node) {
    if (!node) return;
    let sx = 0, st = 0;
    node.addEventListener('touchstart', e => { sx = e.touches[0].pageX; st = Date.now(); }, { passive: true });
    node.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].pageX - sx;
      const dt = Date.now() - st;
      if (dt < 600 && Math.abs(dx) > 40) {
        if (dx < 0) goto(current + 1);
        else goto(current - 1);
        stopAutoplay();
      }
    }, { passive: true });
  })(track);

  // autoplay
  function startAutoplay() {
    if (!autoplay || timer) return;
    timer = setInterval(() => goto(current + 1), interval);
  }
  function stopAutoplay() {
    autoplay = false;
    if (timer) { clearInterval(timer); timer = null; }
  }

  // pause on hover or focus
  const carousel = document.querySelector('.reviews-carousel');
  carousel?.addEventListener('mouseenter', () => { if (timer) clearInterval(timer); });
  carousel?.addEventListener('mouseleave', () => { if (autoplay) startAutoplay(); });
  track.addEventListener('focusin', () => { if (timer) clearInterval(timer); });
  track.addEventListener('focusout', () => { if (autoplay) startAutoplay(); });

  // set initial active (do not smooth-scroll on first paint)
  setActive(0, { instant: true, scroll: true });

  // start autoplay after a short delay (so page load won't move viewport)
  setTimeout(() => { startAutoplay(); }, 500);

  // make dots accessible: add index if not present
  dots.forEach((d, i) => { if (!d.dataset.index) d.dataset.index = i; });

  // expose goto for debug if needed
  window.reviewsGoto = goto;
})();
