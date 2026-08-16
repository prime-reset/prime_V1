import detectConsistency from "./detectors/consistency";
import detectProgress from "./detectors/progress";
import detectRecovery from "./detectors/recovery";
import detectRegression from "./detectors/regression";
import detectBestMentalState from "./detectors/bestMentalState";
import detectEdge from "./detectors/edge";
import detectOvertrading from "./detectors/overtrading";
import detectRevenge from "./detectors/revenge";
import detectExecutionState from "./detectors/executionState";

const MINIMUM_SESSIONS_FOR_ANALYSIS = 5;

/**
 * Retourne l'insight principal.
 */
export function getBestInsight(
  sessions = [],
  context = {}
) {
  const normalizedSessions =
    normalizeSessions(sessions);

  if (
    normalizedSessions.length <
    MINIMUM_SESSIONS_FOR_ANALYSIS
  ) {
    return buildInsufficientDataInsight(
      normalizedSessions.length
    );
  }

  const insights =
    getAllInsights(
      normalizedSessions,
      context
    );

  if (!insights.length) {
    return buildObservationInsight(
      normalizedSessions.length
    );
  }

  return insights[0];
}

/**
 * Exécute tous les détecteurs.
 */
export function getAllInsights(
  sessions = [],
  context = {}
) {
  const normalizedSessions =
    normalizeSessions(sessions);

  if (
    normalizedSessions.length <
    MINIMUM_SESSIONS_FOR_ANALYSIS
  ) {
    return [];
  }

  const detectors = [
    {
      id: "revenge",
      run: () =>
        detectRevenge(
          normalizedSessions,
          context
        ),
    },

    {
      id: "overtrading",
      run: () =>
        detectOvertrading(
          normalizedSessions,
          context
        ),
    },

    {
      id: "regression",
      run: () =>
        detectRegression(
          normalizedSessions,
          context
        ),
    },

    {
      id: "recovery",
      run: () =>
        detectRecovery(
          normalizedSessions,
          context
        ),
    },

    {
      id: "progress",
      run: () =>
        detectProgress(
          normalizedSessions,
          context
        ),
    },

    {
      id: "behavioral-edge",
      run: () =>
        detectEdge(
          normalizedSessions,
          context
        ),
    },

    {
      id: "execution-state",
      run: () =>
        detectExecutionState(
          normalizedSessions,
          context
        ),
    },

    {
      id: "best-mental-state",
      run: () =>
        detectBestMentalState(
          normalizedSessions,
          context
        ),
    },

    {
      id: "consistency",
      run: () =>
        detectConsistency(
          normalizedSessions,
          context
        ),
    },
  ];

  const insights = detectors
    .map((detector) =>
      safelyRunDetector(detector)
    )
    .filter(Boolean)
    .filter(isValidInsight)
    .map((insight) =>
      enrichInsight(
        insight,
        normalizedSessions
      )
    )
    .sort(compareInsights);

  return removeDuplicateInsights(
    insights
  );
}

/**
 * Exécute un détecteur sans casser
 * tout le moteur s’il rencontre une erreur.
 */
function safelyRunDetector(
  detector
) {
  try {
    return detector.run();
  } catch (error) {
    console.error(
      `[PRIME Insights] Erreur dans le détecteur "${detector.id}" :`,
      error
    );

    return null;
  }
}

/**
 * Vérifie que l’insight respecte
 * le contrat PRIME.
 */
function isValidInsight(
  insight
) {
  if (
    !insight ||
    typeof insight !== "object"
  ) {
    return false;
  }

  const requiredStringFields = [
    "id",
    "category",
    "title",
    "insight",
    "explanation",
    "action",
  ];

  const hasRequiredStrings =
    requiredStringFields.every(
      (field) => {
        return (
          typeof insight[field] ===
            "string" &&
          insight[field]
            .trim()
            .length > 0
        );
      }
    );

  const priority =
    Number(
      insight.priority
    );

  const confidence =
    Number(
      insight.confidence
    );

  const hasValidPriority =
    Number.isFinite(priority) &&
    priority >= 0 &&
    priority <= 100;

  const hasValidConfidence =
    Number.isFinite(confidence) &&
    confidence >= 0 &&
    confidence <= 100;

  return (
    hasRequiredStrings &&
    hasValidPriority &&
    hasValidConfidence
  );
}

/**
 * Ajoute les métadonnées communes.
 */
function enrichInsight(
  insight,
  sessions
) {
  return {
    ...insight,

    priority: clamp(
      Math.round(
        Number(
          insight.priority
        )
      ),
      0,
      100
    ),

    confidence: clamp(
      Math.round(
        Number(
          insight.confidence
        )
      ),
      0,
      100
    ),

    generatedAt:
      new Date()
        .toISOString(),

    meta: {
      totalSessions:
        sessions.length,

      latestSessionAt:
        sessions[0]
          ?.created_at || null,

      engineVersion:
        "1.0.0",

      ...(insight.meta || {}),
    },

    data:
      insight.data || {},
  };
}

/**
 * Classement :
 * 1. priorité ;
 * 2. confiance ;
 * 3. récence.
 */
