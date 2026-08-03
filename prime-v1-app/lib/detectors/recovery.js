/**
 * Détecteur PRIME — Recovery
 *
 * Objectif :
 * Analyser la réaction comportementale du trader
 * après une session financièrement négative.
 *
 * PRIME cherche notamment à savoir si :
 *
 * - la discipline s’améliore après une perte ;
 * - le plan reste respecté ;
 * - les erreurs émotionnelles diminuent ;
 * - une perte déclenche au contraire une dérive.
 *
 * Le détecteur retourne :
 * - un insight standardisé ;
 * - ou null si les données sont insuffisantes.
 */

const MINIMUM_SESSIONS = 8;
const MINIMUM_LOSS_EVENTS = 2;
const DISCIPLINE_IMPROVEMENT_THRESHOLD = 5;
const DISCIPLINE_DECLINE_THRESHOLD = -8;

/**
 * Détecte la capacité de récupération après une perte.
 *
 * @param {Array<Object>} sessions
 * @returns {Object|null}
 */
export function detectRecovery(sessions = []) {
  const chronologicalSessions =
    getClosedSessionsChronologically(sessions);

  if (
    chronologicalSessions.length <
    MINIMUM_SESSIONS
  ) {
    return null;
  }

  const recoveryEvents =
    buildRecoveryEvents(
      chronologicalSessions
    );

  if (
    recoveryEvents.length <
    MINIMUM_LOSS_EVENTS
  ) {
    return null;
  }

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
    Math.round(
      average(
        recoveryEvents.map(
          (event) =>
            event.lossSessionScore
        )
      )
    );

  const averageScoreAfterLoss =
    Math.round(
      average(
        recoveryEvents.map(
          (event) =>
            event.nextSessionScore
        )
      )
    );

  const averageRecoveryDelta =
    Math.round(
      average(
        recoveryEvents.map(
          (event) =>
            event.scoreDelta
        )
      )
    );

  const recoveryRate =
    Math.round(
      (
        improvedEvents.length /
        recoveryEvents.length
      ) * 100
    );

  const stabilityRate =
    Math.round(
      (
        (
          improvedEvents.length +
          stableEvents.length
        ) /
        recoveryEvents.length
      ) * 100
    );

  const planRespectRate =
    Math.round(
      (
        respectedPlanAfterLoss /
        recoveryEvents.length
      ) * 100
    );

  const emotionalErrorRate =
    Math.round(
      (
        emotionalErrorsAfterLoss /
        recoveryEvents.length
      ) * 100
    );

  const recoveryDetected =
    (
      recoveryRate >= 50 &&
      averageRecoveryDelta >= 4
    ) ||
    (
      stabilityRate >= 75 &&
      planRespectRate >= 70 &&
      emotionalErrorRate <= 25
    );

  const fragileRecoveryDetected =
    declinedEvents.length >= 2 ||
    emotionalErrorRate >= 50;

  if (
    !recoveryDetected &&
    !fragileRecoveryDetected
  ) {
    return null;
  }

  const recoveryType =
    fragileRecoveryDetected
      ? "fragile"
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
    });

  const priority =
    calculatePriority({
      recoveryType,

      recoveryEvents:
        recoveryEvents.length,

      recoveryRate,

      stabilityRate,

      emotionalErrorRate,

      averageRecoveryDelta,
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
    });

  return {
    id:
      recoveryType === "fragile"
        ? "recovery-fragile"
        : "recovery-positive",

    priority,

    confidence,

    category:
      recoveryType === "fragile"
        ? "risk"
        : "recovery",

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

      recencyScore:
        getRecoveryRecencyScore(
          recoveryEvents
        ),
    },
  };
}

/**
 * Trie les sessions clôturées
 * de la plus ancienne à la plus récente.
 *
 * L’ordre chronologique est indispensable
 * pour analyser ce qui se passe après une perte.
 */

function getClosedSessionsChronologically(
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
          a.created_at
        ).getTime() -
        new Date(
          b.created_at
        ).getTime()
      );
    });
}

/**
 * Construit les événements de récupération.
 *
 * Un événement correspond à :
 *
 * session perdante
 *        ↓
 * session suivante
 *
 * PRIME compare alors les deux comportements.
 */

