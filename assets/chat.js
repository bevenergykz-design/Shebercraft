// Цифровой сотрудник: чат на сайте (бэкенд — /chat.php)
(function () {
  var GREETING = 'Здравствуйте! Я цифровой сотрудник Виктора — AI-ассистент, а не человек. Могу рассказать про сайты, цифровых сотрудников и Битрикс24, прикинуть бюджет и передать вашу заявку Виктору. С чего начнём?';
  var CHIPS = ['Сколько стоит сайт?', 'Что умеет цифровой сотрудник?', 'Вы работаете удалённо?', 'Нужен ли он моему бизнесу?'];
  var MENU = [
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
  ];
  var history = [];
  var busy = false;

  var root = document.createElement('div');
  root.className = 'chat';
  root.innerHTML =
    '<button class="chat-launch" type="button" aria-label="Открыть чат с цифровым сотрудником">' +
      '<span class="chat-dot"></span>Спросить сотрудника</button>' +
    '<section class="chat-panel" role="dialog" aria-label="Чат с цифровым сотрудником" hidden>' +
      '<header><div><b>Цифровой сотрудник</b><small>AI-ассистент Виктора</small></div>' +
      '<div class="chat-hbtns"><button type="button" class="chat-menu" aria-label="Назад к темам">← Назад</button>' +
      '<button type="button" class="chat-close" aria-label="Закрыть">×</button></div></header>' +
      '<div class="chat-log" aria-live="polite"></div>' +
      '<form class="chat-form"><input type="text" name="website" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">' +
      '<input type="text" name="q" placeholder="Напишите вопрос…" maxlength="500" autocomplete="off" aria-label="Ваше сообщение">' +
      '<button type="submit" aria-label="Отправить">→</button></form>' +
      '<p class="chat-foot">Это AI. Заявки передаются Виктору лично. <a href="/politika-konfidencialnosti/">Конфиденциальность</a></p>' +
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
      add('bot', GREETING);
      newChips();
      CHIPS.forEach(function (c) { chip(c, function () { send(c); }); });
      chip('← Назад', showMenu);
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
    MENU.forEach(function (m) { chip(m[0], function () { send(m[1]); }); });
    chip('↺ Начать заново', reset);
    log.scrollTop = Math.max(0, chips.offsetTop - 12);
  }
  function showFollowUps() {
    newChips();
    chip('← Назад', showMenu);
    chip('✍️ Оставить заявку', function () { send('Хочу оставить заявку'); });
  }
  function reset() {
    history = [];
    log.innerHTML = '';
    chips = null;
    add('bot', GREETING);
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
    var typing = add('bot typing', 'печатает…');
    var reply = '', ok = false;
    try {
      var res = await fetch('/chat.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, page: location.pathname, website: form.elements.website.value })
      });
      var data = await res.json().catch(function () { return {}; });
      if (res.ok && data.reply) { reply = data.reply; ok = true; }
      else reply = (data.error || 'Не получилось ответить.') + ' Напишите Виктору в WhatsApp: +7 707 250-66-80.';
    } catch (e) {
      reply = 'Нет связи с сервером. Напишите Виктору в WhatsApp: +7 707 250-66-80.';
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
