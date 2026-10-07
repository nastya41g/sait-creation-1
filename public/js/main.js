/* ==========================================================================
   BestGames — общий скрипт всех страниц (vanilla JS, без модулей).
   Каждый модуль запускается, только если на странице есть нужная разметка.
   Содержание:
     1. Утилиты (уведомления, форматирование цены)
     2. Переключение темы
     3. Выезжающие панели (бургер-меню, фильтр каталога)
     4. Слайдер новинок
     5. Поиск по жанрам с подсказками
     6. Каталог: фильтр по жанрам + чтение ?genre
     7. Каталог: модальное окно «Подробнее»
     8. Валидация форм: вход, регистрация, админ-панель
     9. Личный кабинет: тема, смена пароля
    10. Появление секций при прокрутке
    11. Чат поддержки с автоответами
   ========================================================================== */
(function () {
  'use strict';

  var THEME_KEY = 'bestgames-theme';
  var GENRES = ['Экшен', 'RPG', 'Стратегия', 'Гонки', 'Хоррор', 'Инди', 'Шутер', 'Симулятор', 'Спорт'];
  var GAMES = [
    { title: 'Starfall Legion', genre: 'Стратегия', developer: 'Nova Forge', price: 1499, image: 'img/starfall-legion-card.webp' },
    { title: 'Hollow Pines', genre: 'Хоррор', developer: 'Ember Lab', price: 899, image: 'img/hollow-pines-card.webp' },
    { title: 'Apex Rally', genre: 'Гонки', developer: 'Drift Works', price: 1299, image: 'img/apex-rally-card.webp' },
    { title: 'Runebound', genre: 'RPG', developer: 'North Hall', price: 1999, image: 'img/runebound-card.webp' },
    { title: 'Pixel Siege', genre: 'Инди', developer: 'Tiny Keep', price: 499, image: 'img/pixel-siege-card.webp' },
    { title: 'Cyber Drift 2077', genre: 'Экшен', developer: 'Neon Shift', price: 2499, image: 'img/cyber-drift-card.webp' },
    { title: 'Ashen Crown', genre: 'RPG', developer: 'Grey Tower', price: 1999, image: 'img/ashen-crown-card.webp' },
    { title: 'Void Runner', genre: 'Шутер', developer: 'Orbit Games', price: 1799, image: 'img/void-runner-card.webp' }
  ];
  var AUTH_URL = 'https://functions.poehali.dev/f1480e86-e7cd-4528-a176-09c6d9f929a1';
  var TOKEN_KEY = 'bestgames-token';
  var USER_KEY = 'bestgames-user';

  function norm(v) {
    return String(v || '').toLowerCase().replace(/ё/g, 'е').trim();
  }

  /** Совпадение запроса с игрой: по названию, жанру или разработчику */
  function gameMatches(game, q) {
    if (!q) return true;
    var hay = norm(game.title + ' ' + game.genre + ' ' + game.developer);
    return norm(q).split(/\s+/).every(function (w) { return hay.indexOf(w) !== -1; });
  }

  function escapeHtml(v) {
    return String(v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---------- Аккаунт: токен, запросы к серверу ---------- */
  function getToken() {
    try { return localStorage.getItem(TOKEN_KEY) || ''; } catch (e) { return ''; }
  }

  function getStoredUser() {
    try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); } catch (e) { return null; }
  }

  function saveSession(token, user) {
    try {
      if (token) localStorage.setItem(TOKEN_KEY, token);
      if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (e) { /* приватный режим */ }
  }

  function clearSession() {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (e) { /* приватный режим */ }
  }

  function api(action, body) {
    var opts = { method: body ? 'POST' : 'GET', headers: { 'Content-Type': 'application/json' } };
    var token = getToken();
    if (token) opts.headers['X-Auth-Token'] = token;
    if (body) opts.body = JSON.stringify(body);
    return fetch(AUTH_URL + '?action=' + action, opts).then(function (r) {
      return r.json().then(function (data) {
        if (!r.ok) {
          if (r.status === 401 && token && action !== 'login') clearSession();
          throw new Error(data.error || 'Ошибка сервера');
        }
        return data;
      });
    });
  }

  function logout() {
    var done = function () {
      clearSession();
      window.location.href = 'index.html';
    };
    api('logout', {}).then(done, done);
  }
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var PHONE_RE = /^[+\d][\d\s()-]{9,}$/;

  /* ---------- 1. Утилиты ---------- */

  /** Показывает всплывающее уведомление внизу справа */
  function toast(message, isError) {
    var region = document.querySelector('.toast-region');
    if (!region) {
      region = document.createElement('div');
      region.className = 'toast-region';
      region.setAttribute('role', 'status');
      region.setAttribute('aria-live', 'polite');
      document.body.appendChild(region);
    }
    var item = document.createElement('div');
    item.className = 'toast' + (isError ? ' toast--error' : '');
    item.textContent = message;
    region.appendChild(item);
    setTimeout(function () {
      item.remove();
    }, 3500);
  }

  /** 1499 → «1 499 ₽» */
  function formatPrice(n) {
    return Number(n).toLocaleString('ru-RU') + ' ₽';
  }

  /** Строка звёзд рейтинга: заполненные + полупрозрачные пустые */
  function starsHtml(value) {
    var full = '★★★★★'.slice(0, value);
    var empty = '★★★★★'.slice(value);
    return full + '<span class="stars__empty">' + empty + '</span>';
  }

  /** Помечает поле формы ошибкой (или снимает её) */
  function setFieldError(input, message) {
    var field = input.closest('.field');
    if (!field) return;
    var error = field.querySelector('.field__error');
    field.classList.toggle('field--error', !!message);
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
    if (error) error.textContent = message || '';
  }

  /** Снимает ошибку с поля при вводе */
  function clearOnInput(form) {
    form.addEventListener('input', function (e) {
      if (e.target.matches('.field__input')) setFieldError(e.target, '');
    });
    form.addEventListener('change', function (e) {
      if (e.target.matches('.field__input, .checkbox__input')) setFieldError(e.target, '');
    });
  }

  /* ---------- 2. Переключение темы ---------- */
  var root = document.documentElement;

  function getTheme() {
    return root.classList.contains('theme-light') ? 'light' : 'dark';
  }

  function setTheme(theme) {
    if (root.hasAttribute('data-forced-theme')) return;
    root.classList.remove('theme-dark', 'theme-light');
    root.classList.add('theme-' + theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {
      /* игнорируем — тема просто не сохранится */
    }
    document.querySelectorAll('[data-theme-switch]').forEach(function (sw) {
      sw.checked = theme === 'dark';
    });
  }

  document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      setTheme(getTheme() === 'dark' ? 'light' : 'dark');
    });
  });

  /* ---------- 3. Выезжающие панели ---------- */
  var lastTrigger = null;

  function openDrawer(drawer, trigger) {
    lastTrigger = trigger || null;
    drawer.classList.add('drawer--open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
    var focusable = drawer.querySelector('a, button, input');
    if (focusable) focusable.focus();
  }

  function closeDrawer(drawer) {
    drawer.classList.remove('drawer--open');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastTrigger) {
      lastTrigger.setAttribute('aria-expanded', 'false');
      lastTrigger.focus();
    }
  }

  document.querySelectorAll('[data-drawer-open]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var drawer = document.getElementById(btn.getAttribute('data-drawer-open'));
      if (drawer) openDrawer(drawer, btn);
    });
  });

  document.querySelectorAll('.drawer').forEach(function (drawer) {
    drawer.addEventListener('click', function (e) {
      // Закрытие по крестику, по затемнению и по клику на пункт меню
      if (e.target.closest('[data-drawer-close]') || e.target.closest('.drawer__link')) {
        closeDrawer(drawer);
      }
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var open = document.querySelector('.drawer--open');
    if (open) closeDrawer(open);
  });

  /* ---------- 4. Слайдер новинок ---------- */
  (function initSlider() {
    var slider = document.querySelector('[data-slider]');
    if (!slider) return;

    var INTERVAL = 6000;
    var images = slider.querySelectorAll('.hero__image');
    var dots = slider.querySelectorAll('.hero__dot');
    var content = slider.querySelector('.hero__content');
    var tag = slider.querySelector('.hero__tag');
    var title = slider.querySelector('.hero__title');
    var price = slider.querySelector('.hero__price');
    // HUD-счётчик «01 / 03» (необязательный декоративный элемент)
    var counterCurrent = slider.querySelector('[data-slide-current]');
    var counterTotal = slider.querySelector('[data-slide-total]');
    var index = 0;

    function pad(n) {
      return (n < 10 ? '0' : '') + n;
    }

    if (counterTotal) counterTotal.textContent = pad(images.length);
    var timer = null;
    var paused = false;

    function show(i) {
      index = (i + images.length) % images.length;
      images.forEach(function (img, n) {
        img.classList.toggle('hero__image--active', n === index);
      });
      dots.forEach(function (dot, n) {
        var active = n === index;
        dot.classList.toggle('hero__dot--active', active);
        dot.setAttribute('aria-current', active ? 'true' : 'false');
      });
      var cur = images[index];
      tag.textContent = cur.dataset.tag;
      title.textContent = cur.dataset.title;
      price.textContent = formatPrice(cur.dataset.price);
      if (counterCurrent) counterCurrent.textContent = pad(index + 1);
      // Перезапуск анимации появления текста
      content.classList.remove('hero__content--animate');
      void content.offsetWidth;
      content.classList.add('hero__content--animate');
      schedule();
    }

    function schedule() {
      clearTimeout(timer);
      if (!paused) timer = setTimeout(function () { show(index + 1); }, INTERVAL);
    }

    slider.querySelector('.hero__arrow--prev').addEventListener('click', function () { show(index - 1); });
    slider.querySelector('.hero__arrow--next').addEventListener('click', function () { show(index + 1); });
    dots.forEach(function (dot, n) {
      dot.addEventListener('click', function () { show(n); });
    });

    // Пауза при наведении
    slider.addEventListener('mouseenter', function () {
      paused = true;
      slider.classList.add('hero--paused');
      clearTimeout(timer);
    });
    slider.addEventListener('mouseleave', function () {
      paused = false;
      slider.classList.remove('hero--paused');
      show(index);
    });

    // Свайпы на сенсорных экранах
    var startX = null;
    slider.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
    slider.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) show(index + (dx < 0 ? 1 : -1));
      startX = null;
    });

    schedule();
  })();

  /* ---------- 5. Поиск игр: список результатов под полем ---------- */
  (function initGenreSearch() {
    var box = document.querySelector('[data-genre-search]');
    if (!box) return;

    var form = box.querySelector('.genre-search__form');
    var input = box.querySelector('.genre-search__input');
    var list = box.querySelector('.genre-search__hints');
    var activeIndex = -1;
    var items = [];

    function go(value) {
      var v = (value || '').trim();
      window.location.href = v ? 'catalog.html?q=' + encodeURIComponent(v) : 'catalog.html';
    }

    function render() {
      var q = input.value.trim();
      var games = GAMES.filter(function (g) { return gameMatches(g, q); });
      var genres = q ? GENRES.filter(function (g) { return norm(g).indexOf(norm(q)) !== -1; }) : [];
      items = [];
      var html = '';
      if (genres.length) {
        html += '<li class="genre-search__group" role="presentation">Жанры</li>';
        genres.forEach(function (g) {
          items.push({ href: 'catalog.html?genre=' + encodeURIComponent(g) });
          html += '<li role="option"><a class="genre-search__hint genre-search__hint--genre" href="catalog.html?genre=' + encodeURIComponent(g) + '" tabindex="-1">' + escapeHtml(g) + '</a></li>';
        });
      }
      if (games.length) {
        html += '<li class="genre-search__group" role="presentation">Игры · ' + games.length + '</li>';
        games.forEach(function (g) {
          var href = 'catalog.html?q=' + encodeURIComponent(g.title);
          items.push({ href: href });
          html += '<li role="option"><a class="genre-search__result" href="' + href + '" tabindex="-1">' +
            '<img class="genre-search__thumb" src="' + g.image + '" alt="" width="48" height="36" loading="lazy">' +
            '<span class="genre-search__info"><span class="genre-search__name">' + escapeHtml(g.title) + '</span>' +
            '<span class="genre-search__meta">' + escapeHtml(g.genre + ' · ' + g.developer) + '</span></span>' +
            '<span class="genre-search__price">' + formatPrice(g.price) + '</span></a></li>';
        });
      }
      if (!items.length) {
        html = '<li class="genre-search__nothing">Ничего не найдено по запросу «' + escapeHtml(q) + '»</li>';
      }
      list.innerHTML = html;
      activeIndex = -1;
      list.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('mousedown', function (e) { e.preventDefault(); });
      });
      list.hidden = false;
      input.setAttribute('aria-expanded', 'true');
    }

    function highlight(step) {
      var links = list.querySelectorAll('a');
      if (!links.length) return;
      activeIndex = (activeIndex + step + links.length) % links.length;
      links.forEach(function (it, n) {
        var on = n === activeIndex;
        it.classList.toggle('genre-search__hint--active', on);
        if (on) it.scrollIntoView({ block: 'nearest' });
      });
    }

    function close() {
      list.hidden = true;
      input.setAttribute('aria-expanded', 'false');
    }

    input.addEventListener('focus', render);
    input.addEventListener('input', function () {
      box.classList.remove('genre-search--error');
      render();
    });
    input.addEventListener('blur', function () { setTimeout(close, 150); });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); highlight(1); }
      if (e.key === 'ArrowUp') { e.preventDefault(); highlight(-1); }
      if (e.key === 'Escape') close();
      if (e.key === 'Enter' && activeIndex >= 0) {
        e.preventDefault();
        window.location.href = items[activeIndex].href;
      }
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      go(input.value);
    });

    box.querySelectorAll('.genre-search__tag').forEach(function (t) {
      t.addEventListener('click', function () {
        window.location.href = 'catalog.html?genre=' + encodeURIComponent(t.textContent.trim());
      });
    });
  })();

  /* ---------- 6. Каталог: фильтр по жанрам ---------- */
  (function initCatalogFilter() {
    var catalog = document.querySelector('[data-catalog]');
    if (!catalog) return;

    var cards = catalog.querySelectorAll('.game-card');
    var checkboxes = document.querySelectorAll('[data-genre-checkbox]');
    var resets = document.querySelectorAll('.filter__reset');
    var count = document.querySelector('[data-found]');
    var empty = catalog.querySelector('.catalog__empty');
    var badge = document.querySelector('.catalog__filter-count');
    var chips = document.querySelector('.catalog__chips');
    var selected = [];
    var searchInput = document.querySelector('[data-catalog-search]');
    var query = '';

    function apply() {
      var visible = 0;
      cards.forEach(function (card) {
        var d = card.dataset;
        var show = (!selected.length || selected.indexOf(d.genre) !== -1) &&
          gameMatches({ title: d.title, genre: d.genre, developer: d.developer }, query);
        card.hidden = !show;
        if (show) visible++;
      });
      // Синхронизируем чекбоксы десктопного и мобильного фильтров
      checkboxes.forEach(function (cb) {
        cb.checked = selected.indexOf(cb.value) !== -1;
      });
      resets.forEach(function (r) { r.hidden = !selected.length; });
      if (searchInput && searchInput.value !== query) searchInput.value = query;
      count.textContent = visible;
      empty.hidden = visible > 0;
      if (searchInput) searchInput.closest('.catalog-search').classList.toggle('catalog-search--filled', !!query);
      badge.hidden = !selected.length;
      badge.textContent = selected.length;
      // Плашки выбранных жанров (моб./планшет)
      chips.innerHTML = '';
      selected.forEach(function (g) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'catalog__chip';
        b.setAttribute('aria-label', 'Убрать жанр ' + g);
        b.innerHTML = g + ' <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';
        b.addEventListener('click', function () { toggle(g); });
        chips.appendChild(b);
      });
    }

    function toggle(g) {
      var i = selected.indexOf(g);
      if (i === -1) selected.push(g);
      else selected.splice(i, 1);
      apply();
    }

    checkboxes.forEach(function (cb) {
      cb.addEventListener('change', function () { toggle(cb.value); });
    });
    resets.forEach(function (r) {
      r.addEventListener('click', function () {
        selected = [];
        apply();
      });
    });

    if (searchInput) {
      searchInput.addEventListener('input', function () {
        query = searchInput.value;
        apply();
        var url = new URL(window.location.href);
        if (query.trim()) url.searchParams.set('q', query.trim()); else url.searchParams.delete('q');
        window.history.replaceState(null, '', url);
      });
      var clearBtn = document.querySelector('[data-catalog-search-clear]');
      if (clearBtn) clearBtn.addEventListener('click', function () {
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input'));
        searchInput.focus();
      });
    }

    var urlParams = new URLSearchParams(window.location.search);
    query = urlParams.get('q') || '';
    // Жанр из адресной строки: catalog.html?genre=RPG (частичное совпадение)
    var param = urlParams.get('genre');
    if (param) {
      var q = param.toLowerCase();
      var match = GENRES.filter(function (g) { return g.toLowerCase().indexOf(q) !== -1; })[0];
      if (match) selected = [match];
      else if (!query) query = param;
    }
    apply();
  })();

  /* ---------- 7. Каталог: модальное окно «Подробнее» ---------- */
  (function initGameModal() {
    var modal = document.getElementById('game-modal');
    if (!modal) return;

    var current = null;
    var currentPrice = 0;

    document.querySelectorAll('[data-game]').forEach(function (card) {
      function open(e) {
        if (e) e.preventDefault();
        var d = card.dataset;
        current = d.title;
        currentPrice = d.price;
        modal.querySelector('.game-modal__image').src = d.image;
        modal.querySelector('.game-modal__image').alt = d.title;
        modal.querySelector('.game-modal__title').textContent = d.title;
        modal.querySelector('.game-modal__meta').textContent = d.genre + ' · ' + d.developer;
        modal.querySelector('.game-modal__rating').innerHTML = starsHtml(Number(d.rating));
        modal.querySelector('.game-modal__rating').setAttribute('aria-label', 'Рейтинг ' + d.rating + ' из 5');
        modal.querySelector('.game-modal__text').textContent = d.description;
        modal.querySelector('.game-modal__price').textContent = formatPrice(d.price);
        modal.showModal();
      }
      // Вся карточка кликабельна: ссылка-заголовок растянута, кнопка поверх
      card.querySelectorAll('.game-card__link, .game-card__button').forEach(function (el) {
        el.addEventListener('click', open);
      });
    });

    modal.querySelector('.game-modal__buy').addEventListener('click', function () {
      if (window.BestGamesBuy(current, currentPrice)) modal.close();
    });
  })();

  /* Закрытие любых <dialog>: крестик и клик по фону */
  document.querySelectorAll('dialog.modal').forEach(function (dlg) {
    dlg.addEventListener('click', function (e) {
      if (e.target === dlg || e.target.closest('[data-modal-close]')) dlg.close();
    });
  });
  document.querySelectorAll('[data-modal-open]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var dlg = document.getElementById(btn.getAttribute('data-modal-open'));
      if (dlg) dlg.showModal();
    });
  });

  /* ---------- 8. Валидация форм ---------- */

  // Вход
  (function initLogin() {
    var form = document.getElementById('login-form');
    if (!form) return;
    clearOnInput(form);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      var email = form.elements.email;
      var pass = form.elements.password;
      if (!EMAIL_RE.test(email.value.trim())) { setFieldError(email, 'Введите корректный e-mail'); ok = false; }
      if (pass.value.length < 6) { setFieldError(pass, 'Минимум 6 символов'); ok = false; }
      if (!ok) return;
      var btn = form.querySelector('[type="submit"]');
      btn.disabled = true;
      api('login', { email: email.value.trim(), password: pass.value }).then(function (data) {
        saveSession(data.token, data.user);
        toast('Вы вошли в аккаунт');
        setTimeout(function () { window.location.href = 'profile.html'; }, 500);
      }).catch(function (err) {
        toast(err.message, true);
        btn.disabled = false;
      });
    });

    // Восстановление пароля
    var recover = document.getElementById('recover-form');
    if (recover) {
      recover.addEventListener('submit', function (e) {
        e.preventDefault();
        var v = recover.elements.email.value.trim();
        if (!EMAIL_RE.test(v)) return toast('Введите корректный e-mail', true);
        toast('Ссылка отправлена на ' + v);
        recover.reset();
        document.getElementById('recover-modal').close();
      });
    }
  })();

  // Регистрация: все поля обязательны, повтор пароля, согласие
  (function initRegister() {
    var form = document.getElementById('register-form');
    if (!form) return;
    clearOnInput(form);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = form.elements;
      var errors = [
        [f.email, !EMAIL_RE.test(f.email.value.trim()), 'Введите корректный e-mail'],
        [f.lastName, !f.lastName.value.trim(), 'Укажите фамилию'],
        [f.firstName, !f.firstName.value.trim(), 'Укажите имя'],
        [f.birth, !f.birth.value, 'Укажите дату рождения'],
        [f.phone, !PHONE_RE.test(f.phone.value.trim()), 'Введите номер телефона'],
        [f.password, f.password.value.length < 6, 'Минимум 6 символов'],
        [f.repeat, !f.repeat.value || f.repeat.value !== f.password.value, 'Пароли не совпадают'],
        [f.agree, !f.agree.checked, 'Необходимо согласие']
      ];
      var ok = true;
      errors.forEach(function (row) {
        setFieldError(row[0], row[1] ? row[2] : '');
        if (row[1]) ok = false;
      });
      if (!ok) return;
      var btn = form.querySelector('[type="submit"]');
      btn.disabled = true;
      api('register', {
        email: f.email.value.trim(),
        lastName: f.lastName.value.trim(),
        firstName: f.firstName.value.trim(),
        birth: f.birth.value,
        phone: f.phone.value.trim(),
        password: f.password.value
      }).then(function (data) {
        saveSession(data.token, data.user);
        toast('Аккаунт создан');
        setTimeout(function () { window.location.href = 'profile.html'; }, 500);
      }).catch(function (err) {
        toast(err.message, true);
        btn.disabled = false;
      });
    });
  })();

  // Админ-панель: превью изображения и проверка полей
  (function initAdmin() {
    var form = document.getElementById('admin-form');
    if (!form) return;
    clearOnInput(form);

    var file = form.elements.image;
    var upload = form.querySelector('.upload');
    var preview = form.querySelector('.upload__preview');
    var placeholder = form.querySelector('.upload__placeholder');
    var imageError = form.querySelector('[data-image-error]');
    var objectUrl = null;

    function resetPreview() {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      objectUrl = null;
      preview.hidden = true;
      preview.removeAttribute('src');
      placeholder.hidden = false;
    }

    file.addEventListener('change', function () {
      var f = file.files && file.files[0];
      if (!f) return resetPreview();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      objectUrl = URL.createObjectURL(f);
      preview.src = objectUrl;
      preview.hidden = false;
      placeholder.hidden = true;
      upload.classList.remove('upload--error');
      imageError.hidden = true;
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = form.elements;
      var ok = true;
      [
        [f.title, !f.title.value.trim(), 'Укажите название'],
        [f.genre, !f.genre.value, 'Выберите жанр'],
        [f.developer, !f.developer.value.trim(), 'Укажите разработчика'],
        [f.description, !f.description.value.trim(), 'Добавьте описание'],
        [f.price, !(Number(f.price.value) > 0), 'Укажите стоимость']
      ].forEach(function (row) {
        setFieldError(row[0], row[1] ? row[2] : '');
        if (row[1]) ok = false;
      });
      var noImage = !objectUrl;
      upload.classList.toggle('upload--error', noImage);
      imageError.hidden = !noImage;
      if (noImage) ok = false;
      if (!ok) return;
      toast('Игра «' + f.title.value.trim() + '» добавлена');
      form.reset();
      resetPreview();
    });
  })();

  /* ---------- 9. Личный кабинет ---------- */
  (function initProfile() {
    // Переключатель «Тёмная тема»
    document.querySelectorAll('[data-theme-switch]').forEach(function (sw) {
      sw.checked = getTheme() === 'dark';
      sw.addEventListener('change', function () {
        setTheme(sw.checked ? 'dark' : 'light');
      });
    });

    var page = document.querySelector('.profile');
    if (!page) return;
    if (!getToken()) {
      window.location.replace('login.html');
      return;
    }

    var user = null;

    function fill(u) {
      user = u;
      var initials = ((u.firstName || '')[0] || '') + ((u.lastName || '')[0] || '');
      var birthText = u.birth ? u.birth.split('-').reverse().join('.') : '—';
      var values = {
        initials: initials.toUpperCase(),
        fullName: u.firstName + ' ' + u.lastName,
        email: u.email,
        lastName: u.lastName,
        firstName: u.firstName,
        birthText: birthText,
        phone: u.phone || '—'
      };
      document.querySelectorAll('[data-user-field]').forEach(function (el) {
        el.textContent = values[el.getAttribute('data-user-field')] || '—';
      });
      document.querySelector('[data-profile-greeting]').textContent = u.firstName + ', добро пожаловать обратно.';
      document.querySelectorAll('[data-setting]').forEach(function (sw) {
        sw.checked = !!u[sw.getAttribute('data-setting')];
      });
      saveSession(null, u);
    }

    function renderPurchases(items) {
      var body = document.querySelector('[data-purchases]');
      var empty = document.querySelector('[data-purchases-empty]');
      var table = body.closest('table');
      body.innerHTML = items.map(function (p) {
        var d = new Date(p.date);
        var iso = p.date.slice(0, 10);
        return '<tr><td class="purchases__date"><time datetime="' + iso + '">' + d.toLocaleDateString('ru-RU') + '</time></td>' +
          '<td>' + escapeHtml(p.title) + '</td><td class="purchases__price">' + formatPrice(p.price) + '</td></tr>';
      }).join('');
      table.hidden = !items.length;
      empty.hidden = items.length > 0;
    }

    api('me').then(function (data) {
      fill(data.user);
      renderPurchases(data.purchases);
    }).catch(function (err) {
      toast(err.message, true);
      if (!getToken()) setTimeout(function () { window.location.replace('login.html'); }, 800);
    });

    document.querySelectorAll('[data-setting]').forEach(function (sw) {
      sw.addEventListener('change', function () {
        if (!user) return;
        var patch = Object.assign({}, user);
        patch[sw.getAttribute('data-setting')] = sw.checked;
        api('update', patch).then(function (data) {
          fill(data.user);
          toast('Настройки сохранены');
        }).catch(function (err) {
          sw.checked = !sw.checked;
          toast(err.message, true);
        });
      });
    });

    // Редактирование профиля
    var editModal = document.getElementById('edit-modal');
    var editForm = document.getElementById('edit-form');
    document.querySelectorAll('[data-modal-open="edit-modal"]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (!user) return;
        editForm.elements.lastName.value = user.lastName;
        editForm.elements.firstName.value = user.firstName;
        editForm.elements.birth.value = user.birth || '';
        editForm.elements.phone.value = user.phone || '';
      });
    });
    editForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = editForm.elements;
      if (!f.lastName.value.trim() || !f.firstName.value.trim()) return toast('Укажите имя и фамилию', true);
      if (f.phone.value.trim() && !PHONE_RE.test(f.phone.value.trim())) return toast('Проверьте номер телефона', true);
      var patch = Object.assign({}, user, {
        lastName: f.lastName.value.trim(),
        firstName: f.firstName.value.trim(),
        birth: f.birth.value,
        phone: f.phone.value.trim()
      });
      api('update', patch).then(function (data) {
        fill(data.user);
        toast('Профиль обновлён');
        editModal.close();
      }).catch(function (err) { toast(err.message, true); });
    });

    document.querySelectorAll('[data-logout]').forEach(function (btn) {
      btn.addEventListener('click', logout);
    });

    // Смена пароля
    var form = document.getElementById('password-form');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = form.elements;
      if (!f.old.value) return toast('Введите текущий пароль', true);
      if (f.next.value.length < 6) return toast('Новый пароль — минимум 6 символов', true);
      if (f.next.value !== f.repeat.value) return toast('Пароли не совпадают', true);
      api('password', { old: f.old.value, next: f.next.value }).then(function () {
        toast('Пароль изменён');
        form.reset();
        document.getElementById('password-modal').close();
      }).catch(function (err) { toast(err.message, true); });
    });
  })();

  /* ---------- Шапка: состояние входа ---------- */
  (function initAuthNav() {
    var u = getStoredUser();
    if (!getToken() || !u) return;
    document.querySelectorAll('a[href="login.html"]').forEach(function (a) {
      if (a.closest('.auth-form')) return;
      a.textContent = u.firstName || 'Профиль';
      a.setAttribute('href', 'profile.html');
    });
    document.querySelectorAll('.header a[href="register.html"], .drawer a[href="register.html"]').forEach(function (a) {
      a.textContent = 'Выйти';
      a.setAttribute('href', '#');
      a.addEventListener('click', function (e) {
        e.preventDefault();
        logout();
      });
    });
    if (/login|register/.test(window.location.pathname)) window.location.replace('profile.html');
  })();

  /* ---------- Покупка: запись в историю аккаунта ---------- */
  function recordPurchase(title, price) {
    if (!getToken()) {
      toast('Войдите, чтобы покупка сохранилась в кабинете', true);
      setTimeout(function () { window.location.href = 'login.html'; }, 1200);
      return false;
    }
    api('buy', { title: title, price: Number(price) }).then(function () {
      toast('Покупка «' + title + '» оформлена — смотрите её в личном кабинете');
    }).catch(function (err) { toast(err.message, true); });
    return true;
  }
  window.BestGamesBuy = recordPurchase;

  /* ---------- 10. Появление секций при прокрутке ---------- */
  (function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el) { io.observe(el); });
  })();

  /* ---------- 11. Чат поддержки с автоответами ---------- */
  (function initChat() {
    var chat = document.querySelector('[data-chat]');
    if (!chat) return;
    var win = chat.querySelector('.chat__window');
    var toggleBtn = chat.querySelector('[data-chat-toggle]');
    var list = chat.querySelector('[data-chat-messages]');
    var form = chat.querySelector('[data-chat-form]');
    var input = form.elements.message;
    var STORAGE_KEY = 'bg-chat-seen';

    // База автоответов: ключевые слова (начала слов) → ответ
    var ANSWERS = [
      { keys: ['оплат', 'карт', 'сбп', 'плат', 'куп'], text: 'Оплатить можно банковской картой, через СБП или электронным кошельком. Деньги списываются только после подтверждения заказа.' },
      { keys: ['ключ', 'код', 'активац', 'достав', 'пришл', 'приш', 'получ'], text: 'Ключ приходит на почту и в личный кабинет в течение 1–2 минут после оплаты. Проверьте папку «Спам», если письма нет.' },
      { keys: ['возврат', 'верн', 'отмен', 'деньг'], text: 'Вернуть деньги можно в течение 14 дней, если ключ ещё не активирован. Напишите номер заказа — оформим возврат.' },
      { keys: ['акци', 'скидк', 'промо', 'распрод', 'дешев'], text: 'Каждый месяц у нас новые акции со скидками до 70%. Следите за разделом «Новинки» на главной.' },
      { keys: ['предмет', 'скин', 'внутриигр', 'донат', 'пропуск'], text: 'Внутриигровые предметы зачисляются на ваш игровой аккаунт автоматически, обычно в течение 5 минут.' },
      { keys: ['пароль', 'войти', 'вход', 'аккаунт', 'регистр', 'профил'], text: 'Войти можно на странице «Войти». Если забыли пароль — нажмите «Забыли пароль?», и мы пришлём ссылку для восстановления.' },
      { keys: ['турнир', 'кибер', 'команд', 'партн', 'сотруд', 'реклам', 'инвест'], text: 'По турнирам, рекламе и партнёрству напишите на best@games.ru — менеджер ответит в течение рабочего дня.' },
      { keys: ['телефон', 'позвон', 'звон', 'почт', 'связ', 'оператор', 'человек'], text: 'Позвоните нам: 8-800-999-55-99 (бесплатно, круглосуточно) или напишите на best@games.ru.' },
      { keys: ['привет', 'здравств', 'добр', 'хай', 'hello'], text: 'Здравствуйте! Чем могу помочь?' },
      { keys: ['спасиб', 'благодар'], text: 'Всегда рады помочь! Хорошей игры 🎮' }
    ];
    var FALLBACK = 'Спасибо за вопрос! Оператор скоро подключится. А пока можно позвонить по номеру 8-800-999-55-99.';

    function findAnswer(text) {
      var words = text.toLowerCase().replace(/ё/g, 'е').split(/[^a-zа-я0-9]+/);
      for (var i = 0; i < ANSWERS.length; i++) {
        for (var k = 0; k < ANSWERS[i].keys.length; k++) {
          for (var w = 0; w < words.length; w++) {
            if (words[w] && words[w].indexOf(ANSWERS[i].keys[k]) === 0) return ANSWERS[i].text;
          }
        }
      }
      return FALLBACK;
    }

    function addMessage(text, who) {
      var li = document.createElement('li');
      li.className = 'chat__message chat__message--' + who;
      li.textContent = text;
      list.appendChild(li);
      list.scrollTop = list.scrollHeight;
      return li;
    }

    // Отправка сообщения пользователя и «печатающий» автоответ
    function send(text) {
      text = text.trim();
      if (!text) return;
      addMessage(text, 'user');
      var typing = document.createElement('li');
      typing.className = 'chat__message chat__message--bot chat__message--typing';
      typing.setAttribute('aria-label', 'Оператор печатает');
      typing.innerHTML = '<span class="chat__typing-dot"></span><span class="chat__typing-dot"></span><span class="chat__typing-dot"></span>';
      list.appendChild(typing);
      list.scrollTop = list.scrollHeight;
      setTimeout(function () {
        typing.remove();
        addMessage(findAnswer(text), 'bot');
      }, 700 + Math.random() * 600);
    }

    function setOpen(open) {
      win.hidden = !open;
      chat.classList.toggle('chat--open', open);
      toggleBtn.setAttribute('aria-expanded', String(open));
      toggleBtn.setAttribute('aria-label', open ? 'Закрыть чат поддержки' : 'Открыть чат поддержки');
      if (open) {
        chat.classList.add('chat--seen');
        try { localStorage.setItem(STORAGE_KEY, '1'); } catch (e) { /* приватный режим */ }
        input.focus();
      }
    }

    // Пульсация кнопки только для тех, кто ещё не открывал чат
    try { if (localStorage.getItem(STORAGE_KEY)) chat.classList.add('chat--seen'); } catch (e) { /* приватный режим */ }

    toggleBtn.addEventListener('click', function () { setOpen(win.hidden); });
    chat.querySelector('[data-chat-close]').addEventListener('click', function () {
      setOpen(false);
      toggleBtn.focus();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !win.hidden) setOpen(false);
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      send(input.value);
      input.value = '';
    });

    chat.querySelectorAll('.chat__chip').forEach(function (chip) {
      chip.addEventListener('click', function () { send(chip.textContent); });
    });
  })();
})();
