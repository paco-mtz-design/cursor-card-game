/**
 * Tacticlash — Phase 3: New Game & setup flow
 */

(function () {
  const setupEl = document.getElementById('setup');
  const setupGoal = document.getElementById('setup-goal');
  const setupCoin = document.getElementById('setup-coin');
  const setupPlace = document.getElementById('setup-place');
  const coinResult = document.getElementById('coin-result');
  const btnFlipCoin = document.getElementById('btn-flip-coin');
  const btnAfterCoin = document.getElementById('btn-after-coin');
  const placeTitle = document.getElementById('place-title');
  const placeHint = document.getElementById('place-hint');
  const placementHand = document.getElementById('placement-hand');
  const btnNewGame = document.getElementById('btn-new-game');

  let state = getInitialState();

  function getInitialState() {
    return {
      phase: 'idle',
      captureGoal: 15,
      firstPlayer: null,
      unitDeck: [],
      p1Hand: [],
      p2Hand: [],
      board: { 1: [null, null, null, null, null], 2: [null, null, null, null, null] },
      placementPlayer: null,
      selectedPlacementIndex: null,
    };
  }

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

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function createUnitCardHTML(unit, state) {
    const faceUp = state.faceUp;
    const damage = state.damage || 0;
    const paralyzed = state.paralyzed || false;
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

  function clearBoard() {
    [1, 2].forEach(function (player) {
      const row = document.querySelector('.row--player' + player);
      const slots = row.querySelectorAll('.slot');
      slots.forEach(function (slot) {
        slot.innerHTML = '';
        slot.classList.remove('slot--occupied');
      });
    });
  }

  function renderBoard() {
    clearBoard();
    [1, 2].forEach(function (player) {
      const row = document.querySelector('.row--player' + player);
      const slots = row.querySelectorAll('.slot');
      const cells = state.board[player];
      cells.forEach(function (cell, i) {
        if (!cell) return;
        const unit = cell.unit;
        const cardState = { faceUp: cell.faceUp, damage: cell.damage || 0, paralyzed: cell.paralyzed || false };
        const html = createUnitCardHTML(unit, cardState);
        slots[i].innerHTML = html;
        slots[i].classList.add('slot--occupied');
      });
    });
  }

  function showStep(stepId) {
    setupGoal.hidden = stepId !== 'goal';
    setupCoin.hidden = stepId !== 'coin';
    setupPlace.hidden = stepId !== 'place';
    if (stepId === 'coin') {
      coinResult.hidden = true;
      btnFlipCoin.hidden = false;
      btnAfterCoin.hidden = true;
    }
  }

  function startNewGame() {
    state = getInitialState();
    state.phase = 'setup_goal';
    clearBoard();
    setupEl.hidden = false;
    showStep('goal');
  }

  function onGoalChosen(goal) {
    state.captureGoal = goal;
    state.phase = 'setup_coin';
    showStep('coin');
  }

  function onFlipCoin() {
    const heads = Math.random() < 0.5;
    state.firstPlayer = heads ? 1 : 2;
    coinResult.textContent = heads ? 'Heads — Player 1 goes first!' : 'Tails — Player 2 goes first!';
    coinResult.hidden = false;
    btnFlipCoin.hidden = true;
    btnAfterCoin.hidden = false;
  }

  function onAfterCoin() {
    state.unitDeck = shuffle([...CHARACTERS]);
    state.p1Hand = state.unitDeck.splice(0, 5);
    state.p2Hand = state.unitDeck.splice(0, 5);
    state.placementPlayer = 1;
    state.phase = 'setup_place_p1';
    showStep('place');
    renderPlacementStep();
    renderBoard();
  }

  function renderPlacementStep() {
    const player = state.placementPlayer;
    const hand = player === 1 ? state.p1Hand : state.p2Hand;
    placeTitle.textContent = 'Player ' + player + ': Place your units';
    placeHint.textContent = 'Click a unit below, then click an empty slot on your row.';
    placementHand.innerHTML = '';
    hand.forEach(function (unit, index) {
      const div = document.createElement('div');
      div.className = 'hand-card' + (state.selectedPlacementIndex === index ? ' hand-card--selected' : '');
      div.setAttribute('role', 'listitem');
      div.dataset.placementIndex = String(index);
      div.innerHTML = createUnitCardHTML(unit, { faceUp: true, damage: 0, paralyzed: false });
      placementHand.appendChild(div);
    });
  }

  function placeUnit(player, slotIndex) {
    const hand = player === 1 ? state.p1Hand : state.p2Hand;
    const idx = state.selectedPlacementIndex;
    if (idx == null || idx < 0 || idx >= hand.length) return;
    const unit = hand[idx];
    state.board[player][slotIndex] = { unit: unit, faceUp: false, damage: 0, paralyzed: false };
    hand.splice(idx, 1);
    state.selectedPlacementIndex = null;
    renderBoard();
    renderPlacementStep();
    if (hand.length === 0) {
      finishPlacementForPlayer(player);
    }
  }

  function placeAllRandomly() {
    const player = state.placementPlayer;
    const handRef = player === 1 ? state.p1Hand : state.p2Hand;
    if (handRef.length === 0) return;
    const emptySlots = [];
    for (let c = 0; c < 5; c++) {
      if (state.board[player][c] == null) emptySlots.push(c);
    }
    if (emptySlots.length === 0) return;
    const shuffled = shuffle(handRef.slice());
    const n = Math.min(shuffled.length, emptySlots.length);
    for (let i = 0; i < n; i++) {
      state.board[player][emptySlots[i]] = { unit: shuffled[i], faceUp: false, damage: 0, paralyzed: false };
    }
    const placedSet = new Set(shuffled.slice(0, n));
    for (let i = handRef.length - 1; i >= 0; i--) {
      if (placedSet.has(handRef[i])) handRef.splice(i, 1);
    }
    state.selectedPlacementIndex = null;
    renderBoard();
    renderPlacementStep();
    if (handRef.length === 0) finishPlacementForPlayer(player);
  }

  function finishPlacementForPlayer(player) {
    const hand = player === 1 ? state.p1Hand : state.p2Hand;
    if (hand.length > 0) return;
    if (player === 1) {
      state.placementPlayer = 2;
      state.phase = 'setup_place_p2';
      renderPlacementStep();
      renderBoard();
    } else {
      state.phase = 'playing';
      setupEl.hidden = true;
      renderBoard();
    }
  }

  function handlePlacementHandClick(e) {
    const card = e.target.closest('[data-placement-index]');
    if (!card) return;
    const index = parseInt(card.dataset.placementIndex, 10);
    const hand = state.placementPlayer === 1 ? state.p1Hand : state.p2Hand;
    if (index >= hand.length) return;
    state.selectedPlacementIndex = state.selectedPlacementIndex === index ? null : index;
    renderPlacementStep();
  }

  function handleSlotClick(e) {
    const slot = e.target.closest('.slot');
    if (!slot) return;
    const player = parseInt(slot.getAttribute('data-player'), 10);
    const column = parseInt(slot.getAttribute('data-column'), 10);
    if (state.phase === 'setup_place_p1' || state.phase === 'setup_place_p2') {
      if (player !== state.placementPlayer) return;
      if (state.board[player][column] != null) return;
      if (state.selectedPlacementIndex == null) return;
      placeUnit(player, column);
      return;
    }
    if (state.phase === 'playing') {
      console.log('Slot clicked: Player %s, Column %s', player, column);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    clearBoard();

    btnNewGame.addEventListener('click', startNewGame);

    document.querySelectorAll('[data-goal]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        onGoalChosen(parseInt(this.getAttribute('data-goal'), 10));
      });
    });

    btnFlipCoin.addEventListener('click', onFlipCoin);
    btnAfterCoin.addEventListener('click', onAfterCoin);

    document.getElementById('btn-place-randomly').addEventListener('click', placeAllRandomly);

    placementHand.addEventListener('click', handlePlacementHandClick);
    document.querySelector('.board').addEventListener('click', handleSlotClick);
  });
})();
