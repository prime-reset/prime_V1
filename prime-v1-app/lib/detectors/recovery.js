/**
 * Détecteur PRIME — Recovery V2
 *
 * Objectif :
 * Identifier uniquement une récupération comportementale réelle.
 *
 * Recovery ne signale plus les dérives.
 * Si la récupération est fragile ou absente,
 * le détecteur retourne null afin de laisser :
 *
 * - Regression ;
 * - Revenge ;
 * - Overtrading ;
 *
 * prendre la parole si nécessaire.
 */

const MINIMUM_SESSIONS = 8;
const MINIMUM_LOSS_EVENTS = 2;

const DISCIPLINE_IMPROVEMENT_THRESHOLD = 5;
const DISCIPLINE_DECLINE_THRESHOLD = -8;

const RECOVERY_STREAK_THRESHOLD = 3;
const CLEAN_SCORE_THRESHOLD = 75;

/**
 * Détecte une récupération comportementale.
 *
 * @param {Array<Object>} sessions
 * @returns {Object|null}
 */
export function detectRecovery(
  sessions = []
) {
  const chronologicalSessions =
    getClosedSessionsChronologically(
      sessions
    );

  if (
    chronologicalSessions.length <
    MINIMUM_SESSIONS
  ) {
    return null;
  }

  /**
   * Analyse récente :
   * série actuellement propre.
   */

  const currentCleanStreak =
    getCurrentCleanStreak(
      chronologicalSessions
    );

  const recentSessions =
    chronologicalSessions.slice(-5);

  const recentAverageScore =
    getAverageScore(
      recentSessions
    );

  const recentPlanRespectRate =
    getPlanRespectRate(
      recentSessions
    );

  const recentEmotionalErrorRate =
    getEmotionalErrorRate(
      recentSessions
    );

  const recentRecoveryDetected =
    currentCleanStreak >=
      RECOVERY_STREAK_THRESHOLD &&
    recentAverageScore >=
      CLEAN_SCORE_THRESHOLD &&
    recentPlanRespectRate >= 80 &&
    recentEmotionalErrorRate === 0;

  /**
   * Analyse historique :
   * perte -> session suivante.
   */

  const recoveryEvents =
    buildRecoveryEvents(
      chronologicalSessions
    );

  const improvedEvents =
    recoveryEvents.filter(
      (event) =>
        event.scoreDelta >=
        DISCIPLINE_IMPROVEMENT_THRESHOLD
    );

  const stableEvents =
    recoveryEvents.filter(
      (event) =>
        event.scoreDelta >
          DISCIPLINE_DECLINE_THRESHOLD &&
        event.scoreDelta <
          DISCIPLINE_IMPROVEMENT_THRESHOLD
    );

  const declinedEvents =
    recoveryEvents.filter(
      (event) =>
        event.scoreDelta <=
        DISCIPLINE_DECLINE_THRESHOLD
    );

  const respectedPlanAfterLoss =
    recoveryEvents.filter(
      (event) =>
        event.nextSession
          .plan_respected === true
    ).length;

  const emotionalErrorsAfterLoss =
    recoveryEvents.filter(
      (event) =>
        isEmotionalError(
          event.nextSession
            .dominant_error
        )
    ).length;

  const averageScoreBeforeLoss =
    recoveryEvents.length > 0
      ? Math.round(
          average(
            recoveryEvents.map(
              (event) =>
                event.lossSessionScore
            )
          )
        )
      : 0;

  const averageScoreAfterLoss =
    recoveryEvents.length > 0
      ? Math.round(
          average(
            recoveryEvents.map(
              (event) =>
                event.nextSessionScore
            )
          )
        )
      : 0;

  const averageRecoveryDelta =
    recoveryEvents.length > 0
      ? Math.round(
          average(
            recoveryEvents.map(
              (event) =>
                event.scoreDelta
            )
          )
        )
      : 0;

  const recoveryRate =
    getRate(
      improvedEvents.length,
      recoveryEvents.length
    );

  const stabilityRate =
    getRate(
      improvedEvents.length +
        stableEvents.length,
      recoveryEvents.length
    );

  const planRespectRate =
    getRate(
      respectedPlanAfterLoss,
      recoveryEvents.length
    );

  const emotionalErrorRate =
    getRate(
      emotionalErrorsAfterLoss,
      recoveryEvents.length
    );

  /**
   * Recovery historique positive.
   */

  const historicalRecoveryDetected =
    recoveryEvents.length >=
      MINIMUM_LOSS_EVENTS &&
    (
      (
        recoveryRate >= 50 &&
        averageRecoveryDelta >= 4
      ) ||
      (
        stabilityRate >= 75 &&
        planRespectRate >= 70 &&
        emotionalErrorRate <= 25
      )
    );

  /**
   * Important :
   *
   * Recovery ne doit plus produire d'insight
   * si la dynamique actuelle est redevenue fragile.
   */

  const recentDeteriorationDetected =
    recentEmotionalErrorRate >= 20 ||
    recentPlanRespectRate < 80 ||
    recentAverageScore <
      CLEAN_SCORE_THRESHOLD;

  /**
   * Une recovery active récente reste prioritaire.
   */

  if (
    !recentRecoveryDetected &&
    recentDeteriorationDetected
  ) {
    return null;
  }

  /**
   * Si aucune récupération récente
   * ni historique positive :
   * Recovery reste silencieux.
   */

  if (
    !recentRecoveryDetected &&
    !historicalRecoveryDetected
  ) {
    return null;
  }

  const recoveryType =
    recentRecoveryDetected
      ? "active"
      : "positive";

  const confidence =
    calculateConfidence({
      totalSessions:
        chronologicalSessions.length,

      recoveryEvents:
        recoveryEvents.length,

      recoveryRate,

      stabilityRate,

      planRespectRate,

      emotionalErrorRate,

      averageRecoveryDelta,

      currentCleanStreak,

      recentRecoveryDetected,

      recentAverageScore,

      recentPlanRespectRate,
    });

  const priority =
    calculatePriority({
      recoveryType,

      recoveryEvents:
        recoveryEvents.length,

      recoveryRate,

      stabilityRate,

      currentCleanStreak,

      recentRecoveryDetected,

      recentAverageScore,

      recentPlanRespectRate,
    });

  const message =
    buildRecoveryMessage({
      recoveryType,

      recoveryEvents:
        recoveryEvents.length,

      improvedEvents:
        improvedEvents.length,

      stableEvents:
        stableEvents.length,

      declinedEvents:
        declinedEvents.length,

      averageScoreBeforeLoss,

      averageScoreAfterLoss,

      averageRecoveryDelta,

      recoveryRate,

      stabilityRate,

      planRespectRate,

      emotionalErrorRate,

      currentCleanStreak,

      recentAverageScore,

      recentPlanRespectRate,

      recentEmotionalErrorRate,
    });

  return {
    id:
      recoveryType === "active"
        ? "recovery-active"
        : "recovery-positive",

    priority,

    confidence,

    category: "recovery",

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
        chronologicalSessions.length,

      recoveryEvents:
        recoveryEvents.length,

      improvedEvents:
        improvedEvents.length,

      stableEvents:
        stableEvents.length,

      declinedEvents:
        declinedEvents.length,

      averageScoreBeforeLoss,

      averageScoreAfterLoss,

      averageRecoveryDelta,

      recoveryRate,

      stabilityRate,

      planRespectRate,

      emotionalErrorRate,

      currentCleanStreak,

      recentRecoveryDetected,

      recentAverageScore,

      recentPlanRespectRate,

      recentEmotionalErrorRate,

      recencyScore:
        getRecoveryRecencyScore(
          chronologicalSessions
        ),
    },
  };
}

