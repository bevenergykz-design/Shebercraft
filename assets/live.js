// Форма заявки → /send_form.php (Telegram + почта). Ошибку показываем честно.
(function () {
  var form = document.getElementById('lead-form');
  if (!form) return;
  var KK = document.documentElement.lang === 'kk';
  var T = KK ? {
    phone: 'Телефонды көрсетіңіз — кемінде 10 сан.',
    sending: 'Жіберіп жатырмын…',
    ok: 'Рахмет! Жұмыс күні ішінде жауап беремін — әдетте тезірек.',
    fail: 'Жіберу мүмкін болмады.',
    wa: ' <a href="https://wa.me/77072506680">WhatsApp</a>-қа жазыңыз — сол жерде жауап беремін.',
    send: 'Жіберу'
  } : {
    phone: 'Укажите телефон — минимум 10 цифр.',
    sending: 'Отправляю…',
    ok: 'Спасибо! Я отвечу в течение рабочего дня — обычно быстрее.',
    fail: 'Не получилось отправить.',
    wa: ' Напишите в <a href="https://wa.me/77072506680">WhatsApp</a> — отвечу там.',
    send: 'Отправить'
  };
  var status = form.querySelector('.status');
  var btn = form.querySelector('button[type=submit]');
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    var f = new FormData(form);
    var phone = String(f.get('phone') || '').replace(/\D/g, '');
    status.className = 'status';
    status.textContent = '';
    if (phone.length < 10) {
      status.textContent = T.phone;
      status.classList.add('err');
      status.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return;
    }
    btn.disabled = true;
    btn.textContent = T.sending;
    var ok = false, err = '';
    try {
      var res = await fetch('/send_form.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: f.get('name') || 'Не указано',
          company: f.get('company') || 'Не указана',
          phone: f.get('phone'),
          service: (f.get('service') || 'Не выбрано') + (KK ? ' (казахская версия сайта)' : ''),
          message: f.get('message') || 'Без комментария',
          page: location.href,
          website: f.get('website') || ''
        })
      });
      var data = await res.json().catch(function () { return {}; });
      ok = res.ok && data.success !== false;
      err = KK ? '' : (data.error || '');
    } catch (x) {}
    if (ok) {
      form.reset();
      status.textContent = T.ok;
      status.classList.add('ok');
    } else {
      status.innerHTML = (err || T.fail) + T.wa;
      status.classList.add('err');
    }
    status.scrollIntoView({ block: 'center', behavior: 'smooth' });
    btn.disabled = false;
    btn.textContent = T.send;
  });
})();
