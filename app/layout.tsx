import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { Geist, Geist_Mono } from 'next/font/google';
import { UiLanguageProvider } from '@/components/ui-language-provider';
import { GoogleAnalytics } from '@/components/google-analytics';
import { getDirection, getServerUiLanguageFromCookie } from '@/lib/ui-language';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const siteUrl =
  process.env.APP_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://madixo.ai';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Madixo',
    template: '%s | Madixo',
  },
  description:
    'Madixo is an AI opportunity analysis workspace for evaluating business ideas, generating early feasibility views, validating market demand, and identifying the clearest next move.',
  applicationName: 'Madixo',
  keywords: [
    'Madixo',
    'AI opportunity analysis',
    'business idea validation',
    'startup decision tool',
    'opportunity scoring',
    'market validation',
    'feasibility study',
    'idea testing',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: siteUrl,
    siteName: 'Madixo',
    title: 'Madixo',
    description:
      'Analyze opportunities, generate early feasibility views, validate ideas, and move toward a clearer next move.',
    images: [
      {
        url: '/brand/madixo-logo.png',
        width: 1200,
        height: 630,
        alt: 'Madixo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Madixo',
    description:
      'Analyze opportunities, generate early feasibility views, validate ideas, and move toward a clearer next move.',
    images: ['/brand/madixo-logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  category: 'business',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const uiLang = getServerUiLanguageFromCookie(cookieStore);
  const dir = getDirection(uiLang);

  return (
    <html lang={uiLang} dir={dir} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <GoogleAnalytics />
        <UiLanguageProvider initialUiLang={uiLang}>{children}</UiLanguageProvider>
      </body>
    </html>
  );
}
