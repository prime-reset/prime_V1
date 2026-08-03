/**
 * Détecteur PRIME — Revenge Trading
 *
 * Objectif :
 * Identifier une spirale comportementale de récupération
 * après une perte financière.
 *
 * PRIME cherche notamment :
 *
 * - une erreur "Revenge trade" déclarée ;
 * - une baisse de discipline après une perte ;
 * - un plan moins respecté ;
 * - une répétition récente ;
 * - une aggravation du PnL ;
 * - une dérive émotionnelle sur la session suivante.
 *
 * Le détecteur retourne :
 * - un insight standardisé ;
 * - ou null si les données sont insuffisantes.
 */

const MINIMUM_SESSIONS = 8;
const MINIMUM_REVENGE_EVENTS = 2;
const RECENT_WINDOW = 10;
const DISCIPLINE_DECLINE_THRESHOLD = -8;

/**
 * Détecte un pattern de revenge trading.
 *
 * @param {Array<Object>} sessions
 * @returns {Object|null}
 */
export function detectRevenge(
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

  const recentSessions =
    chronologicalSessions.slice(
      -RECENT_WINDOW
    );

  const revengeEvents =
    buildRevengeEvents(
      recentSessions
    );

  const declaredRevengeSessions =
    recentSessions.filter(
      (session) =>
        normalizeError(
          session.dominant_error
        ) === "revenge trade"
    );

  const repeatedDeclaredRevenge =
    declaredRevengeSessions.length >=
    MINIMUM_REVENGE_EVENTS;

  const recentThree =
    recentSessions.slice(-3);

  const recentRevengeCount =
    recentThree.filter(
      (session) =>
        normalizeError(
          session.dominant_error
        ) === "revenge trade"
    ).length;

  const activeRecentPattern =
    recentRevengeCount >= 2;

  const disciplineDeclines =
    revengeEvents.filter(
      (event) =>
        event.scoreDelta <=
        DISCIPLINE_DECLINE_THRESHOLD
    );

  const planBreaksAfterLoss =
    revengeEvents.filter(
      (event) =>
        event.nextSession
          .plan_respected === false
    );

  const emotionalErrorsAfterLoss =
    revengeEvents.filter(
      (event) =>
        isEmotionalError(
          event.nextSession
            .dominant_error
        )
    );

  const deeperLossesAfterLoss =
    revengeEvents.filter(
      (event) =>
        event.nextSessionPnl < 0 &&
        Math.abs(
          event.nextSessionPnl
        ) >
        Math.abs(
          event.lossSessionPnl
        )
    );

  const averageScoreBefore =
    revengeEvents.length > 0
      ? Math.round(
          average(
            revengeEvents.map(
              (event) =>
                event.lossSessionScore
            )
          )
        )
      : 0;

  const averageScoreAfter =
    revengeEvents.length > 0
      ? Math.round(
          average(
            revengeEvents.map(
              (event) =>
                event.nextSessionScore
            )
          )
        )
      : 0;

  const averageScoreDelta =
    averageScoreAfter -
    averageScoreBefore;

  const planBreakRate =
    revengeEvents.length > 0
      ? Math.round(
          (
            planBreaksAfterLoss.length /
            revengeEvents.length
          ) * 100
        )
      : 0;

  const emotionalErrorRate =
    revengeEvents.length > 0
      ? Math.round(
          (
            emotionalErrorsAfterLoss.length /
            revengeEvents.length
          ) * 100
        )
      : 0;

  const disciplineDeclineRate =
    revengeEvents.length > 0
      ? Math.round(
          (
            disciplineDeclines.length /
            revengeEvents.length
          ) * 100
        )
      : 0;

  const deeperLossRate =
    revengeEvents.length > 0
      ? Math.round(
          (
            deeperLossesAfterLoss.length /
            revengeEvents.length
          ) * 100
        )
      : 0;

  const spiralSignals = {
    repeatedDeclaredRevenge,
    activeRecentPattern,
    disciplineDecline:
      disciplineDeclineRate >= 40,
    planBreak:
      planBreakRate >= 40,
    emotionalError:
      emotionalErrorRate >= 40,
    deeperLoss:
      deeperLossRate >= 30,
  };

  const positiveSignals =
    Object.values(
      spiralSignals
    ).filter(Boolean).length;

  const revengeDetected =
    (
      repeatedDeclaredRevenge &&
      positiveSignals >= 2
    ) ||
    (
      activeRecentPattern &&
      positiveSignals >= 2
    ) ||
    (
      revengeEvents.length >= 2 &&
      positiveSignals >= 3
    );

  if (!revengeDetected) {
    return null;
  }

  const confidence =
    calculateConfidence({
      totalSessions:
        chronologicalSessions.length,

      analyzedSessions:
        recentSessions.length,

      revengeEvents:
        revengeEvents.length,

      declaredRevengeEvents:
        declaredRevengeSessions.length,

      positiveSignals,

      disciplineDeclineRate,

      planBreakRate,

      emotionalErrorRate,

      deeperLossRate,

      activeRecentPattern,
    });

  const priority =
    calculatePriority({
      revengeEvents:
        revengeEvents.length,

      declaredRevengeEvents:
        declaredRevengeSessions.length,

      positiveSignals,

      disciplineDeclineRate,

      planBreakRate,

      emotionalErrorRate,

      deeperLossRate,

      activeRecentPattern,
    });
    const message =
    buildRevengeMessage({
      revengeEvents:
        revengeEvents.length,

      declaredRevengeEvents:
        declaredRevengeSessions.length,

      recentRevengeCount,

      averageScoreBefore,

      averageScoreAfter,

      averageScoreDelta,

      disciplineDeclineRate,

      planBreakRate,

      emotionalErrorRate,

      deeperLossRate,

      activeRecentPattern,

      positiveSignals,
    });

  return {
    id: "revenge-trading",

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
        chronologicalSessions.length,

      analyzedSessions:
        recentSessions.length,

      revengeEvents:
        revengeEvents.length,

      declaredRevengeEvents:
        declaredRevengeSessions.length,

      recentRevengeCount,

      activeRecentPattern,

      averageScoreBefore,

      averageScoreAfter,

      averageScoreDelta,

      disciplineDeclineRate,

      planBreakRate,

      emotionalErrorRate,

      deeperLossRate,

      positiveSignals,

      recencyScore:
        getRecencyScore(
          declaredRevengeSessions[
            declaredRevengeSessions.length - 1
          ]?.created_at ||
          revengeEvents[
            revengeEvents.length - 1
          ]?.recoveryDate
        ),
    },
  };
}

