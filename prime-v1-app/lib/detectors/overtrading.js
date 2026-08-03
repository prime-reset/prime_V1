/**
 * Détecteur PRIME — Overtrading
 *
 * Objectif :
 * Détecter une tendance répétée à la suractivité
 * et mesurer son impact sur la qualité d’exécution.
 *
 * Dans cette première version, PRIME s’appuie sur :
 *
 * - l’erreur déclarée "Overtrading" ;
 * - la fréquence récente du signal ;
 * - la différence de discipline ;
 * - le respect du plan ;
 * - le PnL moyen ;
 * - la récence du comportement.
 *
 * Le détecteur retourne :
 * - un insight standardisé ;
 * - ou null si les données sont insuffisantes.
 */

const MINIMUM_SESSIONS = 8;
const RECENT_WINDOW = 10;
const MINIMUM_OVERTRADING_EVENTS = 2;

/**
 * Détecte un pattern d’overtrading.
 *
 * @param {Array<Object>} sessions
 * @returns {Object|null}
 */
export function detectOvertrading(
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

  const overtradingSessions =
    recentSessions.filter(
      (session) =>
        normalizeError(
          session.dominant_error
        ) === "overtrading"
    );

  if (
    overtradingSessions.length <
    MINIMUM_OVERTRADING_EVENTS
  ) {
    return null;
  }

  const cleanSessions =
    recentSessions.filter(
      (session) =>
        normalizeError(
          session.dominant_error
        ) !== "overtrading"
    );

  if (
    cleanSessions.length < 3
  ) {
    return null;
  }

  const overtradingStats =
    buildGroupStats(
      overtradingSessions
    );

  const cleanStats =
    buildGroupStats(
      cleanSessions
    );

  const frequency =
    Math.round(
      (
        overtradingSessions.length /
        recentSessions.length
      ) * 100
    );

  const scoreGap =
    cleanStats.averageScore -
    overtradingStats.averageScore;

  const planGap =
    cleanStats.planRespectRate -
    overtradingStats.planRespectRate;

  const pnlGap =
    cleanStats.averagePnl -
    overtradingStats.averagePnl;

  const recentThree =
    recentSessions.slice(0, 3);

  const recentOvertradingCount =
    recentThree.filter(
      (session) =>
        normalizeError(
          session.dominant_error
        ) === "overtrading"
    ).length;

  const repeatedRecently =
    recentOvertradingCount >= 2;

  const harmfulPattern =
    scoreGap >= 8 ||
    planGap >= 20 ||
    pnlGap > 0;

  if (
    !harmfulPattern &&
    !repeatedRecently
  ) {
    return null;
  }

  const confidence =
    calculateConfidence({
      totalSessions:
        closedSessions.length,

      analyzedSessions:
        recentSessions.length,

      overtradingEvents:
        overtradingSessions.length,

      frequency,

      scoreGap,

      planGap,

      pnlGap,

      repeatedRecently,
    });

  const priority =
    calculatePriority({
      overtradingEvents:
        overtradingSessions.length,

      frequency,

      scoreGap,

      planGap,

      pnlGap,

      repeatedRecently,
    });
    const message =
    buildOvertradingMessage({
      overtradingEvents:
        overtradingSessions.length,

      analyzedSessions:
        recentSessions.length,

      frequency,

      scoreGap,

      planGap,

      pnlGap,

      repeatedRecently,

      overtradingStats,

      cleanStats,
    });

  return {
    id: "overtrading",

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
        recentSessions.length,

      overtradingEvents:
        overtradingSessions.length,

      frequency,

      repeatedRecently,

      recentOvertradingCount,

      overtradingAverageScore:
        overtradingStats.averageScore,

      cleanAverageScore:
        cleanStats.averageScore,

      scoreGap,

      overtradingPlanRespectRate:
        overtradingStats.planRespectRate,

      cleanPlanRespectRate:
        cleanStats.planRespectRate,

      planGap,

      overtradingAveragePnl:
        overtradingStats.averagePnl,

      cleanAveragePnl:
        cleanStats.averagePnl,

      pnlGap,

      recencyScore:
        getRecencyScore(
          overtradingSessions[0]
            ?.created_at
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
 * Normalise le nom de l’erreur.
 */

function normalizeError(
  value
) {
  if (
    typeof value !== "string"
  ) {
    return "";
  }

  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
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
      planRespectRate: 0,
      negativePnlRate: 0,
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

  const negativePnlSessions =
    sessions.filter(
      (session) => {
        const pnl =
          toValidNumber(
            session.session_pnl
          );

        return (
          pnl !== null &&
          pnl < 0
        );
      }
    ).length;

  const negativePnlRate =
    Math.round(
      (
        negativePnlSessions /
        sessions.length
      ) * 100
    );

  return {
    sessionsCount:
      sessions.length,

    averageScore,

    averagePnl,

    planRespectRate,

    negativePnlRate,
  };
}
/**
 * Convertit une valeur
 * en score valide de 0 à 100.
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
 * Convertit une valeur numérique
 * de manière sécurisée.
 */

function toValidNumber(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const number = Number(value);

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
      (sum, value) => sum + value,
      0
    ) / values.length
  );
}

/**
 * Calcule le niveau de confiance
 * de l’insight Overtrading.
 */

function calculateConfidence({
  totalSessions,
  analyzedSessions,
  overtradingEvents,
  frequency,
  scoreGap,
  planGap,
  pnlGap,
  repeatedRecently,
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

  if (analyzedSessions >= 10) {
    confidence += 4;
  }

  if (overtradingEvents >= 3) {
    confidence += 6;
  }

  if (overtradingEvents >= 5) {
    confidence += 7;
  }

  if (frequency >= 30) {
    confidence += 5;
  }

  if (scoreGap >= 10) {
    confidence += 5;
  }

  if (planGap >= 20) {
    confidence += 5;
  }

  if (pnlGap > 0) {
    confidence += 4;
  }

  if (repeatedRecently) {
    confidence += 7;
  }

  return clamp(
    Math.round(confidence),
    0,
    100
  );
}

/**
 * Définit la priorité
 * de l’insight Overtrading.
 */

function calculatePriority({
  overtradingEvents,
  frequency,
  scoreGap,
  planGap,
  pnlGap,
  repeatedRecently,
}) {
  let priority = 82;

  if (overtradingEvents >= 3) {
    priority += 3;
  }

  if (overtradingEvents >= 5) {
    priority += 3;
  }

  if (frequency >= 30) {
    priority += 4;
  }

  if (scoreGap >= 10) {
    priority += 4;
  }

  if (scoreGap >= 15) {
    priority += 3;
  }

  if (planGap >= 20) {
    priority += 4;
  }

  if (pnlGap > 0) {
    priority += 3;
  }

  if (repeatedRecently) {
    priority += 6;
  }

  return clamp(
    priority,
    0,
    96
  );
}

/**
 * Calcule la récence
 * du signal Overtrading.
 */

function getRecencyScore(latestSessionAt) {
  if (!latestSessionAt) {
    return 0;
  }

  const latestDate = new Date(
    latestSessionAt
  ).getTime();

  if (Number.isNaN(latestDate)) {
    return 0;
  }

  const daysSince = Math.floor(
    (Date.now() - latestDate) /
      (1000 * 60 * 60 * 24)
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
 * au signal d’overtrading.
 */

function buildOvertradingMessage({
  overtradingEvents,
  analyzedSessions,
  frequency,
  scoreGap,
  planGap,
  pnlGap,
  repeatedRecently,
  overtradingStats,
  cleanStats,
}) {
  if (repeatedRecently) {
    return {
      insight:
        "L’overtrading apparaît dans au moins deux de tes trois dernières sessions.",

      explanation:
        "PRIME détecte un signal récent et répété. Ce n’est plus une erreur isolée, mais une dérive active de ton comportement.",

      action:
        "Fixe un nombre maximal de décisions avant la session et arrête-toi dès que cette limite est atteinte.",
    };
  }

  if (scoreGap >= 12 && planGap >= 20) {
    return {
      insight:
        `Quand l’overtrading apparaît, ta discipline baisse de ${scoreGap} points et ton respect du plan recule de ${planGap} points.`,

      explanation:
        "La suractivité détériore simultanément la qualité de ton exécution et ta capacité à rester dans ton cadre.",

      action:
        "Réduis volontairement le nombre d’opportunités autorisées et sélectionne uniquement les setups les plus propres.",
    };
  }

  if (pnlGap > 0 && scoreGap >= 8) {
    return {
      insight:
        "Tes sessions sans overtrading produisent de meilleurs résultats et une meilleure discipline.",

      explanation:
        `Le PnL moyen est supérieur de ${pnlGap} € et le score de discipline gagne ${scoreGap} points lorsque la suractivité disparaît.`,

      action:
        "Considère la réduction du nombre de décisions comme une condition directe de ton edge.",
    };
  }
    if (
    frequency >= 30
  ) {
    return {
      insight:
        `L’overtrading apparaît dans ${frequency} % de tes sessions récentes.`,

      explanation:
        `Sur ${analyzedSessions} sessions analysées, ${overtradingEvents} présentent ce signal. Sa fréquence devient suffisamment élevée pour influencer ton profil comportemental.`,

      action:
        "Définis avant l’ouverture un nombre maximal de trades ou de décisions autorisées, puis rends cette limite non négociable.",
    };
  }

  if (
    overtradingStats.negativePnlRate >
    cleanStats.negativePnlRate
  ) {
    return {
      insight:
        "Tes sessions d’overtrading sont plus souvent négatives que tes sessions propres.",

      explanation:
        `Le taux de sessions négatives atteint ${overtradingStats.negativePnlRate} % avec overtrading, contre ${cleanStats.negativePnlRate} % sans ce signal.`,

      action:
        "Arrête de mesurer ta présence au marché par le nombre de trades pris. La sélection semble mieux protéger ton capital.",
    };
  }

  return {
    insight:
      "PRIME détecte que la suractivité dégrade régulièrement ton exécution.",

    explanation:
      `Sur ${analyzedSessions} sessions récentes, l’overtrading apparaît ${overtradingEvents} fois et s’accompagne d’un écart de discipline de ${scoreGap} points.`,

    action:
      "Réduis volontairement ton activité et considère chaque trade supplémentaire comme une décision qui doit être justifiée.",
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

export default detectOvertrading;
