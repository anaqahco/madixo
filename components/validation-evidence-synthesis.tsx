'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import MixedText from '@/components/mixed-text';
import {
  confidenceLabel,
  decisionLabel,
} from '@/lib/madixo-evidence-synthesis';
import type {
  EvidenceSynthesis,
  UiLanguage,
  ValidationDecisionState,
} from '@/lib/madixo-validation';
import { normalizeEvidenceSynthesis } from '@/lib/madixo-validation';

type Props = {
  reportId: string;
  uiLang: UiLanguage;
  currentDecision: ValidationDecisionState;
  entriesCount?: number;
  synthesis: EvidenceSynthesis | null;
  onSynthesisChange?: (synthesis: EvidenceSynthesis | null) => void;
};

type LoadState = 'idle' | 'loading' | 'ready' | 'error';
type AlignmentState = 'aligned' | 'review' | 'conflict' | 'undecided';

const UI_COPY = {
  en: {
    title: 'Decision View',
    description:
      'Turn saved market notes into a clearer reading of what is becoming true, what is still uncertain, and what the best move is now.',
    generate: 'Generate decision view',
    regenerate: 'Rebuild decision view',
    generating: 'Reviewing saved market notes...',
    note:
      'This view is built only from the saved market notes so far. Add more notes when you learn something new, then rebuild it.',
    basedOnZero: 'Built from 0 saved notes',
    basedOnOne: 'Built from 1 saved note',
    basedOnMany: (count: number) => `Built from ${count} saved notes`,
    addMoreHint:
      'The decision view can change when you add more market notes and rebuild it.',
    clearNow: 'What is becoming clear',
    unknownNow: 'What is still uncertain',
    strongestSignals: 'Strongest signals',
    evidenceDirection: 'What the evidence suggests overall',
    confidence: 'Confidence level',
    reasoning: 'Why the evidence points this way',
    noSynthesis: 'No decision view has been generated yet.',
    generateFirstHint:
      'Start with one real market note, then add more notes as the picture becomes clearer before rebuilding the decision view.',
    loadFailed: 'Failed to generate the decision view.',
    noItems: 'No strong pattern is visible yet.',
    progressDescription:
      'We are reviewing the saved market notes to build a grounded decision view.',
    savedBadge: 'Saved decision view',
    alignmentTitle: 'Decision alignment',
    alignmentDescription:
      'Separate your current decision from the general direction suggested by the evidence.',
    currentDecision: 'Your current decision now',
    evidenceDecision: 'General evidence direction',
    alignmentStatus: 'Relationship',
    aligned: 'Aligned',
    review: 'Needs review',
    conflict: 'Not aligned',
    undecidedStatus: 'Decision not set yet',
    nextStepTitle: 'Best step now',
    goal: 'What we want to prove now',
    whyNow: 'Why this step now',
    actions: 'What to run now',
    successSignal: 'How we know this step worked',
    executionWindow: 'Suggested window',
  },
  ar: {
    title: 'رؤية القرار',
    description:
      'حوّل ملاحظات السوق المحفوظة إلى فهم أوضح لما أصبح واضحًا، وما ما زال غير مؤكد، وما أفضل حركة الآن.',
    generate: 'أنشئ رؤية القرار',
    regenerate: 'حدّث رؤية القرار',
    generating: 'جار مراجعة ملاحظات السوق...',
    note:
      'تُبنى هذه الرؤية فقط من ملاحظات السوق المحفوظة حتى الآن. أضف ملاحظات جديدة كلما تعلمت شيئًا جديدًا، ثم أعد بناءها.',
    basedOnZero: 'مبنية على 0 ملاحظات محفوظة',
    basedOnOne: 'مبنية على ملاحظة واحدة محفوظة',
    basedOnMany: (count: number) => `مبنية على ${count} ملاحظات محفوظة`,
    addMoreHint:
      'قد تتغير رؤية القرار عند إضافة ملاحظات سوق جديدة ثم إعادة بنائها.',
    clearNow: 'ما أصبح واضحًا',
    unknownNow: 'ما ما زال غير مؤكد',
    strongestSignals: 'أوضح الإشارات',
    evidenceDirection: 'التوصية العامة من الأدلة',
    confidence: 'درجة الثقة',
    reasoning: 'لماذا توحي الأدلة بهذا الاتجاه',
    noSynthesis: 'لم يتم إنشاء رؤية القرار بعد.',
    generateFirstHint:
      'ابدأ بملاحظة سوق حقيقية واحدة، ثم أضف ملاحظات أخرى كلما اتضحت الصورة قبل إعادة بناء رؤية القرار.',
    loadFailed: 'فشل إنشاء رؤية القرار.',
    noItems: 'لا يوجد نمط قوي واضح بعد.',
    progressDescription:
      'نراجع ملاحظات السوق المحفوظة لبناء رؤية قرار محافظة ومبنية على الأدلة.',
    savedBadge: 'رؤية محفوظة',
    alignmentTitle: 'توافق القرار',
    alignmentDescription:
      'افصل بين قرارك الحالي وبين الاتجاه العام الذي توحي به الأدلة الآن.',
    currentDecision: 'قرارك الحالي الآن',
    evidenceDecision: 'الاتجاه العام من الأدلة',
    alignmentStatus: 'العلاقة بينهما',
    aligned: 'متوافق',
    review: 'يحتاج مراجعة',
    conflict: 'غير متوافق',
    undecidedStatus: 'لم تحدد قرارك بعد',
    nextStepTitle: 'أفضل خطوة الآن',
    goal: 'ماذا نريد أن نثبت الآن',
    whyNow: 'لماذا هذه الخطوة الآن',
    actions: 'ماذا تنفّذ الآن',
    successSignal: 'كيف نعرف أن الخطوة نجحت',
    executionWindow: 'الإطار الزمني المقترح',
  },
} as const;

