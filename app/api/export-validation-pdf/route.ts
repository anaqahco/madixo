import { readFile } from 'node:fs/promises';
import path from 'node:path';
import chromium from '@sparticuz/chromium';
import { chromium as playwright } from 'playwright-core';
import { NextResponse } from 'next/server';
import type { SavedMadixoReport } from '@/lib/madixo-reports';
import {
  type EvidenceSynthesis,
  type IterationEngineOutput,
  type UiLanguage,
  type ValidationPlan,
  type ValidationWorkspaceState,
  getPlanChecklist,
  normalizeEvidenceSynthesis,
  normalizeIterationEngineOutput,
  normalizeValidationPlan,
  normalizeValidationWorkspaceState,
} from '@/lib/madixo-validation';
import { getUserValidationPlan } from '@/lib/madixo-validation-db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type ExportPayload = {
  report?: SavedMadixoReport | null;
  plan?: ValidationPlan | null;
  workspace?: ValidationWorkspaceState | null;
  evidenceSynthesis?: EvidenceSynthesis | null;
  iterationEngine?: IterationEngineOutput | null;
  uiLang?: UiLanguage;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function safeText(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function cleanText(value: unknown, fallback = '') {
  return safeText(value, fallback)
    .replace(/[\u200e\u200f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function limitText(value: unknown, fallback = '', maxLength = 220) {
  const text = cleanText(value, fallback);
  if (text.length <= maxLength) return text;
  return `${text.slice(0, Math.max(40, maxLength)).trimEnd()}...`;
}

function safeStringArray(value: unknown, limit = 6, maxLength = 120): string[] {
  if (!Array.isArray(value)) return [];

  const seen = new Set<string>();
  const items: string[] = [];

  for (const item of value) {
    const clean = limitText(item, '', maxLength);
    if (!clean) continue;
    const key = clean.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    items.push(clean);
    if (items.length >= limit) break;
  }

  return items;
}

function renderParagraph(text: string) {
  return `<p class="paragraph">${escapeHtml(cleanText(text, '-'))}</p>`;
}

function renderBulletList(items: string[], isArabic: boolean) {
  if (!items.length) {
    return `<p class="muted">${isArabic ? 'غير متوفر' : 'Not available'}</p>`;
  }

  return `<ul class="bullet-list ${isArabic ? 'rtl-list' : 'ltr-list'}">${items
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join('')}</ul>`;
}

function renderCard(title: string, bodyHtml: string, className = '') {
  return `
    <section class="card ${className}">
      <h2>${escapeHtml(cleanText(title))}</h2>
      <div class="card-rule"></div>
      <div class="card-body">${bodyHtml}</div>
    </section>
  `;
}

function renderMiniCard(title: string, value: string, className = '') {
  return `
    <section class="mini-card ${className}">
      <div class="mini-title">${escapeHtml(cleanText(title))}</div>
      <div class="mini-rule"></div>
      <div class="mini-value">${escapeHtml(cleanText(value, '-'))}</div>
    </section>
  `;
}

function renderPageShell(params: {
  caption: string;
  logoDataUrl: string;
  bodyHtml: string;
  footerText: string;
}) {
  return `
    <main class="page">
      <div class="page-shell">
        <header class="page-head">
          <div class="topbar">
            <div class="caption">${escapeHtml(params.caption)}</div>
            ${params.logoDataUrl ? `<img src="${params.logoDataUrl}" alt="Madixo" />` : '<div class="logo-spacer"></div>'}
          </div>
          <div class="page-rule"></div>
        </header>

        <section class="page-body">
          ${params.bodyHtml}
        </section>

        <footer class="footer">${escapeHtml(params.footerText)}</footer>
      </div>
    </main>
  `;
}

function decisionLabel(value: ValidationWorkspaceState['decisionState'], uiLang: UiLanguage) {
  const labels =
    uiLang === 'ar'
      ? {
          undecided: 'غير محسوم',
          continue: 'استمر',
          pivot: 'عدّل',
          stop: 'أوقف',
        }
      : {
          undecided: 'Undecided',
          continue: 'Continue',
          pivot: 'Adjust',
          stop: 'Stop',
        };

  return labels[value] ?? labels.undecided;
}

function nextMoveLabel(value: IterationEngineOutput['nextMove'], uiLang: UiLanguage) {
  const labels =
    uiLang === 'ar'
      ? {
          continue_as_is: 'استمر كما هو',
          continue_with_changes: 'استمر مع تعديل',
          pivot_audience: 'عدّل الشريحة',
          pivot_offer: 'عدّل العرض',
          stop: 'أوقف',
        }
      : {
          continue_as_is: 'Continue as is',
          continue_with_changes: 'Continue with changes',
          pivot_audience: 'Adjust audience',
          pivot_offer: 'Adjust offer',
          stop: 'Stop',
        };

  return labels[value] ?? labels.continue_with_changes;
}

function recommendationLabel(value: EvidenceSynthesis['recommendedDirection'] | undefined, uiLang: UiLanguage) {
  if (value === 'pivot') return uiLang === 'ar' ? 'عدّل' : 'Adjust';
  if (value === 'stop') return uiLang === 'ar' ? 'أوقف' : 'Stop';
  return uiLang === 'ar' ? 'استمر' : 'Continue';
}

function confidenceLabel(value: EvidenceSynthesis['confidence'] | undefined, uiLang: UiLanguage) {
  if (value === 'high') return uiLang === 'ar' ? 'مرتفعة' : 'High';
  if (value === 'low') return uiLang === 'ar' ? 'منخفضة' : 'Low';
  return uiLang === 'ar' ? 'متوسطة' : 'Medium';
}

function formatGeneratedAt(uiLang: UiLanguage) {
  const now = new Date();

  if (uiLang === 'ar') {
    const date = new Intl.DateTimeFormat('ar-SA-u-ca-gregory', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    })
      .format(now)
      .replace(/،/g, '');

    const time = new Intl.DateTimeFormat('ar-SA-u-ca-gregory', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
      .format(now)
      .replace(/،/g, '');

    return `${date} ${time}`;
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(now);
}

async function loadFontFaceCss() {
  try {
    const fontPath = path.join(process.cwd(), 'public', 'fonts', 'Cairo-Regular.ttf');
    const file = await readFile(fontPath);
    const base64 = file.toString('base64');

    return `
      @font-face {
        font-family: 'MadixoArabic';
        src: url(data:font/ttf;base64,${base64}) format('truetype');
        font-weight: 400;
        font-style: normal;
      }
    `;
  } catch {
    return '';
  }
}

async function loadLogoDataUrl() {
  try {
    const logoPath = path.join(process.cwd(), 'public', 'brand', 'madixo-logo.png');
    const file = await readFile(logoPath);
    return `data:image/png;base64,${file.toString('base64')}`;
  } catch {
    return '';
  }
}

function encodeRFC5987ValueChars(str: string) {
  return encodeURIComponent(str)
    .replace(/['()]/g, escape)
    .replace(/\*/g, '%2A')
    .replace(/%(7C|60|5E)/g, (match) => match.toLowerCase());
}

function buildUtf8FileName(report: SavedMadixoReport, uiLang: UiLanguage) {
  const fallback = uiLang === 'ar' ? 'ملف-التحقق-مادكسو' : 'madixo-validation-file';
  const candidate = cleanText(report.query) || cleanText(report.result?.query) || fallback;
  return `${candidate}-validation.pdf`;
}

export async function POST(request: Request) {
  let browser: Awaited<ReturnType<typeof playwright.launch>> | null = null;

  try {
    const payload = (await request.json()) as ExportPayload;
    const uiLang: UiLanguage = payload.uiLang === 'en' ? 'en' : 'ar';
    const isArabic = uiLang === 'ar';

    if (!payload.report || typeof payload.report !== 'object') {
      return NextResponse.json(
        {
          error:
            uiLang === 'ar'
              ? 'لا يوجد تقرير صالح لتصدير PDF التحقق.'
              : 'No valid report was provided for validation PDF export.',
        },
        { status: 400 },
      );
    }

    const report = payload.report as SavedMadixoReport;

    let savedPlan: Awaited<ReturnType<typeof getUserValidationPlan>> | null = null;
    try {
      savedPlan = await getUserValidationPlan(report.id, uiLang);
    } catch (error) {
      if (!(error instanceof Error) || error.message !== 'AUTH_REQUIRED') {
        throw error;
      }
    }

    const plan = normalizeValidationPlan(savedPlan?.plan ?? payload.plan, uiLang);
    const workspace = normalizeValidationWorkspaceState(savedPlan?.workspace ?? payload.workspace);
    const evidence = normalizeEvidenceSynthesis(savedPlan?.evidenceSummary ?? payload.evidenceSynthesis, uiLang);
    const iteration = normalizeIterationEngineOutput(savedPlan?.iterationEngine ?? payload.iterationEngine);

    if (!plan) {
      return NextResponse.json(
        {
          error:
            uiLang === 'ar'
              ? 'لا توجد مساحة تحقق جاهزة للتصدير.'
              : 'There is no validation workspace ready to export.',
        },
        { status: 400 },
      );
    }

    const copy = {
      caption: isArabic ? 'مساحة التحقق' : 'Validation workspace',
      coverEyebrow: 'MADIXO VALIDATION REPORT',
      coverTitle: isArabic ? 'ملف التحقق' : 'Validation report',
      coverSubtitle: isArabic
        ? 'ملف منظم يختصر حالة التحقق الحالية ورؤية القرار وأفضل خطوة الآن.'
        : 'A structured export of the current validation state, decision view, and best step now.',
      generatedOn: isArabic ? 'تم الإنشاء في' : 'Generated on',
      summary: isArabic ? 'خلاصة الفرصة' : 'Opportunity summary',
      notes: isArabic ? 'ملاحظاتك الحالية' : 'Current notes',
      market: isArabic ? 'السوق' : 'Market',
      customer: isArabic ? 'العميل' : 'Customer',
      score: isArabic ? 'درجة الفرصة' : 'Opportunity score',
      decisionState: isArabic ? 'قرارك الحالي' : 'Current decision',
      focus: isArabic ? 'تركيز التحقق الحالي' : 'Validation focus',
      segment: isArabic ? 'الشريحة الحالية' : 'Current segment',
      value: isArabic ? 'القيمة الحالية' : 'Current value',

      workspaceTitle: isArabic ? 'الخطة الحالية' : 'Current validation plan',
      workspaceLead: isArabic
        ? 'الخطة العملية الحالية التي تعمل عليها الآن لجمع أدلة أوضح من السوق.'
        : 'The current practical plan you are using to gather clearer market evidence.',
      goal: isArabic ? 'هدف الدليل' : 'Evidence goal',
      window: isArabic ? 'الإطار الزمني' : 'Execution window',
      channels: isArabic ? 'القنوات المقترحة' : 'Suggested channels',
      outreach: isArabic ? 'رسالة الوصول' : 'Outreach script',
      checklist: isArabic ? 'ماذا تفعل الآن' : 'What to do now',
      continueSignals: isArabic ? 'إشارات الاستمرار' : 'Continue signals',
      pivotSignals: isArabic ? 'إشارات التعديل' : 'Adjust signals',
      stopSignals: isArabic ? 'إشارات الإيقاف' : 'Stop signals',
      quickSignals: isArabic ? 'إشارات القرار السريع' : 'Quick decision signals',

      decisionView: isArabic ? 'رؤية القرار' : 'Decision view',
      decisionLead: isArabic
        ? 'قراءة مركزة لما أصبح أوضح وما ما زال غير مؤكد ولماذا تميل الأدلة إلى هذا الاتجاه الآن.'
        : 'A focused read on what is becoming clearer, what is still uncertain, and why the evidence leans this way right now.',
      clearNow: isArabic ? 'ما أصبح واضحًا' : 'What is becoming clear',
      unclear: isArabic ? 'ما ما زال غير مؤكد' : 'What is still uncertain',
      strongestSignals: isArabic ? 'أوضح الإشارات' : 'Strongest signals',
      reasoning: isArabic ? 'لماذا تميل الأدلة لهذا الاتجاه' : 'Why the evidence leans this way',
      direction: isArabic ? 'الاتجاه العام من الأدلة' : 'Evidence direction',
      confidence: isArabic ? 'درجة الثقة' : 'Confidence level',

      bestStep: isArabic ? 'أفضل خطوة الآن' : 'Best step now',
      bestStepLead: isArabic
        ? 'خطوة عملية واحدة واضحة يمكنك تنفيذها الآن بناءً على الأدلة الحالية وقرارك الحالي.'
        : 'One clear practical step you can run now based on the current evidence and your current decision.',
      stepType: isArabic ? 'نوع الحركة الآن' : 'Step type now',
      whyNow: isArabic ? 'لماذا هذه الخطوة الآن' : 'Why this step now',
      changes: isArabic ? 'ما الذي نعدله الآن' : 'What to change now',
      experiment: isArabic ? 'ماذا ننفذ الآن' : 'What to run now',
      offer: isArabic ? 'العرض الذي نختبره الآن' : 'Offer to test now',
      message: isArabic ? 'الرسالة التي نستخدمها الآن' : 'Message to use now',
      success: isArabic ? 'ما الذي نعده نجاحًا' : 'What counts as success',
      notAvailable: isArabic ? 'غير متوفر' : 'Not available',
    } as const;

    const generatedAt = formatGeneratedAt(uiLang);
    const query = limitText(report.result?.query || report.query, copy.notAvailable, 180);
    const summary = limitText(report.result?.summary, copy.notAvailable, 320);
    const market = limitText(report.market, copy.notAvailable, 90);
    const customer = limitText(report.customer, copy.notAvailable, 110);
    const score = Number.isFinite(report.result?.opportunityScore)
      ? Math.round(report.result.opportunityScore)
      : null;

    const notes = limitText(workspace.notes, copy.notAvailable, 240);
    const focus = limitText(plan.validationFocus, copy.notAvailable, 220);
    const segment = limitText(plan.targetSegment, copy.notAvailable, 180);
    const value = limitText(plan.valueProposition, copy.notAvailable, 180);
    const goal = limitText(plan.evidenceGoal, copy.notAvailable, 180);
    const windowLabel = limitText(plan.executionWindow, copy.notAvailable, 80);
    const channels = safeStringArray(plan.outreachChannels, 5, 70);
    const outreach = limitText(plan.outreachScript, copy.notAvailable, 300);
    const checklist = safeStringArray(getPlanChecklist(plan), 6, 115);
    const continueSignals = safeStringArray(plan.continueSignals, 4, 100);
    const pivotSignals = safeStringArray(plan.pivotSignals, 4, 100);
    const stopSignals = safeStringArray(plan.stopSignals, 4, 100);

    const clearNow = safeStringArray(evidence?.validatedLearnings, 5, 110);
    const unclear = safeStringArray(evidence?.openQuestions, 5, 110);
    const strongestSignals = safeStringArray(evidence?.strongestSignals, 5, 110);
    const reasoning = limitText(evidence?.reasoning, copy.notAvailable, 260);

    const stepType = iteration ? nextMoveLabel(iteration.nextMove, uiLang) : copy.notAvailable;
    const whyNow = limitText(iteration?.whyNow, copy.notAvailable, 220);
    const changes = safeStringArray(iteration?.whatToChange, 4, 100);
    const experiment = limitText(iteration?.nextExperiment, copy.notAvailable, 170);
    const offer = limitText(iteration?.updatedOffer, copy.notAvailable, 180);
    const message = limitText(iteration?.updatedOutreach, copy.notAvailable, 180);
    const success = safeStringArray(iteration?.successCriteria, 4, 100);

    const page1 = `
      <section class="hero-card">
        <div class="eyebrow">${escapeHtml(copy.coverEyebrow)}</div>
        <h1>${escapeHtml(copy.coverTitle)}</h1>
        <div class="hero-idea">${escapeHtml(query)}</div>
        <div class="hero-subtitle">${escapeHtml(copy.coverSubtitle)}</div>
        <div class="hero-date">${escapeHtml(copy.generatedOn)} ${escapeHtml(generatedAt)}</div>

        <div class="meta-grid">
          <div class="meta-card">
            <div class="meta-label">${escapeHtml(copy.market)}</div>
            <div class="meta-value">${escapeHtml(market)}</div>
          </div>
          <div class="meta-card">
            <div class="meta-label">${escapeHtml(copy.customer)}</div>
            <div class="meta-value">${escapeHtml(customer)}</div>
          </div>
          <div class="meta-card">
            <div class="meta-label">${escapeHtml(copy.score)}</div>
            <div class="meta-value">${escapeHtml(score !== null ? `${score}/100` : copy.notAvailable)}</div>
          </div>
          <div class="meta-card">
            <div class="meta-label">${escapeHtml(copy.decisionState)}</div>
            <div class="meta-value">${escapeHtml(decisionLabel(workspace.decisionState, uiLang))}</div>
          </div>
        </div>
      </section>

      <div class="grid-two">
        ${renderCard(copy.summary, renderParagraph(summary))}
        ${renderCard(copy.notes, renderParagraph(notes))}
      </div>

      <div class="grid-three">
        ${renderMiniCard(copy.focus, focus)}
        ${renderMiniCard(copy.segment, segment)}
        ${renderMiniCard(copy.value, value)}
      </div>
    `;

    const page2 = `
      <section class="section-intro">
        <div class="section-kicker">${escapeHtml(copy.workspaceTitle)}</div>
        <h1 class="section-title">${escapeHtml(copy.workspaceTitle)}</h1>
        <p class="section-lead">${escapeHtml(copy.workspaceLead)}</p>
      </section>

      <div class="workspace-top-grid">
        ${renderMiniCard(copy.goal, goal, 'workspace-top-card')}
        ${renderMiniCard(copy.window, windowLabel, 'workspace-top-card')}
        ${renderMiniCard(copy.channels, channels.join(' - ') || copy.notAvailable, 'workspace-top-card')}
      </div>

      <div class="workspace-stack">
        ${renderCard(copy.outreach, renderParagraph(outreach))}
        ${renderCard(copy.checklist, renderBulletList(checklist, isArabic))}
      </div>
    `;

    const page3 = `
      <section class="section-intro">
        <div class="section-kicker">${escapeHtml(copy.quickSignals)}</div>
        <h1 class="section-title">${escapeHtml(copy.quickSignals)}</h1>
        <p class="section-lead">${escapeHtml(
          isArabic
            ? 'ملخص سريع للإشارات التي تدعم الاستمرار أو التعديل أو الإيقاف أثناء التنفيذ الحالي.'
            : 'A quick summary of the signals that support continuing, adjusting, or stopping during the current execution path.',
        )}</p>
      </section>

      <div class="signal-stack">
        ${renderCard(copy.continueSignals, renderBulletList(continueSignals, isArabic))}
        ${renderCard(copy.pivotSignals, renderBulletList(pivotSignals, isArabic))}
        ${renderCard(copy.stopSignals, renderBulletList(stopSignals, isArabic))}
      </div>
    `;

    const page4 = `
      <section class="section-intro">
        <div class="section-kicker">${escapeHtml(copy.decisionView)}</div>
        <h1 class="section-title">${escapeHtml(copy.decisionView)}</h1>
        <p class="section-lead">${escapeHtml(copy.decisionLead)}</p>
      </section>

      <div class="grid-two decision-grid">
        ${renderCard(
          copy.decisionView,
          `
            <div class="mini-grid">
              ${renderMiniCard(copy.direction, recommendationLabel(evidence?.recommendedDirection, uiLang))}
              ${renderMiniCard(copy.confidence, confidenceLabel(evidence?.confidence, uiLang))}
            </div>
            ${renderCard(copy.clearNow, renderBulletList(clearNow, isArabic), 'nested-card')}
            ${renderCard(copy.unclear, renderBulletList(unclear, isArabic), 'nested-card')}
          `,
        )}
        ${renderCard(
          isArabic ? 'منطق القرار' : 'Decision logic',
          `
            ${renderCard(copy.strongestSignals, renderBulletList(strongestSignals, isArabic), 'nested-card')}
            ${renderCard(copy.reasoning, renderParagraph(reasoning), 'nested-card')}
          `,
        )}
      </div>
    `;

    const page5 = `
      <section class="section-intro">
        <div class="section-kicker">${escapeHtml(copy.bestStep)}</div>
        <h1 class="section-title">${escapeHtml(copy.bestStep)}</h1>
        <p class="section-lead">${escapeHtml(copy.bestStepLead)}</p>
      </section>

      <div class="grid-two">
        ${renderCard(
          copy.bestStep,
          `
            ${renderMiniCard(copy.stepType, stepType)}
            ${renderCard(copy.whyNow, renderParagraph(whyNow), 'nested-card')}
            ${renderCard(copy.changes, renderBulletList(changes, isArabic), 'nested-card')}
            ${renderCard(copy.experiment, renderParagraph(experiment), 'nested-card')}
          `,
        )}
        ${renderCard(
          isArabic ? 'تنفيذ الخطوة' : 'Step execution',
          `
            ${renderCard(copy.offer, renderParagraph(offer), 'nested-card')}
            ${renderCard(copy.message, renderParagraph(message), 'nested-card')}
            ${renderCard(copy.success, renderBulletList(success, isArabic), 'nested-card')}
          `,
        )}
      </div>
    `;

    const fontCss = await loadFontFaceCss();
    const logoDataUrl = await loadLogoDataUrl();
    const fontFamily = isArabic ? "'MadixoArabic', 'Tahoma', sans-serif" : 'Inter, Arial, sans-serif';
    const textAlign = isArabic ? 'right' : 'left';
    const footerAlign = isArabic ? 'left' : 'right';

    const html = `<!DOCTYPE html>
<html lang="${uiLang}" dir="${isArabic ? 'rtl' : 'ltr'}">
<head>
  <meta charset="utf-8" />
  <title>Madixo Validation PDF</title>
  <style>
    ${fontCss}

    :root {
      --bg: #ffffff;
      --ink: #0f172a;
      --muted: #667085;
      --line: #d9e2f0;
      --card: #f8fafc;
      --card-soft: #f9fbfe;
      --hero: #f6f9fd;
      --brand: #0f172a;
    }

    * { box-sizing: border-box; }

    html, body {
      margin: 0;
      padding: 0;
      background: var(--bg);
      color: var(--ink);
      font-family: ${fontFamily};
      direction: ${isArabic ? 'rtl' : 'ltr'};
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    body {
      font-size: 13px;
      line-height: 1.7;
    }

    @page {
      size: A4;
      margin: 0;
    }

    .page {
      width: 210mm;
      height: 297mm;
      padding: 16mm 14mm 12mm;
      background: #fff;
      overflow: hidden;
      page-break-after: always;
      break-after: page;
      position: relative;
    }

    .page:last-child {
      page-break-after: auto;
      break-after: auto;
    }

    .page-shell {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .page-head {
      flex: 0 0 auto;
      margin-bottom: 8mm;
    }

    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: var(--muted);
      font-size: 13px;
      direction: ${isArabic ? 'rtl' : 'ltr'};
    }

    .caption {
      font-size: 13px;
      font-weight: 700;
      color: var(--muted);
    }

    .topbar img {
      width: 110px;
      height: auto;
      object-fit: contain;
      display: block;
    }

    .logo-spacer {
      width: 110px;
      height: 24px;
    }

    .page-rule {
      height: 1px;
      background: var(--line);
      margin-top: 8mm;
    }

    .page-body {
      flex: 1 1 auto;
      min-height: 0;
    }

    .footer {
      flex: 0 0 auto;
      margin-top: 6mm;
      color: var(--muted);
      font-size: 11px;
      text-align: ${footerAlign};
    }

    .hero-card,
    .card,
    .mini-card,
    .meta-card {
      border: 1px solid var(--line);
      border-radius: 22px;
      background: var(--card);
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .hero-card {
      background: var(--hero);
      padding: 18px;
      margin-bottom: 12px;
    }

    .card {
      padding: 16px 18px;
    }

    .mini-card,
    .meta-card {
      padding: 12px 14px;
      background: var(--card-soft);
    }

    .workspace-top-card {
      padding: 14px 16px;
      min-height: 122px;
    }

    .eyebrow,
    .section-kicker {
      color: var(--muted);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: .08em;
      text-transform: uppercase;
      margin-bottom: 8px;
      text-align: ${textAlign};
    }

    h1,
    .section-title {
      margin: 0;
      font-size: 30px;
      line-height: 1.15;
      color: var(--brand);
      text-align: ${textAlign};
      font-weight: 900;
    }

    .hero-idea {
      margin-top: 10px;
      font-size: 18px;
      line-height: 1.75;
      font-weight: 800;
      text-align: ${textAlign};
      word-break: break-word;
    }

    .hero-subtitle,
    .hero-date,
    .section-lead {
      color: #475467;
      font-size: 12px;
      line-height: 1.8;
      text-align: ${textAlign};
    }

    .hero-subtitle {
      margin-top: 6px;
    }

    .hero-date {
      margin-top: 6px;
    }

    .section-intro {
      margin-bottom: 12px;
    }

    .section-lead {
      margin-top: 6px;
    }

    .meta-grid,
    .grid-two,
    .grid-three,
    .mini-grid {
      display: grid;
      gap: 12px;
      align-items: start;
    }

    .signal-stack {
      display: grid;
      gap: 14px;
      align-items: start;
    }

    .workspace-top-grid,
    .workspace-stack {
      display: grid;
      align-items: start;
    }

    .meta-grid,
    .grid-two,
    .decision-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .grid-three,
    .workspace-top-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .mini-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      margin-bottom: 12px;
    }

    .meta-grid {
      margin-top: 14px;
    }

    .grid-two,
    .grid-three {
      margin-top: 12px;
    }

    .workspace-top-grid {
      gap: 18px;
      margin-top: 18px;
      margin-bottom: 18px;
    }

    .workspace-stack {
      gap: 18px;
    }

    .meta-label,
    .mini-title {
      color: var(--muted);
      font-size: 11px;
      font-weight: 700;
      text-align: ${textAlign};
    }

    .meta-value,
    .mini-value {
      margin-top: 4px;
      font-size: 15px;
      line-height: 1.55;
      font-weight: 800;
      text-align: ${textAlign};
      word-break: break-word;
    }

    .card h2 {
      margin: 0;
      font-size: 18px;
      line-height: 1.25;
      color: var(--brand);
      text-align: ${textAlign};
      font-weight: 900;
    }

    .card-rule,
    .mini-rule {
      height: 1px;
      background: var(--line);
      margin: 9px 0 10px;
    }

    .card-body {
      text-align: ${textAlign};
    }

    .paragraph,
    .muted {
      margin: 0;
      font-size: 12px;
      line-height: 1.9;
      color: #334155;
      text-align: ${textAlign};
      word-break: break-word;
    }

    .muted {
      color: var(--muted);
    }

    .bullet-list {
      margin: 0;
      padding-inline-start: 18px;
    }

    .bullet-list li {
      margin: 0 0 6px;
      font-size: 12px;
      line-height: 1.85;
      color: #334155;
      word-break: break-word;
    }

    .rtl-list li { text-align: right; }
    .ltr-list li { text-align: left; }

    .nested-card {
      background: #fff;
      border: 1px solid var(--line);
      border-radius: 18px;
      margin-top: 12px;
      padding: 14px 16px;
    }

    .card-body > .nested-card:first-child {
      margin-top: 0;
    }

    .card-body > .nested-card + .nested-card {
      margin-top: 14px;
    }
  </style>
</head>
<body>
  ${renderPageShell({
    caption: copy.caption,
    logoDataUrl,
    bodyHtml: page1,
    footerText: isArabic ? 'الصفحة 1 من 5' : 'Page 1 of 5',
  })}
  ${renderPageShell({
    caption: copy.caption,
    logoDataUrl,
    bodyHtml: page2,
    footerText: isArabic ? 'الصفحة 2 من 5' : 'Page 2 of 5',
  })}
  ${renderPageShell({
    caption: copy.caption,
    logoDataUrl,
    bodyHtml: page3,
    footerText: isArabic ? 'الصفحة 3 من 5' : 'Page 3 of 5',
  })}
  ${renderPageShell({
    caption: copy.caption,
    logoDataUrl,
    bodyHtml: page4,
    footerText: isArabic ? 'الصفحة 4 من 5' : 'Page 4 of 5',
  })}
  ${renderPageShell({
    caption: copy.caption,
    logoDataUrl,
    bodyHtml: page5,
    footerText: isArabic ? 'الصفحة 5 من 5' : 'Page 5 of 5',
  })}
</body>
</html>`;

    chromium.setGraphicsMode = false;
    browser = await playwright.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });
    const page = await browser.newPage({
      viewport: { width: 1240, height: 1754 },
      deviceScaleFactor: 1,
    });

    await page.setContent(html, { waitUntil: 'networkidle' });
    await page.emulateMedia({ media: 'screen' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    });

    const utf8Name = buildUtf8FileName(report, uiLang);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="madixo-validation.pdf"; filename*=UTF-8''${encodeRFC5987ValueChars(utf8Name)}`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      { error: `Failed to generate validation PDF: ${message}` },
      { status: 500 },
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
