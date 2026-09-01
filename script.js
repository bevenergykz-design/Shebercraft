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
    <a href="/gotovye-sayty/" class="mobile-nav-link" style="color:var(--color-primary);font-weight:700;">⚡ Готовые сайты</a>
    <a href="/sozdanie-saitov/" class="mobile-nav-link">Создание сайтов</a>
    <a href="/cifrovoy-sotrudnik/" class="mobile-nav-link">AI Сотрудник 24/7</a>
    <a href="/bitrix24-avtomatizaciya-bp/" class="mobile-nav-link">CRM & БП</a>
    <a href="/cases/" class="mobile-nav-link">Кейсы</a>
    <a href="/blog/" class="mobile-nav-link">Блог</a>
    <a href="/#faq" class="mobile-nav-link">FAQ</a>
    <div style="margin-top:1rem;display:flex;flex-direction:column;gap:0.75rem;width:100%;max-width:280px;">
      <a href="https://wa.me/77070601980" target="_blank" class="btn-primary" style="text-align:center;font-size:1rem;padding:0.75rem 1.25rem;font-weight:600;font-family:var(--font-sans);text-decoration:none;border-radius:var(--radius-md);">WhatsApp Консультация</a>
    </div>
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

    const name = document.getElementById('name').value.trim();
    const company = document.getElementById('company').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const serviceSelect = document.getElementById('service');
    const serviceText = serviceSelect.options[serviceSelect.selectedIndex]?.text || '';
    const message = document.getElementById('message').value.trim();

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

    // Configure Telegram Bot
    const TELEGRAM_BOT_TOKEN = '8953811443:AAHKxOKpIPM26NLim0eKuLFJL_U1fWOlcKo';
    const TELEGRAM_CHAT_ID = '1994851440'; // Численный Chat ID пользователя sheber_craft

    const telegramText = `<b>Новая заявка с сайта Shebercraft!</b>\n\n👤 <b>Имя:</b> ${name || 'Не указано'}\n🏢 <b>Компания:</b> ${company || 'Не указана'}\n📞 <b>Телефон:</b> ${phone}\n⚙️ <b>Решение:</b> ${serviceText || 'Не выбрано'}\n📝 <b>Описание:</b> ${message || 'Не описана'}`;

    if (TELEGRAM_CHAT_ID && TELEGRAM_CHAT_ID !== 'YOUR_CHAT_ID') {
      try {
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: telegramText,
            parse_mode: 'HTML'
          })
        });

        if (response.ok) {
          if (toast) {
            toast.querySelector('span').textContent = 'Заявка успешно отправлена!';
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 4000);
          }
        } else {
          throw new Error('Telegram API error');
        }
      } catch (err) {
        console.error('Ошибка отправки через Telegram Bot API, перенаправляем напрямую:', err);
        window.open(`https://t.me/sheber_craf?text=${encodeURIComponent(telegramText.replace(/<[^>]*>/g, ''))}`, '_blank');
      }
    } else {
      // Fallback redirect if Chat ID is not configured yet
      window.open(`https://t.me/sheber_craf?text=${encodeURIComponent(telegramText.replace(/<[^>]*>/g, ''))}`, '_blank');
      if (toast) {
        toast.querySelector('span').textContent = 'Заявка сформирована! Открываем Telegram...';
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 4000);
      }
    }

    contactForm.reset();
    submitBtn.disabled = false;
    if (btnSpan) btnSpan.textContent = 'Отправить заявку';
  });

  // ===== FAQ ACCORDION =====
  document.querySelectorAll('.faq-item').forEach(item => {
    const question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', () => {
        document.querySelectorAll('.faq-item[open]').forEach(other => {
          if (other !== item) {
            other.removeAttribute('open');
          }
        });
      });
    }
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

  // ===== BP DEPARTMENT TABS =====
  const bpTabBtns = document.querySelectorAll('.bp-tab-btn');
  const bpTabPanels = document.querySelectorAll('.bp-tab-panel');

  bpTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.dataset.tab;
      bpTabBtns.forEach(b => b.classList.remove('active'));
      bpTabPanels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPanel = document.getElementById(`tab-${targetTab}`);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
    });
  });

  // ===== ARTICLE MODAL READER =====
  const articleModal = document.getElementById('articleModal');
  const openArticleBtns = document.querySelectorAll('.open-article-btn');
  const closeArticleBtn = document.querySelector('.article-modal__close');
  const articleOverlay = document.querySelector('.article-modal__overlay');

  const toggleArticleModal = (open) => {
    if (!articleModal) return;
    articleModal.classList.toggle('open', open);
    articleModal.setAttribute('aria-hidden', !open);
    document.body.style.overflowY = open ? 'hidden' : '';
  };

  openArticleBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleArticleModal(true);
    });
  });

  if (closeArticleBtn) closeArticleBtn.addEventListener('click', () => toggleArticleModal(false));
  if (articleOverlay) articleOverlay.addEventListener('click', () => toggleArticleModal(false));

  // ===== SMART FAB CONTACT WIDGET LOGIC =====
  const smartFabContainer = document.getElementById('smartFabContainer');
  const smartFabTrigger = document.getElementById('smartFabTrigger');
  const smartFabBackdrop = document.getElementById('smartFabBackdrop');
  const smartFabAi = document.getElementById('smartFabAi');

  const toggleSmartFabMenu = (open) => {
    if (!smartFabContainer) return;
    const isActive = open !== undefined ? open : !smartFabContainer.classList.contains('active');
    smartFabContainer.classList.toggle('active', isActive);
    if (smartFabBackdrop) smartFabBackdrop.classList.toggle('active', isActive);
  };

  if (smartFabTrigger) {
    smartFabTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleSmartFabMenu();
    });
  }

  if (smartFabBackdrop) {
    smartFabBackdrop.addEventListener('click', () => {
      toggleSmartFabMenu(false);
    });
  }

  // ===== AI CONSULTANT WIDGET LOGIC =====
  const aiChatWindow = document.getElementById('aiChatWindow');
  const aiChatClose = document.getElementById('aiChatClose');
  const aiChatMessages = document.getElementById('aiChatMessages');
  const aiChatForm = document.getElementById('aiChatForm');
  const aiChatInput = document.getElementById('aiChatInput');
  const aiQuickPrompts = document.getElementById('aiQuickPrompts');

  let aiQuestionCount = 0;
  const MAX_FREE_QUESTIONS = 5;

  const toggleAiChat = (open) => {
    if (!aiChatWindow) return;
    const isOpen = open !== undefined ? open : !aiChatWindow.classList.contains('open');
    aiChatWindow.classList.toggle('open', isOpen);
    aiChatWindow.setAttribute('aria-hidden', !isOpen);
  };

  if (smartFabAi) {
    smartFabAi.addEventListener('click', () => {
      toggleSmartFabMenu(false);
      toggleAiChat(true);
    });
  }

  if (aiChatClose) aiChatClose.addEventListener('click', () => toggleAiChat(false));

  // Escape key handler (placed after all declarations)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (articleModal && articleModal.classList.contains('open')) {
        toggleArticleModal(false);
      }
      if (aiChatWindow && aiChatWindow.classList.contains('open')) {
        toggleAiChat(false);
      }
      if (smartFabContainer && smartFabContainer.classList.contains('active')) {
        toggleSmartFabMenu(false);
      }
    }
  });

  const appendAiMessage = (sender, text) => {
    if (!aiChatMessages) return;
    const msgDiv = document.createElement('div');
    msgDiv.className = `ai-msg ai-msg--${sender}`;
    msgDiv.innerHTML = `<div class="ai-msg-bubble">${text}</div>`;
    aiChatMessages.appendChild(msgDiv);
    aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
    return msgDiv;
  };

  const getAiAnswer = (query) => {
    const q = query.toLowerCase();

    // --- Приветствие ---
    if (q.includes('привет') || q.includes('здравствуй') || q.includes('добрый') || q.includes('салем') || q.includes('hello') || q.includes('хай')) {
      return 'Здравствуйте! 👋 Я цифровой помощник Shebercraft. Могу рассказать о наших услугах, ценах, сроках и AI-решениях. О чём хотите узнать?';
    }

    // --- Цифровой сотрудник (флагман) ---
    if (q.includes('цифровой сотрудник') || q.includes('цифровой агент') || q.includes('ai агент') || q.includes('ai-агент') || q.includes('нейро сотрудник') || q.includes('работает пока')) {
      return '<strong>Цифровой сотрудник 24/7</strong> — AI-агент на базе GPT, который общается с вашими клиентами в WhatsApp, Telegram и на сайте круглосуточно.<br><br>✦ Отвечает мгновенно на русском и казахском<br>✦ Записывает клиентов, квалифицирует лиды<br>✦ Передаёт горячие заявки менеджеру<br>✦ Не болеет, не увольняется, не просит повышения<br><br>💰 Тарифы: <strong>Старт — 89 000 ₸</strong>, Бизнес — 190 000 ₸, Корпоратив — от 490 000 ₸<br>⏱ Запуск базовой версии: <strong>7 дней</strong><br><br><a href="/cifrovoy-sotrudnik/" style="color:#38bdf8">Подробнее о цифровом сотруднике →</a>';
    }

    // --- Стоимость сайта (ИСПРАВЛЕННАЯ ОШИБКА) ---
    if ((q.includes('сколько') || q.includes('стоим') || q.includes('цена') || q.includes('прайс')) && (q.includes('сайт') || q.includes('лендинг') || q.includes('landing') || q.includes('страниц'))) {
      return '<strong>Стоимость создания сайта:</strong><br><br>⚡ <strong>Готовый сайт под ключ</strong> — от 49 000 ₸ (запуск за 1 день!)<br>📄 <strong>Лендинг «Профессионал»</strong> — от 49 000 ₸ (до 7 секций, уникальный дизайн)<br>🏢 <strong>Корпоративный сайт «Бизнес»</strong> — от 250 000 ₸ (до 15 страниц, SEO, CMS)<br><br>Все сайты включают: адаптивный дизайн, SEO-оптимизацию, формы заявок и хостинг.<br><br><a href="https://wa.me/77070601980?text=Здравствуйте!%20Интересует%20создание%20сайта" target="_blank" style="color:#38bdf8">Обсудить в WhatsApp →</a>';
    }

    // --- Готовые сайты ---
    if (q.includes('готовый') || q.includes('готовые') || q.includes('за день') || q.includes('за 1 день') || q.includes('быстрый сайт') || q.includes('24 часа') || q.includes('шаблон')) {
      return '<strong>⚡ Готовые сайты под ключ</strong> — от 49 000 ₸<br><br>Протестированные конверсионные сайты для популярных ниш с запуском за 24 часа:<br><br>✦ Автосервисы, клиники, юристы<br>✦ Ремонт, магазины, рестораны<br>✦ Встроенный AI-сотрудник 24/7<br>✦ Адаптивный дизайн + SEO<br><br><a href="/gotovye-sayty/" style="color:#38bdf8">Смотреть каталог готовых сайтов →</a>';
    }

    // --- Лендинг ---
    if (q.includes('лендинг') || q.includes('посадочн') || q.includes('landing') || q.includes('одностранич')) {
      return '<strong>Лендинг «Профессионал»</strong> — от 49 000 ₸<br><br>Одностраничный сайт с высокой конверсией:<br>✦ До 7 секций, уникальный дизайн<br>✦ Форма заявки + интеграция с CRM<br>✦ Адаптивность под все устройства<br>✦ Базовая SEO-оптимизация<br>✦ Хостинг + домен .kz на 1 год<br><br>Конверсия в заявку: +2–5× по сравнению с обычным сайтом.<br><br><a href="/landing-sait/" style="color:#38bdf8">Подробнее о лендингах →</a>';
    }

    // --- Корпоративный сайт ---
    if (q.includes('корпоратив') || q.includes('многостранич') || q.includes('бизнес сайт') || q.includes('бизнес-сайт') || q.includes('компании сайт')) {
      return '<strong>Корпоративный сайт «Бизнес»</strong> — от 250 000 ₸<br><br>Многостраничный сайт компании:<br>✦ До 15 страниц, CMS для управления<br>✦ Блог / Портфолио / Кейсы<br>✦ SEO-оптимизация + семантическое ядро<br>✦ Интеграция с аналитикой и CRM<br>✦ 1 месяц поддержки включён<br><br>Рост органического трафика на +150% за 6 месяцев.<br><br><a href="/korporativnyy-sait/" style="color:#38bdf8">Подробнее о корпоративных сайтах →</a>';
    }

    // --- SEO-дашборд ---
    if (q.includes('seo') || q.includes('сео') || q.includes('позици') || q.includes('трафик') || q.includes('дашборд') || q.includes('аналитик') || q.includes('мониторинг')) {
      return '<strong>SEO-дашборд «Контроль»</strong> — от 39 000 ₸/мес<br><br>Персональный дашборд с обновлением каждый день:<br>✦ Позиции по ключевым словам<br>✦ Трафик и источники посещений<br>✦ Анализ конкурентов в реальном времени<br>✦ Еженедельные отчёты на email<br><br><a href="/seo-dashboard/" style="color:#38bdf8">Подробнее о SEO-дашборде →</a>';
    }

    // --- AI-бот / чат-бот ---
    if (q.includes('бот') || q.includes('чат-бот') || q.includes('chatbot') || q.includes('нейро-менеджер') || q.includes('нейроменеджер') || q.includes('gpt бот')) {
      return '<strong>AI-бот «Нейро-менеджер»</strong> — от 320 000 ₸<br><br>Умный бот на GPT, обученный на вашем продукте:<br>✦ Понимает контекст, отрабатывает возражения<br>✦ Квалифицирует лидов и закрывает на следующий шаг<br>✦ Ответы 24/7 в WhatsApp и Telegram<br>✦ Передача в CRM + аналитика диалогов<br><br>Работает как живой менеджер — без выходных и больничных.<br><br><a href="/ai-chatbot/" style="color:#38bdf8">Подробнее об AI-ботах →</a>';
    }

    // --- CRM / Битрикс24 ---
    if (q.includes('crm') || q.includes('битрикс') || q.includes('воронк') || q.includes('автоматизац') || q.includes('бизнес-процесс')) {
      return '<strong>Внедрение CRM Битрикс24</strong><br><br>📋 <strong>«Старт продаж»</strong> — от 150 000 ₸<br>Воронка, карточки, задачи, 1 канал коммуникации, обучение команды.<br><br>🚀 <strong>«Автоматизация + БП»</strong> — от 450 000 ₸<br>Полная настройка CRM, бизнес-процессы, роботы, триггеры, интеграции с WhatsApp, 1С, телефония.<br><br><a href="/bitrix24-start/" style="color:#38bdf8">Подробнее о Битрикс24 →</a>';
    }

    // --- Сроки ---
    if (q.includes('срок') || q.includes('когда') || q.includes('долго') || q.includes('быстро') || q.includes('время') || q.includes('дней') || q.includes('запуск')) {
      return '<strong>Сроки реализации:</strong><br><br>⚡ Готовый сайт под ключ — <strong>от 1 дня</strong><br>📄 Лендинг — <strong>5–7 дней</strong><br>🏢 Корпоративный сайт — <strong>14–21 день</strong><br>🤖 Цифровой сотрудник (Старт) — <strong>7 дней</strong><br>🤖 Цифровой сотрудник (Бизнес) — <strong>14 дней</strong><br>📊 SEO-дашборд — <strong>3–5 дней</strong><br>💬 AI-бот «Нейро-менеджер» — <strong>7–14 дней</strong><br>📋 CRM Битрикс24 — <strong>7–30 дней</strong>';
    }

    // --- Контакты ---
    if (q.includes('контакт') || q.includes('телефон') || q.includes('адрес') || q.includes('связаться') || q.includes('whatsapp') || q.includes('вотсап') || q.includes('ватсап') || q.includes('telegram') || q.includes('телеграм') || q.includes('позвон') || q.includes('написать')) {
      return '<strong>Наши контакты:</strong><br><br>📱 <strong>WhatsApp:</strong> <a href="https://wa.me/77070601980" target="_blank" style="color:#38bdf8">+7 707 060-19-80</a><br>✈️ <strong>Telegram:</strong> <a href="https://t.me/sheber_craft" target="_blank" style="color:#38bdf8">@sheber_craft</a><br>📧 <strong>Email:</strong> info@shebercraft.kz<br>📍 <strong>Офис:</strong> г. Алматы, ул. Кожабекова 19, 4 этаж, оф. 8<br><br>Перезвоним в течение 1 рабочего часа!<br><br><a href="https://wa.me/77070601980" target="_blank" style="color:#38bdf8;font-weight:700">Написать в WhatsApp →</a>';
    }

    // --- Все услуги ---
    if (q.includes('услуг') || q.includes('что делает') || q.includes('направлен') || q.includes('каталог') || q.includes('чем заним') || q.includes('что вы') || q.includes('какие у вас')) {
      return '<strong>Наши услуги:</strong><br><br>⚡ <strong>Готовые сайты под ключ</strong> — от 49 000 ₸ (запуск за 1 день)<br>🤖 <strong>Цифровой сотрудник 24/7</strong> — от 89 000 ₸ (AI-агент для бизнеса)<br>📄 <strong>Лендинг «Профессионал»</strong> — от 49 000 ₸<br>🏢 <strong>Корпоративный сайт «Бизнес»</strong> — от 250 000 ₸<br>📊 <strong>SEO-дашборд «Контроль»</strong> — от 39 000 ₸/мес<br>💬 <strong>AI-бот «Нейро-менеджер»</strong> — от 320 000 ₸<br>📋 <strong>Внедрение CRM Битрикс24</strong> — от 150 000 ₸<br><br>Спросите о любом решении подробнее!';
    }

    // --- Общие цены ---
    if (q.includes('цена') || q.includes('стоим') || q.includes('сколько') || q.includes('тариф') || q.includes('прайс') || q.includes('бюджет') || q.includes('расценк')) {
      return '<strong>Прайс-лист Shebercraft:</strong><br><br>⚡ Готовый сайт — <strong>от 49 000 ₸</strong><br>📄 Лендинг — <strong>от 49 000 ₸</strong><br>🏢 Корп. сайт — <strong>от 250 000 ₸</strong><br>🤖 Цифровой сотрудник — <strong>от 89 000 ₸</strong><br>📊 SEO-дашборд — <strong>от 39 000 ₸/мес</strong><br>💬 AI-бот — <strong>от 320 000 ₸</strong><br>📋 CRM Битрикс24 — <strong>от 150 000 ₸</strong><br><br>Точную стоимость рассчитаем после обсуждения задачи.<br><a href="https://wa.me/77070601980" target="_blank" style="color:#38bdf8">Получить расчёт в WhatsApp →</a>';
    }

    // --- О компании ---
    if (q.includes('о компании') || q.includes('кто вы') || q.includes('shebercraft') || q.includes('шеберкрафт') || q.includes('шебер')) {
      return '<strong>Shebercraft</strong> — это команда из Алматы, которая создаёт цифровые решения для бизнеса в Казахстане.<br><br>Наша специализация:<br>✦ Создание конверсионных сайтов<br>✦ AI-агенты и цифровые сотрудники<br>✦ SEO-аналитика и продвижение<br>✦ Автоматизация через CRM<br><br>Мы помогаем бизнесу зарабатывать больше с помощью технологий. 🚀';
    }

    // --- Fallback (по умолчанию) ---
    return 'Shebercraft — это цифровые решения для бизнеса в Казахстане: сайты, AI-агенты, SEO-аналитика и CRM.<br><br>Спросите меня о:<br>✦ Стоимости сайта или AI-решения<br>✦ Цифровом сотруднике 24/7<br>✦ Сроках запуска<br>✦ Наших контактах<br><br>Или напишите напрямую: <a href="https://wa.me/77070601980" target="_blank" style="color:#38bdf8">WhatsApp →</a>';
  };

  const handleUserMessage = (userText) => {
    if (!userText.trim() || aiQuestionCount >= MAX_FREE_QUESTIONS) return;

    appendAiMessage('user', userText);
    aiQuestionCount++;

    if (aiQuickPrompts) aiQuickPrompts.style.display = 'none';

    // Show Typing indicator
    const typingMsg = appendAiMessage('bot', '<div class="typing-dots"><span></span><span></span><span></span></div>');

    setTimeout(() => {
      if (typingMsg) typingMsg.remove();
      const answerText = getAiAnswer(userText);
      appendAiMessage('bot', answerText);

      if (aiQuestionCount >= MAX_FREE_QUESTIONS) {
        setTimeout(() => {
          const limitMsg = `
            <strong>Вы использовали 5 бесплатных вопросов!</strong><br />
            Для подробного разбора вашей задачи свяжитесь с нашим экспертом — консультация бесплатная:<br /><br />
            <a href="https://wa.me/77070601980?text=%D0%97%D0%B4%D1%80%D0%B0%D0%B2%D1%81%D1%82%D0%B2%D1%83%D0%B9%D1%82%D0%B5!%20%D0%AF%20%D0%B8%D0%B7%20%D0%98%D0%98-%D0%BF%D0%BE%D0%BC%D0%BE%D1%89%D0%BD%D0%B8%D0%BA%D0%B0.%20%D0%A5%D0%BE%D1%87%D1%83%20%D0%B1%D0%B5%D1%81%D0%BF%D0%BB%D0%B0%D1%82%D0%BD%D1%83%D1%8E%20%D0%BA%D0%BE%D0%BD%D1%81%D1%83%D0%BB%D1%8C%D1%82%D0%B0%D1%86%D0%B8%D1%8E" target="_blank" class="btn-primary btn-sm" style="display:inline-block;margin-top:6px;width:100%;text-align:center">Бесплатная консультация в WhatsApp →</a>
          `;
          appendAiMessage('bot', limitMsg);
          if (aiChatInput) {
            aiChatInput.disabled = true;
            aiChatInput.placeholder = 'Бесплатные вопросы исчерпаны';
          }
        }, 600);
      }
    }, 1000);
  };

  if (aiChatForm) {
    aiChatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!aiChatInput) return;
      const text = aiChatInput.value;
      aiChatInput.value = '';
      handleUserMessage(text);
    });
  }

  if (aiQuickPrompts) {
    aiQuickPrompts.querySelectorAll('.ai-prompt-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const promptText = chip.dataset.prompt;
        handleUserMessage(promptText);
      });
    });
  }

  console.log('%c Shebercraft ', 'background:#38bdf8;color:#0b0c0a;font-weight:700;padding:4px 8px;border-radius:4px;font-size:14px;', 'Цифровые решения для бизнеса Казахстана');
});
