/*
  Margherita Hack — site interactions
  - Starfield canvas background
  - Scroll progress bar
  - Reveal-on-scroll animations
  - Active nav link + mobile menu
  - Count-up numbers
  (Vanilla JS, no dependencies)
*/

(function(){
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Language / i18n (IT <-> SQ) ----------
  const fileName = (location.pathname.split('/').pop() || 'index.html');
  const currentLang = fileName.toLowerCase().endsWith('_sq.html') ? 'sq' : 'it';
  const preferred = (localStorage.getItem('lang') || '').toLowerCase();

  const toLangFile = (lang) => {
    const base = fileName.replace(/_sq\.html$/i, '.html');
    if (lang === 'sq') return base.replace(/\.html$/i, '_sq.html');
    return base;
  };

  // Redirect on load to preferred language (keeps hash)
  if (preferred && (preferred === 'it' || preferred === 'sq') && preferred !== currentLang) {
    const target = toLangFile(preferred) + (location.hash || '');
    // avoid loop
    if (target !== fileName + (location.hash || '')) location.replace(target);
  }

  const langBtn = document.querySelector('[data-lang-toggle]');
  if (langBtn) {
    // show the language you can switch TO
    langBtn.textContent = (currentLang === 'it') ? 'SQ' : 'IT';
    langBtn.setAttribute('aria-label', (currentLang === 'it') ? 'Kalo në shqip' : 'Passa all’italiano');

    langBtn.addEventListener('click', () => {
      const next = (currentLang === 'it') ? 'sq' : 'it';
      localStorage.setItem('lang', next);
      const target = toLangFile(next) + (location.hash || '');
      location.href = target;
    });
  }


  // ---------- Mobile nav ----------
  const burger = document.querySelector('[data-burger]');
  const navlinks = document.querySelector('[data-navlinks]');
  if (burger && navlinks) {
    burger.addEventListener('click', () => {
      navlinks.classList.toggle('open');
      burger.setAttribute('aria-expanded', navlinks.classList.contains('open') ? 'true' : 'false');
    });

    // close when clicking a link
    navlinks.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (!a) return;
      navlinks.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    });
  }

  // ---------- Active link ----------
  const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('nav a[data-nav]').forEach(a => {
    const href = (a.getAttribute('href') || '').toLowerCase();
    if (href === path) a.classList.add('active');
  });

  // ---------- Year ----------
  const y = document.querySelector('[data-year]');
  if (y) y.textContent = String(new Date().getFullYear());

  // ---------- Progress bar ----------
  const bar = document.querySelector('.progress > span');
  const onScroll = () => {
    if (!bar) return;
    const doc = document.documentElement;
    const h = doc.scrollHeight - doc.clientHeight;
    const p = h > 0 ? (doc.scrollTop / h) : 0;
    bar.style.width = `${Math.min(1, Math.max(0, p)) * 100}%`;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------- Reveal on scroll ----------
  const revealEls = Array.from(document.querySelectorAll('.reveal'));
  if (!prefersReduced && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      for (const ent of entries) {
        if (ent.isIntersecting) {
          ent.target.classList.add('is-visible');
          io.unobserve(ent.target);
        }
      }
    }, { threshold: 0.14 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  // ---------- Count up ----------
  const countEls = Array.from(document.querySelectorAll('[data-count]'));
  const animateCount = (el) => {
    const target = Number(el.getAttribute('data-count'));
    if (!Number.isFinite(target)) return;
    const duration = 950;
    const start = performance.now();
    const from = 0;
    const isInt = Number.isInteger(target);
    const tick = (t) => {
      const p = Math.min(1, (t - start) / duration);
      const ease = 1 - Math.pow(1 - p, 3);
      const v = from + (target - from) * ease;
      el.textContent = isInt ? String(Math.round(v)) : v.toFixed(1);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if (!prefersReduced && countEls.length) {
    const io2 = new IntersectionObserver((entries) => {
      for (const ent of entries) {
        if (ent.isIntersecting) {
          animateCount(ent.target);
          io2.unobserve(ent.target);
        }
      }
    }, { threshold: 0.4 });
    countEls.forEach(el => io2.observe(el));
  } else {
    countEls.forEach(el => {
      el.textContent = el.getAttribute('data-count') || el.textContent;
    });
  }

  // ---------- Gallery Lightbox ----------
  const placeholderSVG = () => {
    const svg = `\
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">\
  <defs>\
    <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">\
      <stop offset="0" stop-color="#0b1220"/>\
      <stop offset="0.55" stop-color="#0b2a45"/>\
      <stop offset="1" stop-color="#0b1220"/>\
    </linearGradient>\
    <radialGradient id="r" cx="35%" cy="25%" r="70%">\
      <stop offset="0" stop-color="#38bdf8" stop-opacity="0.25"/>\
      <stop offset="1" stop-color="#38bdf8" stop-opacity="0"/>\
    </radialGradient>\
  </defs>\
  <rect width="1200" height="800" fill="url(#g)"/>\
  <rect width="1200" height="800" fill="url(#r)"/>\
  <g fill="#e2e8f0" fill-opacity="0.85">\
    <text x="80" y="420" font-family="ui-sans-serif, system-ui" font-size="56" font-weight="700">Aggiungi una foto in /assets</text>\
    <text x="80" y="490" font-family="ui-sans-serif, system-ui" font-size="30" fill-opacity="0.75">Esempio: hack-01.jpg, hack-02.jpg, ...</text>\
  </g>\
</svg>`;
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
  };

  document.querySelectorAll('img[data-fallback]').forEach(img => {
    img.addEventListener('error', () => {
      if (img.dataset.fixed === '1') return;
      img.dataset.fixed = '1';
      img.src = placeholderSVG();
    }, { once: true });
  });

  const ensureLightbox = () => {
    let lb = document.querySelector('[data-lightbox]');
    if (lb) return lb;
    lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.setAttribute('data-lightbox', '');
    lb.innerHTML = `
      <div class="backdrop" data-lb-close></div>
      <div class="panel" role="dialog" aria-modal="true" aria-label="Foto">
        <button class="close" type="button" aria-label="Chiudi" data-lb-close>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </button>
        <img alt="" data-lb-img />
        <div class="meta">
          <div class="cap" data-lb-cap></div>
          <div class="hint">Esc per chiudere</div>
        </div>
      </div>`;
    document.body.appendChild(lb);
    return lb;
  };

  const openLightbox = (src, cap) => {
    const lb = ensureLightbox();
    lb.querySelector('[data-lb-img]').src = src;
    lb.querySelector('[data-lb-cap]').textContent = cap || '';
    lb.classList.add('show');
    document.documentElement.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    const lb = document.querySelector('[data-lightbox]');
    if (!lb) return;
    lb.classList.remove('show');
    document.documentElement.style.overflow = '';
    const img = lb.querySelector('[data-lb-img]');
    if (img) img.src = '';
  };

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-gallery-open]');
    if (btn) {
      const src = btn.getAttribute('data-src');
      const cap = btn.getAttribute('data-cap') || btn.getAttribute('aria-label') || '';
      if (src) openLightbox(src, cap);
      return;
    }
    if (e.target.closest('[data-lb-close]')) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });

  // ---------- Carousel (Home slider) ----------
  const carousels = document.querySelectorAll('[data-carousel]');
  carousels.forEach((root) => {
    const track = root.querySelector('[data-carousel-track]');
    if (!track) return;

    const slides = Array.from(track.children).filter(el => el.classList.contains('cslide'));
    if (slides.length < 2) return;

    const btnPrev = root.querySelector('[data-carousel-prev]');
    const btnNext = root.querySelector('[data-carousel-next]');
    const dotsWrap = root.querySelector('[data-carousel-dots]');

    let i = 0;
    let timer = null;
    const autoplay = root.getAttribute('data-autoplay') === 'true';
    const interval = Math.max(2500, Number(root.getAttribute('data-interval') || 5200));

    const set = (next) => {
      i = (next + slides.length) % slides.length;
      track.style.transform = `translateX(${-i * 100}%)`;
      slides.forEach((s, idx) => s.setAttribute('aria-hidden', idx === i ? 'false' : 'true'));
      if (dotsWrap) {
        dotsWrap.querySelectorAll('button').forEach((b, idx) => {
          b.setAttribute('aria-current', idx === i ? 'true' : 'false');
        });
      }
    };

    const stop = () => { if (timer) { clearInterval(timer); timer = null; } };
    const start = () => {
      if (!autoplay) return;
      stop();
      timer = setInterval(() => set(i + 1), interval);
    };

    // dots
    if (dotsWrap) {
      dotsWrap.innerHTML = '';
      slides.forEach((_, idx) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', `Vai alla slide ${idx + 1}`);
        b.setAttribute('aria-current', idx === 0 ? 'true' : 'false');
        b.addEventListener('click', () => { set(idx); start(); });
        dotsWrap.appendChild(b);
      });
    }

    btnPrev?.addEventListener('click', () => { set(i - 1); start(); });
    btnNext?.addEventListener('click', () => { set(i + 1); start(); });

    // keyboard
    root.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { set(i - 1); start(); }
      if (e.key === 'ArrowRight') { set(i + 1); start(); }
    });

    // pause on hover/focus
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    root.addEventListener('focusin', stop);
    root.addEventListener('focusout', start);

    // swipe
    let sx = 0, sy = 0, down = false;
    root.addEventListener('pointerdown', (e) => {
      down = true;
      sx = e.clientX; sy = e.clientY;
      stop();
    }, { passive: true });
    root.addEventListener('pointerup', (e) => {
      if (!down) return;
      down = false;
      const dx = e.clientX - sx;
      const dy = e.clientY - sy;
      if (Math.abs(dx) > 35 && Math.abs(dx) > Math.abs(dy)) {
        set(i + (dx < 0 ? 1 : -1));
      }
      start();
    }, { passive: true });

    set(0);
    start();
  });

  // ---------- Starfield ----------
  const canvas = document.getElementById('stars');
  if (!canvas || prefersReduced) return; // keep page calm

  const ctx = canvas.getContext('2d', { alpha: true });
  let W = 0, H = 0;
  const DPR = Math.min(2, window.devicePixelRatio || 1);

  const resize = () => {
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  };
  const rand = (a, b) => a + Math.random() * (b - a);
  const stars = [];
  const makeStars = () => {
    stars.length = 0;
    const n = Math.floor((W * H) / 15000);
    for (let i = 0; i < n; i++) {
      stars.push({
        x: rand(0, W),
        y: rand(0, H),
        r: rand(.4, 1.6),
        a: rand(.15, .85),
        s: rand(.05, .22),
        tw: rand(0, Math.PI * 2)
      });
    }
  };

  const draw = () => {
    ctx.clearRect(0, 0, W, H);

    // subtle nebula haze
    const g = ctx.createRadialGradient(W * .2, H * .15, 0, W * .2, H * .15, Math.max(W, H));
    g.addColorStop(0, 'rgba(56,189,248,0.05)');
    g.addColorStop(1, 'rgba(56,189,248,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    for (const st of stars) {
      st.y += st.s;
      if (st.y > H + 10) { st.y = -10; st.x = rand(0, W); }
      st.tw += 0.02;
      const alpha = st.a * (0.7 + 0.3 * Math.sin(st.tw));
      ctx.beginPath();
      ctx.fillStyle = `rgba(226,232,240,${alpha})`;
      ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(draw);
  };

  // boot
  const boot = () => {
    resize();
    makeStars();
    draw();
  };
  window.addEventListener('resize', () => {
    resize();
    makeStars();
  }, { passive: true });
  boot();
})();
