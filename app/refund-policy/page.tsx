import type { Metadata } from 'next';
import LegalPageTemplate from '@/components/legal/legal-page-template';

export const metadata: Metadata = {
  title: 'Refund Policy',
  description:
    'Review Madixo refund terms for subscriptions, renewals, billing errors, cancellation timing, and support requests.',
  alternates: {
    canonical: '/refund-policy',
  },
};

const COPY = {
  en: {
    dir: 'ltr',
    eyebrow: 'Refund Policy',
    title: 'How cancellations, renewals, and refunds are handled.',
    description:
      'This policy explains when Madixo charges are typically refundable, how subscription cancellations work, and how billing issues or duplicate charges should be reported.',
    lastUpdatedLabel: 'Last updated',
    lastUpdatedValue: 'April 10, 2026',
    sections: [
      {
        title: '1. General rule',
        body:
          'Because Madixo is a digital software service that provides immediate access to premium features, workspaces, reports, and related functionality, charges are generally non-refundable once a paid billing period has started, except where required by law or where we expressly approve a refund under this policy.',
      },
      {
        title: '2. Subscription cancellations',
        body:
          'You may cancel your subscription at any time before the next renewal date. When you cancel, premium access typically continues until the end of the already-paid billing period, and the subscription will not renew again unless reactivated.',
      },
      {
        title: '3. Billing errors and duplicate charges',
        body:
          'If you believe you were charged in error, charged more than once for the same purchase, or experienced a clear billing malfunction, contact us as soon as possible. If we confirm an error, we will correct the charge and issue an appropriate refund or credit.',
      },
      {
        title: '4. First-time purchase review',
        body:
          'For an initial paid subscription purchase, we may review refund requests submitted within 7 days of the first charge when there is a material technical problem that prevented normal use of premium features and our team could not resolve it within a reasonable time. Approval is discretionary unless a refund is required by law.',
      },
      {
        title: '5. Non-refundable situations',
        body:
          'Refunds are generally not provided for partial billing periods, unused time remaining after cancellation, change of mind after substantial use, failure to cancel before renewal, or dissatisfaction based only on business outcomes, market conditions, or decisions made using AI-generated analyses or recommendations.',
      },
      {
        title: '6. Chargebacks and account protection',
        body:
          'Before filing a chargeback with your bank or card issuer, please contact us so we can review the issue first. Where a chargeback is filed, we may suspend or restrict affected accounts while the matter is investigated and resolved.',
      },
      {
        title: '7. How to request a refund',
        body:
          'To request a refund review, email support@madixo.ai and include the account email address, the date of the charge, the amount, and a short explanation of the issue. We may request additional information to verify the payment and assess the request fairly.',
      },
    ] as const,
    contactTitle: 'Need help with a charge?',
    contactBody:
      'For billing questions, renewal timing, duplicate charges, or refund reviews, contact support@madixo.ai and include the billing email used for your account.',
    contactCta: 'Email billing support',
    secondaryCta: 'Back to home',
    pricingCta: 'See plans',
  },
  ar: {
    dir: 'rtl',
    eyebrow: 'سياسة الاسترجاع',
    title: 'كيف يتم التعامل مع الإلغاء والتجديد والاسترجاع.',
    description:
      'توضح هذه السياسة متى تكون رسوم Madixo قابلة للاسترجاع عادة، وكيف يعمل إلغاء الاشتراك، وكيف يجب الإبلاغ عن مشاكل الفوترة أو التكرار في الخصم.',
    lastUpdatedLabel: 'آخر تحديث',
    lastUpdatedValue: '10 أبريل 2026',
    sections: [
      {
        title: '1. القاعدة العامة',
        body:
          'نظرًا لأن Madixo خدمة برمجية رقمية تمنح وصولًا فوريًا إلى الميزات المدفوعة ومساحات العمل والتقارير والوظائف المرتبطة بها، فإن الرسوم لا تكون قابلة للاسترجاع عادة بعد بدء فترة الفوترة المدفوعة، إلا عندما يكون الاسترجاع مطلوبًا نظامًا أو عندما نوافق عليه صراحة وفق هذه السياسة.',
      },
      {
        title: '2. إلغاء الاشتراك',
        body:
          'يمكنك إلغاء اشتراكك في أي وقت قبل تاريخ التجديد القادم. وعند الإلغاء، يستمر الوصول المدفوع عادة حتى نهاية الفترة التي تم دفعها بالفعل، ثم يتوقف التجديد التلقائي ما لم يتم تفعيله مرة أخرى.',
      },
      {
        title: '3. أخطاء الفوترة والخصومات المكررة',
        body:
          'إذا كنت تعتقد أنه تم خصم مبلغ بالخطأ، أو تم الخصم أكثر من مرة لنفس العملية، أو حدث خلل واضح في الفوترة، فتواصل معنا بأسرع وقت ممكن. وإذا تأكدنا من وجود خطأ، فسنصحح العملية ونصدر الاسترجاع أو الرصيد المناسب.',
      },
      {
        title: '4. مراجعة أول عملية شراء مدفوعة',
        body:
          'بالنسبة لأول اشتراك مدفوع، قد نراجع طلبات الاسترجاع المقدمة خلال 7 أيام من أول عملية خصم عندما توجد مشكلة تقنية جوهرية منعت الاستخدام الطبيعي للميزات المدفوعة ولم يتمكن فريقنا من حلها خلال مدة معقولة. وتبقى الموافقة خاضعة لتقديرنا ما لم يكن الاسترجاع مطلوبًا نظامًا.',
      },
      {
        title: '5. الحالات غير القابلة للاسترجاع',
        body:
          'لا يتم عادة تقديم استرجاع عن الفترات الجزئية من الفوترة، أو الوقت غير المستخدم بعد الإلغاء، أو التراجع بعد استخدام جوهري، أو عدم الإلغاء قبل التجديد، أو عدم الرضا المبني فقط على نتائج الأعمال أو ظروف السوق أو القرارات التي اتخذت بالاعتماد على تحليلات أو توصيات مولدة بالذكاء الاصطناعي.',
      },
      {
        title: '6. الاعتراضات البنكية وحماية الحساب',
        body:
          'قبل فتح اعتراض بنكي أو لدى جهة إصدار البطاقة، يرجى التواصل معنا أولًا حتى نراجع المشكلة مباشرة. وعند فتح اعتراض بنكي، قد نقوم بتعليق أو تقييد الحسابات المتأثرة إلى أن يتم التحقيق في الموضوع وحله.',
      },
      {
        title: '7. طريقة طلب مراجعة الاسترجاع',
        body:
          'لطلب مراجعة استرجاع، راسل support@madixo.ai واذكر البريد المستخدم في الحساب وتاريخ الخصم والمبلغ وشرحًا مختصرًا للمشكلة. وقد نطلب معلومات إضافية للتحقق من الدفع وتقييم الطلب بشكل عادل.',
      },
    ] as const,
    contactTitle: 'هل تحتاج مساعدة بخصوص عملية خصم؟',
    contactBody:
      'للأسئلة المتعلقة بالفوترة أو توقيت التجديد أو الخصومات المكررة أو مراجعة طلب استرجاع، تواصل مع support@madixo.ai واذكر البريد المرتبط بالفوترة في حسابك.',
    contactCta: 'راسل دعم الفوترة',
    secondaryCta: 'العودة للرئيسية',
    pricingCta: 'شاهد الباقات',
  },
} as const;

export default function RefundPolicyPage() {
  return <LegalPageTemplate copy={COPY} />;
}
