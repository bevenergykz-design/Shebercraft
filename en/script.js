/* =====================================================
   SHEBERCRAFT — International / English JavaScript
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
    if (navbar) {
      navbar.classList.toggle('scrolled', scrollY > 60);
    }
    if (backToTop) {
      backToTop.classList.toggle('visible', scrollY > 300);
    }
  };

  window.addEventListener('scroll', () => {
    updateScrollProgress();
    handleScrollEffects();
  }, { passive: true });

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ===== MOBILE BURGER MENU =====
  const burgerBtn = document.getElementById('burgerBtn');
  const navLinks = document.getElementById('navLinks');

  if (burgerBtn && navLinks) {
    burgerBtn.addEventListener('click', () => {
      burgerBtn.classList.toggle('active');
      navLinks.classList.toggle('open');
      document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        burgerBtn.classList.remove('active');
        navLinks.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

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
      el.textContent = isDecimal ? value.toFixed(1) : Math.floor(value).toLocaleString('en-US');
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = isDecimal ? target.toFixed(1) : target.toLocaleString('en-US');
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

  // ===== CONTACT FORM SUBMISSION =====
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

    if (!name || !phone) {
      const targetEl = !name ? document.getElementById('name') : document.getElementById('phone');
      targetEl.focus();
      targetEl.style.borderColor = 'var(--color-danger)';
      setTimeout(() => { targetEl.style.borderColor = ''; }, 2000);
      return;
    }

    submitBtn.disabled = true;
    const btnSpan = submitBtn.querySelector('span');
    if (btnSpan) btnSpan.textContent = 'Submitting...';

    // Prepare email payload for info@shebercraft.kz
    const emailPayload = {
      name: name || 'N/A',
      company: company || 'N/A',
      contact: phone,
      interest: serviceText || 'General Architecture',
      scope: message || 'No scope provided',
      _subject: `🇺🇸 New US / International Lead: ${name} (${phone})`,
      _replyto: 'info@shebercraft.kz',
      _template: 'table',
      _captcha: 'false'
    };

    // 1. Primary: Send email to info@shebercraft.kz via FormSubmit
    try {
      await fetch('https://formsubmit.co/ajax/info@shebercraft.kz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(emailPayload)
      });
    } catch (err) {
      console.warn('FormSubmit notice:', err);
    }

    // 2. Secondary: Netlify Forms native POST
    try {
      const formData = new FormData(contactForm);
      if (!formData.has('form-name')) formData.append('form-name', 'contact');
      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData).toString()
      }).catch(() => {});
    } catch (e) {}

    // 3. Silent Telegram notification in background
    const TELEGRAM_BOT_TOKEN = '8953811443:AAHKxOKpIPM26NLim0eKuLFJL_U1fWOlcKo';
    const TELEGRAM_CHAT_ID = '1994851440';
    if (TELEGRAM_CHAT_ID) {
      const telegramText = `🇺🇸 <b>New US / International Lead from Shebercraft!</b>\n\n👤 <b>Name:</b> ${name}\n🏢 <b>Company:</b> ${company || 'N/A'}\n📧 <b>Contact:</b> ${phone}\n⚙️ <b>Interest:</b> ${serviceText || 'General Architecture'}\n📝 <b>Scope:</b> ${message || 'No description provided'}`;
      fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: telegramText,
          parse_mode: 'HTML'
        })
      }).catch(() => {});
    }

    if (toast) {
      toast.querySelector('span').textContent = 'Inquiry received! Our technical lead will contact you within 2 business hours.';
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 4500);
    }

    contactForm.reset();
    submitBtn.disabled = false;
    if (btnSpan) btnSpan.textContent = 'Request Strategy Roadmap';
  });

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

  // ===== AI SOLUTIONS CONSULTANT CHAT LOGIC =====
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

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (aiChatWindow && aiChatWindow.classList.contains('open')) toggleAiChat(false);
      if (smartFabContainer && smartFabContainer.classList.contains('active')) toggleSmartFabMenu(false);
    }
  });

  const appendAiMessage = (sender, text) => {
    if (!aiChatMessages) return null;
    const msgDiv = document.createElement('div');
    msgDiv.className = `ai-msg ai-msg--${sender}`;
    msgDiv.innerHTML = `<div class="ai-msg-bubble">${text}</div>`;
    aiChatMessages.appendChild(msgDiv);
    aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
    return msgDiv;
  };

  const getAiAnswer = (query) => {
    const q = query.toLowerCase();

    // Greeting
    if (q.includes('hi') || q.includes('hello') || q.includes('hey') || q.includes('good morning') || q.includes('good afternoon')) {
      return "Hello! 👋 I'm the Shebercraft AI Solutions Consultant. I can walk you through our autonomous AI agents, custom web apps, USD pricing, or sprint timelines. What's on your mind?";
    }

    // AI Agents / Autonomous Employee / Concierge
    if (q.includes('ai agent') || q.includes('concierge') || q.includes('rag') || q.includes('chatbot') || q.includes('bot') || q.includes('employee') || q.includes('qualif')) {
      return "<strong>Autonomous AI Agents & Concierge ($2,490 fixed):</strong><br><br>✦ Powered by OpenAI GPT-4o & Claude 3.5 Sonnet<br>✦ <strong>Custom RAG vector brain</strong> indexed on your private company docs with zero hallucinations<br>✦ 24/7 lead qualification & automated Calendly booking<br>✦ Live sync with HubSpot, Salesforce, GoHighLevel & Slack<br>✦ Multi-channel: Web chat widget + SMS/Twilio<br><br>⏱ Delivery turnaround: <strong>10–14 business days</strong>.<br><br><a href='#pricing' style='color:#38bdf8'>View AI Agent specifications →</a>";
    }

    // Pricing / Cost / Investment in USD
    if (q.includes('price') || q.includes('cost') || q.includes('how much') || q.includes('usd') || q.includes('pricing') || q.includes('rate') || q.includes('package')) {
      return "<strong>Shebercraft Transparent USD Pricing:</strong><br><br>⚡ <strong>Sprint Landing Page</strong> — $1,490 (7-day delivery, bespoke UI/UX, React/Next.js)<br>🤖 <strong>Autonomous AI Concierge</strong> — $2,490 (custom RAG, CRM & Calendly sync, 24/7)<br>🏢 <strong>Corporate Web Application</strong> — from $4,900 (up to 15 pages, CMS, GEO setup)<br>🔍 <strong>Generative Engine SEO (GEO)</strong> — from $1,200/month<br>🛠️ <strong>Enterprise Dedicated Retainer</strong> — from $3,500/month<br><br>All packages include 100% IP ownership & 30–60 days warranty.<br><a href='#contact' style='color:#38bdf8'>Book a free strategy roadmap call →</a>";
    }

    // Timelines & Sprints
    if (q.includes('time') || q.includes('timeline') || q.includes('turnaround') || q.includes('how fast') || q.includes('how long') || q.includes('sprint') || q.includes('schedule')) {
      return "<strong>Sprint Delivery Timelines:</strong><br><br>⚡ <strong>B2B Landing Page</strong>: 7 business days<br>🤖 <strong>Autonomous AI Agent</strong>: 10–14 business days<br>🏢 <strong>Corporate Web Application</strong>: 14–21 business days<br><br>We work in rapid, transparent 2-week sprints with daily async updates in your dedicated private Slack channel.";
    }

    // IP Ownership, NDA, Security
    if (q.includes('ip') || q.includes('ownership') || q.includes('code') || q.includes('source code') || q.includes('nda') || q.includes('security') || q.includes('privacy')) {
      return "<strong>100% Intellectual Property & Security Guarantees:</strong><br><br>🔒 <strong>Full Code Ownership:</strong> All source code, Figma design files, prompt architectures, and vector database schemas transfer 100% to your company upon final milestone.<br>🔒 <strong>Zero Vendor Lock-in:</strong> Clean, documented TypeScript/Next.js/Python code you can host anywhere.<br>🔒 <strong>Data Privacy:</strong> Your proprietary knowledge base is never used to train public LLMs.<br>🔒 <strong>Bilateral NDA:</strong> Signed prior to any architectural kickoff.";
    }

    // Tech Stack & Languages
    if (q.includes('tech stack') || q.includes('stack') || q.includes('technology') || q.includes('react') || q.includes('next') || q.includes('python') || q.includes('langchain')) {
      return "<strong>Our Production Tech Stack:</strong><br><br>🌐 <strong>Frontend:</strong> React, Next.js 14+, TypeScript, Tailwind CSS, Framer Motion<br>🧠 <strong>AI & LLMs:</strong> OpenAI GPT-4o, Anthropic Claude 3.5 Sonnet, LangChain, Pinecone / Qdrant vector databases<br>⚙️ <strong>Backend & APIs:</strong> Node.js, Python FastAPI, PostgreSQL, Supabase<br>🔌 <strong>Integrations:</strong> HubSpot, Salesforce, GoHighLevel, Stripe, Slack, Zapier, Make.com";
    }

    // Generative Engine Optimization (GEO)
    if (q.includes('geo') || q.includes('seo') || q.includes('perplexity') || q.includes('chatgpt search') || q.includes('google') || q.includes('rank') || q.includes('traffic')) {
      return "<strong>Generative Engine Optimization (GEO) & Technical SEO:</strong><br><br>While traditional SEO focuses on 10 blue links on Google, <strong>GEO</strong> ensures your brand is synthesized, cited, and recommended inside Perplexity, ChatGPT Search, Claude, and Google AI Overviews when prospective buyers ask for solutions in your industry.<br><br>Retainers start at $1,200/mo and include technical site audits, schema graph architecture, and entity-based authoritative content.";
    }

    // Contact & Booking
    if (q.includes('contact') || q.includes('call') || q.includes('book') || q.includes('talk') || q.includes('email') || q.includes('phone') || q.includes('meeting') || q.includes('schedule')) {
      return "<strong>Schedule A Technical Strategy Session:</strong><br><br>📧 <strong>Email:</strong> <a href='mailto:info@shebercraft.kz' style='color:#38bdf8'>info@shebercraft.kz</a><br>💬 <strong>WhatsApp:</strong> <a href='https://wa.me/77070601980?text=Hello%20Shebercraft!%20I%20would%20like%20to%20schedule%20a%20strategy%20call.' target='_blank' style='color:#38bdf8'>+7 707 060-19-80</a><br>✈️ <strong>Telegram:</strong> <a href='https://t.me/sheber_craft' target='_blank' style='color:#38bdf8'>@sheber_craft</a><br><br>Or fill out the form below on this page for a detailed architectural proposal within 2 hours!";
    }

    // Fallback
    return "Shebercraft engineers autonomous AI agents, conversion web apps, and Generative Engine Optimization (GEO) for US & global businesses.<br><br>Feel free to ask about:<br>✦ AI Agent capabilities & RAG setups<br>✦ Fixed USD package pricing<br>✦ Sprint delivery timelines (7–14 days)<br>✦ 100% IP ownership & NDA<br><br>Or schedule a strategy session directly: <a href='#contact' style='color:#38bdf8'>Schedule Call →</a>";
  };

  const handleUserMessage = (userText) => {
    if (!userText.trim() || aiQuestionCount >= MAX_FREE_QUESTIONS) return;

    appendAiMessage('user', userText);
    aiQuestionCount++;

    if (aiQuickPrompts) aiQuickPrompts.style.display = 'none';

    // Typing dots
    const typingMsg = appendAiMessage('bot', '<div class="typing-dots"><span></span><span></span><span></span></div>');

    setTimeout(() => {
      if (typingMsg) typingMsg.remove();
      const answerText = getAiAnswer(userText);
      appendAiMessage('bot', answerText);

      if (aiQuestionCount >= MAX_FREE_QUESTIONS) {
        setTimeout(() => {
          const limitMsg = `
            <strong>You've completed 5 exploratory questions!</strong><br />
            To discuss your technical architecture and receive a tailored scope document, book a complimentary strategy call with our engineering leads:<br /><br />
            <a href="#contact" class="btn-primary btn-sm" style="display:inline-block;width:100%;text-align:center;">Schedule Free Strategy Call →</a>
          `;
          appendAiMessage('bot', limitMsg);
          if (aiChatInput) {
            aiChatInput.disabled = true;
            aiChatInput.placeholder = 'Consultation limit reached. Please use form.';
          }
        }, 600);
      }
    }, 800);
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
        handleUserMessage(chip.dataset.prompt);
      });
    });
  }

  console.log('%c Shebercraft International ', 'background:#38bdf8;color:#0b0c0a;font-weight:700;padding:4px 8px;border-radius:4px;font-size:14px;', 'Autonomous AI Agents & Web Engineering for US & Global Markets');
});