/**
 * Garde uniquement les sessions clôturées
 * et les trie de la plus ancienne
 * à la plus récente.
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
 * Construit les événements
 * de revenge potentiels.
 *
 * Un événement correspond à :
 *
 * session perdante
 *        ↓
 * session suivante
 */

function buildRevengeEvents(
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

    const lossSessionPnl =
      toValidNumber(
        lossSession.session_pnl
      );

    if (
      lossSessionPnl === null ||
      lossSessionPnl >= 0
    ) {
      continue;
    }

    const nextSessionPnl =
      toValidNumber(
        nextSession.session_pnl
      );

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
      nextSessionScore === null ||
      nextSessionPnl === null
    ) {
      continue;
    }

    events.push({
      lossSession,

      nextSession,

      lossSessionPnl,

      nextSessionPnl,

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
 * Vérifie si l’erreur déclarée
 * appartient à une dérive émotionnelle.
 */

function isEmotionalError(
  error
) {
  const normalized =
    normalizeError(error);

  return [
    "revenge trade",
    "overtrading",
    "entrée fomo",
    "trade hors plan",
  ].includes(normalized);
}

/**
 * Normalise le libellé
 * d’une erreur.
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
 * de l’insight Revenge.
 */

function calculateConfidence({
  totalSessions,
  analyzedSessions,
  revengeEvents,
  declaredRevengeEvents,
  positiveSignals,
  disciplineDeclineRate,
  planBreakRate,
  emotionalErrorRate,
  deeperLossRate,
  activeRecentPattern,
}) {
  let confidence = 42;

  if (
    totalSessions >= 10
  ) {
    confidence += 8;
  }

  if (
    totalSessions >= 20
  ) {
    confidence += 10;
  }

  if (
    totalSessions >= 50
  ) {
    confidence += 10;
  }

  if (
    analyzedSessions >= 10
  ) {
    confidence += 4;
  }

  if (
    revengeEvents >= 2
  ) {
    confidence += 5;
  }

  if (
    revengeEvents >= 4
  ) {
    confidence += 6;
  }

  if (
    declaredRevengeEvents >= 2
  ) {
    confidence += 7;
  }

  if (
    declaredRevengeEvents >= 4
  ) {
    confidence += 5;
  }

  if (
    positiveSignals >= 3
  ) {
    confidence += 5;
  }

  if (
    disciplineDeclineRate >= 50
  ) {
    confidence += 5;
  }

  if (
    planBreakRate >= 50
  ) {
    confidence += 5;
  }

  if (
    emotionalErrorRate >= 50
  ) {
    confidence += 5;
  }

  if (
    deeperLossRate >= 40
  ) {
    confidence += 4;
  }

  if (
    activeRecentPattern
  ) {
    confidence += 8;
  }

  return clamp(
    Math.round(confidence),
    0,
    100
  );
}

/**
 * Définit la priorité
 * de l’insight Revenge.
 *
 * Ce détecteur peut devenir
 * l’un des plus prioritaires
 * du moteur PRIME.
 */

function calculatePriority({
  revengeEvents,
  declaredRevengeEvents,
  positiveSignals,
  disciplineDeclineRate,
  planBreakRate,
  emotionalErrorRate,
  deeperLossRate,
  activeRecentPattern,
}) {
  let priority = 88;

  if (
    revengeEvents >= 2
  ) {
    priority += 3;
  }

  if (
    revengeEvents >= 4
  ) {
    priority += 3;
  }

  if (
    declaredRevengeEvents >= 2
  ) {
    priority += 4;
  }

  if (
    declaredRevengeEvents >= 4
  ) {
    priority += 3;
  }

  if (
    positiveSignals >= 3
  ) {
    priority += 4;
  }

  if (
    disciplineDeclineRate >= 50
  ) {
    priority += 4;
  }

  if (
    planBreakRate >= 50
  ) {
    priority += 4;
  }

  if (
    emotionalErrorRate >= 50
  ) {
    priority += 4;
  }

  if (
    deeperLossRate >= 40
  ) {
    priority += 3;
  }

  if (
    activeRecentPattern
  ) {
    priority += 6;
  }

  return clamp(
    priority,
    0,
    100
  );
}

/**
 * Calcule la récence
 * du signal Revenge.
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
 * Produit le message adapté
 * au signal de revenge trading.
 */

function buildRevengeMessage({
  revengeEvents,
  declaredRevengeEvents,
  recentRevengeCount,
  averageScoreBefore,
  averageScoreAfter,
  averageScoreDelta,
  disciplineDeclineRate,
  planBreakRate,
  emotionalErrorRate,
  deeperLossRate,
  activeRecentPattern,
  positiveSignals,
}) {
  if (activeRecentPattern) {
    return {
      insight:
        "Le revenge trading apparaît dans au moins deux de tes trois dernières sessions.",

      explanation:
        "PRIME détecte une spirale récente et active. Le signal est suffisamment rapproché pour nécessiter une intervention immédiate.",

      action:
        "Après une perte, impose une pause obligatoire et interdiction de reprendre sans setup A complet et validation du plan.",
    };
  }

  if (
    disciplineDeclineRate >= 50 &&
    planBreakRate >= 50
  ) {
    return {
      insight:
        `Après une perte, ta discipline baisse dans ${disciplineDeclineRate} % des cas et ton plan est rompu dans ${planBreakRate} % des sessions suivantes.`,

      explanation:
        "La perte agit comme un déclencheur émotionnel qui dégrade à la fois ton score d’exécution et le respect de ton cadre.",

      action:
        "Ne cherche pas à récupérer. Coupe la session, note ton état mental et reprends uniquement lorsque ton plan redevient prioritaire.",
    };
  }

  if (
    emotionalErrorRate >= 50
  ) {
    return {
      insight:
        `Une erreur émotionnelle apparaît dans ${emotionalErrorRate} % des sessions suivant une perte.`,

      explanation:
        "PRIME observe que la session suivante est souvent influencée par la volonté de réparer le résultat précédent.",

      action:
        "Transforme toute perte en fin de cycle temporaire. Aucun nouveau trade tant que l’émotion n’est pas revenue à un niveau neutre.",
    };
  }

  if (
    deeperLossRate >= 40
  ) {
    return {
      insight:
        `Dans ${deeperLossRate} % des cas, une perte est suivie d’une perte encore plus importante.`,

      explanation:
        "Le comportement de récupération semble aggraver le résultat au lieu de le corriger.",

      action:
        "Fixe une limite de perte journalière stricte et rends toute reprise impossible une fois cette limite atteinte.",
    };
  }

  if (
    averageScoreDelta <= -8
  ) {
    return {
      insight:
        `Ta discipline baisse en moyenne de ${Math.abs(
          averageScoreDelta
        )} points après une perte.`,

      explanation:
        `Ton score moyen passe de ${averageScoreBefore} % à ${averageScoreAfter} % sur la session suivante.`,

      action:
        "Après une perte, ne mesure pas ta capacité à récupérer de l’argent. Mesure uniquement ta capacité à retrouver un comportement stable.",
    };
  }

  if (
    declaredRevengeEvents >= 2
  ) {
    return {
      insight:
        `Le revenge trading a été déclaré ${declaredRevengeEvents} fois sur les sessions analysées.`,

      explanation:
        `PRIME observe ${positiveSignals} signaux convergents autour de la discipline, du plan et de la dégradation du résultat.`,

      action:
        "Crée une règle automatique après perte : pause, relecture du plan et validation obligatoire avant toute nouvelle décision.",
    };
  }

  return {
    insight:
      "PRIME détecte une tendance à vouloir réparer les pertes par l’action.",

    explanation:
      `Sur ${revengeEvents} événements analysés, plusieurs signaux montrent une dégradation comportementale après une session négative.`,

    action:
      "Après une perte, protège ton capital mental avant ton capital financier. La prochaine décision ne doit jamais servir à corriger la précédente.",
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

export default detectRevenge;
