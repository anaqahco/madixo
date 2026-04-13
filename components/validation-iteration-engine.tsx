'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import MixedText from '@/components/mixed-text';
import { nextMoveLabel } from '@/lib/madixo-iteration-engine';
import type {
  IterationEngineOutput,
  UiLanguage,
  ValidationDecisionState,
  ValidationPlan,
  ValidationWorkspaceState,
} from '@/lib/madixo-validation';

type AppliedIterationSnapshot = {
  plan: ValidationPlan;
  workspace: ValidationWorkspaceState;
};

type Props = {
  reportId: string;
  uiLang: UiLanguage;
  currentDecision: ValidationDecisionState;
  hasEvidenceSummary?: boolean;
  refreshToken?: number;
  onApplyComplete?: (snapshot: AppliedIterationSnapshot) => void;
  onIterationStateChange?: (state: {
    hasNextMove: boolean;
  }) => void;
};

type LoadState = 'idle' | 'loading' | 'ready' | 'error';
type ApplyState = 'idle' | 'applying' | 'applied' | 'error';

const UI_COPY = {
  en: {
    title: 'Best Step Now',
    description:
      'Turn the current evidence and your current decision into the clearest practical step you should run now.',
    generate: 'Generate the best step now',
    regenerate: 'Regenerate the best step now',
    generating: 'Designing the best step now...',
    generationProgress: 'Progress',
    generationElapsed: 'Elapsed',
    generationStage1: 'Reading the latest evidence and your current decision',
    generationStage2: 'Choosing the strongest practical adjustment now',
    generationStage3: 'Preparing one clear step you can run now',
    savedBadge: 'Saved step',
    note:
      'This step is generated from the report, saved market notes, the decision view, and your current decision. It stays saved when you return later.',
    loadingSaved: 'Loading the saved step...',
    empty: 'There is no active step now.',
    generateFirstHint:
      'Update the decision view first, then generate the best step now.',
    nextMove: 'Step type now',
    whyNow: 'Why this step now',
    whatToChange: 'What to adjust now',
    nextExperiment: 'What to run now',
    nextExperimentSteps: 'Execution flow',
    updatedOffer: 'Offer to test now',
    updatedOutreach: 'Message to use now',
    successCriteria: 'What counts as success in this step',
    loadFailed: 'Failed to generate the next step.',
    noItems: 'No clear items yet.',
    experimentDuration: 'Suggested window',
    shortWindow: '3–5 days',
    apply: 'Apply to the current plan',
    applying: 'Updating the current plan...',
    applied:
      'The current plan was updated. Now collect new market notes, update the decision view, then generate the best step now.',
    applyFailed: 'Failed to apply the next step.',
  },
  ar: {
    title: 'أفضل خطوة الآن',
    description:
      'حوّل الأدلة الحالية وقرارك الحالي إلى أوضح خطوة عملية ينبغي عليك تنفيذها الآن.',
    generate: 'أنشئ أفضل خطوة الآن',
    regenerate: 'أعد إنشاء أفضل خطوة الآن',
    generating: 'جار تصميم أفضل خطوة الآن...',
    generationProgress: 'التقدم',
    generationElapsed: 'الوقت المنقضي',
    generationStage1: 'قراءة الأدلة الحالية وقرارك الحالي',
    generationStage2: 'اختيار أقوى تعديل عملي الآن',
    generationStage3: 'تجهيز خطوة واحدة واضحة يمكنك تنفيذها الآن',
    savedBadge: 'خطوة محفوظة',
    note:
      'تُنشأ هذه الخطوة من التقرير وملاحظات السوق المحفوظة ورؤية القرار وقرارك الحالي، وتبقى محفوظة عند عودتك لاحقًا.',
    loadingSaved: 'جار تحميل الخطوة المحفوظة...',
    empty: 'لا توجد خطوة نشطة الآن.',
    generateFirstHint:
      'حدّث رؤية القرار أولًا، ثم أنشئ أفضل خطوة الآن.',
    nextMove: 'نوع الحركة الآن',
    whyNow: 'لماذا هذه الخطوة الآن',
    whatToChange: 'ما الذي نعدّله الآن',
    nextExperiment: 'ماذا ننفّذ الآن',
    nextExperimentSteps: 'التنفيذ المقترح',
    updatedOffer: 'العرض الذي نختبره الآن',
    updatedOutreach: 'الرسالة التي نستخدمها الآن',
    successCriteria: 'ما الذي نعدّه نجاحًا في هذه الخطوة',
    loadFailed: 'فشل إنشاء الخطوة التالية.',
    noItems: 'لا توجد عناصر واضحة بعد.',
    experimentDuration: 'الإطار الزمني المقترح',
    shortWindow: '3–5 أيام',
    apply: 'طبّق على الخطة الحالية',
    applying: 'جار تحديث الخطة الحالية...',
    applied:
      'تم تحديث الخطة الحالية. الآن اجمع ملاحظات سوق جديدة، ثم حدّث رؤية القرار، ثم أنشئ أفضل خطوة الآن.',
    applyFailed: 'فشل تطبيق الخطوة التالية.',
  },
} as const;

