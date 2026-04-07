'use client';

import { useEffect, useMemo, useState } from 'react';
import MixedText from '@/components/mixed-text';
import type {
  EvidenceSignalStrength,
  UiLanguage,
  ValidationEvidenceEntry,
} from '@/lib/madixo-validation';

type Props = {
  reportId: string;
  uiLang: UiLanguage;
  entries?: ValidationEvidenceEntry[];
  onEntriesChange?: (entries: ValidationEvidenceEntry[]) => void;
};

type DraftState = {
  title: string;
  content: string;
  source: string;
  signalStrength: EvidenceSignalStrength;
};

const UI_COPY = {
  en: {
    title: 'Market Notes',
    description:
      'Save only what actually happened in the market. Keep each note short, real, and specific.',
    explanation:
      'You can save more than one market note. Every new note can make the decision view clearer when you rebuild it.',
    saveFlowHint:
      'You can keep adding notes before or after generating the decision view.',
    addTitle: 'Title',
    addContent: 'Market note',
    addSource: 'Source (optional)',
    addStrength: 'Signal strength',
    titlePlaceholder: 'Example: People asked about price before anything else',
    contentPlaceholder:
      'Write what happened or what someone actually said. Keep it factual, short, and concrete.',
    sourcePlaceholder: 'WhatsApp, call, landing page, ad, in-person, etc.',
    save: 'Save note',
    saving: 'Saving...',
    update: 'Save changes',
    delete: 'Delete',
    deleting: 'Deleting...',
    edit: 'Edit',
    cancel: 'Cancel',
    emptyTitle: 'No market notes yet',
    emptyBody:
      'Start with one clear market note, then add more notes as you learn more from the market.',
    saveFailed: 'Failed to save the note.',
    deleteFailed: 'Failed to delete the note.',
    required: 'Title and market note are required.',
    saveSuccess:
      'The note was saved. You can add more notes before or after generating the decision view.',
    weak: 'Weak',
    medium: 'Medium',
    strong: 'Strong',
    addedAt: 'Added',
    countZero: 'No saved notes yet',
    countOne: '1 saved note',
    countMany: (count: number) => `${count} saved notes`,
    countImpact: 'The decision view becomes clearer as repeated notes accumulate.',
  },
  ar: {
    title: 'ملاحظات السوق',
    description:
      'احفظ هنا فقط ما حدث فعلًا في السوق. اجعل كل ملاحظة قصيرة، حقيقية، ومحددة.',
    explanation:
      'يمكنك حفظ أكثر من ملاحظة سوق. كل ملاحظة جديدة قد تجعل رؤية القرار أوضح عند إعادة بنائها.',
    saveFlowHint:
      'يمكنك إضافة ملاحظات أخرى قبل إنشاء رؤية القرار أو بعده.',
    addTitle: 'العنوان',
    addContent: 'ملاحظة السوق',
    addSource: 'المصدر (اختياري)',
    addStrength: 'قوة الإشارة',
    titlePlaceholder: 'مثال: أغلب المهتمين سألوا عن السعر أولًا',
    contentPlaceholder:
      'اكتب ما حدث أو ما قيل فعلًا. اجعلها واقعية وقصيرة ومباشرة.',
    sourcePlaceholder: 'واتساب، مكالمة، صفحة هبوط، إعلان، مقابلة، إلخ.',
    save: 'حفظ الملاحظة',
    saving: 'جار الحفظ...',
    update: 'حفظ التعديلات',
    delete: 'حذف',
    deleting: 'جار الحذف...',
    edit: 'تعديل',
    cancel: 'إلغاء',
    emptyTitle: 'لا توجد ملاحظات سوق بعد',
    emptyBody:
      'ابدأ بملاحظة واحدة واضحة، ثم أضف ملاحظات أخرى كلما تعلمت شيئًا جديدًا من السوق.',
    saveFailed: 'فشل حفظ الملاحظة.',
    deleteFailed: 'فشل حذف الملاحظة.',
    required: 'العنوان وملاحظة السوق مطلوبان.',
    saveSuccess:
      'تم حفظ الملاحظة. يمكنك إضافة ملاحظات أخرى قبل إنشاء رؤية القرار أو بعده.',
    weak: 'ضعيفة',
    medium: 'متوسطة',
    strong: 'قوية',
    addedAt: 'أضيفت في',
    countZero: 'لا توجد ملاحظات محفوظة بعد',
    countOne: 'ملاحظة واحدة محفوظة',
    countMany: (count: number) => `${count} ملاحظات محفوظة`,
    countImpact: 'كلما تكررت الملاحظات واتضحت، أصبحت رؤية القرار أقوى.',
  },
} as const;

