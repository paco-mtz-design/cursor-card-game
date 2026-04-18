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
  const setupBestiaryEnabledEl = document.getElementById('setup-bestiary-enabled');
  const setupModeEl = document.getElementById('setup-mode');
  const setupCpuCustomPlacementEl = document.getElementById('setup-cpu-custom-placement');
  const setupCpuDifficultyEl = document.getElementById('setup-cpu-difficulty');
  const btnNewGame = document.getElementById('btn-new-game');
  const btnBestiaryOpen = document.getElementById('btn-bestiary-open');
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
  const btnCpuContinue = document.getElementById('btn-cpu-continue');
  const btnSaveLog = document.getElementById('btn-save-log');
  const saveLogModal = document.getElementById('save-log-modal');
  const btnSaveLogAndNew = document.getElementById('btn-save-log-and-new');
  const btnSkipLogAndNew = document.getElementById('btn-skip-log-and-new');
  const btnCancelNewGame = document.getElementById('btn-cancel-new-game');
  const saveLogBackdrop = document.getElementById('save-log-backdrop');
  const debugDrawerEl = document.getElementById('debug-drawer');
  const btnDebugOpen = document.getElementById('btn-debug-open');
  const btnDebugClose = document.getElementById('btn-debug-close');
  const unitZoomModal = document.getElementById('unit-zoom-modal');
  const unitZoomCloseBtn = document.getElementById('unit-zoom-close');
  const unitZoomBackdrop = document.getElementById('unit-zoom-backdrop');
  const discardZoomModal = document.getElementById('discard-zoom-modal');
  const discardZoomCloseBtn = document.getElementById('discard-zoom-close');
  const discardZoomBackdrop = document.getElementById('discard-zoom-backdrop');
  const bestiaryModal = document.getElementById('bestiary-modal');
  const bestiaryBackdrop = document.getElementById('bestiary-backdrop');
  const bestiaryCloseBtn = document.getElementById('bestiary-close');
  const bestiaryGrid = document.getElementById('bestiary-grid');
  const bestiaryStatus = document.getElementById('bestiary-status');
  const bestiaryPrompt = document.getElementById('bestiary-prompt');
  const bestiaryPromptText = document.getElementById('bestiary-prompt-text');
  const btnBestiaryReveal = document.getElementById('btn-bestiary-reveal');
  const btnBestiaryContinue = document.getElementById('btn-bestiary-continue');
  const itemZoomModal = document.getElementById('item-zoom-modal');
  const itemZoomCloseBtn = document.getElementById('item-zoom-close');
  const itemZoomBackdrop = document.getElementById('item-zoom-backdrop');
  const itemZoomTitle = document.getElementById('item-zoom-title');
  const itemZoomImgWrap = document.getElementById('item-zoom-img-wrap');
  const itemZoomEffect = document.getElementById('item-zoom-effect');
  const scoreMarkersP1El = document.getElementById('score-markers-p1');
  const scoreMarkersP2El = document.getElementById('score-markers-p2');

  let state = getInitialState();

  function getHiddenCpuEntityNames() {
    const hiddenUnitNames = [];
    const hiddenUnitFirstNames = [];
    const cpuRow = state.board && state.board[2] ? state.board[2] : [];
    for (let c = 0; c < cpuRow.length; c++) {
      const cell = cpuRow[c];
      if (cell && !cell.faceUp && cell.unit && cell.unit.name) {
        hiddenUnitNames.push(cell.unit.name);
        const firstName = String(cell.unit.name).trim().split(/\s+/)[0];
        if (firstName) hiddenUnitFirstNames.push(firstName);
      }
    }
    const hiddenItemNames = [];
    const cpuItemHand = state.p2ItemHand || [];
    for (let i = 0; i < cpuItemHand.length; i++) {
      const item = cpuItemHand[i];
      if (item && item.name) hiddenItemNames.push(item.name);
    }
    return {
      hiddenUnitNames: hiddenUnitNames,
      hiddenUnitFirstNames: hiddenUnitFirstNames,
      hiddenItemNames: hiddenItemNames
    };
  }

  function redactHiddenCpuInfo(message) {
    if (!isCpuMode()) return message;
    let redacted = String(message);
    const names = getHiddenCpuEntityNames();
    names.hiddenUnitNames.forEach(function (name) {
      redacted = redacted.replaceAll(name, 'Hidden enemy unit');
    });
    names.hiddenUnitFirstNames.forEach(function (firstName) {
      const possessivePattern = new RegExp('\\b' + firstName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "'s\\b", 'g');
      redacted = redacted.replace(possessivePattern, "Hidden enemy unit's");
    });
    names.hiddenItemNames.forEach(function (name) {
      redacted = redacted.replaceAll(name, 'Hidden enemy item');
    });
    redacted = redacted.replace(/Player 2 equips [^.]+ on Hidden enemy unit\./g, 'Player 2 equips Hidden enemy item on Hidden enemy unit.');
    redacted = redacted.replace(/Player 2 uses [^.]+ on Hidden enemy unit\./g, 'Player 2 uses Hidden enemy item on Hidden enemy unit.');
    return redacted;
  }

  function log(message) {
    if (state.rawLogEntries) state.rawLogEntries.push(message);
    if (!gameLogEntries) return;
    const entry = document.createElement('div');
    entry.className = 'game-log__entry';
    entry.textContent = redactHiddenCpuInfo(message);
    gameLogEntries.appendChild(entry);
    gameLogEntries.scrollTop = gameLogEntries.scrollHeight;
  }

  function getInitialState() {
    return {
      phase: 'idle',
      gameMode: 'cpu',
      cpuDifficulty: 'easy',
      cpuCustomPlacementEnabled: false,
      humanPlayer: 1,
      captureGoal: 15,
      useBestiaryRules: true,
      firstPlayer: null,
      unitDeck: [],
      p1Hand: [],
      p2Hand: [],
      board: { 1: [null, null, null, null, null], 2: [null, null, null, null, null] },
      terrain: { 1: [null, null, null, null, null], 2: [null, null, null, null, null] },
      placementPlayer: null,
      selectedPlacementIndex: null,
      bestiary: null,
      pendingBestiaryReveal: null,
      pendingBestiaryContinue: false,
      gameOver: false,
      winner: null,
      rawLogEntries: [],
      cpuThinkTimer: null,
      cpuAnnounceTimer: null,
      cpuPendingExecute: null,
      cpuLastBlockReason: '',
      cpuAnnouncing: false,
    };
  }

  function isCpuMode() {
    return state.gameMode === 'cpu';
  }

  function isCpuPlayer(player) {
    return isCpuMode() && player === 2;
  }

  function isCpuTurn() {
    return isCpuPlayer(state.currentPlayer);
  }

  function isHumanTurn() {
    return state.currentPlayer === state.humanPlayer;
  }

  function shouldMaskForViewer(ownerPlayer, viewerPlayer, cell) {
    if (!isCpuMode()) return false;
    if (!cell) return false;
    if (ownerPlayer !== 2 || viewerPlayer !== 1) return false;
    return !cell.faceUp;
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
    clearCpuThinkTimer();
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

  function getCaptureMilestonesForGoal(goal) {
    return goal === 10 ? [4, 8] : [5, 10];
  }

  function makeInitialBestiaryState() {
    if (typeof FACTION_CARD_DEFS === 'undefined' || typeof BESTIARY_CARD_DEFS === 'undefined') return null;
    const factions = [];
    const bestiaryDeck = shuffle(BESTIARY_CARD_DEFS);
    for (let i = 0; i < 4; i++) {
      const factionCard = FACTION_CARD_DEFS[Math.floor(Math.random() * FACTION_CARD_DEFS.length)];
      const bestiaryCard = bestiaryDeck[i];
      factions.push({
        index: i,
        factionCardId: factionCard.id,
        bestiaryCardId: bestiaryCard.id,
        revealed: false,
        debugActivation: 'auto',
        debugFactionCardId: '',
        debugBestiaryCardId: '',
        revealedByMilestone: null,
      });
    }
    return {
      columns: factions,
      nextRevealColumn: 0,
      p1MilestonesHit: {},
      p2MilestonesHit: {},
      revealQueue: [],
    };
  }

  function getBestiaryColumn(index) {
    if (!state.bestiary || !state.bestiary.columns) return null;
    return state.bestiary.columns[index] || null;
  }

  function getFactionCardDefById(id) {
    if (!id || typeof FACTION_CARD_DEFS === 'undefined') return null;
    for (let i = 0; i < FACTION_CARD_DEFS.length; i++) {
      if (FACTION_CARD_DEFS[i].id === id) return FACTION_CARD_DEFS[i];
    }
    return null;
  }

  function getBestiaryCardDefById(id) {
    if (!id || typeof BESTIARY_CARD_DEFS === 'undefined') return null;
    for (let i = 0; i < BESTIARY_CARD_DEFS.length; i++) {
      if (BESTIARY_CARD_DEFS[i].id === id) return BESTIARY_CARD_DEFS[i];
    }
    return null;
  }

  function getFactionForUnit(unit) {
    if (!unit || typeof UNIT_FACTION_BY_NAME === 'undefined') return null;
    return UNIT_FACTION_BY_NAME[unit.name] || null;
  }

  function getColumnEffectiveFactionId(col) {
    if (!col) return null;
    if (col.debugFactionCardId) return col.debugFactionCardId;
    return col.factionCardId;
  }

  function getColumnEffectiveBestiaryId(col) {
    if (!col) return null;
    if (col.debugBestiaryCardId) return col.debugBestiaryCardId;
    return col.bestiaryCardId;
  }

  function isBestiaryColumnActive(col) {
    if (!col) return false;
    if (col.debugActivation === 'force_inactive') return false;
    if (col.debugActivation === 'force_active') return true;
    return !!col.revealed;
  }

  function getBestiaryEffectsForUnit(unit) {
    const result = {
      primalAlpha: 0,
      royalCaravan: 0,
      hoarderOfGlimmer: 0,
      ironCladShield: 0,
      eternalCarapace: 0,
      rootedColossus: 0,
      highAerie: 0,
      muzzledBeast: 0,
      fracturedHulk: 0,
      everWatchingEye: 0,
      berserker: 0,
      ironMaiden: 0,
      unmaker: 0,
    };
    if (!state.useBestiaryRules || !state.bestiary || !unit) return result;
    const factionName = getFactionForUnit(unit);
    if (!factionName) return result;
    const cols = state.bestiary.columns || [];
    for (let i = 0; i < cols.length; i++) {
      const col = cols[i];
      if (!isBestiaryColumnActive(col)) continue;
      const factionDef = getFactionCardDefById(getColumnEffectiveFactionId(col));
      if (!factionDef || factionDef.name !== factionName) continue;
      const effectCard = getBestiaryCardDefById(getColumnEffectiveBestiaryId(col));
      if (!effectCard) continue;
      if (effectCard.id === 'primal_alpha') result.primalAlpha++;
      else if (effectCard.id === 'royal_caravan') result.royalCaravan++;
      else if (effectCard.id === 'hoarder_of_glimmer') result.hoarderOfGlimmer++;
      else if (effectCard.id === 'iron_clad_shield') result.ironCladShield++;
      else if (effectCard.id === 'eternal_carapace') result.eternalCarapace++;
      else if (effectCard.id === 'rooted_colossus') result.rootedColossus++;
      else if (effectCard.id === 'high_aerie') result.highAerie++;
      else if (effectCard.id === 'muzzled_beast') result.muzzledBeast++;
      else if (effectCard.id === 'fractured_hulk') result.fracturedHulk++;
      else if (effectCard.id === 'ever_watching_eye') result.everWatchingEye++;
      else if (effectCard.id === 'berserker') result.berserker++;
      else if (effectCard.id === 'iron_maiden') result.ironMaiden++;
      else if (effectCard.id === 'unmaker') result.unmaker++;
    }
    return result;
  }

  function hasBestiaryVeteranBlock(cell) {
    const effects = getBestiaryEffectsForUnit(cell && cell.unit);
    return effects.fracturedHulk > 0;
  }

  function queueBestiaryRevealIfNeeded(player) {
    if (!state.useBestiaryRules || !state.bestiary) return;
    const milestones = getCaptureMilestonesForGoal(state.captureGoal);
    const score = player === 1 ? (state.p1Captures || 0) : (state.p2Captures || 0);
    const hitMap = player === 1 ? state.bestiary.p1MilestonesHit : state.bestiary.p2MilestonesHit;
    for (let i = 0; i < milestones.length; i++) {
      const target = milestones[i];
      if (score < target) continue;
      if (hitMap[target]) continue;
      hitMap[target] = true;
      state.bestiary.revealQueue.push({ player: player, milestone: target });
      log("[Bestiary] Player " + player + " reached " + target + " captures — a new fortune pair is ready to reveal.");
    }
    beginQueuedBestiaryRevealIfNeeded();
  }

  function beginQueuedBestiaryRevealIfNeeded() {
    if (!state.useBestiaryRules || !state.bestiary) return;
    sanitizeBestiaryRevealState();
    if (state.pendingBestiaryReveal || state.pendingBestiaryContinue) return;
    if (!state.bestiary.revealQueue || state.bestiary.revealQueue.length === 0) return;
    const nextIndex = getNextRevealableColumnIndex(state.bestiary.nextRevealColumn);
    if (nextIndex == null || nextIndex > 3) return;
    const col = getBestiaryColumn(nextIndex);
    if (!col) return;
    state.bestiary.nextRevealColumn = nextIndex;
    state.pendingBestiaryReveal = {
      columnIndex: nextIndex,
      source: state.bestiary.revealQueue.shift(),
    };
    openBestiaryModal(true);
  }

  function sanitizeBestiaryRevealState() {
    if (!state.useBestiaryRules || !state.bestiary) {
      state.pendingBestiaryReveal = null;
      state.pendingBestiaryContinue = false;
      return;
    }
    if (state.pendingBestiaryContinue && !state.pendingBestiaryReveal) {
      state.pendingBestiaryContinue = false;
    }
    if (!state.pendingBestiaryReveal) return;
    const idx = state.pendingBestiaryReveal.columnIndex;
    const col = getBestiaryColumn(idx);
    if (!col) {
      state.pendingBestiaryReveal = null;
      state.pendingBestiaryContinue = false;
      return;
    }
    const alreadyHandled = col.revealed || col.debugActivation === 'force_active';
    if (alreadyHandled && !state.pendingBestiaryContinue) {
      state.pendingBestiaryReveal = null;
      state.pendingBestiaryContinue = false;
    }
  }

  function getNextRevealableColumnIndex(startIndex) {
    if (!state.bestiary || !Array.isArray(state.bestiary.columns)) return null;
    const start = startIndex == null ? 0 : startIndex;
    for (let i = start; i < state.bestiary.columns.length; i++) {
      const col = state.bestiary.columns[i];
      if (!col) continue;
      if (col.revealed) continue;
      if (col.debugActivation === 'force_active') continue;
      return i;
    }
    return null;
  }

  function getBestiaryCardImageForColumn(col, kind) {
    if (kind === 'faction') {
      const faction = getFactionCardDefById(getColumnEffectiveFactionId(col));
      if (!faction) return typeof FACTION_CARD_BACK_IMAGE !== 'undefined' ? FACTION_CARD_BACK_IMAGE : '';
      const showFace = isBestiaryColumnActive(col) || col.debugActivation === 'force_active';
      return showFace ? faction.imagePath : (typeof FACTION_CARD_BACK_IMAGE !== 'undefined' ? FACTION_CARD_BACK_IMAGE : faction.imagePath);
    }
    const bestiary = getBestiaryCardDefById(getColumnEffectiveBestiaryId(col));
    if (!bestiary) return typeof BESTIARY_CARD_BACK_IMAGE !== 'undefined' ? BESTIARY_CARD_BACK_IMAGE : '';
    const showFace = isBestiaryColumnActive(col) || col.debugActivation === 'force_active';
    return showFace ? bestiary.imagePath : (typeof BESTIARY_CARD_BACK_IMAGE !== 'undefined' ? BESTIARY_CARD_BACK_IMAGE : bestiary.imagePath);
  }

  function renderBestiaryModal() {
    sanitizeBestiaryRevealState();
    if (!bestiaryGrid || !bestiaryStatus) return;
    bestiaryGrid.innerHTML = '';
    if (!state.useBestiaryRules || !state.bestiary) {
      bestiaryStatus.textContent = "Bestiary is disabled for this match.";
      if (bestiaryPrompt) bestiaryPrompt.hidden = true;
      return;
    }
    const cols = state.bestiary.columns || [];
    const revealedCount = cols.filter(function (c) { return isBestiaryColumnActive(c); }).length;
    bestiaryStatus.textContent = revealedCount + " / 4 fortune columns active.";

    for (let i = 0; i < cols.length; i++) {
      const col = cols[i];
      const wrap = document.createElement('div');
      const isPending = state.pendingBestiaryReveal && state.pendingBestiaryReveal.columnIndex === i;
      wrap.className = 'bestiary__column' + (isPending ? ' bestiary__column--pending' : '');
      wrap.innerHTML =
        '<p class="bestiary__label">Column ' + (i + 1) + '</p>' +
        '<div class="bestiary__card"><img src="' + escapeHtml(getBestiaryCardImageForColumn(col, 'faction')) + '" alt="Faction card"></div>' +
        '<div class="bestiary__card"><img src="' + escapeHtml(getBestiaryCardImageForColumn(col, 'bestiary')) + '" alt="Bestiary card"></div>';

      const debug = document.createElement('div');
      debug.className = 'bestiary__debug';
      const activationSelect = document.createElement('select');
      activationSelect.dataset.kind = 'activation';
      activationSelect.dataset.column = String(i);
      activationSelect.innerHTML =
        '<option value="auto">Auto (rules-driven)</option>' +
        '<option value="force_active">Force active</option>' +
        '<option value="force_inactive">Force inactive</option>';
      activationSelect.value = col.debugActivation || 'auto';
      debug.appendChild(activationSelect);

      const factionSelect = document.createElement('select');
      factionSelect.dataset.kind = 'faction';
      factionSelect.dataset.column = String(i);
      let factionOptions = '<option value="">Faction: auto-random</option>';
      if (typeof FACTION_CARD_DEFS !== 'undefined') {
        for (let f = 0; f < FACTION_CARD_DEFS.length; f++) {
          factionOptions += '<option value="' + FACTION_CARD_DEFS[f].id + '">' + FACTION_CARD_DEFS[f].name + '</option>';
        }
      }
      factionSelect.innerHTML = factionOptions;
      factionSelect.value = col.debugFactionCardId || '';
      debug.appendChild(factionSelect);

      const bestiarySelect = document.createElement('select');
      bestiarySelect.dataset.kind = 'bestiary';
      bestiarySelect.dataset.column = String(i);
      let bestiaryOptions = '<option value="">Bestiary: auto-random</option>';
      if (typeof BESTIARY_CARD_DEFS !== 'undefined') {
        for (let b = 0; b < BESTIARY_CARD_DEFS.length; b++) {
          bestiaryOptions += '<option value="' + BESTIARY_CARD_DEFS[b].id + '">' + BESTIARY_CARD_DEFS[b].name + '</option>';
        }
      }
      bestiarySelect.innerHTML = bestiaryOptions;
      bestiarySelect.value = col.debugBestiaryCardId || '';
      debug.appendChild(bestiarySelect);

      wrap.appendChild(debug);
      bestiaryGrid.appendChild(wrap);
    }

    if (bestiaryPrompt) {
      const hasPending = !!state.pendingBestiaryReveal || !!state.pendingBestiaryContinue;
      bestiaryPrompt.hidden = !hasPending;
      if (hasPending && bestiaryPromptText) {
        if (state.pendingBestiaryContinue && state.pendingBestiaryReveal) {
          bestiaryPromptText.textContent = "Fortune revealed. Confirm to continue the match.";
        } else {
          bestiaryPromptText.textContent = "Reveal the next fortune pair (mandatory).";
        }
      }
    }
    if (btnBestiaryReveal) btnBestiaryReveal.hidden = !state.pendingBestiaryReveal || !!state.pendingBestiaryContinue;
    if (btnBestiaryContinue) btnBestiaryContinue.hidden = !state.pendingBestiaryContinue;
  }

  function openBestiaryModal(lockMode) {
    if (!bestiaryModal) return;
    bestiaryModal.hidden = false;
    if (lockMode) bestiaryModal.classList.add('bestiary-modal--locked');
    else bestiaryModal.classList.remove('bestiary-modal--locked');
    renderBestiaryModal();
  }

  function closeBestiaryModal() {
    if (!bestiaryModal) return;
    if (state.pendingBestiaryReveal || state.pendingBestiaryContinue) return;
    bestiaryModal.hidden = true;
    bestiaryModal.classList.remove('bestiary-modal--locked');
  }

  function applyBestiaryRevealNow() {
    if (!state.pendingBestiaryReveal || !state.bestiary) return;
    const idx = state.pendingBestiaryReveal.columnIndex;
    const col = getBestiaryColumn(idx);
    if (!col) return;
    col.revealed = true;
    col.revealedByMilestone = state.pendingBestiaryReveal.source || null;
    const nextRevealable = getNextRevealableColumnIndex(idx + 1);
    state.bestiary.nextRevealColumn = nextRevealable == null ? 4 : nextRevealable;
    state.pendingBestiaryContinue = true;
    const faction = getFactionCardDefById(getColumnEffectiveFactionId(col));
    const bestiaryCard = getBestiaryCardDefById(getColumnEffectiveBestiaryId(col));
    log("[Bestiary] Column " + (idx + 1) + " revealed: " + (faction ? faction.name : 'Faction') + " + " + (bestiaryCard ? bestiaryCard.name : 'Bestiary'));
  }

  function onBestiaryRevealConfirmed() {
    if (!state.pendingBestiaryReveal || state.pendingBestiaryContinue) return;
    applyBestiaryRevealNow();
    renderTurnUI();
    renderBoard();
    renderBestiaryModal();
  }

  function onBestiaryContinueConfirmed() {
    if (state.pendingBestiaryReveal && !state.pendingBestiaryContinue) {
      applyBestiaryRevealNow();
    }
    if (!state.pendingBestiaryContinue) return;
    state.pendingBestiaryContinue = false;
    state.pendingBestiaryReveal = null;
    if (bestiaryModal) {
      bestiaryModal.hidden = true;
      bestiaryModal.classList.remove('bestiary-modal--locked');
    }
    beginQueuedBestiaryRevealIfNeeded();
  }

  function applyBestiaryDebugControlChange(columnIndex, kind, value) {
    if (!state.bestiary) return;
    const col = getBestiaryColumn(columnIndex);
    if (!col) return;
    if (kind === 'activation') col.debugActivation = value || 'auto';
    if (kind === 'faction') col.debugFactionCardId = value || '';
    if (kind === 'bestiary') col.debugBestiaryCardId = value || '';
    if ((col.debugFactionCardId || col.debugBestiaryCardId) && col.debugActivation === 'auto') {
      col.debugActivation = 'force_active';
    }
    log("[Bestiary][Debug] Column " + (columnIndex + 1) + " updated (" + kind + ").");
    renderTurnUI();
    renderBoard();
    renderBestiaryModal();
  }

  function getCellGearCards(cell) {
    if (!cell) return [];
    const out = [];
    if (cell.gear) out.push(cell.gear);
    if (cell.bonusGear) out.push(cell.bonusGear);
    return out;
  }

  function cellHasGearName(cell, gearName) {
    if (!cell || !gearName) return false;
    return getCellGearCards(cell).some(function (g) { return g && g.name === gearName; });
  }

  function removeGearFromCell(cell, gearName) {
    if (!cell) return null;
    if (cell.gear && (!gearName || cell.gear.name === gearName)) {
      const removedPrimary = cell.gear;
      if (cell.bonusGear) {
        cell.gear = cell.bonusGear;
        cell.bonusGear = null;
      } else {
        cell.gear = null;
      }
      return removedPrimary;
    }
    if (cell.bonusGear && (!gearName || cell.bonusGear.name === gearName)) {
      const removedBonus = cell.bonusGear;
      cell.bonusGear = null;
      return removedBonus;
    }
    return null;
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
    const gears = getCellGearCards(cell);
    let bonus = 0;
    for (let i = 0; i < gears.length; i++) bonus += getArmorHPBonus(gears[i].name);
    const bestiary = getBestiaryEffectsForUnit(cell.unit);
    return base + bonus + bestiary.eternalCarapace;
  }

  function getMaxHPWithGear(unitClass, armorName) {
    return getBaseHP(unitClass) + getArmorHPBonus(armorName);
  }

  function canEquipGear(cell, gearName) {
    if (!cell || !cell.unit || !gearName) return false;
    const bestiary = getBestiaryEffectsForUnit(cell.unit);
    if (bestiary.highAerie > 0) return false;
    const allowed = getGearAllowedClasses(gearName);
    if (allowed.indexOf(cell.unit.class) === -1) return false;
    const equippedCount = getCellGearCards(cell).length;
    const maxGearSlots = 1 + (bestiary.ironCladShield > 0 ? 1 : 0);
    if (equippedCount >= maxGearSlots) return false;
    const maxAfter = getMaxHP(cell) + getArmorHPBonus(gearName);
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
    if (attCell.unit.class === 'Brawler' && cellHasGearName(attCell, "Champion's Crest")) return d <= 1;
    if (attCell.unit.class === 'Lancer' && cellHasGearName(attCell, 'Vanguard Lance')) return d >= 1 && d <= 2;
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
    const unitBuff = getVeteranBuff(cell);
    if (hasBestiaryVeteranBlock(cell) && unitBuff === buffKey) {
      if (cell && cell.unit) {
        if (!cell.veteranState) cell.veteranState = {};
        const selectedKey = state.selectedUnit ? (state.selectedUnit.player + ':' + state.selectedUnit.column) : 'none';
        const logKey = 'fracturedHulkLog:' + (state.currentPlayer || 0) + ':' + (state.actionStep || 'n/a') + ':' + selectedKey + ':' + buffKey;
        if (!cell.veteranState[logKey]) {
          cell.veteranState[logKey] = true;
          log("[Bestiary] Fractured Hulk blocks " + cell.unit.name + "'s veteran effect (" + buffKey + ").");
        }
      }
      return false;
    }
    return unitBuff === buffKey;
  }

  function isCounterRangeForLancerCell(attackerCol, lancerCol, lancerCell) {
    if (!lancerCell) return false;
    const dist = Math.abs(attackerCol - lancerCol);
    return cellHasGearName(lancerCell, 'Vanguard Lance') ? (dist >= 1 && dist <= 2) : (dist === 1);
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
    if (!defCell || getCellGearCards(defCell).length === 0) {
      log("Torra's Shattering Hammer: heads — target has no gear.");
      return;
    }
    const removed = removeGearFromCell(defCell);
    if (!state.itemDiscard) state.itemDiscard = [];
    state.itemDiscard.push(removed);
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
      if (!attackerCell || getCellGearCards(attackerCell).length === 0) {
        log("Iktha's Magma Skin — attacker has no gear to destroy.");
      } else {
        const removed = removeGearFromCell(attackerCell);
        if (!state.itemDiscard) state.itemDiscard = [];
        state.itemDiscard.push(removed);
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

  function getArdanVeilstepEligibleCols(player, ardanCol) {
    const cols = [ardanCol];
    for (let c = 0; c < 5; c++) {
      if (c === ardanCol) continue;
      const allyCell = state.board[player][c];
      if (!allyCell || allyCell.faceUp) continue;
      cols.push(c);
    }
    return cols;
  }

  function queueArdanVeilstepPrompt(attackerPlayer, attackerCol, context) {
    const attCell = state.board[attackerPlayer][attackerCol];
    if (!attCell || !hasVeteranBuff(attCell, 'ardan')) return false;
    const eligibleCols = getArdanVeilstepEligibleCols(attackerPlayer, attackerCol);
    if (eligibleCols.length <= 1) {
      log("Ardan's Veilstep — no face-down allies available to reorder.");
      return false;
    }
    state.pendingVeteranPrompt = {
      type: 'ardanVeilstep',
      message: "Ardan's Veilstep: reorder Ardan with any face-down allies now?",
      useLabel: 'Use Veilstep',
      noLabel: 'No',
      attPlayer: attackerPlayer,
      attCol: attackerCol,
      context: context,
      eligibleCols: eligibleCols.slice(),
    };
    log("Ardan's Veilstep — choose Use or No.");
    return true;
  }

  function completeArchmageAttack(attPlayer, attCol) {
    const attCellAfter = state.board[attPlayer][attCol];
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

  function continueAfterArdanVeilstep(context, attackerPlayer, attackerCol) {
    if (context === 'archmage') {
      completeArchmageAttack(attackerPlayer, attackerCol);
      return;
    }
    finishResolvedCombatTurn();
  }

  function beginArdanVeilstepReorder(prompt) {
    const attCell = state.board[prompt.attPlayer][prompt.attCol];
    if (!attCell) {
      continueAfterArdanVeilstep(prompt.context, prompt.attPlayer, prompt.attCol);
      return;
    }
    const eligibleCols = getArdanVeilstepEligibleCols(prompt.attPlayer, prompt.attCol);
    if (eligibleCols.length <= 1) {
      log("Ardan's Veilstep — no face-down allies available to reorder.");
      continueAfterArdanVeilstep(prompt.context, prompt.attPlayer, prompt.attCol);
      return;
    }
    if (attCell.faceUp) {
      attCell.faceUp = false;
      log("Ardan's Veilstep — " + attCell.unit.name + " flips face-down.");
    }
    state.obscuringReorder = {
      player: prompt.attPlayer,
      selectedCol: null,
      kind: 'ardan',
      allowedCols: eligibleCols.slice(),
      afterContext: prompt.context,
      attackerPlayer: prompt.attPlayer,
      attackerCol: prompt.attCol,
    };
    log("Ardan's Veilstep — reorder Ardan with face-down allies, then click Done reordering.");
    renderTurnUI();
    renderBoard();
  }

  function finishResolvedCombatTurn() {
    const actingUnitRef = state.selectedUnit ? { player: state.selectedUnit.player, column: state.selectedUnit.column } : null;
    const actingCell = actingUnitRef ? (state.board[actingUnitRef.player] && state.board[actingUnitRef.player][actingUnitRef.column]) : null;
    if (actingCell && actingCell.unit) {
      const effects = getBestiaryEffectsForUnit(actingCell.unit);
      if (effects.hoarderOfGlimmer > 0) {
        for (let i = 0; i < effects.hoarderOfGlimmer; i++) drawItem(actingUnitRef.player);
        log("[Bestiary] Hoarder of Glimmer: " + actingCell.unit.name + " draws " + effects.hoarderOfGlimmer + " extra item(s) after attacking.");
      }
      if (effects.berserker > 0) {
        if (!actingCell.berserkerUsedThisTurn) {
          actingCell.berserkerUsedThisTurn = true;
          actingCell.berserkerAttacksLeft = effects.berserker;
        }
        if ((actingCell.berserkerAttacksLeft || 0) > 0) {
          actingCell.berserkerAttacksLeft--;
          if (effects.rootedColossus > 0) {
            state.actionStep = 'attack';
            log("[Bestiary] Rooted Colossus: " + actingCell.unit.name + " cannot move before its Berserker follow-up attack.");
            log("[Bestiary] Berserker: " + actingCell.unit.name + " can attack again.");
          } else {
            state.actionStep = 'move';
            state.moveDone = false;
            actingCell.bestiaryExtraMovesRemaining = effects.royalCaravan;
            log("[Bestiary] Berserker: " + actingCell.unit.name + " can move and attack again.");
          }
          state.selectedUnit = { player: actingUnitRef.player, column: actingUnitRef.column };
          renderTurnUI();
          renderBoard();
          return;
        }
        if (!actingCell.cannotAttackNextTurn) {
          actingCell.cannotAttackNextTurn = true;
          log("[Bestiary] Berserker: " + actingCell.unit.name + " is paralyzed on its next turn.");
        }
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
    if (cellHasGearName(defCell, 'Wardstone Bracelet')) {
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
    const finalTargetHadBarbed = !!(finalTargetCell && cellHasGearName(finalTargetCell, 'Barbed Gauntlets'));
    const captured = applyDamage(finalPlayer, finalCol, prompt.damage, "", false, { attackerPlayer: prompt.attPlayer, attackerCol: prompt.attCol });
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
    if (queueArdanVeilstepPrompt(prompt.attPlayer, prompt.attCol, 'single')) {
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
    if (prompt.type === 'ardanVeilstep') {
      state.pendingVeteranPrompt = null;
      beginArdanVeilstepReorder(prompt);
      return;
    }
    if (prompt.type === 'unmakerSelfCaptureConfirm') {
      state.pendingVeteranPrompt = null;
      const p = prompt.player;
      const c = prompt.col;
      const cell = state.board[p] && state.board[p][c];
      if (!cell) {
        state.selectedUnit = null;
        state.actionStep = 'select_unit';
        renderTurnUI();
        renderBoard();
        return;
      }
      cell.faceUp = true;
      if (maybeCaptureUnmakerOnReveal(p, c, "on action reveal")) {
        state.selectedUnit = null;
        state.actionStep = 'select_unit';
        renderTurnUI();
        renderBoard();
        return;
      }
      state.selectedUnit = { player: p, column: c };
      state.actionStep = prompt.nextStep || 'move';
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
    if (prompt.type === 'ardanVeilstep') {
      state.pendingVeteranPrompt = null;
      log("Ardan's Veilstep not used.");
      continueAfterArdanVeilstep(prompt.context, prompt.attPlayer, prompt.attCol);
      return;
    }
    if (prompt.type === 'unmakerSelfCaptureConfirm') {
      state.pendingVeteranPrompt = null;
      state.selectedUnit = null;
      state.actionStep = 'select_unit';
      log("[Bestiary] Unmaker action canceled.");
      renderTurnUI();
      renderBoard();
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
  const ITEM_IMAGE_FILENAME_MAP = {
    'Light Armor': 'Armor - Light Armor.png',
    'Premium Light Armor': 'Armor - Premium Light Armor.png',
    'Heavy Armor': 'Armor - Heavy Armor.png',
    'Healing Potion': 'Single Use - Potion.png',
    'Corrosive Phial': 'Single Use - Corrosive Phial.png',
    'Tectonic Spike': 'Single Use - Tectonic Spike.png',
    'All revealing lantern-jar': 'Single Use - All revealing lantern-jar.png',
    'Tangle-Vine Bola': 'Single Use - Tangle-Vine Bola.png',
    'Obscuring bomb': 'Single Use - Obscuring Bomb.png',
    'Vorpal Honing Amulet': 'Single Use - Vorpal Honing Amulet.png',
    'True-Strike Lens': 'Single Use - True-Strike Lens.png',
    'Magic Grenade': 'Single Use - Magic Grenade.png',
    'Barbed Gauntlets': 'Single Use - Barbed Gauntlets.png',
    'Wardstone Bracelet': 'Single Use - Wardstone Bracelet.png',
    'Teleport Boots': 'Single Use - Teleport Boots.png',
    'Elevated Ground': 'Terrain - Elevated Ground.png',
    'Reinforced Barricade': 'Terrain - Reinforced Barricade.png',
    'Paralyzing Vines': 'Terrain - Paralyzing Vines.png',
    'Divine Light': 'Terrain - Divine Light.png',
    'Unstable Ground': 'Terrain - Unstable Ground.png',
    "Champion's Crest": 'Promotion - Champions Crest.png',
    'Vanguard Lance': 'Promotion - Vanguard Lance.png',
    "Sharpshooter's Scope": 'Promotion - Sharpshooters Scope.png',
    "Archmage's Tome": 'Promotion - Archmages Tome.png',
  };

  function getItemCardImagePath(itemName) {
    const mappedFilename = ITEM_IMAGE_FILENAME_MAP[itemName];
    if (mappedFilename) return 'assets/items/' + mappedFilename;
    const slug = nameToSlug(itemName);
    return slug ? 'assets/items/' + slug + '.png' : 'assets/items/item-placeholder-for-dev.png';
  }

  function createUnitCardHTML(unit, cardState) {
    const faceUp = cardState.faceUp;
    const maskedForViewer = !!cardState.maskedForViewer;
    const damage = cardState.damage || 0;
    const paralyzed = cardState.paralyzed || false;
    const cannotAttackNextTurn = cardState.cannotAttackNextTurn || false;
    const mustRestNextTurn = cardState.mustRestNextTurn || false;
    const showCannotAttack = cannotAttackNextTurn || mustRestNextTurn;
    const maxHP = cardState.maxHP != null ? cardState.maxHP : getBaseHP(unit.class);
    const gear = cardState.gear || null;
    const terrain = cardState.terrain || null;

    const cardPath = maskedForViewer ? 'assets/units/unit-card-back.png' : getUnitCardImagePath(unit);
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

    const cardClass = (faceUp && !maskedForViewer) ? 'unit-card unit-card--face-up' : 'unit-card unit-card--face-down-soft';
    const safeName = maskedForViewer ? 'Hidden enemy unit' : unit.name;
    const safeClass = maskedForViewer ? 'Unknown' : unit.class;
    const safeHp = maskedForViewer ? '' : maxHP;
    const safeDamage = maskedForViewer ? '' : damage;
    const dataAttrs = ' data-face-up="' + ((faceUp && !maskedForViewer) ? 'true' : 'false') + '" data-name="' + escapeHtml(safeName) + '" data-class="' + safeClass + '" data-hp="' + safeHp + '" data-damage="' + safeDamage + '"';
    const badgePart = markersHTML ? '<div class="unit-card__markers">' + markersHTML + '</div>' : '';
    const faceDownOverlayPart = (!faceUp && !maskedForViewer) ? '<div class="unit-card__face-down-overlay" aria-hidden="true"></div>' : '';

    const gearImagePath = maskedForViewer ? 'assets/items/item-card-back.png' : (gear ? getItemCardImagePath(gear.name) : '');
    const gearPart = gear ? '<div class="unit-mini-card unit-mini-card--gear"><img class="unit-mini-card__img" src="' + escapeHtml(gearImagePath) + '" alt="" role="presentation"></div>' : '';
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
    applyBestiaryBoardStateMaintenance();
    clearBoard();
    [1, 2].forEach(function (player) {
      const row = document.querySelector('.row--player' + player);
      const slots = row.querySelectorAll('.slot');
      const cells = state.board[player];
      const terrainRow = state.terrain && state.terrain[player] ? state.terrain[player] : [];
      cells.forEach(function (cell, i) {
        const terrainCell = terrainRow[i] || null;
        const maskedForViewer = shouldMaskForViewer(player, 1, cell);
        const unitPart = cell
          ? createUnitCardHTML(cell.unit, {
              faceUp: cell.faceUp && !maskedForViewer,
              maskedForViewer: maskedForViewer,
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
        const hideForTurn = state.actionStep !== 'use_items' || !!state.itemTargeting || !!state.obscuringReorder;
        const hideForCpuRestriction = isCpuMode() && state.currentPlayer !== 1;
        itemDrawDebugEl.hidden = hideForTurn || hideForCpuRestriction;
      }
      if (state.actionStep !== 'use_items' || state.itemTargeting) {
        if (itemPickListWrapEl) itemPickListWrapEl.setAttribute('hidden', '');
      }
      renderDiscardPiles();
      maybeScheduleCpuTurn();
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
        if (reord.allowedCols && reord.allowedCols.indexOf(c) === -1) continue;
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
      const hasTeleportBoots = myCell && cellHasGearName(myCell, 'Teleport Boots');
      const slot = document.querySelector('.row--player' + p + ' .slot[data-column="' + c + '"]');
      if (slot) slot.classList.add('slot--selected');
      if (hasTeleportBoots) {
        for (let col = 0; col < 5; col++) {
          if (col === c) continue;
          const straightSlot = document.querySelector('.row--player' + p + ' .slot[data-column="' + col + '"]');
          if (straightSlot) straightSlot.classList.add('slot--selectable');
        }
      } else {
        if (c > 0) {
          const leftSlot = document.querySelector('.row--player' + p + ' .slot[data-column="' + (c - 1) + '"]');
          if (leftSlot) leftSlot.classList.add('slot--selectable');
        }
        if (c < 4) {
          const rightSlot = document.querySelector('.row--player' + p + ' .slot[data-column="' + (c + 1) + '"]');
          if (rightSlot) rightSlot.classList.add('slot--selectable');
        }
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
            if (!cell || !cell.faceUp || getCellGearCards(cell).length === 0) continue;
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

  function syncSetupModeControls() {
    if (!setupModeEl || !setupCpuCustomPlacementEl || !setupCpuDifficultyEl) return;
    const cpuSelected = setupModeEl.value === 'cpu';
    setupCpuCustomPlacementEl.disabled = !cpuSelected;
    setupCpuDifficultyEl.disabled = !cpuSelected;
    if (!cpuSelected) setupCpuCustomPlacementEl.checked = false;
    state.gameMode = setupModeEl.value || 'cpu';
    state.cpuCustomPlacementEnabled = !!setupCpuCustomPlacementEl.checked;
    state.cpuDifficulty = setupCpuDifficultyEl.value || 'easy';
  }

  function buildLogText(isInterrupted) {
    const now = new Date();
    const pad = function (n) { return String(n).padStart(2, '0'); };
    const timestamp = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate())
      + ' ' + pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds());

    const modeLabel = state.gameMode === 'cpu'
      ? 'vs CPU (' + (state.cpuDifficulty || 'easy') + ')'
      : 'Manual (2-player)';
    const bestiaryLabel = state.useBestiaryRules ? 'On' : 'Off';
    const firstLabel = state.firstPlayer ? 'Player ' + state.firstPlayer : 'Unknown';

    let resultLine;
    if (isInterrupted) {
      resultLine = 'Incomplete — interrupted by player'
        + ' (Player 1: ' + (state.p1Captures || 0) + ' captures'
        + ', ' + (state.gameMode === 'cpu' ? 'CPU' : 'Player 2') + ': ' + (state.p2Captures || 0) + ')';
    } else if (state.winner) {
      const winnerLabel = (state.gameMode === 'cpu' && state.winner === 2) ? 'CPU' : 'Player ' + state.winner;
      const loserCaptures = state.winner === 1 ? state.p2Captures : state.p1Captures;
      resultLine = winnerLabel + ' wins — ' + state.captureGoal + ' captures'
        + ' (opponent: ' + loserCaptures + ')';
    } else {
      resultLine = 'In progress';
    }

    const entries = state.rawLogEntries || [];
    const eventLines = entries.length ? entries.join('\n') : '(no events recorded)';

    return [
      '=== Tacticlash — Game Log ===',
      'Saved:         ' + timestamp,
      'Mode:          ' + modeLabel,
      'Capture goal:  ' + (state.captureGoal || '—'),
      'Bestiary:      ' + bestiaryLabel,
      'First player:  ' + firstLabel,
      '',
      'Result: ' + resultLine,
      '',
      '=== Events ===',
      eventLines,
      '=== End of log ===',
    ].join('\n');
  }

  function downloadGameLog(isInterrupted) {
    if (isInterrupted) {
      log('--- Match interrupted by player (log saved, game not completed) ---');
    }
    const text = buildLogText(isInterrupted);
    const now = new Date();
    const pad = function (n) { return String(n).padStart(2, '0'); };
    const fname = 'tacticlash-'
      + now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate())
      + '-' + pad(now.getHours()) + pad(now.getMinutes())
      + '.txt';
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fname;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function startNewGame() {
    if (state.phase === 'playing' && !state.gameOver) {
      if (saveLogModal) saveLogModal.hidden = false;
      return;
    }
    doStartNewGame();
  }

  function doStartNewGame() {
    if (saveLogModal) saveLogModal.hidden = true;
    clearCpuThinkTimer();
    state = getInitialState();
    if (setupModeEl) {
      setupModeEl.value = 'cpu';
      state.gameMode = setupModeEl.value;
    }
    if (setupCpuCustomPlacementEl) {
      setupCpuCustomPlacementEl.checked = false;
      state.cpuCustomPlacementEnabled = !!setupCpuCustomPlacementEl.checked;
    }
    if (setupCpuDifficultyEl) {
      setupCpuDifficultyEl.value = 'easy';
      state.cpuDifficulty = setupCpuDifficultyEl.value;
    }
    syncSetupModeControls();
    if (setupBestiaryEnabledEl) {
      setupBestiaryEnabledEl.checked = true;
      state.useBestiaryRules = setupBestiaryEnabledEl.checked;
    }
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
    if (btnBestiaryOpen) btnBestiaryOpen.hidden = true;
    showStep('goal');
  }

  function onGoalChosen(goal) {
    state.captureGoal = goal;
    state.useBestiaryRules = !setupBestiaryEnabledEl || setupBestiaryEnabledEl.checked;
    state.gameMode = setupModeEl ? setupModeEl.value : 'cpu';
    state.cpuCustomPlacementEnabled = !!(setupCpuCustomPlacementEl && setupCpuCustomPlacementEl.checked);
    state.cpuDifficulty = setupCpuDifficultyEl ? (setupCpuDifficultyEl.value || 'easy') : 'easy';
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
    state.bestiary = state.useBestiaryRules ? makeInitialBestiaryState() : null;
    state.pendingBestiaryReveal = null;
    state.pendingBestiaryContinue = false;
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
    const label = isCpuMode() && player === 2 ? 'CPU (Player 2)' : ('Player ' + player);
    placeTitle.textContent = label + ': Place your units';
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

  function createBoardCell(unit) {
    return {
      unit: unit,
      faceUp: false,
      damage: 0,
      paralyzed: false,
      gear: null,
      bonusGear: null,
      veteranState: {},
      bestiaryExtraMovesRemaining: 0,
      berserkerAttacksLeft: 0,
      berserkerUsedThisTurn: false,
    };
  }

  function applyBestiaryBoardStateMaintenance() {
    if (!state.useBestiaryRules) return;
    applyHighAerieGearStrip();
    for (let p = 1; p <= 2; p++) {
      for (let c = 0; c < 5; c++) {
        const cell = state.board[p][c];
        if (!cell || !cell.unit) continue;
        const effects = getBestiaryEffectsForUnit(cell.unit);
        if (effects.everWatchingEye > 0 && !cell.faceUp) {
          cell.faceUp = true;
          log("[Bestiary] Ever-Watching Eye reveals " + cell.unit.name + " and keeps it face-up.");
        }
        if (effects.unmaker > 0 && cell.faceUp) {
          maybeCaptureUnmakerOnReveal(p, c, "immediately after being face-up");
        }
      }
    }
    ensureSelectedUnitIsValid();
  }

  function maybeCaptureUnmakerOnReveal(player, col, reason) {
    const cell = state.board[player] && state.board[player][col];
    if (!cell || !cell.unit || !cell.faceUp) return false;
    const effects = getBestiaryEffectsForUnit(cell.unit);
    if (effects.unmaker < 1) return false;
    const why = reason ? " (" + reason + ")" : "";
    log("[Bestiary] Unmaker captures " + cell.unit.name + why + ".");
    applyDamage(player, col, getMaxHP(cell), '', true);
    return true;
  }

  function ensureSelectedUnitIsValid() {
    if (!state.selectedUnit) return;
    const p = state.selectedUnit.player;
    const c = state.selectedUnit.column;
    const cell = state.board[p] && state.board[p][c];
    if (cell) return;
    state.selectedUnit = null;
    if (state.actionStep === 'move' || state.actionStep === 'attack') {
      state.actionStep = 'select_unit';
    }
  }

  function applyHighAerieGearStrip() {
    if (!state.useBestiaryRules) return;
    for (let p = 1; p <= 2; p++) {
      for (let c = 0; c < 5; c++) {
        const cell = state.board[p][c];
        if (!cell || !cell.unit) continue;
        const effects = getBestiaryEffectsForUnit(cell.unit);
        if (effects.highAerie < 1) continue;
        const gears = getCellGearCards(cell);
        if (gears.length === 0) continue;
        if (!state.itemDiscard) state.itemDiscard = [];
        for (let i = 0; i < gears.length; i++) {
          state.itemDiscard.push(gears[i]);
          log("[Bestiary] High-Aerie: " + cell.unit.name + " loses " + gears[i].name + " (discarded).");
        }
        cell.gear = null;
        cell.bonusGear = null;
      }
    }
  }

  function placeUnit(player, slotIndex) {
    const hand = player === 1 ? state.p1Hand : state.p2Hand;
    const idx = state.selectedPlacementIndex;
    if (idx == null || idx < 0 || idx >= hand.length) return;
    const unit = hand[idx];
    state.board[player][slotIndex] = createBoardCell(unit);
    if (getTerrain(player, slotIndex) === 'Divine Light') state.board[player][slotIndex].faceUp = true;
    applyBestiaryBoardStateMaintenance();
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
      state.board[player][slot] = createBoardCell(shuffled[i]);
      if (getTerrain(player, slot) === 'Divine Light') state.board[player][slot].faceUp = true;
    }
    applyBestiaryBoardStateMaintenance();
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
      if (isCpuMode() && !state.cpuCustomPlacementEnabled) {
        state.selectedPlacementIndex = null;
        placeAllRandomly();
        return;
      }
      if (placementHandFilterEl) placementHandFilterEl.value = '';
      closePlacementUnitPickList();
      renderPlacementStep();
      renderBoard();
    } else {
      state.phase = 'playing';
      setupEl.hidden = true;
      if (btnBestiaryOpen) btnBestiaryOpen.hidden = false;
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
    state.cpuItemsUsedThisTurn = 0;
    state.actionStep = 'use_items';
    state.selectedUnit = null;
    state.moveDone = false;
    state.itemTargeting = null;
    refreshCassaCooldownForTurn(p);
    refreshSenyaCooldownForTurn(p);

    for (let c = 0; c < 5; c++) {
      const cell = state.board[p][c];
      if (cell) {
        cell.mustRestNextTurn = false;
        cell.berserkerUsedThisTurn = false;
        cell.berserkerAttacksLeft = 0;
        cell.bestiaryExtraMovesRemaining = 0;
      }
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
    if (currentPlayerHasMuzzledUnit()) {
      log("[Bestiary] Muzzled Beast is active: Player " + p + " cannot use single-use items this turn.");
    }
    if (reinforcedCount > 0 && !deckEmptyBefore) {
      log("Reinforcement: Player " + p + " places " + reinforcedCount + " unit(s) from the deck.");
    }
    log("Player " + p + " draws 1 item.");

    updateCaptureDisplay();
    renderTurnUI();
    renderBoard();
    animateCardIntoHand(p);
    maybeScheduleCpuTurn();
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
      state.board[player][slot] = createBoardCell(unit);
      if (getTerrain(player, slot) === 'Divine Light') state.board[player][slot].faceUp = true;
    }
    applyBestiaryBoardStateMaintenance();
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
    if (bestiaryModal && !bestiaryModal.hidden) renderBestiaryModal();
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
        if (cell && cell.faceUp && getCellGearCards(cell).length > 0) n++;
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
        if (cell && getCellGearCards(cell).length > 0) n++;
      }
    }
    return n;
  }

  function currentPlayerHasMuzzledUnit() {
    if (!state.useBestiaryRules) return false;
    const p = state.currentPlayer;
    for (let c = 0; c < 5; c++) {
      const cell = state.board[p][c];
      if (!cell || !cell.unit) continue;
      const effects = getBestiaryEffectsForUnit(cell.unit);
      if (effects.muzzledBeast > 0) return true;
    }
    return false;
  }

  function canCurrentPlayerUseSingleUseItems() {
    if (!state.useBestiaryRules) return true;
    return !currentPlayerHasMuzzledUnit();
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
      if (!canCurrentPlayerUseSingleUseItems()) return false;
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

    function buildItemCard(item, index, ownerPlayer, isCurrentPlayer) {
      const el = document.createElement('div');
      el.className = 'item-card';
      el.setAttribute('role', 'listitem');
      el.dataset.itemIndex = String(index);
      el.dataset.player = String(ownerPlayer);
      const maskedForViewer = isCpuMode() && ownerPlayer === 2;
      el.dataset.itemName = maskedForViewer ? 'Hidden enemy item' : item.name;

      const face = document.createElement('div');
      face.className = 'item-card__face';

      const img = document.createElement('img');
      img.className = 'item-card-img';
      img.src = maskedForViewer ? 'assets/items/item-card-back.png' : getItemCardImagePath(item.name);
      img.alt = '';
      img.setAttribute('role', 'presentation');
      img.onerror = function () { this.src = 'assets/items/item-placeholder-for-dev.png'; };
      face.appendChild(img);

      const nameSpan = document.createElement('span');
      nameSpan.className = 'item-card__name';
      nameSpan.textContent = maskedForViewer ? 'Hidden enemy item' : item.name;
      face.appendChild(nameSpan);

      const actions = document.createElement('div');
      actions.className = 'item-card__actions';

      if (!maskedForViewer) {
        const seeBtn = document.createElement('button');
        seeBtn.type = 'button';
        seeBtn.className = 'item-card__see btn btn--small';
        seeBtn.textContent = 'See';
        seeBtn.dataset.itemName = item.name;
        actions.appendChild(seeBtn);
      }

      const spec = typeof ITEM_SPECS !== 'undefined' && ITEM_SPECS[item.name];

      if (!maskedForViewer && isCurrentPlayer && isUseItems && spec && spec.type === 'single_use' && canPlaySingleUse(item.name)) {
        const useBtn = document.createElement('button');
        useBtn.type = 'button';
        useBtn.className = 'item-card__use btn btn--small';
        useBtn.textContent = primaryLabelForItem(spec, item.name);
        useBtn.dataset.itemIndex = String(index);
        useBtn.dataset.itemName = item.name;
        actions.appendChild(useBtn);
      }
      if (!maskedForViewer && isCurrentPlayer && isUseItems && spec && (spec.type === 'gear_armor' || spec.type === 'gear_accessory' || spec.type === 'promotion') && canPlayGear(item.name)) {
        const useBtn = document.createElement('button');
        useBtn.type = 'button';
        useBtn.className = 'item-card__use btn btn--small';
        useBtn.textContent = primaryLabelForItem(spec, item.name);
        useBtn.dataset.itemIndex = String(index);
        useBtn.dataset.itemName = item.name;
        actions.appendChild(useBtn);
      }
      if (!maskedForViewer && isCurrentPlayer && isUseItems && typeof TERRAIN_ITEM_NAMES !== 'undefined' && TERRAIN_ITEM_NAMES.indexOf(item.name) !== -1 && countEmptyTerrainSlots() > 0) {
        const useBtn = document.createElement('button');
        useBtn.type = 'button';
        useBtn.className = 'item-card__use btn btn--small';
        useBtn.textContent = primaryLabelForItem(spec, item.name);
        useBtn.dataset.itemIndex = String(index);
        useBtn.dataset.itemName = item.name;
        actions.appendChild(useBtn);
      }
      if (!maskedForViewer && isCurrentPlayer && isUseItems && item.name === 'Tectonic Spike' && countTilesWithTerrain() > 0) {
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

      if (!maskedForViewer && el.querySelector('.item-card__use')) {
        el.classList.add('item-card--playable');
      }
      return el;
    }

    p1Hand.forEach(function (item, index) {
      itemHandP1El.appendChild(buildItemCard(item, index, 1, p === 1));
    });
    p2Hand.forEach(function (item, index) {
      itemHandP2El.appendChild(buildItemCard(item, index, 2, p === 2));
    });

  }

  function renderTurnUI() {
    sanitizeBestiaryRevealState();
    const p = state.currentPlayer;
    const step = state.actionStep;
    const playerLabel = isCpuMode() && p === 2 ? 'CPU (Player 2)' : ('Player ' + p);
    turnLabel.textContent = playerLabel + "'s turn";

    turnActions.hidden = true;
    if (btnPass) btnPass.hidden = true;
    if (btnDoneWithItems) btnDoneWithItems.hidden = true;
    if (btnWardstoneUse) btnWardstoneUse.hidden = true;
    if (btnWardstoneNo) btnWardstoneNo.hidden = true;
    if (btnCpuContinue) btnCpuContinue.hidden = true;
    btnMoveLeft.hidden = true;
    btnMoveRight.hidden = true;
    btnSkipMove.hidden = true;
    if (contextualMoveControls) {
      contextualMoveControls.hidden = true;
      contextualMoveControls.classList.remove('contextual-move-controls--above', 'contextual-move-controls--below');
    }

    // During the CPU announce window: keep the announcement text and show "Continue"
    if (state.cpuAnnouncing) {
      turnActions.hidden = false;
      if (btnCpuContinue) btnCpuContinue.hidden = false;
      return;
    }

    if (state.pendingBestiaryReveal || state.pendingBestiaryContinue) {
      turnStep.textContent = "Seer's Bestiary reveal in progress.";
      if (bestiaryModal && bestiaryModal.hidden) openBestiaryModal(true);
      return;
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
    if (state.obscuringReorder) {
      const kind = state.obscuringReorder.kind || 'obscuring';
      if (kind === 'ardan') {
        turnStep.textContent = "Ardan's Veilstep: click one eligible slot, then another to swap. Then click Done reordering.";
      } else {
        turnStep.textContent = 'Reorder your units: click one slot, then another to swap. Then click Done reordering.';
      }
      turnActions.hidden = false;
      if (btnPass) btnPass.hidden = true;
      if (btnDoneWithItems) {
        btnDoneWithItems.textContent = 'Done reordering';
        btnDoneWithItems.hidden = false;
      }
      return;
    }

    if (step === 'use_items') {
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
        if (currentPlayerHasMuzzledUnit()) {
          turnStep.textContent = 'Muzzled Beast is active: single-use items are blocked this turn.';
        } else {
          turnStep.textContent = 'Use items (optional), then continue to combat.';
        }
      }
      turnActions.hidden = false;
      if (btnPass) btnPass.hidden = true;
      if (btnDoneWithItems) btnDoneWithItems.textContent = state.itemTargeting ? 'Cancel' : 'Done with items';
      if (btnDoneWithItems) btnDoneWithItems.hidden = false;
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
    const bestiaryAtSelect = getBestiaryEffectsForUnit(cell.unit);
    if (!cell.faceUp && bestiaryAtSelect.unmaker > 0) {
      state.pendingVeteranPrompt = {
        type: 'unmakerSelfCaptureConfirm',
        message: "Unmaker warning: revealing this unit captures it instantly. Continue?",
        useLabel: 'Reveal anyway',
        noLabel: 'Cancel',
        player: player,
        col: column,
        nextStep: 'move',
      };
      renderTurnUI();
      renderBoard();
      return;
    }
    state.selectedUnit = { player: player, column: column };
    cell.faceUp = true;
    if (maybeCaptureUnmakerOnReveal(player, column, "on action reveal")) {
      state.selectedUnit = null;
      state.actionStep = 'select_unit';
      renderTurnUI();
      renderBoard();
      return;
    }
    state.actionStep = 'move';
    const bestiary = getBestiaryEffectsForUnit(cell.unit);
    if (bestiary.rootedColossus > 0) {
      cell.bestiaryExtraMovesRemaining = 0;
      state.actionStep = 'attack';
      log("[Bestiary] Rooted Colossus: " + cell.unit.name + " cannot move before attacking.");
    } else {
      cell.bestiaryExtraMovesRemaining = bestiary.royalCaravan;
      if (bestiary.royalCaravan > 0) {
        log("[Bestiary] Royal Caravan: " + cell.unit.name + " can move " + bestiary.royalCaravan + " extra tile(s) before attacking.");
      }
    }
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
    if (!myCell) {
      state.selectedUnit = null;
      state.actionStep = 'select_unit';
      renderTurnUI();
      renderBoard();
      return;
    }
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

    state.board[p][c] = { unit: otherCell.unit, faceUp: otherCell.faceUp, damage: otherCell.damage || 0, paralyzed: otherCell.paralyzed || false, cannotAttackNextTurn: otherCell.cannotAttackNextTurn || false, mustRestNextTurn: otherCell.mustRestNextTurn || false, nextAttackAsCaster: otherCell.nextAttackAsCaster || false, gear: otherCell.gear || null, bonusGear: otherCell.bonusGear || null, veteranState: otherCell.veteranState || {}, berserkerUsedThisTurn: otherCell.berserkerUsedThisTurn || false, berserkerAttacksLeft: otherCell.berserkerAttacksLeft || 0, bestiaryExtraMovesRemaining: otherCell.bestiaryExtraMovesRemaining || 0 };
    state.board[p][next] = { unit: myCell.unit, faceUp: true, damage: myCell.damage || 0, paralyzed: myCell.paralyzed || false, cannotAttackNextTurn: myCell.cannotAttackNextTurn || false, mustRestNextTurn: myCell.mustRestNextTurn || false, nextAttackAsCaster: myCell.nextAttackAsCaster || false, gear: myCell.gear || null, bonusGear: myCell.bonusGear || null, veteranState: myCell.veteranState || {}, berserkerUsedThisTurn: myCell.berserkerUsedThisTurn || false, berserkerAttacksLeft: myCell.berserkerAttacksLeft || 0, bestiaryExtraMovesRemaining: myCell.bestiaryExtraMovesRemaining || 0 };
    state.selectedUnit.column = next;
    state.moveDone = true;
    const movedCell = state.board[p][next];
    if (movedCell && (movedCell.bestiaryExtraMovesRemaining || 0) > 0) {
      movedCell.bestiaryExtraMovesRemaining--;
      state.actionStep = 'move';
      log("[Bestiary] Royal Caravan: " + movedCell.unit.name + " may move once more before attacking.");
    } else {
      state.actionStep = 'attack';
    }
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
    if (!cell) {
      state.selectedUnit = null;
      state.actionStep = 'select_unit';
      renderTurnUI();
      renderBoard();
      return;
    }
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
    if (!myCell) {
      state.selectedUnit = null;
      state.actionStep = 'select_unit';
      renderTurnUI();
      renderBoard();
      return;
    }
    if (!myCell || !cellHasGearName(myCell, 'Teleport Boots')) return;
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
      state.board[p][toCol] = { unit: myCell.unit, faceUp: true, damage: myCell.damage || 0, paralyzed: myCell.paralyzed || false, cannotAttackNextTurn: myCell.cannotAttackNextTurn || false, mustRestNextTurn: myCell.mustRestNextTurn || false, nextAttackAsCaster: myCell.nextAttackAsCaster || false, gear: myCell.gear || null, bonusGear: myCell.bonusGear || null, veteranState: myCell.veteranState || {}, berserkerUsedThisTurn: myCell.berserkerUsedThisTurn || false, berserkerAttacksLeft: myCell.berserkerAttacksLeft || 0, bestiaryExtraMovesRemaining: myCell.bestiaryExtraMovesRemaining || 0 };
      state.board[p][fromCol] = null;
      if (getTerrain(p, toCol) === 'Divine Light') state.board[p][toCol].faceUp = true;
      log("Player " + p + "'s " + myCell.unit.name + " teleports to column " + toCol + ".");
    } else {
      state.board[p][fromCol] = { unit: targetCell.unit, faceUp: targetCell.faceUp, damage: targetCell.damage || 0, paralyzed: targetCell.paralyzed || false, cannotAttackNextTurn: targetCell.cannotAttackNextTurn || false, mustRestNextTurn: targetCell.mustRestNextTurn || false, nextAttackAsCaster: targetCell.nextAttackAsCaster || false, gear: targetCell.gear || null, bonusGear: targetCell.bonusGear || null, veteranState: targetCell.veteranState || {}, berserkerUsedThisTurn: targetCell.berserkerUsedThisTurn || false, berserkerAttacksLeft: targetCell.berserkerAttacksLeft || 0, bestiaryExtraMovesRemaining: targetCell.bestiaryExtraMovesRemaining || 0 };
      state.board[p][toCol] = { unit: myCell.unit, faceUp: true, damage: myCell.damage || 0, paralyzed: myCell.paralyzed || false, cannotAttackNextTurn: myCell.cannotAttackNextTurn || false, mustRestNextTurn: myCell.mustRestNextTurn || false, nextAttackAsCaster: myCell.nextAttackAsCaster || false, gear: myCell.gear || null, bonusGear: myCell.bonusGear || null, veteranState: myCell.veteranState || {}, berserkerUsedThisTurn: myCell.berserkerUsedThisTurn || false, berserkerAttacksLeft: myCell.berserkerAttacksLeft || 0, bestiaryExtraMovesRemaining: myCell.bestiaryExtraMovesRemaining || 0 };
      state.selectedUnit.column = toCol;
      if (getTerrain(p, fromCol) === 'Divine Light') state.board[p][fromCol].faceUp = true;
      if (getTerrain(p, toCol) === 'Divine Light') state.board[p][toCol].faceUp = true;
      let teleportLog = "Player " + p + "'s " + myCell.unit.name + " teleports (swaps with " + targetCell.unit.name + ").";
      if (getTerrain(p, fromCol) === 'Divine Light' && state.board[p][fromCol]) teleportLog += " " + targetCell.unit.name + " is revealed (Divine Light).";
      log(teleportLog);
    }
    state.selectedUnit.column = toCol;
    state.moveDone = true;
    const movedCell = state.board[p][toCol];
    if (movedCell && (movedCell.bestiaryExtraMovesRemaining || 0) > 0) {
      movedCell.bestiaryExtraMovesRemaining--;
      state.actionStep = 'move';
      log("[Bestiary] Royal Caravan: " + movedCell.unit.name + " may move once more before attacking.");
    } else {
      state.actionStep = 'attack';
    }
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
    if (state.obscuringReorder) {
      doDoneObscuringReorder();
      return;
    }
    if (state.actionStep !== 'use_items') return;
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

  function getCpuPolicyProfile() {
    if (window.TacticlashCpu && typeof window.TacticlashCpu.getProfile === 'function') {
      return window.TacticlashCpu.getProfile(state.cpuDifficulty || 'easy');
    }
    return {
      key: 'easy',
      maxItemActions: 2,
      weights: {},
    };
  }

  function chooseCpuCandidate(candidates) {
    if (!candidates || candidates.length === 0) return null;
    const profile = getCpuPolicyProfile();
    if (window.TacticlashCpu && typeof window.TacticlashCpu.chooseBestCandidate === 'function') {
      return window.TacticlashCpu.chooseBestCandidate(candidates, profile);
    }
    return candidates[0];
  }

  function getUnitThreatScore(cell, col) {
    if (!cell || !cell.unit) return 0;
    let score = 1;
    if (cell.unit.class === 'Brawler') score += 1.6;
    else if (cell.unit.class === 'Lancer') score += 2;
    else if (cell.unit.class === 'Shooter') score += 2.4;
    else if (cell.unit.class === 'Caster') score += 2.5;
    if (cell.unit.level === 'Veteran') score += 1.4;
    if (cell.unit.class === 'Shooter' && (col === 0 || col === 4)) score += 0.9;
    score += getCellGearCards(cell).length * 1.2;
    score -= (cell.damage || 0) * 0.25;
    return Math.max(0, score);
  }

  function getCounterRiskScore(attackerCol, defenderCol, defenderCell) {
    if (!defenderCell || !defenderCell.unit) return 0;
    if (!defenderCell.faceUp) return 0;
    if (defenderCell.unit.class !== 'Lancer') return 0;
    return Math.abs(attackerCol - defenderCol) === 1 ? 1.6 : 0;
  }

  function getCpuPromptOwner(prompt) {
    if (!prompt) return null;
    if (prompt.type === 'tivalRetry' || prompt.type === 'cassaTwinArc' || prompt.type === 'ardanVeilstep') return prompt.attPlayer;
    if (prompt.type === 'unmakerSelfCaptureConfirm') return prompt.player;
    if (prompt.type === 'harlundOnHitSingle') return prompt.defPlayer;
    if (prompt.type === 'harlundOnHitArchmage') {
      return state.archmageMultiResolving ? state.archmageMultiResolving.defPlayer : state.currentPlayer;
    }
    return state.currentPlayer;
  }

  function hasBlockingHumanDecisionForCpu() {
    if (!isCpuMode()) return false;
    if (state.pendingWardstone && !isCpuPlayer(state.pendingWardstone.defPlayer)) return true;
    if (state.pendingVeteranPrompt) {
      const owner = getCpuPromptOwner(state.pendingVeteranPrompt);
      if (!isCpuPlayer(owner)) return true;
    }
    if (state.pendingCassaChoice && !isCpuPlayer(state.pendingCassaChoice.attPlayer)) return true;
    return false;
  }

  function getCpuBlockReason() {
    if (!isCpuMode()) return '';
    if (state.pendingWardstone && !isCpuPlayer(state.pendingWardstone.defPlayer)) {
      return 'pending Wardstone decision by Player ' + state.pendingWardstone.defPlayer;
    }
    if (state.pendingVeteranPrompt) {
      const owner = getCpuPromptOwner(state.pendingVeteranPrompt);
      if (!isCpuPlayer(owner)) return 'pending veteran prompt (' + state.pendingVeteranPrompt.type + ') by Player ' + owner;
    }
    if (state.pendingCassaChoice && !isCpuPlayer(state.pendingCassaChoice.attPlayer)) {
      return 'pending Cassa choice by Player ' + state.pendingCassaChoice.attPlayer;
    }
    return '';
  }

  function cpuNeedsAttention() {
    if (!isCpuMode() || state.phase !== 'playing' || state.gameOver) return false;
    if (hasBlockingHumanDecisionForCpu()) return false;
    if (isCpuTurn()) return true;
    if (state.pendingWardstone && isCpuPlayer(state.pendingWardstone.defPlayer)) return true;
    if (state.pendingVeteranPrompt && isCpuPlayer(getCpuPromptOwner(state.pendingVeteranPrompt))) return true;
    if (state.pendingCassaChoice && isCpuPlayer(state.pendingCassaChoice.attPlayer)) return true;
    if (state.pendingChronirChoice && isCpuTurn()) return true;
    if (state.obscuringReorder && isCpuPlayer(state.obscuringReorder.player)) return true;
    return false;
  }

  function maybeScheduleCpuTurn() {
    if (hasBlockingHumanDecisionForCpu()) {
      const reason = getCpuBlockReason();
      if (reason && state.cpuLastBlockReason !== reason) {
        state.cpuLastBlockReason = reason;
        log('[CPU] waiting for human prompt: ' + reason);
      }
      return;
    }
    state.cpuLastBlockReason = '';
    if (!cpuNeedsAttention()) return;
    if (state.cpuAnnouncing) return;
    if (state.cpuThinkTimer) return;
    state.cpuThinkTimer = window.setTimeout(function () {
      state.cpuThinkTimer = null;
      runCpuTurnStep();
    }, 260);
  }

  function clearCpuThinkTimer() {
    if (state.cpuThinkTimer) {
      window.clearTimeout(state.cpuThinkTimer);
      state.cpuThinkTimer = null;
    }
    if (state.cpuAnnounceTimer) {
      window.clearTimeout(state.cpuAnnounceTimer);
      state.cpuAnnounceTimer = null;
    }
    state.cpuPendingExecute = null;
    clearCpuHighlights();
    state.cpuAnnouncing = false;
  }

  // Called both by the auto-fire timeout and the "Continue" button.
  // Cancels any pending timer, clears announce state, then runs the stored action.
  function triggerCpuPendingStep() {
    if (state.cpuAnnounceTimer) {
      window.clearTimeout(state.cpuAnnounceTimer);
      state.cpuAnnounceTimer = null;
    }
    const fn = state.cpuPendingExecute;
    state.cpuPendingExecute = null;
    state.cpuAnnouncing = false;
    if (fn) fn();
  }

  var CPU_DELAY_SELECT = 1000;
  var CPU_DELAY_MOVE   = 1200;
  var CPU_DELAY_ATTACK = 1600;
  var CPU_DELAY_ITEM   = 1000;
  var CPU_DELAY_SKIP   = 600;

  function setCpuActionText(text) {
    if (turnStep) turnStep.textContent = text;
  }

  function addCpuHighlight(player, col, cssClass) {
    var slot = document.querySelector('.row--player' + player + ' .slot[data-column="' + col + '"]');
    if (slot) slot.classList.add(cssClass);
  }

  function clearCpuHighlights() {
    document.querySelectorAll('.slot--cpu-active, .slot--cpu-target').forEach(function (el) {
      el.classList.remove('slot--cpu-active', 'slot--cpu-target');
    });
  }

  function buildCpuAttackCandidates(attackerCol, attackerCell) {
    const candidates = [];
    for (let c = 0; c < 5; c++) {
      const targetCell = state.board[1][c];
      if (!targetCell) continue;
      if (!isInRangeWithCell(attackerCol, c, attackerCell)) continue;
      candidates.push({
        type: 'attack',
        targetCol: c,
        dimensions: {
          threatReduction: getUnitThreatScore(targetCell, c),
          counterRisk: getCounterRiskScore(attackerCol, c, targetCell),
          tempo: 1,
        },
      });
    }
    return candidates;
  }

  function pickCpuAttackTarget(attackerCol, attackerCell) {
    const candidates = buildCpuAttackCandidates(attackerCol, attackerCell);
    return chooseCpuCandidate(candidates);
  }

  function chooseCpuUnitToAct() {
    const candidates = [];
    for (let c = 0; c < 5; c++) {
      const cell = state.board[2][c];
      if (!cell) continue;
      if (cell.paralyzed || cell.cannotAttackNextTurn || cell.mustRestNextTurn) continue;
      const attackCandidates = buildCpuAttackCandidates(c, cell);
      const bestAttack = chooseCpuCandidate(attackCandidates);
      candidates.push({
        type: 'unit_select',
        col: c,
        dimensions: {
          threatReduction: bestAttack ? (bestAttack.dimensions.threatReduction || 0) : 0,
          counterRisk: bestAttack ? (bestAttack.dimensions.counterRisk || 0) : 0,
          tempo: 0.8,
        },
      });
    }
    return chooseCpuCandidate(candidates);
  }

  function chooseCpuMoveAction() {
    if (!state.selectedUnit || state.selectedUnit.player !== 2) return null;
    const fromCol = state.selectedUnit.column;
    const cell = state.board[2][fromCol];
    if (!cell) return null;
    const options = [{ type: 'skip', col: fromCol }];
    if (fromCol > 0 && state.board[2][fromCol - 1] != null) options.push({ type: 'left', col: fromCol - 1 });
    if (fromCol < 4 && state.board[2][fromCol + 1] != null) options.push({ type: 'right', col: fromCol + 1 });
    if (cellHasGearName(cell, 'Teleport Boots')) {
      for (let c = 0; c < 5; c++) {
        if (c === fromCol) continue;
        options.push({ type: 'teleport', col: c });
      }
    }
    const candidates = options.map(function (option) {
      const attackCandidates = buildCpuAttackCandidates(option.col, cell);
      const bestAttack = chooseCpuCandidate(attackCandidates);
      return {
        moveType: option.type,
        targetCol: option.col,
        dimensions: {
          threatReduction: bestAttack ? (bestAttack.dimensions.threatReduction || 0) : 0,
          counterRisk: bestAttack ? (bestAttack.dimensions.counterRisk || 0) : 0,
          boardControl: option.type === 'skip' ? 0 : 0.35,
          tempo: 0.5,
        },
      };
    });
    return chooseCpuCandidate(candidates);
  }

  function chooseCpuItemAction() {
    const hand = state.p2ItemHand || [];
    const candidates = [];

    function addCandidate(payload) {
      payload.dimensions = payload.dimensions || {};
      candidates.push(payload);
    }

    function terrainValueFor(name, ownerPlayer) {
      if (name === 'Unstable Ground') return ownerPlayer === 1 ? 2.2 : -1.6;
      if (name === 'Paralyzing Vines') return ownerPlayer === 1 ? 1.6 : -1.2;
      if (name === 'Divine Light') return ownerPlayer === 2 ? 1.2 : 0.2;
      if (name === 'Elevated Ground' || name === 'Reinforced Barricade') return ownerPlayer === 2 ? 1.3 : 0.2;
      return 0;
    }

    for (let i = 0; i < hand.length; i++) {
      const item = hand[i];
      if (!item || !item.name) continue;
      const name = item.name;
      const spec = ITEM_SPECS && ITEM_SPECS[name];

      if (name === 'Vorpal Honing Amulet') {
        const strongestEnemy = Math.max.apply(null, state.board[1].map(function (cell, col) {
          return getUnitThreatScore(cell, col);
        }));
        if (strongestEnemy > 3.4) {
          addCandidate({ kind: 'instant', itemName: name, handIndex: i, dimensions: { threatReduction: 2.2, itemValue: 2.4, tempo: 1.1 } });
        }
      } else if (name === 'Healing Potion') {
        for (let c = 0; c < 5; c++) {
          const cell = state.board[2][c];
          if (!cell || (cell.damage || 0) < 1) continue;
          addCandidate({
            kind: 'targeted',
            itemName: name,
            handIndex: i,
            targetPlayer: 2,
            targetCol: c,
            dimensions: { selfSurvivability: (cell.damage || 0) + 0.5, itemValue: 1.1, tempo: 0.4 },
          });
        }
      } else if (name === 'Tangle-Vine Bola') {
        for (let c = 0; c < 5; c++) {
          const cell = state.board[1][c];
          if (!cell) continue;
          addCandidate({
            kind: 'targeted',
            itemName: name,
            handIndex: i,
            targetPlayer: 1,
            targetCol: c,
            dimensions: { threatReduction: getUnitThreatScore(cell, c) + 0.6, itemValue: 1.3, tempo: 0.8 },
          });
        }
      } else if (name === 'All revealing lantern-jar') {
        for (let c = 0; c < 5; c++) {
          const cell = state.board[1][c];
          if (!cell || cell.faceUp) continue;
          addCandidate({
            kind: 'targeted',
            itemName: name,
            handIndex: i,
            targetPlayer: 1,
            targetCol: c,
            dimensions: { threatReduction: getUnitThreatScore(cell, c), itemValue: 1.2, boardControl: 0.8 },
          });
        }
      } else if (name === 'Corrosive Phial') {
        for (let pl = 1; pl <= 2; pl++) {
          for (let c = 0; c < 5; c++) {
            const cell = state.board[pl][c];
            if (!cell || !cell.faceUp || getCellGearCards(cell).length === 0) continue;
            const threat = getUnitThreatScore(cell, c);
            const bonus = pl === 1 ? 0.8 : -0.8;
            addCandidate({
              kind: 'targeted',
              itemName: name,
              handIndex: i,
              targetPlayer: pl,
              targetCol: c,
              dimensions: { threatReduction: threat + bonus, itemValue: 1.5, tempo: 0.5 },
            });
          }
        }
      } else if (name === 'Magic Grenade') {
        for (let c = 0; c < 5; c++) {
          const cell = state.board[2][c];
          if (!cell) continue;
          addCandidate({
            kind: 'targeted',
            itemName: name,
            handIndex: i,
            targetPlayer: 2,
            targetCol: c,
            dimensions: { threatReduction: 1.2 + getUnitThreatScore(cell, c) * 0.3, itemValue: 1.2, tempo: 1.1 },
          });
        }
      } else if (name === 'Tectonic Spike') {
        for (let pl = 1; pl <= 2; pl++) {
          for (let c = 0; c < 5; c++) {
            const terrain = state.terrain[pl][c];
            if (!terrain) continue;
            const value = terrainValueFor(terrain.name, pl);
            addCandidate({
              kind: 'targeted',
              itemName: name,
              handIndex: i,
              targetPlayer: pl,
              targetCol: c,
              dimensions: { terrainValue: -value, boardControl: 0.6, itemValue: 1.1 },
            });
          }
        }
      } else if (spec && (spec.type === 'gear_armor' || spec.type === 'gear_accessory' || spec.type === 'promotion')) {
        for (let c = 0; c < 5; c++) {
          const cell = state.board[2][c];
          if (!cell || !canEquipGear(cell, name)) continue;
          addCandidate({
            kind: 'targeted',
            itemName: name,
            handIndex: i,
            targetPlayer: 2,
            targetCol: c,
            dimensions: {
              selfSurvivability: 1.2 + ((cell.damage || 0) > 0 ? 0.5 : 0),
              itemValue: cell.unit.level === 'Veteran' ? 1.6 : 1.1,
              boardControl: 0.4,
            },
          });
        }
      } else if (spec && spec.type === 'terrain') {
        for (let pl = 1; pl <= 2; pl++) {
          for (let c = 0; c < 5; c++) {
            if (state.terrain[pl][c] != null) continue;
            addCandidate({
              kind: 'targeted',
              itemName: name,
              handIndex: i,
              targetPlayer: pl,
              targetCol: c,
              dimensions: {
                terrainValue: terrainValueFor(name, pl),
                boardControl: 0.7,
                itemValue: 1.0,
              },
            });
          }
        }
      }
    }

    return chooseCpuCandidate(candidates);
  }

  function applyCpuItemAction(action) {
    if (!action) return false;
    if (action.kind === 'instant' && action.itemName === 'Vorpal Honing Amulet') {
      applyVorpalHoningAmulet(action.handIndex);
      return true;
    }
    state.itemTargeting = { handIndex: action.handIndex, itemName: action.itemName };
    if (action.itemName === 'Healing Potion') applyHealingPotion(action.targetPlayer, action.targetCol);
    else if (action.itemName === 'All revealing lantern-jar') applyRevealingLight(action.targetPlayer, action.targetCol);
    else if (action.itemName === 'Tangle-Vine Bola') applyDisablingNet(action.targetPlayer, action.targetCol);
    else if (action.itemName === 'Corrosive Phial') applyCorrosivePhial(action.targetPlayer, action.targetCol);
    else if (action.itemName === 'Magic Grenade') applyMagicGrenade(action.targetPlayer, action.targetCol);
    else if (action.itemName === 'Tectonic Spike') applyTectonicSpike(action.targetPlayer, action.targetCol);
    else if (typeof TERRAIN_ITEM_NAMES !== 'undefined' && TERRAIN_ITEM_NAMES.indexOf(action.itemName) !== -1) applyPlaceTerrain(action.targetPlayer, action.targetCol);
    else applyEquipArmor(action.targetPlayer, action.targetCol);
    if (state.itemTargeting) state.itemTargeting = null;
    return true;
  }

  function cpuShouldUseWardstone() {
    const pending = state.pendingWardstone;
    if (!pending) return false;
    const defCell = state.board[pending.defPlayer] && state.board[pending.defPlayer][pending.defCol];
    if (!defCell) return false;
    const hpLeft = getMaxHP(defCell) - (defCell.damage || 0);
    if (hpLeft <= 1) return true;
    const profile = getCpuPolicyProfile();
    return profile.key === 'normal' && hpLeft <= 2;
  }

  function cpuShouldUsePrompt(prompt) {
    if (!prompt) return false;
    const profile = getCpuPolicyProfile();
    if (prompt.type === 'unmakerSelfCaptureConfirm') return false;
    if (prompt.type === 'ardanVeilstep') return profile.key === 'normal' && Math.random() < 0.5;
    if (prompt.type === 'tivalRetry') return true;
    if (prompt.type === 'cassaTwinArc') return true;
    if (prompt.type === 'harlundOnHitSingle' || prompt.type === 'harlundOnHitArchmage') return true;
    return false;
  }

  function runCpuTurnStep() {
    if (!cpuNeedsAttention()) return;
    if (state.pendingBestiaryReveal || state.pendingBestiaryContinue) return;
    if (hasBlockingHumanDecisionForCpu()) return;

    if (state.pendingWardstone && isCpuPlayer(state.pendingWardstone.defPlayer)) {
      if (cpuShouldUseWardstone()) doWardstoneUse();
      else doWardstoneNo();
      maybeScheduleCpuTurn();
      return;
    }

    if (state.pendingVeteranPrompt && isCpuPlayer(getCpuPromptOwner(state.pendingVeteranPrompt))) {
      if (cpuShouldUsePrompt(state.pendingVeteranPrompt)) doWardstoneUse();
      else doWardstoneNo();
      maybeScheduleCpuTurn();
      return;
    }

    if (state.pendingCassaChoice && isCpuPlayer(state.pendingCassaChoice.attPlayer)) {
      const targetCandidates = state.pendingCassaChoice.targetCols.map(function (col) {
        return {
          col: col,
          dimensions: { threatReduction: getUnitThreatScore(state.board[1][col], col), tempo: 1 },
        };
      });
      const chosen = chooseCpuCandidate(targetCandidates);
      if (chosen) resolvePendingCassaChoice(chosen.col);
      maybeScheduleCpuTurn();
      return;
    }

    if (state.pendingChronirChoice && isCpuTurn()) {
      const options = (state.pendingChronirChoice.targetCols || []).map(function (col) {
        return {
          col: col,
          dimensions: { threatReduction: getUnitThreatScore(state.board[1][col], col), tempo: 0.8 },
        };
      });
      const selected = chooseCpuCandidate(options);
      if (selected) resolvePendingChronirChoice(selected.col);
      maybeScheduleCpuTurn();
      return;
    }

    if (state.obscuringReorder && isCpuPlayer(state.obscuringReorder.player)) {
      doDoneWithItems();
      maybeScheduleCpuTurn();
      return;
    }

    if (!isCpuTurn()) return;

    if (state.actionStep === 'use_items') {
      if (state.itemTargeting) {
        state.itemTargeting = null;
        renderTurnUI();
        renderBoard();
        return;
      }
      if (state.cpuItemsUsedThisTurn == null) state.cpuItemsUsedThisTurn = 0;
      const profile = getCpuPolicyProfile();
      const action = chooseCpuItemAction();
      if (action && state.cpuItemsUsedThisTurn < (profile.maxItemActions || 2)) {
        const targetCell = (action.targetPlayer != null && action.targetCol != null)
          ? state.board[action.targetPlayer][action.targetCol] : null;
        const targetName = targetCell
          ? (targetCell.faceUp ? targetCell.unit.name : 'a unit') : null;
        setCpuActionText('CPU uses an item' + (targetName ? ' on ' + targetName : '') + '...');
        if (action.targetPlayer != null && action.targetCol != null) {
          addCpuHighlight(action.targetPlayer, action.targetCol, 'slot--cpu-target');
        }
        const capturedAction = action;
        state.cpuPendingExecute = function () {
          if (state.gameOver || !isCpuTurn()) { clearCpuHighlights(); return; }
          clearCpuHighlights();
          const applied = applyCpuItemAction(capturedAction);
          if (applied) state.cpuItemsUsedThisTurn++;
          maybeScheduleCpuTurn();
        };
        state.cpuAnnouncing = true;
        renderTurnUI();
        return;
      }
      doDoneWithItems();
      maybeScheduleCpuTurn();
      return;
    }

    if (state.actionStep === 'select_unit') {
      const unitChoice = chooseCpuUnitToAct();
      if (!unitChoice) {
        endTurn();
        return;
      }
      const selectCell = state.board[2][unitChoice.col];
      const selectName = selectCell && selectCell.faceUp ? selectCell.unit.name : 'a unit';
      setCpuActionText('CPU selects ' + selectName + '...');
      addCpuHighlight(2, unitChoice.col, 'slot--cpu-active');
      const chosenCol = unitChoice.col;
      state.cpuPendingExecute = function () {
        if (state.gameOver || !isCpuTurn()) { clearCpuHighlights(); return; }
        clearCpuHighlights();
        onSelectUnit(2, chosenCol);
        // onSelectUnit → renderBoard → maybeScheduleCpuTurn
      };
      state.cpuAnnouncing = true;
      renderTurnUI();
      return;
    }

    if (state.actionStep === 'move' && state.selectedUnit && state.selectedUnit.player === 2) {
      const move = chooseCpuMoveAction();
      const actingCol = state.selectedUnit.column;
      const actingCell = state.board[2][actingCol];
      const unitName = actingCell && actingCell.faceUp ? actingCell.unit.name : 'a unit';

      if (!move || move.moveType === 'skip') {
        setCpuActionText('CPU skips move...');
        state.cpuPendingExecute = function () {
          if (state.gameOver || !isCpuTurn()) return;
          doSkipMove();
        };
        state.cpuAnnouncing = true;
        renderTurnUI();
        return;
      }

      const dirLabel = move.moveType === 'teleport'
        ? 'teleport to column ' + move.targetCol
        : move.moveType;
      setCpuActionText('CPU moves ' + unitName + ' ' + dirLabel + '...');
      addCpuHighlight(2, actingCol, 'slot--cpu-active');
      const capturedMove = move;
      state.cpuPendingExecute = function () {
        if (state.gameOver || !isCpuTurn()) { clearCpuHighlights(); return; }
        clearCpuHighlights();
        if (capturedMove.moveType === 'left')          doMove('left');
        else if (capturedMove.moveType === 'right')    doMove('right');
        else if (capturedMove.moveType === 'teleport') doTeleportMove(capturedMove.targetCol);
        else doSkipMove();
        // Each calls renderBoard → maybeScheduleCpuTurn
      };
      state.cpuAnnouncing = true;
      renderTurnUI();
      return;
    }

    if (state.actionStep === 'attack' && state.selectedUnit && state.selectedUnit.player === 2) {
      const attCol = state.selectedUnit.column;
      const attCell = state.board[2][attCol];
      if (!attCell) {
        endTurn();
        return;
      }
      const target = pickCpuAttackTarget(attCol, attCell);
      if (!target) {
        doPass();
        return;
      }
      const defCell = state.board[1][target.targetCol];
      const defName = defCell && defCell.faceUp ? defCell.unit.name : 'one of your units';
      const attName = attCell.faceUp ? attCell.unit.name : 'a unit';
      setCpuActionText('CPU attacks your ' + defName + ' with ' + attName + '!');
      addCpuHighlight(2, attCol, 'slot--cpu-active');
      addCpuHighlight(1, target.targetCol, 'slot--cpu-target');
      const capturedAttCol = attCol;
      const capturedTargetCol = target.targetCol;
      state.cpuPendingExecute = function () {
        if (state.gameOver || !isCpuTurn()) { clearCpuHighlights(); return; }
        clearCpuHighlights();
        beginAttackAgainstTarget(2, capturedAttCol, 1, capturedTargetCol);
        maybeScheduleCpuTurn();
      };
      state.cpuAnnouncing = true;
      renderTurnUI();
      return;
    }
  }

  function doWardstoneUse() {
    if (state.pendingVeteranPrompt) {
      doVeteranPromptUse();
      return;
    }
    if (!state.pendingWardstone) return;
    const pw = state.pendingWardstone;
    const defCell = state.board[state.pendingWardstone.defPlayer][state.pendingWardstone.defCol];
    if (!defCell || !cellHasGearName(defCell, 'Wardstone Bracelet')) {
      state.pendingWardstone = null;
      renderTurnUI();
      renderBoard();
      return;
    }
    if (!state.itemDiscard) state.itemDiscard = [];
    state.itemDiscard.push(removeGearFromCell(defCell, 'Wardstone Bracelet'));
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
      const ar = state.archmageMultiResolving;
      const hitCol = maybeRedirectToHarlund(pw.defPlayer, pw.defCol, ar);
      if (hitCol == null) {
        log("Harlund's Pack Shield — protected ally ignores the rest of this attack sequence.");
        state.archmageMultiResolving.index++;
        continueArchmageMulti();
        return;
      }
      const packet = resolveDefenderVeteranPacket(ar.attPlayer, ar.attCol, ar.defPlayer, hitCol, { vorpalIgnoresDefenderVeterancy: ar.trueStrike && state.vorpalNextAttack === ar.attPlayer });
      if (!packet.canceled) {
        applyDamage(packet.finalPlayer, packet.finalCol, ar.damage || 1, "", false, { attackerPlayer: ar.attPlayer, attackerCol: ar.attCol });
        ar.ardanHitLanded = true;
        if (state.board[packet.finalPlayer][packet.finalCol]) {
          state.board[packet.finalPlayer][packet.finalCol].paralyzed = true;
          log(state.board[packet.finalPlayer][packet.finalCol].unit.name + " is paralyzed (Magic Paralysis).");
        }
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
    if (!cell || !cell.faceUp || getCellGearCards(cell).length === 0) return;
    const t = state.itemTargeting;
    if (!t || t.itemName !== 'Corrosive Phial') return;
    const hand = state.currentPlayer === 1 ? state.p1ItemHand : state.p2ItemHand;
    const item = hand[t.handIndex];
    if (!item || item.name !== 'Corrosive Phial') return;

    const gearRemoved = removeGearFromCell(cell);
    if (!state.itemDiscard) state.itemDiscard = [];
    state.itemDiscard.push(gearRemoved);
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
    const reord = state.obscuringReorder;
    const p = reord.player;
    if (reord.allowedCols && (reord.allowedCols.indexOf(colA) === -1 || reord.allowedCols.indexOf(colB) === -1)) return;
    const a = state.board[p][colA];
    const b = state.board[p][colB];
    state.board[p][colA] = b;
    state.board[p][colB] = a;
    state.obscuringReorder.selectedCol = null;
    if (reord.kind === 'ardan') {
      log("Ardan's Veilstep: columns " + colA + " and " + colB + " swapped.");
    } else {
      log("Swap: units at columns " + colA + " and " + colB + " exchanged.");
    }
    renderTurnUI();
    renderBoard();
  }

  function doDoneObscuringReorder() {
    if (!state.obscuringReorder) return;
    const reord = state.obscuringReorder;
    state.obscuringReorder = null;
    if (reord.kind === 'ardan') {
      log("Ardan's Veilstep complete.");
      continueAfterArdanVeilstep(reord.afterContext, reord.attackerPlayer, reord.attackerCol);
      return;
    }
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

    const hadPrimary = !!cell.gear;
    if (!cell.gear) {
      cell.gear = { name: item.name, id: item.id };
    } else if (!cell.bonusGear) {
      cell.bonusGear = { name: item.name, id: item.id };
    } else {
      return;
    }
    hand.splice(t.handIndex, 1);
    if (hadPrimary) {
      log("[Bestiary] The Iron-Clad Shield allows " + cell.unit.name + " to equip an additional gear: " + item.name + ".");
    } else {
      log("Player " + state.currentPlayer + " equips " + item.name + " on " + cell.unit.name + ".");
    }
    state.itemTargeting = null;
    renderTurnUI();
    renderBoard();
  }

  function applyDamage(player, col, damageAmount, logPrefix, skipLog, causeInfo) {
    const cell = state.board[player][col];
    if (!cell) return true;
    const bestiaryEffects = getBestiaryEffectsForUnit(cell.unit);
    const maxHP = getMaxHP(cell);
    const current = cell.damage || 0;
    const newTotal = current + damageAmount;
    cell.faceUp = true;
    if (newTotal >= maxHP) {
      if (!skipLog) log((logPrefix ? logPrefix + " " : "") + cell.unit.name + " is captured (0/" + maxHP + " HP).");
      if (!state.unitDiscard) state.unitDiscard = [];
      state.unitDiscard.push(cell.unit);
      if (cell.gear || cell.bonusGear) {
        if (!state.itemDiscard) state.itemDiscard = [];
        const gears = getCellGearCards(cell);
        for (let g = 0; g < gears.length; g++) state.itemDiscard.push(gears[g]);
      }
      state.board[player][col] = null;
      if (player === 1) {
        state.p2Captures = (state.p2Captures || 0) + 1;
        state.capturedLastTurn[1] = (state.capturedLastTurn[1] || 0) + 1;
        queueBestiaryRevealIfNeeded(2);
      } else {
        state.p1Captures = (state.p1Captures || 0) + 1;
        state.capturedLastTurn[2] = (state.capturedLastTurn[2] || 0) + 1;
        queueBestiaryRevealIfNeeded(1);
      }
      if (bestiaryEffects.ironMaiden > 0 && causeInfo && causeInfo.attackerPlayer != null && causeInfo.attackerCol != null) {
        const attackerCell = state.board[causeInfo.attackerPlayer] && state.board[causeInfo.attackerPlayer][causeInfo.attackerCol];
        if (attackerCell) {
          const heads = Math.random() < 0.5;
          if (heads) {
            log("[Bestiary] Iron Maiden: heads — " + attackerCell.unit.name + " is captured in retaliation.");
            applyDamage(causeInfo.attackerPlayer, causeInfo.attackerCol, getMaxHP(attackerCell), '', true);
          } else {
            log("[Bestiary] Iron Maiden: tails — no retaliation capture.");
          }
        }
      }
      flashDamageSlot(player, col);
      return true;
    }
    cell.damage = newTotal;
    if (!skipLog) log((logPrefix ? logPrefix + " " : "") + cell.unit.name + " takes " + damageAmount + " damage (" + newTotal + "/" + maxHP + " HP).");
    flashDamageSlot(player, col);
    return false;
  }

  function flashDamageSlot(player, col) {
    var dmgSlot = document.querySelector('.row--player' + player + ' .slot[data-column="' + col + '"]');
    if (!dmgSlot) return;
    dmgSlot.classList.remove('slot--cpu-damage');
    void dmgSlot.offsetWidth; // force reflow to restart animation if called twice rapidly
    dmgSlot.classList.add('slot--cpu-damage');
    window.setTimeout(function () { dmgSlot.classList.remove('slot--cpu-damage'); }, 420);
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
      (cellHasGearName(attCell, 'True-Strike Lens') && (attCell.unit.class === 'Shooter' || attCell.unit.class === 'Caster')) ||
      (cellHasGearName(attCell, "Sharpshooter's Scope") && attCell.unit.class === 'Shooter');

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
      if (maybeCaptureUnmakerOnReveal(defenderPlayer, defenderCol, "on attack reveal")) {
        attackHitDefender = false;
        tivalFailureReason = "target was captured by Unmaker on reveal";
        if (queueTivalRetryPrompt(attackerPlayer, attackerCol, defenderPlayer, defenderCol, tivalFailureReason)) {
          renderTurnUI();
          renderBoard();
          return;
        }
        finishResolvedCombatTurn();
        return;
      }
      const defHasBarbed = !!cellHasGearName(defCell, 'Barbed Gauntlets');
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
        const archmageMulti = effectiveClass === 'Caster' && attCell.unit.class === 'Caster' && cellHasGearName(attCell, "Archmage's Tome") && !attCell.nextAttackAsCaster;
        maybeApplyTorraGearBreak(attCell, defenderPlayer, defenderCol);
        const shooterLongshot = (effectiveClass === 'Shooter' && isLongshot(attackerCol, defenderCol));
        const bestiary = getBestiaryEffectsForUnit(attCell.unit);
        let damage = shooterLongshot
          ? 2
          : 1;
        damage += getRokkloDamageBonus(attCell);
        damage += getJorrenDamageBonus(attCell);
        damage += bestiary.primalAlpha;
        if (vorpalLethal) {
          damage = Math.max(1, getMaxHP(defCell) - (defCell.damage || 0));
          log("Vorpal Honing Amulet — lethal strike (" + damage + " damage).");
        } else if (shooterLongshot) {
          log("Longshot (edge to edge): 2 damage.");
        }
        if (bestiary.primalAlpha > 0) {
          log("[Bestiary] Primal Alpha: +" + bestiary.primalAlpha + " attack damage.");
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
            damage: damage,
            trueStrike: trueStrike,
            harlundUsed: false,
            harlundDeclineLogged: false,
            harlundPromptResolved: false,
            harlundDecision: 'no',
            protectedCol: null,
            ardanHitLanded: false
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
            defenderHadBarbedGauntlets = !!(finalTargetCell && cellHasGearName(finalTargetCell, 'Barbed Gauntlets'));
            attClassForBarbed = attCell.unit.class;
            attackAppliedToUnit = true;
            attackHitDefender = packet.landedOnOriginalTarget;
            if (!packet.landedOnOriginalTarget && packet.tivalFailureReason) {
              tivalFailureReason = packet.tivalFailureReason;
            }
            const captured = applyDamage(finalPlayer, finalCol, damage, "", false, { attackerPlayer: attackerPlayer, attackerCol: attackerCol });
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
    if (attackAppliedToUnit && queueArdanVeilstepPrompt(attackerPlayer, attackerCol, 'single')) {
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
      if (cellHasGearName(targetCell, 'Wardstone Bracelet')) {
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
      applyDamage(packet.finalPlayer, packet.finalCol, ar.damage || 1, "", false, { attackerPlayer: ar.attPlayer, attackerCol: ar.attCol });
      ar.ardanHitLanded = true;
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
    if (ar.ardanHitLanded && queueArdanVeilstepPrompt(ar.attPlayer, ar.attCol, 'archmage')) {
      renderTurnUI();
      renderBoard();
      return;
    }
    completeArchmageAttack(ar.attPlayer, ar.attCol);
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
    if (state.pendingBestiaryReveal || state.pendingBestiaryContinue) return;
    if (isCpuTurn()) return;

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

    if (state.obscuringReorder) {
      const reord = state.obscuringReorder;
      if (player !== reord.player || state.board[player][column] == null) return;
      if (reord.allowedCols && reord.allowedCols.indexOf(column) === -1) return;
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
        if (cell && cell.faceUp && getCellGearCards(cell).length > 0) applyCorrosivePhial(player, column);
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
      if (myCell && cellHasGearName(myCell, 'Teleport Boots') && column !== fromCol) {
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
    if (state.pendingBestiaryReveal || state.pendingBestiaryContinue) return;
    if (isCpuMode() && !isHumanTurn()) return;
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
      const isSingleUse = !!(spec && spec.type === 'single_use');
      if (isSingleUse && !canCurrentPlayerUseSingleUseItems()) {
        log("[Bestiary] Muzzled Beast blocks single-use item usage this turn.");
        return;
      }
      const singleUsePlayable = canCurrentPlayerUseSingleUseItems() && (itemName === 'Healing Potion' || itemName === 'All revealing lantern-jar' || itemName === 'Tangle-Vine Bola' || itemName === 'Vorpal Honing Amulet' || (itemName === 'Corrosive Phial' && countUnitsWithGear() > 0) || (itemName === 'Obscuring bomb' && countUnits(state.currentPlayer) > 0) || (itemName === 'Magic Grenade' && countUnits(state.currentPlayer) > 0));
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
    if (isCpuMode() && state.currentPlayer !== 1) {
      log('Debug: item draw replacement is only available for Player 1 in CPU mode.');
      return;
    }
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
    if (isCpuMode() && state.currentPlayer !== 1) return;
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
    if (btnBestiaryOpen) {
      btnBestiaryOpen.addEventListener('click', function () {
        openBestiaryModal(false);
      });
    }
    if (setupBestiaryEnabledEl) {
      setupBestiaryEnabledEl.addEventListener('change', function () {
        state.useBestiaryRules = !!setupBestiaryEnabledEl.checked;
      });
    }
    if (setupModeEl) {
      setupModeEl.addEventListener('change', function () {
        syncSetupModeControls();
      });
    }
    if (setupCpuCustomPlacementEl) {
      setupCpuCustomPlacementEl.addEventListener('change', function () {
        syncSetupModeControls();
      });
    }
    if (setupCpuDifficultyEl) {
      setupCpuDifficultyEl.addEventListener('change', function () {
        syncSetupModeControls();
      });
    }

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
    if (btnCpuContinue) btnCpuContinue.addEventListener('click', function () {
      if (!state.gameOver && state.cpuAnnouncing) triggerCpuPendingStep();
    });

    if (btnSaveLog) btnSaveLog.addEventListener('click', function () {
      if (state.phase === 'playing' || state.gameOver) downloadGameLog(false);
    });
    if (btnSaveLogAndNew) btnSaveLogAndNew.addEventListener('click', function () {
      downloadGameLog(true);
      doStartNewGame();
    });
    if (btnSkipLogAndNew) btnSkipLogAndNew.addEventListener('click', function () {
      doStartNewGame();
    });
    if (btnCancelNewGame) btnCancelNewGame.addEventListener('click', function () {
      if (saveLogModal) saveLogModal.hidden = true;
    });
    if (saveLogBackdrop) saveLogBackdrop.addEventListener('click', function () {
      if (saveLogModal) saveLogModal.hidden = true;
    });

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
    if (bestiaryCloseBtn && bestiaryModal) {
      bestiaryCloseBtn.addEventListener('click', closeBestiaryModal);
    }
    if (bestiaryBackdrop && bestiaryModal) {
      bestiaryBackdrop.addEventListener('click', closeBestiaryModal);
    }
    if (btnBestiaryReveal) btnBestiaryReveal.addEventListener('click', onBestiaryRevealConfirmed);
    if (btnBestiaryContinue) btnBestiaryContinue.addEventListener('click', onBestiaryContinueConfirmed);
    if (bestiaryGrid) {
      bestiaryGrid.addEventListener('change', function (e) {
        const target = e.target;
        if (!target || target.tagName !== 'SELECT') return;
        const kind = target.dataset.kind;
        const col = parseInt(target.dataset.column, 10);
        if (!kind || Number.isNaN(col)) return;
        applyBestiaryDebugControlChange(col, kind, target.value);
      });
    }
    if (itemZoomCloseBtn && itemZoomModal) {
      itemZoomCloseBtn.addEventListener('click', closeItemZoom);
    }
    if (itemZoomBackdrop && itemZoomModal) {
      itemZoomBackdrop.addEventListener('click', closeItemZoom);
    }
    syncSetupModeControls();
  });

  function openUnitZoom(player, col) {
    const cell = state.board[player][col];
    if (!cell || !unitZoomModal) return;
    const maskedForViewer = shouldMaskForViewer(player, 1, cell);
    const unit = cell.unit;
    const unitImgWrap = document.getElementById('unit-zoom-unit');
    const gearImgWrap = document.getElementById('unit-zoom-gear');
    const gear2Slot = document.getElementById('unit-zoom-gear-2-slot');
    const gear2ImgWrap = document.getElementById('unit-zoom-gear-2');
    const terrainImgWrap = document.getElementById('unit-zoom-terrain');
    const markersEl = document.getElementById('unit-zoom-markers');
    if (!unitImgWrap || !markersEl) return;
    const unitSrc = maskedForViewer ? 'assets/units/unit-card-back.png' : getUnitCardImagePath(unit);
    const unitAlt = maskedForViewer ? 'Hidden enemy unit' : (unit.name || 'Unit');
    unitImgWrap.innerHTML = '<img src="' + unitSrc + '" alt="' + unitAlt + '" onerror="this.src=\'assets/units/unit-placeholder-for-dev.png\'">';
    markersEl.innerHTML = '';
    if (!maskedForViewer) {
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
    }
    if (cell.gear && gearImgWrap) {
      const gsrc = maskedForViewer ? 'assets/items/item-card-back.png' : getItemCardImagePath(cell.gear.name || '');
      const gearAlt = maskedForViewer ? 'Hidden enemy gear' : (cell.gear.name || '');
      gearImgWrap.innerHTML = '<img src="' + gsrc + '" alt="' + gearAlt + '" onerror="this.src=\'assets/items/item-placeholder-for-dev.png\'">';
    } else if (gearImgWrap) gearImgWrap.innerHTML = '';
    const bestiaryEffects = getBestiaryEffectsForUnit(cell.unit);
    const showExtraGearSlot = bestiaryEffects.ironCladShield > 0;
    if (gear2Slot) gear2Slot.hidden = !showExtraGearSlot;
    if (showExtraGearSlot && cell.bonusGear && gear2ImgWrap) {
      const g2src = maskedForViewer ? 'assets/items/item-card-back.png' : getItemCardImagePath(cell.bonusGear.name || '');
      const gear2Alt = maskedForViewer ? 'Hidden enemy gear' : (cell.bonusGear.name || '');
      gear2ImgWrap.innerHTML = '<img src="' + g2src + '" alt="' + gear2Alt + '" onerror="this.src=\'assets/items/item-placeholder-for-dev.png\'">';
    } else if (gear2ImgWrap) {
      gear2ImgWrap.innerHTML = '';
    }
    const terr = state.terrain && state.terrain[player] && state.terrain[player][col];
    if (terr && terrainImgWrap) {
      const tsrc = getItemCardImagePath(terr.name || '');
      terrainImgWrap.innerHTML = '<img src="' + tsrc + '" alt="' + (terr.name || '') + '" onerror="this.src=\'assets/items/item-placeholder-for-dev.png\'">';
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
