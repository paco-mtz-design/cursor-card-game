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
  const placementHandFilterEl = document.getElementById('placement-hand-filter');
  const placementUnitPickWrapEl = document.getElementById('placement-unit-pick-wrap');
  const placementUnitPickSearchEl = document.getElementById('placement-unit-pick-search');
  const placementUnitPickListEl = document.getElementById('placement-unit-pick-list');
  const btnPlacementReplaceWithPick = document.getElementById('btn-placement-replace-with-pick');
  const btnPlacementUnitPickClose = document.getElementById('btn-placement-unit-pick-close');
  const btnNewGame = document.getElementById('btn-new-game');
  const turnBanner = document.getElementById('turn-banner');
  const turnLabel = document.getElementById('turn-label');
  const turnStep = document.getElementById('turn-step');
  const turnActions = document.getElementById('turn-actions');
  const boardCenterEl = document.querySelector('.board__center');
  const boardEl = document.querySelector('.board');
  const contextualMoveControls = document.getElementById('contextual-move-controls');
  const btnMoveLeft = document.getElementById('btn-move-left');
  const btnMoveRight = document.getElementById('btn-move-right');
  const btnSkipMove = document.getElementById('btn-skip-move');
  const gameLogEl = document.getElementById('game-log');
  const gameLogEntries = document.getElementById('game-log-entries');
  const gameOverEl = document.getElementById('game-over');
  const gameOverMessage = document.getElementById('game-over-message');
  const btnPass = document.getElementById('btn-pass');
  const itemHandsP1El = document.getElementById('item-hands-p1');
  const itemHandsP2El = document.getElementById('item-hands-p2');
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
  const itemDiscardStackEl = document.getElementById('item-discard-stack');
  const btnItemDiscardOpen = document.getElementById('btn-item-discard-open');
  const unitsDiscardPileEl = document.getElementById('units-discard-pile');
  const unitDiscardCountEl = document.getElementById('unit-discard-count');
  const unitsDiscardStackEl = document.getElementById('units-discard-stack');
  const btnUnitDiscardOpen = document.getElementById('btn-unit-discard-open');
  const btnWardstoneUse = document.getElementById('btn-wardstone-use');
  const btnWardstoneNo = document.getElementById('btn-wardstone-no');
  const debugDrawerEl = document.getElementById('debug-drawer');
  const btnDebugOpen = document.getElementById('btn-debug-open');
  const btnDebugClose = document.getElementById('btn-debug-close');
  const unitZoomModal = document.getElementById('unit-zoom-modal');
  const unitZoomCloseBtn = document.getElementById('unit-zoom-close');
  const unitZoomBackdrop = document.getElementById('unit-zoom-backdrop');
  const discardZoomModal = document.getElementById('discard-zoom-modal');
  const discardZoomCloseBtn = document.getElementById('discard-zoom-close');
  const discardZoomBackdrop = document.getElementById('discard-zoom-backdrop');
  const itemZoomModal = document.getElementById('item-zoom-modal');
  const itemZoomCloseBtn = document.getElementById('item-zoom-close');
  const itemZoomBackdrop = document.getElementById('item-zoom-backdrop');
  const itemZoomTitle = document.getElementById('item-zoom-title');
  const itemZoomImgWrap = document.getElementById('item-zoom-img-wrap');
  const itemZoomEffect = document.getElementById('item-zoom-effect');
  const scoreMarkersP1El = document.getElementById('score-markers-p1');
  const scoreMarkersP2El = document.getElementById('score-markers-p2');

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
    if (!spec || spec.hpBonus == null) return 0;
    if (spec.type === 'gear_armor' || spec.type === 'promotion') return spec.hpBonus;
    return 0;
  }

  function getGearAllowedClasses(gearName) {
    if (!gearName || typeof ITEM_SPECS === 'undefined') return [];
    const spec = ITEM_SPECS[gearName];
    var isEquippable = spec && (spec.type === 'gear_armor' || spec.type === 'gear_accessory' || spec.type === 'promotion') && Array.isArray(spec.allowedClasses);
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
  var PROMOTION_ITEM_NAMES = ["Champion's Crest", 'Vanguard Lance', "Sharpshooter's Scope", "Archmage's Tome"];
  var GEAR_EQUIP_ITEM_NAMES = ['Light Armor', 'Premium Light Armor', 'Heavy Armor'].concat(ACCESSORY_ITEM_NAMES).concat(PROMOTION_ITEM_NAMES);

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

  /** Range check using attCell so promotions (Champion's Crest, Vanguard Lance) and Magic Grenade apply. */
  function isInRangeWithCell(attackerCol, defenderCol, attCell) {
    if (!attCell) return false;
    if (attCell.nextAttackAsCaster) return true;
    const d = Math.abs(defenderCol - attackerCol);
    const gearName = attCell.gear && attCell.gear.name;
    if (attCell.unit.class === 'Brawler' && gearName === "Champion's Crest") return d <= 1;
    if (attCell.unit.class === 'Lancer' && gearName === 'Vanguard Lance') return d >= 1 && d <= 2;
    return isInRange(attackerCol, defenderCol, attCell.unit.class);
  }

  /** For Magic Grenade: effective class is Caster when nextAttackAsCaster is set. */
  function getEffectiveAttackerClass(attCell) {
    if (!attCell) return null;
    return attCell.nextAttackAsCaster ? 'Caster' : attCell.unit.class;
  }

  function getVeteranBuff(cell) {
    if (!cell || !cell.unit || cell.unit.level !== 'Veteran') return null;
    return cell.unit.veteranBuff || null;
  }

  function hasVeteranBuff(cell, buffKey) {
    return getVeteranBuff(cell) === buffKey;
  }

  function isCounterRangeForLancerCell(attackerCol, lancerCol, lancerCell) {
    if (!lancerCell) return false;
    const dist = Math.abs(attackerCol - lancerCol);
    return (lancerCell.gear && lancerCell.gear.name === 'Vanguard Lance') ? (dist >= 1 && dist <= 2) : (dist === 1);
  }

  function findAdjacentAllyLancerCols(player, col) {
    const result = [];
    const left = col - 1;
    const right = col + 1;
    if (left >= 0) {
      const leftCell = state.board[player][left];
      if (leftCell && leftCell.unit.class === 'Lancer') result.push(left);
    }
    if (right <= 4) {
      const rightCell = state.board[player][right];
      if (rightCell && rightCell.unit.class === 'Lancer') result.push(right);
    }
    return result;
  }

  function getCounterGuaranteeInfo(defenderPlayer, lancerCol, lancerCell) {
    const info = { guaranteed: false, reason: null, revealCol: null };
    if (!lancerCell || lancerCell.unit.class !== 'Lancer') return info;

    if (hasVeteranBuff(lancerCell, 'nyss') && !lancerCell.faceUp) {
      info.guaranteed = true;
      info.reason = 'nyss';
      return info;
    }

    const adjacentLancers = findAdjacentAllyLancerCols(defenderPlayer, lancerCol);
    if (adjacentLancers.length === 0) return info;

    if (hasVeteranBuff(lancerCell, 'rowka')) {
      info.guaranteed = true;
      info.reason = 'rowka';
      info.revealCol = adjacentLancers[0];
      return info;
    }

    for (let i = 0; i < adjacentLancers.length; i++) {
      const allyCol = adjacentLancers[i];
      const allyCell = state.board[defenderPlayer][allyCol];
      if (hasVeteranBuff(allyCell, 'rowka')) {
        info.guaranteed = true;
        info.reason = 'rowka';
        info.revealCol = allyCol;
        return info;
      }
    }

    return info;
  }

  function attackerIsProtectedByBraskin(attackerPlayer, attackerCol) {
    const left = attackerCol - 1;
    const right = attackerCol + 1;
    if (left >= 0) {
      const leftCell = state.board[attackerPlayer][left];
      if (leftCell && leftCell.unit.class === 'Lancer' && hasVeteranBuff(leftCell, 'braskin')) return true;
    }
    if (right <= 4) {
      const rightCell = state.board[attackerPlayer][right];
      if (rightCell && rightCell.unit.class === 'Lancer' && hasVeteranBuff(rightCell, 'braskin')) return true;
    }
    return false;
  }

  function resolveKeeraCounterExtra(defenderPlayer, keeraCol, attackerPlayer, attackerCol) {
    const keeraCell = state.board[defenderPlayer][keeraCol];
    if (!keeraCell || !hasVeteranBuff(keeraCell, 'keera')) return;
    const validTargetCols = [];
    for (let c = 0; c < 5; c++) {
      if (c === attackerCol) continue;
      const enemyCell = state.board[attackerPlayer][c];
      if (!enemyCell) continue;
      if (isCounterRangeForLancerCell(c, keeraCol, keeraCell)) validTargetCols.push(c);
    }
    if (validTargetCols.length === 0) return;

    validTargetCols.sort(function (a, b) {
      const da = Math.abs(a - keeraCol);
      const db = Math.abs(b - keeraCol);
      if (da !== db) return da - db;
      return a - b;
    });
    const targetCol = validTargetCols[0];
    const targetCell = state.board[attackerPlayer][targetCol];
    if (!targetCell) return;
    log("Keera's Double Sword — extra 1 damage to " + targetCell.unit.name + ".");
    applyDamage(attackerPlayer, targetCol, 1, "");
  }

  function revealAndParalyze(player, col, reasonLabel) {
    const cell = state.board[player][col];
    if (!cell) return false;
    if (!cell.faceUp) {
      cell.faceUp = true;
      log(cell.unit.name + " is revealed.");
    }
    cell.paralyzed = true;
    log(cell.unit.name + " is paralyzed (" + reasonLabel + ").");
    return true;
  }

  function healCellDamage(player, col, amount, reasonLabel) {
    const cell = state.board[player][col];
    if (!cell) return;
    const current = cell.damage || 0;
    if (current <= 0) {
      log(reasonLabel + " — " + cell.unit.name + " is already at full HP.");
      return;
    }
    const next = Math.max(0, current - amount);
    const recovered = current - next;
    cell.damage = next;
    log(reasonLabel + " — " + cell.unit.name + " recovers " + recovered + " HP.");
  }

  function maybeApplyTorraGearBreak(attCell, defenderPlayer, defenderCol) {
    if (!hasVeteranBuff(attCell, 'torra')) return;
    const heads = Math.random() < 0.5;
    const defCell = state.board[defenderPlayer][defenderCol];
    if (!heads) {
      log("Torra's Shattering Hammer: tails — no gear destroyed.");
      return;
    }
    if (!defCell || !defCell.gear) {
      log("Torra's Shattering Hammer: heads — target has no gear.");
      return;
    }
    const removed = defCell.gear;
    if (!state.itemDiscard) state.itemDiscard = [];
    state.itemDiscard.push(removed);
    defCell.gear = null;
    log("Torra's Shattering Hammer: heads — " + removed.name + " on " + defCell.unit.name + " is destroyed before damage.");
  }

  function getRokkloDamageBonus(attCell) {
    if (!hasVeteranBuff(attCell, 'rokklo')) return 0;
    const heads = Math.random() < 0.5;
    if (!heads) {
      log("Rokklo's Returning Hit: tails — no bonus damage.");
      return 0;
    }
    log("Rokklo's Returning Hit: heads — +1 damage.");
    return 1;
  }

  function maybeApplyHaskelSteal(attCell, attackerPlayer, defenderPlayer) {
    if (!hasVeteranBuff(attCell, 'haskel')) return;
    const attackerHand = attackerPlayer === 1 ? state.p1ItemHand : state.p2ItemHand;
    const defenderHand = defenderPlayer === 1 ? state.p1ItemHand : state.p2ItemHand;
    if (!defenderHand || defenderHand.length === 0) {
      log("Haskel's Pirate Claw — opponent has no item cards to steal.");
      return;
    }
    const idx = Math.floor(Math.random() * defenderHand.length);
    const stolen = defenderHand.splice(idx, 1)[0];
    attackerHand.push(stolen);
    log("Haskel's Pirate Claw — steals " + stolen.name + " from Player " + defenderPlayer + ".");
  }

  function maybeApplyLyraEcho(attCell, attackerCol, defenderPlayer, defenderCol) {
    if (!hasVeteranBuff(attCell, 'lyra')) return;
    const heads = Math.random() < 0.5;
    if (!heads) {
      log("Lyra's Blast Echo: tails — no extra hit.");
      return;
    }
    const dist = Math.abs(defenderCol - attackerCol);
    if (dist < 2) {
      log("Lyra's Blast Echo: heads — no between tile for this attack.");
      return;
    }
    const betweenCol = defenderCol > attackerCol ? defenderCol - 1 : defenderCol + 1;
    if (betweenCol < 0 || betweenCol > 4) {
      log("Lyra's Blast Echo: heads — no enemy unit in the between tile.");
      return;
    }
    const betweenCell = state.board[defenderPlayer][betweenCol];
    if (!betweenCell) {
      log("Lyra's Blast Echo: heads — no enemy unit in the between tile.");
      return;
    }
    log("Lyra's Blast Echo: heads — extra 1 damage to " + betweenCell.unit.name + ".");
    applyDamage(defenderPlayer, betweenCol, 1, "");
  }

  function maybeApplySolomonFrontParalyze(attCell, attackerCol, defenderPlayer) {
    if (!hasVeteranBuff(attCell, 'solomon')) return;
    const frontCol = attackerCol;
    const frontCell = state.board[defenderPlayer][frontCol];
    if (!frontCell) {
      log("Solomon's Lunar Dazzle — no enemy directly in front.");
      return;
    }
    revealAndParalyze(defenderPlayer, frontCol, 'Lunar Dazzle');
  }

  function maybeApplyChronirAdjacentParalyze(attCell, defenderPlayer, defenderCol) {
    if (!hasVeteranBuff(attCell, 'chronir')) return;
    const cols = [];
    if (defenderCol - 1 >= 0 && state.board[defenderPlayer][defenderCol - 1]) cols.push(defenderCol - 1);
    if (defenderCol + 1 <= 4 && state.board[defenderPlayer][defenderCol + 1]) cols.push(defenderCol + 1);
    if (cols.length === 0) {
      log("Chronir's Frozen Chain — no adjacent enemy to paralyze.");
      return;
    }
    if (cols.length === 1) {
      revealAndParalyze(defenderPlayer, cols[0], 'Frozen Chain');
      return;
    }
    state.pendingChronirChoice = { defenderPlayer: defenderPlayer, targetCols: cols.slice() };
    log("Chronir's Frozen Chain — choose an adjacent enemy to paralyze.");
  }

  function refreshSenyaCooldownForTurn(player) {
    for (let c = 0; c < 5; c++) {
      const cell = state.board[player][c];
      if (!cell || !hasVeteranBuff(cell, 'senya')) continue;
      if (!cell.veteranState) cell.veteranState = {};
      if (cell.veteranState.senyaBlockNextTurn) {
        cell.veteranState.senyaBlockedThisTurn = true;
        cell.veteranState.senyaBlockNextTurn = false;
      } else {
        cell.veteranState.senyaBlockedThisTurn = false;
      }
    }
  }

  function resolveDefenderVeteranPacket(attackerPlayer, attackerCol, defenderPlayer, defenderCol, options) {
    const opts = options || {};
    const result = {
      canceled: false,
      finalPlayer: defenderPlayer,
      finalCol: defenderCol,
      landedOnOriginalTarget: true,
      tivalFailureReason: null,
    };
    const defCell = state.board[defenderPlayer][defenderCol];
    if (!defCell) {
      result.canceled = true;
      return result;
    }

    const isVorpalPacket = !!opts.vorpalIgnoresDefenderVeterancy;
    const hasDefenderPassive = hasVeteranBuff(defCell, 'senya') || hasVeteranBuff(defCell, 'iktha') || hasVeteranBuff(defCell, 'mivara');
    if (isVorpalPacket && hasDefenderPassive) {
      log("Vorpal Honing Amulet — ignores " + defCell.unit.name + "'s defender veterancy.");
      return result;
    }

    if (hasVeteranBuff(defCell, 'iktha')) {
      const attackerCell = state.board[attackerPlayer][attackerCol];
      if (!attackerCell || !attackerCell.gear) {
        log("Iktha's Magma Skin — attacker has no gear to destroy.");
      } else {
        const removed = attackerCell.gear;
        if (!state.itemDiscard) state.itemDiscard = [];
        state.itemDiscard.push(removed);
        attackerCell.gear = null;
        log("Iktha's Magma Skin — " + removed.name + " on " + attackerCell.unit.name + " is destroyed before damage.");
      }
    }

    if (hasVeteranBuff(defCell, 'senya')) {
      if (!defCell.veteranState) defCell.veteranState = {};
      if (defCell.veteranState.senyaBlockedThisTurn) {
        log("Senya's Hex Haze is on cooldown this turn — damage is not negated.");
      } else {
        const senyaHeads = Math.random() < 0.5;
        if (!senyaHeads) {
          log("Senya's Hex Haze: tails — damage is not negated.");
        } else {
          defCell.veteranState.senyaBlockNextTurn = true;
          log("Senya's Hex Haze: heads — damage and effects are negated, attacker takes 1 damage.");
          applyDamage(attackerPlayer, attackerCol, 1, "");
          result.canceled = true;
          result.landedOnOriginalTarget = false;
          result.tivalFailureReason = "attack was negated by Senya's Hex Haze";
          return result;
        }
      }
    }

    if (hasVeteranBuff(defCell, 'mivara')) {
      const mivaraHeads = Math.random() < 0.5;
      if (!mivaraHeads) {
        log("Mivara's False Self: tails — no redirection.");
      } else {
        const redirectedCell = state.board[attackerPlayer][defenderCol];
        if (!redirectedCell) {
          log("Mivara's False Self: heads — no enemy in front, so no redirected damage or effects.");
          result.canceled = true;
          result.landedOnOriginalTarget = false;
          result.tivalFailureReason = "attack was redirected by Mivara's False Self";
          return result;
        }
        log("Mivara's False Self: heads — damage and effects redirect to " + redirectedCell.unit.name + ".");
        result.finalPlayer = attackerPlayer;
        result.finalCol = defenderCol;
        result.landedOnOriginalTarget = false;
        result.tivalFailureReason = "attack was redirected by Mivara's False Self";
      }
    }

    return result;
  }

  function finishResolvedCombatTurn() {
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

  function resolvePendingChronirChoice(column) {
    const pending = state.pendingChronirChoice;
    if (!pending) return;
    if (pending.targetCols.indexOf(column) === -1) return;
    const target = state.board[pending.defenderPlayer][column];
    state.pendingChronirChoice = null;
    if (!target) {
      log("Chronir's Frozen Chain — chosen target is no longer valid.");
      finishResolvedCombatTurn();
      return;
    }
    revealAndParalyze(pending.defenderPlayer, column, 'Frozen Chain');
    finishResolvedCombatTurn();
  }

  function maybeApplyGrolkCaptureHeal(attCell, attackerPlayer, attackerCol, didCapture) {
    if (!hasVeteranBuff(attCell, 'grolk') || !didCapture) return;
    const heads = Math.random() < 0.5;
    if (!heads) {
      log("Grolk's Bloodthirst: tails — no healing.");
      return;
    }
    healCellDamage(attackerPlayer, attackerCol, 1, "Grolk's Bloodthirst");
  }

  function getJorrenDamageBonus(attCell) {
    if (!hasVeteranBuff(attCell, 'jorren')) return 0;
    if (!attCell.veteranState) attCell.veteranState = {};
    const bonus = attCell.veteranState.jorrenAttackedLastOwnTurn ? 1 : 0;
    if (bonus > 0) log("Jorren's Berserker — consecutive-turn attack deals +1 damage.");
    return bonus;
  }

  function markJorrenAttackThisTurn(attCell) {
    if (!hasVeteranBuff(attCell, 'jorren')) return;
    if (!attCell.veteranState) attCell.veteranState = {};
    attCell.veteranState.jorrenAttackedThisTurn = true;
  }

  function updateJorrenFlagsAtTurnEnd(player) {
    for (let c = 0; c < 5; c++) {
      const cell = state.board[player][c];
      if (!cell || !hasVeteranBuff(cell, 'jorren')) continue;
      if (!cell.veteranState) cell.veteranState = {};
      cell.veteranState.jorrenAttackedLastOwnTurn = !!cell.veteranState.jorrenAttackedThisTurn;
      cell.veteranState.jorrenAttackedThisTurn = false;
    }
  }

  function refreshCassaCooldownForTurn(player) {
    for (let c = 0; c < 5; c++) {
      const cell = state.board[player][c];
      if (!cell || !hasVeteranBuff(cell, 'cassa')) continue;
      if (!cell.veteranState) cell.veteranState = {};
      if (cell.veteranState.cassaBlockNextTurn) {
        cell.veteranState.cassaBlockedThisTurn = true;
        cell.veteranState.cassaBlockNextTurn = false;
      } else {
        cell.veteranState.cassaBlockedThisTurn = false;
      }
    }
  }

  function getFaceUpEnemyColsInRange(attackerPlayer, attackerCol, attCell, defenderPlayer) {
    const cols = [];
    for (let c = 0; c < 5; c++) {
      const enemyCell = state.board[defenderPlayer][c];
      if (!enemyCell || !enemyCell.faceUp) continue;
      if (!isInRangeWithCell(attackerCol, c, attCell)) continue;
      cols.push(c);
    }
    return cols;
  }

  function prepareCassaTwinArcOpportunity(attackerPlayer, attackerCol, defenderPlayer, firstDefCol) {
    const attCell = state.board[attackerPlayer][attackerCol];
    const targetCell = state.board[defenderPlayer][firstDefCol];
    if (!attCell || !targetCell || !hasVeteranBuff(attCell, 'cassa')) return;
    if (!attCell.veteranState) attCell.veteranState = {};
    if (attCell.veteranState.cassaBlockedThisTurn) {
      log("Cassa's Twin Arc is on cooldown this turn.");
      return;
    }
    if (state.cassaSecondAttackInProgress) return;
    if (!targetCell.faceUp) return;
    const faceUpInRange = getFaceUpEnemyColsInRange(attackerPlayer, attackerCol, attCell, defenderPlayer);
    if (faceUpInRange.length < 2) return;
    const options = faceUpInRange.filter(function (c) { return c !== firstDefCol; });
    if (options.length === 0) return;
    state.pendingCassaOpportunity = {
      attPlayer: attackerPlayer,
      attCol: attackerCol,
      defPlayer: defenderPlayer,
      firstDefCol: firstDefCol,
      options: options.slice(),
    };
  }

  function runPendingCassaSecondAttackIfAvailable() {
    const pending = state.pendingCassaSecondAttack;
    if (!pending) return false;
    if (checkGameOver() !== null) {
      state.pendingCassaSecondAttack = null;
      return false;
    }
    state.pendingCassaSecondAttack = null;
    const attCell = state.board[pending.attPlayer][pending.attCol];
    const defCell = state.board[pending.defPlayer][pending.defCol];
    if (!attCell || !defCell) return false;
    log("Cassa's Twin Arc — second attack on column " + pending.defCol + ".");
    state.cassaSecondAttackInProgress = true;
    beginAttackAgainstTarget(pending.attPlayer, pending.attCol, pending.defPlayer, pending.defCol);
    state.cassaSecondAttackInProgress = false;
    return true;
  }

  function hasAdjacentHarlundForTarget(defenderPlayer, defenderCol) {
    const targetCell = state.board[defenderPlayer][defenderCol];
    if (!targetCell) return false;
    const left = defenderCol - 1;
    const right = defenderCol + 1;
    if (left >= 0) {
      const leftCell = state.board[defenderPlayer][left];
      if (leftCell && hasVeteranBuff(leftCell, 'harlund')) return true;
    }
    if (right <= 4) {
      const rightCell = state.board[defenderPlayer][right];
      if (rightCell && hasVeteranBuff(rightCell, 'harlund')) return true;
    }
    return false;
  }

  function beginAttackAgainstTarget(attackerPlayer, attackerCol, defenderPlayer, defenderCol, options) {
    const opts = options || {};
    const defCell = state.board[defenderPlayer][defenderCol];
    if (!defCell) return false;
    if (defCell.gear && defCell.gear.name === 'Wardstone Bracelet') {
      state.pendingWardstone = { attPlayer: attackerPlayer, attCol: attackerCol, defPlayer: defenderPlayer, defCol: defenderCol };
      renderTurnUI();
      renderBoard();
      return true;
    }
    resolveCombat(attackerPlayer, attackerCol, defenderPlayer, defenderCol, opts);
    return true;
  }

  function maybeRedirectToHarlund(defenderPlayer, defenderCol, attackContext) {
    if (attackContext && attackContext.harlundUsed) {
      if (typeof attackContext.protectedCol === 'number' && defenderCol === attackContext.protectedCol) {
        return null;
      }
      return defenderCol;
    }
    const left = defenderCol - 1;
    const right = defenderCol + 1;
    let harlundCol = null;
    if (left >= 0) {
      const leftCell = state.board[defenderPlayer][left];
      if (leftCell && hasVeteranBuff(leftCell, 'harlund')) harlundCol = left;
    }
    if (harlundCol == null && right <= 4) {
      const rightCell = state.board[defenderPlayer][right];
      if (rightCell && hasVeteranBuff(rightCell, 'harlund')) harlundCol = right;
    }
    if (harlundCol == null) return defenderCol;
    const allyCell = state.board[defenderPlayer][defenderCol];
    const harlundCell = state.board[defenderPlayer][harlundCol];
    if (!allyCell || !harlundCell) return defenderCol;
    const useShield = !!(attackContext && attackContext.harlundDecision === 'use');
    if (!useShield) {
      if (!attackContext || !attackContext.harlundDeclineLogged) {
        log("Harlund's Pack Shield not used.");
        if (attackContext) attackContext.harlundDeclineLogged = true;
      }
      return defenderCol;
    }
    state.board[defenderPlayer][defenderCol] = harlundCell;
    state.board[defenderPlayer][harlundCol] = allyCell;
    state.board[defenderPlayer][defenderCol].faceUp = true;
    if (attackContext) {
      attackContext.harlundUsed = true;
      attackContext.protectedCol = harlundCol;
    }
    log("Harlund's Pack Shield — " + harlundCell.unit.name + " swaps in and takes the hit.");
    return defenderCol;
  }

  function queueTivalRetryPrompt(attackerPlayer, attackerCol, defenderPlayer, defenderCol, reasonLabel) {
    if (state.tivalRetryInProgress) return false;
    const attCell = state.board[attackerPlayer][attackerCol];
    const defCell = state.board[defenderPlayer][defenderCol];
    if (!attCell || !defCell) return false;
    if (!hasVeteranBuff(attCell, 'tival')) return false;
    state.pendingVeteranPrompt = {
      type: 'tivalRetry',
      message: "Tival's Quick Reload: " + reasonLabel + ". Retry attack on the same target now?",
      useLabel: 'Retry attack',
      noLabel: 'No',
      attPlayer: attackerPlayer,
      attCol: attackerCol,
      defPlayer: defenderPlayer,
      defCol: defenderCol,
    };
    return true;
  }

  function maybeTriggerVaelaFrontStrike(moverPlayer, moverCol) {
    const moverCell = state.board[moverPlayer][moverCol];
    if (!moverCell) return false;
    const opp = moverPlayer === 1 ? 2 : 1;
    const vaelaCell = state.board[opp][moverCol];
    if (!vaelaCell || !hasVeteranBuff(vaelaCell, 'vaela')) return false;
    const heads = Math.random() < 0.5;
    if (!heads) {
      log("Vaela's Instinctive Strike: tails — no interruption.");
      return false;
    }
    log("Vaela's Instinctive Strike: heads — " + moverCell.unit.name + " takes 1 damage and turn ends.");
    applyDamage(moverPlayer, moverCol, 1, "");
    replaceCapturedUnitsBeforePass();
    state.selectedUnit = null;
    state.actionStep = 'select_unit';
    renderTurnUI();
    renderBoard();
    endTurn();
    return true;
  }

  function queueCassaUsePromptIfReady(attackerPlayer, attackerCol, defenderPlayer, defenderCol) {
    if (state.cassaSecondAttackInProgress) return false;
    const opp = state.pendingCassaOpportunity;
    if (!opp) return false;
    if (opp.attPlayer !== attackerPlayer || opp.attCol !== attackerCol || opp.defPlayer !== defenderPlayer || opp.firstDefCol !== defenderCol) return false;
    const attCell = state.board[attackerPlayer][attackerCol];
    if (!attCell || !hasVeteranBuff(attCell, 'cassa')) {
      state.pendingCassaOpportunity = null;
      return false;
    }
    if (!attCell.veteranState) attCell.veteranState = {};
    if (attCell.veteranState.cassaBlockedThisTurn) {
      state.pendingCassaOpportunity = null;
      return false;
    }
    const options = opp.options.filter(function (c) {
      const cell = state.board[defenderPlayer][c];
      return !!(cell && cell.faceUp && isInRangeWithCell(attackerCol, c, attCell));
    });
    state.pendingCassaOpportunity = null;
    if (options.length === 0) return false;
    state.pendingVeteranPrompt = {
      type: 'cassaTwinArc',
      message: "Cassa's Twin Arc is available. Use it for a second attack?",
      useLabel: 'Use Twin Arc',
      noLabel: 'No',
      attPlayer: attackerPlayer,
      attCol: attackerCol,
      defPlayer: defenderPlayer,
      options: options.slice(),
    };
    return true;
  }

  function resolvePendingCassaChoice(column) {
    const pending = state.pendingCassaChoice;
    if (!pending) return;
    if (pending.targetCols.indexOf(column) === -1) return;
    state.pendingCassaChoice = null;
    state.pendingCassaSecondAttack = {
      attPlayer: pending.attPlayer,
      attCol: pending.attCol,
      defPlayer: pending.defPlayer,
      defCol: column,
    };
    const attCell = state.board[pending.attPlayer][pending.attCol];
    if (attCell) {
      if (!attCell.veteranState) attCell.veteranState = {};
      attCell.veteranState.cassaBlockNextTurn = true;
    }
    log("Cassa's Twin Arc — second attack prepared (column " + column + ").");
    if (runPendingCassaSecondAttackIfAvailable()) return;
    finishResolvedCombatTurn();
  }

  function resolveHarlundSinglePrompt(useShield) {
    const prompt = state.pendingVeteranPrompt;
    if (!prompt || prompt.type !== 'harlundOnHitSingle') return;
    state.pendingVeteranPrompt = null;
    const attCell = state.board[prompt.attPlayer][prompt.attCol];
    if (!attCell) {
      finishResolvedCombatTurn();
      return;
    }
    const attackContext = {
      harlundUsed: false,
      harlundDecision: useShield ? 'use' : 'no',
      harlundDeclineLogged: false,
      harlundPromptResolved: true,
      protectedCol: null,
    };
    const hitCol = maybeRedirectToHarlund(prompt.defPlayer, prompt.defCol, attackContext);
    if (hitCol == null) {
      log("Harlund's Pack Shield — protected ally ignores the rest of this attack sequence.");
      if (queueCassaUsePromptIfReady(prompt.attPlayer, prompt.attCol, prompt.defPlayer, prompt.defCol)) {
        renderTurnUI();
        renderBoard();
        return;
      }
      if (runPendingCassaSecondAttackIfAvailable()) return;
      finishResolvedCombatTurn();
      return;
    }
    const vorpalPacket = state.vorpalNextAttack === prompt.attPlayer;
    const packet = resolveDefenderVeteranPacket(prompt.attPlayer, prompt.attCol, prompt.defPlayer, hitCol, { vorpalIgnoresDefenderVeterancy: vorpalPacket });
    if (packet.canceled) {
      if (queueCassaUsePromptIfReady(prompt.attPlayer, prompt.attCol, prompt.defPlayer, prompt.defCol)) {
        renderTurnUI();
        renderBoard();
        return;
      }
      if (runPendingCassaSecondAttackIfAvailable()) return;
      if (queueTivalRetryPrompt(prompt.attPlayer, prompt.attCol, prompt.defPlayer, prompt.defCol, packet.tivalFailureReason || "attack did not land")) {
        renderTurnUI();
        renderBoard();
        return;
      }
      finishResolvedCombatTurn();
      return;
    }
    const finalPlayer = packet.finalPlayer;
    const finalCol = packet.finalCol;
    const tivalFailureReason = (!packet.landedOnOriginalTarget && packet.tivalFailureReason) ? packet.tivalFailureReason : null;
    const finalTargetCell = state.board[finalPlayer][finalCol];
    const finalTargetHadBarbed = !!(finalTargetCell && finalTargetCell.gear && finalTargetCell.gear.name === 'Barbed Gauntlets');
    const captured = applyDamage(finalPlayer, finalCol, prompt.damage, "");
    if (!captured && state.board[finalPlayer][finalCol] && prompt.effectiveClass === 'Caster') {
      state.board[finalPlayer][finalCol].paralyzed = true;
      log(state.board[finalPlayer][finalCol].unit.name + " is paralyzed (Magic Paralysis).");
    }
    maybeApplyHaskelSteal(attCell, prompt.attPlayer, prompt.defPlayer);
    maybeApplyLyraEcho(attCell, prompt.attCol, finalPlayer, finalCol);
    maybeApplySolomonFrontParalyze(attCell, prompt.attCol, prompt.defPlayer);
    maybeApplyChronirAdjacentParalyze(attCell, finalPlayer, finalCol);
    maybeApplyGrolkCaptureHeal(attCell, prompt.attPlayer, prompt.attCol, captured);
    const attCellAfter = state.board[prompt.attPlayer][prompt.attCol];
    if (attCellAfter && attCellAfter.nextAttackAsCaster) {
      attCellAfter.nextAttackAsCaster = false;
    }
    if (finalTargetHadBarbed && (prompt.attClassForBarbed === 'Brawler' || prompt.attClassForBarbed === 'Lancer')) {
      const heads = Math.random() < 0.5;
      if (heads) {
        const attRef = state.board[prompt.attPlayer][prompt.attCol];
        if (attRef) {
          const maxHP = getMaxHP(attRef);
          const current = attRef.damage || 0;
          const newTotal = current + 1;
          if (newTotal >= maxHP) {
            log("Barbed Gauntlets: heads — " + attRef.unit.name + " takes 1 damage from the defender's gauntlets and is captured.");
          } else {
            log("Barbed Gauntlets: heads — " + attRef.unit.name + " takes 1 damage from the defender's gauntlets (" + newTotal + "/" + maxHP + " HP).");
          }
          applyDamage(prompt.attPlayer, prompt.attCol, 1, null, true);
        }
      } else {
        log("Barbed Gauntlets: tails — no reflected damage.");
      }
    }
    if (state.vorpalNextAttack === prompt.attPlayer) {
      state.vorpalNextAttack = null;
    }
    if (state.pendingChronirChoice) {
      renderTurnUI();
      renderBoard();
      return;
    }
    if (queueCassaUsePromptIfReady(prompt.attPlayer, prompt.attCol, prompt.defPlayer, prompt.defCol)) {
      renderTurnUI();
      renderBoard();
      return;
    }
    if (runPendingCassaSecondAttackIfAvailable()) return;
    if (tivalFailureReason) {
      if (queueTivalRetryPrompt(prompt.attPlayer, prompt.attCol, prompt.defPlayer, prompt.defCol, tivalFailureReason)) {
        renderTurnUI();
        renderBoard();
        return;
      }
    }
    finishResolvedCombatTurn();
  }

  function resolveHarlundArchmagePrompt(useShield) {
    const prompt = state.pendingVeteranPrompt;
    if (!prompt || prompt.type !== 'harlundOnHitArchmage') return;
    state.pendingVeteranPrompt = null;
    const ar = state.archmageMultiResolving;
    if (!ar) return;
    ar.harlundPromptResolved = true;
    ar.harlundDecision = useShield ? 'use' : 'no';
    if (!useShield) ar.protectedCol = null;
    continueArchmageMulti();
  }

  function doVeteranPromptUse() {
    const prompt = state.pendingVeteranPrompt;
    if (!prompt) return;
    if (prompt.type === 'tivalRetry') {
      state.pendingVeteranPrompt = null;
      log("Tival's Quick Reload — immediate retry on the same target.");
      state.tivalRetryInProgress = true;
      beginAttackAgainstTarget(prompt.attPlayer, prompt.attCol, prompt.defPlayer, prompt.defCol);
      state.tivalRetryInProgress = false;
      return;
    }
    if (prompt.type === 'harlundOnHitSingle') {
      resolveHarlundSinglePrompt(true);
      return;
    }
    if (prompt.type === 'harlundOnHitArchmage') {
      resolveHarlundArchmagePrompt(true);
      return;
    }
    if (prompt.type === 'cassaTwinArc') {
      state.pendingVeteranPrompt = null;
      if (prompt.options.length === 1) {
        const onlyCol = prompt.options[0];
        state.pendingCassaSecondAttack = { attPlayer: prompt.attPlayer, attCol: prompt.attCol, defPlayer: prompt.defPlayer, defCol: onlyCol };
        const attCell = state.board[prompt.attPlayer][prompt.attCol];
        if (attCell) {
          if (!attCell.veteranState) attCell.veteranState = {};
          attCell.veteranState.cassaBlockNextTurn = true;
        }
        log("Cassa's Twin Arc — second attack prepared (column " + onlyCol + ").");
        if (runPendingCassaSecondAttackIfAvailable()) return;
        finishResolvedCombatTurn();
        return;
      }
      state.pendingCassaChoice = {
        attPlayer: prompt.attPlayer,
        attCol: prompt.attCol,
        defPlayer: prompt.defPlayer,
        targetCols: prompt.options.slice(),
      };
      renderTurnUI();
      renderBoard();
      return;
    }
  }

  function doVeteranPromptNo() {
    const prompt = state.pendingVeteranPrompt;
    if (!prompt) return;
    if (prompt.type === 'tivalRetry') {
      state.pendingVeteranPrompt = null;
      log("Tival's Quick Reload not used.");
      finishResolvedCombatTurn();
      return;
    }
    if (prompt.type === 'harlundOnHitSingle') {
      resolveHarlundSinglePrompt(false);
      return;
    }
    if (prompt.type === 'harlundOnHitArchmage') {
      resolveHarlundArchmagePrompt(false);
      return;
    }
    if (prompt.type === 'cassaTwinArc') {
      state.pendingVeteranPrompt = null;
      log("Cassa's Twin Arc not used.");
      finishResolvedCombatTurn();
      return;
    }
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
    if (cell.cannotAttackNextTurn || cell.mustRestNextTurn) return false;
    const opp = attackerPlayer === 1 ? 2 : 1;
    for (let c = 0; c < 5; c++) {
      if (state.board[opp][c] == null) continue;
      if (isInRangeWithCell(attackerCol, c, cell)) return true;
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

  /** First name for full-card filenames in assets/units/full-cards/ (e.g. "Harlund Ironhowl" -> "Harlund") */
  function getUnitFullCardFilename(unit) {
    const first = String(unit.name || '').trim().split(/\s+/)[0];
    return first || '';
  }

  function getUnitSpritePath(unit) {
    return 'assets/units/' + nameToSlug(unit.name) + '.png';
  }

  /** Unit full-card image path (assets/units/full-cards/Firstname.png); falls back to placeholder if missing. */
  function getUnitCardImagePath(unit) {
    const first = getUnitFullCardFilename(unit);
    return first ? 'assets/units/full-cards/' + first + '.png' : 'assets/units/unit-placeholder-for-dev.png';
  }

  /** Item card image path; falls back to placeholder. */
  function getItemCardImagePath(itemName) {
    const slug = nameToSlug(itemName);
    return slug ? 'assets/items/' + slug + '.png' : 'assets/items/item-placeholder-for-dev.png';
  }

  function createUnitCardHTML(unit, cardState) {
    const faceUp = cardState.faceUp;
    const damage = cardState.damage || 0;
    const paralyzed = cardState.paralyzed || false;
    const cannotAttackNextTurn = cardState.cannotAttackNextTurn || false;
    const mustRestNextTurn = cardState.mustRestNextTurn || false;
    const showCannotAttack = cannotAttackNextTurn || mustRestNextTurn;
    const maxHP = cardState.maxHP != null ? cardState.maxHP : getBaseHP(unit.class);
    const gear = cardState.gear || null;
    const terrain = cardState.terrain || null;

    const cardPath = getUnitCardImagePath(unit);
    const fallbackPath = 'assets/units/unit-placeholder-for-dev.png';
    let markersHTML = '';
    if (damage > 0) {
      markersHTML += '<span class="marker marker--damage">' + damage + '/' + maxHP + ' dmg</span>';
    }
    if (paralyzed) {
      markersHTML += '<span class="marker marker--paralyzed">Paralyzed</span>';
    }
    if (showCannotAttack) {
      markersHTML += '<span class="marker marker--cannot-attack">Can\'t attack</span>';
    }

    const cardClass = faceUp ? 'unit-card unit-card--face-up' : 'unit-card unit-card--face-down-soft';
    const dataAttrs = ' data-face-up="' + (faceUp ? 'true' : 'false') + '" data-name="' + escapeHtml(unit.name) + '" data-class="' + unit.class + '" data-hp="' + maxHP + '" data-damage="' + damage + '"';
    const badgePart = markersHTML ? '<div class="unit-card__markers">' + markersHTML + '</div>' : '';
    const faceDownOverlayPart = !faceUp ? '<div class="unit-card__face-down-overlay" aria-hidden="true"></div>' : '';

    const gearPart = gear ? '<div class="unit-mini-card unit-mini-card--gear"><img class="unit-mini-card__img" src="' + escapeHtml(getItemCardImagePath(gear.name)) + '" alt="" role="presentation"></div>' : '';
    const terrainPart = terrain ? '<div class="unit-mini-card unit-mini-card--terrain"><img class="unit-mini-card__img" src="' + escapeHtml(getItemCardImagePath(terrain.name)) + '" alt="" role="presentation"></div>' : '';

    return '<div class="unit-tile">' +
      terrainPart +
      gearPart +
      '<div class="' + cardClass + '"' + dataAttrs + '>' +
      '<div class="unit-card__img-wrap">' +
      '<img class="unit-card__img" src="' + escapeHtml(cardPath) + '" alt="" role="presentation" onerror="this.src=\'' + fallbackPath + '\'">' +
      faceDownOverlayPart +
      '</div>' +
      badgePart +
      '</div>' +
      '</div>';
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
        const terrainCell = terrainRow[i] || null;
        const unitPart = cell
          ? createUnitCardHTML(cell.unit, {
              faceUp: cell.faceUp,
              damage: cell.damage || 0,
              paralyzed: cell.paralyzed || false,
              cannotAttackNextTurn: cell.cannotAttackNextTurn || false,
              mustRestNextTurn: cell.mustRestNextTurn || false,
              maxHP: getMaxHP(cell),
              gear: cell.gear || null,
              terrain: terrainCell
            })
          : '';
        slots[i].innerHTML = unitPart;
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
      renderDiscardPiles();
    }
  }

  /**
   * Mini discard preview: at most `maxLayers` faces from the end of `entries`.
   * Last array entry = top of stack (highest z-index). Full count stays in the title/label.
   */
  function renderMiniDiscardStack(container, entries, imageForEntry, fallbackSrc, maxLayers) {
    if (!container) return;
    var cap = maxLayers != null ? maxLayers : 3;
    container.innerHTML = '';
    const n = entries.length;
    if (n === 0) {
      const empty = document.createElement('div');
      empty.className = 'deck-pile__stack--empty';
      empty.setAttribute('aria-hidden', 'true');
      container.appendChild(empty);
      return;
    }
    var start = Math.max(0, n - cap);
    for (var i = start; i < n; i++) {
      var local = i - start;
      var layer = document.createElement('div');
      layer.className = 'deck-pile__stack-layer';
      layer.style.zIndex = String(local);
      var off = local * 3;
      layer.style.transform = 'translate(' + off + 'px, ' + -off + 'px)';
      var img = document.createElement('img');
      img.src = imageForEntry(entries[i]);
      img.alt = '';
      img.setAttribute('role', 'presentation');
      img.onerror = function () {
        this.onerror = null;
        this.src = fallbackSrc;
      };
      layer.appendChild(img);
      container.appendChild(layer);
    }
  }

  function renderDiscardPiles() {
    var maxMiniStackLayers = 3;
    var itemList = state.itemDiscard || [];
    if (discardPileCountEl) discardPileCountEl.textContent = itemList.length;
    renderMiniDiscardStack(
      itemDiscardStackEl,
      itemList,
      function (entry) {
        return getItemCardImagePath(entry.name);
      },
      'assets/items/item-placeholder-for-dev.png',
      maxMiniStackLayers
    );
    if (btnItemDiscardOpen) {
      var itemLabel = 'View item discard pile (' + itemList.length + ' cards)';
      btnItemDiscardOpen.setAttribute('aria-label', itemLabel);
    }

    var unitList = state.unitDiscard || [];
    if (unitDiscardCountEl) unitDiscardCountEl.textContent = unitList.length;
    renderMiniDiscardStack(
      unitsDiscardStackEl,
      unitList,
      function (unit) {
        return getUnitCardImagePath(unit);
      },
      'assets/units/unit-placeholder-for-dev.png',
      maxMiniStackLayers
    );
    if (btnUnitDiscardOpen) {
      var unitLabel = 'View unit discard pile (' + unitList.length + ' units)';
      btnUnitDiscardOpen.setAttribute('aria-label', unitLabel);
    }
  }

  function highlightSlots() {
    document.querySelectorAll('.slot').forEach(function (slot) {
      slot.classList.remove('slot--selectable', 'slot--selected');
    });
    if (state.pendingWardstone) return;
    if (state.pendingCassaChoice) {
      const pendingCassa = state.pendingCassaChoice;
      for (let i = 0; i < pendingCassa.targetCols.length; i++) {
        const c = pendingCassa.targetCols[i];
        const slot = document.querySelector('.row--player' + pendingCassa.defPlayer + ' .slot[data-column="' + c + '"]');
        if (slot) slot.classList.add('slot--selectable');
      }
      return;
    }
    if (state.pendingChronirChoice) {
      const pending = state.pendingChronirChoice;
      for (let i = 0; i < pending.targetCols.length; i++) {
        const c = pending.targetCols[i];
        const slot = document.querySelector('.row--player' + pending.defenderPlayer + ' .slot[data-column="' + c + '"]');
        if (slot) slot.classList.add('slot--selectable');
      }
      return;
    }
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
        if (cell.paralyzed || cell.cannotAttackNextTurn || cell.mustRestNextTurn) continue;
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
      for (let c = 0; c < 5; c++) {
        if (state.board[opp][c] == null) continue;
        if (!isInRangeWithCell(sel.column, c, attCell)) continue;
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
    if (itemHandsP1El) itemHandsP1El.hidden = true;
    if (itemHandsP2El) itemHandsP2El.hidden = true;
    if (discardPileEl) discardPileEl.hidden = true;
    if (unitsDiscardPileEl) unitsDiscardPileEl.hidden = true;
    if (gameLogEl) gameLogEl.hidden = true;
    if (itemPickListWrapEl) itemPickListWrapEl.setAttribute('hidden', '');
    if (placementHandFilterEl) placementHandFilterEl.value = '';
    closePlacementUnitPickList();
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
    if (placementHandFilterEl) placementHandFilterEl.value = '';
    closePlacementUnitPickList();
    renderPlacementStep();
    renderBoard();
  }

  function findUnitObjectLocation(unitObj) {
    if (!unitObj) return null;
    for (let i = 0; i < state.p1Hand.length; i++) {
      if (state.p1Hand[i] === unitObj) return { kind: 'p1Hand', i: i };
    }
    for (let i = 0; i < state.p2Hand.length; i++) {
      if (state.p2Hand[i] === unitObj) return { kind: 'p2Hand', i: i };
    }
    for (let i = 0; i < state.unitDeck.length; i++) {
      if (state.unitDeck[i] === unitObj) return { kind: 'unitDeck', i: i };
    }
    for (let p = 1; p <= 2; p++) {
      for (let c = 0; c < 5; c++) {
        const cell = state.board[p][c];
        if (cell && cell.unit === unitObj) return { kind: 'board', player: p, col: c };
      }
    }
    return null;
  }

  function replacePlacementHandSlotWithUnit(player, handIndex, targetUnitObj) {
    if (typeof CHARACTERS === 'undefined' || !targetUnitObj) return;
    const hand = player === 1 ? state.p1Hand : state.p2Hand;
    if (handIndex < 0 || handIndex >= hand.length) return;
    const oldUnit = hand[handIndex];
    if (oldUnit === targetUnitObj) return;

    const loc = findUnitObjectLocation(targetUnitObj);
    if (!loc) {
      log('Debug: placement replace — target unit not found in pool.');
      return;
    }
    if (loc.kind === 'board') {
      log('Debug: placement replace — ' + targetUnitObj.name + ' is already on the board.');
      return;
    }

    if (loc.kind === 'unitDeck') {
      hand[handIndex] = targetUnitObj;
      state.unitDeck.splice(loc.i, 1);
      state.unitDeck.push(oldUnit);
      log('Debug: Placement — replaced ' + oldUnit.name + ' with ' + targetUnitObj.name + ' (from unit deck).');
      return;
    }

    if (loc.kind === 'p1Hand') {
      if (player === 1) {
        if (loc.i === handIndex) return;
        state.p1Hand[loc.i] = oldUnit;
        state.p1Hand[handIndex] = targetUnitObj;
        log('Debug: Placement — swapped P1 hand slots for ' + targetUnitObj.name + '.');
      } else {
        state.p1Hand[loc.i] = oldUnit;
        state.p2Hand[handIndex] = targetUnitObj;
        log('Debug: Placement — replaced with unit from P1 hand (' + targetUnitObj.name + ').');
      }
      return;
    }

    if (loc.kind === 'p2Hand') {
      if (player === 2) {
        if (loc.i === handIndex) return;
        state.p2Hand[loc.i] = oldUnit;
        state.p2Hand[handIndex] = targetUnitObj;
        log('Debug: Placement — swapped P2 hand slots for ' + targetUnitObj.name + '.');
      } else {
        state.p2Hand[loc.i] = oldUnit;
        state.p1Hand[handIndex] = targetUnitObj;
        log('Debug: Placement — replaced with unit from P2 hand (' + targetUnitObj.name + ').');
      }
    }
  }

  function renderPlacementUnitPickList(filter) {
    if (!placementUnitPickListEl || typeof CHARACTERS === 'undefined') return;
    placementUnitPickListEl.innerHTML = '';
    const q = (filter || '').trim().toLowerCase();
    const rows = CHARACTERS.slice().sort(function (a, b) {
      return (a.name || '').localeCompare(b.name || '');
    });
    const matches = q
      ? rows.filter(function (u) {
        const hay = ((u.name || '') + ' ' + (u.class || '') + ' ' + (u.level || '') + ' ' + (u.veteranBuff || '')).toLowerCase();
        return hay.indexOf(q) !== -1;
      })
      : rows;
    if (matches.length === 0) {
      const p = document.createElement('p');
      p.className = 'setup__hand--empty-filter';
      p.textContent = 'No units match your filter.';
      placementUnitPickListEl.appendChild(p);
      return;
    }
    matches.forEach(function (u) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn--small btn--secondary setup__placement-unit-pick-btn';
      btn.setAttribute('role', 'listitem');
      btn.dataset.unitName = u.name;
      var label = u.name;
      if (u.class) label += ' (' + u.class + ')';
      if (u.level === 'Veteran' && u.veteranBuff) label += ' — ' + u.veteranBuff;
      btn.textContent = label;
      placementUnitPickListEl.appendChild(btn);
    });
  }

  function openPlacementUnitPickList() {
    if (!placementUnitPickWrapEl || !placementUnitPickListEl) return;
    if (state.phase !== 'setup_place_p1' && state.phase !== 'setup_place_p2') return;
    if (state.selectedPlacementIndex == null) {
      log('Select a unit in your hand first, then use Replace with pick.');
      return;
    }
    const hand = state.placementPlayer === 1 ? state.p1Hand : state.p2Hand;
    if (state.selectedPlacementIndex < 0 || state.selectedPlacementIndex >= hand.length) return;
    if (placementUnitPickSearchEl) {
      placementUnitPickSearchEl.value = '';
      placementUnitPickSearchEl.focus();
    }
    renderPlacementUnitPickList('');
    placementUnitPickWrapEl.removeAttribute('hidden');
  }

  function closePlacementUnitPickList() {
    if (placementUnitPickWrapEl) placementUnitPickWrapEl.setAttribute('hidden', '');
  }

  function applyPlacementUnitPick(unitName) {
    if (typeof CHARACTERS === 'undefined') return;
    const targetUnitObj = CHARACTERS.find(function (u) { return u.name === unitName; });
    if (!targetUnitObj) return;
    const player = state.placementPlayer;
    const idx = state.selectedPlacementIndex;
    if (idx == null) return;
    replacePlacementHandSlotWithUnit(player, idx, targetUnitObj);
    closePlacementUnitPickList();
    renderPlacementStep();
    renderBoard();
  }

  function unitMatchesPlacementFilter(unit, queryLower) {
    if (!queryLower) return true;
    const parts = [
      unit.name || '',
      unit.class || '',
      unit.level || '',
      unit.veteranBuff || '',
    ];
    const hay = parts.join(' ').toLowerCase();
    return hay.indexOf(queryLower) !== -1;
  }

  function renderPlacementStep() {
    const player = state.placementPlayer;
    const hand = player === 1 ? state.p1Hand : state.p2Hand;
    placeTitle.textContent = 'Player ' + player + ': Place your units';
    placeHint.textContent = 'Filter or use Replace with pick for the full roster, select a unit, then place on your row.';
    placementHand.innerHTML = '';
    const q = placementHandFilterEl ? placementHandFilterEl.value.trim().toLowerCase() : '';
    if (state.selectedPlacementIndex != null) {
      const sel = hand[state.selectedPlacementIndex];
      if (!sel || !unitMatchesPlacementFilter(sel, q)) state.selectedPlacementIndex = null;
    }
    let anyVisible = false;
    hand.forEach(function (unit, index) {
      if (!unitMatchesPlacementFilter(unit, q)) return;
      anyVisible = true;
      const div = document.createElement('div');
      div.className = 'hand-card' + (state.selectedPlacementIndex === index ? ' hand-card--selected' : '');
      div.setAttribute('role', 'listitem');
      div.dataset.placementIndex = String(index);
      div.innerHTML = createUnitCardHTML(unit, { faceUp: true, damage: 0, paralyzed: false });
      placementHand.appendChild(div);
    });
    if (!anyVisible && hand.length > 0) {
      const empty = document.createElement('p');
      empty.className = 'setup__hand--empty-filter';
      empty.setAttribute('role', 'status');
      empty.textContent = 'No units match your filter.';
      placementHand.appendChild(empty);
    }
  }

  function placeUnit(player, slotIndex) {
    const hand = player === 1 ? state.p1Hand : state.p2Hand;
    const idx = state.selectedPlacementIndex;
    if (idx == null || idx < 0 || idx >= hand.length) return;
    const unit = hand[idx];
    state.board[player][slotIndex] = { unit: unit, faceUp: false, damage: 0, paralyzed: false, gear: null, veteranState: {} };
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
      state.board[player][slot] = { unit: shuffled[i], faceUp: false, damage: 0, paralyzed: false, gear: null, veteranState: {} };
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
      if (placementHandFilterEl) placementHandFilterEl.value = '';
      closePlacementUnitPickList();
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
      state.unitDiscard = [];
      state.terrain = { 1: [null, null, null, null, null], 2: [null, null, null, null, null] };
      state.p1Captures = 0;
      state.p2Captures = 0;
      state.actionStep = 'use_items';
      state.selectedUnit = null;
      state.moveDone = false;
      state.itemTargeting = null;
      state.vorpalNextAttack = null;
      turnBanner.hidden = false;
      if (itemHandsP1El) itemHandsP1El.hidden = false;
      if (itemHandsP2El) itemHandsP2El.hidden = false;
      if (discardPileEl) discardPileEl.hidden = false;
      if (unitsDiscardPileEl) unitsDiscardPileEl.hidden = false;
      if (gameLogEl) gameLogEl.hidden = false;
      gameLogEntries.innerHTML = '';
      renderScoreMarkers();
      startOfTurn();
    }
  }

  function startOfTurn() {
    const p = state.currentPlayer;
    state.actionStep = 'use_items';
    state.selectedUnit = null;
    state.moveDone = false;
    state.itemTargeting = null;
    refreshCassaCooldownForTurn(p);
    refreshSenyaCooldownForTurn(p);

    for (let c = 0; c < 5; c++) {
      const cell = state.board[p][c];
      if (cell) cell.mustRestNextTurn = false;
    }

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
    animateCardIntoHand(p);
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
      state.board[player][slot] = { unit: unit, faceUp: false, damage: 0, paralyzed: false, gear: null, veteranState: {} };
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
    renderScoreMarkers();
  }

  /** Animate the last card in the given player's item hand (e.g. after draw). Uses GSAP if available. */
  function animateCardIntoHand(player) {
    const listEl = player === 1 ? itemHandP1El : itemHandP2El;
    if (!listEl || typeof window.gsap !== 'function') return;
    const cards = listEl.querySelectorAll('.item-card');
    const last = cards[cards.length - 1];
    if (!last) return;
    window.gsap.fromTo(last, { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.2)' });
  }

  function renderScoreMarkers() {
    const goal = state.captureGoal || 15;
    const p1 = state.p1Captures || 0;
    const p2 = state.p2Captures || 0;
    if (scoreMarkersP1El) {
      scoreMarkersP1El.innerHTML = '';
      for (let i = 0; i < goal; i++) {
        const dot = document.createElement('span');
        dot.className = 'score-markers__dot' + (i < p1 ? ' score-markers__dot--filled' : '');
        dot.setAttribute('aria-hidden', 'true');
        scoreMarkersP1El.appendChild(dot);
      }
    }
    if (scoreMarkersP2El) {
      scoreMarkersP2El.innerHTML = '';
      for (let i = 0; i < goal; i++) {
        const dot = document.createElement('span');
        dot.className = 'score-markers__dot' + (i < p2 ? ' score-markers__dot--filled' : '');
        dot.setAttribute('aria-hidden', 'true');
        scoreMarkersP2El.appendChild(dot);
      }
    }
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

    function primaryLabelForItem(spec, itemName) {
      if (!spec) return 'Use';
      if (typeof TERRAIN_ITEM_NAMES !== 'undefined' && spec.type === 'terrain' && TERRAIN_ITEM_NAMES.indexOf(itemName) !== -1) return 'Build';
      if (spec.type === 'gear_armor' || spec.type === 'gear_accessory' || spec.type === 'promotion') return 'Equip';
      return 'Use';
    }

    function buildItemCard(item, index, isCurrentPlayer) {
      const el = document.createElement('div');
      el.className = 'item-card';
      el.setAttribute('role', 'listitem');
      el.dataset.itemIndex = String(index);
      el.dataset.itemName = item.name;
      el.dataset.player = '1';

      const face = document.createElement('div');
      face.className = 'item-card__face';

      const img = document.createElement('img');
      img.className = 'item-card-img';
      img.src = getItemCardImagePath(item.name);
      img.alt = '';
      img.setAttribute('role', 'presentation');
      img.onerror = function () { this.src = 'assets/items/item-placeholder-for-dev.png'; };
      face.appendChild(img);

      const nameSpan = document.createElement('span');
      nameSpan.className = 'item-card__name';
      nameSpan.textContent = item.name;
      face.appendChild(nameSpan);

      const actions = document.createElement('div');
      actions.className = 'item-card__actions';

      const seeBtn = document.createElement('button');
      seeBtn.type = 'button';
      seeBtn.className = 'item-card__see btn btn--small';
      seeBtn.textContent = 'See';
      seeBtn.dataset.itemName = item.name;
      actions.appendChild(seeBtn);

      const spec = typeof ITEM_SPECS !== 'undefined' && ITEM_SPECS[item.name];

      if (isCurrentPlayer && isUseItems && spec && spec.type === 'single_use' && canPlaySingleUse(item.name)) {
        const useBtn = document.createElement('button');
        useBtn.type = 'button';
        useBtn.className = 'item-card__use btn btn--small';
        useBtn.textContent = primaryLabelForItem(spec, item.name);
        useBtn.dataset.itemIndex = String(index);
        useBtn.dataset.itemName = item.name;
        actions.appendChild(useBtn);
      }
      if (isCurrentPlayer && isUseItems && spec && (spec.type === 'gear_armor' || spec.type === 'gear_accessory' || spec.type === 'promotion') && canPlayGear(item.name)) {
        const useBtn = document.createElement('button');
        useBtn.type = 'button';
        useBtn.className = 'item-card__use btn btn--small';
        useBtn.textContent = primaryLabelForItem(spec, item.name);
        useBtn.dataset.itemIndex = String(index);
        useBtn.dataset.itemName = item.name;
        actions.appendChild(useBtn);
      }
      if (isCurrentPlayer && isUseItems && typeof TERRAIN_ITEM_NAMES !== 'undefined' && TERRAIN_ITEM_NAMES.indexOf(item.name) !== -1 && countEmptyTerrainSlots() > 0) {
        const useBtn = document.createElement('button');
        useBtn.type = 'button';
        useBtn.className = 'item-card__use btn btn--small';
        useBtn.textContent = primaryLabelForItem(spec, item.name);
        useBtn.dataset.itemIndex = String(index);
        useBtn.dataset.itemName = item.name;
        actions.appendChild(useBtn);
      }
      if (isCurrentPlayer && isUseItems && item.name === 'Tectonic Spike' && countTilesWithTerrain() > 0) {
        const useBtn = document.createElement('button');
        useBtn.type = 'button';
        useBtn.className = 'item-card__use btn btn--small';
        useBtn.textContent = primaryLabelForItem(spec, item.name);
        useBtn.dataset.itemIndex = String(index);
        useBtn.dataset.itemName = item.name;
        actions.appendChild(useBtn);
      }

      el.appendChild(face);
      el.appendChild(actions);

      if (el.querySelector('.item-card__use')) {
        el.classList.add('item-card--playable');
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
    btnMoveLeft.hidden = true;
    btnMoveRight.hidden = true;
    btnSkipMove.hidden = true;
    if (contextualMoveControls) {
      contextualMoveControls.hidden = true;
      contextualMoveControls.classList.remove('contextual-move-controls--above', 'contextual-move-controls--below');
    }

    if (state.pendingWardstone) {
      turnStep.textContent = "Use Wardstone to negate this attack?";
      turnActions.hidden = false;
      if (btnWardstoneUse) btnWardstoneUse.hidden = false;
      if (btnWardstoneNo) btnWardstoneNo.hidden = false;
      if (btnWardstoneUse) btnWardstoneUse.textContent = 'Use Wardstone';
      if (btnWardstoneNo) btnWardstoneNo.textContent = 'No';
      return;
    }
    if (state.pendingVeteranPrompt) {
      const pv = state.pendingVeteranPrompt;
      turnStep.textContent = pv.message || 'Use veteran effect?';
      turnActions.hidden = false;
      if (btnWardstoneUse) {
        btnWardstoneUse.hidden = false;
        btnWardstoneUse.textContent = pv.useLabel || 'Use';
      }
      if (btnWardstoneNo) {
        btnWardstoneNo.hidden = false;
        btnWardstoneNo.textContent = pv.noLabel || 'No';
      }
      return;
    }
    if (state.pendingCassaChoice) {
      turnStep.textContent = "Cassa's Twin Arc: choose the second target.";
      return;
    }
    if (state.pendingChronirChoice) {
      turnStep.textContent = "Chronir's Frozen Chain: choose an adjacent enemy to paralyze.";
      return;
    }

    if (step === 'use_items') {
      if (state.obscuringReorder) {
        turnStep.textContent = 'Reorder your units: click one slot, then another to swap. Then click Done reordering.';
        turnActions.hidden = false;
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
        if (btnPass) btnPass.hidden = true;
        if (btnDoneWithItems) btnDoneWithItems.textContent = state.itemTargeting ? 'Cancel' : 'Done with items';
        if (btnDoneWithItems) btnDoneWithItems.hidden = false;
      }
    } else if (step === 'select_unit') {
      turnStep.textContent = 'Select a unit to act.';
    } else if (step === 'move') {
      turnStep.textContent = 'Move (optional), then attack.';
      const c = state.selectedUnit.column;
      btnMoveLeft.disabled = c <= 0 || state.board[p][c - 1] == null;
      btnMoveRight.disabled = c >= 4 || state.board[p][c + 1] == null;
      btnMoveLeft.hidden = false;
      btnMoveRight.hidden = false;
      btnSkipMove.hidden = false;
      if (contextualMoveControls) {
        contextualMoveControls.hidden = false;
        positionContextualMoveControls();
        requestAnimationFrame(function () {
          positionContextualMoveControls();
        });
      }
    } else if (step === 'attack') {
      const canAtt = state.selectedUnit && canAttack(state.selectedUnit.player, state.selectedUnit.column);
      if (canAtt) {
        turnStep.textContent = 'Choose an enemy unit to attack.';
      } else {
        turnStep.textContent = 'No valid target — you may pass.';
        turnActions.hidden = false;
        if (btnPass) btnPass.hidden = false;
      }
    }
  }

  function positionContextualMoveControls() {
    if (!contextualMoveControls || contextualMoveControls.hidden || !state.selectedUnit || !boardCenterEl) return;
    const p = state.selectedUnit.player;
    const c = state.selectedUnit.column;
    const selectedSlot = document.querySelector('.row--player' + p + ' .slot[data-column="' + c + '"]');
    if (!selectedSlot) return;

    const centerRect = boardCenterEl.getBoundingClientRect();
    const slotRect = selectedSlot.getBoundingClientRect();
    const boardRect = boardEl ? boardEl.getBoundingClientRect() : centerRect;

    const isCompactViewport = window.matchMedia('(max-width: 700px)').matches;
    const controlsWidth = contextualMoveControls.offsetWidth || 220;
    const controlsHeight = contextualMoveControls.offsetHeight || 40;
    const horizontalPad = 10;
    let desiredCenterX = slotRect.left - centerRect.left + (slotRect.width / 2);
    if (isCompactViewport) desiredCenterX = centerRect.width / 2;
    /* Position by left edge (not transform-centered) so width:max-content is not squeezed at the board edge */
    let leftEdge = desiredCenterX - controlsWidth / 2;
    const maxLeft = centerRect.width - horizontalPad - controlsWidth;
    const minLeft = horizontalPad;
    leftEdge = Math.max(minLeft, Math.min(maxLeft, leftEdge));

    let topPx;
    contextualMoveControls.classList.remove('contextual-move-controls--above', 'contextual-move-controls--below');
    if (p === 1) {
      contextualMoveControls.classList.add('contextual-move-controls--above');
      topPx = isCompactViewport
        ? (boardRect.top - centerRect.top - controlsHeight - 8)
        : (slotRect.top - centerRect.top - controlsHeight - 10);
    } else {
      contextualMoveControls.classList.add('contextual-move-controls--below');
      topPx = isCompactViewport
        ? (boardRect.bottom - centerRect.top + 8)
        : (slotRect.bottom - centerRect.top + 10);
    }

    const minTop = 2;
    const maxTop = centerRect.height - controlsHeight - 2;
    const clampedTop = Math.max(minTop, Math.min(maxTop, topPx));
    contextualMoveControls.style.transform = 'none';
    contextualMoveControls.style.left = leftEdge + 'px';
    contextualMoveControls.style.top = clampedTop + 'px';
  }

  function onSelectUnit(player, column) {
    const cell = state.board[player][column];
    if (!cell || cell.paralyzed || cell.cannotAttackNextTurn || cell.mustRestNextTurn) return;
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

    state.board[p][c] = { unit: otherCell.unit, faceUp: otherCell.faceUp, damage: otherCell.damage || 0, paralyzed: otherCell.paralyzed || false, cannotAttackNextTurn: otherCell.cannotAttackNextTurn || false, gear: otherCell.gear || null, veteranState: otherCell.veteranState || {} };
    state.board[p][next] = { unit: myCell.unit, faceUp: true, damage: myCell.damage || 0, paralyzed: myCell.paralyzed || false, cannotAttackNextTurn: myCell.cannotAttackNextTurn || false, mustRestNextTurn: myCell.mustRestNextTurn || false, nextAttackAsCaster: myCell.nextAttackAsCaster || false, gear: myCell.gear || null, veteranState: myCell.veteranState || {} };
    state.selectedUnit.column = next;
    state.moveDone = true;
    state.actionStep = 'attack';
    if (getTerrain(p, c) === 'Divine Light' && state.board[p][c]) state.board[p][c].faceUp = true;
    if (getTerrain(p, next) === 'Divine Light' && state.board[p][next]) state.board[p][next].faceUp = true;
    if (maybeTriggerVaelaFrontStrike(p, next)) return;
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
      state.board[p][toCol] = { unit: myCell.unit, faceUp: true, damage: myCell.damage || 0, paralyzed: myCell.paralyzed || false, cannotAttackNextTurn: myCell.cannotAttackNextTurn || false, mustRestNextTurn: myCell.mustRestNextTurn || false, nextAttackAsCaster: myCell.nextAttackAsCaster || false, gear: myCell.gear || null, veteranState: myCell.veteranState || {} };
      state.board[p][fromCol] = null;
      if (getTerrain(p, toCol) === 'Divine Light') state.board[p][toCol].faceUp = true;
      log("Player " + p + "'s " + myCell.unit.name + " teleports to column " + toCol + ".");
    } else {
      state.board[p][fromCol] = { unit: targetCell.unit, faceUp: targetCell.faceUp, damage: targetCell.damage || 0, paralyzed: targetCell.paralyzed || false, cannotAttackNextTurn: targetCell.cannotAttackNextTurn || false, gear: targetCell.gear || null, veteranState: targetCell.veteranState || {} };
      state.board[p][toCol] = { unit: myCell.unit, faceUp: true, damage: myCell.damage || 0, paralyzed: myCell.paralyzed || false, cannotAttackNextTurn: myCell.cannotAttackNextTurn || false, mustRestNextTurn: myCell.mustRestNextTurn || false, nextAttackAsCaster: myCell.nextAttackAsCaster || false, gear: myCell.gear || null, veteranState: myCell.veteranState || {} };
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
    if (maybeTriggerVaelaFrontStrike(p, toCol)) return;
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
    if (state.pendingVeteranPrompt) {
      doVeteranPromptUse();
      return;
    }
    if (!state.pendingWardstone) return;
    const pw = state.pendingWardstone;
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
    log("Player " + state.pendingWardstone.defPlayer + " uses Wardstone Bracelet — attack negated for this unit.");
    state.pendingWardstone = null;
    if (state.archmageMultiResolving) {
      state.archmageMultiResolving.index++;
      continueArchmageMulti();
    } else {
      if (runPendingCassaSecondAttackIfAvailable()) return;
      if (queueTivalRetryPrompt(pw.attPlayer, pw.attCol, pw.defPlayer, pw.defCol, "attack was negated by Wardstone")) {
        renderTurnUI();
        renderBoard();
        return;
      }
      state.selectedUnit = null;
      state.actionStep = 'select_unit';
      renderTurnUI();
      renderBoard();
      endTurn();
    }
  }

  function doWardstoneNo() {
    if (state.pendingVeteranPrompt) {
      doVeteranPromptNo();
      return;
    }
    if (!state.pendingWardstone) return;
    const pw = state.pendingWardstone;
    state.pendingWardstone = null;
    if (state.archmageMultiResolving) {
      const hitCol = maybeRedirectToHarlund(pw.defPlayer, pw.defCol, state.archmageMultiResolving);
      applyDamage(pw.defPlayer, hitCol, 1, "");
      if (state.board[pw.defPlayer][hitCol]) {
        state.board[pw.defPlayer][hitCol].paralyzed = true;
        log(state.board[pw.defPlayer][hitCol].unit.name + " is paralyzed (Magic Paralysis).");
      }
      state.archmageMultiResolving.index++;
      continueArchmageMulti();
    } else {
      resolveCombat(pw.attPlayer, pw.attCol, pw.defPlayer, pw.defCol);
    }
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
      if (!state.unitDiscard) state.unitDiscard = [];
      state.unitDiscard.push(cell.unit);
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

  function resolveCombat(attackerPlayer, attackerCol, defenderPlayer, defenderCol, options) {
    const attCell = state.board[attackerPlayer][attackerCol];
    const defCell = state.board[defenderPlayer][defenderCol];
    if (!attCell || !defCell) return;
    markJorrenAttackThisTurn(attCell);

    const effectiveClass = getEffectiveAttackerClass(attCell);
    const attackContext = { harlundUsed: false, harlundDeclineLogged: false, harlundPromptResolved: false, harlundDecision: 'no' };
    const vorpalPacket = (state.vorpalNextAttack === attackerPlayer);
    const trueStrike = vorpalPacket ||
      (attCell.gear && attCell.gear.name === 'True-Strike Lens' && (attCell.unit.class === 'Shooter' || attCell.unit.class === 'Caster')) ||
      (attCell.gear && attCell.gear.name === "Sharpshooter's Scope" && attCell.unit.class === 'Shooter');

    log("Player " + attackerPlayer + "'s " + attCell.unit.name + " attacks (target in column " + defenderCol + ").");
    if (trueStrike) {
      log("True strike — attack ignores terrain and Lancer counters.");
    }

    if (!trueStrike && getTerrain(attackerPlayer, attackerCol) === 'Unstable Ground') {
      const heads = Math.random() < 0.5;
      if (!heads) {
        log("Unstable Ground (attacker's tile): tails — attack canceled.");
        if (state.pendingCassaSecondAttack && !state.cassaSecondAttackInProgress) state.pendingCassaSecondAttack = null;
        state.pendingCassaOpportunity = null;
        if (queueTivalRetryPrompt(attackerPlayer, attackerCol, defenderPlayer, defenderCol, "attack was canceled by Unstable Ground")) {
          renderTurnUI();
          renderBoard();
          return;
        }
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
    let tivalFailureReason = null;

    if (!trueStrike) {
      const braskinProtected = attackerIsProtectedByBraskin(attackerPlayer, attackerCol);
      if (braskinProtected) {
        log("Braskin's Uncanny Block — this attack cannot be countered by enemy Lancers.");
      } else {
        const candidates = [];
        for (let c = 0; c < 5; c++) {
          const cell = state.board[defenderPlayer][c];
          if (!cell || cell.unit.class !== 'Lancer' || cell.cannotAttackNextTurn) continue;
          if (!isCounterRangeForLancerCell(attackerCol, c, cell)) continue;
          const guarantee = getCounterGuaranteeInfo(defenderPlayer, c, cell);
          candidates.push({ col: c, guarantee: guarantee });
        }

        if (candidates.length > 0) {
          let selected = null;
          for (let i = 0; i < candidates.length; i++) {
            if (candidates[i].guarantee.guaranteed) {
              selected = candidates[i];
              break;
            }
          }
          if (!selected) selected = candidates[0];

          const lancerCol = selected.col;
          const lancerCell = state.board[defenderPlayer][lancerCol];
          if (lancerCell) {
            const guarantee = selected.guarantee;
            lancerCell.faceUp = true;
            log(lancerCell.unit.name + " (Lancer) is in counter range — counterattack attempt (target not revealed).");

            if (guarantee.revealCol !== null) {
              const allyCell = state.board[defenderPlayer][guarantee.revealCol];
              if (allyCell && !allyCell.faceUp) {
                allyCell.faceUp = true;
                log("Rowka's Twin Guard reveals " + allyCell.unit.name + ".");
              }
            }

            if (getTerrain(defenderPlayer, lancerCol) === 'Unstable Ground') {
              const unstableHeads = Math.random() < 0.5;
              if (!unstableHeads) {
                log("Unstable Ground (Lancer's tile): tails — counter canceled.");
              } else {
                log("Unstable Ground (Lancer's tile): heads — counter attempt proceeds.");
                const counterHeads = guarantee.guaranteed ? true : (Math.random() < 0.5);
                if (guarantee.guaranteed && guarantee.reason === 'rowka') {
                  log("Rowka's Twin Guard — counter is guaranteed.");
                } else if (guarantee.guaranteed && guarantee.reason === 'nyss') {
                  log("Nyss's Phantom Posture — face-down counter is guaranteed.");
                }
                if (counterHeads) {
                  log("Lancer counterattack: heads — attack blocked, " + lancerCell.unit.name + " hits back for 1 HP.");
                  attackBlocked = true;
                  tivalFailureReason = "attack was blocked by a Lancer counter";
                  applyDamage(attackerPlayer, attackerCol, 1, "");
                  resolveKeeraCounterExtra(defenderPlayer, lancerCol, attackerPlayer, attackerCol);
                } else {
                  log("Lancer counterattack: tails — no counter. " + lancerCell.unit.name + " remains revealed.");
                }
              }
            } else {
              const counterHeads = guarantee.guaranteed ? true : (Math.random() < 0.5);
              if (guarantee.guaranteed && guarantee.reason === 'rowka') {
                log("Rowka's Twin Guard — counter is guaranteed.");
              } else if (guarantee.guaranteed && guarantee.reason === 'nyss') {
                log("Nyss's Phantom Posture — face-down counter is guaranteed.");
              }
              if (counterHeads) {
                log("Lancer counterattack: heads — attack blocked, " + lancerCell.unit.name + " hits back for 1 HP.");
                attackBlocked = true;
                tivalFailureReason = "attack was blocked by a Lancer counter";
                applyDamage(attackerPlayer, attackerCol, 1, "");
                resolveKeeraCounterExtra(defenderPlayer, lancerCol, attackerPlayer, attackerCol);
              } else {
                log("Lancer counterattack: tails — no counter. " + lancerCell.unit.name + " remains revealed.");
              }
            }
          }
        }
      }
    }

    var defenderHadBarbedGauntlets = false;
    var attClassForBarbed = null;
    var attackHitDefender = false;
    var attackAppliedToUnit = false;
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
            tivalFailureReason = "attack failed against Elevated Ground";
          } else {
            log("Elevated Ground: tails — attack proceeds.");
          }
        } else if (defTerrain === 'Reinforced Barricade' && (effectiveClass === 'Shooter' || effectiveClass === 'Caster')) {
          const heads = Math.random() < 0.5;
          if (heads) {
            log("Reinforced Barricade: heads — attack fails.");
            defenderTerrainBlocked = true;
            tivalFailureReason = "attack failed against Reinforced Barricade";
          } else {
            log("Reinforced Barricade: tails — attack proceeds.");
          }
        }
      }

      if (!defenderTerrainBlocked) {
        const vorpalLethal = vorpalPacket;
        const archmageMulti = effectiveClass === 'Caster' && attCell.unit.class === 'Caster' && attCell.gear && attCell.gear.name === "Archmage's Tome" && !attCell.nextAttackAsCaster;
        maybeApplyTorraGearBreak(attCell, defenderPlayer, defenderCol);
        const shooterLongshot = (effectiveClass === 'Shooter' && isLongshot(attackerCol, defenderCol));
        let damage = shooterLongshot
          ? 2
          : 1;
        damage += getRokkloDamageBonus(attCell);
        damage += getJorrenDamageBonus(attCell);
        if (vorpalLethal) {
          damage = Math.max(1, getMaxHP(defCell) - (defCell.damage || 0));
          log("Vorpal Honing Amulet — lethal strike (" + damage + " damage).");
        } else if (shooterLongshot) {
          log("Longshot (edge to edge): 2 damage.");
        }
        if (archmageMulti) {
          log("Archmage's Tome — attack affects target and adjacent enemies.");
          const cols = [defenderCol, defenderCol - 1, defenderCol + 1].filter(function (c) { return c >= 0 && c <= 4; });
          state.archmageMultiResolving = {
            attPlayer: attackerPlayer,
            attCol: attackerCol,
            defPlayer: defenderPlayer,
            cols: cols,
            index: 0,
            trueStrike: trueStrike,
            harlundUsed: false,
            harlundDeclineLogged: false,
            harlundPromptResolved: false,
            harlundDecision: 'no',
            protectedCol: null
          };
          continueArchmageMulti();
          return;
        } else {
          if (hasAdjacentHarlundForTarget(defenderPlayer, defenderCol)) {
            state.pendingVeteranPrompt = {
              type: 'harlundOnHitSingle',
              message: "Harlund's Pack Shield: adjacent ally is about to be hit. Swap Harlund in?",
              useLabel: 'Use Pack Shield',
              noLabel: 'No',
              attPlayer: attackerPlayer,
              attCol: attackerCol,
              defPlayer: defenderPlayer,
              defCol: defenderCol,
              effectiveClass: effectiveClass,
              damage: damage,
              defenderHadBarbedGauntlets: defHasBarbed,
              attClassForBarbed: attCell.unit.class,
            };
            renderTurnUI();
            renderBoard();
            return;
          }
          const hitCol = maybeRedirectToHarlund(defenderPlayer, defenderCol, attackContext);
          const packet = resolveDefenderVeteranPacket(attackerPlayer, attackerCol, defenderPlayer, hitCol, { vorpalIgnoresDefenderVeterancy: vorpalPacket });
          if (packet.canceled) {
            attackHitDefender = false;
            if (packet.tivalFailureReason) tivalFailureReason = packet.tivalFailureReason;
          } else {
            const finalPlayer = packet.finalPlayer;
            const finalCol = packet.finalCol;
            const finalTargetCell = state.board[finalPlayer][finalCol];
            defenderHadBarbedGauntlets = !!(finalTargetCell && finalTargetCell.gear && finalTargetCell.gear.name === 'Barbed Gauntlets');
            attClassForBarbed = attCell.unit.class;
            attackAppliedToUnit = true;
            attackHitDefender = packet.landedOnOriginalTarget;
            if (!packet.landedOnOriginalTarget && packet.tivalFailureReason) {
              tivalFailureReason = packet.tivalFailureReason;
            }
            const captured = applyDamage(finalPlayer, finalCol, damage, "");
            if (!captured && state.board[finalPlayer][finalCol] && effectiveClass === 'Caster') {
              state.board[finalPlayer][finalCol].paralyzed = true;
              log(state.board[finalPlayer][finalCol].unit.name + " is paralyzed (Magic Paralysis).");
            }
            maybeApplyHaskelSteal(attCell, attackerPlayer, defenderPlayer);
            maybeApplyLyraEcho(attCell, attackerCol, finalPlayer, finalCol);
            maybeApplySolomonFrontParalyze(attCell, attackerCol, defenderPlayer);
            maybeApplyChronirAdjacentParalyze(attCell, finalPlayer, finalCol);
            maybeApplyGrolkCaptureHeal(attCell, attackerPlayer, attackerCol, captured);
          }
        }
      }
    }

    const attCellAfter = state.board[attackerPlayer][attackerCol];
    if (attCellAfter && attCellAfter.nextAttackAsCaster) {
      attCellAfter.nextAttackAsCaster = false;
    }

    if (attackAppliedToUnit && defenderHadBarbedGauntlets && (attClassForBarbed === 'Brawler' || attClassForBarbed === 'Lancer')) {
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

    if (state.pendingChronirChoice) {
      renderTurnUI();
      renderBoard();
      return;
    }
    if (queueCassaUsePromptIfReady(attackerPlayer, attackerCol, defenderPlayer, defenderCol)) {
      renderTurnUI();
      renderBoard();
      return;
    }
    if (runPendingCassaSecondAttackIfAvailable()) return;
    if (!attackHitDefender && tivalFailureReason) {
      if (queueTivalRetryPrompt(attackerPlayer, attackerCol, defenderPlayer, defenderCol, tivalFailureReason)) {
        renderTurnUI();
        renderBoard();
        return;
      }
    }
    finishResolvedCombatTurn();
  }

  function continueArchmageMulti() {
    const ar = state.archmageMultiResolving;
    if (!ar) return;
    while (ar.index < ar.cols.length) {
      const c = ar.cols[ar.index];
      const targetCell = state.board[ar.defPlayer][c];
      if (!targetCell) {
        ar.index++;
        continue;
      }
      targetCell.faceUp = true;
      if (!ar.trueStrike) {
        const ter = getTerrain(ar.defPlayer, c);
        if (ter === 'Reinforced Barricade') {
          const heads = Math.random() < 0.5;
          if (heads) {
            log("Reinforced Barricade (column " + c + "): heads — Archmage's Tome hit fails for this unit.");
            ar.index++;
            continue;
          }
          log("Reinforced Barricade (column " + c + "): tails — hit proceeds.");
        }
      }
      if (targetCell.gear && targetCell.gear.name === 'Wardstone Bracelet') {
        state.pendingWardstone = { attPlayer: ar.attPlayer, attCol: ar.attCol, defPlayer: ar.defPlayer, defCol: c };
        renderTurnUI();
        renderBoard();
        return;
      }
      if (!ar.harlundPromptResolved && hasAdjacentHarlundForTarget(ar.defPlayer, c)) {
        state.pendingVeteranPrompt = {
          type: 'harlundOnHitArchmage',
          message: "Harlund's Pack Shield: adjacent ally is about to be hit by Archmage's Tome. Swap Harlund in?",
          useLabel: 'Use Pack Shield',
          noLabel: 'No',
        };
        renderTurnUI();
        renderBoard();
        return;
      }
      const hitCol = maybeRedirectToHarlund(ar.defPlayer, c, ar);
      if (hitCol == null) {
        log("Harlund's Pack Shield — protected ally ignores the rest of this attack sequence.");
        ar.index++;
        continue;
      }
      const packet = resolveDefenderVeteranPacket(ar.attPlayer, ar.attCol, ar.defPlayer, hitCol, { vorpalIgnoresDefenderVeterancy: ar.trueStrike && state.vorpalNextAttack === ar.attPlayer });
      if (packet.canceled) {
        ar.index++;
        continue;
      }
      applyDamage(packet.finalPlayer, packet.finalCol, 1, "");
      if (state.board[packet.finalPlayer][packet.finalCol]) {
        state.board[packet.finalPlayer][packet.finalCol].paralyzed = true;
        log(state.board[packet.finalPlayer][packet.finalCol].unit.name + " is paralyzed (Magic Paralysis).");
      }
      ar.index++;
    }
    finishArchmageMulti();
  }

  function finishArchmageMulti() {
    const ar = state.archmageMultiResolving;
    if (!ar) return;
    state.archmageMultiResolving = null;
    const attCellAfter = state.board[ar.attPlayer][ar.attCol];
    if (attCellAfter) attCellAfter.mustRestNextTurn = true;
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
    updateJorrenFlagsAtTurnEnd(playerWhoJustFinished);
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

    if (state.pendingCassaChoice) {
      const pendingCassa = state.pendingCassaChoice;
      if (player !== pendingCassa.defPlayer) return;
      if (pendingCassa.targetCols.indexOf(column) === -1) return;
      resolvePendingCassaChoice(column);
      return;
    }

    if (state.pendingChronirChoice) {
      const pending = state.pendingChronirChoice;
      if (player !== pending.defenderPlayer) return;
      if (pending.targetCols.indexOf(column) === -1) return;
      resolvePendingChronirChoice(column);
      return;
    }

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
        if (attCell && isInRangeWithCell(state.selectedUnit.column, column, attCell)) {
          prepareCassaTwinArcOpportunity(p, state.selectedUnit.column, opp, column);
          beginAttackAgainstTarget(p, state.selectedUnit.column, opp, column);
        }
      }
      return;
    }
  }

  function handleItemHandClick(e) {
    const seeBtn = e.target.closest('.item-card__see');
    if (seeBtn && state.phase === 'playing') {
      const card = e.target.closest('.item-card');
      if (card && card.dataset.itemName) {
        e.preventDefault();
        openItemZoom(card.dataset.itemName);
      }
      return;
    }
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
      const gearPlayable = spec && (spec.type === 'gear_armor' || spec.type === 'gear_accessory' || spec.type === 'promotion') && countValidGearTargets(itemName) > 0;
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

    if (btnPlacementReplaceWithPick) {
      btnPlacementReplaceWithPick.addEventListener('click', function () {
        openPlacementUnitPickList();
      });
    }
    if (btnPlacementUnitPickClose) {
      btnPlacementUnitPickClose.addEventListener('click', function (e) {
        e.stopPropagation();
        closePlacementUnitPickList();
      });
    }
    if (placementUnitPickListEl) {
      placementUnitPickListEl.addEventListener('click', function (e) {
        const btn = e.target.closest('.setup__placement-unit-pick-btn');
        if (btn && btn.dataset.unitName) applyPlacementUnitPick(btn.dataset.unitName);
      });
    }
    if (placementUnitPickSearchEl) {
      placementUnitPickSearchEl.addEventListener('input', function () {
        renderPlacementUnitPickList(placementUnitPickSearchEl.value);
      });
    }

    btnMoveLeft.addEventListener('click', function () { if (!state.gameOver) doMove('left'); });
    btnMoveRight.addEventListener('click', function () { if (!state.gameOver) doMove('right'); });
    btnSkipMove.addEventListener('click', function () { if (!state.gameOver) doSkipMove(); });
    window.addEventListener('resize', function () {
      if (state.actionStep === 'move' && state.selectedUnit) positionContextualMoveControls();
    });
    if (btnPass) btnPass.addEventListener('click', function () { if (!state.gameOver) doPass(); });
    if (btnWardstoneUse) btnWardstoneUse.addEventListener('click', function () { if (!state.gameOver) doWardstoneUse(); });
    if (btnWardstoneNo) btnWardstoneNo.addEventListener('click', function () { if (!state.gameOver) doWardstoneNo(); });

    placementHand.addEventListener('click', handlePlacementHandClick);
    if (placementHandFilterEl) {
      placementHandFilterEl.addEventListener('input', function () {
        if (state.phase === 'setup_place_p1' || state.phase === 'setup_place_p2') renderPlacementStep();
      });
    }
    document.querySelector('.board').addEventListener('click', handleSlotClick);
    const boardContainer = document.getElementById('board-container');
    if (boardContainer) boardContainer.addEventListener('click', handleItemHandClick);
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
    if (btnItemDiscardOpen) {
      btnItemDiscardOpen.addEventListener('click', function () {
        openDiscardZoom('items');
      });
    }
    if (btnUnitDiscardOpen) {
      btnUnitDiscardOpen.addEventListener('click', function () {
        openDiscardZoom('units');
      });
    }
    if (btnDoneWithItems) btnDoneWithItems.addEventListener('click', function () { if (!state.gameOver) doDoneWithItems(); });

    if (btnDebugOpen && debugDrawerEl) {
      btnDebugOpen.addEventListener('click', function () {
        debugDrawerEl.setAttribute('aria-hidden', 'false');
        debugDrawerEl.classList.add('is-open');
      });
    }
    if (btnDebugClose && debugDrawerEl) {
      btnDebugClose.addEventListener('click', function () {
        debugDrawerEl.setAttribute('aria-hidden', 'true');
        debugDrawerEl.classList.remove('is-open');
      });
    }

    document.querySelector('.board').addEventListener('dblclick', function (e) {
      const slot = e.target.closest('.slot');
      if (!slot || state.phase !== 'playing') return;
      const player = parseInt(slot.getAttribute('data-player'), 10);
      const col = parseInt(slot.getAttribute('data-column'), 10);
      const cell = state.board[player][col];
      if (!cell) return;
      openUnitZoom(player, col);
    });

    if (unitZoomCloseBtn && unitZoomModal) {
      unitZoomCloseBtn.addEventListener('click', closeUnitZoom);
    }
    if (unitZoomBackdrop && unitZoomModal) {
      unitZoomBackdrop.addEventListener('click', closeUnitZoom);
    }
    if (discardZoomCloseBtn && discardZoomModal) {
      discardZoomCloseBtn.addEventListener('click', closeDiscardZoom);
    }
    if (discardZoomBackdrop && discardZoomModal) {
      discardZoomBackdrop.addEventListener('click', closeDiscardZoom);
    }
    if (itemZoomCloseBtn && itemZoomModal) {
      itemZoomCloseBtn.addEventListener('click', closeItemZoom);
    }
    if (itemZoomBackdrop && itemZoomModal) {
      itemZoomBackdrop.addEventListener('click', closeItemZoom);
    }
  });

  function openUnitZoom(player, col) {
    const cell = state.board[player][col];
    if (!cell || !unitZoomModal) return;
    const unit = cell.unit;
    const unitImgWrap = document.getElementById('unit-zoom-unit');
    const gearImgWrap = document.getElementById('unit-zoom-gear');
    const terrainImgWrap = document.getElementById('unit-zoom-terrain');
    const markersEl = document.getElementById('unit-zoom-markers');
    if (!unitImgWrap || !markersEl) return;
    const unitSrc = getUnitCardImagePath(unit);
    unitImgWrap.innerHTML = '<img src="' + unitSrc + '" alt="' + (unit.name || 'Unit') + '" onerror="this.src=\'assets/units/unit-placeholder-for-dev.png\'">';
    markersEl.innerHTML = '';
    const maxHP = getMaxHP(cell);
    const dmg = cell.damage || 0;
    if (dmg > 0) {
      const m = document.createElement('span');
      m.className = 'marker marker--damage';
      m.textContent = dmg + '/' + maxHP + ' dmg';
      markersEl.appendChild(m);
    }
    if (cell.paralyzed) {
      const m = document.createElement('span');
      m.className = 'marker marker--paralyzed';
      m.textContent = 'Paralyzed';
      markersEl.appendChild(m);
    }
    if (cell.gear && gearImgWrap) {
      const gslug = (cell.gear.name || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      gearImgWrap.innerHTML = '<img src="assets/items/' + gslug + '.png" alt="' + (cell.gear.name || '') + '" onerror="this.src=\'assets/items/item-placeholder-for-dev.png\'">';
    } else if (gearImgWrap) gearImgWrap.innerHTML = '';
    const terr = state.terrain && state.terrain[player] && state.terrain[player][col];
    if (terr && terrainImgWrap) {
      const tslug = (terr.name || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      terrainImgWrap.innerHTML = '<img src="assets/items/' + tslug + '.png" alt="' + (terr.name || '') + '" onerror="this.src=\'assets/items/item-placeholder-for-dev.png\'">';
    } else if (terrainImgWrap) terrainImgWrap.innerHTML = '';
    unitZoomModal.hidden = false;
  }

  function closeUnitZoom() {
    if (unitZoomModal) unitZoomModal.hidden = true;
  }

  function openDiscardZoom(mode) {
    mode = mode || 'items';
    const grid = document.getElementById('discard-zoom-grid');
    const titleEl = document.getElementById('discard-zoom-title');
    if (!grid || !discardZoomModal || !titleEl) return;
    const list = mode === 'units' ? (state.unitDiscard || []) : (state.itemDiscard || []);
    grid.innerHTML = '';
    const ordered = list.slice().reverse();
    ordered.forEach(function (entry) {
      const div = document.createElement('div');
      div.className = 'card-thumb';
      if (mode === 'units') {
        const src = getUnitCardImagePath(entry);
        const name = entry.name || 'Unit';
        div.innerHTML = '<img src="' + src + '" alt="' + name + '" onerror="this.src=\'assets/units/unit-placeholder-for-dev.png\'">';
      } else {
        const src = getItemCardImagePath(entry.name);
        const name = entry.name || '';
        div.innerHTML = '<img src="' + src + '" alt="' + name + '" onerror="this.src=\'assets/items/item-placeholder-for-dev.png\'">';
      }
      grid.appendChild(div);
    });
    titleEl.textContent =
      mode === 'units' ? 'Unit discard (' + list.length + ')' : 'Item discard (' + list.length + ')';
    discardZoomModal.hidden = false;
  }

  function closeDiscardZoom() {
    if (discardZoomModal) discardZoomModal.hidden = true;
  }

  function openItemZoom(itemName) {
    if (!itemZoomModal || !itemZoomImgWrap || !itemZoomTitle) return;
    const spec = typeof ITEM_SPECS !== 'undefined' && ITEM_SPECS[itemName];
    itemZoomTitle.textContent = itemName || 'Item';
    itemZoomImgWrap.innerHTML = '';
    const zImg = document.createElement('img');
    zImg.src = getItemCardImagePath(itemName);
    zImg.alt = itemName || '';
    zImg.onerror = function () { this.src = 'assets/items/item-placeholder-for-dev.png'; };
    itemZoomImgWrap.appendChild(zImg);
    if (itemZoomEffect) {
      if (spec && spec.effect) {
        itemZoomEffect.textContent = spec.effect;
        itemZoomEffect.hidden = false;
      } else {
        itemZoomEffect.textContent = '';
        itemZoomEffect.hidden = true;
      }
    }
    itemZoomModal.hidden = false;
  }

  function closeItemZoom() {
    if (itemZoomModal) itemZoomModal.hidden = true;
  }
})();
