import { readFile } from 'node:fs/promises';
import path from 'node:path';
import chromium from '@sparticuz/chromium';
import { chromium as playwright, type Page } from 'playwright-core';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type UiLang = 'ar' | 'en';

type CostItem = {
  item?: unknown;
  estimate?: unknown;
  note?: unknown;
};

type RevenueScenario = {
  scenario?: unknown;
  monthlyRevenue?: unknown;
  note?: unknown;
};

type FeasibilityStudy = {
  verdictLabel?: unknown;
  verdictSummary?: unknown;
  keyAssumptions?: unknown;
  startupCosts?: {
    totalRange?: unknown;
    items?: unknown;
  } | null;
  monthlyCosts?: {
    totalRange?: unknown;
    items?: unknown;
  } | null;
  revenueScenarios?: unknown;
  breakEvenTimeline?: unknown;
  breakEvenSummary?: unknown;
  financialRisks?: unknown;
  recommendedAction?: unknown;
  disclaimer?: unknown;
};

type ExportPayload = {
  uiLang?: UiLang;
  safeMarket?: string;
  generatedAt?: string;
  copy?: Record<string, unknown>;
  feasibility?: FeasibilityStudy;
  result?: {
    query?: unknown;
    opportunityLabel?: unknown;
    initialFeasibility?: FeasibilityStudy;
  } | null;
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

function safeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => cleanText(item)).filter(Boolean);
}

function safeCostItems(
  value: unknown,
): Array<{ item: string; estimate: string; note: string }> {
  if (!Array.isArray(value)) return [];
  return value
    .map((raw) => {
      const obj = (raw ?? {}) as CostItem;
      return {
        item: cleanText(obj.item),
        estimate: cleanText(obj.estimate),
        note: cleanText(obj.note),
      };
    })
    .filter((item) => item.item || item.estimate || item.note);
}

function safeRevenueScenarios(
  value: unknown,
): Array<{ scenario: string; monthlyRevenue: string; note: string }> {
  if (!Array.isArray(value)) return [];
  return value
    .map((raw) => {
      const obj = (raw ?? {}) as RevenueScenario;
      return {
        scenario: cleanText(obj.scenario),
        monthlyRevenue: cleanText(obj.monthlyRevenue),
        note: cleanText(obj.note),
      };
    })
    .filter((item) => item.scenario || item.monthlyRevenue || item.note);
}

function renderBulletList(items: string[], isArabic: boolean) {
  if (!items.length) return '<p class="muted">-</p>';

  return `<ul class="bullet-list ${isArabic ? 'rtl-list' : 'ltr-list'}">${items
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join('')}</ul>`;
}

