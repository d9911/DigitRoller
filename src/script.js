const DIGITS = Array.from({ length: 10 }, (_, i) => String(i));

function isDigit(ch) {
  return ch >= '0' && ch <= '9';
}

function pickNumberRun(str) {
  const m = str.match(/(\d[\d.,]*)/);
  if (!m) {
    return {
      left: str,
      num: '',
      right: '',
      sep: null,
      ints: '',
      fracs: '',
    };
  }
  const left = str.slice(0, m.index);
  const num = m[1];
  const right = str.slice(m.index + num.length);

  const lastDot = num.lastIndexOf('.');
  const lastComma = num.lastIndexOf(',');
  let sep = null;
  let intPart = num;
  let fracPart = '';
  if (lastDot > lastComma && lastDot !== -1) {
    sep = '.';
    intPart = num.slice(0, lastDot);
    fracPart = num.slice(lastDot + 1);
  } else if (lastComma > lastDot && lastComma !== -1) {
    sep = ',';
    intPart = num.slice(0, lastComma);
    fracPart = num.slice(lastComma + 1);
  }

  intPart = intPart.replace(/[.,](?=\d{3}(\D|$))/g, '');
  return { left, num, right, sep, ints: intPart, fracs: fracPart };
}

function padLeft(str, len, ch = '0') {
  return str.length >= len ? str : ch.repeat(len - str.length) + str;
}
function padRight(str, len, ch = '0') {
  return str.length >= len ? str : str + ch.repeat(len - str.length);
}

function createDigitColumn(digitChar) {
  const col = document.createElement('span');
  col.className = 'digit';
  const reel = document.createElement('span');
  reel.className = 'reel';
  for (const d of DIGITS) {
    const s = document.createElement('span');
    s.textContent = d;
    reel.appendChild(s);
  }
  col.appendChild(reel);
  const start = isDigit(digitChar) ? Number(digitChar) : 0;
  setReelInstant(reel, start);
  col.dataset.current = String(start);
  return col;
}

function setReelInstant(reel, index) {
  const rowH = getRowHeight(reel);
  reel.style.transition = 'none';
  reel.style.transform = `translateY(${-index * rowH}px)`;
  void reel.offsetHeight;
  reel.style.transition = '';
}

function animateReelTo(reel, fromDigit, toDigit) {
  const start = Number(fromDigit);
  const end = Number(toDigit);
  const needWrap = end < start;

  if (needWrap) {
    reel.textContent = '';
    for (let r = 0; r < 2; r++) {
      for (const d of DIGITS) {
        const s = document.createElement('span');
        s.textContent = d;
        reel.appendChild(s);
      }
    }
  } else {
    if (reel.children.length !== 10) {
      reel.textContent = '';
      for (const d of DIGITS) {
        const s = document.createElement('span');
        s.textContent = d;
        reel.appendChild(s);
      }
    }
  }

  const rowH = getRowHeight(reel);
  setReelInstant(reel, start);

  requestAnimationFrame(() => {
    const targetIndex = needWrap ? 10 + end : end;
    reel.style.transform = `translateY(${-targetIndex * rowH}px)`;
  });
}

function getRowHeight(reel) {
  const first = reel.firstElementChild;
  if (first) return first.getBoundingClientRect().height || parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--digit-height'));
  return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--digit-height'));
}

function renderValue(container, valueStr) {
  container.textContent = '';
  const parsed = pickNumberRun(valueStr);

  const leftEl = document.createElement('span');
  leftEl.className = 'left';
  leftEl.textContent = parsed.left;

  const numberEl = document.createElement('span');
  numberEl.className = 'number';

  const intEl = document.createElement('span');
  intEl.className = 'integer';
  for (const ch of parsed.ints) {
    intEl.appendChild(createDigitColumn(ch));
  }

  const sepEl = document.createElement('span');
  sepEl.className = 'sep';
  if (parsed.fracs.length > 0 && parsed.sep) sepEl.textContent = parsed.sep;

  const fracEl = document.createElement('span');
  fracEl.className = 'fraction';
  for (const ch of parsed.fracs) {
    fracEl.appendChild(createDigitColumn(ch));
  }

  numberEl.appendChild(intEl);
  if (parsed.fracs.length > 0 && parsed.sep) numberEl.appendChild(sepEl);
  numberEl.appendChild(fracEl);

  const rightEl = document.createElement('span');
  rightEl.className = 'right';
  rightEl.textContent = ' ' + parsed.right;

  container.appendChild(leftEl);
  container.appendChild(numberEl);
  container.appendChild(rightEl);

  container._state = parsed;
}

