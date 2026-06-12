/**
 * OwnerPulse — Pulse Health Score Engine
 * ========================================
 * Live BPM scoring for the Owner and Director dashboards.
 *
 * Spec: Pulse Health Score Addendum Rev 2 (Sections 1-10)
 *
 * Architecture:
 *   - Each sub-score (Sections 4.1-4.9) is computed independently from raw inputs
 *   - Sub-scores are combined via role-specific weights (Section 5) into a composite
 *   - The composite is mapped to a BPM value (Section 3)
 *   - A deterministic recommendations pipeline runs on top (Section 6)
 *   - Daily snapshots enable history charts (Section 7.1)
 *
 * All thresholds and weights are exposed as config values for admin tuning (Section 9).
 */

// ═══════════════════════════════════════════════════════════════════
//  DEFAULT CONFIG — editable via admin settings without redeployment
// ═══════════════════════════════════════════════════════════════════

export const DEFAULT_CONFIG = {
  // ── Director's Pulse Weights (Section 5) ────────────────────
  directorWeights: {
    latePayments: 20,         // AR aging
    enrollmentHealth: 15,     // Capacity utilization + waitlist conversion
    compliance: 15,           // Operational (cert renewals, inspections)
    classScore: 15,           // CLASS annual assessment
    discretionaryBudget: 10,  // $9,000 petty-cash pace
    staffCallouts: 10,        // Unplanned absences only (not PTO)
    maintenance: 10,          // Open critical/high items
    incidentTrend: 5,         // Incident frequency vs rolling avg
  },

  // ── Owner's Pulse Weights (Section 5) ───────────────────────
  ownerWeights: {
    bigFinancialHealth: 25,   // Full school budget pace
    compliance: 15,           // Strategic posture (rollup)
    latePayments: 15,         // Same AR input, higher weight on Owner
    enrollmentHealth: 15,     // Long-term enrollment trend
    classScore: 10,           // Strategic — VPK contracting risk
    maintenance: 8,           // Same maintenance data
    staffCallouts: 7,         // Same callout input
    discretionaryBudget: 5,   // Director's $9k, low weight for Owner
  },

  // ── Thresholds for Sub-Score Formulas (Section 4) ──────────
  thresholds: {
    // 4.1 Enrollment Health
    enrollmentSweetSpot: 90,
    enrollmentRangeFactor: 2,
    enrollmentYoYBonus: 5,
    enrollmentWaitlistBonus: 5,
    enrollmentWaitlistThreshold: 30, // %

    // 4.2 / 4.7 Budget Pace
    budgetOvershootPenalty: 3,

    // 4.3 Staff Callouts
    calloutBaseline: 7,       // %
    calloutPenaltyFactor: 5,

    // 4.4 Late Payments / AR
    latePaymentBaseline: 2,   // %
    latePaymentPenaltyFactor: 8,

    // 4.5 Compliance
    complianceExpiredCap: 30,
    complianceExpiring14Cap: 70,
    complianceExpiring60Cap: 85,
    complianceExpiring14Days: 14,
    complianceExpiring60Days: 60,

    // 4.6 Maintenance
    maintenanceCriticalPenalty: 15,
    maintenanceOldHighPenalty: 5,
    maintenanceOldHighDays: 7,

    // 4.8 Incident Trend
    incidentTrendFactor: 40,

    // 4.9 CLASS Score
    classDisqualifying: 4.0,
    classMid: 5.5,
    classMax: 7.0,

    // 3. BPM Mapping
    bpmBase: 60,
    bpmScale: 1.4,
    bpmMin: 55,
    bpmMax: 160,
  },

  // ── Detection Thresholds for Recommendations (Section 6) ────
  detection: {
    arElevatedThreshold: 4,           // % past-due → flag ar.elevated
    arSlightlyElevatedThreshold: 2,    // % past-due → flag ar.slightly_elevated
    enrollmentUnderWithDemandCap: 80,  // capacity % below this
    enrollmentUnderWithDemandWaitlist: 5, // waitlist count above this
    calloutElevatedThreshold: 10,       // % callout rate
    maintenanceCriticalAgingDays: 3,    // days critical item has been open
  },
};

// ═══════════════════════════════════════════════════════════════════
//  SECTION 3 — BPM Mapping
// ═══════════════════════════════════════════════════════════════════

/**
 * Convert a composite score (0-100) to BPM.
 *
 * Formula: BPM ≈ 60 + (100 − Composite) × 1.4, clamped between 55 and 160.
 *
 * @param {number} composite - Composite score (0-100)
 * @param {object} [config] - Optional config overrides
 * @returns {number} BPM value (clamped 55-160)
 */
export function compositeToBpm(composite, config = {}) {
  const { bpmBase, bpmScale, bpmMin, bpmMax } = {
    ...DEFAULT_CONFIG.thresholds,
    ...config?.thresholds,
  };
  const raw = bpmBase + (100 - composite) * bpmScale;
  return Math.round(Math.max(bpmMin, Math.min(bpmMax, raw)));
}

/**
 * Get the human-readable state and color for a BPM value.
 *
 * @param {number} bpm
 * @returns {{ state: string, color: string, zone: string }}
 *
 * Zones (Section 3):
 *   60-70  → Thriving  → green
 *   71-85  → Healthy   → greenYellow
 *   86-100 → Elevated  → amber
 *   101-120→ Stressed  → orange
 *   120+   → Critical  → red
 */
