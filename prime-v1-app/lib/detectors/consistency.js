/**
 * Détecteur PRIME — Consistance
 *
 * Objectif :
 * Identifier une stabilité récente dans l’exécution du trader à partir de :
 * - la régularité des scores de discipline ;
 * - le respect du plan ;
 * - la continuité sur les dernières sessions.
 *
 * Le détecteur retourne :
 * - un insight standardisé ;
 * - ou null si les données sont insuffisantes ou peu concluantes.
 */

const MINIMUM_SESSIONS = 5;
const ANALYSIS_WINDOW = 10;

/**
 * Détecte une phase de consistance comportementale.
 *
 * @param {Array<Object>} sessions
 * @returns {Object|null}
 */
export function detectConsistency(sessions = []) {
  const closedSessions = getClosedSessions(sessions);

  if (closedSessions.length < MINIMUM_SESSIONS) {
    return null;
  }

  const recentSessions = closedSessions.slice(0, ANALYSIS_WINDOW);

  const scores = recentSessions
    .map((session) => toValidScore(session.discipline_score))
    .filter((score) => score !== null);

  if (scores.length < MINIMUM_SESSIONS) {
    return null;
  }

  const averageScore = Math.round(average(scores));
  const scoreDeviation = Math.round(standardDeviation(scores));

  const sessionsWithPlanInformation = recentSessions.filter(
    (session) =>
      session.plan_respected === true ||
      session.plan_respected === false
  );

  const respectedPlanCount = sessionsWithPlanInformation.filter(
    (session) => session.plan_respected === true
  ).length;

  const planRespectRate =
    sessionsWithPlanInformation.length > 0
      ? Math.round(
          (respectedPlanCount / sessionsWithPlanInformation.length) * 100
        )
      : 0;

  const planStreak = getCurrentPlanStreak(recentSessions);
  const strongScoreStreak = getCurrentScoreStreak(recentSessions, 75);

  const stableScores = scoreDeviation <= 12;
  const strongAverage = averageScore >= 75;
  const reliablePlanRate =
    sessionsWithPlanInformation.length >= 4 &&
    planRespectRate >= 70;

  const consistencyDetected =
    (stableScores && strongAverage && reliablePlanRate) ||
    planStreak >= 4 ||
    strongScoreStreak >= 5;

  if (!consistencyDetected) {
    return null;
  }

  const confidence = calculateConfidence({
    totalSessions: closedSessions.length,
    analyzedSessions: recentSessions.length,
    scoredSessions: scores.length,
    sessionsWithPlanInformation: sessionsWithPlanInformation.length,
    stableScores,
    planStreak,
    strongScoreStreak,
  });

  const priority = calculatePriority({
    averageScore,
    scoreDeviation,
    planRespectRate,
    planStreak,
    strongScoreStreak,
  });

  const message = buildConsistencyMessage({
    averageScore,
    scoreDeviation,
    planRespectRate,
    planStreak,
    strongScoreStreak,
  });

  return {
    id: "consistency",
    priority,
    confidence,
    category: "consistency",

    title: "Aujourd’hui PRIME remarque...",

    insight: message.insight,

    explanation: message.explanation,

    action: message.action,

    data: {
      analyzedSessions: recentSessions.length,
      totalSessions: closedSessions.length,
      averageScore,
      scoreDeviation,
      planRespectRate,
      planStreak,
      strongScoreStreak,
    },
  };
}

/**
 * Garde uniquement les sessions clôturées et les trie
 * de la plus récente à la plus ancienne.
 */
function getClosedSessions(sessions) {
  if (!Array.isArray(sessions)) {
    return [];
  }

  return sessions
    .filter(
      (session) =>
        session &&
        session.status === "closed" &&
        session.created_at
    )
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
    );
}

/**
 * Transforme un score en nombre valide compris entre 0 et 100.
 */
function toValidScore(value) {
  const score = Number(value);

  if (
    Number.isNaN(score) ||
    score < 0 ||
    score > 100
  ) {
    return null;
  }

  return score;
}

/**
 * Calcule une moyenne simple.
 */
function average(values) {
  if (!values.length) {
    return 0;
  }

  return (
    values.reduce((sum, value) => sum + value, 0) /
    values.length
  );
}

/**
 * Mesure la dispersion des scores.
 *
 * Une faible dispersion signifie que le trader produit
 * des scores proches les uns des autres.
 */
function standardDeviation(values) {
  if (!values.length) {
    return 0;
  }

  const mean = average(values);

  const variance =
    values.reduce((sum, value) => {
      return sum + Math.pow(value - mean, 2);
    }, 0) / values.length;

  return Math.sqrt(variance);
}

/**
 * Calcule la série actuelle de sessions avec plan respecté.
 *
 * Les sessions sont déjà classées de la plus récente
 * à la plus ancienne.
 */
