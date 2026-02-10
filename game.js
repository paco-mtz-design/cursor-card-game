/**
 * Tacticlash — Phase 4: Turn structure and action phase
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
  const turnBanner = document.getElementById('turn-banner');
  const turnLabel = document.getElementById('turn-label');
  const turnStep = document.getElementById('turn-step');
  const turnActions = document.getElementById('turn-actions');
  const btnMoveLeft = document.getElementById('btn-move-left');
  const btnMoveRight = document.getElementById('btn-move-right');
  const btnSkipMove = document.getElementById('btn-skip-move');
  const capturesEl = document.getElementById('captures');
  const capturesP1 = document.getElementById('captures-p1');
  const capturesP2 = document.getElementById('captures-p2');
  const captureGoalEl = document.getElementById('capture-goal-el');
  const captureGoalEl2 = document.getElementById('capture-goal-el-2');
  const gameLogEl = document.getElementById('game-log');
  const gameLogEntries = document.getElementById('game-log-entries');
  const gameOverEl = document.getElementById('game-over');
  const gameOverMessage = document.getElementById('game-over-message');
  const btnPass = document.getElementById('btn-pass');

  let state = getInitialState();

  function log(message) {
    if (!gameLogEntries) return;
    const entry = document.createElement('div');
    entry.className = 'game-log__entry';
    entry.textContent = message;
    gameLogEntries.appendChild(entry);
    gameLogEntries.scrollTop = gameLogEntries.scrollHeight;
  }

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
      gameOver: false,
      winner: null,
    };
  }

  function countUnits(player) {
    let n = 0;
    for (let c = 0; c < 5; c++) {
      if (state.board[player][c] != null) n++;
    }
    return n;
  }

  function checkGameOver() {
    if (state.p1Captures >= state.captureGoal) return 1;
    if (state.p2Captures >= state.captureGoal) return 2;
    if (countUnits(1) === 0) return 2;
    if (countUnits(2) === 0) return 1;
    return null;
  }

  function showGameOver(winner) {
    state.gameOver = true;
    state.winner = winner;
    if (gameOverEl) gameOverEl.hidden = false;
    if (gameOverMessage) gameOverMessage.textContent = "Player " + winner + " wins!";
    if (turnBanner) turnBanner.hidden = true;
    log("Game over — Player " + winner + " wins!");
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

  /** Returns true if attacker at attCol can attack enemy at defCol (same row = defender row). */
  function isInRange(attackerCol, defenderCol, attackerClass) {
    const d = Math.abs(defenderCol - attackerCol);
    if (attackerClass === 'Brawler') return d === 0;
    if (attackerClass === 'Lancer') return d === 1;
    if (attackerClass === 'Shooter') return d >= 2;
    if (attackerClass === 'Caster') return true;
    return false;
  }

  /** Lancer range: attacker column is diagonal to defender (defender at defCol). */
  function isLancerCounterRange(attackerCol, defenderCol) {
    return Math.abs(attackerCol - defenderCol) === 1;
  }

  /** Shooter Longshot: edge-to-edge (col 0 vs 4 or 4 vs 0). */
  function isLongshot(attackerCol, defenderCol) {
    return (attackerCol === 0 && defenderCol === 4) || (attackerCol === 4 && defenderCol === 0);
  }

  function canAttack(attackerPlayer, attackerCol) {
    const cell = state.board[attackerPlayer][attackerCol];
    if (!cell) return false;
    const opp = attackerPlayer === 1 ? 2 : 1;
    const attClass = cell.unit.class;
    for (let c = 0; c < 5; c++) {
      if (state.board[opp][c] == null) continue;
      if (isInRange(attackerCol, c, attClass)) return true;
    }
    return false;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function createUnitCardHTML(unit, cardState) {
    const faceUp = cardState.faceUp;
    const damage = cardState.damage || 0;
    const paralyzed = cardState.paralyzed || false;
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
        slot.classList.remove('slot--occupied', 'slot--selectable', 'slot--selected');
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
    if (state.phase === 'playing') highlightSlots();
  }

  function highlightSlots() {
    document.querySelectorAll('.slot').forEach(function (slot) {
      slot.classList.remove('slot--selectable', 'slot--selected');
    });
    const p = state.currentPlayer;
    const step = state.actionStep;
    const sel = state.selectedUnit;

    if (step === 'select_unit') {
      for (let c = 0; c < 5; c++) {
        const cell = state.board[p][c];
        if (!cell) continue;
        if (cell.paralyzed) continue;
        const slot = document.querySelector('.row--player' + p + ' .slot[data-column="' + c + '"]');
        if (slot) slot.classList.add('slot--selectable');
      }
    } else if (step === 'move' && sel) {
      const c = sel.column;
      const slot = document.querySelector('.row--player' + p + ' .slot[data-column="' + c + '"]');
      if (slot) slot.classList.add('slot--selected');
      if (c > 0) document.querySelector('.row--player' + p + ' .slot[data-column="' + (c - 1) + '"]')?.classList.add('slot--selectable');
      if (c < 4) document.querySelector('.row--player' + p + ' .slot[data-column="' + (c + 1) + '"]')?.classList.add('slot--selectable');
    } else if (step === 'attack' && sel) {
      const opp = p === 1 ? 2 : 1;
      const attCell = state.board[p][sel.column];
      if (!attCell) return;
      const attClass = attCell.unit.class;
      for (let c = 0; c < 5; c++) {
        if (state.board[opp][c] == null) continue;
        if (!isInRange(sel.column, c, attClass)) continue;
        const slot = document.querySelector('.row--player' + opp + ' .slot[data-column="' + c + '"]');
        if (slot) slot.classList.add('slot--selectable');
      }
    }
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
    turnBanner.hidden = true;
    capturesEl.hidden = true;
    if (gameLogEl) gameLogEl.hidden = true;
    if (gameOverEl) gameOverEl.hidden = true;
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
    if (hand.length === 0) finishPlacementForPlayer(player);
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
      state.currentPlayer = state.firstPlayer;
      state.capturedLastTurn = { 1: 0, 2: 0 };
      state.p1ItemHand = [];
      state.p2ItemHand = [];
      state.p1Captures = 0;
      state.p2Captures = 0;
      state.actionStep = 'select_unit';
      state.selectedUnit = null;
      state.moveDone = false;
      turnBanner.hidden = false;
      capturesEl.hidden = false;
      if (gameLogEl) gameLogEl.hidden = false;
      gameLogEntries.innerHTML = '';
      captureGoalEl.textContent = state.captureGoal;
      captureGoalEl2.textContent = state.captureGoal;
      startOfTurn();
    }
  }

  function startOfTurn() {
    const p = state.currentPlayer;
    state.actionStep = 'select_unit';
    state.selectedUnit = null;
    state.moveDone = false;

    const reinforcedCount = state.capturedLastTurn[p] || 0;
    const deckEmptyBefore = state.unitDeck.length === 0;
    runReinforcement(p);
    if (reinforcedCount > 0 && deckEmptyBefore) {
      log("Unit deck is empty — no reinforcement.");
    }
    drawItem(p);
    state.capturedLastTurn[p] = 0;

    var winner = checkGameOver();
    if (winner !== null) {
      showGameOver(winner);
      updateCaptureDisplay();
      renderBoard();
      return;
    }

    log("Player " + p + "'s turn.");
    if (reinforcedCount > 0 && !deckEmptyBefore) {
      log("Reinforcement: Player " + p + " places " + reinforcedCount + " unit(s) from the deck.");
    }
    log("Player " + p + " draws 1 item.");

    updateCaptureDisplay();
    renderTurnUI();
    renderBoard();
  }

  function runReinforcement(player) {
    const count = state.capturedLastTurn[player] || 0;
    const openSlots = [];
    for (let c = 0; c < 5; c++) {
      if (state.board[player][c] == null) openSlots.push(c);
    }
    for (let i = 0; i < count && state.unitDeck.length > 0 && openSlots.length > 0; i++) {
      const unit = state.unitDeck.shift();
      const slot = openSlots.shift();
      state.board[player][slot] = { unit: unit, faceUp: false, damage: 0, paralyzed: false };
    }
  }

  function drawItem(player) {
    const hand = player === 1 ? state.p1ItemHand : state.p2ItemHand;
    hand.push({ name: 'Item', id: 'item-' + Date.now() });
  }

  function clearParalyzedForPlayer(player) {
    for (let c = 0; c < 5; c++) {
      const cell = state.board[player][c];
      if (cell) cell.paralyzed = false;
    }
  }

  function updateCaptureDisplay() {
    capturesP1.textContent = state.p1Captures || 0;
    capturesP2.textContent = state.p2Captures || 0;
  }

  function renderTurnUI() {
    const p = state.currentPlayer;
    const step = state.actionStep;
    turnLabel.textContent = "Player " + p + "'s turn";

    turnActions.hidden = true;
    if (btnPass) btnPass.hidden = true;
    btnMoveLeft.hidden = false;
    btnMoveRight.hidden = false;
    btnSkipMove.hidden = false;

    if (step === 'select_unit') {
      turnStep.textContent = 'Select a unit to act.';
    } else if (step === 'move') {
      turnStep.textContent = 'Move (optional), then attack.';
      turnActions.hidden = false;
      const c = state.selectedUnit.column;
      btnMoveLeft.disabled = c <= 0 || state.board[p][c - 1] == null;
      btnMoveRight.disabled = c >= 4 || state.board[p][c + 1] == null;
    } else if (step === 'attack') {
      const canAtt = state.selectedUnit && canAttack(state.selectedUnit.player, state.selectedUnit.column);
      if (canAtt) {
        turnStep.textContent = 'Choose an enemy unit to attack.';
      } else {
        turnStep.textContent = 'No valid target — you may pass.';
        turnActions.hidden = false;
        btnMoveLeft.hidden = true;
        btnMoveRight.hidden = true;
        btnSkipMove.hidden = true;
        if (btnPass) btnPass.hidden = false;
      }
    }
  }

  function onSelectUnit(player, column) {
    const cell = state.board[player][column];
    if (!cell || cell.paralyzed) return;
    state.selectedUnit = { player: player, column: column };
    cell.faceUp = true;
    state.actionStep = 'move';
    log("Player " + player + "'s " + cell.unit.name + " (" + cell.unit.class + ") is revealed and acts.");
    renderTurnUI();
    renderBoard();
  }

  function doMove(direction) {
    if (state.actionStep !== 'move' || !state.selectedUnit) return;
    const p = state.selectedUnit.player;
    const c = state.selectedUnit.column;
    const next = c + (direction === 'left' ? -1 : 1);
    if (next < 0 || next > 4) return;
    const myCell = state.board[p][c];
    const otherCell = state.board[p][next];
    if (otherCell == null) return;
    state.board[p][c] = { unit: otherCell.unit, faceUp: otherCell.faceUp, damage: otherCell.damage || 0, paralyzed: otherCell.paralyzed || false };
    state.board[p][next] = { unit: myCell.unit, faceUp: true, damage: myCell.damage || 0, paralyzed: myCell.paralyzed || false };
    state.selectedUnit.column = next;
    state.moveDone = true;
    state.actionStep = 'attack';
    log("Player " + p + "'s " + myCell.unit.name + " moves " + direction + " (swaps with " + otherCell.unit.name + "). " + myCell.unit.name + " is revealed.");
    renderTurnUI();
    renderBoard();
  }

  function doSkipMove() {
    if (state.actionStep !== 'move' || !state.selectedUnit) return;
    const cell = state.board[state.selectedUnit.player][state.selectedUnit.column];
    cell.faceUp = true;
    state.actionStep = 'attack';
    log("Player " + state.selectedUnit.player + "'s " + cell.unit.name + " does not move.");
    renderTurnUI();
    renderBoard();
  }

  function doPass() {
    if (state.actionStep !== 'attack' || !state.selectedUnit) return;
    log("Player " + state.currentPlayer + " cannot attack — passes.");
    state.selectedUnit = null;
    state.actionStep = 'select_unit';
    renderTurnUI();
    renderBoard();
    endTurn();
  }

  function applyDamage(player, col, damageAmount, logPrefix) {
    const cell = state.board[player][col];
    if (!cell) return true;
    const maxHP = getBaseHP(cell.unit.class);
    const current = cell.damage || 0;
    const newTotal = current + damageAmount;
    cell.faceUp = true;
    if (newTotal >= maxHP) {
      log((logPrefix ? logPrefix + " " : "") + cell.unit.name + " is captured (0/" + maxHP + " HP).");
      state.board[player][col] = null;
      if (player === 1) {
        state.p2Captures = (state.p2Captures || 0) + 1;
        state.capturedLastTurn[1] = (state.capturedLastTurn[1] || 0) + 1;
      } else {
        state.p1Captures = (state.p1Captures || 0) + 1;
        state.capturedLastTurn[2] = (state.capturedLastTurn[2] || 0) + 1;
      }
      return true;
    }
    cell.damage = newTotal;
    log((logPrefix ? logPrefix + " " : "") + cell.unit.name + " takes " + damageAmount + " damage (" + newTotal + "/" + maxHP + " HP).");
    return false;
  }

  function resolveCombat(attackerPlayer, attackerCol, defenderPlayer, defenderCol) {
    const attCell = state.board[attackerPlayer][attackerCol];
    const defCell = state.board[defenderPlayer][defenderCol];
    if (!attCell || !defCell) return;

    log("Player " + attackerPlayer + "'s " + attCell.unit.name + " attacks (target in column " + defenderCol + ").");

    let attackBlocked = false;

    const colsToCheck = [];
    if (attackerCol - 1 >= 0) colsToCheck.push(attackerCol - 1);
    if (attackerCol + 1 <= 4) colsToCheck.push(attackerCol + 1);

    let lancerCol = null;
    for (let i = 0; i < colsToCheck.length; i++) {
      const c = colsToCheck[i];
      const cell = state.board[defenderPlayer][c];
      if (!cell || cell.unit.class !== 'Lancer') continue;
      lancerCol = c;
      break;
    }

    if (lancerCol !== null) {
      const lancerCell = state.board[defenderPlayer][lancerCol];
      lancerCell.faceUp = true;
      log(lancerCell.unit.name + " (Lancer) is in counter range — counterattack attempt (target not revealed).");
      const heads = Math.random() < 0.5;
      if (heads) {
        log("Lancer counterattack: heads — attack blocked, " + lancerCell.unit.name + " hits back for 1 HP.");
        attackBlocked = true;
        applyDamage(attackerPlayer, attackerCol, 1, "");
      } else {
        log("Lancer counterattack: tails — no counter. " + lancerCell.unit.name + " remains revealed.");
      }
    }

    if (!attackBlocked) {
      defCell.faceUp = true;
      log("Target revealed: Player " + defenderPlayer + "'s " + defCell.unit.name + " (" + defCell.unit.class + ").");

      const damage = (attCell.unit.class === 'Shooter' && isLongshot(attackerCol, defenderCol))
        ? 2
        : 1;
      if (attCell.unit.class === 'Shooter' && damage === 2) {
        log("Longshot (edge to edge): 2 damage.");
      }
      const captured = applyDamage(defenderPlayer, defenderCol, damage, "");
      if (!captured && state.board[defenderPlayer][defenderCol] && attCell.unit.class === 'Caster') {
        state.board[defenderPlayer][defenderCol].paralyzed = true;
        log(state.board[defenderPlayer][defenderCol].unit.name + " is paralyzed (Magic Paralysis).");
      }
    }

    replaceCapturedUnitsBeforePass();
    var winner = checkGameOver();
    if (winner !== null) {
      showGameOver(winner);
      state.selectedUnit = null;
      state.actionStep = 'select_unit';
      updateCaptureDisplay();
      renderBoard();
      return;
    }
    state.selectedUnit = null;
    state.actionStep = 'select_unit';
    updateCaptureDisplay();
    renderBoard();
    endTurn();
  }

  function replaceCapturedUnitsBeforePass() {
    const p = state.currentPlayer;
    const count = state.capturedLastTurn[p] || 0;
    if (count === 0) return;
    log("Reinforcement: Player " + p + " replaces " + count + " captured unit(s) before passing turn.");
    runReinforcement(p);
    state.capturedLastTurn[p] = 0;
  }

  function endTurn() {
    clearParalyzedForPlayer(state.currentPlayer);
    state.currentPlayer = state.currentPlayer === 1 ? 2 : 1;
    startOfTurn();
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

    if (state.phase !== 'playing' || state.gameOver) return;

    const p = state.currentPlayer;
    const step = state.actionStep;

    if (step === 'select_unit') {
      if (player === p && state.board[p][column] && !state.board[p][column].paralyzed) {
        onSelectUnit(p, column);
      }
      return;
    }

    if (step === 'attack' && state.selectedUnit) {
      const opp = p === 1 ? 2 : 1;
      if (player === opp && state.board[opp][column]) {
        const attCell = state.board[p][state.selectedUnit.column];
        if (attCell && isInRange(state.selectedUnit.column, column, attCell.unit.class)) {
          resolveCombat(p, state.selectedUnit.column, opp, column);
        }
      }
      return;
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

    btnMoveLeft.addEventListener('click', function () { if (!state.gameOver) doMove('left'); });
    btnMoveRight.addEventListener('click', function () { if (!state.gameOver) doMove('right'); });
    btnSkipMove.addEventListener('click', function () { if (!state.gameOver) doSkipMove(); });
    if (btnPass) btnPass.addEventListener('click', function () { if (!state.gameOver) doPass(); });

    placementHand.addEventListener('click', handlePlacementHandClick);
    document.querySelector('.board').addEventListener('click', handleSlotClick);
  });
})();
