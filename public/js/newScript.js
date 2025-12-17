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


{



//Cta
// ucta_final_centered.js — timer + center pulse class
(function () {
  const DEFAULT_MINUTES = 15;
  const TIMER_ID = 'ucta_timer_text';
  const TIMER_BOX_ID = 'ucta_timer_box';
  const BTN_ID = 'ucta_btn';

  const timerText = document.getElementById(TIMER_ID);
  const timerBox = document.getElementById(TIMER_BOX_ID);
  const btn = document.getElementById(BTN_ID);
  if (!timerText || !timerBox || !btn) return;

  let seconds = DEFAULT_MINUTES * 60;
  let ended = false;

  function formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, '0')} mins left`;
  }

  function tick() {
    if (ended) return;
    if (seconds <= 0) {
      timerText.textContent = 'Offer ended';
      btn.disabled = true;
      timerBox.classList.remove('ucta_pulse');
      ended = true;
      return;
    }
    timerText.textContent = formatTime(seconds);
    // add gentle pulse only while offer active
    if (!timerBox.classList.contains('ucta_pulse')) timerBox.classList.add('ucta_pulse');
    seconds--;
  }

  // initial paint + interval
  tick();
  setInterval(tick, 1000);

  // button click behavior (proxy to primaryCTA or fallback)
  btn.addEventListener('click', function () {
    const primary = document.getElementById('primaryCTA');
    if (primary) { primary.click(); return; }
    window.location.href = '/payment/checkout';
  });

  // expose reset helper
  window.u_cta = window.u_cta || {};
  window.u_cta.resetTimer = function (mins) {
    const m = Math.max(0, Number(mins) || DEFAULT_MINUTES);
    seconds = Math.floor(m * 60);
    ended = false;
    btn.disabled = false;
    tick();
  };
})();





}


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
// Adds entrance animation when cards scroll into view + subtle tilt + keyboard interactions
document.addEventListener('DOMContentLoaded', function () {
  const cards = document.querySelectorAll('.premium-resources .card');

  // IntersectionObserver for reveal
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        obs.unobserve(entry.target);
      }
    });
  }, { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.14 });

  cards.forEach(c => obs.observe(c));

  // keyboard accessible "press" effect for Enter/Space
  cards.forEach(card => {
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        card.classList.add('keyboard-press');
        setTimeout(() => card.classList.remove('keyboard-press'), 220);
      }
    });
  });

  // subtle tilt effect on mouse move (light)
  cards.forEach(card => {
    const wrap = card.closest('.card-frame') || card;
    wrap.addEventListener('mousemove', (ev) => {
      const r = card.getBoundingClientRect();
      const x = ev.clientX - r.left;
      const y = ev.clientY - r.top;
      const rx = (y - r.height/2) / 25;
      const ry = (x - r.width/2) / -25;
      card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0) scale(1.01)`;
    });
    wrap.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
});



/* promo-section.js
   - Triggers the bar-rise animation when the section enters view
   - Adds a gentle CTA text pulse (scale) that pauses on hover/focus
   - Respects prefers-reduced-motion
*/

