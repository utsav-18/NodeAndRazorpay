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

  // play button micro animation + click
  const play = document.getElementById('playBtn') || document.querySelector('.play');
  if(play){
    play.addEventListener('mouseenter', ()=> play.animate([{transform:'scale(1)'},{transform:'scale(1.06)'},{transform:'scale(1)'}],{duration:450,iterations:1,easing:'ease-out'}));
    play.addEventListener('click', ()=> alert('Demo video placeholder — replace with your video modal.'));
  }

  // CTA micro feedback
  const primary = document.getElementById('primaryCTA');
  if(primary){
    primary.addEventListener('click', (e)=>{
      e.currentTarget.animate([{transform:'translateY(0)'},{transform:'translateY(-6px)'},{transform:'translateY(0)'}],{duration:360,easing:'cubic-bezier(.2,.9,.2,1)'});
      // TODO: integrate checkout
    });
  }

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