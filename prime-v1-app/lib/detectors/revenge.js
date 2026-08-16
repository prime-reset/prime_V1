/**
 * Détecteur PRIME — Revenge Trading
 *
 * Objectif :
 * Identifier une spirale comportementale après une perte
 * tout en distinguant :
 *
 * - une vulnérabilité historique ;
 * - un pattern actuellement actif.
 *
 * Règle importante :
 * après 3 sessions propres consécutives depuis le dernier
 * signal émotionnel, Revenge cesse d’être considéré comme actif.
 */

const MINIMUM_SESSIONS = 8;
const RECENT_WINDOW = 10;
const MINIMUM_REVENGE_EVENTS = 2;

const DISCIPLINE_DECLINE_THRESHOLD = -8;
const CLEAN_STREAK_TO_DEACTIVATE = 3;

/**
 * Détecte un pattern de revenge trading actif.
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

  const repeatedDeclaredRevenge =
    declaredRevengeSessions.length >=
    MINIMUM_REVENGE_EVENTS;

  /**
   * ----------------------------------------------------------
   * NOUVEAU :
   * mesure la propreté depuis le dernier signal émotionnel.
   * ----------------------------------------------------------
   */

  const latestEmotionalIndex =
    findLatestEmotionalSessionIndex(
      recentSessions
    );

  const cleanStreak =
    getCleanStreakAfterIndex(
      recentSessions,
      latestEmotionalIndex
    );

  const recentRecoveryConfirmed =
    cleanStreak >=
    CLEAN_STREAK_TO_DEACTIVATE;

  /**
   * Si le trader a maintenant enchaîné
   * 3 sessions propres ou plus,
   * l’ancien Revenge reste historique
   * mais n’est plus un signal actif.
   */

  if (
    recentRecoveryConfirmed &&
    !activeRecentPattern
  ) {
    return null;
  }

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
    revengeEvents.length
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
    revengeEvents.length
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

  const disciplineDeclineRate =
    getRate(
      disciplineDeclines.length,
      revengeEvents.length
    );

  const planBreakRate =
    getRate(
      planBreaksAfterLoss.length,
      revengeEvents.length
    );

  const emotionalErrorRate =
    getRate(
      emotionalErrorsAfterLoss.length,
      revengeEvents.length
    );

  const deeperLossRate =
    getRate(
      deeperLossesAfterLoss.length,
      revengeEvents.length
    );

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
      activeRecentPattern &&
      positiveSignals >= 2
    ) ||
    (
      repeatedDeclaredRevenge &&
      positiveSignals >= 2
    ) ||
    (
      revengeEvents.length >= 2 &&
      positiveSignals >= 3
    );

  if (!revengeDetected) {
    return null;
  }

  /**
   * Nouveau garde-fou :
   *
   * Même si les statistiques historiques
   * restent négatives, un seul ancien Revenge
   * ne doit pas empêcher Recovery de prendre la parole.
   */

  const latestSignalAt =
    getLatestEmotionalSignalDate(
      recentSessions,
      revengeEvents
    );

  const confidence =
    calculateConfidence({
      totalSessions:
        chronologicalSessions.length,

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

      cleanStreak,
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

      cleanStreak,
    });

  const message =
    buildRevengeMessage({
      revengeEvents:
        revengeEvents.length,

      declaredRevengeEvents:
        declaredRevengeSessions.length,

      averageScoreBefore,

      averageScoreAfter,

      averageScoreDelta,

      disciplineDeclineRate,

      planBreakRate,

      emotionalErrorRate,

      deeperLossRate,

      activeRecentPattern,

      cleanStreak,

      positiveSignals,
    });

  return {
    id:
      "revenge-trading",

    priority,

    confidence,

    category:
      "risk",

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

      cleanStreak,

      recentRecoveryConfirmed,

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
          latestSignalAt
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
function buildRevengeEvents(
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
 * Renvoie l’index du dernier signal
 * émotionnel récent.
 */
function findLatestEmotionalSessionIndex(
  sessions
) {
  for (
    let index =
      sessions.length - 1;
    index >= 0;
    index -= 1
  ) {
    if (
      isEmotionalError(
        sessions[index]
          .dominant_error
      )
    ) {
      return index;
    }
  }

  return -1;
}

/**
 * Compte les sessions propres
 * après le dernier signal émotionnel.
 */
function getCleanStreakAfterIndex(
  sessions,
  signalIndex
) {
  if (
    signalIndex < 0
  ) {
    return sessions.length;
  }

  let streak = 0;

  for (
    let index =
      signalIndex + 1;
    index < sessions.length;
    index += 1
  ) {
    if (
      isCleanSession(
        sessions[index]
      )
    ) {
      streak += 1;
    } else {
      streak = 0;
    }
  }

  return streak;
}

/**
 * Détermine si une session
 * peut être considérée comme propre.
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

  const noEmotionalError =
    !isEmotionalError(
      session.dominant_error
    );

  const planRespected =
    session.plan_respected === true;

  const strongDiscipline =
    score !== null &&
    score >= 75;

  return (
    noEmotionalError &&
    planRespected &&
    strongDiscipline
  );
}

/**
 * Vérifie si l’erreur appartient
 * à une dérive émotionnelle.
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
  ].includes(
    normalized
  );
}

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
    .replace(
      /\s+/g,
      " "
    );
}

/**
 * Retourne la date du signal
 * émotionnel le plus récent.
 */
function getLatestEmotionalSignalDate(
  sessions,
  revengeEvents
) {
  const emotionalSessions =
    sessions.filter(
      (session) =>
        isEmotionalError(
          session.dominant_error
        )
    );

  if (
    emotionalSessions.length
  ) {
    return emotionalSessions[
      emotionalSessions.length - 1
    ].created_at;
  }

  if (
    revengeEvents.length
  ) {
    return revengeEvents[
      revengeEvents.length - 1
    ].recoveryDate;
  }

  return null;
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

  return Number.isNaN(number)
    ? null
    : number;
}

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
 * Confiance :
 * historique + convergence des signaux,
 * mais pénalisée si le trader recommence
 * à produire des sessions propres.
 */
function calculateConfidence({
  totalSessions,
  revengeEvents,
  declaredRevengeEvents,
  positiveSignals,
  disciplineDeclineRate,
  planBreakRate,
  emotionalErrorRate,
  deeperLossRate,
  activeRecentPattern,
  cleanStreak,
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
    confidence += 8;
  }

  if (
    revengeEvents >= 2
  ) {
    confidence += 5;
  }

  if (
    revengeEvents >= 4
  ) {
    confidence += 5;
  }

  if (
    declaredRevengeEvents >= 2
  ) {
    confidence += 7;
  }

  if (
    positiveSignals >= 3
  ) {
    confidence += 5;
  }

  if (
    disciplineDeclineRate >= 50
  ) {
    confidence += 4;
  }

  if (
    planBreakRate >= 50
  ) {
    confidence += 4;
  }

  if (
    emotionalErrorRate >= 50
  ) {
    confidence += 4;
  }

  if (
    deeperLossRate >= 40
  ) {
    confidence += 3;
  }

  if (
    activeRecentPattern
  ) {
    confidence += 10;
  }

  /**
   * La confiance dans le fait
   * que le problème soit ACTUEL
   * diminue lorsque le trader
   * enchaîne des sessions propres.
   */

  if (
    cleanStreak === 1
  ) {
    confidence -= 5;
  }

  if (
    cleanStreak === 2
  ) {
    confidence -= 12;
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
 * Priorité :
 *
 * Revenge doit rester très prioritaire
 * lorsqu’il est actif, mais perdre
 * rapidement la priorité lorsqu’un
 * redressement récent apparaît.
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
  cleanStreak,
}) {
  let priority = 84;

  if (
    revengeEvents >= 2
  ) {
    priority += 3;
  }

  if (
    declaredRevengeEvents >= 2
  ) {
    priority += 4;
  }

  if (
    positiveSignals >= 3
  ) {
    priority += 4;
  }

  if (
    disciplineDeclineRate >= 50
  ) {
    priority += 3;
  }

  if (
    planBreakRate >= 50
  ) {
    priority += 3;
  }

  if (
    emotionalErrorRate >= 50
  ) {
    priority += 3;
  }

  if (
    deeperLossRate >= 40
  ) {
    priority += 2;
  }

  if (
    activeRecentPattern
  ) {
    priority += 8;
  }

  /**
   * Nouveau :
   * une session propre réduit légèrement
   * l’urgence, deux la réduisent fortement.
   *
   * À 3 sessions propres,
   * le détecteur retourne déjà null.
   */

  if (
    cleanStreak === 1
  ) {
    priority -= 8;
  }

  if (
    cleanStreak === 2
  ) {
    priority -= 18;
  }

  return clamp(
    priority,
    0,
    100
  );
}

/**
 * Récence du dernier signal émotionnel.
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
 * Message utilisateur.
 */
function buildRevengeMessage({
  revengeEvents,
  declaredRevengeEvents,
  averageScoreBefore,
  averageScoreAfter,
  averageScoreDelta,
  disciplineDeclineRate,
  planBreakRate,
  emotionalErrorRate,
  deeperLossRate,
  activeRecentPattern,
  cleanStreak,
  positiveSignals,
}) {
  if (
    activeRecentPattern
  ) {
    return {
      insight:
        "Le revenge trading apparaît dans au moins deux de tes trois dernières sessions.",

      explanation:
        "PRIME détecte une spirale récente et active. Ce signal nécessite une intervention immédiate avant qu’il ne devienne une habitude.",

      action:
        "Après une perte, impose une pause obligatoire. Aucun nouveau trade sans setup complet et validation de ton plan.",
    };
  }

  if (
    cleanStreak === 2
  ) {
    return {
      insight:
        "Ton signal de revenge reste présent dans l’historique, mais tes deux dernières sessions montrent déjà un meilleur contrôle.",

      explanation:
        "PRIME détecte un début de stabilisation. Le pattern n’est pas encore considéré comme totalement résorbé.",

      action:
        "Protège encore une session propre. Ne cherche pas à prouver que le problème est réglé : répète simplement ton processus.",
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
        `Sur ${revengeEvents} situations post-perte observées, PRIME détecte une relation récurrente entre résultat négatif et dégradation de ton cadre.`,

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
        `Cette tendance est basée sur ${revengeEvents} situations post-perte observées. PRIME distingue maintenant ce signal historique de ton comportement le plus récent.`,

      action:
        "Transforme toute perte en fin de cycle temporaire. Aucun nouveau trade tant que l’émotion n’est pas revenue à un niveau neutre.",
    };
  }

  if (
    deeperLossRate >= 40
  ) {
    return {
      insight:
        `Dans ${deeperLossRate} % des cas observés, une perte est suivie d’une perte plus importante.`,

      explanation:
        "Le comportement de récupération semble parfois amplifier le risque au lieu de corriger le résultat.",

      action:
        "Fixe une limite de perte stricte et rends toute reprise impossible lorsqu’elle est atteinte.",
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
        "Après une perte, mesure ta capacité à retrouver un comportement stable plutôt que ta capacité à récupérer de l’argent.",
    };
  }

  if (
    declaredRevengeEvents >= 2
  ) {
    return {
      insight:
        `Le revenge trading a été déclaré ${declaredRevengeEvents} fois sur la période analysée.`,

      explanation:
        `PRIME observe ${positiveSignals} signaux convergents autour de la discipline, du plan et de la réaction émotionnelle.`,

      action:
        "Crée une règle automatique après perte : pause, relecture du plan et validation obligatoire avant toute nouvelle décision.",
    };
  }

  return {
    insight:
      "PRIME détecte encore une vulnérabilité à vouloir réparer les pertes par l’action.",

    explanation:
      `Sur ${revengeEvents} événements post-perte analysés, plusieurs signaux montrent une dégradation comportementale.`,

    action:
      "Après une perte, protège ton capital mental avant ton capital financier. La prochaine décision ne doit jamais servir à corriger la précédente.",
  };
}

/**
 * Maintient une valeur
 * entre un minimum et un maximum.
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
