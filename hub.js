(() => {
  'use strict';
  const verbKey = 'kotobaQuest.v2';
  const readingKey = 'katsuyoReading.v1';
  const read = key => { try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch { return {}; } };
  const verb = read(verbKey);
  const reading = read(readingKey);
  const systemTheme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  let theme = verb.theme || reading.theme || systemTheme;
  let sound = verb.sound ?? reading.sound ?? true;
  let volume = Number.isFinite(verb.soundVolume) ? verb.soundVolume : Number.isFinite(reading.volume) ? reading.volume : 35;
  const themeToggle = document.querySelector('#hub-theme-toggle');
  const soundToggle = document.querySelector('#hub-sound-toggle');
  const volumeControl = document.querySelector('#hub-sound-volume');
  const volumeValue = document.querySelector('#hub-volume-value');
  const persist = () => {
    localStorage.setItem(verbKey, JSON.stringify({...verb, theme, sound, soundVolume: volume}));
    localStorage.setItem(readingKey, JSON.stringify({...reading, theme, sound, volume}));
  };
  const render = () => {
    document.documentElement.dataset.theme = theme;
    const dark = theme === 'dark';
    themeToggle.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    themeToggle.setAttribute('aria-pressed', String(dark));
    themeToggle.querySelector('span').textContent = dark ? '☀' : '☾';
    soundToggle.setAttribute('aria-label', sound ? 'Turn sound off' : 'Turn sound on');
    soundToggle.setAttribute('aria-pressed', String(sound));
    soundToggle.querySelector('span').textContent = sound ? '♪' : '×';
    volumeControl.value = volume;
    volumeValue.value = `${volume}%`;
  };
  themeToggle.addEventListener('click', () => { theme = theme === 'dark' ? 'light' : 'dark'; persist(); render(); });
  soundToggle.addEventListener('click', () => { sound = !sound; persist(); render(); });
  volumeControl.addEventListener('input', event => { volume = Number(event.target.value); if (volume > 0) sound = true; persist(); render(); });
  render();
})();
