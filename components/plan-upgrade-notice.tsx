'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';

type Tone = 'amber' | 'blue' | 'slate';

type Props = {
  title: string;
  description: string;
  ctaHref: string;
  ctaLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  tone?: Tone;
  autoScroll?: boolean;
  scrollOffset?: number;
};

const toneClasses: Record<Tone, { wrapper: string; button: string; secondary: string }> = {
  amber: {
    wrapper: 'border-[#F59E0B]/30 bg-[#FFFBEB] text-[#92400E]',
    button: 'border-[#92400E] bg-[#92400E] text-white hover:opacity-90',
    secondary: 'border-[#92400E]/30 bg-transparent text-[#92400E] hover:bg-[#FDE68A]/20',
  },
  blue: {
    wrapper: 'border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]',
    button: 'border-[#1D4ED8] bg-[#1D4ED8] text-white hover:opacity-90',
    secondary: 'border-[#93C5FD] bg-white text-[#1D4ED8] hover:bg-[#DBEAFE]',
  },
  slate: {
    wrapper: 'border-[#E5E7EB] bg-[#F9FAFB] text-[#374151]',
    button: 'border-[#111827] bg-[#111827] text-white hover:opacity-90',
    secondary: 'border-[#E5E7EB] bg-white text-[#111827] hover:bg-[#F3F4F6]',
  },
};

export default function PlanUpgradeNotice({
  title,
  description,
  ctaHref,
  ctaLabel,
  secondaryHref,
  secondaryLabel,
  tone = 'amber',
  autoScroll = true,
  scrollOffset = 20,
}: Props) {
  const styles = toneClasses[tone];
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!autoScroll) return;

    const frame = window.requestAnimationFrame(() => {
      const el = rootRef.current;
      if (!el) return;

      const top = el.getBoundingClientRect().top + window.scrollY - scrollOffset;
      window.scrollTo({
        top: Math.max(top, 0),
        behavior: 'smooth',
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [autoScroll, scrollOffset, title, description]);

  return (
    <div
      ref={rootRef}
      className={`scroll-mt-6 rounded-[24px] border px-5 py-4 ${styles.wrapper}`}
    >
      <h3 className="text-base font-bold">{title}</h3>
      <p className="mt-2 text-sm leading-7">{description}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          href={ctaHref}
          className={`inline-flex rounded-full border px-4 py-2 text-sm font-semibold transition ${styles.button}`}
        >
          {ctaLabel}
        </Link>
        {secondaryHref && secondaryLabel ? (
          <Link
            href={secondaryHref}
            className={`inline-flex rounded-full border px-4 py-2 text-sm font-semibold transition ${styles.secondary}`}
          >
            {secondaryLabel}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
