/**
 * Détecteur PRIME — Best Mental State
 *
 * Objectif :
 * Identifier l’état mental pré-session associé
 * aux meilleures exécutions comportementales.
 *
 * PRIME compare notamment :
 *
 * - le score moyen de discipline ;
 * - le respect du plan ;
 * - le taux d’erreurs déclarées ;
 * - le volume de sessions disponible ;
 * - l’écart avec les autres états mentaux.
 *
 * Le détecteur retourne :
 * - un insight standardisé ;
 * - ou null si les données sont insuffisantes.
 */

const MINIMUM_SESSIONS = 8;
const MINIMUM_SESSIONS_PER_STATE = 3;
const MINIMUM_SCORE_GAP = 7;

/**
 * Détecte l’état mental le plus favorable
 * à l’exécution du trader.
 *
 * @param {Array<Object>} sessions
 * @returns {Object|null}
 */
export function detectBestMentalState(
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

  const sessionsWithMentalState =
    closedSessions.filter(
      (session) => {
        return (
          typeof session.mental_state ===
            "string" &&
          session.mental_state
            .trim()
            .length > 0 &&
          toValidScore(
            session.discipline_score
          ) !== null
        );
      }
    );

  if (
    sessionsWithMentalState.length <
    MINIMUM_SESSIONS
  ) {
    return null;
  }

  const groupedStates =
    groupSessionsByMentalState(
      sessionsWithMentalState
    );

  const stateStats =
    Object.entries(groupedStates)
      .map(
        ([mentalState, stateSessions]) =>
          buildMentalStateStats(
            mentalState,
            stateSessions
          )
      )
      .filter(
        (state) =>
          state.sessionsCount >=
          MINIMUM_SESSIONS_PER_STATE
      )
      .sort(
        (a, b) =>
          b.executionIndex -
          a.executionIndex
      );

  if (stateStats.length < 2) {
    return null;
  }

  const bestState =
    stateStats[0];

  const secondBestState =
    stateStats[1];

  const scoreGap =
    bestState.averageScore -
    secondBestState.averageScore;

  const executionGap =
    bestState.executionIndex -
    secondBestState.executionIndex;

  const clearScoreAdvantage =
    scoreGap >= MINIMUM_SCORE_GAP;

  const clearExecutionAdvantage =
    executionGap >= 8;

  const strongBestState =
    bestState.averageScore >= 75 &&
    bestState.planRespectRate >= 65;

  const bestStateDetected =
    strongBestState &&
    (
      clearScoreAdvantage ||
      clearExecutionAdvantage
    );

  if (!bestStateDetected) {
    return null;
  }

  const confidence =
    calculateConfidence({
      totalSessions:
        closedSessions.length,

      sessionsWithMentalState:
        sessionsWithMentalState.length,

      bestStateSessions:
        bestState.sessionsCount,

      availableStates:
        stateStats.length,

      scoreGap,

      executionGap,

      bestAverageScore:
        bestState.averageScore,

      bestPlanRespectRate:
        bestState.planRespectRate,
    });

  const priority =
    calculatePriority({
      bestStateSessions:
        bestState.sessionsCount,

      scoreGap,

      executionGap,

      bestAverageScore:
        bestState.averageScore,

      bestPlanRespectRate:
        bestState.planRespectRate,

      bestErrorRate:
        bestState.errorRate,
    });

  const message =
    buildBestMentalStateMessage({
      bestState,
      secondBestState,
      scoreGap,
      executionGap,
    });
    return {
    id: "best-mental-state",

    priority,

    confidence,

    category: "emotion",

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

      sessionsWithMentalState:
        sessionsWithMentalState.length,

      analyzedStates:
        stateStats.length,

      bestMentalState:
        bestState.mentalState,

      bestStateSessions:
        bestState.sessionsCount,

      bestAverageScore:
        bestState.averageScore,

      bestPlanRespectRate:
        bestState.planRespectRate,

      bestErrorRate:
        bestState.errorRate,

      bestPositivePnlRate:
        bestState.positivePnlRate,

      secondBestMentalState:
        secondBestState.mentalState,

      secondBestAverageScore:
        secondBestState.averageScore,

      scoreGap,

      executionGap,

      recencyScore:
        getStateRecencyScore(
          bestState.latestSessionAt
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
 * Regroupe les sessions par état mental.
 *
 * Les libellés sont normalisés pour éviter
 * de créer plusieurs groupes à cause
 * des majuscules ou des espaces.
 */

function groupSessionsByMentalState(
  sessions
) {
  return sessions.reduce(
    (groups, session) => {
      const mentalState =
        normalizeMentalState(
          session.mental_state
        );

      if (!mentalState) {
        return groups;
      }

      if (!groups[mentalState]) {
        groups[mentalState] = [];
      }

      groups[mentalState].push(
        session
      );

      return groups;
    },
    {}
  );
}

/**
 * Calcule les statistiques
 * d’un état mental donné.
 */

function buildMentalStateStats(
  mentalState,
  sessions
) {
  const scores =
    sessions
      .map((session) =>
        toValidScore(
          session.discipline_score
        )
      )
      .filter(
        (score) =>
          score !== null
      );

  const averageScore =
    Math.round(
      average(scores)
    );

  const sessionsWithPlan =
    sessions.filter(
      (session) => {
        return (
          session.plan_respected === true ||
          session.plan_respected === false
        );
      }
    );

  const respectedPlanCount =
    sessionsWithPlan.filter(
      (session) =>
        session.plan_respected === true
    ).length;

  const planRespectRate =
    sessionsWithPlan.length > 0
      ? Math.round(
          (
            respectedPlanCount /
            sessionsWithPlan.length
          ) * 100
        )
      : 0;

  const sessionsWithError =
    sessions.filter(
      (session) => {
        return (
          typeof session.dominant_error ===
            "string" &&
          session.dominant_error
            .trim()
            .length > 0
        );
      }
    ).length;

  const errorRate =
    Math.round(
      (
        sessionsWithError /
        sessions.length
      ) * 100
    );

  const positivePnlSessions =
    sessions.filter(
      (session) => {
        const pnl =
          toValidNumber(
            session.session_pnl
          );

        return (
          pnl !== null &&
          pnl > 0
        );
      }
    ).length;

  const positivePnlRate =
    Math.round(
      (
        positivePnlSessions /
        sessions.length
      ) * 100
    );

  const executionIndex =
    calculateExecutionIndex({
      averageScore,
      planRespectRate,
      errorRate,
      sessionsCount:
        sessions.length,
    });

  const latestSessionAt =
    sessions
      .map(
        (session) =>
          session.created_at
      )
      .filter(Boolean)
      .sort(
        (a, b) =>
          new Date(b).getTime() -
          new Date(a).getTime()
      )[0] || null;

  return {
    mentalState,

    sessionsCount:
      sessions.length,

    averageScore,

    planRespectRate,

    errorRate,

    positivePnlRate,

    executionIndex,

    latestSessionAt,
  };
}

/**
 * Produit un indice d’exécution
 * centré sur le comportement,
 * et non sur le PnL.
 */

function calculateExecutionIndex({
  averageScore,
  planRespectRate,
  errorRate,
  sessionsCount,
}) {
  const volumeBonus =
    Math.min(
      sessionsCount * 1.5,
      8
    );

  const scoreComponent =
    averageScore * 0.55;

  const planComponent =
    planRespectRate * 0.35;

  const errorComponent =
    (100 - errorRate) * 0.1;

  return Math.round(
    scoreComponent +
    planComponent +
    errorComponent +
    volumeBonus
  );
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
 * Convertit une valeur numérique
 * de manière sécurisée.
 */

function toValidNumber(
  value
) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const number =
    Number(value);

  return Number.isNaN(number)
    ? null
    : number;
}

/**
 * Nettoie le libellé
 * de l’état mental.
 */

function normalizeMentalState(
  value
) {
  if (
    typeof value !== "string"
  ) {
    return null;
  }

  const normalized =
    value
      .trim()
      .replace(/\s+/g, " ");

  return normalized || null;
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
 * de l’insight Best Mental State.
 */

function calculateConfidence({
  totalSessions,
  sessionsWithMentalState,
  bestStateSessions,
  availableStates,
  scoreGap,
  executionGap,
  bestAverageScore,
  bestPlanRespectRate,
}) {
  let confidence = 36;

  if (totalSessions >= 10) {
    confidence += 8;
  }

  if (totalSessions >= 20) {
    confidence += 10;
  }

  if (totalSessions >= 50) {
    confidence += 10;
  }

  if (
    sessionsWithMentalState >= 10
  ) {
    confidence += 5;
  }

  if (
    bestStateSessions >= 4
  ) {
    confidence += 5;
  }

  if (
    bestStateSessions >= 6
  ) {
    confidence += 5;
  }

  if (
    availableStates >= 3
  ) {
    confidence += 4;
  }

  if (
    scoreGap >= 10
  ) {
    confidence += 5;
  }

  if (
    executionGap >= 12
  ) {
    confidence += 5;
  }

  if (
    bestAverageScore >= 85
  ) {
    confidence += 4;
  }

  if (
    bestPlanRespectRate >= 80
  ) {
    confidence += 4;
  }

  return clamp(
    Math.round(confidence),
    0,
    100
  );
}

/**
 * Définit la priorité de l’insight.
 *
 * Cet insight est très utile,
 * mais doit rester sous les signaux
 * critiques de risque et de revenge.
 */

function calculatePriority({
  bestStateSessions,
  scoreGap,
  executionGap,
  bestAverageScore,
  bestPlanRespectRate,
  bestErrorRate,
}) {
  let priority = 68;

  if (
    bestStateSessions >= 4
  ) {
    priority += 4;
  }

  if (
    bestStateSessions >= 6
  ) {
    priority += 3;
  }

  if (
    scoreGap >= 8
  ) {
    priority += 4;
  }

  if (
    scoreGap >= 12
  ) {
    priority += 4;
  }

  if (
    executionGap >= 10
  ) {
    priority += 4;
  }

  if (
    bestAverageScore >= 85
  ) {
    priority += 3;
  }

  if (
    bestPlanRespectRate >= 80
  ) {
    priority += 3;
  }

  if (
    bestErrorRate <= 20
  ) {
    priority += 3;
  }

  return clamp(
    priority,
    0,
    88
  );
}

/**
 * Calcule la récence
 * de l’état mental détecté.
 */

function getStateRecencyScore(
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
 * au signal mental détecté.
 */

function buildBestMentalStateMessage({
  bestState,
  secondBestState,
  scoreGap,
  executionGap,
}) {
  if (
    bestState.averageScore >= 85 &&
    bestState.planRespectRate >= 80
  ) {
    return {
      insight:
        `Lorsque tu arrives au marché dans l’état « ${bestState.mentalState} », ta discipline moyenne atteint ${bestState.averageScore} %.`,

      explanation:
        `Dans cet état, ton plan est respecté ${bestState.planRespectRate} % du temps et ton taux d’erreur tombe à ${bestState.errorRate} %.`,

      action:
        `Avant chaque session, cherche à reproduire les conditions qui t’aident à entrer dans l’état « ${bestState.mentalState} ».`,
    };
  }

  if (
    scoreGap >= 10
  ) {
    return {
      insight:
        `Tu exécutes nettement mieux lorsque ton état mental est « ${bestState.mentalState} ».`,

      explanation:
        `Ta discipline moyenne y est supérieure de ${scoreGap} points à celle observée dans l’état « ${secondBestState.mentalState} ».`,

      action:
        "Note ce qui précède ces bonnes sessions : sommeil, préparation, environnement et niveau de pression.",
    };
  }

  if (
    executionGap >= 10
  ) {
    return {
      insight:
        `L’état « ${bestState.mentalState} » est actuellement le plus favorable à ton exécution.`,

      explanation:
        `Son indice d’exécution dépasse de ${executionGap} points celui de l’état mental suivant le plus performant.`,

      action:
        "Utilise cet état comme référence avant de décider si les conditions sont réellement réunies pour trader.",
    };
  }
    return {
    insight:
      `Ton état mental « ${bestState.mentalState} » semble actuellement associé à ta meilleure qualité d’exécution.`,

    explanation:
      `Sur ${bestState.sessionsCount} sessions, ta discipline moyenne atteint ${bestState.averageScore} %, avec un respect du plan de ${bestState.planRespectRate} %.`,

    action:
      "Continue de documenter précisément ton état mental avant chaque session afin de confirmer que ce signal reste stable dans le temps.",
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

export default detectBestMentalState;
