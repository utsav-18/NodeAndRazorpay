  document.getElementById("primaryCTA").onclick = () => {
    window.location.href = "/payment/checkout";
  };
  

  // reveal pieces with stagger
  function revealAll(){
    document.querySelectorAll('.fade').forEach((el,i)=>{
      const d = parseInt(getComputedStyle(el).getPropertyValue('--d')) || (i*90);
      setTimeout(()=> el.classList.add('visible'), d);
    });
    setTimeout(()=>{ document.getElementById('ts1').classList.add('show'); setTimeout(()=> document.getElementById('ts2').classList.add('show'), 120); }, 120);
  }
  revealAll();

  // trainer card entry after device revealed
  setTimeout(()=> {
    const t = document.getElementById('trainerCard');
    if(t){ t.style.opacity = 1; t.style.transform = 'translateY(-6px)'; }
  }, 700);

  // countdown 15 min
  let seconds = 15 * 60;
  const cdEl = document.getElementById('countdown');
  function tick(){
    if(seconds <= 0){ cdEl.textContent = 'Offer ended'; return; }
    const m = Math.floor(seconds/60); const s = seconds % 60;
    cdEl.textContent = `${m}:${String(s).padStart(2,'0')} mins left`; seconds--;
  }
  tick(); setInterval(tick, 1000);

  // device float
  const device = document.getElementById('device');
  let t = 0;
  function floatIt(){ t += 0.012; const y = Math.sin(t) * 6; if(device) device.style.transform = `translateY(${y}px)`; requestAnimationFrame(floatIt); }
  floatIt();

  // trainer follows mouse
  const trainer = document.getElementById('trainerCard');
  document.addEventListener('mousemove', (e)=>{
    const cx = window.innerWidth/2; const cy = window.innerHeight/2;
    const dx = (e.clientX - cx)/cx, dy = (e.clientY - cy)/cy;
    if(trainer) trainer.style.transform = `translate(${dx * 8}px, ${dy * 6}px)`;
  });

  // reduce-motion
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  if(mq.matches){
    document.querySelectorAll('*').forEach(el=> el.style.animation = 'none');
  }