export function bpmState(bpm) {
  if (bpm <= 70) {
    return { state: 'Thriving', color: '#10B981', zone: 'green' };
  }
  if (bpm <= 85) {
    return { state: 'Healthy', color: '#84CC16', zone: 'greenYellow' };
  }
  if (bpm <= 100) {
    return { state: 'Elevated', color: '#F59E0B', zone: 'amber' };
  }
  if (bpm <= 120) {
    return { state: 'Stressed', color: '#F97316', zone: 'orange' };
  }
  return { state: 'Critical', color: '#EF4444', zone: 'red' };
}

/**
 * Map the composite score to the BPM scale table from the spec (Section 3).
 * Useful for quick-lookup display.
 */
export function getCompositeBpmTable() {
  return [
    { minComposite: 95, maxComposite: 100, bpmMin: 60, bpmMax: 70, state: 'Thriving', color: '#10B981' },
    { minComposite: 85, maxComposite: 94, bpmMin: 71, bpmMax: 85, state: 'Healthy', color: '#84CC16' },
    { minComposite: 70, maxComposite: 84, bpmMin: 86, bpmMax: 100, state: 'Elevated', color: '#F59E0B' },
    { minComposite: 55, maxComposite: 69, bpmMin: 101, bpmMax: 120, state: 'Stressed', color: '#F97316' },
    { minComposite: 0, maxComposite: 54, bpmMin: 121, bpmMax: 160, state: 'Critical', color: '#EF4444' },
  ];
}

// ═══════════════════════════════════════════════════════════════════
//  SECTION 4 — Sub-Score Calculators (each returns 0-100)
// ═══════════════════════════════════════════════════════════════════

/**
 * 4.1 Enrollment Health
 *
 * Inputs: current capacity %, YoY growth, waitlist conversion rate (90-day)
 * Sweet spot: 85-95% capacity = score 100 (full is risky, under-enrolled is unhealthy)
 *
 * Formula: Score = 100 − |currentCapacity% − 90| × 2, clamped 0-100
 * Bonuses: +5 for positive YoY growth; +5 for waitlist conversion ≥30% (capped at 100)
 *
 * @param {number} capacityPct - Current capacity utilization % (0-100)
 * @param {number} yoyGrowth - YoY enrollment growth (positive = growth)
 * @param {number} waitlistConversionPct - Waitlist conversion rate % over 90 days
 * @param {object} [config] - Optional config overrides
 * @returns {number} Score 0-100
 */
export function calcEnrollmentHealth(
  capacityPct = 90,
  yoyGrowth = 0,
  waitlistConversionPct = 0,
  config = {}
) {
  const {
    enrollmentSweetSpot,
    enrollmentRangeFactor,
    enrollmentYoYBonus,
    enrollmentWaitlistBonus,
    enrollmentWaitlistThreshold,
  } = { ...DEFAULT_CONFIG.thresholds, ...config?.thresholds };

  let score = 100 - Math.abs(capacityPct - enrollmentSweetSpot) * enrollmentRangeFactor;
  score = clamp(score);

  // Bonus for positive YoY growth
  if (yoyGrowth > 0) {
    score = Math.min(100, score + enrollmentYoYBonus);
  }

  // Bonus for strong waitlist conversion
  if (waitlistConversionPct >= enrollmentWaitlistThreshold) {
    score = Math.min(100, score + enrollmentWaitlistBonus);
  }

  return Math.round(score);
}

/**
 * 4.2 Discretionary Budget Pace (Director's $9,000)
 *
 * Academic year Aug 1 – May 31, straight-line 10% per month.
 * Healthy band: within ±10% of expected pace.
 *
 * Formula: Score = 100 − max(0, (actualBurn% − expectedBurn%) × 3), clamped 0-100
 * Under-pace is NOT penalized — being frugal is healthy.
 *
 * @param {number} actualBurnPct - Actual % of budget spent
 * @param {number} expectedBurnPct - Expected % of budget at current month
 * @param {object} [config] - Optional config overrides
 * @returns {number} Score 0-100
 */
export function calcDiscretionaryBudget(
  actualBurnPct = 50,
  expectedBurnPct = 50,
  config = {}
) {
  const { budgetOvershootPenalty } = {
    ...DEFAULT_CONFIG.thresholds,
    ...config?.thresholds,
  };

  // Under-pace is not penalized
  if (actualBurnPct <= expectedBurnPct) return 100;

  const overshoot = actualBurnPct - expectedBurnPct;
  const score = 100 - Math.max(0, overshoot * budgetOvershootPenalty);
  return clamp(score);
}

/**
 * Get the expected budget burn % for the Director's discretionary budget
 * based on the academic calendar (Aug 1 – May 31, straight-line 10%/month).
 *
 * @param {Date} [now] - Current date (defaults to today)
 * @returns {number} Expected burn percentage (0-100)
 */
export function getExpectedBudgetBurn(now = new Date()) {
  const month = now.getMonth(); // 0-based
  const academicMonths = [
    /* Aug=7 */ 7, /* Sep=8 */ 8, /* Oct=9 */ 9,
    /* Nov=10 */ 10, /* Dec=11 */ 11,
    /* Jan=0 */ 0, /* Feb=1 */ 1, /* Mar=2 */ 2,
    /* Apr=3 */ 3, /* May=4 */ 4,
  ];
  const idx = academicMonths.indexOf(month);
  if (idx === -1) {
    // June (5) or July (6) — past academic year, return 100%
    return 100;
  }
  // Month 0 = Aug = 10%, Month 1 = Sep = 20%, ... Month 9 = May = 100%
  return Math.round(((idx + 1) / academicMonths.length) * 100);
}

