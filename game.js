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
  const itemHandsEl = document.getElementById('item-hands');
  const itemHandP1El = document.getElementById('item-hand-p1');
  const itemHandP2El = document.getElementById('item-hand-p2');
  const btnDoneWithItems = document.getElementById('btn-done-with-items');
  const itemDrawDebugEl = document.getElementById('item-draw-debug');
  const btnReplaceDrawWithPick = document.getElementById('btn-replace-draw-with-pick');
  const itemPickListWrapEl = document.getElementById('item-pick-list-wrap');
  const itemPickListSearchEl = document.getElementById('item-pick-list-search');
  const itemPickListEl = document.getElementById('item-pick-list');
  const btnPickListClose = document.getElementById('btn-pick-list-close');
  const discardPileEl = document.getElementById('discard-pile');
  const discardPileCountEl = document.getElementById('discard-pile-count');
  const btnDiscardToggle = document.getElementById('btn-discard-toggle');
  const discardPileListEl = document.getElementById('discard-pile-list');
  const btnWardstoneUse = document.getElementById('btn-wardstone-use');
  const btnWardstoneNo = document.getElementById('btn-wardstone-no');

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
      terrain: { 1: [null, null, null, null, null], 2: [null, null, null, null, null] },
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

  function getArmorHPBonus(armorName) {
    if (!armorName || typeof ITEM_SPECS === 'undefined') return 0;
    const spec = ITEM_SPECS[armorName];
    return spec && spec.type === 'gear_armor' && spec.hpBonus != null ? spec.hpBonus : 0;
  }

  function getGearAllowedClasses(gearName) {
    if (!gearName || typeof ITEM_SPECS === 'undefined') return [];
    const spec = ITEM_SPECS[gearName];
    var isEquippable = spec && (spec.type === 'gear_armor' || spec.type === 'gear_accessory') && Array.isArray(spec.allowedClasses);
    return isEquippable ? spec.allowedClasses : [];
  }

  function getMaxHP(cell) {
    if (!cell || !cell.unit) return 0;
    const base = getBaseHP(cell.unit.class);
    const bonus = cell.gear ? getArmorHPBonus(cell.gear.name) : 0;
    return base + bonus;
  }

  function getMaxHPWithGear(unitClass, armorName) {
    return getBaseHP(unitClass) + getArmorHPBonus(armorName);
  }

  function canEquipGear(cell, gearName) {
    if (!cell || !cell.unit || !gearName) return false;
    const allowed = getGearAllowedClasses(gearName);
    if (allowed.indexOf(cell.unit.class) === -1) return false;
    const maxAfter = getMaxHPWithGear(cell.unit.class, gearName);
    const damage = cell.damage || 0;
    return damage < maxAfter;
  }

  function countValidGearTargets(gearName) {
    const p = state.currentPlayer;
    let n = 0;
    for (let c = 0; c < 5; c++) {
      const cell = state.board[p][c];
      if (cell && canEquipGear(cell, gearName)) n++;
    }
    return n;
  }

  var ACCESSORY_ITEM_NAMES = ['Barbed Gauntlets', 'Wardstone Bracelet', 'Teleport Boots', 'True-Strike Lens'];
  var GEAR_EQUIP_ITEM_NAMES = ['Light Armor', 'Premium Light Armor', 'Heavy Armor'].concat(ACCESSORY_ITEM_NAMES);

  function getTerrain(player, col) {
    if (!state.terrain || !state.terrain[player]) return null;
    const t = state.terrain[player][col];
    return t && t.name ? t.name : null;
  }

  function countEmptyTerrainSlots() {
    let n = 0;
    for (let pl = 1; pl <= 2; pl++) {
      for (let c = 0; c < 5; c++) {
        if (state.terrain[pl][c] == null) n++;
      }
    }
    return n;
  }

  function countTilesWithTerrain() {
    let n = 0;
    for (let pl = 1; pl <= 2; pl++) {
      for (let c = 0; c < 5; c++) {
        if (state.terrain[pl][c] != null) n++;
      }
    }
    return n;
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

  /** For Magic Grenade: effective class is Caster when nextAttackAsCaster is set. */
  function getEffectiveAttackerClass(attCell) {
    if (!attCell) return null;
    return attCell.nextAttackAsCaster ? 'Caster' : attCell.unit.class;
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
    if (cell.cannotAttackNextTurn) return false;
    const opp = attackerPlayer === 1 ? 2 : 1;
    const attClass = getEffectiveAttackerClass(cell);
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

  /** Slug for asset filenames: "Harlund Ironhowl" -> "harlund-ironhowl" */
  function nameToSlug(name) {
    return String(name).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }

  function getUnitSpritePath(unit) {
    return 'assets/units/' + nameToSlug(unit.name) + '.png';
  }

  function createUnitCardHTML(unit, cardState) {
    const faceUp = cardState.faceUp;
    const damage = cardState.damage || 0;
    const paralyzed = cardState.paralyzed || false;
    const cannotAttackNextTurn = cardState.cannotAttackNextTurn || false;
    const maxHP = cardState.maxHP != null ? cardState.maxHP : getBaseHP(unit.class);
    const gear = cardState.gear || null;
    const icon = CLASS_ICONS[unit.class] || '';

    const spritePath = getUnitSpritePath(unit);
    const spriteImg = '<img class="unit-card__sprite" src="' + escapeHtml(spritePath) + '" alt="" role="presentation" onerror="this.classList.add(\'unit-card__sprite--missing\')">';

    if (!faceUp) {
      const damageMarker = damage > 0 ? '<span class="marker marker--damage">' + damage + '/' + maxHP + ' dmg</span>' : '';
      const netMarker = cannotAttackNextTurn ? '<span class="marker marker--cannot-attack">Can\'t attack</span>' : '';
      const gearBadge = gear ? '<span class="unit-card__gear">' + escapeHtml(gear.name) + '</span>' : '';
      return '<div class="unit-card unit-card--face-down-soft" data-face-up="false" data-name="' +
        escapeHtml(unit.name) + '" data-class="' + unit.class + '" data-hp="' + maxHP + '" data-damage="' + damage + '">' +
        '<div class="unit-card__content">' +
        spriteImg +
        '<span class="unit-card__badge unit-card__badge--face-down">Face-down</span>' +
        damageMarker +
        netMarker +
        gearBadge +
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
    if (cannotAttackNextTurn) {
      markersHTML += '<span class="marker marker--cannot-attack">Can\'t attack</span>';
    }
    const gearBadge = gear ? '<span class="unit-card__gear">' + escapeHtml(gear.name) + '</span>' : '';

    return '<div class="unit-card unit-card--face-up" data-face-up="true" data-name="' +
      escapeHtml(unit.name) + '" data-class="' + unit.class + '" data-hp="' + maxHP + '" data-damage="' + damage + '">' +
      '<div class="unit-card__content">' +
      spriteImg +
      (gearBadge ? gearBadge : '') +
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
      const terrainRow = state.terrain && state.terrain[player] ? state.terrain[player] : [];
      cells.forEach(function (cell, i) {
        const terrainPart = terrainRow[i] ? '<div class="terrain-badge">' + terrainRow[i].name + '</div>' : '';
        const unitPart = cell ? createUnitCardHTML(cell.unit, { faceUp: cell.faceUp, damage: cell.damage || 0, paralyzed: cell.paralyzed || false, cannotAttackNextTurn: cell.cannotAttackNextTurn || false, maxHP: getMaxHP(cell), gear: cell.gear || null }) : '';
        slots[i].innerHTML = terrainPart + unitPart;
        if (cell) slots[i].classList.add('slot--occupied');
      });
    });
    if (state.phase === 'playing') {
      highlightSlots();
      if (state.p1ItemHand != null) renderItemHands();
      if (itemDrawDebugEl) {
        itemDrawDebugEl.hidden = state.actionStep !== 'use_items' || !!state.itemTargeting || !!state.obscuringReorder;
      }
      if (state.actionStep !== 'use_items' || state.itemTargeting) {
        if (itemPickListWrapEl) itemPickListWrapEl.setAttribute('hidden', '');
      }
      renderDiscardPile();
    }
  }

  function renderDiscardPile() {
    if (!discardPileCountEl || !discardPileListEl) return;
    const list = state.itemDiscard || [];
    discardPileCountEl.textContent = list.length;
    discardPileListEl.innerHTML = '';
    list.forEach(function (item) {
      const el = document.createElement('div');
      el.className = 'discard-pile__item';
      el.textContent = item.name;
      discardPileListEl.appendChild(el);
    });
  }

  function highlightSlots() {
    document.querySelectorAll('.slot').forEach(function (slot) {
      slot.classList.remove('slot--selectable', 'slot--selected');
    });
    if (state.pendingWardstone) return;
    const p = state.currentPlayer;
    const step = state.actionStep;
    const sel = state.selectedUnit;

    if (state.obscuringReorder) {
      const reord = state.obscuringReorder;
      for (let c = 0; c < 5; c++) {
        if (state.board[reord.player][c] == null) continue;
        const slot = document.querySelector('.row--player' + reord.player + ' .slot[data-column="' + c + '"]');
        if (slot) {
          slot.classList.add('slot--selectable');
          if (reord.selectedCol === c) slot.classList.add('slot--selected');
        }
      }
      return;
    }

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
      const myCell = state.board[p][c];
      const hasTeleportBoots = myCell && myCell.gear && myCell.gear.name === 'Teleport Boots';
      const slot = document.querySelector('.row--player' + p + ' .slot[data-column="' + c + '"]');
      if (slot) slot.classList.add('slot--selected');
      if (hasTeleportBoots) {
        for (let col = 0; col < 5; col++) {
          if (col === c) continue;
          document.querySelector('.row--player' + p + ' .slot[data-column="' + col + '"]')?.classList.add('slot--selectable');
        }
      } else {
        if (c > 0) document.querySelector('.row--player' + p + ' .slot[data-column="' + (c - 1) + '"]')?.classList.add('slot--selectable');
        if (c < 4) document.querySelector('.row--player' + p + ' .slot[data-column="' + (c + 1) + '"]')?.classList.add('slot--selectable');
      }
    } else if (step === 'attack' && sel) {
      const opp = p === 1 ? 2 : 1;
      const attCell = state.board[p][sel.column];
      if (!attCell) return;
      if (attCell.cannotAttackNextTurn) return;
      const attClass = getEffectiveAttackerClass(attCell);
      for (let c = 0; c < 5; c++) {
        if (state.board[opp][c] == null) continue;
        if (!isInRange(sel.column, c, attClass)) continue;
        const slot = document.querySelector('.row--player' + opp + ' .slot[data-column="' + c + '"]');
        if (slot) slot.classList.add('slot--selectable');
      }
    } else if (step === 'use_items' && state.itemTargeting) {
      const itemName = state.itemTargeting.itemName;
      if (itemName === 'Healing Potion') {
        for (let pl = 1; pl <= 2; pl++) {
          for (let c = 0; c < 5; c++) {
            const cell = state.board[pl][c];
            if (!cell || (cell.damage || 0) < 1) continue;
            const slot = document.querySelector('.row--player' + pl + ' .slot[data-column="' + c + '"]');
            if (slot) slot.classList.add('slot--selectable');
          }
        }
      } else if (itemName === 'All revealing lantern-jar') {
        const opp = p === 1 ? 2 : 1;
        for (let c = 0; c < 5; c++) {
          const cell = state.board[opp][c];
          if (!cell || cell.faceUp) continue;
          const slot = document.querySelector('.row--player' + opp + ' .slot[data-column="' + c + '"]');
          if (slot) slot.classList.add('slot--selectable');
        }
      } else if (itemName === 'Tangle-Vine Bola') {
        const opp = p === 1 ? 2 : 1;
        for (let c = 0; c < 5; c++) {
          if (state.board[opp][c] == null) continue;
          const slot = document.querySelector('.row--player' + opp + ' .slot[data-column="' + c + '"]');
          if (slot) slot.classList.add('slot--selectable');
        }
      } else if (GEAR_EQUIP_ITEM_NAMES.indexOf(itemName) !== -1) {
        for (let c = 0; c < 5; c++) {
          const cell = state.board[p][c];
          if (!cell || !canEquipGear(cell, itemName)) continue;
          const slot = document.querySelector('.row--player' + p + ' .slot[data-column="' + c + '"]');
          if (slot) slot.classList.add('slot--selectable');
        }
      } else if (typeof TERRAIN_ITEM_NAMES !== 'undefined' && TERRAIN_ITEM_NAMES.indexOf(itemName) !== -1) {
        for (let pl = 1; pl <= 2; pl++) {
          for (let c = 0; c < 5; c++) {
            if (state.terrain[pl][c] != null) continue;
            const slot = document.querySelector('.row--player' + pl + ' .slot[data-column="' + c + '"]');
            if (slot) slot.classList.add('slot--selectable');
          }
        }
      } else if (itemName === 'Tectonic Spike') {
        for (let pl = 1; pl <= 2; pl++) {
          for (let c = 0; c < 5; c++) {
            if (state.terrain[pl][c] == null) continue;
            const slot = document.querySelector('.row--player' + pl + ' .slot[data-column="' + c + '"]');
            if (slot) slot.classList.add('slot--selectable');
          }
        }
      } else if (itemName === 'Corrosive Phial') {
        for (let pl = 1; pl <= 2; pl++) {
          for (let c = 0; c < 5; c++) {
            const cell = state.board[pl][c];
            if (!cell || !cell.faceUp || !cell.gear) continue;
            const slot = document.querySelector('.row--player' + pl + ' .slot[data-column="' + c + '"]');
            if (slot) slot.classList.add('slot--selectable');
          }
        }
      } else if (itemName === 'Magic Grenade') {
        for (let c = 0; c < 5; c++) {
          if (state.board[p][c] == null) continue;
          const slot = document.querySelector('.row--player' + p + ' .slot[data-column="' + c + '"]');
          if (slot) slot.classList.add('slot--selectable');
        }
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
    if (itemHandsEl) itemHandsEl.hidden = true;
    if (discardPileEl) discardPileEl.hidden = true;
    if (gameLogEl) gameLogEl.hidden = true;
    if (itemPickListWrapEl) itemPickListWrapEl.setAttribute('hidden', '');
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
    state.board[player][slotIndex] = { unit: unit, faceUp: false, damage: 0, paralyzed: false, gear: null };
    if (getTerrain(player, slotIndex) === 'Divine Light') state.board[player][slotIndex].faceUp = true;
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
      const slot = emptySlots[i];
      state.board[player][slot] = { unit: shuffled[i], faceUp: false, damage: 0, paralyzed: false, gear: null };
      if (getTerrain(player, slot) === 'Divine Light') state.board[player][slot].faceUp = true;
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
      state.itemDeck = shuffle(buildItemDeck());
      state.itemDiscard = [];
      state.terrain = { 1: [null, null, null, null, null], 2: [null, null, null, null, null] };
      state.p1Captures = 0;
      state.p2Captures = 0;
      state.actionStep = 'use_items';
      state.selectedUnit = null;
      state.moveDone = false;
      state.itemTargeting = null;
      state.vorpalNextAttack = null;
      turnBanner.hidden = false;
      capturesEl.hidden = false;
      if (itemHandsEl) itemHandsEl.hidden = false;
      if (discardPileEl) discardPileEl.hidden = false;
      if (gameLogEl) gameLogEl.hidden = false;
      gameLogEntries.innerHTML = '';
      captureGoalEl.textContent = state.captureGoal;
      captureGoalEl2.textContent = state.captureGoal;
      startOfTurn();
    }
  }

  function startOfTurn() {
    const p = state.currentPlayer;
    state.actionStep = 'use_items';
    state.selectedUnit = null;
    state.moveDone = false;
    state.itemTargeting = null;

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
      state.board[player][slot] = { unit: unit, faceUp: false, damage: 0, paralyzed: false, gear: null };
      if (getTerrain(player, slot) === 'Divine Light') state.board[player][slot].faceUp = true;
    }
  }

  /** Draw one item. If optionalName is provided (debug), draw that card from the deck if present. */
  function drawItem(player, optionalName) {
    const hand = player === 1 ? state.p1ItemHand : state.p2ItemHand;
    let name = 'Item';
    if (state.itemDeck && state.itemDeck.length > 0) {
      if (optionalName) {
        const idx = state.itemDeck.indexOf(optionalName);
        if (idx !== -1) {
          state.itemDeck.splice(idx, 1);
          name = optionalName;
        } else {
          name = state.itemDeck.shift();
        }
      } else {
        name = state.itemDeck.shift();
      }
    }
    hand.push({ name: name, id: 'item-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8) });
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

  function countUnitsWithDamageAtLeast(minDamage) {
    let n = 0;
    for (let pl = 1; pl <= 2; pl++) {
      for (let c = 0; c < 5; c++) {
        const cell = state.board[pl][c];
        if (cell && (cell.damage || 0) >= minDamage) n++;
      }
    }
    return n;
  }

  /** Count face-down units on the opponent's row (for All revealing lantern-jar). */
  function countFaceDownEnemyUnits(currentPlayer) {
    const opp = currentPlayer === 1 ? 2 : 1;
    let n = 0;
    for (let c = 0; c < 5; c++) {
      const cell = state.board[opp][c];
      if (cell && !cell.faceUp) n++;
    }
    return n;
  }

  /** Count enemy units (for Tangle-Vine Bola). */
  function countEnemyUnits(currentPlayer) {
    const opp = currentPlayer === 1 ? 2 : 1;
    let n = 0;
    for (let c = 0; c < 5; c++) {
      if (state.board[opp][c] != null) n++;
    }
    return n;
  }

  /** Count face-up units with gear (for Corrosive Phial targeting). */
  function countFaceUpUnitsWithGear() {
    let n = 0;
    for (let pl = 1; pl <= 2; pl++) {
      for (let c = 0; c < 5; c++) {
        const cell = state.board[pl][c];
        if (cell && cell.faceUp && cell.gear) n++;
      }
    }
    return n;
  }

  /** Count any units with gear (for Corrosive Phial Use button visibility). */
  function countUnitsWithGear() {
    let n = 0;
    for (let pl = 1; pl <= 2; pl++) {
      for (let c = 0; c < 5; c++) {
        const cell = state.board[pl][c];
        if (cell && cell.gear) n++;
      }
    }
    return n;
  }

  function renderItemHands() {
    if (!itemHandP1El || !itemHandP2El) return;
    const p1Hand = state.p1ItemHand || [];
    const p2Hand = state.p2ItemHand || [];
    const p = state.currentPlayer;
    const step = state.actionStep;
    const isUseItems = step === 'use_items' && !state.itemTargeting;
    const canPlayHealingPotion = isUseItems && countUnitsWithDamageAtLeast(1) > 0;
    const canPlayRevealingLight = isUseItems && countFaceDownEnemyUnits(p) > 0;
    const canPlayDisablingNet = isUseItems && countEnemyUnits(p) > 0;

    itemHandP1El.innerHTML = '';
    itemHandP2El.innerHTML = '';

    function canPlaySingleUse(itemName) {
      if (itemName === 'Healing Potion') return canPlayHealingPotion;
      if (itemName === 'All revealing lantern-jar') return canPlayRevealingLight;
      if (itemName === 'Tangle-Vine Bola') return canPlayDisablingNet;
      if (itemName === 'Vorpal Honing Amulet') return true;
      if (itemName === 'Corrosive Phial') return countUnitsWithGear() > 0;
      if (itemName === 'Obscuring bomb') return countUnits(p) > 0;
      if (itemName === 'Magic Grenade') return countUnits(p) > 0;
      return false;
    }

    function canPlayGear(gearName) {
      return countValidGearTargets(gearName) > 0;
    }

    function buildItemCard(item, index, isCurrentPlayer) {
      const el = document.createElement('div');
      el.className = 'item-card';
      el.setAttribute('role', 'listitem');
      el.dataset.itemIndex = String(index);
      el.dataset.itemName = item.name;
      el.dataset.player = '1';

      const nameSpan = document.createElement('span');
      nameSpan.className = 'item-card__name';
      nameSpan.textContent = item.name;
      el.appendChild(nameSpan);

      const spec = typeof ITEM_SPECS !== 'undefined' && ITEM_SPECS[item.name];
      if (spec && spec.effect) {
        const effectDiv = document.createElement('div');
        effectDiv.className = 'item-card__effect';
        effectDiv.textContent = spec.effect;
        effectDiv.setAttribute('aria-hidden', 'true');
        el.appendChild(effectDiv);
      }

      if (isCurrentPlayer && isUseItems && spec && spec.type === 'single_use' && canPlaySingleUse(item.name)) {
        const useBtn = document.createElement('button');
        useBtn.type = 'button';
        useBtn.className = 'item-card__use btn btn--small';
        useBtn.textContent = 'Use';
        useBtn.dataset.itemIndex = String(index);
        useBtn.dataset.itemName = item.name;
        el.appendChild(useBtn);
      }
      if (isCurrentPlayer && isUseItems && spec && (spec.type === 'gear_armor' || spec.type === 'gear_accessory') && canPlayGear(item.name)) {
        const useBtn = document.createElement('button');
        useBtn.type = 'button';
        useBtn.className = 'item-card__use btn btn--small';
        useBtn.textContent = 'Use';
        useBtn.dataset.itemIndex = String(index);
        useBtn.dataset.itemName = item.name;
        el.appendChild(useBtn);
      }
      if (isCurrentPlayer && isUseItems && typeof TERRAIN_ITEM_NAMES !== 'undefined' && TERRAIN_ITEM_NAMES.indexOf(item.name) !== -1 && countEmptyTerrainSlots() > 0) {
        const useBtn = document.createElement('button');
        useBtn.type = 'button';
        useBtn.className = 'item-card__use btn btn--small';
        useBtn.textContent = 'Use';
        useBtn.dataset.itemIndex = String(index);
        useBtn.dataset.itemName = item.name;
        el.appendChild(useBtn);
      }
      if (isCurrentPlayer && isUseItems && item.name === 'Tectonic Spike' && countTilesWithTerrain() > 0) {
        const useBtn = document.createElement('button');
        useBtn.type = 'button';
        useBtn.className = 'item-card__use btn btn--small';
        useBtn.textContent = 'Use';
        useBtn.dataset.itemIndex = String(index);
        useBtn.dataset.itemName = item.name;
        el.appendChild(useBtn);
      }

      return el;
    }

    p1Hand.forEach(function (item, index) {
      itemHandP1El.appendChild(buildItemCard(item, index, p === 1));
    });
    p2Hand.forEach(function (item, index) {
      const el = buildItemCard(item, index, p === 2);
      el.dataset.player = '2';
      itemHandP2El.appendChild(el);
    });
  }

  function renderTurnUI() {
    const p = state.currentPlayer;
    const step = state.actionStep;
    turnLabel.textContent = "Player " + p + "'s turn";

    turnActions.hidden = true;
    if (btnPass) btnPass.hidden = true;
    if (btnDoneWithItems) btnDoneWithItems.hidden = true;
    if (btnWardstoneUse) btnWardstoneUse.hidden = true;
    if (btnWardstoneNo) btnWardstoneNo.hidden = true;
    btnMoveLeft.hidden = false;
    btnMoveRight.hidden = false;
    btnSkipMove.hidden = false;

    if (state.pendingWardstone) {
      turnStep.textContent = "Use Wardstone to negate this attack?";
      turnActions.hidden = false;
      btnMoveLeft.hidden = true;
      btnMoveRight.hidden = true;
      btnSkipMove.hidden = true;
      if (btnWardstoneUse) btnWardstoneUse.hidden = false;
      if (btnWardstoneNo) btnWardstoneNo.hidden = false;
      return;
    }

    if (step === 'use_items') {
      if (state.obscuringReorder) {
        turnStep.textContent = 'Reorder your units: click one slot, then another to swap. Then click Done reordering.';
        turnActions.hidden = false;
        btnMoveLeft.hidden = true;
        btnMoveRight.hidden = true;
        btnSkipMove.hidden = true;
        if (btnPass) btnPass.hidden = true;
        if (btnDoneWithItems) {
          btnDoneWithItems.textContent = 'Done reordering';
          btnDoneWithItems.hidden = false;
        }
      } else {
        const it = state.itemTargeting;
        if (it) {
          if (it.itemName === 'Healing Potion') turnStep.textContent = 'Choose a unit with at least 1 damage (target for Healing Potion).';
          else if (it.itemName === 'All revealing lantern-jar') turnStep.textContent = 'Choose a face-down enemy unit (All revealing lantern-jar).';
          else if (it.itemName === 'Tangle-Vine Bola') turnStep.textContent = 'Choose an enemy unit (Tangle-Vine Bola).';
          else if (it.itemName === 'Corrosive Phial') turnStep.textContent = 'Choose a face-up unit with gear (Corrosive Phial).';
          else if (it.itemName === 'Magic Grenade') turnStep.textContent = 'Choose your unit to attack as Caster (Magic Grenade).';
          else if (GEAR_EQUIP_ITEM_NAMES.indexOf(it.itemName) !== -1) {
            var ac = getGearAllowedClasses(it.itemName);
            turnStep.textContent = 'Choose a ' + (ac.join(', ').replace(/, ([^,]*)$/, ' or $1')) + ' to equip ' + it.itemName + '.';
          } else turnStep.textContent = 'Choose target for ' + (it.itemName || 'item') + '.';
        } else {
          turnStep.textContent = 'Use items (optional), then continue to combat.';
        }
        turnActions.hidden = false;
        btnMoveLeft.hidden = true;
        btnMoveRight.hidden = true;
        btnSkipMove.hidden = true;
        if (btnPass) btnPass.hidden = true;
        if (btnDoneWithItems) btnDoneWithItems.textContent = state.itemTargeting ? 'Cancel' : 'Done with items';
        if (btnDoneWithItems) btnDoneWithItems.hidden = false;
      }
    } else if (step === 'select_unit') {
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

    if (getTerrain(p, c) === 'Paralyzing Vines') {
      const heads = Math.random() < 0.5;
      if (!heads) {
        log("Paralyzing Vines: tails — " + myCell.unit.name + "'s move fails. " + myCell.unit.name + " must still attack.");
        state.moveDone = true;
        state.actionStep = 'attack';
        renderTurnUI();
        renderBoard();
        return;
      }
      log("Paralyzing Vines: heads — " + myCell.unit.name + " breaks free and moves.");
    }

    state.board[p][c] = { unit: otherCell.unit, faceUp: otherCell.faceUp, damage: otherCell.damage || 0, paralyzed: otherCell.paralyzed || false, cannotAttackNextTurn: otherCell.cannotAttackNextTurn || false, gear: otherCell.gear || null };
    state.board[p][next] = { unit: myCell.unit, faceUp: true, damage: myCell.damage || 0, paralyzed: myCell.paralyzed || false, cannotAttackNextTurn: myCell.cannotAttackNextTurn || false, nextAttackAsCaster: myCell.nextAttackAsCaster || false, gear: myCell.gear || null };
    state.selectedUnit.column = next;
    state.moveDone = true;
    state.actionStep = 'attack';
    if (getTerrain(p, c) === 'Divine Light' && state.board[p][c]) state.board[p][c].faceUp = true;
    if (getTerrain(p, next) === 'Divine Light' && state.board[p][next]) state.board[p][next].faceUp = true;
    let moveLog = "Player " + p + "'s " + myCell.unit.name + " moves " + direction + " (swaps with " + otherCell.unit.name + ").";
    if (getTerrain(p, c) === 'Divine Light' && state.board[p][c]) moveLog += " " + otherCell.unit.name + " is revealed (Divine Light).";
    log(moveLog);
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

  function doTeleportMove(toCol) {
    if (state.actionStep !== 'move' || !state.selectedUnit) return;
    const p = state.selectedUnit.player;
    const fromCol = state.selectedUnit.column;
    const myCell = state.board[p][fromCol];
    if (!myCell || !myCell.gear || myCell.gear.name !== 'Teleport Boots') return;
    if (toCol < 0 || toCol > 4 || toCol === fromCol) return;
    const targetCell = state.board[p][toCol];

    if (getTerrain(p, fromCol) === 'Paralyzing Vines') {
      const heads = Math.random() < 0.5;
      if (!heads) {
        log("Paralyzing Vines: tails — " + myCell.unit.name + "'s teleport fails. " + myCell.unit.name + " must still attack.");
        state.moveDone = true;
        state.actionStep = 'attack';
        renderTurnUI();
        renderBoard();
        return;
      }
      log("Paralyzing Vines: heads — " + myCell.unit.name + " breaks free and teleports.");
    }

    if (targetCell == null) {
      state.board[p][toCol] = { unit: myCell.unit, faceUp: true, damage: myCell.damage || 0, paralyzed: myCell.paralyzed || false, cannotAttackNextTurn: myCell.cannotAttackNextTurn || false, nextAttackAsCaster: myCell.nextAttackAsCaster || false, gear: myCell.gear || null };
      state.board[p][fromCol] = null;
      if (getTerrain(p, toCol) === 'Divine Light') state.board[p][toCol].faceUp = true;
      log("Player " + p + "'s " + myCell.unit.name + " teleports to column " + toCol + ".");
    } else {
      state.board[p][fromCol] = { unit: targetCell.unit, faceUp: targetCell.faceUp, damage: targetCell.damage || 0, paralyzed: targetCell.paralyzed || false, cannotAttackNextTurn: targetCell.cannotAttackNextTurn || false, gear: targetCell.gear || null };
      state.board[p][toCol] = { unit: myCell.unit, faceUp: true, damage: myCell.damage || 0, paralyzed: myCell.paralyzed || false, cannotAttackNextTurn: myCell.cannotAttackNextTurn || false, nextAttackAsCaster: myCell.nextAttackAsCaster || false, gear: myCell.gear || null };
      state.selectedUnit.column = toCol;
      if (getTerrain(p, fromCol) === 'Divine Light') state.board[p][fromCol].faceUp = true;
      if (getTerrain(p, toCol) === 'Divine Light') state.board[p][toCol].faceUp = true;
      let teleportLog = "Player " + p + "'s " + myCell.unit.name + " teleports (swaps with " + targetCell.unit.name + ").";
      if (getTerrain(p, fromCol) === 'Divine Light' && state.board[p][fromCol]) teleportLog += " " + targetCell.unit.name + " is revealed (Divine Light).";
      log(teleportLog);
    }
    state.selectedUnit.column = toCol;
    state.moveDone = true;
    state.actionStep = 'attack';
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

  function doDoneWithItems() {
    if (state.actionStep !== 'use_items') return;
    if (state.obscuringReorder) {
      doDoneObscuringReorder();
      return;
    }
    if (state.itemTargeting) {
      state.itemTargeting = null;
      renderTurnUI();
      renderBoard();
      return;
    }
    state.actionStep = 'select_unit';
    renderTurnUI();
    renderBoard();
  }

  function doWardstoneUse() {
    if (!state.pendingWardstone) return;
    const defCell = state.board[state.pendingWardstone.defPlayer][state.pendingWardstone.defCol];
    if (!defCell || !defCell.gear || defCell.gear.name !== 'Wardstone Bracelet') {
      state.pendingWardstone = null;
      renderTurnUI();
      renderBoard();
      return;
    }
    if (!state.itemDiscard) state.itemDiscard = [];
    state.itemDiscard.push(defCell.gear);
    defCell.gear = null;
    log("Player " + state.pendingWardstone.defPlayer + " uses Wardstone Bracelet — attack negated.");
    state.pendingWardstone = null;
    state.selectedUnit = null;
    state.actionStep = 'select_unit';
    renderTurnUI();
    renderBoard();
    endTurn();
  }

  function doWardstoneNo() {
    if (!state.pendingWardstone) return;
    const pw = state.pendingWardstone;
    state.pendingWardstone = null;
    resolveCombat(pw.attPlayer, pw.attCol, pw.defPlayer, pw.defCol);
  }

  function applyHealingPotion(targetPlayer, targetCol) {
    const cell = state.board[targetPlayer][targetCol];
    if (!cell || (cell.damage || 0) < 1) return;
    const t = state.itemTargeting;
    if (!t || t.itemName !== 'Healing Potion') return;
    const hand = state.currentPlayer === 1 ? state.p1ItemHand : state.p2ItemHand;
    const item = hand[t.handIndex];
    if (!item || item.name !== 'Healing Potion') return;

    cell.damage = Math.max(0, (cell.damage || 0) - 1);
    hand.splice(t.handIndex, 1);
    if (!state.itemDiscard) state.itemDiscard = [];
    state.itemDiscard.push(item);
    state.itemTargeting = null;

    log("Player " + state.currentPlayer + " uses Healing Potion on " + cell.unit.name + ". " + cell.unit.name + " recovers 1 HP.");
    renderTurnUI();
    renderBoard();
  }

  function applyRevealingLight(targetPlayer, targetCol) {
    const cell = state.board[targetPlayer][targetCol];
    if (!cell || cell.faceUp) return;
    const opp = state.currentPlayer === 1 ? 2 : 1;
    if (targetPlayer !== opp) return;
    const t = state.itemTargeting;
    if (!t || t.itemName !== 'All revealing lantern-jar') return;
    const hand = state.currentPlayer === 1 ? state.p1ItemHand : state.p2ItemHand;
    const item = hand[t.handIndex];
    if (!item || item.name !== 'All revealing lantern-jar') return;

    cell.faceUp = true;
    hand.splice(t.handIndex, 1);
    if (!state.itemDiscard) state.itemDiscard = [];
    state.itemDiscard.push(item);
    state.itemTargeting = null;

    log("Player " + state.currentPlayer + " uses All revealing lantern-jar on " + cell.unit.name + ". " + cell.unit.name + " is revealed.");
    renderTurnUI();
    renderBoard();
  }

  function applyDisablingNet(targetPlayer, targetCol) {
    const cell = state.board[targetPlayer][targetCol];
    if (!cell) return;
    const opp = state.currentPlayer === 1 ? 2 : 1;
    if (targetPlayer !== opp) return;
    const t = state.itemTargeting;
    if (!t || t.itemName !== 'Tangle-Vine Bola') return;
    const hand = state.currentPlayer === 1 ? state.p1ItemHand : state.p2ItemHand;
    const item = hand[t.handIndex];
    if (!item || item.name !== 'Tangle-Vine Bola') return;

    cell.cannotAttackNextTurn = true;
    hand.splice(t.handIndex, 1);
    if (!state.itemDiscard) state.itemDiscard = [];
    state.itemDiscard.push(item);
    state.itemTargeting = null;

    log("Player " + state.currentPlayer + " uses Tangle-Vine Bola on " + cell.unit.name + ". " + cell.unit.name + " cannot attack on their next turn.");
    renderTurnUI();
    renderBoard();
  }

  function applyCorrosivePhial(targetPlayer, targetCol) {
    const cell = state.board[targetPlayer][targetCol];
    if (!cell || !cell.faceUp || !cell.gear) return;
    const t = state.itemTargeting;
    if (!t || t.itemName !== 'Corrosive Phial') return;
    const hand = state.currentPlayer === 1 ? state.p1ItemHand : state.p2ItemHand;
    const item = hand[t.handIndex];
    if (!item || item.name !== 'Corrosive Phial') return;

    const gearRemoved = cell.gear;
    if (!state.itemDiscard) state.itemDiscard = [];
    state.itemDiscard.push(gearRemoved);
    cell.gear = null;
    hand.splice(t.handIndex, 1);
    state.itemDiscard.push(item);
    state.itemTargeting = null;

    log("Player " + state.currentPlayer + " uses Corrosive Phial on " + cell.unit.name + " — " + gearRemoved.name + " destroyed.");
    renderTurnUI();
    renderBoard();
  }

  function applyObscuringBomb(handIndex) {
    const hand = state.currentPlayer === 1 ? state.p1ItemHand : state.p2ItemHand;
    const item = hand[handIndex];
    if (!item || item.name !== 'Obscuring bomb') return;

    const p = state.currentPlayer;
    for (let c = 0; c < 5; c++) {
      const cell = state.board[p][c];
      if (cell) cell.faceUp = false;
    }

    hand.splice(handIndex, 1);
    if (!state.itemDiscard) state.itemDiscard = [];
    state.itemDiscard.push(item);

    state.obscuringReorder = { player: p, selectedCol: null };
    log("Player " + p + " uses Obscuring bomb — all units flipped face-down. Reorder by swapping slots, then click Done reordering.");
    renderTurnUI();
    renderBoard();
  }

  function doObscuringSwap(colA, colB) {
    if (!state.obscuringReorder || colA === colB) return;
    const p = state.obscuringReorder.player;
    const a = state.board[p][colA];
    const b = state.board[p][colB];
    state.board[p][colA] = b;
    state.board[p][colB] = a;
    state.obscuringReorder.selectedCol = null;
    log("Swap: units at columns " + colA + " and " + colB + " exchanged.");
    renderTurnUI();
    renderBoard();
  }

  function doDoneObscuringReorder() {
    if (!state.obscuringReorder) return;
    state.obscuringReorder = null;
    renderTurnUI();
    renderBoard();
  }

  function applyMagicGrenade(targetPlayer, targetCol) {
    const cell = state.board[targetPlayer][targetCol];
    if (!cell || targetPlayer !== state.currentPlayer) return;
    const t = state.itemTargeting;
    if (!t || t.itemName !== 'Magic Grenade') return;
    const hand = state.currentPlayer === 1 ? state.p1ItemHand : state.p2ItemHand;
    const item = hand[t.handIndex];
    if (!item || item.name !== 'Magic Grenade') return;

    cell.nextAttackAsCaster = true;
    hand.splice(t.handIndex, 1);
    if (!state.itemDiscard) state.itemDiscard = [];
    state.itemDiscard.push(item);
    state.itemTargeting = null;

    log("Player " + state.currentPlayer + " uses Magic Grenade on " + cell.unit.name + " — next attack will be as Caster (1 damage, paralyze).");
    renderTurnUI();
    renderBoard();
  }

  function applyVorpalHoningAmulet(handIndex) {
    const hand = state.currentPlayer === 1 ? state.p1ItemHand : state.p2ItemHand;
    const item = hand[handIndex];
    if (!item || item.name !== 'Vorpal Honing Amulet') return;

    hand.splice(handIndex, 1);
    if (!state.itemDiscard) state.itemDiscard = [];
    state.itemDiscard.push(item);
    state.vorpalNextAttack = state.currentPlayer;

    log("Player " + state.currentPlayer + " uses Vorpal Honing Amulet — their next attack ignores terrain and Lancer counters.");
    renderTurnUI();
    renderBoard();
  }

  function isGearEquipTargeting() {
    const t = state.itemTargeting;
    return t && GEAR_EQUIP_ITEM_NAMES.indexOf(t.itemName) !== -1;
  }

  function applyPlaceTerrain(targetPlayer, targetCol) {
    if (!state.terrain || state.terrain[targetPlayer][targetCol] != null) return;
    const t = state.itemTargeting;
    if (!t || typeof TERRAIN_ITEM_NAMES === 'undefined' || TERRAIN_ITEM_NAMES.indexOf(t.itemName) === -1) return;
    const hand = state.currentPlayer === 1 ? state.p1ItemHand : state.p2ItemHand;
    const item = hand[t.handIndex];
    if (!item || TERRAIN_ITEM_NAMES.indexOf(item.name) === -1) return;

    state.terrain[targetPlayer][targetCol] = { name: item.name, id: item.id };
    hand.splice(t.handIndex, 1);
    state.itemTargeting = null;
    if (item.name === 'Divine Light') {
      const cell = state.board[targetPlayer][targetCol];
      if (cell) cell.faceUp = true;
    }

    log("Player " + state.currentPlayer + " places " + item.name + " on tile (Player " + targetPlayer + ", column " + targetCol + ").");
    renderTurnUI();
    renderBoard();
  }

  function applyTectonicSpike(targetPlayer, targetCol) {
    const terrainHere = state.terrain[targetPlayer][targetCol];
    if (!terrainHere) return;
    const t = state.itemTargeting;
    if (!t || t.itemName !== 'Tectonic Spike') return;
    const hand = state.currentPlayer === 1 ? state.p1ItemHand : state.p2ItemHand;
    const item = hand[t.handIndex];
    if (!item || item.name !== 'Tectonic Spike') return;

    if (!state.itemDiscard) state.itemDiscard = [];
    state.itemDiscard.push(terrainHere);
    state.terrain[targetPlayer][targetCol] = null;
    hand.splice(t.handIndex, 1);
    state.itemDiscard.push(item);
    state.itemTargeting = null;

    log("Player " + state.currentPlayer + " uses Tectonic Spike — " + terrainHere.name + " removed from tile (Player " + targetPlayer + ", column " + targetCol + ").");
    renderTurnUI();
    renderBoard();
  }

  function applyEquipArmor(targetPlayer, targetCol) {
    const cell = state.board[targetPlayer][targetCol];
    if (!cell || !cell.unit) return;
    if (targetPlayer !== state.currentPlayer) return;
    const t = state.itemTargeting;
    if (!t || GEAR_EQUIP_ITEM_NAMES.indexOf(t.itemName) === -1) return;
    const hand = state.currentPlayer === 1 ? state.p1ItemHand : state.p2ItemHand;
    const item = hand[t.handIndex];
    if (!item || GEAR_EQUIP_ITEM_NAMES.indexOf(item.name) === -1) return;
    if (!canEquipGear(cell, item.name)) return;

    const previousGear = cell.gear || null;
    cell.gear = { name: item.name, id: item.id };
    hand.splice(t.handIndex, 1);
    if (previousGear) {
      if (!state.itemDiscard) state.itemDiscard = [];
      state.itemDiscard.push(previousGear);
      log("Player " + state.currentPlayer + " equips " + item.name + " on " + cell.unit.name + ". Previous " + previousGear.name + " discarded.");
    } else {
      log("Player " + state.currentPlayer + " equips " + item.name + " on " + cell.unit.name + ".");
    }
    state.itemTargeting = null;
    renderTurnUI();
    renderBoard();
  }

  function applyDamage(player, col, damageAmount, logPrefix, skipLog) {
    const cell = state.board[player][col];
    if (!cell) return true;
    const maxHP = getMaxHP(cell);
    const current = cell.damage || 0;
    const newTotal = current + damageAmount;
    cell.faceUp = true;
    if (newTotal >= maxHP) {
      if (!skipLog) log((logPrefix ? logPrefix + " " : "") + cell.unit.name + " is captured (0/" + maxHP + " HP).");
      if (cell.gear) {
        if (!state.itemDiscard) state.itemDiscard = [];
        state.itemDiscard.push(cell.gear);
      }
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
    if (!skipLog) log((logPrefix ? logPrefix + " " : "") + cell.unit.name + " takes " + damageAmount + " damage (" + newTotal + "/" + maxHP + " HP).");
    return false;
  }

  function resolveCombat(attackerPlayer, attackerCol, defenderPlayer, defenderCol) {
    const attCell = state.board[attackerPlayer][attackerCol];
    const defCell = state.board[defenderPlayer][defenderCol];
    if (!attCell || !defCell) return;

    const effectiveClass = getEffectiveAttackerClass(attCell);
    const trueStrike = (state.vorpalNextAttack === attackerPlayer) ||
      (attCell.gear && attCell.gear.name === 'True-Strike Lens' && (attCell.unit.class === 'Shooter' || attCell.unit.class === 'Caster'));

    log("Player " + attackerPlayer + "'s " + attCell.unit.name + " attacks (target in column " + defenderCol + ").");
    if (trueStrike) {
      log("True strike — attack ignores terrain and Lancer counters.");
    }

    if (!trueStrike && getTerrain(attackerPlayer, attackerCol) === 'Unstable Ground') {
      const heads = Math.random() < 0.5;
      if (!heads) {
        log("Unstable Ground (attacker's tile): tails — attack canceled.");
        state.selectedUnit = null;
        state.actionStep = 'select_unit';
        renderTurnUI();
        renderBoard();
        endTurn();
        return;
      }
      log("Unstable Ground (attacker's tile): heads — attack proceeds.");
    }

    let attackBlocked = false;

    if (!trueStrike) {
      const colsToCheck = [];
      if (attackerCol - 1 >= 0) colsToCheck.push(attackerCol - 1);
      if (attackerCol + 1 <= 4) colsToCheck.push(attackerCol + 1);

      let lancerCol = null;
      for (let i = 0; i < colsToCheck.length; i++) {
        const c = colsToCheck[i];
        const cell = state.board[defenderPlayer][c];
        if (!cell || cell.unit.class !== 'Lancer' || cell.cannotAttackNextTurn) continue;
        lancerCol = c;
        break;
      }

      if (lancerCol !== null) {
        const lancerCell = state.board[defenderPlayer][lancerCol];
        lancerCell.faceUp = true;
        log(lancerCell.unit.name + " (Lancer) is in counter range — counterattack attempt (target not revealed).");
        if (getTerrain(defenderPlayer, lancerCol) === 'Unstable Ground') {
          const unstableHeads = Math.random() < 0.5;
          if (!unstableHeads) {
            log("Unstable Ground (Lancer's tile): tails — counter canceled.");
          } else {
            log("Unstable Ground (Lancer's tile): heads — counter attempt proceeds.");
            const heads = Math.random() < 0.5;
            if (heads) {
              log("Lancer counterattack: heads — attack blocked, " + lancerCell.unit.name + " hits back for 1 HP.");
              attackBlocked = true;
              applyDamage(attackerPlayer, attackerCol, 1, "");
            } else {
              log("Lancer counterattack: tails — no counter. " + lancerCell.unit.name + " remains revealed.");
            }
          }
        } else {
          const heads = Math.random() < 0.5;
          if (heads) {
            log("Lancer counterattack: heads — attack blocked, " + lancerCell.unit.name + " hits back for 1 HP.");
            attackBlocked = true;
            applyDamage(attackerPlayer, attackerCol, 1, "");
          } else {
            log("Lancer counterattack: tails — no counter. " + lancerCell.unit.name + " remains revealed.");
          }
        }
      }
    }

    var defenderHadBarbedGauntlets = false;
    var attClassForBarbed = null;
    var attackHitDefender = false;
    if (!attackBlocked) {
      defCell.faceUp = true;
      log("Target revealed: Player " + defenderPlayer + "'s " + defCell.unit.name + " (" + defCell.unit.class + ").");
      const defHasBarbed = !!(defCell.gear && defCell.gear.name === 'Barbed Gauntlets');
      attClassForBarbed = attCell.unit.class;

      let defenderTerrainBlocked = false;
      if (!trueStrike) {
        const defTerrain = getTerrain(defenderPlayer, defenderCol);
        if (defTerrain === 'Elevated Ground' && (effectiveClass === 'Brawler' || effectiveClass === 'Lancer')) {
          const heads = Math.random() < 0.5;
          if (heads) {
            log("Elevated Ground: heads — attack fails.");
            defenderTerrainBlocked = true;
          } else {
            log("Elevated Ground: tails — attack proceeds.");
          }
        } else if (defTerrain === 'Reinforced Barricade' && (effectiveClass === 'Shooter' || effectiveClass === 'Caster')) {
          const heads = Math.random() < 0.5;
          if (heads) {
            log("Reinforced Barricade: heads — attack fails.");
            defenderTerrainBlocked = true;
          } else {
            log("Reinforced Barricade: tails — attack proceeds.");
          }
        }
      }

      if (!defenderTerrainBlocked) {
        defenderHadBarbedGauntlets = defHasBarbed;
        attackHitDefender = true;
        const vorpalLethal = (state.vorpalNextAttack === attackerPlayer);
        let damage = (effectiveClass === 'Shooter' && isLongshot(attackerCol, defenderCol))
          ? 2
          : 1;
        if (vorpalLethal) {
          damage = Math.max(1, getMaxHP(defCell) - (defCell.damage || 0));
          log("Vorpal Honing Amulet — lethal strike (" + damage + " damage).");
        } else if (effectiveClass === 'Shooter' && damage === 2) {
          log("Longshot (edge to edge): 2 damage.");
        }
        const captured = applyDamage(defenderPlayer, defenderCol, damage, "");
        if (!captured && state.board[defenderPlayer][defenderCol] && effectiveClass === 'Caster') {
          state.board[defenderPlayer][defenderCol].paralyzed = true;
          log(state.board[defenderPlayer][defenderCol].unit.name + " is paralyzed (Magic Paralysis).");
        }
      }
    }

    const attCellAfter = state.board[attackerPlayer][attackerCol];
    if (attCellAfter && attCellAfter.nextAttackAsCaster) {
      attCellAfter.nextAttackAsCaster = false;
    }

    if (attackHitDefender && defenderHadBarbedGauntlets && (attClassForBarbed === 'Brawler' || attClassForBarbed === 'Lancer')) {
      const heads = Math.random() < 0.5;
      if (heads) {
        const attCellRef = state.board[attackerPlayer][attackerCol];
        if (attCellRef) {
          const maxHP = getMaxHP(attCellRef);
          const current = attCellRef.damage || 0;
          const newTotal = current + 1;
          if (newTotal >= maxHP) {
            log("Barbed Gauntlets: heads — " + attCellRef.unit.name + " takes 1 damage from the defender's gauntlets and is captured.");
          } else {
            log("Barbed Gauntlets: heads — " + attCellRef.unit.name + " takes 1 damage from the defender's gauntlets (" + newTotal + "/" + maxHP + " HP).");
          }
          applyDamage(attackerPlayer, attackerCol, 1, null, true);
        }
      } else {
        log("Barbed Gauntlets: tails — no reflected damage.");
      }
    }

    if (state.vorpalNextAttack === attackerPlayer) {
      state.vorpalNextAttack = null;
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
    var playerWhoJustFinished = state.currentPlayer;
    for (let c = 0; c < 5; c++) {
      const cell = state.board[playerWhoJustFinished][c];
      if (cell) cell.cannotAttackNextTurn = false;
    }
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

    if (step === 'use_items' && state.obscuringReorder) {
      const reord = state.obscuringReorder;
      if (player !== reord.player || state.board[player][column] == null) return;
      if (reord.selectedCol === null) {
        state.obscuringReorder.selectedCol = column;
        renderTurnUI();
        renderBoard();
      } else {
        doObscuringSwap(reord.selectedCol, column);
      }
      return;
    }

    if (step === 'use_items' && state.itemTargeting) {
      const itemName = state.itemTargeting.itemName;
      if (itemName === 'Healing Potion') {
        const cell = state.board[player][column];
        if (cell && (cell.damage || 0) >= 1) applyHealingPotion(player, column);
      } else if (itemName === 'All revealing lantern-jar') {
        const opp = p === 1 ? 2 : 1;
        const cell = state.board[player][column];
        if (player === opp && cell && !cell.faceUp) applyRevealingLight(player, column);
      } else if (itemName === 'Tangle-Vine Bola') {
        const opp = p === 1 ? 2 : 1;
        if (player === opp && state.board[player][column]) applyDisablingNet(player, column);
      } else if (GEAR_EQUIP_ITEM_NAMES.indexOf(itemName) !== -1) {
        const cell = state.board[player][column];
        if (player === p && cell && canEquipGear(cell, itemName)) applyEquipArmor(player, column);
      } else if (typeof TERRAIN_ITEM_NAMES !== 'undefined' && TERRAIN_ITEM_NAMES.indexOf(itemName) !== -1) {
        if (state.terrain[player][column] == null) applyPlaceTerrain(player, column);
      } else if (itemName === 'Tectonic Spike') {
        if (state.terrain[player][column] != null) applyTectonicSpike(player, column);
      } else if (itemName === 'Corrosive Phial') {
        const cell = state.board[player][column];
        if (cell && cell.faceUp && cell.gear) applyCorrosivePhial(player, column);
      } else if (itemName === 'Magic Grenade') {
        if (player === p && state.board[player][column]) applyMagicGrenade(player, column);
      }
      return;
    }

    if (step === 'select_unit') {
      if (player === p && state.board[p][column] && !state.board[p][column].paralyzed) {
        onSelectUnit(p, column);
      }
      return;
    }

    if (step === 'move' && state.selectedUnit && player === p) {
      const fromCol = state.selectedUnit.column;
      const myCell = state.board[p][fromCol];
      if (myCell && myCell.gear && myCell.gear.name === 'Teleport Boots' && column !== fromCol) {
        doTeleportMove(column);
      }
      return;
    }

    if (step === 'attack' && state.selectedUnit) {
      const opp = p === 1 ? 2 : 1;
      const attCell = state.board[p][state.selectedUnit.column];
      if (attCell && attCell.cannotAttackNextTurn) return;
      if (player === opp && state.board[opp][column]) {
        if (attCell && isInRange(state.selectedUnit.column, column, getEffectiveAttackerClass(attCell))) {
          const defCell = state.board[opp][column];
          if (defCell.gear && defCell.gear.name === 'Wardstone Bracelet') {
            state.pendingWardstone = { attPlayer: p, attCol: state.selectedUnit.column, defPlayer: opp, defCol: column };
            renderTurnUI();
            renderBoard();
            return;
          }
          resolveCombat(p, state.selectedUnit.column, opp, column);
        }
      }
      return;
    }
  }

  function handleItemHandClick(e) {
    if (state.phase !== 'playing' || state.actionStep !== 'use_items' || state.itemTargeting || state.obscuringReorder) return;
    const useBtn = e.target.closest('.item-card__use');
    const card = e.target.closest('.item-card');
    if (useBtn && card) {
      e.preventDefault();
      const handIndex = parseInt(card.dataset.itemIndex, 10);
      const itemName = card.dataset.itemName;
      const player = parseInt(card.dataset.player, 10);
      const spec = typeof ITEM_SPECS !== 'undefined' && ITEM_SPECS[itemName];
      const singleUsePlayable = itemName === 'Healing Potion' || itemName === 'All revealing lantern-jar' || itemName === 'Tangle-Vine Bola' || itemName === 'Vorpal Honing Amulet' || (itemName === 'Corrosive Phial' && countUnitsWithGear() > 0) || (itemName === 'Obscuring bomb' && countUnits(state.currentPlayer) > 0) || (itemName === 'Magic Grenade' && countUnits(state.currentPlayer) > 0);
      const gearPlayable = spec && (spec.type === 'gear_armor' || spec.type === 'gear_accessory') && countValidGearTargets(itemName) > 0;
      const terrainPlayable = typeof TERRAIN_ITEM_NAMES !== 'undefined' && TERRAIN_ITEM_NAMES.indexOf(itemName) !== -1 && countEmptyTerrainSlots() > 0;
      const tectonicSpikePlayable = itemName === 'Tectonic Spike' && countTilesWithTerrain() > 0;
      if (player !== state.currentPlayer || (!singleUsePlayable && !gearPlayable && !terrainPlayable && !tectonicSpikePlayable)) return;
      if (itemName === 'Vorpal Honing Amulet') {
        applyVorpalHoningAmulet(handIndex);
        return;
      }
      if (itemName === 'Obscuring bomb') {
        applyObscuringBomb(handIndex);
        return;
      }
      state.itemTargeting = { handIndex: handIndex, itemName: itemName };
      renderTurnUI();
      renderBoard();
      return;
    }
    if (card && !useBtn && card.querySelector('.item-card__effect')) {
      card.classList.toggle('item-card--expanded');
    }
  }

  function renderItemPickList(filter) {
    if (!itemPickListEl) return;
    itemPickListEl.innerHTML = '';
    const deck = state.itemDeck || [];
    const q = (filter || '').trim().toLowerCase();
    const names = q ? deck.filter(function (name) { return name.toLowerCase().indexOf(q) !== -1; }) : deck.slice();
    if (deck.length === 0) {
      itemPickListEl.textContent = 'No cards left in deck.';
      return;
    }
    if (names.length === 0) {
      itemPickListEl.textContent = 'No items match "' + (filter || '').trim() + '".';
      return;
    }
    names.forEach(function (name) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn--small item-pick-list__btn';
      btn.textContent = name;
      btn.dataset.itemName = name;
      itemPickListEl.appendChild(btn);
    });
  }

  function openReplaceDrawPickList() {
    if (!itemPickListWrapEl || !itemPickListEl || state.actionStep !== 'use_items' || state.itemTargeting) return;
    const hand = state.currentPlayer === 1 ? state.p1ItemHand : state.p2ItemHand;
    if (hand.length === 0) return;
    if (itemPickListSearchEl) {
      itemPickListSearchEl.value = '';
      itemPickListSearchEl.focus();
    }
    renderItemPickList('');
    itemPickListWrapEl.removeAttribute('hidden');
  }

  function closePickList() {
    if (itemPickListWrapEl) itemPickListWrapEl.setAttribute('hidden', '');
  }

  function replaceLastDrawWith(chosenName) {
    const hand = state.currentPlayer === 1 ? state.p1ItemHand : state.p2ItemHand;
    if (hand.length === 0) return;
    const idx = state.itemDeck.indexOf(chosenName);
    if (idx === -1) return;
    const lastItem = hand.pop();
    state.itemDeck.push(lastItem.name);
    state.itemDeck.splice(idx, 1);
    hand.push({ name: chosenName, id: 'item-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8) });
    closePickList();
    log("Debug: Player " + state.currentPlayer + " replaces draw with " + chosenName + ".");
    renderBoard();
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
    if (btnWardstoneUse) btnWardstoneUse.addEventListener('click', function () { if (!state.gameOver) doWardstoneUse(); });
    if (btnWardstoneNo) btnWardstoneNo.addEventListener('click', function () { if (!state.gameOver) doWardstoneNo(); });

    placementHand.addEventListener('click', handlePlacementHandClick);
    document.querySelector('.board').addEventListener('click', handleSlotClick);
    if (itemHandsEl) itemHandsEl.addEventListener('click', handleItemHandClick);
    if (btnReplaceDrawWithPick) {
      btnReplaceDrawWithPick.addEventListener('click', openReplaceDrawPickList);
    }
    if (itemPickListEl) {
      itemPickListEl.addEventListener('click', function (e) {
        const btn = e.target.closest('.item-pick-list__btn');
        if (btn && btn.dataset.itemName) {
          replaceLastDrawWith(btn.dataset.itemName);
        }
      });
    }
    if (btnPickListClose) {
      btnPickListClose.addEventListener('click', function (e) {
        e.stopPropagation();
        closePickList();
      });
    }
    if (itemPickListSearchEl) {
      itemPickListSearchEl.addEventListener('input', function () {
        renderItemPickList(itemPickListSearchEl.value);
      });
    }
    if (btnDiscardToggle && discardPileListEl) {
      btnDiscardToggle.addEventListener('click', function () {
        const isHidden = discardPileListEl.getAttribute('hidden') !== null;
        if (isHidden) {
          discardPileListEl.removeAttribute('hidden');
          btnDiscardToggle.textContent = 'Hide';
          btnDiscardToggle.setAttribute('aria-expanded', 'true');
        } else {
          discardPileListEl.setAttribute('hidden', '');
          btnDiscardToggle.textContent = 'Show';
          btnDiscardToggle.setAttribute('aria-expanded', 'false');
        }
      });
    }
    if (btnDoneWithItems) btnDoneWithItems.addEventListener('click', function () { if (!state.gameOver) doDoneWithItems(); });
  });
})();