function syncDigitColumns(wrapperEl, desiredCount) {
  const existing = Array.from(wrapperEl.querySelectorAll('.digit'));
  const currentCount = existing.length;

  if (currentCount < desiredCount) {
    const toAdd = desiredCount - currentCount;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < toAdd; i++) {
      frag.appendChild(createDigitColumn('0'));
    }
    // Добавляем слева для выравнивания по правому краю
    wrapperEl.insertBefore(frag, wrapperEl.firstChild);
  } else if (currentCount > desiredCount) {
    const toRemove = currentCount - desiredCount;
    for (let i = 0; i < toRemove; i++) {
      if (wrapperEl.firstElementChild) wrapperEl.removeChild(wrapperEl.firstElementChild);
    }
  }
}

function animateTo(container, nextStr) {
  const prev = container._state || pickNumberRun('');
  const next = pickNumberRun(nextStr);

  const sep = next.sep || prev.sep || ',';
  const maxFrac = Math.max(prev.fracs.length, next.fracs.length);
  const maxInt = Math.max(prev.ints.length, next.ints.length);

  const prevInts = padLeft(prev.ints, maxInt, '0');
  const nextInts = padLeft(next.ints, maxInt, '0');
  const prevFracs = padRight(prev.fracs, maxFrac, '0');
  const nextFracs = padRight(next.fracs, maxFrac, '0');

  const leftEl = container.querySelector('.left');
  const rightEl = container.querySelector('.right');
  if (leftEl) leftEl.textContent = next.left;
  if (rightEl) rightEl.textContent = ' ' + next.right;

  const numberEl = container.querySelector('.number');
  let sepEl = container.querySelector('.sep');
  if (maxFrac > 0) {
    if (!sepEl) {
      sepEl = document.createElement('span');
      sepEl.className = 'sep';
      const fracElPos = container.querySelector('.fraction');
      numberEl.insertBefore(sepEl, fracElPos);
    }
    sepEl.textContent = sep;
  } else if (sepEl) {
    sepEl.remove();
  }

  const intEl = container.querySelector('.integer');
  const fracEl = container.querySelector('.fraction');
  syncDigitColumns(intEl, maxInt);
  syncDigitColumns(fracEl, maxFrac);

  const intCols = Array.from(intEl.querySelectorAll('.digit'));
  const fracCols = Array.from(fracEl.querySelectorAll('.digit'));

  for (let i = 0; i < maxInt; i++) {
    const col = intCols[i];
    const reel = col.querySelector('.reel');
    const fromDigit = prevInts[i] || '0';
    const toDigit = nextInts[i] || '0';
    animateReelTo(reel, fromDigit, toDigit);
    col.dataset.current = toDigit;
  }
  // Скрываем ведущие нули
  let leading = true;
  for (let i = 0; i < intCols.length; i++) {
    const col = intCols[i];
    if (leading && col.dataset.current === '0' && i < intCols.length - 1) {
      col.classList.add('zero');
    } else {
      leading = false;
      col.classList.remove('zero');
    }
  }
  for (let i = 0; i < maxFrac; i++) {
    const col = fracCols[i];
    const reel = col.querySelector('.reel');
    const fromDigit = prevFracs[i] || '0';
    const toDigit = nextFracs[i] || '0';
    animateReelTo(reel, fromDigit, toDigit);
    col.dataset.current = toDigit;
  }

  container._state = next;
}

// Init
const roller = document.getElementById('roller');
const fromInput = document.getElementById('from');
const toInput = document.getElementById('to');
const runBtn = document.getElementById('run');

renderValue(roller, fromInput.value);

