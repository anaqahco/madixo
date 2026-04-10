import type { Metadata } from 'next';
import LegalPageTemplate from '@/components/legal/legal-page-template';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'Read the terms that govern use of Madixo, including subscriptions, acceptable use, billing, and account responsibilities.',
  alternates: {
    canonical: '/terms',
  },
};

const COPY = {
  en: {
    dir: 'ltr',
    eyebrow: 'Terms of Service',
    title: 'The terms that govern use of Madixo.',
    description:
      'These terms explain how Madixo may be used, how subscriptions and billing work, what users are responsible for, and the limits that apply to the service and its outputs.',
    lastUpdatedLabel: 'Last updated',
    lastUpdatedValue: 'April 10, 2026',
    sections: [
      {
        title: '1. Using Madixo',
        body:
          'Madixo is a digital software service for opportunity analysis, validation workflows, and decision support. By creating an account, accessing the service, or purchasing a paid plan, you agree to use Madixo only for lawful business or research purposes and in accordance with these terms.',
      },
      {
        title: '2. Accounts and access',
        body:
          'You are responsible for the accuracy of the information you provide, the security of your login credentials, and any activity that happens through your account. You must not share access in a way that bypasses plan limits, abuse the service, or attempt to access parts of the platform you are not authorized to use.',
        bullets: [
          'Keep your login details confidential and notify us if you suspect unauthorized access.',
          'Use the service only within the limits of your current plan, workspace, and feature access.',
          'Do not attempt to reverse engineer, disrupt, scrape, overload, or interfere with the platform.',
        ],
      },
      {
        title: '3. Subscriptions, billing, and renewals',
        body:
          'Paid access to Madixo may be offered as monthly or annual subscriptions, usage-based entitlements, or feature-limited plans. When you subscribe, you authorize us and our payment partners to charge the selected price, taxes where applicable, and any renewed billing period unless you cancel before renewal.',
        bullets: [
          'Prices, plan limits, and included features may change prospectively with notice where required.',
          'If a payment fails, we may retry collection, suspend premium access, or downgrade the account until payment is resolved.',
          'Canceling a subscription stops future renewals, but does not automatically create a refund for amounts already charged.',
        ],
      },
      {
        title: '4. AI outputs and decision responsibility',
        body:
          'Madixo may generate analyses, summaries, feasibility-style views, scoring, or recommendations using automated systems and third-party models. These outputs are intended to support judgment, not replace professional, financial, legal, tax, or investment advice. You remain fully responsible for verifying assumptions, market facts, compliance requirements, and final business decisions.',
      },
      {
        title: '5. Acceptable use',
        body:
          'You may not use Madixo to violate laws, infringe intellectual property rights, submit unlawful or harmful material, exploit the service for fraud or spam, or attempt to resell, mirror, or misuse the platform in ways not expressly permitted by your plan or a separate written agreement.',
      },
      {
        title: '6. Intellectual property and content',
        body:
          'Madixo and its software, branding, design, workflows, and platform materials remain our property or the property of our licensors. You retain rights in the information and business inputs you submit, subject to the licenses necessary for us to operate, secure, improve, and support the service. You are responsible for ensuring you have the right to upload or process any content you provide.',
      },
      {
        title: '7. Suspension, termination, and service changes',
        body:
          'We may update, modify, suspend, or discontinue parts of the service from time to time. We may also suspend or terminate access if these terms are violated, if payments remain unresolved, if use creates risk to the platform or others, or if required by law or a service provider. Where reasonably possible, we aim to provide notice before material suspension or discontinuation.',
      },
      {
        title: '8. Disclaimers and limitation of liability',
        body:
          'Madixo is provided on an “as available” basis. To the maximum extent permitted by law, we disclaim warranties of uninterrupted availability, error-free operation, or fitness for a particular purpose. To the maximum extent permitted by law, we are not liable for indirect, incidental, consequential, special, or lost-profit damages arising from use of the service, and our aggregate liability is limited to the amounts paid by you for Madixo during the 12 months preceding the claim.',
      },
    ] as const,
    contactTitle: 'Questions about these terms?',
    contactBody:
      'If you need clarification about subscriptions, billing, account access, or these terms, contact Madixo at support@madixo.ai.',
    contactCta: 'Email support',
    secondaryCta: 'Back to home',
    pricingCta: 'See plans',
  },
  ar: {
    dir: 'rtl',
    eyebrow: 'شروط الاستخدام',
    title: 'الشروط التي تنظّم استخدام Madixo.',
    description:
      'توضح هذه الشروط طريقة استخدام Madixo، وكيف تعمل الاشتراكات والفوترة، وما المسؤوليات التي تقع على المستخدم، وما الحدود التي تنطبق على الخدمة ومخرجاتها.',
    lastUpdatedLabel: 'آخر تحديث',
    lastUpdatedValue: '10 أبريل 2026',
    sections: [
      {
        title: '1. استخدام Madixo',
        body:
          'Madixo خدمة برمجية رقمية لتحليل الفرص، وإدارة مسارات التحقق، ودعم اتخاذ القرار. عند إنشاء حساب أو استخدام الخدمة أو شراء باقة مدفوعة، فأنت توافق على استخدام Madixo فقط للأغراض المشروعة المتعلقة بالأعمال أو البحث، ووفقًا لهذه الشروط.',
      },
      {
        title: '2. الحسابات والوصول',
        body:
          'أنت مسؤول عن صحة المعلومات التي تقدمها، وعن حماية بيانات الدخول الخاصة بك، وعن أي نشاط يتم من خلال حسابك. ولا يجوز لك مشاركة الوصول بطريقة تتجاوز حدود الباقة، أو إساءة استخدام الخدمة، أو محاولة الوصول إلى أجزاء غير مصرح لك بها.',
        bullets: [
          'حافظ على سرية بيانات الدخول وأبلغنا إذا شككت بوجود وصول غير مصرح به.',
          'استخدم الخدمة ضمن حدود باقتك الحالية ومساحة العمل والميزات المتاحة لك.',
          'لا تحاول عكس هندسة المنصة أو تعطيلها أو جمع بياناتها آليًا أو إثقالها أو التدخل في عملها.',
        ],
      },
      {
        title: '3. الاشتراكات والفوترة والتجديد',
        body:
          'قد يقدّم Madixo الوصول المدفوع على شكل اشتراك شهري أو سنوي أو حدود استخدام أو باقات تختلف بحسب الميزات. وعند الاشتراك، فأنت تفوضنا وتفوض شركاء الدفع لدينا بتحصيل السعر المحدد والضرائب المطبقة وأي فترة تجديد لاحقة ما لم تقم بالإلغاء قبل التجديد.',
        bullets: [
          'قد تتغير الأسعار أو حدود الباقات أو الميزات المشمولة مستقبلًا مع إشعار عندما يكون ذلك مطلوبًا.',
          'إذا فشلت عملية الدفع، فقد نعيد محاولة التحصيل أو نعلق الوصول المدفوع أو نعيد الحساب إلى مستوى أقل حتى تتم معالجة الدفع.',
          'إلغاء الاشتراك يوقف التجديدات المستقبلية، لكنه لا يعني تلقائيًا استرجاع المبالغ التي تم تحصيلها بالفعل.',
        ],
      },
      {
        title: '4. مخرجات الذكاء الاصطناعي ومسؤولية القرار',
        body:
          'قد يولد Madixo تحليلات أو ملخصات أو قراءات أولية أو درجات أو توصيات باستخدام أنظمة آلية ونماذج خارجية. هذه المخرجات صممت لدعم الحكم البشري، وليست بديلًا عن الاستشارة المهنية أو المالية أو القانونية أو الضريبية أو الاستثمارية. وتبقى مسؤوليتك الكاملة التحقق من الفرضيات وحقائق السوق والالتزامات النظامية والقرار النهائي.',
      },
      {
        title: '5. الاستخدام المقبول',
        body:
          'لا يجوز لك استخدام Madixo بما يخالف الأنظمة أو ينتهك حقوق الملكية الفكرية أو يرسل مواد غير مشروعة أو ضارة أو يستغل الخدمة في الاحتيال أو الرسائل المزعجة أو إعادة البيع أو النسخ أو أي استخدام غير مصرح به صراحة في باقتك أو في اتفاق كتابي منفصل.',
      },
      {
        title: '6. الملكية الفكرية والمحتوى',
        body:
          'تبقى ملكية Madixo وبرمجياته وعلامته وتصميمه وتدفقاته ومواد المنصة لنا أو للجهات المرخصة لنا. وتحتفظ بحقوقك في المعلومات والمدخلات التي ترسلها، وذلك مع منحنا التراخيص اللازمة لتشغيل الخدمة وتأمينها وتحسينها ودعمها. وأنت مسؤول عن التأكد من حقك في رفع أو معالجة أي محتوى تقدمه.',
      },
      {
        title: '7. التعليق أو الإنهاء أو تغيير الخدمة',
        body:
          'قد نقوم بتحديث أو تعديل أو تعليق أو إيقاف أجزاء من الخدمة من وقت لآخر. كما قد نعلق أو ننهي الوصول إذا تم خرق هذه الشروط، أو إذا بقيت المدفوعات غير محلولة، أو إذا كان الاستخدام يسبب خطرًا على المنصة أو على الآخرين، أو إذا كان ذلك مطلوبًا نظامًا أو من أحد مزودي الخدمة. وعندما يكون ذلك ممكنًا بشكل معقول، نحاول تقديم إشعار قبل أي تعليق أو إيقاف جوهري.',
      },
      {
        title: '8. إخلاء المسؤولية وحدودها',
        body:
          'يتم تقديم Madixo على أساس “كما هو متاح”. وبالحد الأقصى الذي يسمح به النظام، فإننا لا نضمن التوفر المستمر أو العمل الخالي من الأخطاء أو الملاءمة لغرض معين. وبالحد الأقصى الذي يسمح به النظام، لا نتحمل المسؤولية عن الأضرار غير المباشرة أو العرضية أو التبعية أو الخاصة أو خسارة الأرباح الناتجة عن استخدام الخدمة، ويقتصر إجمالي مسؤوليتنا على المبالغ التي دفعتها فعليًا مقابل Madixo خلال الاثني عشر شهرًا السابقة للمطالبة.',
      },
    ] as const,
    contactTitle: 'هل لديك سؤال حول هذه الشروط؟',
    contactBody:
      'إذا احتجت توضيحًا بخصوص الاشتراك أو الفوترة أو الوصول للحساب أو هذه الشروط، تواصل مع Madixo عبر support@madixo.ai.',
    contactCta: 'راسل الدعم',
    secondaryCta: 'العودة للرئيسية',
    pricingCta: 'شاهد الباقات',
  },
} as const;

export default function TermsPage() {
  return <LegalPageTemplate copy={COPY} />;
}
