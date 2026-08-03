import detectConsistency from "./detectors/consistency";
import detectProgress from "./detectors/progress";
import detectRecovery from "./detectors/recovery";
import detectRegression from "./detectors/regression";
import detectBestMentalState from "./detectors/bestMentalState";
import detectEdge from "./detectors/edge";
import detectOvertrading from "./detectors/overtrading";
import detectRevenge from "./detectors/revenge";
import detectExecutionState from "./detectors/executionState";

/**
 * ==========================================================
 * PRIME INSIGHTS ENGINE
 * ==========================================================
 *
 * Ce moteur exécute tous les détecteurs comportementaux.
 *
 * Chaque détecteur peut :
 *
 * - retourner un insight
 * - retourner null
 *
 * Le moteur garde uniquement les insights valides,
 * les classe par priorité,
 * puis retourne le meilleur.
 *
 */

const MINIMUM_SESSIONS_FOR_ANALYSIS = 5;

/**
 * ==========================================================
 * Insight principal affiché sur le Cockpit
 * ==========================================================
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

  if (insights.length === 0) {
    return buildObservationInsight(
      normalizedSessions.length
    );
  }

  return insights[0];
}

/**
 * ==========================================================
 * Retourne TOUS les insights.
 *
 * Plus tard :
 *
 * - ADN Trader
 * - Rapport hebdomadaire
 * - Timeline
 * - Coach
 * ==========================================================
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
      id: "consistency",

      run: () =>
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
 * ==========================================================
 * Exécution sécurisée des détecteurs
 * ==========================================================
 */

function safelyRunDetector(detector) {
  try {
    return detector.run();
  } catch (error) {
    console.error(
      `[PRIME Insights] Erreur dans "${detector.id}"`,
      error
    );

    return null;
  }
}

/**
 * ==========================================================
 * Vérifie que le détecteur respecte
 * le contrat PRIME.
 * ==========================================================
 */

function isValidInsight(insight) {
  if (!insight) return false;

  if (typeof insight !== "object") {
    return false;
  }

  const requiredFields = [
    "id",
    "category",
    "title",
    "insight",
    "explanation",
    "action",
  ];

  const stringsValid =
    requiredFields.every((field) => {
      return (
        typeof insight[field] === "string" &&
        insight[field].trim().length > 0
      );
    });

  const priorityValid =
    Number.isFinite(Number(insight.priority));

  const confidenceValid =
    Number.isFinite(Number(insight.confidence));

  return (
    stringsValid &&
    priorityValid &&
    confidenceValid
  );
}

/**
 * ==========================================================
 * Ajoute les métadonnées communes.
 * ==========================================================
 */

function enrichInsight(
  insight,
  sessions
) {
  return {

    ...insight,

    priority: clamp(
      Math.round(
        Number(insight.priority)
      ),
      0,
      100
    ),

    confidence: clamp(
      Math.round(
        Number(insight.confidence)
      ),
      0,
      100
    ),

    generatedAt:
      new Date().toISOString(),

    meta: {

      totalSessions:
        sessions.length,

      latestSessionAt:
        sessions[0]?.created_at ||

        null,

      engineVersion:
        "1.0.0",

      ...(insight.meta || {})
    },

    data:
      insight.data || {}
  };
}

/**
 * ==========================================================
 * Classement des insights
 * ==========================================================
 */

function compareInsights(a, b) {

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
      a.data?.recencyScore || 0
    );

  const recencyB =
    Number(
      b.data?.recencyScore || 0
    );

  return (
    recencyB -
    recencyA
  );
}
/**
 * ==========================================================
 * Suppression des doublons
 * ==========================================================
 */

function removeDuplicateInsights(insights) {
  const seen = new Set();

  return insights.filter((insight) => {
    const signature = [
      insight.category,
      normalizeText(insight.insight),
    ].join("::");

    if (seen.has(signature)) {
      return false;
    }

    seen.add(signature);

    return true;
  });
}

/**
 * ==========================================================
 * Normalisation des sessions
 * ==========================================================
 *
 * Le moteur :
 *
 * - garde uniquement les sessions clôturées ;
 * - convertit les données numériques ;
 * - trie de la plus récente à la plus ancienne.
 */

function normalizeSessions(sessions) {
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

    .map((session) => {
      return {
        ...session,

        discipline_score:
          toNullableNumber(
            session.discipline_score
          ),

        session_pnl:
          toNullableNumber(
            session.session_pnl
          ),
      };
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
 * ==========================================================
 * Données insuffisantes
 * ==========================================================
 *
 * PRIME reste honnête :
 * aucune conclusion forte avant 5 sessions.
 */

function buildInsufficientDataInsight(
  sessionCount
) {
  const remaining = Math.max(
    MINIMUM_SESSIONS_FOR_ANALYSIS -
      sessionCount,
    0
  );

  return {
    id: "insufficient-data",

    priority: 10,

    confidence:
      calculateBaselineConfidence(
        sessionCount
      ),

    category: "confidence",

    title:
      "Aujourd’hui PRIME remarque...",

    insight:
      sessionCount === 0
        ? "Ton empreinte comportementale n’est pas encore construite."
        : `PRIME dispose actuellement de ${sessionCount} session${
            sessionCount > 1 ? "s" : ""
          } clôturée${
            sessionCount > 1 ? "s" : ""
          }.`,

    explanation:
      remaining > 0
        ? `Il manque encore ${remaining} session${
            remaining > 1 ? "s" : ""
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
      new Date().toISOString(),

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
 * ==========================================================
 * Aucun signal fort détecté
 * ==========================================================
 *
 * PRIME préfère reconnaître qu’il observe encore
 * plutôt que d’inventer une conclusion.
 */

function buildObservationInsight(
  sessionCount
) {
  return {
    id: "observation",

    priority: 20,

    confidence:
      calculateBaselineConfidence(
        sessionCount
      ),

    category: "confidence",

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
      new Date().toISOString(),

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
 * ==========================================================
 * Confiance générale
 * ==========================================================
 *
 * Elle dépend ici uniquement du volume
 * de sessions disponibles.
 */

function calculateBaselineConfidence(
  sessionCount
) {
  if (sessionCount >= 100) {
    return 95;
  }

  if (sessionCount >= 50) {
    return 88;
  }

  if (sessionCount >= 20) {
    return 75;
  }

  if (sessionCount >= 10) {
    return 60;
  }

  if (sessionCount >= 5) {
    return 45;
  }

  return Math.max(
    10,
    sessionCount * 7
  );
}

/**
 * ==========================================================
 * Conversion numérique sécurisée
 * ==========================================================
 */

function toNullableNumber(value) {
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
 * ==========================================================
 * Nettoyage de texte
 * ==========================================================
 */

function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/**
 * ==========================================================
 * Limitation d’une valeur
 * ==========================================================
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