function buildRecoveryEvents(
  sessions
) {
  const events = [];

  for (
    let index = 0;
    index < sessions.length - 1;
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
        lossSession.discipline_score
      );

    const nextSessionScore =
      toValidScore(
        nextSession.discipline_score
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
 * Détermine si l’erreur déclarée
 * après une perte est émotionnelle.
 */

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
      .toLowerCase();

  return [
    "revenge trade",
    "overtrading",
    "entrée fomo",
    "trade hors plan",
  ].includes(normalized);
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
 * Convertit une valeur
 * numérique de façon sécurisée.
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
 * de l’insight Recovery.
 */

function calculateConfidence({
  totalSessions,
  recoveryEvents,
  recoveryRate,
  stabilityRate,
  planRespectRate,
  emotionalErrorRate,
  averageRecoveryDelta,
}) {
  let confidence = 38;

  if (totalSessions >= 10) {
    confidence += 8;
  }

  if (totalSessions >= 20) {
    confidence += 10;
  }

  if (totalSessions >= 50) {
    confidence += 10;
  }

  if (recoveryEvents >= 3) {
    confidence += 6;
  }

  if (recoveryEvents >= 5) {
    confidence += 8;
  }

  if (recoveryRate >= 60) {
    confidence += 5;
  }

  if (stabilityRate >= 80) {
    confidence += 5;
  }

  if (planRespectRate >= 75) {
    confidence += 4;
  }

  if (emotionalErrorRate <= 20) {
    confidence += 4;
  }

  if (Math.abs(averageRecoveryDelta) >= 8) {
    confidence += 5;
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
 * Une récupération fragile peut devenir
 * prioritaire car elle révèle un risque.
 */

function calculatePriority({
  recoveryType,
  recoveryEvents,
  recoveryRate,
  stabilityRate,
  emotionalErrorRate,
  averageRecoveryDelta,
}) {
  let priority =
    recoveryType === "fragile"
      ? 82
      : 72;

  if (recoveryEvents >= 4) {
    priority += 4;
  }

  if (recoveryEvents >= 6) {
    priority += 3;
  }

  if (
    recoveryType === "fragile" &&
    emotionalErrorRate >= 50
  ) {
    priority += 6;
  }

  if (
    recoveryType === "fragile" &&
    averageRecoveryDelta <= -10
  ) {
    priority += 5;
  }

  if (
    recoveryType === "positive" &&
    recoveryRate >= 70
  ) {
    priority += 4;
  }

  if (
    recoveryType === "positive" &&
    stabilityRate >= 85
  ) {
    priority += 3;
  }

  return clamp(
    priority,
    0,
    recoveryType === "fragile"
      ? 96
      : 88
  );
}

/**
 * Calcule la récence du signal Recovery.
 *
 * Plus les événements observés sont récents,
 * plus l’insight est pertinent.
 */

function getRecoveryRecencyScore(
  recoveryEvents
) {
  if (!recoveryEvents.length) {
    return 0;
  }

  const latestEvent =
    recoveryEvents[
      recoveryEvents.length - 1
    ];

  const latestDate =
    new Date(
      latestEvent.recoveryDate
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
 * au type de récupération détecté.
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
}) {
  if (recoveryType === "fragile") {
    if (
      emotionalErrorRate >= 50
    ) {
      return {
        insight:
          `Après une perte, une erreur émotionnelle apparaît dans ${emotionalErrorRate} % des cas observés.`,

        explanation:
          "PRIME détecte que la perte ne reste pas toujours un simple résultat financier. Elle peut devenir un déclencheur comportemental lors de la session suivante.",

        action:
          "Après une perte, impose une coupure claire avant toute nouvelle session et relis ton plan avant de reprendre.",
      };
    }

    return {
      insight:
        `Ta discipline baisse en moyenne de ${Math.abs(
          averageRecoveryDelta
        )} points après une perte.`,

      explanation:
        `Sur ${recoveryEvents} événements analysés, ${declinedEvents} ont été suivis d’une dégradation nette de l’exécution.`,

      action:
        "Ne cherche pas à corriger la perte immédiatement. Ton objectif prioritaire est de retrouver un état neutre avant la session suivante.",
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
        `Ton score moyen passe de ${averageScoreBeforeLoss} % à ${averageScoreAfterLoss} % sur la session suivante. PRIME observe une capacité réelle à transformer l’échec en ajustement.`,

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
        `Ton plan reste respecté dans ${planRespectRate} % des sessions suivantes, avec seulement ${emotionalErrorRate} % d’erreurs émotionnelles détectées.`,

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
        `Tes pertes sont plus souvent suivies d’une amélioration que d’une dégradation de ta discipline.`,

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

export default detectRecovery;
