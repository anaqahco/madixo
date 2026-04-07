import {
  normalizeInitialFeasibilityStudy,
} from './madixo-feasibility';
import type { InitialFeasibilityStudy } from './madixo-feasibility';

export type { InitialFeasibilityStudy } from './madixo-feasibility';

export type ScoreBreakdownItem = {
  score: number;
  note: string;
};

export type ScoreBreakdown = {
  demand: ScoreBreakdownItem;
  abilityToWin: ScoreBreakdownItem;
  monetization: ScoreBreakdownItem;
  speedToMvp: ScoreBreakdownItem;
  distribution: ScoreBreakdownItem;
};

export type AnalysisResult = {
  query: string;
  opportunityScore: number;
  opportunityLabel: string;
  scoreBreakdown: ScoreBreakdown;
  summary: string;
  whyThisOpportunity: string;
  marketDemand: {
    title: string;
    description: string;
  };
  competition: {
    title: string;
    description: string;
  };
  targetCustomers: {
    title: string;
    description: string;
  };
  bestFirstCustomer: {
    title: string;
    description: string;
  };
  suggestedMvp: {
    title: string;
    description: string;
    features: string[];
  };
  firstOffer: {
    title: string;
    priceIdea: string;
    description: string;
  };
  revenueModel: {
    title: string;
    price: string;
    description: string;
  };
  nextSteps: string[];
  painPoints: string[];
  opportunityAngle: string;
  goToMarket: string;
  risks: string[];
  initialFeasibility?: InitialFeasibilityStudy;
};

export type SavedMadixoReport = {
  id: string;
  createdAt: string;
  query: string;
  market: string;
  customer: string;
  result: AnalysisResult;
};

export type ReportSortOption =
  | 'latest'
  | 'oldest'
  | 'highestScore'
  | 'lowestScore';

const STORAGE_KEY = 'madixo_saved_reports_v1';
const MAX_SAVED_REPORTS = 50;