function getCurrentPlanStreak(sessions) {
  let streak = 0;

  for (const session of sessions) {
    if (session.plan_respected === true) {
      streak += 1;
      continue;
    }

    break;
  }

  return streak;
}

/**
 * Calcule la série actuelle de scores supérieurs
 * ou égaux au seuil demandé.
 */
function getCurrentScoreStreak(sessions, threshold) {
  let streak = 0;

  for (const session of sessions) {
    const score = toValidScore(session.discipline_score);

    if (score !== null && score >= threshold) {
      streak += 1;
      continue;
    }

    break;
  }

  return streak;
}

/**
 * Estime la fiabilité de l’insight.
 *
 * Le volume de données crée la base de confiance.
 * Les signaux convergents augmentent ensuite cette valeur.
 */
function calculateConfidence({
  totalSessions,
  analyzedSessions,
  scoredSessions,
  sessionsWithPlanInformation,
  stableScores,
  planStreak,
  strongScoreStreak,
}) {
  let confidence = 20;

  if (totalSessions >= 5) confidence = 42;
  if (totalSessions >= 10) confidence = 58;
  if (totalSessions >= 20) confidence = 72;
  if (totalSessions >= 50) confidence = 86;
  if (totalSessions >= 100) confidence = 94;

  if (analyzedSessions >= 10) {
    confidence += 3;
  }

  if (scoredSessions === analyzedSessions) {
    confidence += 3;
  }

  if (sessionsWithPlanInformation >= 7) {
    confidence += 3;
  }

  if (stableScores) {
    confidence += 3;
  }

  if (planStreak >= 5) {
    confidence += 4;
  }

  if (strongScoreStreak >= 6) {
    confidence += 4;
  }

  return clamp(Math.round(confidence), 0, 100);
}

/**
 * Définit l’importance de l’insight par rapport
 * aux autres détecteurs PRIME.
 *
 * Une consistance forte reste importante, mais ne doit pas
 * dépasser une alerte critique de revenge ou de risque.
 */
function calculatePriority({
  averageScore,
  scoreDeviation,
  planRespectRate,
  planStreak,
  strongScoreStreak,
}) {
  let priority = 68;

  if (averageScore >= 80) priority += 4;
  if (averageScore >= 90) priority += 3;

  if (scoreDeviation <= 10) priority += 4;
  if (scoreDeviation <= 6) priority += 3;

  if (planRespectRate >= 80) priority += 4;
  if (planRespectRate === 100) priority += 3;

  if (planStreak >= 5) priority += 5;
  if (strongScoreStreak >= 6) priority += 4;

  return clamp(priority, 0, 89);
}

/**
 * Produit une formulation adaptée au signal dominant.
 */
function buildConsistencyMessage({
  averageScore,
  scoreDeviation,
  planRespectRate,
  planStreak,
  strongScoreStreak,
}) {
  if (planStreak >= 5 && averageScore >= 80) {
    return {
      insight: `Tu respectes ton plan depuis ${planStreak} sessions consécutives, avec une discipline moyenne de ${averageScore} %.`,

      explanation:
        "Cette répétition indique que ton cadre commence à devenir un automatisme plutôt qu’un effort ponctuel.",

      action:
        "Continue de protéger exactement le même processus. Ne cherche pas à augmenter ton activité simplement parce que ta série est positive.",
    };
  }

  if (strongScoreStreak >= 5) {
    return {
      insight: `Tes ${strongScoreStreak} dernières sessions sont restées au-dessus de 75 % de discipline.`,

      explanation:
        "Ta qualité d’exécution reste élevée sur plusieurs sessions consécutives. PRIME observe une structure comportementale plus stable.",

      action:
        "Conserve les mêmes règles de préparation et surveille surtout l’excès de confiance.",
    };
  }

  if (scoreDeviation <= 8 && averageScore >= 75) {
    return {
      insight: `Tes scores récents sont particulièrement réguliers autour de ${averageScore} %.`,

      explanation:
        "Le faible écart entre tes sessions montre que ton comportement dépend moins des résultats isolés du marché.",

      action:
        "Cherche maintenant à améliorer une seule variable de ton processus sans déstabiliser le reste.",
    };
  }

  return {
    insight: `Ton exécution devient plus constante : ${planRespectRate} % de plans respectés sur tes sessions récentes.`,

    explanation:
      "PRIME observe une répétition suffisamment claire pour distinguer une habitude en construction d’une simple bonne session.",

    action:
      "Continue de privilégier la répétition d’un processus propre plutôt que la recherche de performances exceptionnelles.",
  };
}

/**
 * Maintient une valeur entre un minimum et un maximum.
 */
function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

export default detectConsistency;
