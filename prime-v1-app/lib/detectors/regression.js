/**
 * Détecteur PRIME — Regression
 *
 * Objectif :
 * Détecter une dégradation comportementale réelle et récente
 * en comparant les dernières sessions à la période précédente.
 *
 * PRIME observe notamment :
 *
 * - la baisse du score moyen ;
 * - la diminution du respect du plan ;
 * - l’augmentation des erreurs ;
 * - la répétition de sessions faibles ;
 * - la récence de la dérive.
 *
 * Le détecteur retourne :
 * - un insight standardisé ;
 * - ou null si les données sont insuffisantes.
 */

const MINIMUM_SESSIONS = 8;
const RECENT_WINDOW = 5;
const PREVIOUS_WINDOW = 5;
const MINIMUM_SCORE_DECLINE = 6;

/**
 * Détecte une régression comportementale récente.
 *
 * @param {Array<Object>} sessions
 * @returns {Object|null}
 */
export function detectRegression(
  sessions = []
) {
  const closedSessions =
    getClosedSessions(sessions);

  if (
    closedSessions.length <
    MINIMUM_SESSIONS
  ) {
    return null;
  }

  const recentSessions =
    closedSessions.slice(
      0,
      RECENT_WINDOW
    );

  const previousSessions =
    closedSessions.slice(
      RECENT_WINDOW,
      RECENT_WINDOW +
        PREVIOUS_WINDOW
    );

  if (
    recentSessions.length < 4 ||
    previousSessions.length < 3
  ) {
    return null;
  }

  const recentScores =
    getValidScores(
      recentSessions
    );

  const previousScores =
    getValidScores(
      previousSessions
    );

  if (
    recentScores.length < 4 ||
    previousScores.length < 3
  ) {
    return null;
  }

  const recentAverage =
    Math.round(
      average(recentScores)
    );

  const previousAverage =
    Math.round(
      average(previousScores)
    );

  const scoreDelta =
    recentAverage -
    previousAverage;

  const recentPlanRate =
    getPlanRespectRate(
      recentSessions
    );

  const previousPlanRate =
    getPlanRespectRate(
      previousSessions
    );

  const planDelta =
    recentPlanRate !== null &&
    previousPlanRate !== null
      ? recentPlanRate -
        previousPlanRate
      : null;

  const recentErrorRate =
    getErrorRate(
      recentSessions
    );

  const previousErrorRate =
    getErrorRate(
      previousSessions
    );

  const errorDelta =
    recentErrorRate -
    previousErrorRate;

  const lowDisciplineSessions =
    recentSessions.filter(
      (session) => {
        const score =
          toValidScore(
            session.discipline_score
          );

        return (
          score !== null &&
          score < 65
        );
      }
    ).length;

  const recentLowStreak =
    getCurrentLowScoreStreak(
      recentSessions,
      65
    );

  const signals = {
    scoreDeclined:
      scoreDelta <=
      -MINIMUM_SCORE_DECLINE,

    planDeclined:
      planDelta !== null &&
      planDelta <= -15,

    errorsIncreased:
      errorDelta >= 20,

    repeatedLowScores:
      lowDisciplineSessions >= 3,

    activeLowStreak:
      recentLowStreak >= 3,
  };

  const negativeSignals =
    Object.values(signals)
      .filter(Boolean)
      .length;

  const regressionDetected =
    signals.scoreDeclined &&
    negativeSignals >= 2;

  const criticalRegressionDetected =
    signals.activeLowStreak &&
    negativeSignals >= 2;

  if (
    !regressionDetected &&
    !criticalRegressionDetected
  ) {
    return null;
  }

  const regressionType =
    criticalRegressionDetected
      ? "critical"
      : "warning";

  const confidence =
    calculateConfidence({
      totalSessions:
        closedSessions.length,

      recentSessions:
        recentSessions.length,

      previousSessions:
        previousSessions.length,

      scoreDelta,

      planDelta,

      errorDelta,

      lowDisciplineSessions,

      recentLowStreak,

      negativeSignals,
    });

  const priority =
    calculatePriority({
      regressionType,

      scoreDelta,

      planDelta,

      errorDelta,

      lowDisciplineSessions,

      recentLowStreak,

      negativeSignals,
    });
    const message =
    buildRegressionMessage({
      regressionType,

      recentAverage,

      previousAverage,

      scoreDelta,

      recentPlanRate,

      previousPlanRate,

      planDelta,

      recentErrorRate,

      previousErrorRate,

      errorDelta,

      lowDisciplineSessions,

      recentLowStreak,

      negativeSignals,
    });

  return {
    id:
      regressionType === "critical"
        ? "regression-critical"
        : "regression-warning",

    priority,

    confidence,

    category: "risk",

    title:
      "Aujourd’hui PRIME remarque...",

    insight:
      message.insight,

    explanation:
      message.explanation,

    action:
      message.action,

    data: {
      totalSessions:
        closedSessions.length,

      analyzedSessions:
        recentSessions.length +
        previousSessions.length,

      recentAverage,

      previousAverage,

      scoreDelta,

      recentPlanRate,

      previousPlanRate,

      planDelta,

      recentErrorRate,

      previousErrorRate,

      errorDelta,

      lowDisciplineSessions,

      recentLowStreak,

      negativeSignals,

      regressionType,

      recencyScore:
        getRecencyScore(
          recentSessions[0]?.created_at
        ),
    },
  };
}