function isBrowser() {
  return typeof window !== 'undefined';
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function normalizeText(value: unknown, fallback: string) {
  return isNonEmptyString(value) ? value.trim() : fallback;
}

function normalizeStringArray(
  value: unknown,
  fallback: string[],
  exactLength?: number
) {
  const safe = Array.isArray(value)
    ? value.filter(isNonEmptyString).map((item) => item.trim())
    : [];

  if (safe.length === 0) {
    return exactLength ? fallback.slice(0, exactLength) : fallback;
  }

  if (!exactLength) {
    return safe;
  }

  const trimmed = safe.slice(0, exactLength);

  while (trimmed.length < exactLength) {
    trimmed.push(fallback[trimmed.length] || 'Add a concrete next step.');
  }

  return trimmed;
}

function normalizeSection(
  value: unknown,
  fallbackTitle: string,
  fallbackDescription: string
) {
  const obj = isObject(value) ? value : {};

  return {
    title: normalizeText(obj.title, fallbackTitle),
    description: normalizeText(obj.description, fallbackDescription),
  };
}

function normalizeOfferSection(
  value: unknown,
  fallbackTitle: string,
  fallbackPrice: string,
  fallbackDescription: string
) {
  const obj = isObject(value) ? value : {};

  return {
    title: normalizeText(obj.title, fallbackTitle),
    priceIdea: normalizeText(obj.priceIdea, fallbackPrice),
    description: normalizeText(obj.description, fallbackDescription),
  };
}

function normalizeRevenueSection(
  value: unknown,
  fallbackTitle: string,
  fallbackPrice: string,
  fallbackDescription: string
) {
  const obj = isObject(value) ? value : {};

  return {
    title: normalizeText(obj.title, fallbackTitle),
    price: normalizeText(obj.price, fallbackPrice),
    description: normalizeText(obj.description, fallbackDescription),
  };
}

function normalizeMvpSection(value: unknown) {
  const obj = isObject(value) ? value : {};

  return {
    title: normalizeText(obj.title, 'Focused starter MVP'),
    description: normalizeText(
      obj.description,
      'Launch with one narrow workflow that solves a painful, measurable business problem.'
    ),
    features: normalizeStringArray(
      obj.features,
      [
        'Core workflow automation',
        'Simple reporting dashboard',
        'Basic onboarding and setup',
      ],
      3
    ),
  };
}

function labelFromScore(score: number) {
  if (score >= 75) return 'High Potential';
  if (score >= 60) return 'Promising Niche';
  if (score >= 40) return 'Moderate Opportunity';
  return 'Needs Validation';
}

function normalizeOpportunityScore(value: unknown, fallback = 65) {
  let score = typeof value === 'number' ? value : fallback;

  if (!Number.isFinite(score) || score < 1) {
    score = fallback;
  }

  if (score >= 1 && score <= 10) {
    score = score * 10;
  }

  score = Math.round(score);
  score = Math.max(1, Math.min(100, score));

  return score;
}

function normalizeScoreBreakdownItem(
  value: unknown,
  fallbackScore: number,
  fallbackNote: string
): ScoreBreakdownItem {
  const obj = isObject(value) ? value : {};

  return {
    score: normalizeOpportunityScore(obj.score, fallbackScore),
    note: normalizeText(obj.note, fallbackNote),
  };
}

function normalizeScoreBreakdown(value: unknown): ScoreBreakdown {
  const obj = isObject(value) ? value : {};

  return {
    demand: normalizeScoreBreakdownItem(
      obj.demand,
      72,
      'Demand appears real if the offer targets a painful and frequent problem.'
    ),
    abilityToWin: normalizeScoreBreakdownItem(
      obj.abilityToWin,
      64,
      'A narrower niche and sharper positioning can improve the chance to win.'
    ),
    monetization: normalizeScoreBreakdownItem(
      obj.monetization,
      70,
      'There is a viable path to monetization if the first offer is concrete and outcome-driven.'
    ),
    speedToMvp: normalizeScoreBreakdownItem(
      obj.speedToMvp,
      76,
      'A focused MVP can likely be launched relatively quickly.'
    ),
    distribution: normalizeScoreBreakdownItem(
      obj.distribution,
      63,
      'Distribution is possible, but customer acquisition may require focused founder-led effort.'
    ),
  };
}

function calculateOverallScoreFromBreakdown(breakdown: ScoreBreakdown) {
  const total =
    breakdown.demand.score +
    breakdown.abilityToWin.score +
    breakdown.monetization.score +
    breakdown.speedToMvp.score +
    breakdown.distribution.score;

  return Math.round(total / 5);
}

function normalizeAnalysisResult(
  value: unknown,
  fallbackQuery: string
): AnalysisResult {
  const obj = isObject(value) ? value : {};
  const scoreBreakdown = normalizeScoreBreakdown(obj.scoreBreakdown);
  const derivedScore = calculateOverallScoreFromBreakdown(scoreBreakdown);
  const hasProvidedBreakdown = isObject(obj.scoreBreakdown);
  const providedScore = normalizeOpportunityScore(obj.opportunityScore, derivedScore);
  const score = hasProvidedBreakdown ? derivedScore : providedScore;

  return {
    query: normalizeText(obj.query, fallbackQuery),
    opportunityScore: score,
    opportunityLabel: labelFromScore(score),
    scoreBreakdown,
    summary: normalizeText(
      obj.summary,
      'This opportunity looks commercially promising but still needs early customer validation.'
    ),
    whyThisOpportunity: normalizeText(
      obj.whyThisOpportunity,
      'The problem appears real, recurring, and monetizable for a clear buyer group.'
    ),
    marketDemand: normalizeSection(
      obj.marketDemand,
      'Visible demand',
      'There are signs of demand if the offer is positioned around clear operational ROI.'
    ),
    competition: normalizeSection(
      obj.competition,
      'Fragmented competition',
      'Competition exists, but a focused positioning angle can still create room to win.'
    ),
    targetCustomers: normalizeSection(
      obj.targetCustomers,
      'Specific buyer group',
      'Prioritize customers with urgent pain, budget, and a fast buying path.'
    ),
    bestFirstCustomer: normalizeSection(
      obj.bestFirstCustomer,
      'Small-to-mid market early adopter',
      'Start with buyers who already feel the pain and can approve a pilot quickly.'
    ),
    suggestedMvp: normalizeMvpSection(obj.suggestedMvp),
    firstOffer: normalizeOfferSection(
      obj.firstOffer,
      'Pilot offer',
      'Paid setup + first month',
      'Sell a paid pilot before building a bigger platform.'
    ),
    revenueModel: normalizeRevenueSection(
      obj.revenueModel,
      'Recurring subscription',
      'Monthly subscription',
      'Use a recurring pricing model tied to ongoing value and retention.'
    ),
    nextSteps: normalizeStringArray(
      obj.nextSteps,
      [
        'Interview 10 target buyers.',
        'Sell one paid pilot offer.',
        'Build the smallest useful MVP.',
      ],
      3
    ),
    painPoints: normalizeStringArray(
      obj.painPoints,
      [
        'Manual workflows waste staff time.',
        'Revenue leaks from inconsistent follow-up.',
        'Visibility into performance is limited.',
      ],
      3
    ),
    opportunityAngle: normalizeText(
      obj.opportunityAngle,
      'Win by focusing on one urgent workflow and one measurable outcome.'
    ),
    goToMarket: normalizeText(
      obj.goToMarket,
      'Use direct outreach, founder-led sales, and a narrow pilot offer to get the first customers.'
    ),
    risks: normalizeStringArray(
      obj.risks,
      [
        'The market may not buy quickly enough.',
        'The value proposition may be too broad.',
        'Execution may become too complex too early.',
      ],
      3
    ),
    initialFeasibility: obj.initialFeasibility
      ? normalizeInitialFeasibilityStudy(obj.initialFeasibility)
      : undefined,
  };
}

function normalizeCreatedAt(value: unknown) {
  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) {
      return new Date(parsed).toISOString();
    }
  }

  return new Date().toISOString();
}