(function () {
  // 1) reveal bars when .par-inner intersects viewport
  const parInner = document.querySelector('.par-inner');
  if (parInner) {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReduced.matches) {
      parInner.classList.add('bars-animate');
    } else {
      const io = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            parInner.classList.add('bars-animate');
            obs.disconnect();
          }
        });
      }, { threshold: 0.18 });
      io.observe(parInner);
    }
  }

  // 2) CTA gentle pulse (scale the text inside the button)
  const cta = document.getElementById('parCta');
  if (!cta) return;

  // Ensure inner wrapper exists
  let inner = cta.querySelector('.par-cta-text');
  if (!inner) {
    inner = document.createElement('span');
    inner.className = 'par-cta-text';
    while (cta.firstChild) inner.appendChild(cta.firstChild);
    cta.appendChild(inner);
  }

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (prefersReduced.matches) {
    inner.style.transform = 'scale(1)';
    return;
  }

  const MIN = 1;
  const MAX = 1.06;
  const HALF = 1000; // ms
  let rafId = null, start = null, dir = 1, running = true;

  function easeInOut(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }

  function step(ts) {
    if (!start) start = ts;
    const elapsed = ts - start;
    const t = Math.min(elapsed / HALF, 1);
    const e = easeInOut(t);
    const scale = dir === 1 ? MIN + (MAX - MIN) * e : MAX - (MAX - MIN) * e;
    inner.style.transform = `scale(${scale})`;

    if (elapsed >= HALF) { dir *= -1; start = ts; }
    if (running) rafId = requestAnimationFrame(step);
  }

  rafId = requestAnimationFrame(step);

  function pause() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    inner.style.transform = 'scale(1)';
  }
  function resume() {
    if (!running) {
      running = true;
      start = null;
      rafId = requestAnimationFrame(step);
    }
  }

  cta.addEventListener('mouseenter', pause, { passive: true });
  cta.addEventListener('mouseleave', resume, { passive: true });
  cta.addEventListener('focusin', pause);
  cta.addEventListener('focusout', resume);

  prefersReduced.addEventListener('change', e => {
    if (e.matches) pause(); else resume();
  });
})();
/* promo-section-4bars.js
   - toggles .bars-animate when .par-inner enters view
   - pointer parallax/tilt on desktop (pointer:fine)
   - gentle CTA text pulse (pauses on hover/focus)
   - respects prefers-reduced-motion
*/
(function(){
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1) reveal bars
  const parInner = document.getElementById('par-inner');
  if (parInner) {
    if (reduced) {
      parInner.classList.add('bars-animate');
    } else {
      const io = new IntersectionObserver((entries, obs) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            parInner.classList.add('bars-animate');
            obs.disconnect();
          }
        });
      }, { threshold: 0.18 });
      io.observe(parInner);
    }
  }

  // 2) pointer parallax for the art svg (desktop)
  const art = document.querySelector('.par-art');
  const svg = document.querySelector('.par-svg');
  if (art && svg && !reduced && window.matchMedia('(pointer:fine)').matches) {
    const rectCache = () => art.getBoundingClientRect();
    let rect = rectCache();

    function onMove(e) {
      rect = rectCache();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const nx = (px - 0.5);
      const ny = (py - 0.5);
      const ry = nx * 6; // rotateY
      const rx = -ny * 6; // rotateX
      svg.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
      svg.style.transition = 'transform 100ms ease-out';
    }
    function onLeave() {
      svg.style.transform = '';
      svg.style.transition = 'transform 300ms cubic-bezier(.2,.9,.2,1)';
    }
    art.addEventListener('pointermove', onMove, {passive:true});
    art.addEventListener('pointerleave', onLeave);
    // re-calc on resize
    window.addEventListener('resize', () => { rect = rectCache(); });
  }

  // 3) CTA gentle pulse (scale inner text)
  const cta = document.getElementById('parCta');
  if (cta && !reduced) {
    let inner = cta.querySelector('.par-cta-text');
    if (!inner) {
      inner = document.createElement('span');
      inner.className = 'par-cta-text';
      while (cta.firstChild) inner.appendChild(cta.firstChild);
      cta.appendChild(inner);
    }

    const MIN = 1, MAX = 1.05, HALF = 1000;
    let raf = null, start = null, dir = 1, running = true;

    function ease(t){ return t<0.5 ? 2*t*t : -1 + (4-2*t)*t; }
    function step(ts){
      if (!start) start = ts;
      const elapsed = ts - start;
      const t = Math.min(elapsed/HALF, 1);
      const e = ease(t);
      const scale = dir === 1 ? MIN + (MAX-MIN)*e : MAX - (MAX-MIN)*e;
      inner.style.transform = `scale(${scale})`;
      if (elapsed >= HALF) { dir *= -1; start = ts; }
      if (running) raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);

    function pause(){ running = false; if (raf) cancelAnimationFrame(raf); inner.style.transform = 'scale(1)'; }
    function resume(){ if (!running){ running = true; start = null; raf = requestAnimationFrame(step); } }

    cta.addEventListener('mouseenter', pause, {passive:true});
    cta.addEventListener('mouseleave', resume, {passive:true});
    cta.addEventListener('focusin', pause);
    cta.addEventListener('focusout', resume);

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    mq.addEventListener('change', (e)=> { if (e.matches) pause(); else resume(); });
  }

})();


// new section who can join this 
/* wj2-who.js
   Reveal cards with IntersectionObserver, add keyboard behavior.
*/
(function () {
  'use strict';

  const cards = Array.from(document.querySelectorAll('#wj2_grid .wj2_card'));
  if (!cards.length) return;

  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    cards.forEach(c => c.classList.add('revealed'));
    return;
  }

  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      // stagger by index
      const idx = cards.indexOf(el);
      setTimeout(() => el.classList.add('revealed'), idx * 60);
      obs.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -80px 0px' });

  cards.forEach(c => io.observe(c));

  // keyboard activation: Enter/Space triggers a visual "press"
  cards.forEach(c => {
    c.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        c.classList.add('revealed');
        // briefly toggle to simulate activation
        setTimeout(() => c.classList.remove('revealed'), 900);
      }
    });
  });

  // Optional: make CTA accessible via keyboard if user focuses it (it is a button inside a link)
  const cta = document.getElementById('primaryCTA');
  if (cta) {
    cta.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') cta.click();
    });
  }
})();



