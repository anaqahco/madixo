import { createClient } from '@/lib/supabase/server';
import type {
  AnalysisResult,
  ReportSortOption,
  SavedMadixoReport,
} from '@/lib/madixo-reports';

type ReportsTableRow = {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  query: string;
  market: string;
  customer: string;
  opportunity_score: number;
  opportunity_label: string;
  summary: string;
  result_json: AnalysisResult;
};

function toSafeText(value: string | null | undefined, fallback: string) {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function normalizeComparableText(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[ً-ٰٟ]/g, '');
}

function sameNormalizedText(a: string, b: string) {
  return normalizeComparableText(a) === normalizeComparableText(b);
}

function mapRowToSavedReport(row: ReportsTableRow): SavedMadixoReport {
  return {
    id: row.id,
    createdAt: row.created_at,
    query: toSafeText(row.query, 'Untitled opportunity'),
    market: toSafeText(row.market, 'Not specified'),
    customer: toSafeText(row.customer, 'Not specified'),
    result: row.result_json,
  };
}

async function getRequiredUser() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw new Error(error.message);
  }

  if (!user) {
    throw new Error('AUTH_REQUIRED');
  }

  return { supabase, user };
}

export async function getCurrentMadixoUser() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw new Error(error.message);
  }

  return user;
}

export async function getUserReportsCount(): Promise<number> {
  const { supabase, user } = await getRequiredUser();

  const { count, error } = await supabase
    .from('reports')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

export async function saveReportToDb(params: {
  query: string;
  market: string;
  customer: string;
  result: AnalysisResult;
}) {
  const { supabase, user } = await getRequiredUser();

  const payload = {
    user_id: user.id,
    query: toSafeText(params.query, 'Untitled opportunity'),
    market: toSafeText(params.market, 'Not specified'),
    customer: toSafeText(params.customer, 'Not specified'),
    opportunity_score: params.result.opportunityScore,
    opportunity_label: toSafeText(
      params.result.opportunityLabel,
      'Moderate Opportunity'
    ),
    summary: toSafeText(
      params.result.summary,
      'Madixo generated an opportunity report.'
    ),
    result_json: params.result,
  };

  const { data, error } = await supabase
    .from('reports')
    .insert(payload)
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'Failed to save report.');
  }

  return mapRowToSavedReport(data as ReportsTableRow);
}

export async function getUserReports(
  sortBy: ReportSortOption = 'latest'
): Promise<SavedMadixoReport[]> {
  const { supabase, user } = await getRequiredUser();

  let query = supabase.from('reports').select('*').eq('user_id', user.id);

  switch (sortBy) {
    case 'oldest':
      query = query.order('created_at', { ascending: true });
      break;

    case 'highestScore':
      query = query
        .order('opportunity_score', { ascending: false })
        .order('created_at', { ascending: false });
      break;

    case 'lowestScore':
      query = query
        .order('opportunity_score', { ascending: true })
        .order('created_at', { ascending: false });
      break;

    case 'latest':
    default:
      query = query.order('created_at', { ascending: false });
      break;
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map((row) => mapRowToSavedReport(row as ReportsTableRow));
}

export async function getUserReportsByIds(ids: string[]) {
  if (!ids.length) {
    return [];
  }

  const { supabase, user } = await getRequiredUser();

  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('user_id', user.id)
    .in('id', ids);

  if (error) {
    throw new Error(error.message);
  }

  const mapped = (data || []).map((row) =>
    mapRowToSavedReport(row as ReportsTableRow)
  );

  return ids
    .map((id) => mapped.find((report) => report.id === id))
    .filter((report): report is SavedMadixoReport => Boolean(report));
}


export async function updateReportResultInDb(params: {
  id: string;
  result: AnalysisResult;
}) {
  const { supabase, user } = await getRequiredUser();

  const payload = {
    opportunity_score: params.result.opportunityScore,
    opportunity_label: toSafeText(
      params.result.opportunityLabel,
      'Moderate Opportunity'
    ),
    summary: toSafeText(
      params.result.summary,
      'Madixo generated an opportunity report.'
    ),
    result_json: params.result,
  };

  const { data, error } = await supabase
    .from('reports')
    .update(payload)
    .eq('id', params.id)
    .eq('user_id', user.id)
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'Failed to update report.');
  }

  return mapRowToSavedReport(data as ReportsTableRow);
}

export async function findLatestMatchingUserReport(params: {
  query: string;
  market: string;
  customer: string;
}) {
  try {
    const user = await getCurrentMadixoUser();

    if (!user) {
      return null;
    }

    const reports = await getUserReports('latest');

    return (
      reports.find(
        (report) =>
          sameNormalizedText(report.query, params.query) &&
          sameNormalizedText(report.market, params.market) &&
          sameNormalizedText(report.customer, params.customer)
      ) || null
    );
  } catch {
    return null;
  }
}

export async function deleteUserReportFromDb(id: string) {
  const { supabase, user } = await getRequiredUser();

  const { error } = await supabase
    .from('reports')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(error.message);
  }
}
