export type UiLanguage = 'ar' | 'en';

type PdfLikeDocument = {
  setFont?: (family: string, style?: string) => void;
};

function normalizePdfText(text: string) {
  return (text || '')
    .normalize('NFKC')
    .replace(/\u00A0/g, ' ')
    .replace(/[\u2010-\u2015]/g, '-')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u2022/g, '-')
    .replace(/\u2265/g, '>=')
    .replace(/\u2264/g, '<=')
    .replace(/\u00AD/g, '')
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export async function ensureMadixoPdfFont(
  doc: PdfLikeDocument,
  language: UiLanguage
) {
  if (language !== 'ar') return;

  doc.setFont?.('Cairo', 'normal');
}

export function preparePdfTextForExport(text: string, language: UiLanguage) {
  const normalized = normalizePdfText(text);

  if (language !== 'ar') {
    return normalized.replace(/[^\x20-\x7E\n]/g, ' ');
  }

  return normalized;
}