/**
 * Trie les sessions clôturées
 * de la plus ancienne à la plus récente.
 */
function getClosedSessionsChronologically(
  sessions
) {
  if (
    !Array.isArray(
      sessions
    )
  ) {
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
        new Date(
          a.created_at
        ).getTime() -
        new Date(
          b.created_at
        ).getTime()
    );
}

/**
 * Construit les événements :
 *
 * perte
 *   ↓
 * session suivante
 */
function buildRecoveryEvents(
  sessions
) {
  const events = [];

  for (
    let index = 0;
    index <
    sessions.length - 1;
    index += 1
  ) {
    const lossSession =
      sessions[index];

    const nextSession =
      sessions[index + 1];

    const lossPnl =
      toValidNumber(
        lossSession.session_pnl
      );

    if (
      lossPnl === null ||
      lossPnl >= 0
    ) {
      continue;
    }

    const lossSessionScore =
      toValidScore(
        lossSession
          .discipline_score
      );

    const nextSessionScore =
      toValidScore(
        nextSession
          .discipline_score
      );

    if (
      lossSessionScore === null ||
      nextSessionScore === null
    ) {
      continue;
    }

    events.push({
      lossSession,

      nextSession,

      lossSessionScore,

      nextSessionScore,

      scoreDelta:
        nextSessionScore -
        lossSessionScore,

      lossDate:
        lossSession.created_at,

      recoveryDate:
        nextSession.created_at,
    });
  }

  return events;
}

/**
 * Compte les sessions propres
 * actuellement consécutives.
 */