function normalizeSavedReport(value: unknown): SavedMadixoReport | null {
  if (!isObject(value)) return null;

  const query = normalizeText(value.query, 'Untitled opportunity');

  return {
    id: normalizeText(
      value.id,
      `report_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    ),
    createdAt: normalizeCreatedAt(value.createdAt),
    query,
    market: normalizeText(value.market, 'Not specified'),
    customer: normalizeText(value.customer, 'Not specified'),
    result: normalizeAnalysisResult(value.result, query),
  };
}

export function getReportTimestamp(value: string) {
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

export function sortSavedReports(
  reports: SavedMadixoReport[],
  sortBy: ReportSortOption = 'latest'
) {
  const next = [...reports];

  switch (sortBy) {
    case 'oldest':
      return next.sort(
        (a, b) => getReportTimestamp(a.createdAt) - getReportTimestamp(b.createdAt)
      );

    case 'highestScore':
      return next.sort(
        (a, b) =>
          b.result.opportunityScore - a.result.opportunityScore ||
          getReportTimestamp(b.createdAt) - getReportTimestamp(a.createdAt)
      );

    case 'lowestScore':
      return next.sort(
        (a, b) =>
          a.result.opportunityScore - b.result.opportunityScore ||
          getReportTimestamp(b.createdAt) - getReportTimestamp(a.createdAt)
      );

    case 'latest':
    default:
      return next.sort(
        (a, b) => getReportTimestamp(b.createdAt) - getReportTimestamp(a.createdAt)
      );
  }
}

function saveReportsCollection(reports: SavedMadixoReport[]) {
  if (!isBrowser()) return;

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
}

export function getSavedReports(
  sortBy: ReportSortOption = 'latest'
): SavedMadixoReport[] {
  if (!isBrowser()) return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    const normalized = parsed
      .map((item) => normalizeSavedReport(item))
      .filter((item): item is SavedMadixoReport => item !== null);

    const uniqueById = normalized.filter(
      (report, index, array) =>
        array.findIndex((item) => item.id === report.id) === index
    );

    return sortSavedReports(uniqueById, sortBy);
  } catch {
    return [];
  }
}

export function getSavedReportsCount() {
  return getSavedReports().length;
}

export function saveReportToLocal(report: SavedMadixoReport) {
  if (!isBrowser()) return;

  const normalizedReport = normalizeSavedReport(report);
  if (!normalizedReport) return;

  const current = getSavedReports('latest');
  const withoutDuplicate = current.filter((item) => item.id !== normalizedReport.id);

  const next = sortSavedReports(
    [normalizedReport, ...withoutDuplicate].slice(0, MAX_SAVED_REPORTS),
    'latest'
  );

  saveReportsCollection(next);
}

export function deleteSavedReport(id: string) {
  if (!isBrowser()) return;

  const current = getSavedReports('latest');
  const next = current.filter((item) => item.id !== id);

  saveReportsCollection(next);
}

export function clearSavedReports() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export function createSavedReport(params: {
  query: string;
  market: string;
  customer: string;
  result: AnalysisResult;
}): SavedMadixoReport {
  const query = normalizeText(params.query, 'Untitled opportunity');

  return {
    id: `report_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    query,
    market: normalizeText(params.market, 'Not specified'),
    customer: normalizeText(params.customer, 'Not specified'),
    result: normalizeAnalysisResult(params.result, query),
  };
}

export function formatSavedReportDate(value: string) {
  const timestamp = Date.parse(value);

  if (Number.isNaN(timestamp)) {
    return value;
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(timestamp));
}

export function getShortOpportunityLabel(score: number, label: string) {
  const cleaned = label?.trim() || '';
  const tooLong = cleaned.length > 28 || cleaned.split(/\s+/).length > 4;

  if (!cleaned || tooLong) {
    return labelFromScore(score);
  }

  return cleaned;
}