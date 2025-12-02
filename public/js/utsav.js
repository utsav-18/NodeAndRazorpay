// FAQ: smoother + slower open/close sequence using requestAnimationFrame
document.addEventListener('DOMContentLoaded', () => {
  const faqList = document.getElementById('faqList');
  const searchInput = document.getElementById('faqSearch');

  function collapsePanel(btn) {
    const panel = btn.nextElementSibling;
    if (!panel) return;

    // ensure panel is measurable
    panel.style.overflow = 'hidden';
    // start from current computed height
    panel.style.height = panel.scrollHeight + 'px';
    // force reflow
    panel.getBoundingClientRect();

    // fade out then collapse (use rAF for reliable timing)
    panel.style.opacity = '0';
    requestAnimationFrame(() => {
      panel.style.height = '0px';
      panel.style.paddingTop = '0px';
      panel.style.paddingBottom = '0px';
    });

    btn.setAttribute('aria-expanded', 'false');

    // cleanup after transition
    const onEnd = () => {
      panel.style.overflow = 'hidden';
      panel.removeEventListener('transitionend', onEnd);
    };
    panel.addEventListener('transitionend', onEnd);
  }

  function expandPanel(btn) {
    const panel = btn.nextElementSibling;
    if (!panel) return;

    panel.style.overflow = 'hidden';
    // prepare padding for expanded state (vertical)
    panel.style.paddingTop = '14px';
    panel.style.paddingBottom = '18px';

    // ensure starting state
    panel.style.height = '0px';
    panel.style.opacity = '0';

    // force repaint then set to target height + fade in
    requestAnimationFrame(() => {
      const target = panel.scrollHeight;
      panel.style.height = target + 'px';
      panel.style.opacity = '1';
    });

    btn.setAttribute('aria-expanded', 'true');

    // after transition, remove fixed height so content can reflow
    const onEnd = () => {
      panel.style.height = 'auto';
      panel.style.overflow = 'visible';
      panel.removeEventListener('transitionend', onEnd);
    };
    panel.addEventListener('transitionend', onEnd);
  }

  function closeAllExcept(exceptBtn) {
    faqList.querySelectorAll('.faq-q').forEach(b => {
      if (b === exceptBtn) return;
      if (b.getAttribute('aria-expanded') === 'true') collapsePanel(b);
    });
  }

  faqList.addEventListener('click', (e) => {
    const btn = e.target.closest('.faq-q');
    if (!btn) return;
    const isOpen = btn.getAttribute('aria-expanded') === 'true';
    if (isOpen) {
      collapsePanel(btn);
    } else {
      closeAllExcept(btn);
      // ensure left/right padding exists before expanding
      const panel = btn.nextElementSibling;
      panel.style.paddingLeft = '18px';
      panel.style.paddingRight = '18px';
      expandPanel(btn);

      if (window.innerWidth < 700) {
        setTimeout(() => btn.scrollIntoView({ behavior: 'smooth', block: 'center' }), 340);
      }
    }
  });

  // keyboard support
  faqList.addEventListener('keydown', (e) => {
    const btn = e.target.closest('.faq-q');
    if (!btn) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      btn.click();
    }
  });

  // search filter
  searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim().toLowerCase();
    document.querySelectorAll('#faqList .faq-item').forEach(item => {
      const question = item.querySelector('.faq-q').textContent.toLowerCase();
      const answer = item.querySelector('.faq-a').textContent.toLowerCase();
      const match = q === '' || question.includes(q) || answer.includes(q);
      item.style.display = match ? '' : 'none';
      if (!match) {
        const btn = item.querySelector('.faq-q');
        if (btn && btn.getAttribute('aria-expanded') === 'true') collapsePanel(btn);
      }
    });
  });

  // initialize collapsed panels
  document.querySelectorAll('.faq-a').forEach(a => {
    a.style.height = '0px';
    a.style.paddingTop = '0px';
    a.style.paddingBottom = '0px';
    a.style.opacity = '0';
    a.style.overflow = 'hidden';
  });
});
