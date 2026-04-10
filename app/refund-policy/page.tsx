import type { Metadata } from 'next';
import LegalPageTemplate from '@/components/legal/legal-page-template';

export const metadata: Metadata = {
  title: 'Refund Policy',
  description:
    'Review Madixo refund terms for purchases, subscription renewals, cancellations, and billing support.',
  alternates: {
    canonical: '/refund-policy',
  },
};

const COPY = {
  en: {
    dir: 'ltr',
    eyebrow: 'Refund Policy',
    title: 'How refunds, renewals, and cancellations work.',
    description:
      'This policy explains the refund window for Madixo purchases and subscription renewals, how cancellations work, and how to contact support for billing help.',
    lastUpdatedLabel: 'Last updated',
    lastUpdatedValue: 'April 10, 2026',
    sections: [
      {
        title: '1. 14-day refund window',
        body:
          'Customers may request a refund within 14 days of the initial purchase date, or within 14 days of the most recent subscription renewal date.',
      },
      {
        title: '2. Subscription renewals',
        body:
          'For subscription plans, the 14-day refund window applies from the date of the latest renewal charge. If a refund request is approved within that window, the affected charge will be refunded to the original payment method where possible.',
      },
      {
        title: '3. Cancellations',
        body:
          'You may cancel your subscription at any time to prevent future renewals. Cancellation stops the next billing cycle and does not by itself automatically refund a charge that has already been processed. If you want a refund for a recent charge, please submit a refund request within the 14-day window described above.',
      },
      {
        title: '4. Billing errors and duplicate charges',
        body:
          'If you believe you were charged in error or charged more than once for the same purchase, contact us as soon as possible so we can review the transaction and help resolve the issue quickly.',
      },
      {
        title: '5. How to request a refund',
        body:
          'To request a refund, email support@madixo.ai and include the billing email address used for the purchase, the transaction date, the amount charged, and a short explanation. Refund requests are reviewed in line with the billing and refund rules that apply to purchases processed for Madixo.',
      },
      {
        title: '6. Processing time',
        body:
          'If a refund is approved, it is generally returned to the original payment method where possible. Processing times can vary depending on the payment provider or bank.',
      },
    ] as const,
    contactTitle: 'Need help with a charge?',
    contactBody:
      'For billing questions, renewal timing, duplicate charges, or refund requests, contact support@madixo.ai and include the billing email used for your account.',
    contactCta: 'Email billing support',
    secondaryCta: 'Back to home',
    pricingCta: 'See plans',
  },
  ar: {
    dir: 'rtl',
    eyebrow: 'سياسة الاسترجاع',
    title: 'كيف يعمل الاسترجاع والتجديد والإلغاء.',
    description:
      'توضح هذه السياسة مدة الاسترجاع لعمليات الشراء وتجديدات الاشتراك في Madixo، وكيف يعمل الإلغاء، وكيف تتواصل مع الدعم بخصوص الفوترة.',
    lastUpdatedLabel: 'آخر تحديث',
    lastUpdatedValue: '10 أبريل 2026',
    sections: [
      {
        title: '1. مدة الاسترجاع: 14 يومًا',
        body:
          'يمكن للعميل طلب استرجاع خلال 14 يومًا من تاريخ أول عملية شراء، أو خلال 14 يومًا من تاريخ آخر تجديد للاشتراك.',
      },
      {
        title: '2. تجديدات الاشتراك',
        body:
          'في الباقات الاشتراكية، تُحسب مدة الاسترجاع البالغة 14 يومًا من تاريخ آخر عملية تجديد تم خصمها. وإذا تمت الموافقة على طلب الاسترجاع داخل هذه المدة، فسيتم رد المبلغ إلى وسيلة الدفع الأصلية متى كان ذلك ممكنًا.',
      },
      {
        title: '3. الإلغاء',
        body:
          'يمكنك إلغاء اشتراكك في أي وقت لمنع التجديدات القادمة. الإلغاء يوقف دورة الفوترة التالية، لكنه لا يعني تلقائيًا استرجاع عملية تم خصمها بالفعل. إذا كنت تريد استرجاع خصم حديث، فيجب تقديم طلب الاسترجاع خلال مدة 14 يومًا الموضحة أعلاه.',
      },
      {
        title: '4. أخطاء الفوترة والخصومات المكررة',
        body:
          'إذا كنت تعتقد أنه تم الخصم بالخطأ أو تم الخصم أكثر من مرة لنفس العملية، فتواصل معنا بأسرع وقت ممكن حتى نراجع العملية ونساعد في حل المشكلة بسرعة.',
      },
      {
        title: '5. طريقة طلب الاسترجاع',
        body:
          'لطلب استرجاع، راسل support@madixo.ai واذكر البريد المستخدم في الفوترة، وتاريخ العملية، والمبلغ الذي تم خصمه، وشرحًا مختصرًا. تتم مراجعة طلبات الاسترجاع وفق قواعد الفوترة والاسترجاع المطبقة على عمليات الشراء الخاصة بـ Madixo.',
      },
      {
        title: '6. مدة المعالجة',
        body:
          'إذا تمت الموافقة على الاسترجاع، فعادة يتم رد المبلغ إلى وسيلة الدفع الأصلية متى كان ذلك ممكنًا. وقد تختلف مدة ظهور المبلغ حسب جهة الدفع أو البنك.',
      },
    ] as const,
    contactTitle: 'هل تحتاج مساعدة بخصوص عملية خصم؟',
    contactBody:
      'للأسئلة المتعلقة بالفوترة أو توقيت التجديد أو الخصومات المكررة أو طلبات الاسترجاع، تواصل مع support@madixo.ai واذكر البريد المستخدم في الفوترة.',
    contactCta: 'راسل دعم الفوترة',
    secondaryCta: 'العودة للرئيسية',
    pricingCta: 'شاهد الباقات',
  },
} as const;

export default function RefundPolicyPage() {
  return <LegalPageTemplate copy={COPY} />;
}
