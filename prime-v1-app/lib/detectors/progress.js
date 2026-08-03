/**
 * Détecteur PRIME — Progression
 *
 * Objectif :
 * Détecter une amélioration réelle et récente du comportement du trader
 * en comparant deux fenêtres de sessions clôturées.
 *
 * Le détecteur retourne :
 * - un insight standardisé ;
 * - ou null si les données sont insuffisantes ou peu concluantes.
 */

const MINIMUM_SESSIONS = 8;
const RECENT_WINDOW = 5;
const PREVIOUS_WINDOW = 5;
const MINIMUM_DELTA = 6;

/**
 * Détecte une progression comportementale récente.
 *
 * @param {Array<Object>} sessions
 * @returns {Object|null}
 */
export function detectProgress(sessions = []) {
  const closedSessions = getClosedSessions(sessions);

  if (closedSessions.length < MINIMUM_SESSIONS) {
    return null;
  }

  const recentSessions = closedSessions.slice(0, RECENT_WINDOW);

  const previousSessions = closedSessions.slice(
    RECENT_WINDOW,
    RECENT_WINDOW + PREVIOUS_WINDOW
  );

  if (
    recentSessions.length < 4 ||
    previousSessions.length < 3
  ) {
    return null;
  }

  const recentScores =
    getValidScores(recentSessions);

  const previousScores =
    getValidScores(previousSessions);

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
    previousErrorRate -
    recentErrorRate;

  const recentPerfectSessions =
    recentSessions.filter(
      (session) =>
        Number(
          session.discipline_score
        ) === 100
    ).length;

  const signals = {
    scoreImproved:
      scoreDelta >= MINIMUM_DELTA,

    planImproved:
      planDelta !== null &&
      planDelta >= 15,

    errorsReduced:
      errorDelta >= 20,

    strongRecentAverage:
      recentAverage >= 75,
  };

  const positiveSignals =
    Object.values(signals)
      .filter(Boolean)
      .length;

  const progressDetected =
    signals.scoreImproved &&
    signals.strongRecentAverage &&
    positiveSignals >= 2;

  if (!progressDetected) {
    return null;
  }

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
      positiveSignals,
    });

  const priority =
    calculatePriority({
      scoreDelta,
      planDelta,
      errorDelta,
      recentAverage,
      positiveSignals,
    });
    const message =
    buildProgressMessage({
      scoreDelta,
      recentAverage,
      previousAverage,
      recentPlanRate,
      previousPlanRate,
      planDelta,
      recentErrorRate,
      previousErrorRate,
      errorDelta,
      recentPerfectSessions,
    });

  return {
    id: "progress",

    priority,

    confidence,

    category:
      "progression",

    title:
      "Aujourd’hui PRIME remarque...",

    insight:
      message.insight,

    explanation:
      message.explanation,

    action:
      message.action,

    data: {
      analyzedSessions:
        recentSessions.length +
        previousSessions.length,

      totalSessions:
        closedSessions.length,

      recentAverage,

      previousAverage,

      scoreDelta,

      recentPlanRate,

      previousPlanRate,

      planDelta,

      recentErrorRate,

      previousErrorRate,

      errorDelta,

      recentPerfectSessions,

      recencyScore: 100,
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
    .map((session) => {
      return Number(
        session.discipline_score
      );
    })

    .filter((score) => {
      return (
        !Number.isNaN(score) &&
        score >= 0 &&
        score <= 100
      );
    });
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
 * de l’insight.
 */

function calculateConfidence({
  totalSessions,
  recentSessions,
  previousSessions,
  scoreDelta,
  planDelta,
  errorDelta,
  positiveSignals,
}) {
  let confidence = 42;

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

  if (scoreDelta >= 10) {
    confidence += 6;
  }

  if (
    planDelta !== null &&
    planDelta >= 20
  ) {
    confidence += 5;
  }

  if (errorDelta >= 25) {
    confidence += 5;
  }

  if (positiveSignals >= 3) {
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
 * de l’insight.
 *
 * La progression peut être importante,
 * mais elle doit rester sous les alertes
 * critiques de risque ou de revenge.
 */

function calculatePriority({
  scoreDelta,
  planDelta,
  errorDelta,
  recentAverage,
  positiveSignals,
}) {
  let priority = 70;

  if (scoreDelta >= 8) {
    priority += 4;
  }

  if (scoreDelta >= 12) {
    priority += 4;
  }

  if (
    planDelta !== null &&
    planDelta >= 20
  ) {
    priority += 4;
  }

  if (errorDelta >= 25) {
    priority += 4;
  }

  if (recentAverage >= 85) {
    priority += 3;
  }

  if (positiveSignals >= 3) {
    priority += 4;
  }

  return clamp(
    priority,
    0,
    89
  );
}

/**
 * Produit le message
 * le plus pertinent selon
 * le signal dominant.
 */

function buildProgressMessage({
  scoreDelta,
  recentAverage,
  previousAverage,
  recentPlanRate,
  previousPlanRate,
  planDelta,
  recentErrorRate,
  previousErrorRate,
  errorDelta,
  recentPerfectSessions,
}) {
  if (
    planDelta !== null &&
    planDelta >= 20 &&
    scoreDelta >= 8
  ) {
    return {
      insight:
        `Ta discipline progresse de ${scoreDelta} points et ton respect du plan augmente de ${planDelta} points sur tes sessions récentes.`,

      explanation:
        "PRIME observe une amélioration conjointe du score et de l’exécution du plan. Ce signal est plus fiable qu’une simple bonne session isolée.",

      action:
        "Conserve les mêmes règles de préparation et évite d’augmenter ton activité trop vite. Stabilise d’abord cette progression.",
    };
  }

  if (
    errorDelta >= 25 &&
    scoreDelta >= 6
  ) {
    return {
      insight:
        `Tes erreurs déclarées diminuent tandis que ta discipline progresse de ${scoreDelta} points.`,

      explanation:
        `Le taux de sessions avec erreur est passé de ${previousErrorRate} % à ${recentErrorRate} %. Ton amélioration semble donc liée à une meilleure qualité d’exécution.`,

      action:
        "Identifie la règle qui t’aide le plus à éviter ces erreurs et rends-la non négociable.",
    };
  }
    if (recentPerfectSessions >= 2) {
    return {
      insight:
        `Tu as enregistré ${recentPerfectSessions} sessions à 100 % récemment, avec une moyenne désormais à ${recentAverage} %.`,

      explanation:
        `Ta moyenne précédente était de ${previousAverage} %. PRIME observe une progression suffisamment nette pour parler d’une vraie dynamique positive.`,

      action:
        "Ne cherche pas à reproduire le résultat parfait. Reproduis le processus qui l’a rendu possible.",
    };
  }

  return {
    insight:
      `Ta discipline récente atteint ${recentAverage} %, soit ${scoreDelta} points de plus que sur la période précédente.`,

    explanation:
      "L’amélioration apparaît sur plusieurs sessions consécutives, ce qui la rend plus crédible qu’une variation ponctuelle.",

    action:
      "Continue de documenter tes sessions avec la même honnêteté afin de vérifier que cette progression se stabilise.",
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

export default detectProgress;