// notif_random.js — notification that appears randomly + mobile placement above CTA
(function(){
  const WIDGET_ID = 'notif_widget';
  const CLOSE_ID = 'notif_close';
  const LINE1 = 'notif_line1';
  const LINE2 = 'notif_line2';
  const CTA_WRAPPER_ID = 'ucta_wrapper'; // your CTA wrapper id — used to position above CTA on mobile

  const names = [
    'Aman','Priya','Rohit','Sneha','Arjun','Neha','Vikas','Sakshi','Karan','Asha',
    'Ishaan','Pooja','Ritu','Ankit','Meera','Varun','Simran','Aditya','Reema','Sameer'
  ];

  const widget = document.getElementById(WIDGET_ID);
  const closeBtn = document.getElementById(CLOSE_ID);
  const line1 = document.getElementById(LINE1);
  const line2 = document.getElementById(LINE2);
  const ctaWrap = document.getElementById(CTA_WRAPPER_ID);

  if (!widget || !closeBtn || !line1 || !line2) return;

  // session flag — if user closed, do not re-open this session
  const SESSION_KEY = 'notif_closed_v1';
  const closed = sessionStorage.getItem(SESSION_KEY) === '1';
  if (closed) return;

  // helper: pick random int in range [a,b]
  function randInt(a,b){ return Math.floor(Math.random()*(b-a+1))+a; }

  // generate message
  function makeMessage(){
    const name = names[randInt(0, names.length-1)];
    // random verbs/phrasing for variety
    const verbs = [
      'just booked', 'grabbed', 'signed up for', 'reserved a seat for', 'joined'
    ];
    const verb = verbs[randInt(0, verbs.length-1)];
    line1.textContent = `${name} ${verb} this course!`;
    // secondary line variants
    const tails = [
      'Limited seats — hurry up!',
      'Seats filling fast — don’t miss out!',
      'Only a few seats left — join now!',
      'Claimed a spot — join before it’s gone!'
    ];
    line2.textContent = tails[randInt(0, tails.length-1)];
  }

  // show widget with animation
  function showWidget(){
    if (sessionStorage.getItem(SESSION_KEY) === '1') return;
    makeMessage();
    // position on mobile above CTA if CTA exists
    if (ctaWrap && window.innerWidth <= 760){
      const rect = ctaWrap.getBoundingClientRect();
      // compute bottom offset so widget sits just above CTA with 12px gap
      const gap = 12;
      const bottomPx = window.innerHeight - rect.top + gap; // distance from bottom
      // set inline style to place it above CTA
      widget.style.bottom = (rect.height + gap + 8) + 'px'; // fallback
      // safer: compute absolute bottom: place widget at (rect.height + gap) above bottom
      widget.style.bottom = `calc(${rect.height}px + ${gap}px + 12px)`;
      // align right on mobile
      widget.style.left = 'auto';
      widget.style.right = '14px';
    } else {
      // desktop default bottom-left
      widget.style.left = '20px';
      widget.style.right = 'auto';
      widget.style.bottom = '20px';
    }

    widget.hidden = false;
    // small delay to allow reflow then add class
    requestAnimationFrame(()=> widget.classList.add('notif_show'));
    widget.classList.remove('notif_hide');
  }

  // hide widget
  function hideWidget(persist=false){
    widget.classList.remove('notif_show');
    widget.classList.add('notif_hide');
    // after transition, hide element
    setTimeout(()=> { widget.hidden = true; }, 420);
    if (persist) sessionStorage.setItem(SESSION_KEY,'1');
  }

  // random schedule: show first after 2-9s, then every 20-50s
  function scheduleLoop(){
    if (sessionStorage.getItem(SESSION_KEY) === '1') return;
    const firstDelay = randInt(2000, 9000);
    setTimeout(function appear(){
      showWidget();
      // auto-hide after random short time 4-8s
      setTimeout(()=> { hideWidget(false); }, randInt(3200, 7200));
      // schedule next
      const next = randInt(10000, 40000);
      setTimeout(appear, next);
    }, firstDelay);
  }

  // close handler
  closeBtn.addEventListener('click', function(e){
    e.preventDefault();
    hideWidget(true); // persist close this session
  });

  // clicking widget body should proxy to CTA
  widget.addEventListener('click', function(e){
    // if click on close button, ignore (close handler above)
    if (e.target === closeBtn) return;
    const mainCTA = document.getElementById('primaryCTA');
    if (mainCTA) mainCTA.click();
    else window.location.href = '/payment/checkout';
  });

  // reposition on resize (when CTA height changes)
  window.addEventListener('resize', function(){
    if (widget.hidden) return;
    if (ctaWrap && window.innerWidth <= 760){
      const gap = 12;
      widget.style.bottom = `calc(${ctaWrap.getBoundingClientRect().height}px + ${gap}px + 12px)`;
      widget.style.left = 'auto';
      widget.style.right = '14px';
    } else {
      widget.style.left = '20px';
      widget.style.right = 'auto';
      widget.style.bottom = '20px';
    }
  });

  // start only if not closed
  scheduleLoop();

})();