/**
 * 4.3 Staff Callouts (unplanned absences only)
 *
 * IMPORTANT: measures unplanned callouts only — NOT PTO usage.
 * Planned PTO is a normal benefit; using it is not a health signal.
 * Only unplanned absences (no-shows, last-minute sick calls) feed this sub-score.
 *
 * Input: % of staff days lost to unplanned callouts in the last 30 days
 * Healthy baseline: ≤7%
 *
 * Formula: Score = 100 − max(0, (calloutRate% − 7) × 5), clamped 0-100
 *
 * @param {number} calloutRatePct - % of staff days lost to unplanned callouts (last 30 days)
 * @param {object} [config] - Optional config overrides
 * @returns {number} Score 0-100
 */
export function calcStaffCallouts(calloutRatePct = 5, config = {}) {
  const { calloutBaseline, calloutPenaltyFactor } = {
    ...DEFAULT_CONFIG.thresholds,
    ...config?.thresholds,
  };

  if (calloutRatePct <= calloutBaseline) return 100;

  const score = 100 - Math.max(0, (calloutRatePct - calloutBaseline) * calloutPenaltyFactor);
  return clamp(score);
}

/**
 * 4.4 Late Payments / AR Aging
 *
 * Input: % of total tuition billed that is past-due >30 days
 * Healthy: <2% past-due
 *
 * Formula: Score = 100 − max(0, (pastDuePct − 2) × 8), clamped 0-100
 * Data source: ProCare API when integrated; manual entry as fallback
 *
 * @param {number} pastDuePct - % of total tuition billed past-due >30 days
 * @param {object} [config] - Optional config overrides
 * @returns {number} Score 0-100
 */
export function calcLatePayments(pastDuePct = 1, config = {}) {
  const { latePaymentBaseline, latePaymentPenaltyFactor } = {
    ...DEFAULT_CONFIG.thresholds,
    ...config?.thresholds,
  };

  if (pastDuePct <= latePaymentBaseline) return 100;

  const score = 100 - Math.max(0, (pastDuePct - latePaymentBaseline) * latePaymentPenaltyFactor);
  return clamp(score);
}

/**
 * 4.5 Compliance Health
 *
 * Rule-based caps rather than linear scoring — compliance is binary in nature:
 *   - Any item expired → cap at 30
 *   - Any item expiring within 14 days → cap at 70
 *   - Any item expiring within 60 days → cap at 85
 *   - All current, nothing expiring within 60 days → 100
 *
 * Used on both pulses (Director sees operational, Owner sees strategic posture).
 *
 * @param {Array<{status: string, expires: string}>} items - Compliance items
 * @param {object} [config] - Optional config overrides
 * @returns {number} Score 0-100
 */
export function calcComplianceHealth(items = [], config = {}) {
  const {
    complianceExpiredCap,
    complianceExpiring14Cap,
    complianceExpiring60Cap,
    complianceExpiring14Days,
    complianceExpiring60Days,
  } = { ...DEFAULT_CONFIG.thresholds, ...config?.thresholds };

  const now = new Date();

  // Check for any expired item
  const hasExpired = items.some(
    (i) => i.status === 'expired'
  );
  if (hasExpired) return complianceExpiredCap;

  // Check for items expiring within 14 days
  const hasExpiringSoon = items.some((i) => {
    if (!i.expires) return false;
    const daysLeft = Math.ceil((new Date(i.expires) - now) / 86400000);
    return daysLeft >= 0 && daysLeft <= complianceExpiring14Days;
  });
  if (hasExpiringSoon) return complianceExpiring14Cap;

  // Check for items expiring within 60 days
  const hasExpiring = items.some((i) => {
    if (!i.expires) return false;
    const daysLeft = Math.ceil((new Date(i.expires) - now) / 86400000);
    return daysLeft >= 0 && daysLeft <= complianceExpiring60Days;
  });
  if (hasExpiring) return complianceExpiring60Cap;

  // All current
  return 100;
}

/**
 * 4.6 Operational / Maintenance Health
 *
 * Inputs: count of open Critical maintenance, count of open High maintenance >7 days old
 *
 * Formula: Score = 100 − (criticalCount × 15) − (oldHighCount × 5), clamped 0-100
 *
 * @param {number} criticalCount - Number of open critical-priority maintenance items
 * @param {number} oldHighCount - Number of open high-priority items >7 days old
 * @param {object} [config] - Optional config overrides
 * @returns {number} Score 0-100
 */
export function calcMaintenanceHealth(
  criticalCount = 0,
  oldHighCount = 0,
  config = {}
) {
  const { maintenanceCriticalPenalty, maintenanceOldHighPenalty } = {
    ...DEFAULT_CONFIG.thresholds,
    ...config?.thresholds,
  };

  const score = 100 - criticalCount * maintenanceCriticalPenalty - oldHighCount * maintenanceOldHighPenalty;
  return clamp(score);
}

/**
 * 4.7 Big Financial Health (Owner Pulse only)
 *
 * Inputs: annual school budget burn vs. expected pace; margin trend if available
 * Formula: same shape as Section 4.2 applied to total annual budget
 *
 * Future: add margin trend and scholarship revenue stability as additional terms.
 *
 * @param {number} actualBurnPct - % of total annual budget spent
 * @param {number} expectedBurnPct - Expected % at current month
 * @param {number} [marginTrend] - Optional margin trend (positive = improving)
 * @param {object} [config] - Optional config overrides
 * @returns {number} Score 0-100
 */