let showing = 'from';
runBtn.addEventListener('click', () => {
  const target = showing === 'from' ? toInput.value : fromInput.value;
  animateTo(roller, target);
  showing = showing === 'from' ? 'to' : 'from';
});

// Обновляем предпросмотр при изменении поля "Текущее", если сейчас показано "Текущее"
fromInput.addEventListener('input', () => {
  if (showing === 'from') renderValue(roller, fromInput.value);
});

const TRANSLATIONS = {
  ru: {
    title: 'DigitRoller — анимированный счётчик чисел', description: 'Интерактивный анимированный роллер чисел на чистых HTML, CSS и JavaScript.', skip: 'Перейти к приложению', subtitle: 'Анимируйте переход между числовыми значениями без зависимостей.', displaySettings: 'Настройки отображения', language: 'Язык', currentValue: 'Текущее значение', newValue: 'Новое значение', animate: 'Анимировать', preview: 'Просмотр', note: 'Цифры прокручиваются циклически (0→9→0). Нецифровые символы меняются сразу.', footer: 'Локальная демонстрация анимации чисел на HTML, CSS и JavaScript.', lightTheme: 'Включить светлую тему', darkTheme: 'Включить тёмную тему', lightThemeLabel: 'Светлая', darkThemeLabel: 'Тёмная'
  },
  en: {
    title: 'DigitRoller — animated number counter', description: 'An interactive animated number roller built with plain HTML, CSS, and JavaScript.', skip: 'Skip to application', subtitle: 'Animate transitions between numeric values without dependencies.', displaySettings: 'Display settings', language: 'Language', currentValue: 'Current value', newValue: 'New value', animate: 'Animate', preview: 'Preview', note: 'Digits roll cyclically (0→9→0). Non-digit characters change immediately.', footer: 'A local HTML, CSS, and JavaScript number animation demo.', lightTheme: 'Use light theme', darkTheme: 'Use dark theme', lightThemeLabel: 'Light', darkThemeLabel: 'Dark'
  },
  es: {
    title: 'DigitRoller — contador numérico animado', description: 'Un rodillo numérico interactivo creado con HTML, CSS y JavaScript.', skip: 'Ir a la aplicación', subtitle: 'Anima transiciones entre valores numéricos sin dependencias.', displaySettings: 'Ajustes de visualización', language: 'Idioma', currentValue: 'Valor actual', newValue: 'Nuevo valor', animate: 'Animar', preview: 'Vista previa', note: 'Los dígitos giran de forma cíclica (0→9→0). Los demás caracteres cambian al instante.', footer: 'Una demostración local de animación numérica con HTML, CSS y JavaScript.', lightTheme: 'Usar tema claro', darkTheme: 'Usar tema oscuro', lightThemeLabel: 'Claro', darkThemeLabel: 'Oscuro'
  }
};

let currentLanguage = 'ru';
const t = key => TRANSLATIONS[currentLanguage][key] ?? key;

function resolveLanguage() {
  const query = new URLSearchParams(window.location.search).get('lang');
  if (TRANSLATIONS[query]) return query;
  const saved = localStorage.getItem('digitRollerLanguage');
  if (TRANSLATIONS[saved]) return saved;
  const browser = navigator.language.toLowerCase();
  return browser.startsWith('ru') ? 'ru' : browser.startsWith('es') ? 'es' : 'en';
}

function applyLanguage(language) {
  currentLanguage = TRANSLATIONS[language] ? language : 'en';
  localStorage.setItem('digitRollerLanguage', currentLanguage);
  document.documentElement.lang = currentLanguage;
  document.title = t('title');
  document.querySelector('meta[name="description"]')?.setAttribute('content', t('description'));
  document.querySelectorAll('[data-i18n]').forEach(element => { element.textContent = t(element.dataset.i18n); });
  document.querySelectorAll('[data-i18n-aria]').forEach(element => { element.setAttribute('aria-label', t(element.dataset.i18nAria)); });
  updateLanguageMenu(currentLanguage);
}