{

// ========== ACTION TAKER JS (actk_) ==========
(function () {
  const counters = document.querySelectorAll(".actk_stat_num");
  const timerEl = document.getElementById("actk_timer");
  const section = document.getElementById("actk_section");

  /* COUNT-UP ANIMATION */
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      counters.forEach(counter => {
        let start = 0;
        const end = parseInt(counter.dataset.target);
        const duration = 1200;
        const increment = end / (duration / 16);

        function update() {
          start += increment;
          counter.textContent = Math.floor(start);
          if (start < end) requestAnimationFrame(update);
          else counter.textContent = end;
        }
        update();
      });
      observer.disconnect();
    }
  });
  observer.observe(section);

  /* TIMER */
  let time =  15 * 60; // 15 minutes
  function updateTimer() {
    const m = Math.floor(time / 60);
    const s = String(time % 60).padStart(2, "0");
    timerEl.textContent = `${m}:${s}`;
    if (time <= 0) return;
    time--;
  }
  updateTimer();
  setInterval(updateTimer, 1000);
})();


}


// certifiacte load js

(function () {
  const img = document.getElementById("dedge-cert-single-img");
  const card = document.getElementById("dedge-cert-single-card");
  const frame = document.querySelector(".dedge-cert-single-frame");

  /* Load animation */
  if (img) {
    if (img.complete) img.classList.add("loaded");
    else img.addEventListener("load", () => img.classList.add("loaded"));
  }

  /* Reveal on scroll */
  if (card && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        card.classList.add("dedge-visible");
        io.disconnect();
      }
    });
    io.observe(card);
  }

  /* Subtle 3D tilt */
  function isTouch() { return "ontouchstart" in window; }
  if (!isTouch() && frame) {
    frame.addEventListener("mousemove", (e) => {
      const r = frame.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      frame.style.transform = `rotateX(${-(y*8)}deg) rotateY(${x*8}deg)`;
    });
    frame.addEventListener("mouseleave", () => {
      frame.style.transform = `rotateX(0deg) rotateY(0deg)`;
    });
  }
})();



// promo
// =============================
// LEFT IMAGE REVEAL + PREMIUM TILT
// =============================
(function () {
  const frame = document.querySelector(".par-img-frame");
  const img = document.getElementById("par-img");

  if (!frame || !img) return;

  /* Reveal on scroll */
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        frame.classList.add("visible");
        io.disconnect();
      }
    }, { threshold: 0.2 });

    io.observe(frame);
  } else {
    frame.classList.add("visible");
  }

  /* Desktop tilt effect */
  const isTouch = () => "ontouchstart" in window;
  if (!isTouch()) {
    frame.addEventListener("mousemove", (e) => {
      const r = frame.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;

      const rotateX = -(y * 10);
      const rotateY = x * 10;

      img.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
      frame.classList.add("tilt-active");
    });

    frame.addEventListener("mouseleave", () => {
      img.style.transform = "rotateX(0deg) rotateY(0deg) scale(1)";
      frame.classList.remove("tilt-active");
    });
  }
})();
// video playing in home tab
window.addEventListener("DOMContentLoaded", () => {
  const video = document.getElementById("demoVideo");
  const poster = document.getElementById("videoPoster");
  const playBtn = document.getElementById("playBtn");

  if (!video || !poster || !playBtn) return;

  // Initial state
  video.pause();
  video.currentTime = 0;
  video.style.display = "none";
  poster.style.display = "block";
  playBtn.style.display = "flex";

  playBtn.addEventListener("click", () => {
    poster.style.display = "none";
    video.style.display = "block";

    video.muted = false;
    video.controls = true;
    video.play();

    playBtn.style.display = "none";
  });

  video.addEventListener("ended", () => {
    playBtn.style.display = "flex";
  });
});