{

  // wj3-dashboards.js — Clean version (NO DOTS + full-page scroll control)
(function () {
  const $id = (id) => document.getElementById(id);

  function onReady(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  onReady(() => {
    const section = $id("wj3_section");
    const carousel = $id("wj3_carousel");
    if (!section || !carousel) return;

    const slides = Array.from(carousel.querySelectorAll(".wj3_card"));
    if (!slides.length) return;

    // arrows only (NO DOTS)
    const prevBtn = $id("wj3_prev");
    const nextBtn = $id("wj3_next");

    /* ----------------------------
       IMAGE LAZY LOAD
    ---------------------------- */
    slides.forEach((s) => {
      const imgB = s.querySelector(".wj3_before");
      const imgA = s.querySelector(".wj3_after");
      if (s.dataset.before) imgB.src = s.dataset.before;
      if (s.dataset.after) imgA.src = s.dataset.after;
    });

    /* ----------------------------
       DIMENSIONS
    ---------------------------- */
    function computeDims() {
      const gap = parseFloat(getComputedStyle(carousel).gap || 28);
      const widths = slides.map((s) => s.offsetWidth);
      const totalWidth = widths.reduce((a, b) => a + b, 0) + gap * (slides.length - 1) + 56;
      const viewportW = window.innerWidth;
      return { widths, gap, totalWidth, viewportW };
    }

    let dims = computeDims();

    window.addEventListener("resize", () => {
      dims = computeDims();
    });

    /* ----------------------------
       TRANSLATE HELPERS
    ---------------------------- */
    function currentTranslate() {
      const m = (carousel.style.transform || "").match(/translate3d\((-?\d+)/);
      return m ? parseFloat(m[1]) : 0;
    }

    function maxTranslate() {
      return Math.max(0, dims.totalWidth - dims.viewportW);
    }

    function applyTransform(tx, smooth = false) {
      const clamped = Math.max(-maxTranslate(), Math.min(0, tx));

      if (smooth) {
        carousel.style.transition = "transform 500ms cubic-bezier(.2,.9,.2,1)";
        requestAnimationFrame(() => {
          carousel.style.transform = `translate3d(${clamped}px,0,0)`;
        });
        setTimeout(() => {
          carousel.style.transition = "";
        }, 520);
      } else {
        carousel.style.transform = `translate3d(${clamped}px,0,0)`;
      }
    }

    /* ----------------------------
       SCROLL-DRIVEN ANIMATION
       (Full page scroll controls horizontal)
    ---------------------------- */
    function updateFromScroll() {
      dims = computeDims();

      const rect = section.getBoundingClientRect();
      const secTop = rect.top + window.scrollY;
      const secHeight = rect.height;

      const scrollY = window.scrollY + window.innerHeight * 0.5;
      const start = secTop - window.innerHeight;
      const end = secTop + secHeight;

      let progress = (scrollY - start) / (end - start);
      progress = Math.max(0, Math.min(1, progress));

      const tx = -(maxTranslate() * progress);
      applyTransform(tx);
    }

    // smooth scroll listener
    let ticking = false;
    window.addEventListener("scroll", () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateFromScroll();
          ticking = false;
        });
        ticking = true;
      }
    });

    // initial set
    updateFromScroll();

    /* ----------------------------
       MANUAL BUTTON NAVIGATION
    ---------------------------- */
    function goToSlide(index) {
      index = Math.max(0, Math.min(slides.length - 1, index));
      let cum = 0;
      for (let i = 0; i < index; i++) {
        cum += dims.widths[i] + dims.gap;
      }
      applyTransform(-cum, true);
    }

    // prev
    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        const cur = currentTranslate();
        let idx = 0;
        let cum = 0;

        for (let i = 0; i < slides.length; i++) {
          if (Math.abs(cur) < cum + dims.widths[i]) {
            idx = i;
            break;
          }
          cum += dims.widths[i] + dims.gap;
        }

        goToSlide(idx - 1);
      });
    }

    // next
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        const cur = currentTranslate();
        let idx = slides.length - 1;
        let cum = 0;

        for (let i = 0; i < slides.length; i++) {
          if (Math.abs(cur) < cum + dims.widths[i]) {
            idx = i;
            break;
          }
          cum += dims.widths[i] + dims.gap;
        }

        goToSlide(idx + 1);
      });
    }

  });
})();


}
// u_cta_main.js — updated: fresh timer, footer-hide, reduced-motion, cleanup, reset helper
(function () {
  const DEFAULT_MINUTES = 15;
  const CTA_WRAPPER_ID = "u_cta_wrapper";
  const TIMER_TEXT_ID = "u_cta_timer_text";
  const REGISTER_ID = "u_cta_button";
  const PRICE_ID = "u_cta_price";

  // safe DOM access
  function $id(id) { return document.getElementById(id); }

  const wrapper = $id(CTA_WRAPPER_ID);
  const timerEl = $id(TIMER_TEXT_ID);
  const registerBtn = $id(REGISTER_ID);
  const priceEl = $id(PRICE_ID);

  if (!wrapper || !timerEl || !registerBtn) return;

  // prefer-reduced-motion check
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // TIMER state
  let secondsLeft = DEFAULT_MINUTES * 60;
  let intervalId = null;
  let expired = false;

  function formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, '0')} mins left`;
  }

  function stopInterval() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  function tickOnce() {
    if (expired) return;
    if (secondsLeft <= 0) {
      timerEl.textContent = "Offer ended";
      registerBtn.disabled = true;
      registerBtn.style.opacity = 0.6;
      expired = true;
      stopInterval();
      return;
    }
    timerEl.textContent = formatTime(secondsLeft);
    secondsLeft--;
  }

  function startTimer() {
    // reset any previous
    stopInterval();
    expired = false;
    secondsLeft = DEFAULT_MINUTES * 60;
    // immediate paint
    tickOnce();
    // if reduced motion, we still run timer text but avoid animations elsewhere
    intervalId = setInterval(tickOnce, 1000);
  }

  // start fresh on load
  startTimer();

  // click behavior: proxy to primaryCTA if exists else navigate
  registerBtn.addEventListener('click', (e) => {
    // micro animation if allowed
    if (!prefersReduced) {
      try {
        registerBtn.animate(
          [{ transform: 'translateY(0)' }, { transform: 'translateY(-6px)' }, { transform: 'translateY(0)' }],
          { duration: 300, easing: 'cubic-bezier(.2,.9,.2,1)' }
        );
      } catch (err) { /* ignore animation errors */ }
    }

    const primary = $id('primaryCTA');
    if (primary) {
      primary.click();
      return;
    }
    window.location.href = '/payment/checkout';
  });

  // Hide CTA when footer arrives — IntersectionObserver
  (function setupFooterObserver() {
    const footer = document.querySelector('footer');
    if (!footer) return;

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // hide
          wrapper.style.opacity = '0';
          wrapper.style.transform = 'translateY(40px)';
          wrapper.style.pointerEvents = 'none';
        } else {
          // show
          wrapper.style.opacity = '1';
          wrapper.style.transform = 'translateY(0)';
          wrapper.style.pointerEvents = 'auto';
        }
      });
    }, { threshold: 0.08 });

    obs.observe(footer);
    // no need to disconnect — page lifetime is fine; if you dynamically remove footer, handle accordingly
  })();

  // expose helper on window for dev / other scripts: reset timer
  window.u_cta = window.u_cta || {};
  window.u_cta.resetTimer = function (minutes) {
    const m = Number(minutes) || DEFAULT_MINUTES;
    secondsLeft = Math.max(1, Math.floor(m * 60));
    expired = false;
    registerBtn.disabled = false;
    registerBtn.style.opacity = '';
    tickOnce();
    if (!intervalId) intervalId = setInterval(tickOnce, 1000);
  };

  // Clean up on unload (good practice)
  window.addEventListener('beforeunload', () => {
    stopInterval();
  });
})();


{

  // trn_section_long.js  (defer this script)
(function () {
  const section = document.getElementById('trn_section');
  if (!section) return;

  const inner = section.querySelector('.trn_inner');
  const counters = Array.from(section.querySelectorAll('.trn_stat_num'));
  let animated = false;

  // animate number from 0 -> target
  function animateCount(el, target, duration = 1400) {
    target = Number(target);
    if (!target || target <= 0) { el.textContent = target; return; }
    const start = 0;
    const startTime = performance.now();
    function step(now) {
      const t = Math.min(1, (now - startTime) / duration);
      // easeOutQuad
      const ease = t*(2-t);
      const current = Math.round(start + (target - start) * ease);
      // append plus for >=1000
      el.textContent = (target >= 1000 ? (current + '+') : current);
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = (target >= 1000 ? (target + '+') : String(target));
    }
    requestAnimationFrame(step);
  }

  // reveal + animate when visible
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      if (!animated) {
        inner.classList.add('trn_reveal');
        counters.forEach(c => {
          const target = c.dataset.target || c.getAttribute('data-target') || c.textContent;
          animateCount(c, Number(target) || 0, 1400);
        });
        animated = true;
      }
      obs.unobserve(section);
    });
  }, { threshold: 0.25 });

  io.observe(section);

  // optional: small parallax on mouse move for trainer image (desktop)
  const img = section.querySelector('.trn_image');
  if (img && window.innerWidth > 768) {
    section.addEventListener('mousemove', (e) => {
      const r = section.getBoundingClientRect();
      const cx = r.left + r.width/2;
      const cy = r.top + r.height/2;
      const dx = (e.clientX - cx) / r.width;
      const dy = (e.clientY - cy) / r.height;
      img.style.transform = `translate(${dx * 6}px, ${dy * 6}px) scale(1.02)`;
    });
    section.addEventListener('mouseleave', () => {
      img.style.transform = `translate(0,0) scale(1)`;
    });
  }
})();


}

{

  // trn_section.js  (defer this script)
(function () {
  const section = document.getElementById('trn_section');
  if (!section) return;

  const inner = section.querySelector('.trn_inner');
  const counters = Array.from(section.querySelectorAll('.trn_stat_num'));

  // animate number from 0 -> target
  function animateCount(el, target, duration = 1200) {
    target = Number(target);
    if (!target || target <= 0) { el.textContent = target; return; }
    const start = 0;
    const startTime = performance.now();
    function step(now) {
      const t = Math.min(1, (now - startTime) / duration);
      const ease = t < 0.5 ? 2*t*t : -1 + (4 - 2*t)*t; // smooth-ish ease
      const current = Math.round(start + (target - start) * ease);
      el.textContent = current + (target >= 1000 ? '+' : '');
      if (t < 1) requestAnimationFrame(step);
      else { el.textContent = (target >= 1000 ? (target + '+') : String(target)); }
    }
    requestAnimationFrame(step);
  }

  // intersection observer to trigger animation once
  const obs = new IntersectionObserver((entries, o) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      // reveal card lift
      inner.classList.add('trn_reveal');
      // animate counters
      counters.forEach(c => {
        const target = c.dataset.target || c.getAttribute('data-target') || c.textContent;
        animateCount(c, Number(target) || 0, 1300);
      });
      o.unobserve(section);
    });
  }, { threshold: 0.28 });

  obs.observe(section);

})();


}


{

(function () {
  const faqList = document.getElementById('faqList');
  if (!faqList) return;
  const items = Array.from(faqList.querySelectorAll('.faq-item'));

  function animateHeight(el, from, to, duration = 240) {
    if (from === to) { el.style.height = to + 'px'; return Promise.resolve(); }
    const startTime = performance.now();
    return new Promise(resolve => {
      function frame(now) {
        const t = Math.min(1, (now - startTime) / duration);
        const eased = t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2; // easeInOutCubic
        const val = Math.round(from + (to - from) * eased);
        el.style.height = val + 'px';
        if (t < 1) requestAnimationFrame(frame);
        else { el.style.height = to + 'px'; resolve(); }
      }
      requestAnimationFrame(frame);
    });
  }

  function closeItem(item) {
    const btn = item.querySelector('.faq-q');
    const ans = item.querySelector('.faq-a');
    if (!btn || !ans || !item.classList.contains('is-open')) return;
    const startH = Math.round(ans.getBoundingClientRect().height);
    ans.style.height = startH + 'px';
    animateHeight(ans, startH, 0, 200).then(() => {
      ans.style.opacity = '0';
      ans.style.height = '0px';
    });
    item.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
    const chev = btn.querySelector('.chev'); if (chev) chev.textContent = '＋';
  }

  function openItem(item) {
    const btn = item.querySelector('.faq-q');
    const ans = item.querySelector('.faq-a');
    if (!btn || !ans || item.classList.contains('is-open')) return;
    // close others
    items.forEach(it => { if (it !== item) closeItem(it); });

    // measure natural height
    ans.style.opacity = '0';
    ans.style.height = 'auto';
    const natural = Math.round(ans.getBoundingClientRect().height);
    ans.style.height = '0px';

    item.classList.add('is-open');
    btn.setAttribute('aria-expanded', 'true');
    const chev = btn.querySelector('.chev'); if (chev) chev.textContent = '−';

    requestAnimationFrame(() => {
      ans.style.opacity = '1';
      animateHeight(ans, 0, natural, 260).then(() => { ans.style.height = 'auto'; });
      setTimeout(() => { item.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, 260);
    });
  }

  // initialize states & attach listeners
  items.forEach(item => {
    const btn = item.querySelector('.faq-q');
    const ans = item.querySelector('.faq-a');
    const chev = btn.querySelector('.chev');
    if (!btn || !ans) return;

    if (item.classList.contains('is-open')) {
      ans.style.height = 'auto'; ans.style.opacity = '1'; btn.setAttribute('aria-expanded', 'true');
      if (chev) chev.textContent = '−';
    } else {
      ans.style.height = '0px'; ans.style.opacity = '0'; btn.setAttribute('aria-expanded', 'false');
      if (chev) chev.textContent = '＋';
    }

    btn.addEventListener('click', () => {
      if (item.classList.contains('is-open')) closeItem(item);
      else openItem(item);
    });

    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btn.click(); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); const n = item.nextElementSibling; if (n) n.querySelector('.faq-q')?.focus(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); const p = item.previousElementSibling; if (p) p.querySelector('.faq-q')?.focus(); }
    });

    // responsive: if open and resized, keep answer height auto shortly after resize
    let rt;
    window.addEventListener('resize', () => {
      if (!item.classList.contains('is-open')) return;
      clearTimeout(rt);
      ans.style.height = 'auto';
      rt = setTimeout(() => { ans.style.height = 'auto'; }, 160);
    });
  });

  // click outside to close all (keeps UI tidy)
  document.addEventListener('click', (e) => {
    if (!faqList.contains(e.target)) items.forEach(i => closeItem(i));
  });
})();
  
}


/* =================== STX TESTIMONIAL SLIDER =================== */
/* Put this at the end of the page (after HTML) or load on DOMContentLoaded */
/* ================== tst_eco_testimonials (pointer-safe, mobile-fixed) ================== */
(function () {
  const stage = document.getElementById('tst_eco_stage');
  const track = document.getElementById('tst_eco_track');
  const dotsBox = document.getElementById('tst_eco_dots');
  const prevBtn = document.getElementById('tst_eco_prev');
  const nextBtn = document.getElementById('tst_eco_next');

  if (!stage || !track || !dotsBox) return;

  const cards = Array.from(track.querySelectorAll('.tst_eco_card'));
  const total = cards.length;
  let index = 0;
  const AUTOPLAY = true;
  const DELAY = 4200;
  let autoplayTimer = null;

  // pointer drag state
  let pointerId = null;
  let startX = 0;
  let startTranslate = 0;
  let isDragging = false;

  // build dots
  function buildDots() {
    dotsBox.innerHTML = '';
    for (let i = 0; i < total; i++) {
      const d = document.createElement('button');
      d.className = 'tst_eco_dot';
      d.setAttribute('aria-label', `Go to slide ${i + 1}`);
      d.dataset.idx = i;
      if (i === 0) d.classList.add('tst_eco_active');
      d.addEventListener('click', () => goTo(i, true));
      dotsBox.appendChild(d);
    }
  }

  // compute translation to center card at index
  function computeTranslateForIndex(i) {
    const stageW = stage.clientWidth;
    const card = cards[i];
    const cardRect = card.getBoundingClientRect();
    const cardLeft = card.offsetLeft; // relative to track
    const cardW = card.offsetWidth;
    const desiredLeft = Math.max((stageW - cardW) / 2, 0);
    return -(cardLeft - desiredLeft);
  }

  // get current translateX (px)
  function getCurrentTranslate() {
    const st = getComputedStyle(track).transform;
    if (st && st !== 'none') {
      const m = st.match(/matrix\(([^)]+)\)/);
      if (m) {
        const vals = m[1].split(',').map(s => parseFloat(s));
        return vals[4] || 0;
      }
      const m3 = st.match(/matrix3d\(([^)]+)\)/);
      if (m3) {
        const vals = m3[1].split(',').map(s => parseFloat(s));
        return vals[12] || 0;
      }
    }
    return 0;
  }

  // apply transform and active classes
  function applyTranslate(tx, animate = true) {
    track.style.transition = animate ? 'transform 600ms cubic-bezier(.22,.9,.2,1)' : 'none';
    track.style.transform = `translate3d(${tx}px,0,0)`;
  }

  function updateUI(animate = true) {
    const tx = computeTranslateForIndex(index);
    applyTranslate(tx, animate);
    cards.forEach((c, i) => c.classList.toggle('is-active', i === index));
    Array.from(dotsBox.children).forEach((d, i) => d.classList.toggle('tst_eco_active', i === index));
  }

  function goTo(i, user = false) {
    index = ((i % total) + total) % total; // wrap safely
    updateUI(true);
    if (user) restartAutoplay();
  }

  // autoplay controls
  function startAutoplay() { stopAutoplay(); if (!AUTOPLAY) return; autoplayTimer = setInterval(() => goTo(index + 1), DELAY); }
  function stopAutoplay() { if (autoplayTimer) { clearInterval(autoplayTimer); autoplayTimer = null; } }
  function restartAutoplay() { stopAutoplay(); startAutoplay(); }

  // pointer handlers (pointer events)
  function onPointerDown(e) {
    // only primary pointer
    if (pointerId !== null) return;
    pointerId = e.pointerId;
    isDragging = true;
    startX = e.clientX;
    startTranslate = getCurrentTranslate();
    track.style.transition = 'none';
    stage.setPointerCapture(pointerId);
    stopAutoplay();
  }

  function onPointerMove(e) {
    if (!isDragging || e.pointerId !== pointerId) return;
    const dx = e.clientX - startX;
    // live dragging
    applyTranslate(startTranslate + dx, false);
  }

  function onPointerUp(e) {
    if (!isDragging || e.pointerId !== pointerId) return;
    isDragging = false;
    stage.releasePointerCapture(pointerId);
    pointerId = null;

    const dx = e.clientX - startX;
    // threshold to change slide
    const threshold = Math.min(stage.clientWidth * 0.12, 80);
    if (dx < -threshold) goTo(index + 1, true);
    else if (dx > threshold) goTo(index - 1, true);
    else updateUI(true); // snap back

    restartAutoplay();
  }

  // keyboard
  function onKey(e) {
    if (e.key === 'ArrowLeft') { goTo(index - 1, true); }
    if (e.key === 'ArrowRight') { goTo(index + 1, true); }
  }

  // safe init after layout
  function init() {
    buildDots();
    // reveal cards with stagger using requestAnimationFrame
    cards.forEach((c, i) => {
      requestAnimationFrame(() => {
        setTimeout(() => c.classList.add('tst_eco_visible'), i * 90);
      });
    });

    // calculate and center
    setTimeout(() => updateUI(false), 80);
    startAutoplay();
  }

  // attach events
  prevBtn && prevBtn.addEventListener('click', () => goTo(index - 1, true));
  nextBtn && nextBtn.addEventListener('click', () => goTo(index + 1, true));

  // pointer events on stage (support mouse+touch)
  stage.addEventListener('pointerdown', onPointerDown);
  stage.addEventListener('pointermove', onPointerMove);
  stage.addEventListener('pointerup', onPointerUp);
  stage.addEventListener('pointercancel', onPointerUp);
  stage.addEventListener('pointerleave', onPointerUp);

  // pause on hover/focus
  stage.addEventListener('mouseenter', stopAutoplay);
  stage.addEventListener('mouseleave', () => { if (AUTOPLAY) startAutoplay(); });
  stage.addEventListener('focusin', stopAutoplay);
  stage.addEventListener('focusout', () => { if (AUTOPLAY) startAutoplay(); });

  document.addEventListener('keydown', onKey);

  // responsive: recalc center on resize
  let resizeTO = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTO);
    resizeTO = setTimeout(() => updateUI(false), 120);
  });

  // wait for images to load (so widths are stable)
  let images = track.querySelectorAll('img');
  let loaded = 0;
  if (images.length === 0) init();
  else {
    images.forEach(img => {
      if (img.complete) { loaded++; if (loaded === images.length) init(); }
      else img.addEventListener('load', () => { loaded++; if (loaded === images.length) init(); });
      img.addEventListener('error', () => { loaded++; if (loaded === images.length) init(); });
    });
  }

})();

/* ===== prx premium grid interactions (unique prefix prx_) ===== */
(function () {
  const cards = Array.from(document.querySelectorAll('.prx_card'));

  if (!cards.length) return;

  // Intersection observer to reveal cards with stagger
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        // small stagger based on index
        const i = cards.indexOf(el);
        setTimeout(() => el.classList.add('prx_visible'), i * 100);
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.12 });

  cards.forEach(c => io.observe(c));

  // keyboard accessibility: when focused, ensure visible & highlight
  cards.forEach(c => {
    c.addEventListener('focus', () => c.classList.add('prx_visible'));
    c.addEventListener('blur', () => { /* leave visible */ });
    // optional: click handler to open resource modal or download
    c.addEventListener('click', (e) => {
      // Example: console.log the numeric value (if needed)
      const val = c.dataset.value || '';
      // Replace with your action: open modal / download / go to link
      console.log('Resource clicked:', c.querySelector('.prx_card_title')?.textContent, 'value=', val);
    });
  });

  // Safety: respect reduced-motion
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (mq.matches) {
    cards.forEach(c => c.classList.add('prx_visible'));
  }
})();