/**
 * Garde uniquement les sessions clôturées
 * et les trie de la plus récente
 * à la plus ancienne.
 */

function getClosedSessions(
  sessions
) {
  if (!Array.isArray(sessions)) {
    return [];
  }

  return sessions
    .filter((session) => {
      return (
        session &&
        session.status === "closed" &&
        session.created_at
      );
    })

    .sort((a, b) => {
      return (
        new Date(
          b.created_at
        ).getTime() -
        new Date(
          a.created_at
        ).getTime()
      );
    });
}

/**
 * Récupère uniquement
 * les scores valides.
 */

function getValidScores(
  sessions
) {
  return sessions
    .map((session) =>
      toValidScore(
        session.discipline_score
      )
    )
    .filter(
      (score) =>
        score !== null
    );
}

/**
 * Calcule le taux
 * de respect du plan.
 */

function getPlanRespectRate(
  sessions
) {
  const sessionsWithPlan =
    sessions.filter(
      (session) => {
        return (
          session.plan_respected === true ||
          session.plan_respected === false
        );
      }
    );

  if (
    sessionsWithPlan.length === 0
  ) {
    return null;
  }

  const respected =
    sessionsWithPlan.filter(
      (session) =>
        session.plan_respected === true
    ).length;

  return Math.round(
    (
      respected /
      sessionsWithPlan.length
    ) * 100
  );
}

/**
 * Calcule le taux
 * de sessions avec erreur.
 */

function getErrorRate(
  sessions
) {
  if (!sessions.length) {
    return 0;
  }

  const sessionsWithError =
    sessions.filter((session) => {
      return (
        typeof session.dominant_error ===
          "string" &&
        session.dominant_error
          .trim()
          .length > 0
      );
    }).length;

  return Math.round(
    (
      sessionsWithError /
      sessions.length
    ) * 100
  );
}

/**
 * Calcule la série actuelle
 * de scores sous le seuil donné.
 */

function getCurrentLowScoreStreak(
  sessions,
  threshold
) {
  let streak = 0;

  for (const session of sessions) {
    const score =
      toValidScore(
        session.discipline_score
      );

    if (
      score !== null &&
      score < threshold
    ) {
      streak += 1;
      continue;
    }

    break;
  }

  return streak;
}

/**
 * Convertit une valeur
 * en score valide de 0 à 100.
 */

function toValidScore(
  value
) {
  const score =
    Number(value);

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
    values.reduce(
      (sum, value) =>
        sum + value,
      0
    ) / values.length
  );
}
/**
 * Calcule le niveau de confiance
 * de l’insight Regression.
 */

function calculateConfidence({
  totalSessions,
  recentSessions,
  previousSessions,
  scoreDelta,
  planDelta,
  errorDelta,
  lowDisciplineSessions,
  recentLowStreak,
  negativeSignals,
}) {
  let confidence = 40;

  if (totalSessions >= 10) {
    confidence += 8;
  }

  if (totalSessions >= 20) {
    confidence += 10;
  }

  if (totalSessions >= 50) {
    confidence += 10;
  }

  if (recentSessions >= 5) {
    confidence += 4;
  }

  if (previousSessions >= 5) {
    confidence += 4;
  }

  if (scoreDelta <= -10) {
    confidence += 6;
  }

  if (
    planDelta !== null &&
    planDelta <= -20
  ) {
    confidence += 5;
  }

  if (errorDelta >= 25) {
    confidence += 5;
  }

  if (lowDisciplineSessions >= 3) {
    confidence += 5;
  }

  if (recentLowStreak >= 3) {
    confidence += 7;
  }

  if (negativeSignals >= 3) {
    confidence += 6;
  }

  return clamp(
    Math.round(confidence),
    0,
    100
  );
}

/**
 * Définit la priorité
 * de l’insight Regression.
 */

function calculatePriority({
  regressionType,
  scoreDelta,
  planDelta,
  errorDelta,
  lowDisciplineSessions,
  recentLowStreak,
  negativeSignals,
}) {
  let priority =
    regressionType === "critical"
      ? 88
      : 80;

  if (scoreDelta <= -8) {
    priority += 4;
  }

  if (scoreDelta <= -12) {
    priority += 4;
  }

  if (
    planDelta !== null &&
    planDelta <= -20
  ) {
    priority += 4;
  }

  if (errorDelta >= 25) {
    priority += 4;
  }

  if (lowDisciplineSessions >= 3) {
    priority += 4;
  }

  if (recentLowStreak >= 3) {
    priority += 6;
  }

  if (negativeSignals >= 3) {
    priority += 4;
  }

  return clamp(
    priority,
    0,
    regressionType === "critical"
      ? 98
      : 92
  );
}

