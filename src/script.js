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
