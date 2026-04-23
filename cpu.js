/**
 * Tacticlash CPU policy helpers.
 * Shared scoring primitives keep Easy/Normal/Hard on one extensible pipeline.
 */
(function () {
  const PROFILE_PRESETS = {
    easy: {
      key: 'easy',
      maxItemActions: 2,
      randomTopN: 2,
      weights: {
        threatReduction: 2.1,
        selfSurvivability: 1.4,
        boardControl: 1.1,
        itemValue: 1.1,
        terrainValue: 1.2,
        counterRisk: -1.4,
        tempo: 0.8,
      },
    },
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
        counterRisk: -1.8,
        tempo: 1.1,
      },
    },
  };

  function getProfile(difficulty) {
    if (difficulty && PROFILE_PRESETS[difficulty]) return PROFILE_PRESETS[difficulty];
    return PROFILE_PRESETS.easy;
  }

  function scoreCandidate(candidate, profile) {
    const p = profile || getProfile('easy');
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
    const p = profile || getProfile('easy');
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
