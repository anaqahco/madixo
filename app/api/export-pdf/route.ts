import { readFile } from 'node:fs/promises';
import path from 'node:path';
import chromium from '@sparticuz/chromium';
import { chromium as playwright, type Page } from 'playwright-core';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type UiLang = 'ar' | 'en';

interface ScoreBreakdownRow {
  key?: string;
  label: string;
  score: number;
  note: string;
}

interface SimpleBlock {
  title: string;
  description: string;
}

interface SuggestedMvpBlock extends SimpleBlock {
  features: string[];
}

interface RevenueModelBlock extends SimpleBlock {
  price: string;
}

interface FirstOfferBlock extends SimpleBlock {
  priceIdea: string;
}

interface AnalysisResult {
  query: string;
  opportunityScore: number;
  opportunityLabel: string;
  summary: string;
  whyThisOpportunity: string;
  marketDemand: SimpleBlock;
  competition: SimpleBlock;
  targetCustomers: SimpleBlock;
  suggestedMvp: SuggestedMvpBlock;
  revenueModel: RevenueModelBlock;
  nextSteps: string[];
  bestFirstCustomer: SimpleBlock;
  firstOffer: FirstOfferBlock;
  painPoints: string[];
  opportunityAngle: string;
  goToMarket: string;
  risks: string[];
}

interface CopyPayload {
  reportHeader: string;
  businessIdea: string;
  targetMarket: string;
  inputTargetCustomer: string;
  whyThisOpportunity: string;
  opportunityScore: string;
  whyThisScore: string;
  summary: string;
  marketDemand: string;
  competition: string;
  targetCustomers: string;
  suggestedMvp: string;
  mvpFeatures: string;
  revenueModel: string;
  nextSteps: string;
  bestFirstCustomer: string;
  firstOffer: string;
  painPoints: string;
  opportunityAngle: string;
  goToMarket: string;
  risks: string;
  generatedOn: string;
  overallScore: string;
  notSpecified: string;
}