function safeItems(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter(
        (item): item is string =>
          typeof item === 'string' && item.trim().length > 0
      )
    : [];
}

function directionTone(direction: EvidenceSynthesis['recommendedDirection']) {
  if (direction === 'continue') {
    return 'border-[#ABEFC6] bg-[#ECFDF3] text-[#027A48]';
  }

  if (direction === 'stop') {
    return 'border-[#F7D7D7] bg-[#FEF3F2] text-[#B42318]';
  }

  return 'border-[#FEDF89] bg-[#FFFAEB] text-[#B54708]';
}

function confidenceTone(confidence: EvidenceSynthesis['confidence']) {
  if (confidence === 'high') {
    return 'border-[#C7D7FE] bg-[#EEF4FF] text-[#3538CD]';
  }

  if (confidence === 'low') {
    return 'border-[#E5E7EB] bg-[#F9FAFB] text-[#4B5563]';
  }

  return 'border-[#D9E6FF] bg-[#EFF6FF] text-[#1D4ED8]';
}

function alignmentTone(state: AlignmentState) {
  if (state === 'aligned') {
    return 'border-[#ABEFC6] bg-[#ECFDF3] text-[#027A48]';
  }

  if (state === 'conflict') {
    return 'border-[#F7D7D7] bg-[#FEF3F2] text-[#B42318]';
  }

  if (state === 'undecided') {
    return 'border-[#E5E7EB] bg-[#F9FAFB] text-[#4B5563]';
  }

  return 'border-[#FEDF89] bg-[#FFFAEB] text-[#B54708]';
}

function getAlignmentState(
  currentDecision: ValidationDecisionState,
  synthesis: EvidenceSynthesis
): AlignmentState {
  if (currentDecision === 'undecided') return 'undecided';
  if (currentDecision === synthesis.recommendedDirection) return 'aligned';
  if (synthesis.confidence === 'high') return 'conflict';
  return 'review';
}

function getAlignmentLabel(state: AlignmentState, uiLang: UiLanguage) {
  const copy = UI_COPY[uiLang];

  if (state === 'aligned') return copy.aligned;
  if (state === 'conflict') return copy.conflict;
  if (state === 'undecided') return copy.undecidedStatus;
  return copy.review;
}

function normalizeSynthesisForUi(
  value: unknown,
  uiLang: UiLanguage
): EvidenceSynthesis | null {
  const normalized = normalizeEvidenceSynthesis(value, uiLang);
  if (!normalized) return null;

  return {
    ...normalized,
    validatedLearnings: safeItems(normalized.validatedLearnings),
    openQuestions: safeItems(normalized.openQuestions),
    strongestSignals: safeItems(normalized.strongestSignals),
    topObjections: safeItems(normalized.topObjections),
    topDesires: safeItems(normalized.topDesires),
    nextBestStep: {
      ...normalized.nextBestStep,
      actions: safeItems(normalized.nextBestStep?.actions),
    },
  };
}

