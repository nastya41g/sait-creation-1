/* ==========================================================================
   BestGames — ранняя инициализация темы.
   Подключается в <head> БЕЗ defer, чтобы применить сохранённую тему
   до отрисовки страницы (без «мигания» светлого/тёмного фона).
   Тёмная тема — по умолчанию; выбор хранится в localStorage.
   Если у <html> есть атрибут data-forced-theme — тема зафиксирована
   (используется на index_light.html).
   ========================================================================== */
(function () {
  var root = document.documentElement;
  var forced = root.getAttribute('data-forced-theme');
  var saved = null;

  try {
    saved = localStorage.getItem('bestgames-theme');
  } catch (e) {
    /* localStorage может быть недоступен — остаёмся на тёмной теме */
  }

  var theme = forced || (saved === 'light' ? 'light' : 'dark');
  root.classList.remove('theme-dark', 'theme-light');
  root.classList.add('theme-' + theme, 'js');
})();