interface ExportPayload {
  result: AnalysisResult;
  uiLang: UiLang;
  safeMarket: string;
  safeCustomer: string;
  safeLabel: string;
  scoreBreakdownRows: ScoreBreakdownRow[];
  generatedAt: string;
  copy: CopyPayload;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalizeText(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function cleanTypography(value: string) {
  return value
    .replace(/[\u200e\u200f]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s+([،,.!:؛؟])/g, '$1')
    .trim();
}

function fixArabicArtifacts(value: string) {
  return value
    .replace(/اأ/g, 'أ')
    .replace(/اإ/g, 'إ')
    .replace(/العمالء/g, 'العملاء')
    .replace(/األولية/g, 'الأولية')
    .replace(/اإليرادات/g, 'الإيرادات')
    .replace(/اإلطالق/g, 'الإطلاق')
    .replace(/األسنان/g, 'الأسنان');
}

function tidy(value: unknown, fallback = '') {
  const base = normalizeText(value, fallback);
  return fixArabicArtifacts(cleanTypography(base));
}

function uniqueSubtitle(title: string, subtitle?: string) {
  const safeTitle = tidy(title).replace(/[\s:؛،.-]+/g, '');
  const safeSubtitle = tidy(subtitle || '').replace(/[\s:؛،.-]+/g, '');

  if (!safeSubtitle) return '';
  if (safeSubtitle === safeTitle) return '';

  const genericArabic = new Set([
    'حجمالطلب',
    'المنافسة',
    'العملاءالمستهدفون',
    'أفضلعميلأول',
    'المنتجالمبدئي',
    'العرضالأول',
    'نموذجالإيراد',
    'نموذجالإيرادات',
  ]);
  const genericEnglish = new Set([
    'marketsize',
    'competition',
    'targetcustomers',
    'bestfirstcustomer',
    'mvp',
    'firstoffer',
    'revenuemodel',
  ]);

  if (
    genericArabic.has(safeSubtitle) ||
    genericEnglish.has(safeSubtitle.toLowerCase())
  ) {
    return '';
  }

  return tidy(subtitle);
}

function scoreTone(score: number) {
  if (score >= 75) return '#067647';
  if (score >= 60) return '#155EEF';
  if (score >= 40) return '#C4320A';
  return '#B42318';
}

function renderBulletList(items: string[], isArabic: boolean, dense = false) {
  if (!items.length) return '<p class="muted">-</p>';

  return `<ul class="bullet-list ${dense ? 'dense-list' : ''} ${
    isArabic ? 'rtl-list' : 'ltr-list'
  }">${items
    .map((item) => `<li>${escapeHtml(tidy(item))}</li>`)
    .join('')}</ul>`;
}

function renderScoreCards(rows: ScoreBreakdownRow[]) {
  if (!rows.length) return '<p class="muted">-</p>';

  return `<div class="score-grid">${rows
    .map((row) => {
      const score = Math.max(0, Math.min(100, Math.round(Number(row.score) || 0)));
      const width = Math.max(8, Math.min(100, score));

      return `
        <div class="score-card">
          <div class="score-card-top">
            <div class="score-chip">${score}/100</div>
            <div class="score-card-title">${escapeHtml(tidy(row.label))}</div>
          </div>
          <div class="meter"><span style="width:${width}%"></span></div>
          <div class="score-note">${escapeHtml(tidy(row.note))}</div>
        </div>
      `;
    })
    .join('')}</div>`;
}

function renderCard(title: string, bodyHtml: string, subtitle = '', className = '') {
  const safeTitle = tidy(title);
  const safeSubtitle = uniqueSubtitle(title, subtitle);

  return `
    <section class="section-card ${className}">
      <h2>${escapeHtml(safeTitle)}</h2>
      <div class="section-rule"></div>
      ${
        safeSubtitle
          ? `<div class="section-subtitle">${escapeHtml(safeSubtitle)}</div>`
          : ''
      }
      <div class="section-body">${bodyHtml}</div>
    </section>
  `;
}

function renderSimpleInfoCard(title: string, value: string) {
  return `
    <section class="info-card">
      <div class="info-title">${escapeHtml(tidy(title))}</div>
      <div class="section-rule compact"></div>
      <div class="info-value">${escapeHtml(tidy(value))}</div>
    </section>
  `;
}

function formatGeneratedAt(uiLang: UiLang) {
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
        font-display: block;
      }

      @font-face {
        font-family: 'MadixoArabic';
        src: url(data:font/ttf;base64,${base64}) format('truetype');
        font-weight: 700;
        font-style: normal;
        font-display: block;
      }
    `;
  } catch (error) {
    console.error('[pdf-font] Failed to load Cairo-Regular.ttf', error);
    return '';
  }
}

async function waitForPageFonts(page: Page) {
  await page.evaluate(async () => {
    if ('fonts' in document) {
      await (document as Document & {
        fonts: FontFaceSet;
      }).fonts.ready;
    }
  });

  await page.waitForTimeout(180);
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

function renderPageShell(params: {
  pageCaption: string;
  logoDataUrl: string;
  bodyHtml: string;
  footerText: string;
}) {
  return `
    <main class="page">
      <div class="topbar">
        <div>${escapeHtml(params.pageCaption)}</div>
        ${
          params.logoDataUrl
            ? `<img src="${params.logoDataUrl}" alt="Madixo" />`
            : '<div></div>'
        }
      </div>
      <div class="rule"></div>
      ${params.bodyHtml}
      <div class="footer">${escapeHtml(params.footerText)}</div>
    </main>
  `;
}

export async function POST(request: Request) {
  let browser: Awaited<ReturnType<typeof playwright.launch>> | null = null;

  try {
    const payload = (await request.json()) as ExportPayload;
    const isArabic = payload.uiLang === 'ar';
    const result = payload.result;
    const copy = payload.copy;

    const generatedAt = tidy(payload.generatedAt || formatGeneratedAt(payload.uiLang));
    const safeMarket = tidy(payload.safeMarket || copy.notSpecified);
    const safeCustomer = tidy(payload.safeCustomer || copy.notSpecified);
    const safeLabel = tidy(payload.safeLabel || result.opportunityLabel);
    const scoreRows = Array.isArray(payload.scoreBreakdownRows)
      ? payload.scoreBreakdownRows
      : [];
    const score = Math.max(
      0,
      Math.min(100, Math.round(Number(result.opportunityScore) || 0)),
    );
    const labelColor = scoreTone(score);

    const pageCaption = isArabic ? 'تقرير الفرصة' : 'Opportunity report';
    const heroTitle = isArabic ? 'تحليل الفرصة' : 'Opportunity Analysis';
    const heroEyebrow = 'MADIXO OPPORTUNITY REPORT';
    const scoreHeading = isArabic ? 'درجة الفرصة' : 'Opportunity score';
    const summaryHeading = isArabic ? 'الخلاصة' : 'Summary';
    const overviewHeading = isArabic ? 'نظرة عامة' : 'Overview';
    const whyScoreHeading = isArabic ? 'لماذا هذه الدرجة' : 'Why this score';

    const page1 = `
      <section class="hero-card">
        <div class="hero-copy">
          <div class="eyebrow">${escapeHtml(heroEyebrow)}</div>
          <h1>${escapeHtml(heroTitle)}</h1>
          <div class="hero-idea">${escapeHtml(tidy(result.query))}</div>
          <div class="hero-meta">${escapeHtml(copy.generatedOn)} ${escapeHtml(generatedAt)}</div>
        </div>
        <div class="hero-side">
          <span class="pill label-pill">${escapeHtml(safeLabel)}</span>
        </div>
      </section>

      <div class="top-grid">
        <section class="section-card score-summary-card">
          <div class="mini-grid">
            <div class="score-box">
              <div class="mini-title">${escapeHtml(scoreHeading)}</div>
              <div class="section-rule compact"></div>
              <div class="score-row">
                <div class="score-number">${score}</div>
                <div class="score-scale">/100</div>
              </div>
              <div class="score-label" style="color:${labelColor}">${escapeHtml(safeLabel)}</div>
            </div>
            <div class="summary-box">
              <div class="mini-title">${escapeHtml(summaryHeading)}</div>
              <div class="section-rule compact"></div>
              <p>${escapeHtml(tidy(result.summary))}</p>
            </div>
          </div>
        </section>
      </div>

      <section class="section-wrap">
        <div class="section-heading">${escapeHtml(overviewHeading)}</div>
        <div class="overview-grid">
          ${renderSimpleInfoCard(copy.businessIdea, result.query)}
          ${renderSimpleInfoCard(copy.targetMarket, safeMarket)}
          ${renderSimpleInfoCard(copy.inputTargetCustomer, safeCustomer)}
        </div>
      </section>

      ${renderCard(
        copy.whyThisOpportunity,
        `<p>${escapeHtml(tidy(result.whyThisOpportunity))}</p>`,
      )}
    `;

    const page2 = `
      ${renderCard(whyScoreHeading, renderScoreCards(scoreRows))}
      ${renderCard(
        copy.marketDemand,
        `<p>${escapeHtml(tidy(result.marketDemand.description))}</p>`,
        result.marketDemand.title,
      )}
      ${renderCard(
        copy.competition,
        `<p>${escapeHtml(tidy(result.competition.description))}</p>`,
        result.competition.title,
      )}
      ${renderCard(
        copy.targetCustomers,
        `<p>${escapeHtml(tidy(result.targetCustomers.description))}</p>`,
        result.targetCustomers.title,
      )}
    `;

    const page3 = `
      ${renderCard(
        copy.bestFirstCustomer,
        `<p>${escapeHtml(tidy(result.bestFirstCustomer.description))}</p>`,
        result.bestFirstCustomer.title,
      )}
      ${renderCard(
        copy.suggestedMvp,
        `<p>${escapeHtml(tidy(result.suggestedMvp.description))}</p>${renderBulletList(
          result.suggestedMvp.features,
          isArabic,
          true,
        )}`,
        result.suggestedMvp.title,
      )}
      <div class="duo-grid">
        ${renderCard(
          copy.firstOffer,
          `<p>${escapeHtml(`${tidy(result.firstOffer.priceIdea)} - ${tidy(result.firstOffer.description)}`)}</p>`,
          result.firstOffer.title,
          'tight-card',
        )}
        ${renderCard(
          copy.revenueModel,
          `<p>${escapeHtml(`${tidy(result.revenueModel.price)} - ${tidy(result.revenueModel.description)}`)}</p>`,
          result.revenueModel.title,
          'tight-card',
        )}
      </div>
      ${renderCard(copy.nextSteps, renderBulletList(result.nextSteps, isArabic, true))}
    `;

    const page4 = `
      ${renderCard(copy.painPoints, renderBulletList(result.painPoints, isArabic, true))}
      ${renderCard(copy.opportunityAngle, `<p>${escapeHtml(tidy(result.opportunityAngle))}</p>`)}
      ${renderCard(copy.goToMarket, `<p>${escapeHtml(tidy(result.goToMarket))}</p>`)}
      ${renderCard(copy.risks, renderBulletList(result.risks, isArabic, true))}
    `;

    const fontCss = await loadFontFaceCss();
    const logoDataUrl = await loadLogoDataUrl();

    const html = `<!doctype html>
<html lang="${isArabic ? 'ar' : 'en'}" dir="${isArabic ? 'rtl' : 'ltr'}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    ${fontCss}

    :root {
      --bg: #ffffff;
      --text: #0f172a;
      --muted: #667085;
      --line: #d9e2ec;
      --panel: #f4f7fc;
      --card: #f8fafc;
      --card-soft: #f4f7fb;
      --hero: #f9fbfe;
      --brand: #0b1736;
      --brand-soft: #eef2ff;
    }

    * { box-sizing: border-box; }

    html, body {
      margin: 0;
      padding: 0;
      background: var(--bg);
      color: var(--text);
      font-family: ${
        isArabic
          ? "'MadixoArabic', Arial, sans-serif"
          : 'Inter, Arial, sans-serif'
      };
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    body {
      font-size: 13.5px;
      line-height: 1.66;
    }

    .page {
      width: 210mm;
      height: 297mm;
      padding: 16px 36px 12px;
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

    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: var(--muted);
      font-size: 13px;
      margin-bottom: 8px;
      direction: ${isArabic ? 'rtl' : 'ltr'};
    }

    .topbar img {
      width: 118px;
      height: auto;
      object-fit: contain;
    }

    .rule {
      height: 1px;
      background: var(--line);
      margin-bottom: 10px;
    }

    .hero-card,
    .section-card,
    .info-card {
      border: 1px solid var(--line);
      border-radius: 22px;
      background: var(--card);
    }

    .hero-card {
      background: var(--hero);
      padding: 18px;
      display: grid;
      grid-template-columns: ${isArabic ? '150px 1fr' : '1fr 150px'};
      gap: 18px;
      align-items: center;
      margin-bottom: 10px;
    }

    .hero-copy { text-align: ${isArabic ? 'right' : 'left'}; }

    .hero-side {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .eyebrow {
      color: var(--muted);
      font-size: 12px;
      font-weight: 700;
      letter-spacing: .05em;
      text-transform: uppercase;
      margin-bottom: 8px;
    }

    .hero-copy h1 {
      margin: 0 0 6px;
      font-size: 34px;
      line-height: 1.15;
      color: var(--brand);
    }

    .hero-idea {
      font-size: 17px;
      font-weight: 700;
      color: var(--brand);
      margin-bottom: 8px;
    }

    .hero-meta {
      color: var(--muted);
      font-size: 12.5px;
      margin-top: 4px;
    }

    .pill {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 1px solid #c7d7fe;
      background: var(--brand-soft);
      color: #2456d3;
      border-radius: 999px;
      padding: 8px 14px;
      font-weight: 700;
      line-height: 1.2;
    }

    .label-pill {
      min-width: 86px;
      max-width: 132px;
      text-align: center;
    }

    .top-grid {
      margin-bottom: 10px;
    }

    .score-summary-card {
      background: var(--card-soft);
      padding: 16px 18px;
    }

    .mini-grid {
      display: grid;
      grid-template-columns: ${isArabic ? '1fr 210px' : '210px 1fr'};
      gap: 16px;
      align-items: stretch;
      direction: ${isArabic ? 'rtl' : 'ltr'};
    }

    .mini-title,
    .section-heading {
      color: var(--brand);
      font-size: 15px;
      line-height: 1.3;
      font-weight: 700;
    }

    .section-heading {
      margin: 0 0 8px;
      text-align: ${isArabic ? 'right' : 'left'};
    }

    .section-wrap {
      margin-bottom: 10px;
    }

    .score-box,
    .summary-box {
      text-align: ${isArabic ? 'right' : 'left'};
    }

    .section-rule {
      height: 1px;
      background: var(--line);
      margin: 7px 0 9px;
    }

    .section-rule.compact {
      margin: 7px 0 9px;
    }

    .score-row {
      display: flex;
      align-items: baseline;
      gap: 8px;
      direction: ltr;
      justify-content: ${isArabic ? 'flex-end' : 'flex-start'};
    }

    .score-number {
      font-size: 60px;
      line-height: 1;
      font-weight: 700;
      color: var(--brand);
    }

    .score-scale {
      font-size: 16px;
      color: var(--muted);
    }

    .score-label {
      margin-top: 6px;
      font-size: 16px;
      font-weight: 700;
    }

    .summary-box p,
    .section-body p {
      margin: 0;
      color: #344054;
      white-space: pre-wrap;
    }

    .overview-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }

    .info-card {
      background: var(--card-soft);
      padding: 14px 16px;
    }

    .info-title {
      color: var(--brand);
      font-size: 14px;
      font-weight: 700;
      text-align: ${isArabic ? 'right' : 'left'};
    }

    .info-value {
      color: var(--text);
      font-size: 15px;
      font-weight: 600;
      text-align: ${isArabic ? 'right' : 'left'};
    }

    .section-card {
      background: var(--card);
      padding: 16px 18px;
      margin-bottom: 10px;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .tight-card {
      margin-bottom: 0;
    }

    .section-card h2 {
      margin: 0;
      font-size: 16px;
      color: var(--brand);
      text-align: ${isArabic ? 'right' : 'left'};
      line-height: 1.3;
    }

    .section-subtitle {
      color: var(--muted);
      font-size: 12.5px;
      margin-bottom: 6px;
      font-weight: 600;
      text-align: ${isArabic ? 'right' : 'left'};
    }

    .bullet-list {
      margin: 0;
      padding-${isArabic ? 'right' : 'left'}: 18px;
      color: #344054;
    }

    .bullet-list li { margin-bottom: 5px; }
    .dense-list li { margin-bottom: 4px; line-height: 1.55; }
    .muted { color: var(--muted); }

    .score-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .score-card {
      border: 1px solid var(--line);
      border-radius: 18px;
      padding: 12px;
      background: #f2f6ff;
    }

    .score-card-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      direction: ${isArabic ? 'rtl' : 'ltr'};
      margin-bottom: 8px;
    }

    .score-chip {
      border: 1px solid #dce3ed;
      background: #f4f7fb;
      border-radius: 999px;
      padding: 5px 10px;
      font-size: 11.5px;
      font-weight: 700;
      color: var(--text);
      white-space: nowrap;
    }

    .score-card-title {
      color: var(--brand);
      font-size: 14px;
      font-weight: 700;
      flex: 1;
      text-align: ${isArabic ? 'right' : 'left'};
      line-height: 1.3;
    }

    .meter {
      height: 9px;
      border-radius: 999px;
      background: #e8edf5;
      overflow: hidden;
      margin-bottom: 8px;
    }

    .meter span {
      display: block;
      height: 100%;
      background: linear-gradient(90deg, #0b1736 0%, #2456d3 100%);
      border-radius: 999px;
    }

    .score-note {
      color: var(--muted);
      font-size: 11.5px;
      line-height: 1.55;
    }

    .duo-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 10px;
    }

    .footer {
      position: absolute;
      bottom: 8px;
      ${isArabic ? 'left' : 'right'}: 40px;
      color: var(--muted);
      font-size: 11.5px;
    }

    @page {
      size: A4;
      margin: 0;
    }
  </style>
</head>
<body>
  ${renderPageShell({
    pageCaption,
    logoDataUrl,
    bodyHtml: page1,
    footerText: isArabic ? 'الصفحة 1 من 4' : 'Page 1 of 4',
  })}
  ${renderPageShell({
    pageCaption,
    logoDataUrl,
    bodyHtml: page2,
    footerText: isArabic ? 'الصفحة 2 من 4' : 'Page 2 of 4',
  })}
  ${renderPageShell({
    pageCaption,
    logoDataUrl,
    bodyHtml: page3,
    footerText: isArabic ? 'الصفحة 3 من 4' : 'Page 3 of 4',
  })}
  ${renderPageShell({
    pageCaption,
    logoDataUrl,
    bodyHtml: page4,
    footerText: isArabic ? 'الصفحة 4 من 4' : 'Page 4 of 4',
  })}
</body>
</html>`;

    chromium.setGraphicsMode = false;
    browser = await playwright.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });
    const page = await browser.newPage({ viewport: { width: 1240, height: 1754 } });

    await page.setContent(html, { waitUntil: 'networkidle' });
    await waitForPageFonts(page);
    await page.emulateMedia({ media: 'screen' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
    });

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="madixo-report.pdf"',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to generate PDF: ${message}` },
      { status: 500 },
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
