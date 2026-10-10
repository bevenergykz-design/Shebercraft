// Форма заявки → /send_form.php (Telegram + почта). Ошибку показываем честно.
(function () {
  var form = document.getElementById('lead-form');
  if (!form) return;
  var status = form.querySelector('.status');
  var btn = form.querySelector('button[type=submit]');
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    var f = new FormData(form);
    var phone = String(f.get('phone') || '').replace(/\D/g, '');
    status.className = 'status';
    status.textContent = '';
    if (phone.length < 10) {
      status.textContent = 'Укажите телефон — минимум 10 цифр.';
      status.classList.add('err');
      status.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return;
    }
    btn.disabled = true;
    btn.textContent = 'Отправляю…';
    var ok = false, err = '';
    try {
      var res = await fetch('/send_form.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: f.get('name') || 'Не указано',
          company: f.get('company') || 'Не указана',
          phone: f.get('phone'),
          service: f.get('service') || 'Не выбрано',
          message: f.get('message') || 'Без комментария',
          page: location.href,
          website: f.get('website') || ''
        })
      });
      var data = await res.json().catch(function () { return {}; });
      ok = res.ok && data.success !== false;
      err = data.error || '';
    } catch (x) {}
    if (ok) {
      form.reset();
      status.textContent = 'Спасибо! Я отвечу в течение рабочего дня — обычно быстрее.';
      status.classList.add('ok');
    } else {
      status.innerHTML = (err || 'Не получилось отправить.') + ' Напишите в <a href="https://wa.me/77072506680">WhatsApp</a> — отвечу там.';
      status.classList.add('err');
    }
    status.scrollIntoView({ block: 'center', behavior: 'smooth' });
    btn.disabled = false;
    btn.textContent = 'Отправить';
  });
})();