function moveTone(nextMove: IterationEngineOutput['nextMove']) {
  if (nextMove === 'continue_as_is') {
    return 'border-[#ABEFC6] bg-[#ECFDF3] text-[#027A48]';
  }

  if (nextMove === 'stop') {
    return 'border-[#F7D7D7] bg-[#FEF3F2] text-[#B42318]';
  }

  if (nextMove === 'pivot_audience' || nextMove === 'pivot_offer') {
    return 'border-[#FEDF89] bg-[#FFFAEB] text-[#B54708]';
  }

  return 'border-[#D9E6FF] bg-[#EFF6FF] text-[#1D4ED8]';
}

function normalizeWhitespace(text: string) {
  return text.replace(/\s+/g, ' ').trim();
}

function summarizeText(text: string, maxLength = 320) {
  const clean = normalizeWhitespace(text);
  if (!clean) return '';

  if (clean.length <= maxLength) {
    return clean;
  }

  return clean.slice(0, maxLength).trim();
}

function formatGenerationElapsed(seconds: number, uiLang: UiLanguage) {
  return uiLang === 'ar' ? `${seconds} ث` : `${seconds}s`;
}

function getGenerationProgress(seconds: number) {
  const targetSeconds = 90;
  const startPercent = 12;
  const maxDuringLoading = 94;
  const ratio = Math.min(seconds / targetSeconds, 1);
  return Math.round(startPercent + ratio * (maxDuringLoading - startPercent));
}

function getGenerationStage(
  seconds: number,
  copy: (typeof UI_COPY)['en'] | (typeof UI_COPY)['ar']
) {
  if (seconds < 6) return copy.generationStage1;
  if (seconds < 14) return copy.generationStage2;
  return copy.generationStage3;
}

