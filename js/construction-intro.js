(function () {
  var root = document.documentElement;
  if (!root.classList.contains('construction-intro')) return;
  var brand = document.querySelector('.ed-hero__brand');
  var logo = document.querySelector('.teaser-logo');
  if (!brand || !logo || !brand.animate) {
    root.classList.remove('construction-intro');
    return;
  }
  var motion = matchMedia('(prefers-reduced-motion: reduce)');
  var moving = false;
  var travel;
  function finish() {
    root.classList.remove('construction-intro', 'construction-intro-ready');
    root.classList.add('construction-intro-done');
    brand.style.transform = '';
    if (travel) travel.cancel();
  }
  function position() {
    var box = brand.getBoundingClientRect();
    var graphic = logo.getBoundingClientRect();
    var scale = Math.min(innerWidth * .78, 650) / graphic.width;
    brand.style.transform = 'translate(' + (innerWidth / 2 - (box.left + box.width / 2)) + 'px,' +
      (innerHeight / 2 - (box.top + box.height / 2)) + 'px) scale(' + scale + ')';
    root.classList.add('construction-intro-ready');
  }
  function settle() {
    if (moving || !root.classList.contains('construction-intro')) return;
    moving = true;
    travel = brand.animate([{ transform: brand.style.transform }, { transform: 'none' }], {
      duration: 1100, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'forwards'
    });
    travel.finished.then(finish).catch(finish);
  }
  position();
  logo.lastElementChild.lastElementChild.addEventListener('animationend', function (event) {
    if (event.animationName === 'teaser-fill') settle();
  });
  // Si el navegador omite el evento, la presentación se completa igualmente.
  setTimeout(settle, 4800);
  window.addEventListener('resize', finish, { once: true });
  motion.addEventListener('change', function () { if (motion.matches) finish(); });
})();