function createEmptyDraft(): DraftState {
  return {
    title: '',
    content: '',
    source: '',
    signalStrength: 'medium',
  };
}

function formatEntryDate(value: string, uiLang: UiLanguage) {
  const timestamp = Date.parse(value);

  if (Number.isNaN(timestamp)) {
    return value;
  }

  return new Intl.DateTimeFormat(uiLang === 'ar' ? 'ar-SA' : 'en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(timestamp));
}

function strengthBadgeTone(value: EvidenceSignalStrength) {
  if (value === 'strong') {
    return 'border-[#ABEFC6] bg-[#ECFDF3] text-[#027A48]';
  }

  if (value === 'weak') {
    return 'border-[#F7D7D7] bg-[#FEF3F2] text-[#B42318]';
  }

  return 'border-[#D9E6FF] bg-[#EFF6FF] text-[#1D4ED8]';
}

function getCountLabel(count: number, uiLang: UiLanguage) {
  const copy = UI_COPY[uiLang];

  if (count <= 0) return copy.countZero;
  if (count === 1) return copy.countOne;
  return copy.countMany(count);
}

export default function ValidationEvidenceSection({
  reportId,
  uiLang,
  entries,
  onEntriesChange,
}: Props) {
  const safeEntries = Array.isArray(entries) ? entries : [];
  const copy = UI_COPY[uiLang];
  const [draft, setDraft] = useState<DraftState>(createEmptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const strengthLabel = useMemo(
    () => (value: EvidenceSignalStrength) => {
      if (value === 'weak') return copy.weak;
      if (value === 'strong') return copy.strong;
      return copy.medium;
    },
    [copy]
  );

  useEffect(() => {
    setDraft(createEmptyDraft());
    setEditingId(null);
    setError('');
    setSuccessMessage('');
  }, [reportId, uiLang]);

  const resetDraft = () => {
    setDraft(createEmptyDraft());
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!draft.title.trim() || !draft.content.trim()) {
      setError(copy.required);
      setSuccessMessage('');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccessMessage('');

      const method = editingId ? 'PATCH' : 'POST';
      const body = editingId
        ? {
            id: editingId,
            uiLang,
            title: draft.title,
            content: draft.content,
            source: draft.source,
            signalStrength: draft.signalStrength,
          }
        : {
            reportId,
            uiLang,
            entryType: 'market_signal',
            title: draft.title,
            content: draft.content,
            source: draft.source,
            signalStrength: draft.signalStrength,
          };

      const response = await fetch('/api/evidence', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
        entry?: ValidationEvidenceEntry;
      };

      if (!response.ok || !payload.ok || !payload.entry) {
        throw new Error(payload.error || copy.saveFailed);
      }

      const nextEntries = editingId
        ? safeEntries.map((entry) => (entry.id === editingId ? payload.entry! : entry))
        : [payload.entry!, ...safeEntries];

      onEntriesChange?.(nextEntries);
      resetDraft();
      setSuccessMessage(copy.saveSuccess);
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.saveFailed);
      setSuccessMessage('');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      setError('');
      setSuccessMessage('');

      const response = await fetch('/api/evidence', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, uiLang }),
      });

      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
      };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || copy.deleteFailed);
      }

      const nextEntries = safeEntries.filter((entry) => entry.id !== id);
      onEntriesChange?.(nextEntries);

      if (editingId === id) {
        resetDraft();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.deleteFailed);
    } finally {
      setDeletingId(null);
    }
  };

  const startEditing = (entry: ValidationEvidenceEntry) => {
    setEditingId(entry.id);
    setDraft({
      title: entry.title,
      content: entry.content,
      source: entry.source,
      signalStrength: entry.signalStrength,
    });
    setError('');
    setSuccessMessage('');
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-[#E5E7EB] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h3 className="text-xl font-bold text-[#111827]">{copy.title}</h3>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[#4B5563]">
              {copy.description}
            </p>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[#111827]">
              {copy.explanation}
            </p>
          </div>

          <div className="rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-2 text-sm font-semibold text-[#374151]">
            {getCountLabel(safeEntries.length, uiLang)}
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-[22px] border border-[#E5E7EB] bg-[#F9FAFB] p-4">
            <p className="text-sm font-semibold text-[#111827]">{copy.saveFlowHint}</p>
          </div>
          <div className="rounded-[22px] border border-[#D9E6FF] bg-[#EFF6FF] p-4">
            <p className="text-sm font-semibold text-[#1D4ED8]">{copy.countImpact}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-[#111827]">
            <span>{copy.addTitle}</span>
            <input
              value={draft.title}
              onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
              placeholder={copy.titlePlaceholder}
              className="w-full rounded-2xl border border-[#E5E7EB] px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-[#111827]"
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-[#111827]">
            <span>{copy.addSource}</span>
            <input
              value={draft.source}
              onChange={(event) => setDraft((current) => ({ ...current, source: event.target.value }))}
              placeholder={copy.sourcePlaceholder}
              className="w-full rounded-2xl border border-[#E5E7EB] px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-[#111827]"
            />
          </label>
        </div>

        <label className="mt-4 block space-y-2 text-sm font-medium text-[#111827]">
          <span>{copy.addContent}</span>
          <textarea
            value={draft.content}
            onChange={(event) => setDraft((current) => ({ ...current, content: event.target.value }))}
            placeholder={copy.contentPlaceholder}
            rows={5}
            className="w-full rounded-[24px] border border-[#E5E7EB] px-4 py-4 text-sm leading-7 text-[#111827] outline-none transition focus:border-[#111827]"
          />
        </label>

        <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <label className="flex items-center gap-3 text-sm font-medium text-[#111827]">
            <span>{copy.addStrength}</span>
            <select
              value={draft.signalStrength}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  signalStrength: event.target.value as EvidenceSignalStrength,
                }))
              }
              className="rounded-full border border-[#E5E7EB] bg-white px-4 py-2 text-sm text-[#111827] outline-none"
            >
              <option value="weak">{copy.weak}</option>
              <option value="medium">{copy.medium}</option>
              <option value="strong">{copy.strong}</option>
            </select>
          </label>

          <div className="flex flex-wrap items-center gap-3">
            {editingId ? (
              <button
                type="button"
                onClick={resetDraft}
                className="rounded-full border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-semibold text-[#374151]"
              >
                {copy.cancel}
              </button>
            ) : null}
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-full bg-[#111827] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? copy.saving : editingId ? copy.update : copy.save}
            </button>
          </div>
        </div>

        {successMessage ? (
          <div className="mt-4 rounded-2xl border border-[#ABEFC6] bg-[#ECFDF3] px-4 py-3 text-sm text-[#027A48]">
            {successMessage}
          </div>
        ) : null}

        {error ? (
          <div className="mt-4 rounded-2xl border border-[#FECDCA] bg-[#FEF3F2] px-4 py-3 text-sm text-[#B42318]">
            {error}
          </div>
        ) : null}
      </div>

      {!safeEntries.length ? (
        <div className="rounded-[28px] border border-dashed border-[#D1D5DB] bg-white p-8 text-center shadow-sm">
          <h4 className="text-lg font-bold text-[#111827]">{copy.emptyTitle}</h4>
          <p className="mt-2 text-sm leading-7 text-[#6B7280]">{copy.emptyBody}</p>
        </div>
      ) : null}

      {safeEntries.length ? (
        <div className="space-y-4">
          {safeEntries.map((entry) => (
            <div
              key={entry.id}
              className="rounded-[24px] border border-[#E5E7EB] bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h4 className="text-base font-bold text-[#111827]">
                      <MixedText as="span" text={entry.title} />
                    </h4>
                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${strengthBadgeTone(entry.signalStrength)}`}>
                      {strengthLabel(entry.signalStrength)}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[#374151]">
                    <MixedText as="span" text={entry.content} />
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-medium text-[#6B7280]">
                    <span>
                      {copy.addedAt}: {formatEntryDate(entry.createdAt, uiLang)}
                    </span>
                    {entry.source ? <span>• {entry.source}</span> : null}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => startEditing(entry)}
                    className="rounded-full border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-semibold text-[#374151]"
                  >
                    {copy.edit}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(entry.id)}
                    disabled={deletingId === entry.id}
                    className="rounded-full border border-[#F7D7D7] bg-white px-4 py-2 text-sm font-semibold text-[#B42318] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deletingId === entry.id ? copy.deleting : copy.delete}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}