/**
 * Calcule la récence
 * du signal Regression.
 */

function getRecencyScore(
  latestSessionAt
) {
  if (!latestSessionAt) {
    return 0;
  }

  const latestDate =
    new Date(
      latestSessionAt
    ).getTime();

  if (
    Number.isNaN(latestDate)
  ) {
    return 0;
  }

  const daysSince =
    Math.floor(
      (
        Date.now() -
        latestDate
      ) /
      (
        1000 *
        60 *
        60 *
        24
      )
    );

  if (daysSince <= 3) {
    return 100;
  }

  if (daysSince <= 7) {
    return 85;
  }

  if (daysSince <= 14) {
    return 65;
  }

  if (daysSince <= 30) {
    return 45;
  }

  return 20;
}

/**
 * Produit le message adapté
 * au signal de régression.
 */

function buildRegressionMessage({
  regressionType,
  recentAverage,
  previousAverage,
  scoreDelta,
  recentPlanRate,
  previousPlanRate,
  planDelta,
  recentErrorRate,
  previousErrorRate,
  errorDelta,
  lowDisciplineSessions,
  recentLowStreak,
  negativeSignals,
}) {
  if (
    regressionType === "critical" &&
    recentLowStreak >= 3
  ) {
    return {
      insight:
        `Tes ${recentLowStreak} dernières sessions sont restées sous 65 % de discipline.`,

      explanation:
        "PRIME détecte une dérive active et répétée. Ce signal ne ressemble plus à une simple mauvaise session isolée.",

      action:
        "Réduis immédiatement ton activité, reviens à ta checklist complète et impose une session d’observation si nécessaire.",
    };
  }

  if (
    scoreDelta <= -10 &&
    planDelta !== null &&
    planDelta <= -20
  ) {
    return {
      insight:
        `Ta discipline recule de ${Math.abs(
          scoreDelta
        )} points et ton respect du plan baisse de ${Math.abs(
          planDelta
        )} points sur tes sessions récentes.`,

      explanation:
        "PRIME observe une dégradation simultanée du score et du cadre d’exécution. Les deux signaux convergent vers une vraie régression comportementale.",

      action:
        "Ne modifie pas ta stratégie. Reviens d’abord à ton processus de base et protège une seule règle non négociable.",
    };
  }

  if (errorDelta >= 25) {
    return {
      insight:
        `Les erreurs déclarées ont augmenté de ${errorDelta} points sur la période récente.`,

      explanation:
        `Le taux de sessions avec erreur est passé de ${previousErrorRate} % à ${recentErrorRate} %, tandis que ta discipline moyenne recule.`,

      action:
        "Identifie l’erreur qui se répète le plus et concentre toute ta prochaine semaine sur sa réduction.",
    };
  }
    if (
    lowDisciplineSessions >= 3
  ) {
    return {
      insight:
        `${lowDisciplineSessions} de tes ${RECENT_WINDOW} dernières sessions sont sous 65 % de discipline.`,

      explanation:
        `Ta moyenne récente est de ${recentAverage} %, contre ${previousAverage} % sur la période précédente. PRIME observe une baisse suffisamment nette pour nécessiter de la vigilance.`,

      action:
        "Réduis la complexité de ton process pendant quelques sessions. Reviens à un cadre simple, mesurable et strict.",
    };
  }

  if (
    scoreDelta <=
    -MINIMUM_SCORE_DECLINE
  ) {
    return {
      insight:
        `Ta discipline récente recule de ${Math.abs(
          scoreDelta
        )} points.`,

      explanation:
        `Ta moyenne est passée de ${previousAverage} % à ${recentAverage} % entre les deux périodes analysées.`,

      action:
        "Ne cherche pas à compenser cette baisse par davantage de trades. Reviens à la qualité d’exécution avant le résultat.",
    };
  }

  return {
    insight:
      "PRIME détecte une dégradation récente de ton exécution.",

    explanation:
      `${negativeSignals} signaux convergent entre la discipline, le respect du plan, la fréquence des erreurs et les scores faibles.`,

    action:
      "Considère les prochaines sessions comme une phase de stabilisation. Ton objectif est de retrouver ton cadre, pas de récupérer une performance.",
  };
}

/**
 * Maintient une valeur entre
 * un minimum et un maximum.
 */

function clamp(
  value,
  minimum,
  maximum
) {
  return Math.min(
    Math.max(
      value,
      minimum
    ),
    maximum
  );
}

export default detectRegression;
