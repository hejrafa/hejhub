const workLines = [
  'deep work.',
  'ship the<br>sharp thing.',
  'less swirl.<br>more signal.',
  'make it<br>legible.',
  'protect<br>focus.',
  'design the<br>handoff.',
  'one ticket<br>at a time.',
  'clarity is<br>kind.',
  'sync, then<br>move.',
  'notes before<br>noise.',
  'useful beats<br>clever.',
  'close the<br>loop.'
];

function pickWorkLine() {
  const el = document.getElementById('work-dynamic-line');
  if (!el) return;

  const storageKey = 'hejhub:lastWorkLine';
  const last = Number(localStorage.getItem(storageKey));
  let index = Math.floor(Math.random() * workLines.length);

  if (workLines.length > 1 && index === last) {
    index = (index + 1 + Math.floor(Math.random() * (workLines.length - 1))) % workLines.length;
  }

  localStorage.setItem(storageKey, String(index));
  el.innerHTML = workLines[index];
}

function setupWorkPhysicality() {
  document.querySelectorAll('.work-tile').forEach(tile => {
    tile.addEventListener('pointermove', event => {
      const rect = tile.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      const px = (x - 0.5) * 2;
      const py = (y - 0.5) * 2;

      tile.style.setProperty('--mx', `${Math.round(x * 100)}%`);
      tile.style.setProperty('--my', `${Math.round(y * 100)}%`);
      tile.style.setProperty('--rx', `${(-py * 2.4).toFixed(2)}deg`);
      tile.style.setProperty('--ry', `${(px * 3.2).toFixed(2)}deg`);
    });

    tile.addEventListener('pointerleave', () => {
      tile.style.removeProperty('--mx');
      tile.style.removeProperty('--my');
      tile.style.removeProperty('--rx');
      tile.style.removeProperty('--ry');
    });
  });
}

pickWorkLine();
setupWorkPhysicality();