function splitExperimentIntoSteps(text: string) {
  const clean = normalizeWhitespace(text);
  if (!clean) return [];

  const parts = clean
    .split(/(?<=[.!؟])\s+|\s*[-–•]\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  const unique = Array.from(new Set(parts));
  const steps = unique.slice(0, 4);

  if (steps.length >= 2) {
    return steps;
  }

  const fallback = clean
    .split(/\s+(?:ثم|وبعدها|بعد ذلك|and then|then)\s+/i)
    .map((part) => part.trim())
    .filter(Boolean);

  return Array.from(new Set(fallback)).slice(0, 4);
}

function CompactList({
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
        <div className="mt-4 space-y-3">
          {items.map((item, index) => (
            <div
              key={`${index}-${item.slice(0, 24)}`}
              className="rounded-2xl bg-white px-4 py-3 text-sm leading-7 text-[#374151]"
            >
              <MixedText as="span" text={item} />
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm leading-7 text-[#6B7280]">{emptyLabel}</p>
      )}
    </div>
  );
}

function SuccessCriteriaGrid({
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
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {items.map((item, index) => (
            <div
              key={`${index}-${item.slice(0, 24)}`}
              className="rounded-2xl bg-white px-4 py-3 text-sm leading-7 text-[#374151]"
            >
              <MixedText as="span" text={item} />
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm leading-7 text-[#6B7280]">{emptyLabel}</p>
      )}
    </div>
  );
}

export default function ValidationIterationEngine({
  reportId,
  uiLang,
  currentDecision,
  hasEvidenceSummary = false,
  refreshToken = 0,
  onApplyComplete,
  onIterationStateChange,
}: Props) {
  const copy = UI_COPY[uiLang];
  const [state, setState] = useState<LoadState>('idle');
  const [error, setError] = useState('');
  const [iterationEngine, setIterationEngine] =
    useState<IterationEngineOutput | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [applyState, setApplyState] = useState<ApplyState>('idle');
  const [applyError, setApplyError] = useState('');
  const [loadingSeconds, setLoadingSeconds] = useState(0);
  const sectionRef = useRef<HTMLElement | null>(null);

  const hasNextMove = Boolean(iterationEngine);

  useEffect(() => {
    onIterationStateChange?.({
      hasNextMove,
    });
  }, [hasNextMove, onIterationStateChange]);

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
      setLoadingSeconds(0);
      return;
    }

    const timer = window.setInterval(() => {
      setLoadingSeconds((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [state]);

  useEffect(() => {
    let cancelled = false;

    async function loadSavedNextStep() {
      try {
        setIsBootstrapping(true);
        setState('idle');
        setError('');
        setIterationEngine(null);

        const params = new URLSearchParams({ reportId, uiLang });
        const response = await fetch(`/api/iteration-engine?${params.toString()}`, {
          method: 'GET',
          cache: 'no-store',
        });

        const payload = (await response.json()) as {
          ok?: boolean;
          error?: string;
          iterationEngine?: IterationEngineOutput | null;
        };

        if (cancelled) return;

        if (!response.ok || !payload.ok) {
          throw new Error(payload.error || copy.loadFailed);
        }

        setIterationEngine(payload.iterationEngine || null);
        setState(payload.iterationEngine ? 'ready' : 'idle');
      } catch (err) {
        if (cancelled) return;
        setState('error');
        setError(err instanceof Error ? err.message : copy.loadFailed);
      } finally {
        if (!cancelled) {
          setIsBootstrapping(false);
        }
      }
    }

    loadSavedNextStep();

    return () => {
      cancelled = true;
    };
  }, [copy.loadFailed, refreshToken, reportId, uiLang]);

  const handleGenerate = async () => {
    try {
      if (!hasEvidenceSummary && !hasNextMove) {
        setState('error');
        setError(copy.generateFirstHint);
        return;
      }

      setState('loading');
      setError('');
      setApplyState('idle');
      setApplyError('');

      const response = await fetch('/api/iteration-engine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, uiLang, currentDecision }),
      });

      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
        iterationEngine?: IterationEngineOutput;
      };

      if (!response.ok || !payload.ok || !payload.iterationEngine) {
        throw new Error(payload.error || copy.loadFailed);
      }

      setIterationEngine(payload.iterationEngine);
      setState('ready');
    } catch (err) {
      setState('error');
      setError(err instanceof Error ? err.message : copy.loadFailed);
    }
  };

  const handleApply = async () => {
    try {
      setApplyState('applying');
      setApplyError('');

      const response = await fetch('/api/apply-iteration-engine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, uiLang }),
      });

      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
        plan?: ValidationPlan;
        workspace?: ValidationWorkspaceState;
      };

      if (!response.ok || !payload.ok || !payload.plan || !payload.workspace) {
        throw new Error(payload.error || copy.applyFailed);
      }

      setIterationEngine(null);
      setState('idle');
      setApplyState('applied');

      onApplyComplete?.({
        plan: payload.plan,
        workspace: payload.workspace,
      });

      window.setTimeout(() => {
        setApplyState('idle');
      }, 1800);
    } catch (err) {
      setApplyState('error');
      setApplyError(err instanceof Error ? err.message : copy.applyFailed);
    }
  };

  const actionLabel = useMemo(() => {
    if (state === 'loading') return copy.generating;
    return hasNextMove ? copy.regenerate : copy.generate;
  }, [copy.generate, copy.generating, copy.regenerate, hasNextMove, state]);

  const applyLabel = useMemo(() => {
    if (applyState === 'applying') return copy.applying;
    if (applyState === 'applied') return copy.applied;
    return copy.apply;
  }, [applyState, copy.applied, copy.apply, copy.applying]);

  const loadingProgress = useMemo(
    () => getGenerationProgress(loadingSeconds),
    [loadingSeconds]
  );

  const loadingStage = useMemo(
    () => getGenerationStage(loadingSeconds, copy),
    [copy, loadingSeconds]
  );

  const whyNowSummary = useMemo(
    () => summarizeText(iterationEngine?.whyNow || '', 320),
    [iterationEngine?.whyNow]
  );

  const experimentSteps = useMemo(
    () => splitExperimentIntoSteps(iterationEngine?.nextExperiment || ''),
    [iterationEngine?.nextExperiment]
  );

  return (
    <section
      ref={sectionRef}
      className="rounded-[32px] border border-[#E5E7EB] bg-white p-8 shadow-sm scroll-mt-24"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-[#111827] md:text-3xl">
              {copy.title}
            </h2>

            {hasNextMove ? (
              <span className="rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-1 text-xs font-semibold text-[#4B5563]">
                {copy.savedBadge}
              </span>
            ) : null}
          </div>

          <p className="mt-3 max-w-3xl text-base leading-8 text-[#4B5563]">
            {copy.description}
          </p>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#6B7280]">
            {copy.note}
          </p>
        </div>

        <div className="flex flex-col items-stretch gap-3 sm:items-end">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={
              state === 'loading' ||
              isBootstrapping ||
              (!hasEvidenceSummary && !hasNextMove)
            }
            className="rounded-full bg-[#111827] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {actionLabel}
          </button>

          {hasNextMove ? (
            <button
              type="button"
              onClick={handleApply}
              disabled={applyState === 'applying' || applyState === 'applied'}
              className="rounded-full border border-[#111827] bg-white px-5 py-3 text-sm font-semibold text-[#111827] transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {applyLabel}
            </button>
          ) : null}
        </div>
      </div>

      {isBootstrapping ? (
        <div className="mt-5 rounded-[24px] border border-dashed border-[#D1D5DB] bg-[#F9FAFB] p-5">
          <p className="text-sm font-semibold text-[#111827]">
            {copy.loadingSaved}
          </p>
        </div>
      ) : null}

      {state === 'loading' ? (
        <div className="mt-5 rounded-[24px] border border-dashed border-[#D1D5DB] bg-[#F9FAFB] p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[#111827]">
                {copy.generating}
              </p>
              <p className="mt-2 text-sm leading-7 text-[#6B7280]">
                {loadingStage}
              </p>
            </div>

            <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-semibold text-[#6B7280]">
                {copy.generationElapsed}
              </p>
              <p className="mt-1 text-lg font-bold text-[#111827]">
                {formatGenerationElapsed(loadingSeconds, uiLang)}
              </p>
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-[#4B5563]">{loadingStage}</p>
              <p className="text-sm font-semibold text-[#111827]">
                {copy.generationProgress} {loadingProgress}%
              </p>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-[#E5E7EB]">
              <div
                className="h-full rounded-full bg-[#111827] transition-all duration-500"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
          </div>
        </div>
      ) : null}

      {state === 'error' && error ? (
        <div className="mt-5 rounded-[24px] border border-red-200 bg-red-50 p-5">
          <p className="text-sm font-semibold text-red-700">{copy.loadFailed}</p>
          <p className="mt-2 text-sm leading-7 text-red-600">{error}</p>
        </div>
      ) : null}

      {applyState === 'error' && applyError ? (
        <div className="mt-5 rounded-[24px] border border-red-200 bg-red-50 p-5">
          <p className="text-sm font-semibold text-red-700">{copy.applyFailed}</p>
          <p className="mt-2 text-sm leading-7 text-red-600">{applyError}</p>
        </div>
      ) : null}

      {!isBootstrapping && !hasNextMove && state === 'idle' ? (
        <div className="mt-5 rounded-[24px] border border-dashed border-[#D1D5DB] bg-[#F9FAFB] p-5">
          <p className="text-sm font-semibold text-[#111827]">{copy.empty}</p>
          <p className="mt-2 text-sm leading-7 text-[#6B7280]">
            {copy.generateFirstHint}
          </p>
        </div>
      ) : null}

      {hasNextMove && iterationEngine ? (
        <div className="mt-6 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`inline-flex rounded-full border px-4 py-2 text-sm font-semibold ${moveTone(
                iterationEngine.nextMove
              )}`}
            >
              {copy.nextMove}: {nextMoveLabel(iterationEngine.nextMove, uiLang)}
            </span>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[24px] bg-[#F9FAFB] p-5">
              <h3 className="text-sm font-semibold text-[#111827]">
                {copy.whyNow}
              </h3>
              <div className="mt-4 text-sm leading-7 text-[#374151]">
                <MixedText as="p" text={whyNowSummary || iterationEngine.whyNow} />
              </div>
            </div>

            <CompactList
              title={copy.whatToChange}
              items={iterationEngine.whatToChange}
              emptyLabel={copy.noItems}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <div className="rounded-[24px] bg-[#F9FAFB] p-5">
              <h3 className="text-sm font-semibold text-[#111827]">
                {copy.nextExperiment}
              </h3>
              <div className="mt-4 text-sm leading-7 text-[#374151]">
                <MixedText as="p" text={iterationEngine.nextExperiment} />
              </div>

              <div className="mt-5 rounded-2xl bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-sm font-semibold text-[#111827]">
                    {copy.experimentDuration}
                  </h4>
                  <span className="rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-1 text-xs font-semibold text-[#4B5563]">
                    {copy.shortWindow}
                  </span>
                </div>

                {experimentSteps.length ? (
                  <div className="mt-4 space-y-3">
                    <h5 className="text-sm font-semibold text-[#111827]">
                      {copy.nextExperimentSteps}
                    </h5>
                    {experimentSteps.map((step, index) => (
                      <div
                        key={`${index}-${step.slice(0, 24)}`}
                        className="rounded-2xl bg-[#F9FAFB] px-4 py-3 text-sm leading-7 text-[#374151]"
                      >
                        <MixedText as="span" text={step} />
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[24px] bg-[#F9FAFB] p-5">
                <h3 className="text-sm font-semibold text-[#111827]">
                  {copy.updatedOffer}
                </h3>
                <div className="mt-4 text-sm leading-7 text-[#374151]">
                  <MixedText as="p" text={iterationEngine.updatedOffer} />
                </div>
              </div>

              <div className="rounded-[24px] bg-[#F9FAFB] p-5">
                <h3 className="text-sm font-semibold text-[#111827]">
                  {copy.updatedOutreach}
                </h3>
                <div className="mt-4 text-sm leading-7 text-[#374151]">
                  <MixedText as="p" text={iterationEngine.updatedOutreach} />
                </div>
              </div>
            </div>
          </div>

          <SuccessCriteriaGrid
            title={copy.successCriteria}
            items={iterationEngine.successCriteria}
            emptyLabel={copy.noItems}
          />
        </div>
      ) : null}
    </section>
  );
}
