(function () {
  const cachePrefix = 'hejhub:json:';
  const defaultTtl = 15 * 60 * 1000;
  const defaultTimeout = 4500;

  function readStorage(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  function writeStorage(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {}
  }

  function readCache(key) {
    const raw = readStorage(key);
    if (!raw) return null;

    try {
      const cached = JSON.parse(raw);
      if (!cached || typeof cached.savedAt !== 'number' || !('value' in cached)) {
        return null;
      }
      return cached;
    } catch {
      return null;
    }
  }

  function writeCache(key, value) {
    writeStorage(key, JSON.stringify({ savedAt: Date.now(), value }));
  }

  async function fetchJsonCached(url, options = {}) {
    const {
      cacheKey = url,
      init,
      timeout = defaultTimeout,
      ttl = defaultTtl
    } = options;
    const key = `${cachePrefix}${cacheKey}`;
    const cached = readCache(key);

    if (cached && Date.now() - cached.savedAt < ttl) {
      return cached.value;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, { ...init, signal: controller.signal });
      if (!response.ok) {
        throw new Error(`Request failed with ${response.status}`);
      }

      const value = await response.json();
      writeCache(key, value);
      return value;
    } catch (error) {
      if (cached) {
        return cached.value;
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  function pickDifferent(items, storageKey) {
    const list = Array.from(items || []).filter(Boolean);
    if (!list.length) return null;
    if (!storageKey || list.length === 1) return list[Math.floor(Math.random() * list.length)];

    const rawLast = readStorage(storageKey);
    const last = rawLast === null ? -1 : Number(rawLast);
    let index = Math.floor(Math.random() * list.length);

    if (Number.isFinite(last) && index === last) {
      index = (index + 1 + Math.floor(Math.random() * (list.length - 1))) % list.length;
    }

    writeStorage(storageKey, String(index));
    return list[index];
  }

  function pickLine(targetId, lines, options = {}) {
    const target = document.getElementById(targetId);
    if (!target) return;

    const line = pickDifferent(lines, options.storageKey);
    if (line) {
      target.innerHTML = line;
    }
  }

  function setupPhysicality(selector = '.tile') {
    const supportsFineHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!supportsFineHover) return;

    document.querySelectorAll(selector).forEach(element => {
      let rect = null;
      let lastPointer = null;
      let frame = 0;

      const reset = () => {
        if (frame) {
          cancelAnimationFrame(frame);
        }
        frame = 0;
        rect = null;
        lastPointer = null;
        element.style.removeProperty('--mx');
        element.style.removeProperty('--my');
        element.style.removeProperty('--rx');
        element.style.removeProperty('--ry');
      };

      const applyPointer = () => {
        frame = 0;
        if (!rect || !lastPointer) return;
        if (!rect.width || !rect.height) return;

        const x = (lastPointer.clientX - rect.left) / rect.width;
        const y = (lastPointer.clientY - rect.top) / rect.height;
        const px = (x - 0.5) * 2;
        const py = (y - 0.5) * 2;

        element.style.setProperty('--mx', `${Math.round(x * 100)}%`);
        element.style.setProperty('--my', `${Math.round(y * 100)}%`);
        element.style.setProperty('--rx', `${(-py * 2.4).toFixed(2)}deg`);
        element.style.setProperty('--ry', `${(px * 3.2).toFixed(2)}deg`);
      };

      element.addEventListener('pointerenter', () => {
        rect = element.getBoundingClientRect();
      }, { passive: true });

      element.addEventListener('pointermove', event => {
        rect = rect || element.getBoundingClientRect();
        lastPointer = event;

        if (!frame) {
          frame = requestAnimationFrame(applyPointer);
        }
      }, { passive: true });

      element.addEventListener('pointerleave', reset, { passive: true });
    });
  }

  window.HejHub = {
    fetchJsonCached,
    pickDifferent,
    pickLine,
    setupPhysicality
  };
})();