function updateLanguageMenu(language) {
  const menuButton = document.getElementById('language-menu-button');
  const selectedOption = document.querySelector(`.language-menu__option[data-language="${language}"]`);
  if (!menuButton || !selectedOption) return;

  const name = selectedOption.querySelector('span:nth-child(2)')?.textContent?.trim() ?? language;
  menuButton.querySelector('.language-menu__flag').textContent = selectedOption.dataset.flag ?? '';
  menuButton.querySelector('.language-menu__label').textContent = name;
  menuButton.setAttribute('aria-label', `${t('language')}: ${name}`);
  document.querySelectorAll('.language-menu__option').forEach(option => {
    option.setAttribute('aria-checked', String(option === selectedOption));
  });
}

function setupLanguageMenu(languageSelect) {
  const controls = document.querySelector('.language-menu');
  const menuButton = document.getElementById('language-menu-button');
  const menuPanel = document.getElementById('language-menu-list');
  const menuOptions = [...document.querySelectorAll('.language-menu__option')];
  if (!controls || !menuButton || !menuPanel || menuOptions.length === 0) return;

  const closeMenu = (restoreFocus = false) => {
    menuButton.setAttribute('aria-expanded', 'false');
    menuPanel.hidden = true;
    if (restoreFocus) menuButton.focus();
  };
  const openMenu = () => {
    menuButton.setAttribute('aria-expanded', 'true');
    menuPanel.hidden = false;
    (menuOptions.find(option => option.getAttribute('aria-checked') === 'true') ?? menuOptions[0]).focus();
  };

  menuButton.addEventListener('click', () => {
    menuButton.getAttribute('aria-expanded') === 'true' ? closeMenu() : openMenu();
  });
  menuButton.addEventListener('keydown', event => {
    if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(event.key)) {
      event.preventDefault();
      openMenu();
      if (event.key === 'ArrowUp') menuOptions.at(-1)?.focus();
    }
  });
  menuOptions.forEach(option => {
    option.addEventListener('click', () => {
      languageSelect.value = option.dataset.language;
      languageSelect.dispatchEvent(new Event('change', { bubbles: true }));
      closeMenu(true);
    });
  });
  menuPanel.addEventListener('keydown', event => {
    const currentIndex = menuOptions.indexOf(document.activeElement);
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      let nextIndex = currentIndex;
      if (event.key === 'ArrowDown') nextIndex = (currentIndex + 1) % menuOptions.length;
      if (event.key === 'ArrowUp') nextIndex = (currentIndex - 1 + menuOptions.length) % menuOptions.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = menuOptions.length - 1;
      menuOptions[nextIndex].focus();
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      closeMenu(true);
    }
    if (event.key === 'Tab') closeMenu();
  });
  document.addEventListener('pointerdown', event => {
    if (!controls.contains(event.target)) closeMenu();
  });
}

function applyTheme(theme) {
  const resolved = theme === 'light' ? 'light' : 'dark';
  document.documentElement.dataset.theme = resolved;
  localStorage.setItem('digitRollerTheme', resolved);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', resolved === 'dark' ? '#080b12' : '#eef6ff');
  const button = document.getElementById('theme-toggle');
  const targetTheme = resolved === 'dark' ? 'light' : 'dark';
  document.getElementById('theme-toggle-icon').textContent = targetTheme === 'light' ? '☀️' : '🌙';
  document.getElementById('theme-toggle-text').textContent = t(targetTheme === 'light' ? 'lightThemeLabel' : 'darkThemeLabel');
  button.setAttribute('aria-label', t(resolved === 'dark' ? 'lightTheme' : 'darkTheme'));
  button.title = t(resolved === 'dark' ? 'lightTheme' : 'darkTheme');
}

currentLanguage = resolveLanguage();
applyLanguage(currentLanguage);
const languageSelect = document.getElementById('language-select');
languageSelect.value = currentLanguage;
languageSelect.addEventListener('change', () => {
  applyLanguage(languageSelect.value);
  applyTheme(document.documentElement.dataset.theme);
});
setupLanguageMenu(languageSelect);

applyTheme(localStorage.getItem('digitRollerTheme') === 'light' ? 'light' : 'dark');
document.getElementById('theme-toggle').addEventListener('click', () => {
  applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
});