function compareInsights(
  a,
  b
) {
  if (
    b.priority !==
    a.priority
  ) {
    return (
      b.priority -
      a.priority
    );
  }

  if (
    b.confidence !==
    a.confidence
  ) {
    return (
      b.confidence -
      a.confidence
    );
  }

  const recencyA =
    Number(
      a.data
        ?.recencyScore || 0
    );

  const recencyB =
    Number(
      b.data
        ?.recencyScore || 0
    );

  return (
    recencyB -
    recencyA
  );
}

/**
 * Supprime les doublons.
 */
function removeDuplicateInsights(
  insights
) {
  const seen =
    new Set();

  return insights.filter(
    (insight) => {
      const signature = [
        insight.category,
        normalizeText(
          insight.insight
        ),
      ].join("::");

      if (
        seen.has(signature)
      ) {
        return false;
      }

      seen.add(signature);

      return true;
    }
  );
}

/**
 * Nettoie les sessions avant analyse.
 */
function normalizeSessions(
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
      (session) => {
        return (
          session &&
          session.status ===
            "closed" &&
          session.created_at
        );
      }
    )
    .map(
      (session) => {
        return {
          ...session,

          discipline_score:
            toNullableNumber(
              session
                .discipline_score
            ),

          session_pnl:
            toNullableNumber(
              session
                .session_pnl
            ),
        };
      }
    )
    .sort(
      (a, b) => {
        return (
          new Date(
            b.created_at
          ).getTime() -
          new Date(
            a.created_at
          ).getTime()
        );
      }
    );
}

/**
 * Fallback lorsque PRIME
 * manque encore de données.
 */
function buildInsufficientDataInsight(
  sessionCount
) {
  const remaining =
    Math.max(
      MINIMUM_SESSIONS_FOR_ANALYSIS -
        sessionCount,
      0
    );

  return {
    id:
      "insufficient-data",

    priority: 10,

    confidence:
      calculateBaselineConfidence(
        sessionCount
      ),

    category:
      "confidence",

    title:
      "Aujourd’hui PRIME remarque...",

    insight:
      sessionCount === 0
        ? "Ton empreinte comportementale n’est pas encore construite."
        : `PRIME dispose actuellement de ${sessionCount} session${
            sessionCount > 1
              ? "s"
              : ""
          } clôturée${
            sessionCount > 1
              ? "s"
              : ""
          }.`,

    explanation:
      remaining > 0
        ? `Il manque encore ${remaining} session${
            remaining > 1
              ? "s"
              : ""
          } pour commencer à tirer une première conclusion fiable.`
        : "PRIME prépare actuellement ta première analyse comportementale.",

    action:
      "Continue de clôturer tes sessions avec honnêteté. La qualité des données compte davantage que leur apparence.",

    data: {
      sessionCount,

      requiredSessions:
        MINIMUM_SESSIONS_FOR_ANALYSIS,

      remainingSessions:
        remaining,
    },

    generatedAt:
      new Date()
        .toISOString(),

    meta: {
      totalSessions:
        sessionCount,

      latestSessionAt:
        null,

      engineVersion:
        "1.0.0",
    },
  };
}

/**
 * Fallback lorsque les données
 * sont suffisantes mais qu’aucun
 * signal fort ne se détache.
 */
function buildObservationInsight(
  sessionCount
) {
  return {
    id:
      "observation",

    priority: 20,

    confidence:
      calculateBaselineConfidence(
        sessionCount
      ),

    category:
      "confidence",

    title:
      "Aujourd’hui PRIME remarque...",

    insight:
      "Aucun pattern comportemental suffisamment fort ne se détache encore.",

    explanation:
      "Tes données actuelles ne permettent pas de distinguer une habitude durable d’une variation normale entre plusieurs sessions.",

    action:
      "Continue ton processus sans chercher à provoquer un résultat. PRIME affinera son analyse à mesure que ton historique grandira.",

    data: {
      sessionCount,
    },

    generatedAt:
      new Date()
        .toISOString(),

    meta: {
      totalSessions:
        sessionCount,

      latestSessionAt:
        null,

      engineVersion:
        "1.0.0",
    },
  };
}

/**
 * Niveau de confiance de base
 * selon le volume de données.
 */
function calculateBaselineConfidence(
  sessionCount
) {
  if (
    sessionCount >= 100
  ) {
    return 95;
  }

  if (
    sessionCount >= 50
  ) {
    return 88;
  }

  if (
    sessionCount >= 20
  ) {
    return 75;
  }

  if (
    sessionCount >= 10
  ) {
    return 60;
  }

  if (
    sessionCount >= 5
  ) {
    return 45;
  }

  return Math.max(
    10,
    sessionCount * 7
  );
}

/**
 * Convertit une valeur
 * en nombre ou null.
 */
function toNullableNumber(
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

/**
 * Nettoie un texte
 * pour la comparaison.
 */
function normalizeText(
  value
) {
  return String(
    value || ""
  )
    .trim()
    .toLowerCase()
    .replace(
      /\s+/g,
      " "
    );
}

/**
 * Maintient une valeur
 * entre un minimum
 * et un maximum.
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

export default getBestInsight;
