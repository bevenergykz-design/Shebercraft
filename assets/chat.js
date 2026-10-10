// Цифровой сотрудник: чат на сайте (бэкенд — /chat.php)
(function () {
  var KK = document.documentElement.lang === 'kk';
  var T = KK ? {
    greeting: 'Сәлеметсіз бе! Мен Виктордың цифрлық қызметкерімін — адам емес, ЖИ-көмекшімін. Сайттар, цифрлық қызметкерлер және Битрикс24 туралы айтып, бюджетті шамалап, өтініміңізді Викторға жеткізе аламын. Неден бастаймыз? Қазақша да, орысша да жаза беріңіз.',
    chips: ['Сайт жасау қанша тұрады?', 'Цифрлық қызметкер не істей алады?', 'Қашықтан жұмыс істейсіз бе?', 'Ол менің бизнесіме керек пе?'],
    menu: [
      ['💰 Бағалар', 'Қызметтеріңіз қанша тұрады?'],
      ['⏱ Мерзімдер', 'Қанша уақытта жасайсыз?'],
      ['🌐 Сайттар', 'Маған қандай сайт керек: лендинг пе, корпоративтік пе?'],
      ['🤖 Цифрлық қызметкер', 'Цифрлық қызметкер деген не?'],
      ['📊 Битрикс24', 'Битрикс24 деген не және маған CRM керек пе?'],
      ['🔎 SEO және іздеу', 'SEO және сайтты жылжытумен айналысасыз ба?'],
      ['🧑‍💻 Виктор туралы', 'Өзіңіз туралы айтыңызшы, тәжірибеңіз қандай?'],
      ['🖼 Жұмыс мысалдары', 'Жұмыс мысалдарын көрсетіңіз'],
      ['📞 Байланыс', 'Сізбен қалай байланысуға болады?'],
      ['✍️ Өтінім қалдыру', 'Өтінім қалдырғым келеді']
    ],
    launch: 'Қызметкерден сұрау', launchAria: 'Цифрлық қызметкермен чатты ашу', dialog: 'Цифрлық қызметкермен чат',
    title: 'Цифрлық қызметкер', sub: 'Виктордың ЖИ-көмекшісі', back: '← Артқа', backAria: 'Тақырыптарға оралу', close: 'Жабу',
    ph: 'Сұрағыңызды жазыңыз…', msgAria: 'Сіздің хабарламаңыз', sendAria: 'Жіберу',
    foot: 'Бұл ЖИ. Өтінімдер Викторға жеке жеткізіледі. <a href="/kk/kupiyalylyk-sayasaty/">Құпиялылық</a>',
    restart: '↺ Басынан бастау', lead: '✍️ Өтінім қалдыру', leadQ: 'Өтінім қалдырғым келеді', typing: 'жазып жатыр…',
    fail: 'Жауап беру мүмкін болмады.', wa: ' Викторға WhatsApp-қа жазыңыз: +7 707 250-66-80.',
    offline: 'Сервермен байланыс жоқ. Викторға WhatsApp-қа жазыңыз: +7 707 250-66-80.'
  } : {
    greeting: 'Здравствуйте! Я цифровой сотрудник Виктора — AI-ассистент, а не человек. Могу рассказать про сайты, цифровых сотрудников и Битрикс24, прикинуть бюджет и передать вашу заявку Виктору. С чего начнём?',
    chips: ['Сколько стоит сайт?', 'Что умеет цифровой сотрудник?', 'Вы работаете удалённо?', 'Нужен ли он моему бизнесу?'],
    menu: [
      ['💰 Цены', 'Сколько стоят ваши услуги?'],
      ['⏱ Сроки', 'Как быстро вы работаете?'],
      ['🌐 Сайты', 'Какой сайт мне нужен: лендинг или корпоративный?'],
      ['🤖 Цифровой сотрудник', 'Что такое цифровой сотрудник?'],
      ['📊 Битрикс24', 'Что такое Битрикс24 и нужна ли мне CRM?'],
      ['🔎 SEO и поиск', 'Делаете ли вы SEO и продвижение?'],
      ['🧑‍💻 О Викторе', 'Расскажите о себе, какой у вас опыт?'],
      ['🖼 Примеры работ', 'Покажите примеры работ'],
      ['📞 Контакты', 'Как с вами связаться?'],
      ['✍️ Оставить заявку', 'Хочу оставить заявку']
    ],
    launch: 'Спросить сотрудника', launchAria: 'Открыть чат с цифровым сотрудником', dialog: 'Чат с цифровым сотрудником',
    title: 'Цифровой сотрудник', sub: 'AI-ассистент Виктора', back: '← Назад', backAria: 'Назад к темам', close: 'Закрыть',
    ph: 'Напишите вопрос…', msgAria: 'Ваше сообщение', sendAria: 'Отправить',
    foot: 'Это AI. Заявки передаются Виктору лично. <a href="/politika-konfidencialnosti/">Конфиденциальность</a>',
    restart: '↺ Начать заново', lead: '✍️ Оставить заявку', leadQ: 'Хочу оставить заявку', typing: 'печатает…',
    fail: 'Не получилось ответить.', wa: ' Напишите Виктору в WhatsApp: +7 707 250-66-80.',
    offline: 'Нет связи с сервером. Напишите Виктору в WhatsApp: +7 707 250-66-80.'
  };
  var history = [];
  var busy = false;

  var root = document.createElement('div');
  root.className = 'chat';
  root.innerHTML =
    '<button class="chat-launch" type="button" aria-label="' + T.launchAria + '">' +
      '<span class="chat-dot"></span>' + T.launch + '</button>' +
    '<section class="chat-panel" role="dialog" aria-label="' + T.dialog + '" hidden>' +
      '<header><div><b>' + T.title + '</b><small>' + T.sub + '</small></div>' +
      '<div class="chat-hbtns"><button type="button" class="chat-menu" aria-label="' + T.backAria + '">' + T.back + '</button>' +
      '<button type="button" class="chat-close" aria-label="' + T.close + '">×</button></div></header>' +
      '<div class="chat-log" aria-live="polite"></div>' +
      '<form class="chat-form"><input type="text" name="website" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">' +
      '<input type="text" name="q" placeholder="' + T.ph + '" maxlength="500" autocomplete="off" aria-label="' + T.msgAria + '">' +
      '<button type="submit" aria-label="' + T.sendAria + '">→</button></form>' +
      '<p class="chat-foot">' + T.foot + '</p>' +
    '</section>';
  document.body.appendChild(root);

  var launch = root.querySelector('.chat-launch');
  var panel = root.querySelector('.chat-panel');
  var log = root.querySelector('.chat-log');
  var chips = null;
  var form = root.querySelector('.chat-form');
  var input = form.elements.q;

  function add(role, text) {
    var d = document.createElement('div');
    d.className = 'msg ' + role;
    d.textContent = text;
    log.appendChild(d);
    if (role === 'bot') {
      // ответ показываем с первой строки: если он выше окна, не прокручиваем к самому низу
      log.scrollTop = d.offsetHeight > log.clientHeight - 16 ? Math.max(0, d.offsetTop - 10) : log.scrollHeight;
    } else {
      log.scrollTop = log.scrollHeight;
    }
    return d;
  }
  function open() {
    panel.hidden = false;
    launch.classList.add('hidden');
    if (!log.children.length) {
      add('bot', T.greeting);
      newChips();
      T.chips.forEach(function (c) { chip(c, function () { send(c); }); });
      chip(T.back, showMenu);
    }
    setTimeout(function () { input.focus(); }, 50);
  }
  function newChips() {
    if (chips && chips.parentNode) chips.parentNode.removeChild(chips);
    chips = document.createElement('div');
    chips.className = 'chat-chips';
    log.appendChild(chips);
  }
  function chip(label, fn) {
    var b = document.createElement('button');
    b.type = 'button'; b.textContent = label;
    b.addEventListener('click', fn);
    chips.appendChild(b);
  }
  function showMenu() {
    newChips();
    T.menu.forEach(function (m) { chip(m[0], function () { send(m[1]); }); });
    chip(T.restart, reset);
    log.scrollTop = Math.max(0, chips.offsetTop - 12);
  }
  function showFollowUps() {
    newChips();
    chip(T.back, showMenu);
    chip(T.lead, function () { send(T.leadQ); });
  }
  function reset() {
    history = [];
    log.innerHTML = '';
    chips = null;
    add('bot', T.greeting);
    showMenu();
  }
  function close() { panel.hidden = true; launch.classList.remove('hidden'); }

  async function send(text) {
    text = (text || '').trim();
    if (!text || busy) return;
    busy = true;
    if (chips && chips.parentNode) chips.parentNode.removeChild(chips);
    add('user', text);
    history.push({ role: 'user', content: text });
    var typing = add('bot typing', T.typing);
    var reply = '', ok = false;
    try {
      var res = await fetch('/chat.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, page: location.pathname, lang: KK ? 'kk' : 'ru', website: form.elements.website.value })
      });
      var data = await res.json().catch(function () { return {}; });
      if (res.ok && data.reply) { reply = data.reply; ok = true; }
      else reply = (data.error || T.fail) + T.wa;
    } catch (e) {
      reply = T.offline;
    }
    typing.remove();
    add('bot', reply);
    if (ok) history.push({ role: 'assistant', content: reply });
    else history.pop();
    busy = false;
    showFollowUps();
    input.focus();
  }

  launch.addEventListener('click', open);
  root.querySelector('.chat-close').addEventListener('click', close);
  root.querySelector('.chat-menu').addEventListener('click', showMenu);
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var t = input.value; input.value = '';
    send(t);
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) close(); });
  document.querySelectorAll('[data-open-chat]').forEach(function (el) {
    el.addEventListener('click', function (e) { e.preventDefault(); open(); });
  });
})();
