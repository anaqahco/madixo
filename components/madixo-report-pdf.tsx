type UiLanguage = 'ar' | 'en';

type PdfCopy = Record<string, string>;

type ScoreRow = {
  key: string;
  label: string;
  score: number;
  note: string;
};

type MadixoReportPdfProps = {
  result: unknown;
  copy: PdfCopy;
  uiLang: UiLanguage;
  safeMarket: string;
  safeCustomer: string;
  safeLabel: string;
  scoreBreakdownRows: ScoreRow[];
  generatedAt: string;
};

export default function MadixoReportPdf(props: MadixoReportPdfProps) {
  void props;
  return null;
}
