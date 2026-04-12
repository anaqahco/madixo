import { createClient } from '@/lib/supabase/server';
import type {
  CreateValidationEvidenceInput,
  UiLanguage,
  UpdateValidationEvidenceInput,
  ValidationEvidenceEntry,
  EvidenceEntryType,
  EvidenceSignalStrength,
} from '@/lib/madixo-validation';
import {
  normalizeEvidenceEntryType,
  normalizeEvidenceSignalStrength,
  normalizeUiLanguage,
} from '@/lib/madixo-validation';

type ValidationEvidenceRow = {
  id: string;
  user_id: string;
  report_id: string;
  ui_lang: UiLanguage;
  entry_type: EvidenceEntryType;
  title: string;
  content: string;
  source: string;
  signal_strength: EvidenceSignalStrength;
  created_at: string;
  updated_at: string;
};

async function withAuthTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage: string
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

async function getRequiredUser(accessToken?: string | null) {
  const supabase = await createClient();

  if (accessToken) {
    try {
      const {
        data: tokenUserData,
        error: tokenUserError,
      } = await withAuthTimeout(
        supabase.auth.getUser(accessToken),
        6000,
        'AUTH_TOKEN_TIMEOUT'
      );

      if (!tokenUserError && tokenUserData.user) {
        return { supabase, user: tokenUserData.user };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'AUTH_TOKEN_TIMEOUT';
      if (message !== 'AUTH_TOKEN_TIMEOUT') {
        throw new Error(message);
      }
    }
  }

  const {
    data: cookieUserData,
    error: cookieUserError,
  } = await withAuthTimeout(supabase.auth.getUser(), 6000, 'AUTH_COOKIE_TIMEOUT');

  if (!cookieUserError && cookieUserData.user) {
    return { supabase, user: cookieUserData.user };
  }

  throw new Error('AUTH_REQUIRED');
}

function toSafeText(value: string | null | undefined, fallback = '') {
  return typeof value === 'string' ? value.trim() : fallback;
}

function mapRowToEvidenceEntry(
  row: ValidationEvidenceRow
): ValidationEvidenceEntry {
  return {
    id: row.id,
    reportId: row.report_id,
    uiLang: normalizeUiLanguage(row.ui_lang, 'en'),
    entryType: normalizeEvidenceEntryType(row.entry_type, 'interview'),
    title: toSafeText(row.title),
    content: toSafeText(row.content),
    source: toSafeText(row.source),
    signalStrength: normalizeEvidenceSignalStrength(
      row.signal_strength,
      'medium'
    ),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function invalidateDerivedValidationState(params: {
  supabase: Awaited<ReturnType<typeof createClient>>;
  userId: string;
  reportId: string;
  uiLang: UiLanguage;
}) {
  const { error } = await params.supabase
    .from('validation_plans')
    .update({
      evidence_summary_json: null,
      evidence_summary_updated_at: null,
      iteration_engine_json: null,
      iteration_engine_updated_at: null,
    })
    .eq('user_id', params.userId)
    .eq('report_id', params.reportId)
    .eq('ui_lang', params.uiLang);

  if (error) {
    throw new Error(error.message);
  }
}

export async function getUserEvidenceEntriesForUserId(params: {
  userId: string;
  reportId: string;
  uiLang: UiLanguage;
}): Promise<ValidationEvidenceEntry[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('validation_evidence')
    .select('*')
    .eq('user_id', params.userId)
    .eq('report_id', params.reportId)
    .eq('ui_lang', params.uiLang)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map((row) =>
    mapRowToEvidenceEntry(row as ValidationEvidenceRow)
  );
}

export async function getUserEvidenceEntries(
  reportId: string,
  uiLang: UiLanguage,
  accessToken?: string | null
): Promise<ValidationEvidenceEntry[]> {
  const { supabase, user } = await getRequiredUser(accessToken);

  const { data, error } = await supabase
    .from('validation_evidence')
    .select('*')
    .eq('user_id', user.id)
    .eq('report_id', reportId)
    .eq('ui_lang', uiLang)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map((row) =>
    mapRowToEvidenceEntry(row as ValidationEvidenceRow)
  );
}

export async function createUserEvidenceEntry(
  input: CreateValidationEvidenceInput
): Promise<ValidationEvidenceEntry> {
  const { supabase, user } = await getRequiredUser();

  const payload = {
    user_id: user.id,
    report_id: input.reportId,
    ui_lang: input.uiLang,
    entry_type: normalizeEvidenceEntryType(input.entryType, 'interview'),
    title: toSafeText(input.title),
    content: toSafeText(input.content),
    source: toSafeText(input.source),
    signal_strength: normalizeEvidenceSignalStrength(
      input.signalStrength,
      'medium'
    ),
  };

  const { data, error } = await supabase
    .from('validation_evidence')
    .insert(payload)
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'Failed to create evidence entry.');
  }

  const entry = mapRowToEvidenceEntry(data as ValidationEvidenceRow);

  await invalidateDerivedValidationState({
    supabase,
    userId: user.id,
    reportId: entry.reportId,
    uiLang: entry.uiLang,
  });

  return entry;
}

export async function updateUserEvidenceEntry(
  input: UpdateValidationEvidenceInput
): Promise<ValidationEvidenceEntry> {
  const { supabase, user } = await getRequiredUser();

  const patch: {
    title?: string;
    content?: string;
    source?: string;
    signal_strength?: EvidenceSignalStrength;
  } = {};

  if (typeof input.title === 'string') {
    patch.title = toSafeText(input.title);
  }

  if (typeof input.content === 'string') {
    patch.content = toSafeText(input.content);
  }

  if (typeof input.source === 'string') {
    patch.source = toSafeText(input.source);
  }

  if (typeof input.signalStrength !== 'undefined') {
    patch.signal_strength = normalizeEvidenceSignalStrength(
      input.signalStrength,
      'medium'
    );
  }

  const { data, error } = await supabase
    .from('validation_evidence')
    .update(patch)
    .eq('id', input.id)
    .eq('user_id', user.id)
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'Failed to update evidence entry.');
  }

  const entry = mapRowToEvidenceEntry(data as ValidationEvidenceRow);

  await invalidateDerivedValidationState({
    supabase,
    userId: user.id,
    reportId: entry.reportId,
    uiLang: entry.uiLang,
  });

  return entry;
}

export async function deleteUserEvidenceEntry(id: string): Promise<void> {
  const { supabase, user } = await getRequiredUser();

  const { data, error } = await supabase
    .from('validation_evidence')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)
    .select('*')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return;
  }

  const deletedEntry = mapRowToEvidenceEntry(data as ValidationEvidenceRow);

  await invalidateDerivedValidationState({
    supabase,
    userId: user.id,
    reportId: deletedEntry.reportId,
    uiLang: deletedEntry.uiLang,
  });
}


// Compatibility aliases
export const getEvidenceEntries = getUserEvidenceEntries;
export const createEvidenceEntry = createUserEvidenceEntry;
export const updateEvidenceEntry = updateUserEvidenceEntry;
export const deleteEvidenceEntry = deleteUserEvidenceEntry;
