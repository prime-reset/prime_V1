/**
 * Détecteur PRIME — Execution State
 *
 * Objectif :
 * Identifier les configurations psychologiques
 * associées à l’exécution la plus alignée du trader.
 *
 * PRIME croise notamment :
 *
 * - l’état mental avant la session ;
 * - l’état mental après la session ;
 * - le score de discipline ;
 * - le respect du plan ;
 * - les erreurs déclarées ;
 * - le résultat financier comme signal secondaire.
 *
 * IMPORTANT :
 * Ce détecteur ne mesure pas directement la confiance,
 * car aucun champ de confiance n’est encore enregistré.
 *
 * Le détecteur retourne :
 * - un insight standardisé ;
 * - ou null si les données sont insuffisantes.
 */

const MINIMUM_SESSIONS = 10;
const MINIMUM_SESSIONS_PER_STATE = 3;
const MINIMUM_ALIGNMENT_GAP = 8;

/**
 * Détecte l’état d’exécution
 * le plus aligné du trader.
 *
 * @param {Array<Object>} sessions
 * @returns {Object|null}
 */
export function detectExecutionState(
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

  const usableSessions =
    closedSessions.filter(
      (session) => {
        return (
          hasText(
            session.mental_state
          ) &&
          toValidScore(
            session.discipline_score
          ) !== null
        );
      }
    );

  if (
    usableSessions.length <
    MINIMUM_SESSIONS
  ) {
    return null;
  }

  const groupedStates =
    groupSessionsByState(
      usableSessions
    );

  const stateStats =
    Object.entries(
      groupedStates
    )
      .map(
        ([state, stateSessions]) =>
          buildStateStats(
            state,
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
          b.alignmentIndex -
          a.alignmentIndex
      );

  if (
    stateStats.length < 2
  ) {
    return null;
  }

  const bestState =
    stateStats[0];

  const secondBestState =
    stateStats[1];

  const alignmentGap =
    bestState.alignmentIndex -
    secondBestState.alignmentIndex;

  const scoreGap =
    bestState.averageScore -
    secondBestState.averageScore;

  const planGap =
    bestState.planRespectRate -
    secondBestState.planRespectRate;

  const errorGap =
    secondBestState.errorRate -
    bestState.errorRate;

  const strongState =
    bestState.averageScore >= 75 &&
    bestState.planRespectRate >= 65;

  const clearAdvantage =
    alignmentGap >=
      MINIMUM_ALIGNMENT_GAP ||
    scoreGap >= 8 ||
    planGap >= 20 ||
    errorGap >= 25;

  if (
    !strongState ||
    !clearAdvantage
  ) {
    return null;
  }

  const confidence =
    calculateConfidence({
      totalSessions:
        closedSessions.length,

      usableSessions:
        usableSessions.length,

      bestStateSessions:
        bestState.sessionsCount,

      availableStates:
        stateStats.length,

      alignmentGap,

      scoreGap,

      planGap,

      errorGap,

      bestAverageScore:
        bestState.averageScore,

      bestPlanRespectRate:
        bestState.planRespectRate,
    });

  const priority =
    calculatePriority({
      bestStateSessions:
        bestState.sessionsCount,

      alignmentGap,

      scoreGap,

      planGap,

      errorGap,

      bestAverageScore:
        bestState.averageScore,

      bestPlanRespectRate:
        bestState.planRespectRate,
    });

  const message =
    buildExecutionStateMessage({
      bestState,

      secondBestState,

      alignmentGap,

      scoreGap,

      planGap,

      errorGap,
    });
    return {
    id: "execution-state",

    priority,

    confidence,

    category: "execution",

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

      usableSessions:
        usableSessions.length,

      analyzedStates:
        stateStats.length,

      bestState:
        bestState.state,

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

      bestAlignmentIndex:
        bestState.alignmentIndex,

      secondBestState:
        secondBestState.state,

      secondBestAlignmentIndex:
        secondBestState.alignmentIndex,

      alignmentGap,

      scoreGap,

      planGap,

      errorGap,

      recencyScore:
        getRecencyScore(
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
 * Regroupe les sessions
 * selon leur état mental pré-session.
 */

function groupSessionsByState(
  sessions
) {
  return sessions.reduce(
    (groups, session) => {
      const state =
        normalizeState(
          session.mental_state
        );

      if (!state) {
        return groups;
      }

      if (!groups[state]) {
        groups[state] = [];
      }

      groups[state].push(
        session
      );

      return groups;
    },
    {}
  );
}

/**
 * Calcule les statistiques
 * d’un état psychologique.
 */

function buildStateStats(
  state,
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

  const errorSessions =
    sessions.filter(
      (session) =>
        hasText(
          session.dominant_error
        )
    ).length;

  const errorRate =
    Math.round(
      (
        errorSessions /
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

  const stablePostStateRate =
    getStablePostStateRate(
      sessions
    );

  const alignmentIndex =
    calculateAlignmentIndex({
      averageScore,
      planRespectRate,
      errorRate,
      positivePnlRate,
      stablePostStateRate,
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
    state,

    sessionsCount:
      sessions.length,

    averageScore,

    planRespectRate,

    errorRate,

    positivePnlRate,

    stablePostStateRate,

    alignmentIndex,

    latestSessionAt,
  };
}
/**
 * Mesure la stabilité de l’état mental
 * à la fin de la session.
 *
 * Les états considérés comme stables
 * peuvent être adaptés plus tard.
 */

function getStablePostStateRate(
  sessions
) {
  const sessionsWithPostState =
    sessions.filter(
      (session) =>
        hasText(
          session.post_mental_state
        )
    );

  if (
    sessionsWithPostState.length === 0
  ) {
    return 0;
  }

  const stableStates = [
    "satisfait",
    "neutre",
    "fière",
    "calme",
    "focus",
  ];

  const stableSessions =
    sessionsWithPostState.filter(
      (session) => {
        const postState =
          normalizeState(
            session.post_mental_state
          );

        return stableStates.includes(
          postState.toLowerCase()
        );
      }
    ).length;

  return Math.round(
    (
      stableSessions /
      sessionsWithPostState.length
    ) * 100
  );
}

/**
 * Produit un indice global
 * d’alignement d’exécution.
 *
 * Le PnL reste volontairement
 * un signal secondaire.
 */

function calculateAlignmentIndex({
  averageScore,
  planRespectRate,
  errorRate,
  positivePnlRate,
  stablePostStateRate,
  sessionsCount,
}) {
  const scoreComponent =
    averageScore * 0.45;

  const planComponent =
    planRespectRate * 0.25;

  const errorComponent =
    (100 - errorRate) * 0.15;

  const postStateComponent =
    stablePostStateRate * 0.1;

  const pnlComponent =
    positivePnlRate * 0.05;

  const volumeBonus =
    Math.min(
      sessionsCount * 1.2,
      6
    );

  return Math.round(
    scoreComponent +
    planComponent +
    errorComponent +
    postStateComponent +
    pnlComponent +
    volumeBonus
  );
}

/**
 * Vérifie qu’une valeur texte
 * est réellement renseignée.
 */

function hasText(
  value
) {
  return (
    typeof value === "string" &&
    value.trim().length > 0
  );
}

/**
 * Normalise un état mental.
 */

function normalizeState(
  value
) {
  if (!hasText(value)) {
    return null;
  }

  return value
    .trim()
    .replace(/\s+/g, " ");
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

function average(
  values
) {
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
 * de l’insight Execution State.
 */

function calculateConfidence({
  totalSessions,
  usableSessions,
  bestStateSessions,
  availableStates,
  alignmentGap,
  scoreGap,
  planGap,
  errorGap,
  bestAverageScore,
  bestPlanRespectRate,
}) {
  let confidence = 36;

  if (totalSessions >= 12) {
    confidence += 8;
  }

  if (totalSessions >= 20) {
    confidence += 10;
  }

  if (totalSessions >= 50) {
    confidence += 10;
  }

  if (usableSessions >= 10) {
    confidence += 5;
  }

  if (bestStateSessions >= 4) {
    confidence += 5;
  }

  if (bestStateSessions >= 6) {
    confidence += 5;
  }

  if (availableStates >= 3) {
    confidence += 4;
  }

  if (alignmentGap >= 10) {
    confidence += 5;
  }

  if (scoreGap >= 10) {
    confidence += 4;
  }

  if (planGap >= 20) {
    confidence += 4;
  }

  if (errorGap >= 25) {
    confidence += 4;
  }

  if (bestAverageScore >= 85) {
    confidence += 3;
  }

  if (bestPlanRespectRate >= 80) {
    confidence += 3;
  }

  return clamp(
    Math.round(confidence),
    0,
    100
  );
}
/**
 * Définit la priorité
 * de l’insight Execution State.
 */

function calculatePriority({
  bestStateSessions,
  alignmentGap,
  scoreGap,
  planGap,
  errorGap,
  bestAverageScore,
  bestPlanRespectRate,
}) {
  let priority = 70;

  if (bestStateSessions >= 4) {
    priority += 4;
  }

  if (bestStateSessions >= 6) {
    priority += 3;
  }

  if (alignmentGap >= 8) {
    priority += 4;
  }

  if (alignmentGap >= 12) {
    priority += 4;
  }

  if (scoreGap >= 8) {
    priority += 4;
  }

  if (planGap >= 20) {
    priority += 4;
  }

  if (errorGap >= 25) {
    priority += 4;
  }

  if (bestAverageScore >= 85) {
    priority += 3;
  }

  if (bestPlanRespectRate >= 80) {
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
 * du signal Execution State.
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
 * à l’état d’exécution détecté.
 */

function buildExecutionStateMessage({
  bestState,
  secondBestState,
  alignmentGap,
  scoreGap,
  planGap,
  errorGap,
}) {
  if (
    bestState.averageScore >= 85 &&
    bestState.planRespectRate >= 80
  ) {
    return {
      insight:
        `Lorsque tu arrives au marché dans l’état « ${bestState.state} », ton exécution est particulièrement alignée.`,

      explanation:
        `Dans cet état, ta discipline moyenne atteint ${bestState.averageScore} %, ton plan est respecté ${bestState.planRespectRate} % du temps et ton taux d’erreur est de ${bestState.errorRate} %.`,

      action:
        `Avant chaque session, vérifie si tu retrouves réellement les conditions associées à l’état « ${bestState.state} ».`,
    };
  }

  if (alignmentGap >= 12) {
    return {
      insight:
        `L’état « ${bestState.state} » produit actuellement ta meilleure qualité d’exécution.`,

      explanation:
        `Son indice d’alignement dépasse de ${alignmentGap} points celui de l’état « ${secondBestState.state} ».`,

      action:
        "Identifie les conditions qui précèdent cet état : préparation, sommeil, environnement, pression et attentes.",
    };
  }

  if (
    scoreGap >= 8 &&
    planGap >= 20
  ) {
    return {
      insight:
        `Tu exécutes mieux lorsque ton état mental est « ${bestState.state} ».`,

      explanation:
        `Dans cet état, ta discipline gagne ${scoreGap} points et ton respect du plan augmente de ${planGap} points par rapport à l’état suivant le plus performant.`,

      action:
        "Utilise cet état comme filtre avant de trader. Si tu ne le retrouves pas, réduis ton activité ou passe en observation.",
    };
  }

  if (errorGap >= 25) {
    return {
      insight:
        `L’état « ${bestState.state} » réduit nettement tes erreurs comportementales.`,

      explanation:
        `Ton taux d’erreur y est inférieur de ${errorGap} points à celui observé dans l’état « ${secondBestState.state} ».`,

      action:
        "Cherche à reproduire les conditions qui favorisent cet état avant de prendre une décision de marché.",
    };
  }

  return {
    insight:
      `Ton état « ${bestState.state} » semble actuellement le plus aligné avec ton meilleur trading.`,

    explanation:
      `Sur ${bestState.sessionsCount} sessions, ton indice d’alignement atteint ${bestState.alignmentIndex}, avec une discipline moyenne de ${bestState.averageScore} %.`,

    action:
      "Continue de renseigner ton état mental avant et après chaque session afin de confirmer la stabilité de ce signal.",
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

export default detectExecutionState;