function renderCard(title: string, bodyHtml: string, subtitle = '', className = '') {
  const safeTitle = cleanText(title);
  const safeSubtitle = cleanText(subtitle);

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
      <div class="info-title">${escapeHtml(cleanText(title))}</div>
      <div class="section-rule compact"></div>
      <div class="info-value">${escapeHtml(cleanText(value || '-'))}</div>
    </section>
  `;
}

function renderCostColumn(
  title: string,
  totalLabel: string,
  totalRange: string,
  items: Array<{ item: string; estimate: string; note: string }>,
) {
  return `
    <section class="section-card section-cost-column">
      <h2>${escapeHtml(cleanText(title))}</h2>
      <div class="section-rule"></div>
      <div class="pill total-pill">${escapeHtml(cleanText(totalLabel))}: ${escapeHtml(
        cleanText(totalRange || '-'),
      )}</div>
      <div class="stack">
        ${
          items.length
            ? items
                .map(
                  (item) => `
                    <div class="sub-card">
                      <div class="sub-card-top">
                        <div class="pill small-pill">${escapeHtml(item.estimate || '-')}</div>
                        <div class="sub-card-title">${escapeHtml(item.item || '-')}</div>
                      </div>
                      <div class="sub-card-note">${escapeHtml(item.note || '-')}</div>
                    </div>
                  `,
                )
                .join('')
            : `<div class="sub-card"><div class="sub-card-note">-</div></div>`
        }
      </div>
    </section>
  `;
}

function renderScenarioCards(
  items: Array<{ scenario: string; monthlyRevenue: string; note: string }>,
) {
  if (!items.length) return '<p class="muted">-</p>';

  return `
    <div class="scenario-grid">
      ${items
        .map(
          (item) => `
            <div class="scenario-card">
              <div class="scenario-title">${escapeHtml(item.scenario || '-')}</div>
              <div class="pill total-pill">${escapeHtml(item.monthlyRevenue || '-')}</div>
              <div class="scenario-note">${escapeHtml(item.note || '-')}</div>
            </div>
          `,
        )
        .join('')}
    </div>
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
    const uiLang: UiLang = payload.uiLang === 'en' ? 'en' : 'ar';
    const isArabic = uiLang === 'ar';

    const copy = {
      pageCaption: isArabic ? 'دراسة الجدوى الأولية' : 'Initial feasibility study',
      heroEyebrow: 'MADIXO FEASIBILITY REPORT',
      heroTitle: isArabic ? 'دراسة الجدوى الأولية' : 'Initial feasibility study',
      heroSubtitle: isArabic
        ? 'قراءة أولية عملية قبل التنفيذ الكامل.'
        : 'A practical first-pass feasibility read before full execution.',
      generatedOn: isArabic ? 'تم الإنشاء في' : 'Generated on',
      marketLabel: isArabic ? 'السوق المستهدف' : 'Target market',
      verdict: isArabic ? 'حكم Madixo الأولي' : 'Madixo initial verdict',
      assumptions: isArabic ? 'الافتراضات الأساسية' : 'Key assumptions',
      breakEven: isArabic ? 'نظرة نقطة التعادل' : 'Break-even view',
      startupCosts: isArabic ? 'تكاليف البداية' : 'Startup costs',
      monthlyCosts: isArabic ? 'التكاليف الشهرية' : 'Monthly costs',
      startupTotal: isArabic ? 'النطاق التقديري للبداية' : 'Estimated startup range',
      monthlyTotal: isArabic ? 'النطاق التقديري الشهري' : 'Estimated monthly range',
      revenueScenarios: isArabic ? 'سيناريوهات الإيراد' : 'Revenue scenarios',
      financialRisks: isArabic ? 'المخاطر المالية' : 'Financial risks',
      recommendedAction: isArabic ? 'أفضل خطوة مقترحة' : 'Recommended action',
      disclaimer: isArabic ? 'ملاحظة مهمة' : 'Important note',
      notAvailable: isArabic ? 'غير متوفر' : 'Not available',
    };

    const feasibility = payload.feasibility ?? payload.result?.initialFeasibility;
    if (!feasibility) {
      return NextResponse.json(
        {
          error: isArabic
            ? 'لا توجد دراسة جدوى لتصديرها.'
            : 'No feasibility study to export.',
        },
        { status: 400 },
      );
    }

    const query = cleanText(payload.result?.query, copy.notAvailable);
    const safeMarket = cleanText(payload.safeMarket, copy.notAvailable);
    const generatedAt = cleanText(payload.generatedAt, formatGeneratedAt(uiLang));

    const verdictLabel = cleanText(feasibility.verdictLabel, copy.notAvailable);
    const verdictSummary = cleanText(feasibility.verdictSummary, copy.notAvailable);
    const keyAssumptions = safeStringArray(feasibility.keyAssumptions);
    const breakEvenTimeline = cleanText(feasibility.breakEvenTimeline, copy.notAvailable);
    const breakEvenSummary = cleanText(feasibility.breakEvenSummary, copy.notAvailable);
    const startupTotalRange = cleanText(
      feasibility.startupCosts?.totalRange,
      copy.notAvailable,
    );
    const startupItems = safeCostItems(feasibility.startupCosts?.items);
    const monthlyTotalRange = cleanText(
      feasibility.monthlyCosts?.totalRange,
      copy.notAvailable,
    );
    const monthlyItems = safeCostItems(feasibility.monthlyCosts?.items);
    const revenueScenarios = safeRevenueScenarios(feasibility.revenueScenarios);
    const financialRisks = safeStringArray(feasibility.financialRisks);
    const recommendedAction = cleanText(
      feasibility.recommendedAction,
      copy.notAvailable,
    );
    const disclaimer = cleanText(feasibility.disclaimer, copy.notAvailable);

    const page1 = `
      <section class="hero-card">
        <div class="hero-copy">
          <div class="eyebrow">${escapeHtml(copy.heroEyebrow)}</div>
          <h1>${escapeHtml(copy.heroTitle)}</h1>
          <div class="hero-idea">${escapeHtml(query)}</div>
          <div class="hero-subtitle">${escapeHtml(copy.heroSubtitle)}</div>
          <div class="hero-meta">${escapeHtml(copy.generatedOn)} ${escapeHtml(generatedAt)}</div>
        </div>
        <div class="hero-side">
          <span class="pill label-pill">${escapeHtml(verdictLabel)}</span>
        </div>
      </section>

      <div class="overview-grid single-row-gap">
        ${renderSimpleInfoCard(copy.marketLabel, safeMarket)}
        ${renderSimpleInfoCard(copy.breakEven, breakEvenTimeline)}
      </div>

      <div class="hero-grid">
        ${renderCard(
          copy.verdict,
          `<p>${escapeHtml(verdictSummary)}</p>`,
        )}
        ${renderCard(
          copy.breakEven,
          `<p>${escapeHtml(breakEvenSummary)}</p>`,
        )}
      </div>

      ${renderCard(copy.assumptions, renderBulletList(keyAssumptions, isArabic))}
    `;

    const page2 = `
      <div class="two-column-grid">
        ${renderCostColumn(
          copy.startupCosts,
          copy.startupTotal,
          startupTotalRange,
          startupItems,
        )}
        ${renderCostColumn(
          copy.monthlyCosts,
          copy.monthlyTotal,
          monthlyTotalRange,
          monthlyItems,
        )}
      </div>
    `;

    const page3 = `
      ${renderCard(copy.revenueScenarios, renderScenarioCards(revenueScenarios))}
      ${renderCard(copy.financialRisks, renderBulletList(financialRisks, isArabic))}
      ${renderCard(copy.recommendedAction, `<p>${escapeHtml(recommendedAction)}</p>`)}
      ${renderCard(copy.disclaimer, `<p>${escapeHtml(disclaimer)}</p>`)}
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
      font-size: 32px;
      line-height: 1.15;
      color: var(--brand);
    }

    .hero-idea {
      font-size: 17px;
      font-weight: 700;
      color: var(--brand);
      margin-bottom: 8px;
    }

    .hero-subtitle {
      color: #344054;
      margin-bottom: 8px;
    }

    .hero-meta {
      color: var(--muted);
      font-size: 12.5px;
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
      min-width: 92px;
      max-width: 148px;
      text-align: center;
    }

    .total-pill {
      background: #edf3fb;
      border-color: #d4deeb;
      color: var(--text);
      margin-bottom: 10px;
    }

    .small-pill {
      background: #edf3fb;
      border-color: #d4deeb;
      color: var(--text);
      padding: 6px 10px;
      font-size: 12px;
    }

    .overview-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 10px;
    }

    .single-row-gap {
      margin-bottom: 10px;
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

    .hero-grid,
    .two-column-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 10px;
    }

    .section-card {
      background: var(--card);
      padding: 16px 18px;
      margin-bottom: 10px;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .section-card h2 {
      margin: 0;
      font-size: 16px;
      line-height: 1.3;
      color: var(--brand);
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

    .section-subtitle {
      color: var(--muted);
      font-size: 12.5px;
      margin-bottom: 6px;
      font-weight: 600;
      text-align: ${isArabic ? 'right' : 'left'};
    }

    .section-body p {
      margin: 0;
      white-space: pre-wrap;
      color: #344054;
    }

    .muted { color: var(--muted); }

    .bullet-list {
      margin: 0;
      padding-${isArabic ? 'right' : 'left'}: 18px;
    }

    .bullet-list li { margin-bottom: 6px; }

    .stack {
      display: grid;
      gap: 10px;
    }

    .sub-card {
      border: 1px solid var(--line);
      border-radius: 18px;
      padding: 12px;
      background: var(--card-soft);
    }

    .sub-card-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      margin-bottom: 8px;
      direction: ${isArabic ? 'rtl' : 'ltr'};
    }

    .sub-card-title {
      font-weight: 700;
      color: var(--text);
      text-align: ${isArabic ? 'right' : 'left'};
      flex: 1;
      line-height: 1.35;
    }

    .sub-card-note,
    .scenario-note {
      color: var(--muted);
      font-size: 12.5px;
      line-height: 1.55;
    }

    .scenario-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }

    .scenario-card {
      border: 1px solid var(--line);
      border-radius: 18px;
      padding: 14px;
      background: var(--card-soft);
      text-align: center;
    }

    .scenario-title {
      font-size: 17px;
      font-weight: 800;
      color: var(--brand);
      margin-bottom: 10px;
      line-height: 1.25;
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
    pageCaption: copy.pageCaption,
    logoDataUrl,
    bodyHtml: page1,
    footerText: isArabic ? 'الصفحة 1 من 3' : 'Page 1 of 3',
  })}
  ${renderPageShell({
    pageCaption: copy.pageCaption,
    logoDataUrl,
    bodyHtml: page2,
    footerText: isArabic ? 'الصفحة 2 من 3' : 'Page 2 of 3',
  })}
  ${renderPageShell({
    pageCaption: copy.pageCaption,
    logoDataUrl,
    bodyHtml: page3,
    footerText: isArabic ? 'الصفحة 3 من 3' : 'Page 3 of 3',
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
        'Content-Disposition': 'attachment; filename="madixo-feasibility.pdf"',
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
