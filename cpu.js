/**
 * Tacticlash CPU policy helpers.
 * Shared scoring primitives keep Normal/Hard on one extensible pipeline.
 * Hard difficulty uses the same backbone as Normal for v1; lookahead foresight
 * (2-turn depth) is the planned v2 differentiator and is not yet active.
 */
(function () {
  const PROFILE_PRESETS = {
    normal: {
      key: 'normal',
      maxItemActions: 3,
      randomTopN: 1,
      weights: {
        threatReduction: 2.4,
        selfSurvivability: 1.7,
        boardControl: 1.5,
        itemValue: 1.8,
        terrainValue: 1.5,
        counterRisk: -2.2,
        tempo: 1.1,
      },
    },
    hard: {
      key: 'hard',
      maxItemActions: 4,
      randomTopN: 1,
      weights: {
        threatReduction: 2.6,
        selfSurvivability: 1.9,
        boardControl: 1.7,
        itemValue: 2.0,
        terrainValue: 1.7,
        counterRisk: -2.5,
        tempo: 1.2,
      },
    },
  };

  function getProfile(difficulty) {
    if (difficulty && PROFILE_PRESETS[difficulty]) return PROFILE_PRESETS[difficulty];
    return PROFILE_PRESETS.normal;
  }

  function scoreCandidate(candidate, profile) {
    const p = profile || getProfile('normal');
    const dims = candidate.dimensions || {};
    const weights = p.weights || {};
    let score = 0;
    Object.keys(weights).forEach(function (k) {
      const weight = weights[k] || 0;
      const value = dims[k] || 0;
      score += weight * value;
    });
    return score;
  }

  function chooseBestCandidate(candidates, profile) {
    if (!candidates || candidates.length === 0) return null;
    const p = profile || getProfile('normal');
    const ranked = candidates
      .map(function (candidate) {
        return {
          candidate: candidate,
          score: scoreCandidate(candidate, p),
        };
      })
      .sort(function (a, b) {
        return b.score - a.score;
      });
    const topN = Math.max(1, Math.min(ranked.length, p.randomTopN || 1));
    if (topN === 1) return ranked[0].candidate;
    const randomPick = ranked[Math.floor(Math.random() * topN)];
    return randomPick.candidate;
  }

  window.TacticlashCpu = {
    getProfile: getProfile,
    scoreCandidate: scoreCandidate,
    chooseBestCandidate: chooseBestCandidate,
  };
})();