export function calcBigFinancialHealth(
  actualBurnPct = 50,
  expectedBurnPct = 50,
  marginTrend = 0,
  config = {}
) {
  const { budgetOvershootPenalty } = {
    ...DEFAULT_CONFIG.thresholds,
    ...config?.thresholds,
  };

  // Under-pace is healthy
  let score;
  if (actualBurnPct <= expectedBurnPct) {
    score = 100;
  } else {
    const overshoot = actualBurnPct - expectedBurnPct;
    score = 100 - Math.max(0, overshoot * budgetOvershootPenalty);
  }

  // Margin trend bonus (future: scale this)
  if (marginTrend > 0) {
    score = Math.min(100, score + 5);
  } else if (marginTrend < 0) {
    score = Math.max(0, score - 5);
  }

  return clamp(score);
}

/**
 * 4.8 Incident Trend (both pulses, low weight)
 *
 * Input: incident count last 30 days vs. trailing 90-day average
 * Score: 100 if at or below average; drops linearly if elevated
 *
 * @param {number} last30Count - Incident count in the last 30 days
 * @param {number} trailing90Avg - Average incident count over trailing 90 days
 * @param {object} [config] - Optional config overrides
 * @returns {number} Score 0-100
 */
export function calcIncidentTrend(
  last30Count = 0,
  trailing90Avg = 0,
  config = {}
) {
  const { incidentTrendFactor } = {
    ...DEFAULT_CONFIG.thresholds,
    ...config?.thresholds,
  };

  if (last30Count <= trailing90Avg) return 100;

  const ratio = last30Count / Math.max(trailing90Avg, 1);
  const excess = ratio - 1;
  const score = 100 - Math.min(100, excess * incidentTrendFactor);
  return clamp(score);
}

/**
 * 4.9 CLASS Score (both pulses — critical for childcare side)
 *
 * The Classroom Assessment Scoring System (CLASS) is the annual assessment
 * provided by the Early Learning Coalition. A provider with a CLASS score
 * below 4.0 cannot contract with ELC — existential business risk.
 *
 * Input: most recent annual CLASS score, a single number on a 1-7 scale.
 *
 * Piecewise formula:
 *   CLASS < 4.0  → score = 0 (disqualifying — pulse reflects contracting risk)
 *   4.0 ≤ CLASS < 5.5 → score = 20 + (CLASS − 4.0) × (50 / 1.5)  (ramps 20→70)
 *   5.5 ≤ CLASS ≤ 7.0 → score = 70 + (CLASS − 5.5) × (30 / 1.5)  (ramps 70→100)
 *
 * @param {number|null} classScore - Current CLASS score (1-7), null if no data
 * @param {object} [config] - Optional config overrides
 * @returns {number|null} Score 0-100, or null if no data
 */
export function calcClassScore(classScore = null, config = {}) {
  const { classDisqualifying, classMid, classMax } = {
    ...DEFAULT_CONFIG.thresholds,
    ...config?.thresholds,
  };

  if (classScore === null || classScore === undefined) return null;

  // Below disqualifying threshold → critical
  if (classScore < classDisqualifying) return 0;

  // 4.0 ≤ score < 5.5 → ramps 20 to 70
  if (classScore < classMid) {
    const score = 20 + (classScore - classDisqualifying) * (50 / 1.5);
    return Math.round(clamp(score));
  }

  // 5.5 ≤ score ≤ 7.0 → ramps 70 to 100
  const score = 70 + (classScore - classMid) * (30 / 1.5);
  return Math.round(Math.min(100, Math.max(70, score)));
}

// ═══════════════════════════════════════════════════════════════════
//  SECTION 5 — Composite Calculation
// ═══════════════════════════════════════════════════════════════════

/**
 * Calculate all sub-scores and the composite pulse for a given role.
 *
 * @param {object} inputs - Raw data inputs for all sub-scores
 * @param {string} role - 'director' | 'owner'
 * @param {object} [config] - Optional config overrides (weights + thresholds)
 * @returns {object|null} Pulse result or null if insufficient data
 *
 * Inputs shape:
 * {
 *   enrollment:  { capacityPct, yoyGrowth, waitlistConversionPct, waitlistCount },
 *   discretionary: { actualBurnPct, expectedBurnPct },
 *   callouts:    { calloutRatePct },
 *   latePayments: { pastDuePct, source: 'procare'|'manual' },
 *   compliance:  { items: [{ status, expires, item }] },
 *   maintenance: { criticalCount, oldHighCount },
 *   bigFinancial: { actualBurnPct, expectedBurnPct, marginTrend },
 *   incidents:   { last30Count, trailing90Avg },
 *   classScore:  { currentScore, history: [...pastScores] },
 * }
 */
