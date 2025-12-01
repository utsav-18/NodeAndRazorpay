// Improved script: more robust, performant, and accessible

// Observer options (adjust threshold/rootMargin as needed)
const observerOptions = {
  threshold: 0.15,
  rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate-in');

      // If instructor card, animate children
      if (entry.target.classList.contains('instructor-card')) {
        const badge = entry.target.querySelector('.instructor-badge');
        const image = entry.target.querySelector('.instructor-image');
        const details = entry.target.querySelector('.instructor-details');

        if (badge) badge.classList.add('animate-in');
        if (image) image.classList.add('animate-in');
        if (details) details.classList.add('animate-in');
      }

      // Optionally unobserve once animated to reduce work
      // obs.unobserve(entry.target);
    }
  });
}, observerOptions);

// Respect prefers-reduced-motion and update dynamically
const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
function applyReducedMotion(reduced) {
  if (reduced) {
    document.documentElement.style.setProperty('--animation-duration', '0.01s');
    // Remove or reduce animations that could cause motion issues
    document.querySelectorAll('.animate-in, .info-card, .hero').forEach(el => {
      el.style.transition = 'none';
      el.style.animation = 'none';
    });
  } else {
    document.documentElement.style.removeProperty('--animation-duration');
    // It's okay to leave CSS animations to handle themselves normally
  }
}
// initial apply
applyReducedMotion(motionQuery.matches);
// listen for changes (user may toggle after page load)
if (typeof motionQuery.addEventListener === 'function') {
  motionQuery.addEventListener('change', (e) => applyReducedMotion(e.matches));
} else if (typeof motionQuery.addListener === 'function') {
  motionQuery.addListener((e) => applyReducedMotion(e.matches));
}

// DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // Observe multiple elements (if present)
  const selectors = [
    '.instructor-card',
    '.video-container',
    '.bonus-banner',
    '.companies-section'
  ];

  selectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      observer.observe(el);
    });
  });

  // Smooth scroll for same-page anchors (guard for support)
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      const target = document.querySelector(href);
      if (!target) return; // no-op if target missing
      e.preventDefault();
      // prefer native smooth behavior; browsers that don't support will ignore
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // optionally update focus for accessibility
      // target.setAttribute('tabindex', '-1');
      // target.focus({ preventScroll: true });
    });
  });
});

// Parallax / hero transform: optimized rAF loop with passive scroll listener
(function() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  let latestKnownScrollY = 0;
  let ticking = false;

  function onScroll() {
    latestKnownScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
    requestTick();
  }

  function requestTick() {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }

  function update() {
    const scrolled = latestKnownScrollY;
    const windowH = window.innerHeight || document.documentElement.clientHeight;
    // only apply while within first viewport (keeps effect subtle)
    if (scrolled < windowH) {
      // multiply factor controls intensity
      const translateY = Math.round(scrolled * 0.3);
      const opacity = Math.max(0.45, 1 - (scrolled / windowH) * 0.5); // clamp min opacity
      hero.style.transform = `translateY(${translateY}px)`;
      hero.style.opacity = opacity;
    }
    ticking = false;
  }

  // Listen with passive option for performance
  window.addEventListener('scroll', onScroll, { passive: true });

  // Also update on resize to ensure calculations remain correct
  window.addEventListener('resize', () => requestTick(), { passive: true });
})();
