import type { Metadata } from 'next';
import LegalPageTemplate from '@/components/legal/legal-page-template';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Learn what information Madixo collects, how it is used, how long it is kept, and the choices users have about their data.',
  alternates: {
    canonical: '/privacy',
  },
};

const COPY = {
  en: {
    dir: 'ltr',
    eyebrow: 'Privacy Policy',
    title: 'How Madixo collects, uses, and protects data.',
    description:
      'This policy explains what information we collect when you use Madixo, how we use it to operate the service, and the choices you have regarding your account, communications, and data.',
    lastUpdatedLabel: 'Last updated',
    lastUpdatedValue: 'April 10, 2026',
    sections: [
      {
        title: '1. Information we collect',
        body:
          'We may collect account information, contact details, authentication data, payment and subscription information, usage and device information, support communications, and the business inputs you submit inside the platform, such as opportunity descriptions, markets, customers, notes, and validation records.',
      },
      {
        title: '2. How we use information',
        body:
          'We use information to create and secure accounts, provide the service, process payments, support subscriptions, generate reports and product features, improve reliability and performance, respond to support requests, send important service communications, detect misuse, and comply with legal obligations.',
        bullets: [
          'To operate analysis, validation, comparison, and export features inside Madixo.',
          'To manage plan limits, billing access, and account security.',
          'To understand product usage trends and improve the experience over time.',
        ],
      },
      {
        title: '3. Sharing and service providers',
        body:
          'We may share limited information with trusted service providers who help us operate Madixo, such as hosting, authentication, analytics, payments, email delivery, customer support, and AI model infrastructure. We may also disclose information if required by law, to protect rights and safety, or as part of a reorganization, merger, financing, or asset transfer.',
      },
      {
        title: '4. Cookies and similar technologies',
        body:
          'Madixo may use cookies or similar technologies for authentication, language preferences, session continuity, security, basic analytics, and remembering product settings. Browser tools may allow you to control cookies, but disabling them can affect how parts of the service work.',
      },
      {
        title: '5. Data retention',
        body:
          'We keep data for as long as needed to provide the service, maintain account history, meet legal or tax obligations, resolve disputes, enforce agreements, or improve the product. If you close your account or request deletion where available, we may retain limited information where required for fraud prevention, compliance, recordkeeping, or legitimate operational needs.',
      },
      {
        title: '6. Security and international processing',
        body:
          'We take reasonable technical and organizational measures to protect data, but no system is perfectly secure. Because Madixo may use global infrastructure and service providers, information may be processed in countries other than your own. Where required, we rely on contractual and operational safeguards designed to protect personal information.',
      },
      {
        title: '7. Your choices and rights',
        body:
          'Depending on your location, you may have rights to access, correct, delete, export, or object to certain uses of your personal information. You may also update account information, cancel subscriptions, or contact us about privacy questions. We may need to verify your identity before processing certain requests.',
      },
      {
        title: '8. Children and policy updates',
        body:
          'Madixo is intended for founders, professionals, and business teams and is not directed to children. We may update this privacy policy from time to time. When we make material changes, we may revise the “last updated” date and take additional steps where appropriate.',
      },
    ] as const,
    contactTitle: 'Privacy questions or requests',
    contactBody:
      'If you have a privacy question, want to request access or correction, or need help related to your account data, contact us at support@madixo.ai.',
    contactCta: 'Email privacy support',
    secondaryCta: 'Back to home',
    pricingCta: 'See plans',
  },
  ar: {
    dir: 'rtl',
    eyebrow: 'سياسة الخصوصية',
    title: 'كيف يجمع Madixo البيانات ويستخدمها ويحميها.',
    description:
      'توضح هذه السياسة نوع المعلومات التي نجمعها عند استخدام Madixo، وكيف نستخدمها لتشغيل الخدمة، وما الخيارات المتاحة لك فيما يتعلق بالحساب والاتصالات والبيانات.',
    lastUpdatedLabel: 'آخر تحديث',
    lastUpdatedValue: '10 أبريل 2026',
    sections: [
      {
        title: '1. المعلومات التي نجمعها',
        body:
          'قد نجمع معلومات الحساب وبيانات التواصل وبيانات المصادقة ومعلومات الدفع والاشتراك ومعلومات الاستخدام والجهاز ومراسلات الدعم والمدخلات التجارية التي ترسلها داخل المنصة، مثل وصف الفرص والأسواق والعملاء والملاحظات وسجلات التحقق.',
      },
      {
        title: '2. كيف نستخدم المعلومات',
        body:
          'نستخدم المعلومات لإنشاء الحسابات وتأمينها وتشغيل الخدمة ومعالجة المدفوعات ودعم الاشتراكات وتوليد التقارير والميزات وتحسين الاعتمادية والأداء والرد على طلبات الدعم وإرسال الرسائل الخدمية المهمة واكتشاف سوء الاستخدام والالتزام بالمتطلبات النظامية.',
        bullets: [
          'لتشغيل ميزات التحليل والتحقق والمقارنة والتصدير داخل Madixo.',
          'لإدارة حدود الباقات والوصول المدفوع وأمان الحساب.',
          'لفهم أنماط استخدام المنتج وتحسين التجربة مع الوقت.',
        ],
      },
      {
        title: '3. مشاركة البيانات ومزودو الخدمة',
        body:
          'قد نشارك قدرًا محدودًا من المعلومات مع مزودي خدمة موثوقين يساعدوننا في تشغيل Madixo، مثل الاستضافة والمصادقة والتحليلات والمدفوعات والبريد الإلكتروني والدعم والبنية التحتية لنماذج الذكاء الاصطناعي. كما قد نفصح عن المعلومات إذا طُلب ذلك نظامًا أو لحماية الحقوق والسلامة أو كجزء من إعادة تنظيم أو اندماج أو تمويل أو نقل أصول.',
      },
      {
        title: '4. ملفات تعريف الارتباط والتقنيات المشابهة',
        body:
          'قد يستخدم Madixo ملفات تعريف الارتباط أو تقنيات مشابهة للمصادقة وتفضيلات اللغة واستمرار الجلسة والأمان والتحليلات الأساسية وتذكر إعدادات المنتج. ويمكنك استخدام أدوات المتصفح للتحكم في هذه الملفات، لكن تعطيلها قد يؤثر في عمل بعض أجزاء الخدمة.',
      },
      {
        title: '5. مدة الاحتفاظ بالبيانات',
        body:
          'نحتفظ بالبيانات طالما كان ذلك لازمًا لتقديم الخدمة والحفاظ على سجل الحساب والوفاء بالالتزامات النظامية أو الضريبية وحل النزاعات وتنفيذ الاتفاقيات وتحسين المنتج. وإذا أغلقت حسابك أو طلبت الحذف عندما يكون ذلك متاحًا، فقد نحتفظ بقدر محدود من المعلومات عند الحاجة لمنع الاحتيال أو الامتثال أو حفظ السجلات أو لأغراض تشغيلية مشروعة.',
      },
      {
        title: '6. الأمان والمعالجة الدولية',
        body:
          'نتخذ تدابير تقنية وتنظيمية معقولة لحماية البيانات، لكن لا يوجد نظام آمن بالكامل. وبما أن Madixo قد يستخدم بنية تحتية ومزودي خدمة عالميين، فقد تتم معالجة المعلومات في دول أخرى غير دولتك. وعندما يكون ذلك مطلوبًا، نعتمد على ضمانات تعاقدية وتشغيلية تهدف إلى حماية المعلومات الشخصية.',
      },
      {
        title: '7. خياراتك وحقوقك',
        body:
          'بحسب موقعك الجغرافي، قد تكون لك حقوق في الوصول إلى معلوماتك الشخصية أو تصحيحها أو حذفها أو تصديرها أو الاعتراض على بعض أوجه استخدامها. كما يمكنك تحديث معلومات الحساب أو إلغاء الاشتراك أو التواصل معنا بخصوص أسئلة الخصوصية. وقد نحتاج إلى التحقق من هويتك قبل معالجة بعض الطلبات.',
      },
      {
        title: '8. الأطفال وتحديثات السياسة',
        body:
          'Madixo موجه للمؤسسين والمهنيين وفرق الأعمال وليس مخصصًا للأطفال. وقد نقوم بتحديث سياسة الخصوصية من وقت لآخر. وعند إجراء تغييرات جوهرية، قد نحدّث تاريخ “آخر تحديث” ونتخذ خطوات إضافية عند الاقتضاء.',
      },
    ] as const,
    contactTitle: 'أسئلة أو طلبات متعلقة بالخصوصية',
    contactBody:
      'إذا كان لديك سؤال متعلق بالخصوصية، أو أردت طلب وصول أو تصحيح، أو احتجت مساعدة بخصوص بيانات حسابك، تواصل معنا عبر support@madixo.ai.',
    contactCta: 'راسل فريق الخصوصية',
    secondaryCta: 'العودة للرئيسية',
    pricingCta: 'شاهد الباقات',
  },
} as const;

export default function PrivacyPage() {
  return <LegalPageTemplate copy={COPY} />;
}
