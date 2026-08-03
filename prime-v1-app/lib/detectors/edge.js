/**
 * Détecteur PRIME — Behavioral Edge
 *
 * Objectif :
 * Identifier les conditions comportementales
 * dans lesquelles le trader produit ses meilleures sessions.
 *
 * IMPORTANT :
 * Ce détecteur ne prétend pas identifier un edge technique
 * ou un setup de marché précis.
 *
 * Il mesure uniquement un edge comportemental à partir de :
 *
 * - la discipline ;
 * - le respect du plan ;
 * - l’absence d’erreur déclarée ;
 * - la relation entre qualité d’exécution et résultat financier.
 *
 * Le détecteur retourne :
 * - un insight standardisé ;
 * - ou null si les données sont insuffisantes.
 */

const MINIMUM_SESSIONS = 10;
const MINIMUM_SESSIONS_PER_GROUP = 3;
const MINIMUM_SCORE_GAP = 8;

/**
 * Détecte les conditions comportementales
 * associées aux meilleures exécutions.
 *
 * @param {Array<Object>} sessions
 * @returns {Object|null}
 */
export function detectEdge(sessions = []) {
  const closedSessions =
    getClosedSessions(sessions);

  if (
    closedSessions.length <
    MINIMUM_SESSIONS
  ) {
    return null;
  }

  const validSessions =
    closedSessions.filter(
      (session) =>
        toValidScore(
          session.discipline_score
        ) !== null
    );

  if (
    validSessions.length <
    MINIMUM_SESSIONS
  ) {
    return null;
  }

  const planRespectedSessions =
    validSessions.filter(
      (session) =>
        session.plan_respected === true
    );

  const planNotRespectedSessions =
    validSessions.filter(
      (session) =>
        session.plan_respected === false
    );

  const noErrorSessions =
    validSessions.filter(
      (session) =>
        !hasDeclaredError(session)
    );

  const errorSessions =
    validSessions.filter(
      (session) =>
        hasDeclaredError(session)
    );

  const cleanExecutionSessions =
    validSessions.filter(
      (session) =>
        session.plan_respected === true &&
        !hasDeclaredError(session)
    );

  const degradedExecutionSessions =
    validSessions.filter(
      (session) =>
        session.plan_respected === false ||
        hasDeclaredError(session)
    );

  const planRespectedStats =
    buildGroupStats(
      planRespectedSessions
    );

  const planNotRespectedStats =
    buildGroupStats(
      planNotRespectedSessions
    );

  const noErrorStats =
    buildGroupStats(
      noErrorSessions
    );

  const errorStats =
    buildGroupStats(
      errorSessions
    );

  const cleanExecutionStats =
    buildGroupStats(
      cleanExecutionSessions
    );

  const degradedExecutionStats =
    buildGroupStats(
      degradedExecutionSessions
    );

  const planComparisonAvailable =
    planRespectedStats.sessionsCount >=
      MINIMUM_SESSIONS_PER_GROUP &&
    planNotRespectedStats.sessionsCount >=
      MINIMUM_SESSIONS_PER_GROUP;

  const errorComparisonAvailable =
    noErrorStats.sessionsCount >=
      MINIMUM_SESSIONS_PER_GROUP &&
    errorStats.sessionsCount >=
      MINIMUM_SESSIONS_PER_GROUP;

  const executionComparisonAvailable =
    cleanExecutionStats.sessionsCount >=
      MINIMUM_SESSIONS_PER_GROUP &&
    degradedExecutionStats.sessionsCount >=
      MINIMUM_SESSIONS_PER_GROUP;

  if (
    !planComparisonAvailable &&
    !errorComparisonAvailable &&
    !executionComparisonAvailable
  ) {
    return null;
  }

  const planScoreGap =
    planComparisonAvailable
      ? planRespectedStats.averageScore -
        planNotRespectedStats.averageScore
      : null;

  const planPnlGap =
    planComparisonAvailable
      ? planRespectedStats.averagePnl -
        planNotRespectedStats.averagePnl
      : null;

  const errorScoreGap =
    errorComparisonAvailable
      ? noErrorStats.averageScore -
        errorStats.averageScore
      : null;

  const errorPnlGap =
    errorComparisonAvailable
      ? noErrorStats.averagePnl -
        errorStats.averagePnl
      : null;

  const cleanScoreGap =
    executionComparisonAvailable
      ? cleanExecutionStats.averageScore -
        degradedExecutionStats.averageScore
      : null;

  const cleanPnlGap =
    executionComparisonAvailable
      ? cleanExecutionStats.averagePnl -
        degradedExecutionStats.averagePnl
      : null;

  const signals = {
    planCreatesDiscipline:
      planScoreGap !== null &&
      planScoreGap >= MINIMUM_SCORE_GAP,

    planSupportsResults:
      planPnlGap !== null &&
      planPnlGap > 0,

    noErrorCreatesDiscipline:
      errorScoreGap !== null &&
      errorScoreGap >= MINIMUM_SCORE_GAP,

    noErrorSupportsResults:
      errorPnlGap !== null &&
      errorPnlGap > 0,

    cleanExecutionCreatesDiscipline:
      cleanScoreGap !== null &&
      cleanScoreGap >= MINIMUM_SCORE_GAP,

    cleanExecutionSupportsResults:
      cleanPnlGap !== null &&
      cleanPnlGap > 0,
  };

  const positiveSignals =
    Object.values(signals)
      .filter(Boolean)
      .length;

  const edgeDetected =
    positiveSignals >= 2 &&
    (
      signals.cleanExecutionCreatesDiscipline ||
      signals.planCreatesDiscipline ||
      signals.noErrorCreatesDiscipline
    );

  if (!edgeDetected) {
    return null;
  }

  const confidence =
    calculateConfidence({
      totalSessions:
        validSessions.length,

      planRespectedSessions:
        planRespectedStats.sessionsCount,

      planNotRespectedSessions:
        planNotRespectedStats.sessionsCount,

      cleanExecutionSessions:
        cleanExecutionStats.sessionsCount,

      degradedExecutionSessions:
        degradedExecutionStats.sessionsCount,

      positiveSignals,

      planScoreGap,

      errorScoreGap,

      cleanScoreGap,
    });

  const priority =
    calculatePriority({
      positiveSignals,

      planScoreGap,

      errorScoreGap,

      cleanScoreGap,

      cleanPnlGap,

      cleanExecutionSessions:
        cleanExecutionStats.sessionsCount,
    });
    const message =
    buildEdgeMessage({
      planComparisonAvailable,
      errorComparisonAvailable,
      executionComparisonAvailable,

      planRespectedStats,
      planNotRespectedStats,

      noErrorStats,
      errorStats,

      cleanExecutionStats,
      degradedExecutionStats,

      planScoreGap,
      planPnlGap,

      errorScoreGap,
      errorPnlGap,

      cleanScoreGap,
      cleanPnlGap,

      positiveSignals,
    });

  return {
    id: "behavioral-edge",

    priority,

    confidence,

    category: "edge",

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
        validSessions.length,

      planRespectedSessions:
        planRespectedStats.sessionsCount,

      planNotRespectedSessions:
        planNotRespectedStats.sessionsCount,

      planRespectedAverageScore:
        planRespectedStats.averageScore,

      planNotRespectedAverageScore:
        planNotRespectedStats.averageScore,

      planRespectedAveragePnl:
        planRespectedStats.averagePnl,

      planNotRespectedAveragePnl:
        planNotRespectedStats.averagePnl,

      noErrorSessions:
        noErrorStats.sessionsCount,

      errorSessions:
        errorStats.sessionsCount,

      noErrorAverageScore:
        noErrorStats.averageScore,

      errorAverageScore:
        errorStats.averageScore,

      noErrorAveragePnl:
        noErrorStats.averagePnl,

      errorAveragePnl:
        errorStats.averagePnl,

      cleanExecutionSessions:
        cleanExecutionStats.sessionsCount,

      degradedExecutionSessions:
        degradedExecutionStats.sessionsCount,

      cleanExecutionAverageScore:
        cleanExecutionStats.averageScore,

      degradedExecutionAverageScore:
        degradedExecutionStats.averageScore,

      cleanExecutionAveragePnl:
        cleanExecutionStats.averagePnl,

      degradedExecutionAveragePnl:
        degradedExecutionStats.averagePnl,

      planScoreGap,

      planPnlGap,

      errorScoreGap,

      errorPnlGap,

      cleanScoreGap,

      cleanPnlGap,

      positiveSignals,

      recencyScore:
        getRecencyScore(
          validSessions[0]?.created_at
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
 * Vérifie si une erreur
 * a été déclarée.
 */

function hasDeclaredError(
  session
) {
  return (
    typeof session?.dominant_error ===
      "string" &&
    session.dominant_error
      .trim()
      .length > 0
  );
}

/**
 * Calcule les statistiques
 * d’un groupe de sessions.
 */

function buildGroupStats(
  sessions
) {
  if (!sessions.length) {
    return {
      sessionsCount: 0,
      averageScore: 0,
      averagePnl: 0,
      positivePnlRate: 0,
      planRespectRate: 0,
      errorRate: 0,
    };
  }

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

  const pnlValues =
    sessions
      .map((session) =>
        toValidNumber(
          session.session_pnl
        )
      )
      .filter(
        (value) =>
          value !== null
      );

  const averageScore =
    Math.round(
      average(scores)
    );

  const averagePnl =
    pnlValues.length > 0
      ? Math.round(
          average(pnlValues)
        )
      : 0;

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
      (session) =>
        hasDeclaredError(session)
    ).length;

  const errorRate =
    Math.round(
      (
        sessionsWithError /
        sessions.length
      ) * 100
    );

  return {
    sessionsCount:
      sessions.length,

    averageScore,

    averagePnl,

    positivePnlRate,

    planRespectRate,

    errorRate,
  };
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
 * de l’insight Edge.
 */

function calculateConfidence({
  totalSessions,
  planRespectedSessions,
  planNotRespectedSessions,
  cleanExecutionSessions,
  degradedExecutionSessions,
  positiveSignals,
  planScoreGap,
  errorScoreGap,
  cleanScoreGap,
}) {
  let confidence = 38;

  if (totalSessions >= 12) {
    confidence += 8;
  }

  if (totalSessions >= 20) {
    confidence += 10;
  }

  if (totalSessions >= 50) {
    confidence += 10;
  }

  if (
    planRespectedSessions >= 5 &&
    planNotRespectedSessions >= 5
  ) {
    confidence += 5;
  }

  if (
    cleanExecutionSessions >= 5 &&
    degradedExecutionSessions >= 5
  ) {
    confidence += 6;
  }

  if (positiveSignals >= 3) {
    confidence += 5;
  }

  if (positiveSignals >= 5) {
    confidence += 5;
  }

  if (
    planScoreGap !== null &&
    planScoreGap >= 12
  ) {
    confidence += 4;
  }

  if (
    errorScoreGap !== null &&
    errorScoreGap >= 12
  ) {
    confidence += 4;
  }

  if (
    cleanScoreGap !== null &&
    cleanScoreGap >= 15
  ) {
    confidence += 5;
  }

  return clamp(
    Math.round(confidence),
    0,
    100
  );
}

/**
 * Définit la priorité
 * de l’insight Edge.
 */

function calculatePriority({
  positiveSignals,
  planScoreGap,
  errorScoreGap,
  cleanScoreGap,
  cleanPnlGap,
  cleanExecutionSessions,
}) {
  let priority = 72;

  if (positiveSignals >= 3) {
    priority += 4;
  }

  if (positiveSignals >= 5) {
    priority += 4;
  }

  if (
    planScoreGap !== null &&
    planScoreGap >= 10
  ) {
    priority += 4;
  }

  if (
    errorScoreGap !== null &&
    errorScoreGap >= 10
  ) {
    priority += 4;
  }

  if (
    cleanScoreGap !== null &&
    cleanScoreGap >= 15
  ) {
    priority += 5;
  }

  if (
    cleanPnlGap !== null &&
    cleanPnlGap > 0
  ) {
    priority += 3;
  }

  if (
    cleanExecutionSessions >= 6
  ) {
    priority += 3;
  }

  return clamp(
    priority,
    0,
    90
  );
}

/**
 * Calcule la récence
 * du signal Edge.
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
 * au signal d’edge comportemental.
 */

function buildEdgeMessage({
  planComparisonAvailable,
  errorComparisonAvailable,
  executionComparisonAvailable,

  planRespectedStats,
  planNotRespectedStats,

  noErrorStats,
  errorStats,

  cleanExecutionStats,
  degradedExecutionStats,

  planScoreGap,
  planPnlGap,

  errorScoreGap,
  errorPnlGap,

  cleanScoreGap,
  cleanPnlGap,

  positiveSignals,
}) {
  if (
    executionComparisonAvailable &&
    cleanScoreGap !== null &&
    cleanScoreGap >= 12 &&
    cleanPnlGap !== null &&
    cleanPnlGap > 0
  ) {
    return {
      insight:
        `Tes meilleures sessions apparaissent lorsque ton plan est respecté et qu’aucune erreur n’est déclarée.`,

      explanation:
        `Dans ces conditions, ta discipline moyenne progresse de ${cleanScoreGap} points et ton PnL moyen est supérieur de ${cleanPnlGap} €.`,

      action:
        "Traite cette combinaison comme ton edge comportemental de référence : plan respecté, aucune erreur tolérée, exécution propre.",
    };
  }

  if (
    planComparisonAvailable &&
    planScoreGap !== null &&
    planScoreGap >= 10
  ) {
    return {
      insight:
        `Le respect du plan améliore directement ta qualité d’exécution.`,

      explanation:
        `Ta discipline moyenne atteint ${planRespectedStats.averageScore} % lorsque le plan est respecté, contre ${planNotRespectedStats.averageScore} % lorsqu’il ne l’est pas.`,

      action:
        "Avant chaque trade, vérifie que ta décision appartient réellement au scénario prévu. Ton avantage commence avant l’entrée.",
    };
  }

  if (
    errorComparisonAvailable &&
    errorScoreGap !== null &&
    errorScoreGap >= 10
  ) {
    return {
      insight:
        `L’absence d’erreur déclarée est l’un des meilleurs prédicteurs de ta discipline.`,

      explanation:
        `Tes sessions sans erreur affichent une discipline moyenne de ${noErrorStats.averageScore} %, contre ${errorStats.averageScore} % lorsque qu’une erreur apparaît.`,

      action:
        "Cherche moins à multiplier les opportunités et davantage à préserver des sessions sans dérive comportementale.",
    };
  }
    if (
    planComparisonAvailable &&
    planPnlGap !== null &&
    planPnlGap > 0
  ) {
    return {
      insight:
        "Tes résultats financiers sont meilleurs lorsque ton plan est respecté.",

      explanation:
        `Ton PnL moyen est supérieur de ${planPnlGap} € sur les sessions où tu restes dans ton cadre.`,

      action:
        "Ne mesure pas ton edge au nombre de trades pris. Mesure-le à ta capacité à rester dans les conditions qui produisent tes meilleures décisions.",
    };
  }

  if (
    errorComparisonAvailable &&
    errorPnlGap !== null &&
    errorPnlGap > 0
  ) {
    return {
      insight:
        "Tes sessions sans erreur produisent de meilleurs résultats financiers.",

      explanation:
        `Ton PnL moyen est supérieur de ${errorPnlGap} € lorsque aucune erreur comportementale n’est déclarée.`,

      action:
        "Protège d’abord la qualité de ta décision. Le résultat semble suivre lorsque ton comportement reste propre.",
    };
  }

  return {
    insight:
      "PRIME détecte un avantage comportemental lorsque ton exécution reste propre.",

    explanation:
      `Sur les groupes analysés, ${positiveSignals} signaux convergent entre discipline, respect du plan, absence d’erreur et résultat financier.`,

    action:
      "Continue de documenter précisément tes sessions afin de confirmer les conditions dans lesquelles ton edge comportemental s’exprime le mieux.",
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

export default detectEdge;