export function calculatePulse(inputs = {}, role = 'director', config = {}) {
  const weightsConfig = {
    ...DEFAULT_CONFIG,
    ...config,
  };

  // Merge thresholds
  const mergedConfig = {
    ...config,
    thresholds: {
      ...DEFAULT_CONFIG.thresholds,
      ...config?.thresholds,
    },
  };

  // Compute all non-owner-specific sub-scores
  const subScores = {};

  // 4.1 Enrollment Health
  subScores.enrollmentHealth = calcEnrollmentHealth(
    inputs.enrollment?.capacityPct,
    inputs.enrollment?.yoyGrowth,
    inputs.enrollment?.waitlistConversionPct,
    mergedConfig
  );

  // 4.2 Discretionary Budget Pace
  subScores.discretionaryBudget = calcDiscretionaryBudget(
    inputs.discretionary?.actualBurnPct,
    inputs.discretionary?.expectedBurnPct ?? getExpectedBudgetBurn(),
    mergedConfig
  );

  // 4.3 Staff Callouts
  subScores.staffCallouts = calcStaffCallouts(
    inputs.callouts?.calloutRatePct,
    mergedConfig
  );

  // 4.4 Late Payments / AR Aging
  subScores.latePayments = calcLatePayments(
    inputs.latePayments?.pastDuePct,
    mergedConfig
  );

  // 4.5 Compliance Health
  subScores.compliance = calcComplianceHealth(
    inputs.compliance?.items ?? [],
    mergedConfig
  );

  // 4.6 Maintenance Health
  subScores.maintenance = calcMaintenanceHealth(
    inputs.maintenance?.criticalCount,
    inputs.maintenance?.oldHighCount,
    mergedConfig
  );

  // 4.8 Incident Trend
  subScores.incidentTrend = calcIncidentTrend(
    inputs.incidents?.last30Count,
    inputs.incidents?.trailing90Avg,
    mergedConfig
  );

  // 4.9 CLASS Score
  subScores.classScore = calcClassScore(
    inputs.classScore?.currentScore,
    mergedConfig
  );

  // 4.7 Owner-only: Big Financial Health
  if (role === 'owner') {
    subScores.bigFinancialHealth = calcBigFinancialHealth(
      inputs.bigFinancial?.actualBurnPct,
      inputs.bigFinancial?.expectedBurnPct ?? getExpectedBudgetBurn(),
      inputs.bigFinancial?.marginTrend,
      mergedConfig
    );
  }

  // ── Weight mapping ──────────────────────────────────────────
  const weights = role === 'owner'
    ? weightsConfig.ownerWeights
    : weightsConfig.directorWeights;

  const weightKeyToSubKey = {
    latePayments: 'latePayments',
    enrollmentHealth: 'enrollmentHealth',
    compliance: 'compliance',
    classScore: 'classScore',
    discretionaryBudget: 'discretionaryBudget',
    staffCallouts: 'staffCallouts',
    maintenance: 'maintenance',
    incidentTrend: 'incidentTrend',
    bigFinancialHealth: 'bigFinancialHealth',
  };

  // ── Weighted composite ──────────────────────────────────────
  let compositeSum = 0;
  let totalWeight = 0;

  for (const [weightKey, subKey] of Object.entries(weightKeyToSubKey)) {
    const weight = weights[weightKey];
    if (weight && subScores[subKey] !== null && subScores[subKey] !== undefined) {
      compositeSum += subScores[subKey] * weight;
      totalWeight += weight;
    }
  }

  if (totalWeight === 0) return null;

  const composite = totalWeight > 0 ? compositeSum / totalWeight : 0;
  const bpm = compositeToBpm(composite, mergedConfig);

  return {
    composite: Math.round(composite * 10) / 10,
    bpm,
    state: bpmState(bpm),
    subScores,
    weights,
    role,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Convenience: calculate both Director and Owner pulses from the same inputs.
 *
 * @param {object} inputs - Raw data inputs (same shape as calculatePulse)
 * @param {object} [config] - Optional config overrides
 * @returns {{ director: object|null, owner: object|null }}
 */
export function calculateBothPulses(inputs = {}, config = {}) {
  return {
    director: calculatePulse(inputs, 'director', config),
    owner: calculatePulse(inputs, 'owner', config),
  };
}

// ═══════════════════════════════════════════════════════════════════
//  SECTION 6 — Recommendations Pipeline
// ═══════════════════════════════════════════════════════════════════

/**
 * Step 1 — Detect issues by scanning sub-scores and underlying data.
 *
 * The detector is NOT AI — it's straightforward logic against thresholds.
 * Each detection produces a named flag with supporting data.
 *
 * Detection rules (Section 6):
 *   - Any compliance item with status = Expired → compliance.expired
 *   - Compliance item expiring within 14 days → compliance.expiring_soon
 *   - Late-payments % > 4 → ar.elevated
 *   - Late-payments % > 2 (but ≤ 4) → ar.slightly_elevated
 *   - CLASS score < 5.5 → class.below_decent (and < 4.0 → class.disqualifying)
 *   - Capacity < 80% AND waitlist count > 5 → enrollment.under_with_demand
 *   - Critical maintenance open > 3 days → maintenance.critical_aging
 *   - Callout rate > 10% → callouts.elevated
 *
 * @param {object} inputs - Same inputs shape as calculatePulse
 * @param {object} [config] - Optional detection thresholds
 * @returns {Array<object>} Array of detected issues
 */
export function detectIssues(inputs = {}, config = {}) {
  const issues = [];
  const detectionConfig = {
    ...DEFAULT_CONFIG.detection,
    ...config?.detection,
  };
  const thresholdConfig = {
    ...DEFAULT_CONFIG.thresholds,
    ...config?.thresholds,
  };

  // ── Compliance detections ───────────────────────────────────
  const complianceItems = inputs.compliance?.items ?? [];
  for (const item of complianceItems) {
    if (item.status === 'expired') {
      issues.push({
        type: 'compliance.expired',
        severity: 'critical',
        itemName: item.item,
        data: item,
      });
    } else if (item.status === 'expiring') {
      const daysLeft = Math.ceil(
        (new Date(item.expires) - new Date()) / 86400000
      );
      if (daysLeft >= 0 && daysLeft <= thresholdConfig.complianceExpiring14Days) {
        issues.push({
          type: 'compliance.expiring_soon',
          severity: 'high',
          itemName: item.item,
          daysLeft,
          data: item,
        });
      }
    }
  }

  // ── Late payments / AR ──────────────────────────────────────
  const pastDuePct = inputs.latePayments?.pastDuePct ?? 0;
  if (pastDuePct > detectionConfig.arElevatedThreshold) {
    issues.push({
      type: 'ar.elevated',
      severity: 'high',
      value: pastDuePct,
    });
  } else if (pastDuePct > detectionConfig.arSlightlyElevatedThreshold) {
    issues.push({
      type: 'ar.slightly_elevated',
      severity: 'medium',
      value: pastDuePct,
    });
  }

  // ── CLASS Score ─────────────────────────────────────────────
  const classScore = inputs.classScore?.currentScore;
  if (classScore !== null && classScore !== undefined) {
    if (classScore < thresholdConfig.classDisqualifying) {
      issues.push({
        type: 'class.disqualifying',
        severity: 'critical',
        value: classScore,
      });
    } else if (classScore < thresholdConfig.classMid) {
      issues.push({
        type: 'class.below_decent',
        severity: 'high',
        value: classScore,
      });
    }
  }

  // ── Enrollment ──────────────────────────────────────────────
  const capacityPct = inputs.enrollment?.capacityPct ?? 90;
  const waitlistCount = inputs.enrollment?.waitlistCount ?? 0;
  if (
    capacityPct < detectionConfig.enrollmentUnderWithDemandCap &&
    waitlistCount > detectionConfig.enrollmentUnderWithDemandWaitlist
  ) {
    issues.push({
      type: 'enrollment.under_with_demand',
      severity: 'medium',
      capacityPct,
      waitlistCount,
    });
  }

  // ── Maintenance ─────────────────────────────────────────────
  const criticalCount = inputs.maintenance?.criticalCount ?? 0;
  if (criticalCount > 0) {
    issues.push({
      type: 'maintenance.critical_aging',
      severity: 'critical',
      count: criticalCount,
    });
  }

  // ── Callouts ────────────────────────────────────────────────
  const calloutRate = inputs.callouts?.calloutRatePct ?? 0;
  if (calloutRate > detectionConfig.calloutElevatedThreshold) {
    issues.push({
      type: 'callouts.elevated',
      severity: 'high',
      value: calloutRate,
    });
  }

  return issues;
}

/**
 * Step 2 — Calculate the BPM impact of resolving an issue.
 *
 * Simulates: resolve the issue → recompute the sub-score → recompute the composite
 * → compute new BPM → return the delta.
 *
 * Example: "Renewing the expired CPR cert raises compliance from 30 to 100,
 * lifts the composite by 14 points, drops the pulse from 98 to 78 bpm."
 * That 20 bpm drop is the recommendation's impact value.
 *
 * @param {object} issue - A detected issue from detectIssues()
 * @param {object} inputs - Original inputs
 * @param {object} pulse - Current pulse result from calculatePulse()
 * @param {string} role - 'director' | 'owner'
 * @param {object} [config] - Optional config
 * @returns {number} BPM impact (positive = pulse drops when resolved)
 */
export function calculateIssueImpact(issue, inputs, pulse, role = 'director', config = {}) {
  // Deep clone inputs to simulate resolution
  const resolvedInputs = JSON.parse(JSON.stringify(inputs));

  switch (issue.type) {
    case 'compliance.expired':
    case 'compliance.expiring_soon': {
      const items = resolvedInputs.compliance?.items ?? [];
      const idx = items.findIndex(
        (i) => i.item === issue.data?.item
      );
      if (idx >= 0) {
        items[idx] = {
          ...items[idx],
          status: 'compliant',
          expires: new Date(
            Date.now() + 365 * 86400000
          ).toISOString().split('T')[0],
        };
      }
      break;
    }

    case 'ar.elevated':
    case 'ar.slightly_elevated':
      resolvedInputs.latePayments = {
        ...resolvedInputs.latePayments,
        pastDuePct: 1, // Bring it to healthy (<2%)
      };
      break;

    case 'class.disqualifying':
    case 'class.below_decent':
      resolvedInputs.classScore = {
        ...resolvedInputs.classScore,
        currentScore: 5.5, // Raise to decent threshold
      };
      break;

    case 'enrollment.under_with_demand':
      resolvedInputs.enrollment = {
        ...resolvedInputs.enrollment,
        capacityPct: 90, // Sweet spot
      };
      break;

    case 'maintenance.critical_aging':
      resolvedInputs.maintenance = {
        ...resolvedInputs.maintenance,
        criticalCount: 0,
      };
      break;

    case 'callouts.elevated':
      resolvedInputs.callouts = {
        ...resolvedInputs.callouts,
        calloutRatePct: 5, // Below baseline
      };
      break;

    default:
      return 0;
  }

  const resolvedPulse = calculatePulse(resolvedInputs, role, config);
  if (!resolvedPulse || !pulse) return 0;

  // Positive impact = pulse drops = improvement
  const impact = Math.round((pulse.bpm - resolvedPulse.bpm) * 10) / 10;
  return impact;
}

/**
 * Step 3 + 4 — Prioritize and articulate.
 *
 * Issues are sorted by BPM impact, descending.
 * The single biggest pulse-mover takes the #1 recommendation slot.
 *
 * Each prioritized issue is turned into a recommendation via rule-based templates.
 */
function articulateRecommendation(issue, role = 'director') {
  const impact = issue.impactBpm ?? 0;
  const impactStr = impact > 0 ? `drops pulse ${Math.abs(impact)} bpm` : `estimated benefit`;

  switch (issue.type) {
    case 'compliance.expired':
      return {
        title: `Renew ${issue.itemName}`,
        description: `This item has expired. ${impactStr}.`,
        action: 'Renew now',
      };

    case 'compliance.expiring_soon':
      return {
        title: `${issue.itemName} expires in ${issue.daysLeft} day${issue.daysLeft !== 1 ? 's' : ''}`,
        description: `Renew to prevent a compliance breach. ${impactStr}.`,
        action: 'Schedule renewal',
      };

    case 'ar.elevated':
      return {
        title: `Late payments at ${issue.value}%`,
        description: `Past-due tuition is well above the healthy 2% threshold. Follow up on accounts. ${impactStr}.`,
        action: 'Review AR aging report',
      };

    case 'ar.slightly_elevated':
      return {
        title: `AR slightly elevated (${issue.value}%)`,
        description: `Past-due tuition is creeping up. Stay on top of collections.`,
        action: 'Review AR aging report',
      };

    case 'class.disqualifying':
      return {
        title: `CLASS score ${issue.value} — Below ELC threshold`,
        description: `A CLASS score below 4.0 means you cannot contract with the Early Learning Coalition. VPK eligibility is at risk. ${impactStr}.`,
        action: 'Develop classroom quality improvement plan',
      };

    case 'class.below_decent':
      return {
        title: `CLASS score ${issue.value} — below 5.5 target`,
        description: `Improving classroom quality is critical for the next ELC assessment. ${impactStr}.`,
        action: 'Plan classroom quality improvements',
      };

    case 'enrollment.under_with_demand':
      return {
        title: `Enrollment at ${issue.capacityPct}% with ${issue.waitlistCount} on waitlist`,
        description: `There's unmet demand. Convert waitlist families to enrolled students. ${impactStr}.`,
        action: 'Follow up with waitlist families',
      };

    case 'maintenance.critical_aging':
      return {
        title: `${issue.count} critical maintenance item${issue.count !== 1 ? 's' : ''} need${issue.count === 1 ? 's' : ''} attention`,
        description: `Critical maintenance issues that have been open too long. ${impactStr}.`,
        action: 'Assign maintenance crew',
      };

    case 'callouts.elevated':
      return {
        title: `Staff callout rate at ${issue.value}%`,
        description: `Unplanned absences are above the 7% healthy baseline. Review attendance policies. ${impactStr}.`,
        action: 'Review attendance policies',
      };

    default:
      return {
        title: `Address ${issue.type.replace(/\./g, ' ')}`,
        description: `Resolving this issue will improve your pulse. ${impactStr}.`,
        action: 'Review details',
      };
  }
}

/**
 * Full recommendations pipeline (Steps 1-5).
 *
 * Step 1 — Detect issues
 * Step 2 — Impact-score each issue
 * Step 3 — Prioritize by BPM impact (descending)
 * Step 4 — Articulate into recommendation text
 * Step 5 — Present top 3
 *
 * AI guardrail: the LLM (if used) is downstream of detection. It cannot invent
 * a recommendation. If the rules engine doesn't flag an issue, no recommendation
 * appears.
 *
 * @param {object} inputs - Raw data inputs
 * @param {object} pulse - Current pulse result from calculatePulse()
 * @param {string} role - 'director' | 'owner'
 * @param {object} [config] - Optional config
 * @returns {Array<object>} Top 3 recommendations
 */
export function generateRecommendations(
  inputs = {},
  pulse = null,
  role = 'director',
  config = {}
) {
  // Step 1 — Detect
  const issues = detectIssues(inputs, config);

  // Step 2 — Impact-score
  const withImpact = issues.map((issue) => ({
    ...issue,
    impactBpm: calculateIssueImpact(issue, inputs, pulse, role, config),
  }));

  // Step 3 — Prioritize (descending by BPM impact)
  withImpact.sort((a, b) => b.impactBpm - a.impactBpm);

  // Step 4 — Articulate
  const recommendations = withImpact.map((issue) => ({
    ...articulateRecommendation(issue, role),
    type: issue.type,
    severity: issue.severity,
    impactBpm: issue.impactBpm,
  }));

  // Step 5 — Present (top 3)
  return recommendations.slice(0, 3);
}

// ═══════════════════════════════════════════════════════════════════
//  SECTION 6.1 — Thriving-Mode Recommendations
// ═══════════════════════════════════════════════════════════════════

/**
 * When pulse is calm (60-85 BPM / Thriving-Healthy), the engine switches to
 * forward-looking rules. Instead of detecting current problems, it looks for
 * things that would otherwise become problems if left alone.
 *
 * Same engine, same articulation pipeline — just a forward-looking rule set
 * when the business is calm enough to think ahead.
 *
 * Forward-looking rules:
 *   - Renewals coming due in 60-90 days (schedule now)
 *   - Next-year capacity planning (open the next-year waitlist)
 *   - CLASS reassessment approaching (prep classrooms)
 *   - Upcoming compliance audit windows
 *
 * @param {object} inputs - Raw data inputs
 * @param {object} [config] - Optional config
 * @returns {Array<object>} Up to 3 forward-looking recommendations
 */
export function generateThrivingRecommendations(inputs = {}, config = {}) {
  const recommendations = [];
  const now = new Date();
  const thresholdConfig = {
    ...DEFAULT_CONFIG.thresholds,
    ...config?.thresholds,
  };

  const complianceItems = inputs.compliance?.items ?? [];

  // Renewals coming due in 60-90 days
  for (const item of complianceItems) {
    if (!item.expires) continue;
    const daysLeft = Math.ceil((new Date(item.expires) - now) / 86400000);
    if (daysLeft >= 60 && daysLeft <= 90) {
      recommendations.push({
        title: `Plan ahead: ${item.item}`,
        description: `Renews in ${daysLeft} days. Schedule now while you have time — don't wait for the rush.`,
        action: 'Schedule renewal process',
        type: 'compliance.upcoming_renewal',
        severity: 'low',
        impactBpm: null,
      });
      // Only one renewal recommendation
      break;
    }
  }

  // Next-year capacity planning
  const capacityPct = inputs.enrollment?.capacityPct ?? 0;
  if (capacityPct >= 90) {
    recommendations.push({
      title: 'Near full capacity',
      description: `At ${capacityPct}% utilization. Consider opening the next-year waitlist now to plan ahead.`,
      action: 'Open next-year waitlist',
      type: 'enrollment.capacity_planning',
      severity: 'low',
      impactBpm: null,
    });
  }

  // CLASS reassessment approaching
  if (inputs.classScore?.lastAssessmentDate) {
    const daysSince = Math.ceil(
      (now - new Date(inputs.classScore.lastAssessmentDate)) / 86400000
    );
    if (daysSince >= 300) {
      recommendations.push({
        title: 'CLASS reassessment approaching',
        description:
          'It\'s been nearly a year since the last ELC assessment. Start prepping classrooms now.',
        action: 'Prep classrooms for ELC visit',
        type: 'class.reassessment',
        severity: 'low',
        impactBpm: null,
      });
    }
  }

  // Upcoming compliance audit windows
  for (const item of complianceItems) {
    if (!item.expires) continue;
    const daysLeft = Math.ceil((new Date(item.expires) - now) / 86400000);
    if (daysLeft >= 30 && daysLeft <= 60) {
      recommendations.push({
        title: `${item.item} expires in ${daysLeft} days`,
        description:
          'Start preparing documentation now so the renewal process is smooth.',
        action: 'Prepare documentation',
        type: 'compliance.upcoming_audit',
        severity: 'low',
        impactBpm: null,
      });
      break;
    }
  }

  return recommendations.slice(0, 3);
}

// ═══════════════════════════════════════════════════════════════════
//  SECTION 7+9 — Daily Snapshots & History
// ═══════════════════════════════════════════════════════════════════

/**
 * Create a daily snapshot object for persistence.
 *
 * Persist a daily snapshot of each sub-score, the composite, and the BPM.
 * Without this, the history chart (Section 7.1) is impossible to render.
 *
 * @param {object} inputs - Raw inputs
 * @param {object|null} ownerPulse - Owner pulse result
 * @param {object|null} directorPulse - Director pulse result
 * @returns {object} Snapshot ready for storage
 */
export function createSnapshot(inputs = {}, ownerPulse = null, directorPulse = null) {
  const today = new Date().toISOString().split('T')[0];

  return {
    date: today,
    timestamp: new Date().toISOString(),
    owner: ownerPulse
      ? {
          composite: ownerPulse.composite,
          bpm: ownerPulse.bpm,
          state: ownerPulse.state,
          subScores: ownerPulse.subScores,
        }
      : null,
    director: directorPulse
      ? {
          composite: directorPulse.composite,
          bpm: directorPulse.bpm,
          state: directorPulse.state,
          subScores: directorPulse.subScores,
        }
      : null,
  };
}

/**
 * Save a snapshot to localStorage for history charts.
 *
 * @param {object} snapshot - Snapshot from createSnapshot()
 * @param {number} [maxDays=400] - Max days to keep
 * @returns {Array<object>} All stored snapshots
 */
export function saveSnapshot(snapshot, maxDays = 400) {
  try {
    const existing = JSON.parse(
      localStorage.getItem('pulseSnapshots') || '[]'
    );
    const idx = existing.findIndex((s) => s.date === snapshot.date);
    if (idx >= 0) {
      existing[idx] = snapshot;
    } else {
      existing.push(snapshot);
    }
    const trimmed = existing.slice(-maxDays);
    localStorage.setItem('pulseSnapshots', JSON.stringify(trimmed));
    return trimmed;
  } catch {
    return [];
  }
}

/**
 * Load all snapshots from localStorage.
 *
 * @returns {Array<object>} Stored snapshots
 */
export function loadSnapshots() {
  try {
    return JSON.parse(localStorage.getItem('pulseSnapshots') || '[]');
  } catch {
    return [];
  }
}

/**
 * Get snapshot data for chart rendering, filtered by date range.
 *
 * @param {number} [days=30] - Number of days of history to retrieve
 * @returns {Array<object>} Filtered and sorted snapshots
 */
export function getSnapshotHistory(days = 30) {
  const snapshots = loadSnapshots();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return snapshots
    .filter((s) => new Date(s.date) >= cutoff)
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Clear all snapshots from localStorage.
 */
export function clearSnapshots() {
  try {
    localStorage.removeItem('pulseSnapshots');
  } catch {
    // ignore
  }
}

// ═══════════════════════════════════════════════════════════════════
//  Utility
// ═══════════════════════════════════════════════════════════════════

function clamp(value, min = 0, max = 100) {
  return Math.round(Math.max(min, Math.min(max, value)));
}