function getCurrentCleanStreak(
  sessions
) {
  let streak = 0;

  for (
    let index =
      sessions.length - 1;
    index >= 0;
    index -= 1
  ) {
    if (
      isCleanSession(
        sessions[index]
      )
    ) {
      streak += 1;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Session propre :
 *
 * - discipline >= 75 ;
 * - plan respecté ;
 * - aucune erreur émotionnelle.
 */
function isCleanSession(
  session
) {
  if (!session) {
    return false;
  }

  const score =
    toValidScore(
      session.discipline_score
    );

  return (
    score !== null &&
    score >=
      CLEAN_SCORE_THRESHOLD &&
    session.plan_respected ===
      true &&
    !isEmotionalError(
      session.dominant_error
    )
  );
}

function isEmotionalError(
  error
) {
  if (
    typeof error !== "string"
  ) {
    return false;
  }

  const normalized =
    error
      .trim()
      .toLowerCase()
      .replace(
        /\s+/g,
        " "
      );

  return [
    "revenge trade",
    "overtrading",
    "entrée fomo",
    "trade hors plan",
  ].includes(
    normalized
  );
}

function getAverageScore(
  sessions
) {
  const scores =
    sessions
      .map(
        (session) =>
          toValidScore(
            session
              .discipline_score
          )
      )
      .filter(
        (score) =>
          score !== null
      );

  if (
    scores.length === 0
  ) {
    return 0;
  }

  return Math.round(
    average(scores)
  );
}

function getPlanRespectRate(
  sessions
) {
  const sessionsWithPlan =
    sessions.filter(
      (session) =>
        session.plan_respected ===
          true ||
        session.plan_respected ===
          false
    );

  if (
    sessionsWithPlan.length === 0
  ) {
    return 0;
  }

  const respected =
    sessionsWithPlan.filter(
      (session) =>
        session.plan_respected ===
        true
    ).length;

  return getRate(
    respected,
    sessionsWithPlan.length
  );
}

function getEmotionalErrorRate(
  sessions
) {
  if (
    sessions.length === 0
  ) {
    return 0;
  }

  const emotional =
    sessions.filter(
      (session) =>
        isEmotionalError(
          session.dominant_error
        )
    ).length;

  return getRate(
    emotional,
    sessions.length
  );
}

function toValidScore(
  value
) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

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

  return Number.isNaN(
    number
  )
    ? null
    : number;
}

function average(
  values
) {
  if (
    !values.length
  ) {
    return 0;
  }

  return (
    values.reduce(
      (sum, value) =>
        sum + value,
      0
    ) /
    values.length
  );
}

function getRate(
  count,
  total
) {
  if (!total) {
    return 0;
  }

  return Math.round(
    (
      count /
      total
    ) * 100
  );
}

/**
 * Confiance Recovery.
 */
function calculateConfidence({
  totalSessions,
  recoveryEvents,
  recoveryRate,
  stabilityRate,
  planRespectRate,
  emotionalErrorRate,
  averageRecoveryDelta,
  currentCleanStreak,
  recentRecoveryDetected,
  recentAverageScore,
  recentPlanRespectRate,
}) {
  let confidence = 38;

  if (
    totalSessions >= 10
  ) {
    confidence += 8;
  }

  if (
    totalSessions >= 20
  ) {
    confidence += 8;
  }

  if (
    recoveryEvents >= 3
  ) {
    confidence += 5;
  }

  if (
    recoveryEvents >= 5
  ) {
    confidence += 6;
  }

  if (
    recoveryRate >= 60
  ) {
    confidence += 4;
  }

  if (
    stabilityRate >= 80
  ) {
    confidence += 4;
  }

  if (
    planRespectRate >= 75
  ) {
    confidence += 4;
  }

  if (
    emotionalErrorRate <= 20
  ) {
    confidence += 4;
  }

  if (
    Math.abs(
      averageRecoveryDelta
    ) >= 8
  ) {
    confidence += 4;
  }

  if (
    currentCleanStreak >= 3
  ) {
    confidence += 8;
  }

  if (
    currentCleanStreak >= 5
  ) {
    confidence += 5;
  }

  if (
    recentRecoveryDetected
  ) {
    confidence += 8;
  }

  if (
    recentAverageScore >= 85
  ) {
    confidence += 4;
  }

  if (
    recentPlanRespectRate === 100
  ) {
    confidence += 4;
  }

  return clamp(
    Math.round(
      confidence
    ),
    0,
    100
  );
}

/**
 * Priorité Recovery.
 */
function calculatePriority({
  recoveryType,
  recoveryEvents,
  recoveryRate,
  stabilityRate,
  currentCleanStreak,
  recentRecoveryDetected,
  recentAverageScore,
  recentPlanRespectRate,
}) {
  let priority =
    recoveryType === "active"
      ? 91
      : 72;

  if (
    recoveryEvents >= 4
  ) {
    priority += 3;
  }

  if (
    recoveryEvents >= 6
  ) {
    priority += 2;
  }

  if (
    recoveryRate >= 70
  ) {
    priority += 3;
  }

  if (
    stabilityRate >= 85
  ) {
    priority += 3;
  }

  if (
    currentCleanStreak >= 3
  ) {
    priority += 4;
  }

  if (
    currentCleanStreak >= 5
  ) {
    priority += 2;
  }

  if (
    recentRecoveryDetected
  ) {
    priority += 4;
  }

  if (
    recentAverageScore >= 85
  ) {
    priority += 2;
  }

  if (
    recentPlanRespectRate === 100
  ) {
    priority += 2;
  }

  return clamp(
    priority,
    0,
    recoveryType === "active"
      ? 98
      : 90
  );
}

/**
 * Récence basée sur
 * la dernière session clôturée.
 */
function getRecoveryRecencyScore(
  sessions
) {
  if (
    !sessions.length
  ) {
    return 0;
  }

  const latestSession =
    sessions[
      sessions.length - 1
    ];

  if (
    !latestSession?.created_at
  ) {
    return 0;
  }

  const latestDate =
    new Date(
      latestSession.created_at
    ).getTime();

  if (
    Number.isNaN(
      latestDate
    )
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

  if (
    daysSince <= 3
  ) {
    return 100;
  }

  if (
    daysSince <= 7
  ) {
    return 85;
  }

  if (
    daysSince <= 14
  ) {
    return 65;
  }

  if (
    daysSince <= 30
  ) {
    return 45;
  }

  return 20;
}

/**
 * Message Recovery.
 */
function buildRecoveryMessage({
  recoveryType,
  recoveryEvents,
  improvedEvents,
  stableEvents,
  declinedEvents,
  averageScoreBeforeLoss,
  averageScoreAfterLoss,
  averageRecoveryDelta,
  recoveryRate,
  stabilityRate,
  planRespectRate,
  emotionalErrorRate,
  currentCleanStreak,
  recentAverageScore,
  recentPlanRespectRate,
  recentEmotionalErrorRate,
}) {
  if (
    recoveryType === "active"
  ) {
    return {
      insight:
        `Tu viens d’enchaîner ${currentCleanStreak} sessions propres après une période de dérive.`,

      explanation:
        `Sur tes sessions récentes, ta discipline moyenne atteint ${recentAverageScore} %, ton plan est respecté ${recentPlanRespectRate} % du temps et aucune erreur émotionnelle récente n’est détectée.`,

      action:
        "Ne cherche pas à accélérer parce que tu vas mieux. Protège exactement le comportement qui vient de te permettre de reprendre le contrôle.",
    };
  }

  if (
    recoveryRate >= 70 &&
    averageRecoveryDelta >= 6
  ) {
    return {
      insight:
        `Dans ${recoveryRate} % des cas, ta discipline s’améliore après une perte.`,

      explanation:
        `Ton score moyen passe de ${averageScoreBeforeLoss} % à ${averageScoreAfterLoss} % sur la session suivante.`,

      action:
        "Continue d’analyser chaque perte avant de reprendre. Ce débrief semble renforcer ton comportement plutôt que l’affaiblir.",
    };
  }

  if (
    stabilityRate >= 75 &&
    planRespectRate >= 70
  ) {
    return {
      insight:
        `Après une perte, tu conserves une exécution stable dans ${stabilityRate} % des cas.`,

      explanation:
        `Ton plan reste respecté dans ${planRespectRate} % des sessions suivantes, avec ${emotionalErrorRate} % d’erreurs émotionnelles observées.`,

      action:
        "Continue de protéger cette stabilité. Le bon objectif après une perte n’est pas de récupérer, mais de rester identique dans ton processus.",
    };
  }

  if (
    improvedEvents >=
    stableEvents
  ) {
    return {
      insight:
        "Tes pertes sont plus souvent suivies d’une amélioration que d’une dégradation de ta discipline.",

      explanation:
        `Sur ${recoveryEvents} événements analysés, ${improvedEvents} montrent une progression et ${declinedEvents} une baisse nette.`,

      action:
        "Garde une trace précise de ce que tu modifies après chaque perte. PRIME détecte que ces ajustements produisent un effet utile.",
    };
  }

  return {
    insight:
      "Tes pertes ne dégradent plus systématiquement ton comportement.",

    explanation:
      `PRIME observe une stabilité globale après les sessions négatives, avec un score moyen passant de ${averageScoreBeforeLoss} % à ${averageScoreAfterLoss} %.`,

    action:
      "Continue de traiter chaque perte comme une donnée à analyser, et non comme une somme à récupérer.",
  };
}

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

export default detectRecovery;
