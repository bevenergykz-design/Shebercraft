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
    <a href="#crm" class="mobile-nav-link">CRM & БП</a>
    <a href="#catalog" class="mobile-nav-link">Каталог</a>
    <a href="#cases" class="mobile-nav-link">Кейсы</a>
    <a href="#articles" class="mobile-nav-link">Статьи</a>
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

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && articleModal && articleModal.classList.contains('open')) {
      toggleArticleModal(false);
    }
  });

  // ===== AI CONSULTANT WIDGET LOGIC =====
  const aiTriggerBtn = document.getElementById('aiTriggerBtn');
  const aiChatWindow = document.getElementById('aiChatWindow');
  const aiChatClose = document.getElementById('aiChatClose');
  const aiChatMessages = document.getElementById('aiChatMessages');
  const aiChatForm = document.getElementById('aiChatForm');
  const aiChatInput = document.getElementById('aiChatInput');
  const aiQuickPrompts = document.getElementById('aiQuickPrompts');

  let aiQuestionCount = 0;
  const MAX_FREE_QUESTIONS = 3;

  const toggleAiChat = (open) => {
    if (!aiChatWindow) return;
    const isOpen = open !== undefined ? open : !aiChatWindow.classList.contains('open');
    aiChatWindow.classList.toggle('open', isOpen);
    aiChatWindow.setAttribute('aria-hidden', !isOpen);
  };

  if (aiTriggerBtn) aiTriggerBtn.addEventListener('click', () => toggleAiChat());
  if (aiChatClose) aiChatClose.addEventListener('click', () => toggleAiChat(false));

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
    if (q.includes('счет') || q.includes('оплат') || q.includes('финанс') || q.includes('лимит') || q.includes('деньг')) {
      return 'В Битрикс24 согласование счетов автоматизируется через БП: система проверяет лимит (например, счета до 500 тыс. ₸ утверждаются автоматически), сама находит ответственного и передает данные в 1С Бухгалтерию без ручного контроля!';
    }
    if (q.includes('договор') || q.includes('документ') || q.includes('юрист') || q.includes('акт')) {
      return 'Бизнес-процессы сокращают время согласования договоров с 5 дней до 30 минут. Договор автоматически генерируется по шаблону из CRM, уходит параллельно юристу и бухгалтеру, а при задержке эскалирует задачу руководителю.';
    }
    if (q.includes('кадр') || q.includes('отпуск') || q.includes('прием') || q.includes('onboard') || q.includes('сотрудник')) {
      return 'Кадровый БП берет на себя все бланки: отпуск оформляется в 1 клик. При выходе нового сотрудника система автоматически создает учетки, заказывает технику у IT и назначает пошаговый план адаптации.';
    }
    if (q.includes('цена') || q.includes('стоим') || q.includes('сколько') || q.includes('тариф') || q.includes('прайс')) {
      return 'Стоимость настройки бизнес-процессов зависит от сложности: базовые роботы и автоматизация от 200 000 ₸, а комплексное внедрение БП для всей компании под ключ — от 450 000 ₸. Включает проектирование, интеграции и обучение.';
    }
    if (q.includes('привет') || q.includes('здравствуй') || q.includes('добрый')) {
      return 'Здравствуйте! Я готов проконсультировать вас по любым вопросам автоматизации бизнес-процессов в Битрикс24. О чем вы хотели бы узнать?';
    }
    return 'Бизнес-процессы в Битрикс24 связывают все отделы компании в единый механизм без необходимости вручную ставить задачи каждому сотруднику. Мы проектируем индивидуальные сценарии под ваш бизнес!';
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
            <strong>Вы использовали 3 бесплатных вопроса бета-версии!</strong><br />
            Для подробного разбора и аудита процессов вашей компании свяжитесь с нашим ведущим экспертом:<br /><br />
            <a href="https://wa.me/77070601980?text=%D0%97%D0%B4%D1%80%D0%B0%D0%B2%D1%81%D1%82%D0%B2%D1%83%D0%B9%D1%82%D0%B5!%20%D0%AF%20%D0%B8%D0%B7%20%D0%98%D0%98-%D0%BA%D0%BE%D0%BD%D1%81%D1%83%D0%BB%D1%8C%D1%82%D0%B0%D0%BD%D1%82%D0%B0.%20%D0%A5%D0%BE%D1%87%D1%83%20%D0%B1%D0%B5%D1%81%D0%BF%D0%BB%D0%B0%D1%82%D0%BD%D1%8B%D0%B9%20%D0%B0%D1%83%D0%B4%D0%B8%D1%82%20%D0%91%D0%9F" target="_blank" class="btn-primary btn-sm" style="display:inline-block;margin-top:6px;width:100%;text-align:center">Консультация в WhatsApp →</a>
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
