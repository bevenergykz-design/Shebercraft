// Бургер-меню общей шапки + подсветка текущего раздела
(function () {
  var b = document.querySelector('.sh-burger');
  var nav = document.getElementById('shNav');
  if (b && nav) {
    b.addEventListener('click', function () {
      var open = nav.classList.toggle('sh-open');
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.addEventListener('click', function (e) { if (e.target.tagName === 'A') nav.classList.remove('sh-open'); });
  }
  var p = location.pathname;
  document.querySelectorAll('.sh-nav a[data-sec]').forEach(function (a) {
    if (a.getAttribute('data-sec').split(',').some(function (s) { return s && p.indexOf(s) === 0; })) a.classList.add('sh-active');
  });
})();
