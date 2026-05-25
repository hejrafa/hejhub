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
  HejHub.pickLine('work-dynamic-line', workLines, { storageKey: 'hejhub:lastWorkLine' });
}

pickWorkLine();
HejHub.setupPhysicality('.work-tile');