function SectionBlock({
  title,
  items,
  emptyLabel,
}: {
  title: string;
  items: string[];
  emptyLabel: string;
}) {
  return (
    <div className="rounded-[24px] bg-[#F9FAFB] p-5">
      <h3 className="text-sm font-semibold text-[#111827]">{title}</h3>
      {items.length ? (
        <ul className="mt-4 space-y-3">
          {items.map((item, index) => (
            <li
              key={`${index}-${item.slice(0, 24)}`}
              className="rounded-2xl bg-white px-4 py-3 text-sm leading-7 text-[#374151]"
            >
              <MixedText as="span" text={item} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm leading-7 text-[#6B7280]">{emptyLabel}</p>
      )}
    </div>
  );
}

function getBasedOnLabel(count: number, uiLang: UiLanguage) {
  const copy = UI_COPY[uiLang];

  if (count <= 0) return copy.basedOnZero;
  if (count === 1) return copy.basedOnOne;
  return copy.basedOnMany(count);
}

export default function ValidationEvidenceSynthesis({
  reportId,
  uiLang,
  currentDecision,
  entriesCount = 0,
  synthesis,
  onSynthesisChange,
}: Props) {
  const copy = UI_COPY[uiLang];
  const [state, setState] = useState<LoadState>(synthesis ? 'ready' : 'idle');
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const sectionRef = useRef<HTMLElement | null>(null);

  const hasSummary = Boolean(synthesis);

  useEffect(() => {
    setState(synthesis ? 'ready' : 'idle');
    setError('');
    setProgress(0);
  }, [reportId, synthesis, uiLang]);

  useEffect(() => {
    if (state !== 'loading') return;

    const timer = window.setTimeout(() => {
      sectionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 120);

    return () => window.clearTimeout(timer);
  }, [state]);

  useEffect(() => {
    if (state !== 'loading') {
      if (state === 'idle') {
        setProgress(0);
      }
      return;
    }

    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) =>
        prev >= 99 ? 99 : Math.min(99, Math.max(1, prev + 1))
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [state]);

  const alignment = useMemo(() => {
    if (!synthesis) return null;
    return getAlignmentState(currentDecision, synthesis);
  }, [currentDecision, synthesis]);

  const handleGenerate = async () => {
    try {
      setState('loading');
      setError('');
      setProgress(0);

      const response = await fetch('/api/evidence-synthesis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, uiLang, currentDecision }),
      });

      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
        synthesis?: unknown;
      };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || copy.loadFailed);
      }

      const normalized = normalizeSynthesisForUi(payload.synthesis, uiLang);

      if (!normalized) {
        throw new Error(copy.loadFailed);
      }

      setProgress(100);
      setState('ready');
      onSynthesisChange?.(normalized);
    } catch (err) {
      setProgress(0);
      setState('error');
      setError(err instanceof Error ? err.message : copy.loadFailed);
    }
  };

  return (
    <section
      ref={sectionRef}
      className="rounded-[28px] border border-[#E5E7EB] bg-white p-6 shadow-sm scroll-mt-24"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-bold text-[#111827]">{copy.title}</h2>
            {hasSummary ? (
              <span className="inline-flex items-center rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-1 text-xs font-semibold text-[#4B5563]">
                {copy.savedBadge}
              </span>
            ) : null}
            <span className="inline-flex items-center rounded-full border border-[#D9E6FF] bg-[#EFF6FF] px-3 py-1 text-xs font-semibold text-[#1D4ED8]">
              {getBasedOnLabel(entriesCount, uiLang)}
            </span>
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-[#4B5563]">
            {copy.description}
          </p>
          <p className="mt-2 text-xs leading-6 text-[#6B7280]">{copy.note}</p>
          <p className="mt-2 text-xs font-semibold leading-6 text-[#1D4ED8]">
            {copy.addMoreHint}
          </p>
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={state === 'loading' || entriesCount <= 0}
          className="rounded-full bg-[#111827] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {state === 'loading'
            ? `${copy.generating} ${progress}%`
            : hasSummary
              ? copy.regenerate
              : copy.generate}
        </button>
      </div>

      {state === 'loading' ? (
        <div className="mt-5 rounded-[24px] border border-dashed border-[#D1D5DB] bg-[#F9FAFB] p-6">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="text-5xl font-bold tracking-tight text-[#111827]">
              {progress}%
            </div>
            <div className="mt-4 h-2 w-full max-w-xl overflow-hidden rounded-full bg-[#E5E7EB]">
              <div
                className="h-full rounded-full bg-[#111827] transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-4 text-sm font-semibold text-[#111827]">
              {copy.generating}
            </p>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-[#6B7280]">
              {copy.progressDescription}
            </p>
          </div>
        </div>
      ) : !hasSummary && !error ? (
        <div className="mt-5 rounded-[24px] border border-dashed border-[#D1D5DB] bg-[#F9FAFB] p-5">
          <p className="text-sm font-semibold text-[#111827]">
            {copy.noSynthesis}
          </p>
          <p className="mt-2 text-sm leading-7 text-[#6B7280]">
            {copy.generateFirstHint}
          </p>
        </div>
      ) : null}

      {error ? (
        <div className="mt-5 rounded-[24px] border border-red-200 bg-red-50 p-5">
          <p className="text-sm font-semibold text-red-700">{copy.loadFailed}</p>
          <p className="mt-2 text-sm leading-7 text-red-600">{error}</p>
        </div>
      ) : null}

      {synthesis ? (
        <div className="mt-6 grid gap-6">
          <div className="grid gap-6 md:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[24px] bg-[#F9FAFB] p-5">
              <h3 className="text-sm font-semibold text-[#111827]">
                {copy.alignmentTitle}
              </h3>
              <p className="mt-2 text-sm leading-7 text-[#6B7280]">
                {copy.alignmentDescription}
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                <span className="inline-flex items-center rounded-full border border-[#E5E7EB] bg-white px-3 py-1 text-sm font-semibold text-[#4B5563]">
                  {copy.currentDecision}: {decisionLabel(currentDecision, uiLang)}
                </span>

                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${directionTone(
                    synthesis.recommendedDirection
                  )}`}
                >
                  {copy.evidenceDecision}:{' '}
                  {decisionLabel(synthesis.recommendedDirection, uiLang)}
                </span>

                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${confidenceTone(
                    synthesis.confidence
                  )}`}
                >
                  {copy.confidence}: {confidenceLabel(synthesis.confidence, uiLang)}
                </span>

                {alignment ? (
                  <span
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${alignmentTone(
                      alignment
                    )}`}
                  >
                    {copy.alignmentStatus}: {getAlignmentLabel(alignment, uiLang)}
                  </span>
                ) : null}
              </div>

              <div className="mt-5 rounded-2xl bg-white p-4">
                <h4 className="text-sm font-semibold text-[#111827]">
                  {copy.nextStepTitle}
                </h4>

                <div className="mt-3 space-y-3 text-sm leading-7 text-[#374151]">
                  <div className="rounded-2xl bg-[#F9FAFB] px-4 py-3">
                    <strong>{copy.goal}:</strong>{' '}
                    <MixedText as="span" text={synthesis.nextBestStep.goal} />
                  </div>

                  <div className="rounded-2xl bg-[#F9FAFB] px-4 py-3">
                    <strong>{copy.whyNow}:</strong>{' '}
                    <MixedText as="span" text={synthesis.nextBestStep.whyNow} />
                  </div>

                  <div className="rounded-2xl bg-[#F9FAFB] px-4 py-3">
                    <strong>{copy.executionWindow}:</strong>{' '}
                    <MixedText
                      as="span"
                      text={synthesis.nextBestStep.executionWindow}
                    />
                  </div>

                  <div className="rounded-2xl bg-[#F9FAFB] px-4 py-3">
                    <strong>{copy.successSignal}:</strong>{' '}
                    <MixedText
                      as="span"
                      text={synthesis.nextBestStep.successSignal}
                    />
                  </div>

                  <div className="rounded-2xl bg-[#F9FAFB] px-4 py-3">
                    <strong>{copy.actions}:</strong>
                    {synthesis.nextBestStep.actions.length ? (
                      <ul className="mt-3 space-y-2">
                        {synthesis.nextBestStep.actions.map((step, index) => (
                          <li
                            key={`${index}-${step.slice(0, 18)}`}
                            className="rounded-xl bg-white px-3 py-2"
                          >
                            <MixedText as="span" text={step} />
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 text-[#6B7280]">{copy.noItems}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-6">
              <SectionBlock
                title={copy.clearNow}
                items={synthesis.validatedLearnings}
                emptyLabel={copy.noItems}
              />
              <SectionBlock
                title={copy.unknownNow}
                items={synthesis.openQuestions}
                emptyLabel={copy.noItems}
              />
              <SectionBlock
                title={copy.strongestSignals}
                items={synthesis.strongestSignals}
                emptyLabel={copy.noItems}
              />
              <div className="rounded-[24px] bg-[#F9FAFB] p-5">
                <h3 className="text-sm font-semibold text-[#111827]">
                  {copy.reasoning}
                </h3>
                <div className="mt-4 text-sm leading-7 text-[#374151]">
                  <MixedText as="p" text={synthesis.reasoning} />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
