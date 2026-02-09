/**
 * Tacticlash — Phase 2: Unit cards on the board
 */

document.addEventListener('DOMContentLoaded', function () {
  // Demo: place 5 units per player with mix of face-down, face-up, damage, paralysis
  const deck = shuffle([...CHARACTERS]);
  const player1Units = deck.slice(0, 5);
  const player2Units = deck.slice(5, 10);

  // Layout for visual demo:
  // P1: col 0 face-up, col 1 face-up + 1 damage, col 2-4 face-down
  // P2: col 0 face-up, col 1 face-up + Paralyzed, col 2-4 face-down
  const p1States = [
    { faceUp: true, damage: 0, paralyzed: false },
    { faceUp: true, damage: 1, paralyzed: false },
    { faceUp: false, damage: 0, paralyzed: false },
    { faceUp: false, damage: 0, paralyzed: false },
    { faceUp: false, damage: 0, paralyzed: false },
  ];
  const p2States = [
    { faceUp: true, damage: 0, paralyzed: false },
    { faceUp: true, damage: 0, paralyzed: true },
    { faceUp: false, damage: 0, paralyzed: false },
    { faceUp: false, damage: 0, paralyzed: false },
    { faceUp: false, damage: 0, paralyzed: false },
  ];

  renderUnits(1, player1Units, p1States);
  renderUnits(2, player2Units, p2States);

  // Slot click (bubbles to card if present)
  document.querySelectorAll('.slot').forEach(function (slot) {
    slot.addEventListener('click', function (e) {
      const player = slot.getAttribute('data-player');
      const column = slot.getAttribute('data-column');
      const card = slot.querySelector('.unit-card');
      const unitInfo = card ? (card.getAttribute('data-face-up') === 'true' ? card.dataset.name : '?') : 'empty';
      console.log('Slot clicked: Player %s, Column %s — %s', player, column, unitInfo);
    });
  });
});

function shuffle(array) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getBaseHP(classType) {
  return classType === 'Brawler' ? 2 : 1;
}

function renderUnits(player, units, states) {
  const row = document.querySelector('.row--player' + player);
  const slots = row.querySelectorAll('.slot');

  units.forEach(function (unit, i) {
    const state = states[i];
    const slot = slots[i];
    const cardHTML = createUnitCardHTML(unit, state);
    slot.innerHTML = cardHTML;
    slot.classList.add('slot--occupied');
  });
}

function createUnitCardHTML(unit, state) {
  const faceUp = state.faceUp;
  const damage = state.damage;
  const paralyzed = state.paralyzed;
  const maxHP = getBaseHP(unit.class);
  const icon = CLASS_ICONS[unit.class] || '';

  if (!faceUp) {
    return '<div class="unit-card unit-card--face-down-soft" data-face-up="false" data-name="' +
      escapeHtml(unit.name) + '" data-class="' + unit.class + '">' +
      '<div class="unit-card__content">' +
      '<span class="unit-card__badge unit-card__badge--face-down">Face-down</span>' +
      '<span class="unit-card__class">' + icon + ' ' + unit.class + '</span>' +
      '<span class="unit-card__name">' + escapeHtml(unit.name) + '</span>' +
      '</div></div>';
  }

  let markersHTML = '';
  if (damage > 0) {
    markersHTML += '<span class="marker marker--damage">' + damage + '/' + maxHP + ' dmg</span>';
  }
  if (paralyzed) {
    markersHTML += '<span class="marker marker--paralyzed">Paralyzed</span>';
  }

  return '<div class="unit-card unit-card--face-up" data-face-up="true" data-name="' +
    escapeHtml(unit.name) + '" data-class="' + unit.class + '" data-hp="' + maxHP + '" data-damage="' + damage + '">' +
    '<div class="unit-card__content">' +
    '<span class="unit-card__class">' + icon + ' ' + unit.class + '</span>' +
    '<span class="unit-card__name">' + escapeHtml(unit.name) + '</span>' +
    (markersHTML ? '<div class="unit-card__markers">' + markersHTML + '</div>' : '') +
    '</div></div>';
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
