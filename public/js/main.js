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
   ========================================================================== */
(function () {
  'use strict';

  var THEME_KEY = 'bestgames-theme';
  var GENRES = ['Экшен', 'RPG', 'Стратегия', 'Гонки', 'Хоррор', 'Инди', 'Шутер', 'Симулятор', 'Спорт'];
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
    var index = 0;
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

  /* ---------- 5. Поиск по жанрам с подсказками ---------- */
  (function initGenreSearch() {
    var box = document.querySelector('[data-genre-search]');
    if (!box) return;

    var form = box.querySelector('.genre-search__form');
    var input = box.querySelector('.genre-search__input');
    var list = box.querySelector('.genre-search__hints');
    var activeIndex = -1;

    function go(value) {
      var v = (value || '').trim();
      if (!v) {
        box.classList.add('genre-search--error');
        input.focus();
        return;
      }
      window.location.href = 'catalog.html?genre=' + encodeURIComponent(v);
    }

    function render() {
      var q = input.value.trim().toLowerCase();
      var hints = q ? GENRES.filter(function (g) { return g.toLowerCase().indexOf(q) !== -1; }) : GENRES;
      list.innerHTML = '';
      activeIndex = -1;
      hints.forEach(function (g) {
        var li = document.createElement('li');
        li.setAttribute('role', 'option');
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'genre-search__hint';
        b.textContent = g;
        b.tabIndex = -1;
        // mousedown не даёт полю потерять фокус до клика
        b.addEventListener('mousedown', function (e) { e.preventDefault(); });
        b.addEventListener('click', function () {
          input.value = g;
          go(g);
        });
        li.appendChild(b);
        list.appendChild(li);
      });
      list.hidden = hints.length === 0;
      input.setAttribute('aria-expanded', hints.length ? 'true' : 'false');
    }

    function highlight(step) {
      var items = list.querySelectorAll('.genre-search__hint');
      if (!items.length) return;
      activeIndex = (activeIndex + step + items.length) % items.length;
      items.forEach(function (it, n) {
        it.classList.toggle('genre-search__hint--active', n === activeIndex);
      });
    }

    input.addEventListener('focus', render);
    input.addEventListener('input', function () {
      box.classList.remove('genre-search--error');
      render();
    });
    input.addEventListener('blur', function () {
      setTimeout(function () {
        list.hidden = true;
        input.setAttribute('aria-expanded', 'false');
      }, 150);
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); highlight(1); }
      if (e.key === 'ArrowUp') { e.preventDefault(); highlight(-1); }
      if (e.key === 'Escape') { list.hidden = true; }
      if (e.key === 'Enter' && activeIndex >= 0) {
        e.preventDefault();
        var items = list.querySelectorAll('.genre-search__hint');
        go(items[activeIndex].textContent);
      }
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      go(input.value);
    });

    box.querySelectorAll('.genre-search__tag').forEach(function (t) {
      t.addEventListener('click', function () { go(t.textContent); });
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

    function apply() {
      var visible = 0;
      cards.forEach(function (card) {
        var show = !selected.length || selected.indexOf(card.dataset.genre) !== -1;
        card.hidden = !show;
        if (show) visible++;
      });
      // Синхронизируем чекбоксы десктопного и мобильного фильтров
      checkboxes.forEach(function (cb) {
        cb.checked = selected.indexOf(cb.value) !== -1;
      });
      resets.forEach(function (r) { r.hidden = !selected.length; });
      count.textContent = visible;
      empty.hidden = visible > 0;
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

    // Жанр из адресной строки: catalog.html?genre=RPG (частичное совпадение)
    var param = new URLSearchParams(window.location.search).get('genre');
    if (param) {
      var q = param.toLowerCase();
      var match = GENRES.filter(function (g) { return g.toLowerCase().indexOf(q) !== -1; })[0];
      if (match) selected = [match];
    }
    apply();
  })();

  /* ---------- 7. Каталог: модальное окно «Подробнее» ---------- */
  (function initGameModal() {
    var modal = document.getElementById('game-modal');
    if (!modal) return;

    var current = null;

    document.querySelectorAll('[data-game]').forEach(function (card) {
      function open(e) {
        if (e) e.preventDefault();
        var d = card.dataset;
        current = d.title;
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
      toast('Покупка «' + current + '» оформлена');
      modal.close();
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
      toast('Вы вошли в аккаунт');
      setTimeout(function () { window.location.href = 'profile.html'; }, 700);
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
      toast('Аккаунт создан');
      setTimeout(function () { window.location.href = 'profile.html'; }, 700);
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

    // Смена пароля
    var form = document.getElementById('password-form');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = form.elements;
      if (!f.old.value) return toast('Введите текущий пароль', true);
      if (f.next.value.length < 6) return toast('Новый пароль — минимум 6 символов', true);
      if (f.next.value !== f.repeat.value) return toast('Пароли не совпадают', true);
      toast('Пароль изменён');
      form.reset();
      document.getElementById('password-modal').close();
    });
  })();

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
})();
