/* =====================================================
   SHEBERCRAFT — JavaScript
   ===================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ===== SCROLL PROGRESS =====
  const scrollProgress = document.getElementById('scrollProgress');
  const updateScrollProgress = () => {
    if (!scrollProgress) return;
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    scrollProgress.style.width = pct + '%';
  };

  // ===== NAVBAR SCROLL STATE & BACK TO TOP =====
  const navbar = document.getElementById('navbar');
  const backToTop = document.getElementById('backToTop');
  
  const handleScrollEffects = () => {
    const scrollY = window.scrollY;
    
    // Navbar scroll class
    if (navbar) {
      navbar.classList.toggle('scrolled', scrollY > 60);
    }
    
    // Back to top button visibility
    if (backToTop) {
      if (scrollY > 300) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    }
  };

  window.addEventListener('scroll', () => {
    updateScrollProgress();
    handleScrollEffects();
  }, { passive: true });

  // ===== SCROLL-TRIGGERED ANIMATIONS =====
  const animateObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = parseInt(el.dataset.delay || '0', 10);
        setTimeout(() => {
          el.classList.add('visible');
        }, delay);
        animateObserver.unobserve(el);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('[data-animate]').forEach(el => {
    animateObserver.observe(el);
  });

  // ===== COUNTER ANIMATION =====
  const animateCounter = (el, target, duration = 1800) => {
    const start = performance.now();
    const isDecimal = String(target).includes('.');
    const update = (time) => {
      const elapsed = time - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = eased * target;
      el.textContent = isDecimal ? value.toFixed(1) : Math.floor(value).toLocaleString('ru-RU');
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = isDecimal ? target.toFixed(1) : target.toLocaleString('ru-RU');
    };
    requestAnimationFrame(update);
  };

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        document.querySelectorAll('[data-count]').forEach(el => {
          const target = parseFloat(el.dataset.count);
          animateCounter(el, target);
        });
        statsObserver.disconnect();
      }
    });
  }, { threshold: 0.3 });

  const heroStats = document.querySelector('.hero-stats');
  if (heroStats) statsObserver.observe(heroStats);

  // ===== CATALOG FILTER =====
  const filterBtns = document.querySelectorAll('.filter-btn');
  const catalogCards = document.querySelectorAll('.catalog-card[data-category]');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('filter-btn--active'));
      btn.classList.add('filter-btn--active');

      const filter = btn.dataset.filter;

      catalogCards.forEach((card, i) => {
        const match = filter === 'all' || card.dataset.category === filter;
        card.classList.toggle('hidden', !match);

        if (match) {
          card.style.animation = 'none';
          card.offsetHeight; // reflow
          card.style.animation = `fadeInUp 0.4s ${i * 60}ms both cubic-bezier(0.4, 0, 0.2, 1)`;
        }
      });
    });
  });

  // ===== MOBILE MENU =====
  const burgerBtn = document.getElementById('burgerBtn');

  const mobileMenu = document.createElement('div');
  mobileMenu.className = 'mobile-menu';
  mobileMenu.innerHTML = `
    <button class="mobile-close" aria-label="Закрыть меню">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 6 6 18M6 6l12 12"/>
      </svg>
    </button>
    <a href="#services" class="mobile-nav-link">Услуги</a>
    <a href="#crm" class="mobile-nav-link">CRM</a>
    <a href="#catalog" class="mobile-nav-link">Каталог</a>
    <a href="#cases" class="mobile-nav-link">Кейсы</a>
    <a href="#faq" class="mobile-nav-link">FAQ</a>
    <a href="#contact" class="btn-primary btn-lg" style="margin-top:1.5rem">Получить решение</a>
  `;
  document.body.appendChild(mobileMenu);

  const toggleMenu = (open) => {
    mobileMenu.classList.toggle('open', open);
    // Only lock vertical scroll — do NOT override overflow-x (breaks fixed float buttons)
    document.body.style.overflowY = open ? 'hidden' : '';
    if (burgerBtn) burgerBtn.setAttribute('aria-expanded', String(open));
  };

  // Burger button opens menu
  if (burgerBtn) {
    burgerBtn.addEventListener('click', () => {
      toggleMenu(!mobileMenu.classList.contains('open'));
    });
  }

  // Close button — querySelector works after innerHTML set + appendChild
  const mobileCloseBtn = mobileMenu.querySelector('.mobile-close');
  if (mobileCloseBtn) {
    mobileCloseBtn.addEventListener('click', () => toggleMenu(false));
  }

  // Any nav link closes menu
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  // Escape key closes menu
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
      toggleMenu(false);
    }
  });

  // Click outside menu content closes it
  mobileMenu.addEventListener('click', (e) => {
    if (e.target === mobileMenu) toggleMenu(false);
  });

  // ===== SMOOTH SCROLL for anchor links =====
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ===== ACTIVE NAV LINK ON SCROLL =====
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          const isActive = link.getAttribute('href') === `#${id}`;
          link.style.color = isActive ? 'var(--color-primary)' : '';
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(section => navObserver.observe(section));

  // ===== CONTACT FORM SUBMIT =====
  const contactForm = document.getElementById('contactForm');
  const toast = document.getElementById('toast');
  const submitBtn = document.getElementById('submitBtn');

  contactForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const phone = document.getElementById('phone').value.trim();

    if (!phone) {
      const phoneEl = document.getElementById('phone');
      phoneEl.focus();
      phoneEl.style.borderColor = 'var(--color-danger)';
      setTimeout(() => { phoneEl.style.borderColor = ''; }, 2000);
      return;
    }

    submitBtn.disabled = true;
    const btnSpan = submitBtn.querySelector('span');
    if (btnSpan) btnSpan.textContent = 'Отправляем...';

    await new Promise(resolve => setTimeout(resolve, 1200));

    if (toast) {
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 4000);
    }

    contactForm.reset();
    submitBtn.disabled = false;
    if (btnSpan) btnSpan.textContent = 'Отправить заявку';
  });

  // ===== FAQ ACCORDION =====
  document.querySelectorAll('.faq-item').forEach(item => {
    item.addEventListener('toggle', () => {
      document.querySelectorAll('.faq-item[open]').forEach(other => {
        if (other !== item) other.removeAttribute('open');
      });
    });
  });

  // ===== CARD HOVER 3D TILT =====
  if (window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.service-card, .catalog-card--featured').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `translateY(-6px) perspective(600px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  // ===== COPY EMAIL ON CLICK =====
  document.querySelectorAll('a[href^="mailto"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const email = link.href.replace('mailto:', '');
      if (navigator.clipboard) {
        e.preventDefault();
        navigator.clipboard.writeText(email).then(() => {
          const span = link.querySelector('span');
          if (span) {
            const orig = span.textContent;
            span.textContent = 'Скопировано!';
            setTimeout(() => { span.textContent = orig; }, 2000);
          }
        }).catch(() => {
          window.location.href = link.href;
        });
      }
    });
  });

  // ===== INITIAL HERO ANIMATIONS =====
  const heroElements = document.querySelectorAll('.hero [data-animate]');
  heroElements.forEach((el) => {
    const baseDelay = parseInt(el.dataset.delay || '0', 10);
    el.style.transitionDelay = `${baseDelay + 200}ms`;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.classList.add('visible');
      });
    });
  });

  // ===== BACK TO TOP CLICK =====
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  console.log('%c Shebercraft ', 'background:#38bdf8;color:#0b0c0a;font-weight:700;padding:4px 8px;border-radius:4px;font-size:14px;', 'Цифровые решения для бизнеса Казахстана');
});
