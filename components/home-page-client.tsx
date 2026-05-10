'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { createClient as createSupabaseClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { useUiLanguageState } from '@/components/ui-language-provider';
import {
  BLOG_POSTS,
  COMPARISONS,
  USE_CASES,
  localizeText,
} from '@/lib/blog';
import { type UiLanguage } from '@/lib/ui-language';

const EXAMPLES = {
  en: {
    idea: 'AI operations assistant for multi-location service businesses',
    market: 'Saudi Arabia, United States, United Kingdom, GCC, Europe',
    customer: 'Service businesses with multiple locations or 5 to 50 staff',
  },
  ar: {
    idea: 'مساعد ذكاء اصطناعي لتشغيل الشركات الخدمية متعددة الفروع',
    market: 'السعودية، الولايات المتحدة، المملكة المتحدة، الخليج، أوروبا',
    customer: 'شركات خدمية لديها عدة فروع أو من 5 إلى 50 موظفًا',
  },
} as const;

const INPUT_PLACEHOLDERS = {
  en: {
    idea: 'Example: AI receptionist for clinics, compliance tool for logistics teams, inventory software for small retail chains',
    customer:
      'Example: clinic operators, logistics managers, small retail chains, internal sales teams',
  },
  ar: {
    idea: 'مثال: مساعد ذكاء اصطناعي لعيادات التجميل، نظام مخزون لسلاسل التجزئة الصغيرة، أداة امتثال لفرق الخدمات اللوجستية',
    customer: 'مثال: مشغلو العيادات، مديرو العمليات، سلاسل التجزئة الصغيرة، فرق المبيعات الداخلية',
  },
} as const;

const UI_COPY = {
  en: {
    dir: 'ltr',
    heroEyebrow: 'The Idea Lab',
    heroTitle: 'Put your idea under the microscope before you bet everything on it.',
    heroDescription:
      'Most ideas die not because they are bad — but because no one ran the tests. Madixo is your idea lab: structured analysis, feasibility diagnostics, evidence collection, and a clear verdict on what to do next.',
    primaryCta: 'Run Your First Test',
    secondaryCta: 'See How The Lab Works',
    quickLinksLabel: 'Quick links',
    quickLinkPricing: 'Plans & pricing',
    quickLinkUseCases: 'Use cases',
    quickLinkArticle: 'How to validate an idea',
    quickLinkCompare: 'Compare alternatives',
    radarLabel: 'Submit the specimen',
    radarDescription:
      'Describe the idea you want to examine, define the target market and customer, then let the lab run the full diagnostic.',
    businessIdea: 'The Idea',
    targetMarket: 'Target Market',
    targetCustomer: 'Target Customer',
    analyzeOpportunity: 'Start the Diagnostic',

    summary1: 'Analyze',
    summary2: 'Test',
    summary3: 'Capture evidence',
    summary4: 'Decide',

    trustEyebrow: 'Why the lab',
    trustTitle: 'Because a good idea deserves a proper examination, not a guess.',
    trustDescription:
      'Most founders skip the lab and go straight to building. Madixo makes sure your idea gets tested before your money does.',
    trustCard1Title: 'From hypothesis to feasibility in minutes',
    trustCard1Description:
      'Get a structured diagnostic report, then generate a feasibility scan — startup costs, revenue scenarios, break-even direction — all inside one lab.',
    trustCard2Title: 'From gut feeling to hard evidence',
    trustCard2Description:
      'Log interviews, objections, and market signals. Build a real case file for your idea instead of relying on what you think the market wants.',
    trustCard3Title: 'From analysis paralysis to a clear verdict',
    trustCard3Description:
      'The lab reads the evidence and tells you exactly what to change, what to test next, and when to pivot or stop.',
    builtForTitle: 'Built for',
    builtFor1: 'First-time founders testing a hypothesis',
    builtFor2: 'Operators who need proof before scaling',
    builtFor3: 'Teams that want evidence before commitment',

    pricingEyebrow: 'Plans',
    pricingTitle: 'Simple plans. Pay for the depth you need.',
    pricingDescription:
      'Start free to test the workflow. Upgrade when you need feasibility studies, deeper validation, and unlimited analysis.',
    plan1Name: 'Quick Scan',
    plan1Tag: 'Free entry',
    plan1Description:
      'Run a first diagnostic on your idea before committing to deeper lab work.',
    plan1Feature1: 'Opportunity diagnostic',
    plan1Feature2: 'Structured lab report',
    plan1Feature3: 'PDF export',
    plan1Feature4: 'Good for first-pass screening',
    plan2Name: 'Full Lab',
    plan2Tag: 'Best value',
    plan2Description:
      'Full lab access: diagnostics, feasibility scans, evidence collection, and a clear verdict on your next move.',
    plan2Feature1: 'Everything in Quick Scan',
    plan2Feature2: 'Early feasibility scan',
    plan2Feature3: 'Testing plan and evidence workspace',
    plan2Feature4: 'Verdict, decision view, and next move',
    plan3Name: 'Team Lab',
    plan3Tag: 'For teams',
    plan3Description:
      'Shared lab access for teams that need to examine multiple opportunities together.',
    plan3Feature1: 'Everything in Full Lab, including feasibility',
    plan3Feature2: 'Built for repeat internal usage',
    plan3Feature3: 'Better fit for team review flow',
    plan3Feature4: 'Ready for future collaboration layer',
    mostRecommended: 'Most recommended',

    valueEyebrow: 'Lab results',
    valueTitle: 'A complete diagnostic workflow, not just a report.',
    valueDescription:
      'Each idea in Madixo moves through diagnostics, feasibility scans, evidence collection, and a clear verdict — all inside one lab.',
    value1Title: 'Diagnostic report',
    value1Description:
      'Demand, competition, monetization, risks, and your best first-customer direction — examined and structured in one report.',
    value2Title: 'Feasibility scan',
    value2Description:
      'Startup costs, monthly expenses, revenue scenarios, and a break-even estimate — before you invest a dollar.',
    value3Title: 'Evidence workspace',
    value3Description:
      'Turn the report into a testing plan. Log interviews, objections, and market signals. Extract insights from real evidence.',
    value4Title: 'The verdict engine',
    value4Description:
      'What to change, what to test next, what offer to make, and what to measure — based on what the market actually told you.',

    signalsEyebrow: 'Built for real work',
    signalsTitle: 'Designed for a real workflow.',
    signalsDescription:
      'Madixo is not a toy. It is built around the signals that matter when you are making real business decisions.',
    signal1: 'Full Arabic and English experience',
    signal2: 'Saved reports and feasibility studies',
    signal3: 'Evidence logging and synthesis',
    signal4: 'Decision view and next move engine',
    signal5: 'Shareable PDF exports',
    signal6: 'One workspace from idea to decision',

    chatgptEyebrow: 'The honest question',
    chatgptTitle: 'Why not just ask ChatGPT?',
    chatgptDescription: 'Fair question. Here is the lab report on that.',
    chatgptCard1Title: 'ChatGPT gives you an opinion. The lab gives you a workflow.',
    chatgptCard1Description:
      'A single AI response cannot replace structured diagnostics, feasibility scans, evidence logging, and decision tracking inside one workspace.',
    chatgptCard2Title: 'ChatGPT forgets. The lab keeps records.',
    chatgptCard2Description:
      'Every interview, objection, and market signal you log stays in your case file — building a body of evidence over time, not vanishing after a chat.',
    chatgptCard3Title: 'ChatGPT agrees with you. The lab challenges you.',
    chatgptCard3Description:
      'The validation workspace pushes you to stress-test assumptions and face the evidence, not just confirm what you already believe.',

    contentEyebrow: 'Explore content',
    contentTitle: 'Explore the knowledge hub without leaving the main path.',
    contentDescription:
      'Read one useful article, one practical use case, and one comparison, then continue back to the product when you are ready.',
    articlesTitle: 'Articles',
    articlesCta: 'Open article',
    useCasesTitle: 'Use Cases',
    useCasesCta: 'Open use case',
    comparisonsTitle: 'Comparisons',
    comparisonsCta: 'Open comparison',
    browseAllArticles: 'Browse all articles',
    browseAllUseCases: 'Browse all use cases',
    browseAllComparisons: 'Browse all comparisons',


    startPathEyebrow: 'Choose your starting path',
    startPathTitle: 'Start from the page that matches what you need now.',
    startPathDescription:
      'Some visitors need a practical article, some need a use case, and some want to compare Madixo before they commit. These shortcuts make the next step clearer.',
    startPathArticlesTitle: 'Start with articles',
    startPathArticlesDescription:
      'Read practical guidance on validating an idea, testing demand, and understanding feasibility before you commit.',
    startPathUseCasesTitle: 'Start with use cases',
    startPathUseCasesDescription:
      'See how Madixo can be used for service businesses, founders, agencies, and product teams.',
    startPathComparisonsTitle: 'Start with comparisons',
    startPathComparisonsDescription:
      'Compare Madixo with common alternatives like spreadsheets, generic research notes, or asking ChatGPT only.',
    startPathPricingTitle: 'Start with pricing',
    startPathPricingDescription:
      'Understand which workflow depth each plan opens before you choose a subscription.',
    startPathCta: 'Open path',
    featuredPathsEyebrow: 'Best starting points',
    featuredPathsTitle: 'Useful pages to open from the homepage right now.',
    featuredPathsDescription:
      'This section surfaces the most useful article, use case, and comparison pages so the homepage sends visitors deeper into the right journey.',
    featuredArticlesEyebrow: 'Top articles',
    featuredUseCasesEyebrow: 'Top use cases',
    featuredComparisonsEyebrow: 'Top comparisons',

    howMadixoWorks: 'How The Lab Works',
    howMadixoWorksDescription:
      'Four stages. From raw hypothesis to a verdict you can act on.',
    step1Title: 'Submit the specimen',
    step1Description:
      'Describe your idea, target market, and customer. The lab starts from your context, not a generic template.',
    step2Title: 'Run the diagnostics',
    step2Description:
      'Madixo analyzes demand, competition, monetization, and risk. Then it generates a structured report and an early feasibility scan.',
    step3Title: 'Collect the evidence',
    step3Description:
      'Turn the report into a practical testing plan. Log interviews, objections, and real market signals in one workspace.',
    step4Title: 'Read the verdict',
    step4Description:
      'See the full picture: what the evidence says, what to change, what to test next, and whether to continue, pivot, or stop.',

    closingTitle: 'Every great business started as an untested idea.',
    closingDescription:
      'Put yours under the microscope. Enter your idea and get your first diagnostic in minutes.',
    signedOutNotice: 'You have been signed out successfully.',
    authRequiredToAnalyze:
      'Create your account or log in first to start the opportunity analysis.',
  },
  ar: {
    dir: 'rtl',
    heroEyebrow: 'مختبر الأفكار',
    heroTitle: 'حط فكرتك تحت المجهر قبل ما تراهن عليها بكل شيء.',
    heroDescription:
      'أغلب الأفكار ما تموت لأنها سيئة — تموت لأن أحد ما فحصها. Madixo مختبرك: تحليل منظم، فحص جدوى، جمع أدلة، وحكم واضح على الخطوة التالية.',
    primaryCta: 'شغّل أول فحص',
    secondaryCta: 'شاهد كيف يعمل المختبر',
    quickLinksLabel: 'روابط سريعة',
    quickLinkPricing: 'الباقات والأسعار',
    quickLinkUseCases: 'حالات الاستخدام',
    quickLinkArticle: 'كيف تختبر فكرتك',
    quickLinkCompare: 'قارن البدائل',
    radarLabel: 'قدّم العيّنة',
    radarDescription:
      'صف الفكرة اللي تبي تفحصها، وحدد السوق والعميل المستهدف، ثم خلّ المختبر يشتغل على الفحص الكامل.',
    businessIdea: 'الفكرة',
    targetMarket: 'السوق المستهدف',
    targetCustomer: 'العميل المستهدف',
    analyzeOpportunity: 'ابدأ الفحص',

    summary1: 'حلّل',
    summary2: 'جرّب',
    summary3: 'اجمع نتائج التجربة',
    summary4: 'قرّر',

    trustEyebrow: 'ليش المختبر',
    trustTitle: 'لأن الفكرة الجيدة تستاهل فحص حقيقي، مش مجرد إحساس.',
    trustDescription:
      'أغلب المؤسسين يتجاوزون المختبر ويروحون مباشرة للبناء. Madixo يتأكد إن فكرتك تنفحص قبل فلوسك.',
    trustCard1Title: 'من الفرضية إلى الجدوى في دقائق',
    trustCard1Description:
      'احصل على تقرير فحص منظم ثم فحص جدوى — تكاليف البداية، سيناريوهات الإيراد، اتجاه نقطة التعادل — كله داخل مختبر واحد.',
    trustCard2Title: 'من الإحساس إلى الأدلة الصلبة',
    trustCard2Description:
      'سجل المقابلات والاعتراضات وإشارات السوق. ابنِ ملف قضية حقيقي لفكرتك بدل ما تعتمد على اللي تتوقعه.',
    trustCard3Title: 'من شلل التحليل إلى حكم واضح',
    trustCard3Description:
      'المختبر يقرأ الأدلة ويقولك بالضبط وش تغيّر، وش تختبر، ومتى تعدّل أو توقف.',
    builtForTitle: 'مبني لـ',
    builtFor1: 'المؤسسين الجدد اللي يختبرون فرضية',
    builtFor2: 'المشغلين اللي يبون دليل قبل التوسع',
    builtFor3: 'الفرق اللي تبي أدلة قبل الالتزام',

    pricingEyebrow: 'الباقات',
    pricingTitle: 'باقات بسيطة. ادفع حسب عمق الفحص اللي تحتاجه.',
    pricingDescription:
      'ابدأ مجانًا وجرب المختبر. ارتقِ لما تحتاج فحوصات جدوى وجمع أدلة أعمق وتشخيصات بدون حدود.',
    plan1Name: 'فحص سريع',
    plan1Tag: 'دخول مجاني',
    plan1Description:
      'شغّل أول تشخيص على فكرتك قبل ما تدخل في فحص أعمق.',
    plan1Feature1: 'تشخيص الفرصة',
    plan1Feature2: 'تقرير مختبر منظم',
    plan1Feature3: 'تصدير PDF',
    plan1Feature4: 'مناسب للفرز الأولي للأفكار',
    plan2Name: 'المختبر الكامل',
    plan2Tag: 'الأكثر قيمة',
    plan2Description:
      'وصول كامل للمختبر: تشخيص، فحص جدوى، جمع أدلة، وحكم واضح على خطوتك التالية.',
    plan2Feature1: 'كل ما في الفحص السريع',
    plan2Feature2: 'فحص جدوى أولي',
    plan2Feature3: 'خطة اختبار ومساحة أدلة',
    plan2Feature4: 'الحكم ورؤية القرار والخطوة التالية',
    plan3Name: 'مختبر الفريق',
    plan3Tag: 'للفرق',
    plan3Description:
      'وصول مشترك للمختبر للفرق اللي تحتاج تفحص فرص متعددة مع بعض.',
    plan3Feature1: 'كل ما في المختبر الكامل بما فيه فحص الجدوى',
    plan3Feature2: 'أنسب للاستخدام الداخلي المتكرر',
    plan3Feature3: 'أنسب لمراجعة الفرص داخل الفريق',
    plan3Feature4: 'جاهز لاحقًا لطبقة تعاون أوسع',
    mostRecommended: 'الأكثر توصية',

    valueEyebrow: 'نتائج المختبر',
    valueTitle: 'مسار فحص كامل، مش مجرد تقرير.',
    valueDescription:
      'كل فكرة في Madixo تمر بالتشخيص وفحص الجدوى وجمع الأدلة وحكم واضح — كلها في مختبر واحد.',
    value1Title: 'تقرير تشخيصي',
    value1Description:
      'الطلب والمنافسة والربحية والمخاطر وأفضل عميل أول — مفحوصة ومنظمة في تقرير واحد.',
    value2Title: 'فحص الجدوى',
    value2Description:
      'تكاليف البداية والمصاريف الشهرية وسيناريوهات الإيراد ونقطة التعادل — قبل ما تستثمر ريال.',
    value3Title: 'مساحة الأدلة',
    value3Description:
      'حوّل التقرير لخطة اختبار. سجل المقابلات والاعتراضات وإشارات السوق. واستخرج خلاصات من أدلة حقيقية.',
    value4Title: 'محرك الحكم',
    value4Description:
      'وش تغيّر، وش تختبر، وش العرض الأنسب، وش تقيس — بناءً على اللي قاله السوق فعلاً.',

    signalsEyebrow: 'مبني للعمل الحقيقي',
    signalsTitle: 'مصمم لسير عمل حقيقي.',
    signalsDescription:
      'Madixo مش لعبة. مبني حول الإشارات اللي تهم لما تاخذ قرارات مشروع حقيقية.',
    signal1: 'تجربة عربية وإنجليزية كاملة',
    signal2: 'حفظ التقارير ودراسات الجدوى',
    signal3: 'تسجيل الأدلة وتلخيصها',
    signal4: 'رؤية القرار ومحرك الخطوة التالية',
    signal5: 'تصدير PDF قابل للمشاركة',
    signal6: 'مساحة عمل واحدة من الفكرة للقرار',

    chatgptEyebrow: 'السؤال الصريح',
    chatgptTitle: 'ليش ما أسأل ChatGPT وخلاص؟',
    chatgptDescription: 'سؤال عادل. هذا تقرير المختبر عن الموضوع.',
    chatgptCard1Title: 'ChatGPT يعطيك رأي. المختبر يعطيك مسار عمل.',
    chatgptCard1Description:
      'رد واحد من الذكاء الاصطناعي ما يقدر يحل محل تشخيص منظم وفحص جدوى وتوثيق أدلة ومتابعة القرار داخل مختبر واحد.',
    chatgptCard2Title: 'ChatGPT ينسى. المختبر يحفظ السجلات.',
    chatgptCard2Description:
      'كل مقابلة واعتراض وإشارة من السوق تسجلها تبقى في ملف القضية — تبني جسم أدلة مع الوقت بدل ما تضيع بعد محادثة.',
    chatgptCard3Title: 'ChatGPT يوافقك. المختبر يتحداك.',
    chatgptCard3Description:
      'مساحة التحقق تدفعك تختبر افتراضاتك وتواجه الأدلة، مش تأكد اللي تبي تسمعه.',

    contentEyebrow: 'مركز المحتوى',
    contentTitle: 'اكتشف المحتوى بدون أن يزاحم هدف الصفحة الرئيسي.',
    contentDescription:
      'مقال واحد مفيد، وحالة استخدام عملية، ومقارنة واضحة، ثم تستطيع العودة مباشرة إلى المنتج عندما تكون جاهزًا.',
    articlesTitle: 'المقالات',
    articlesCta: 'افتح المقال',
    useCasesTitle: 'حالات الاستخدام',
    useCasesCta: 'افتح الحالة',
    comparisonsTitle: 'المقارنات',
    comparisonsCta: 'افتح المقارنة',
    browseAllArticles: 'تصفح كل المقالات',
    browseAllUseCases: 'تصفح كل الحالات',
    browseAllComparisons: 'تصفح كل المقارنات',


    startPathEyebrow: 'اختر مسار البداية',
    startPathTitle: 'ابدأ من الصفحة الأقرب لما تحتاجه الآن.',
    startPathDescription:
      'بعض الزوار يحتاجون مقالًا عمليًا، وبعضهم يريد حالة استخدام، وبعضهم يريد مقارنة Madixo بالبدائل قبل اتخاذ القرار. هذه الروابط تختصر عليهم الطريق.',
    startPathArticlesTitle: 'ابدأ من المقالات',
    startPathArticlesDescription:
      'اقرأ شرحًا عمليًا عن اختبار الفكرة والطلب ودراسة الجدوى الأولية قبل أن تلتزم بالتنفيذ.',
    startPathUseCasesTitle: 'ابدأ من حالات الاستخدام',
    startPathUseCasesDescription:
      'شاهد كيف يمكن استخدام Madixo في الشركات الخدمية، ولدى المؤسسين الجدد، والوكالات، والفرق الصغيرة.',
    startPathComparisonsTitle: 'ابدأ من المقارنات',
    startPathComparisonsDescription:
      'قارن Madixo بالبدائل الشائعة مثل الجداول التقليدية، والملاحظات العامة، أو الاكتفاء بسؤال ChatGPT فقط.',
    startPathPricingTitle: 'ابدأ من الباقات',
    startPathPricingDescription:
      'افهم ما الذي يفتحه كل اشتراك وما عمق العمل المناسب لك قبل اختيار الباقة.',
    startPathCta: 'افتح المسار',
    featuredPathsEyebrow: 'أفضل نقاط البداية',
    featuredPathsTitle: 'صفحات مفيدة لتبدأ منها مباشرة من الصفحة الرئيسية.',
    featuredPathsDescription:
      'هذا القسم يبرز أفضل مقال، وأفضل حالة استخدام، وأفضل مقارنة حتى تدفع الصفحة الرئيسية الزائر إلى المسار الأنسب بدل التوقف عند التعريف فقط.',
    featuredArticlesEyebrow: 'مقالات مهمة',
    featuredUseCasesEyebrow: 'حالات مهمة',
    featuredComparisonsEyebrow: 'مقارنات مهمة',

    howMadixoWorks: 'كيف يعمل المختبر',
    howMadixoWorksDescription:
      'أربع مراحل. من فرضية خام إلى حكم تقدر تتصرف بناءً عليه.',
    step1Title: 'قدّم العيّنة',
    step1Description:
      'صف فكرتك والسوق والعميل المستهدف. المختبر يبدأ من سياقك، مش من قالب جاهز.',
    step2Title: 'شغّل الفحوصات',
    step2Description:
      'Madixo يحلل الطلب والمنافسة والربحية والمخاطر، ثم يبني لك تقرير تشخيصي وفحص جدوى أولي.',
    step3Title: 'اجمع الأدلة',
    step3Description:
      'حوّل التقرير لخطة اختبار عملية. سجل المقابلات والاعتراضات وإشارات السوق في مكان واحد.',
    step4Title: 'اقرأ الحكم',
    step4Description:
      'شف الصورة الكاملة: وش تقول الأدلة، وش تغيّر، وش تختبر، وهل تكمل أو تعدّل أو توقف.',

    closingTitle: 'كل مشروع ناجح بدأ كفكرة ما انفحصت.',
    closingDescription:
      'حط فكرتك تحت المجهر. أدخلها واحصل على أول تشخيص في دقائق.',
    signedOutNotice: 'تم تسجيل الخروج بنجاح.',
    authRequiredToAnalyze:
      'أنشئ حسابك أو سجّل الدخول أولًا لبدء تحليل الفرصة.',
  },
} as const;

type PricingCardProps = {
  name: string;
  tag: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  actionLabel: string;
  badgeLabel: string;
  onClick: () => void;
};

type DynamicContentCard = {
  sectionTitle: string;
  itemTitle: string;
  itemDescription: string;
  href: string;
  cta: string;
  browseLabel: string;
  browseHref: string;
};


const HOME_FAQ_COPY = {
  ar: {
    eyebrow: 'الأسئلة الشائعة',
    title: 'أسئلة شائعة قبل أن تبدأ في استخدام Madixo',
    description:
      'هذه الأسئلة السريعة تساعد الزائر على فهم ما يفعله Madixo، ومتى يكون مناسبًا، وما الذي يحدث بعد تحليل الفرصة.',
    items: [
      {
        question: 'وش هو Madixo بالضبط؟',
        answer:
          'Madixo مساحة عمل تاخذ فكرة مشروعك من مفهوم خام إلى قرار مبني على أدلة. يجمع بين تحليل الفرصة ودراسة الجدوى الأولية ومساحة التحقق والاختبار والخطوة التالية — كلها في مكان واحد.',
      },
      {
        question: 'هل Madixo مجرد مولد أفكار؟',
        answer:
          'لا. Madixo ما يولّد أفكار. يختبر الأفكار اللي عندك عبر تحليل منظم وتقييم جدوى وجمع أدلة ومتابعة القرار.',
      },
      {
        question: 'وش الفرق بينه وبين سؤال ChatGPT؟',
        answer:
          'ChatGPT يعطيك إجابة وحدة وتضيع. Madixo يحفظ تحليلك ويتتبع أدلتك مع الوقت ويبني دراسات جدوى ويساعدك تقرر هل تكمل أو تعدّل أو توقف — داخل مساحة عمل دائمة.',
      },
    ],
  },
  en: {
    eyebrow: 'FAQ',
    title: 'Common questions before you start using Madixo',
    description:
      'These quick questions help a new visitor understand what Madixo does, when it fits, and what happens after the initial opportunity analysis.',
    items: [
      {
        question: 'What exactly is Madixo?',
        answer:
          'Madixo is a workspace that takes your business idea from raw concept to validated decision. It combines opportunity analysis, early feasibility, a validation workspace for testing, and evidence-based next moves — all in one place.',
      },
      {
        question: 'Is Madixo just an idea generator?',
        answer:
          'No. Madixo does not generate ideas. It validates the ideas you already have through structured analysis, feasibility assessment, evidence capture, and decision tracking.',
      },
      {
        question: 'How is this different from asking ChatGPT?',
        answer:
          'ChatGPT gives you a one-time answer that disappears. Madixo saves your analysis, tracks your evidence over time, generates feasibility studies, and helps you decide whether to continue, pivot, or stop — inside a persistent workspace.',
      },
    ],
  },
} as const;


function PricingCard({
  name,
  tag,
  description,
  features,
  highlighted = false,
  actionLabel,
  badgeLabel,
  onClick,
}: PricingCardProps) {
  return (
    <div
      className={`rounded-[28px] border p-5 shadow-sm sm:p-6 ${
        highlighted
          ? 'border-[#111827] bg-[#111827] text-white'
          : 'border-[#D9E2F0] bg-[#F7F9FC] text-[#111827]'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-2xl font-semibold tracking-tight">{name}</h3>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            highlighted
              ? 'bg-white/15 text-white'
              : 'border border-[#D9E2F0] bg-[#F8FAFD] text-[#4B5563]'
          }`}
        >
          {tag}
        </span>
      </div>

      {highlighted ? (
        <div className="mt-4">
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#111827]">
            {badgeLabel}
          </span>
        </div>
      ) : null}

      <p
        className={`mt-5 text-base leading-8 ${
          highlighted ? 'text-white/85' : 'text-[#4B5563]'
        }`}
      >
        {description}
      </p>

      <div className="mt-6 space-y-3">
        {features.map((feature) => (
          <div
            key={feature}
            className={`rounded-2xl px-4 py-3 text-sm leading-7 ${
              highlighted ? 'bg-white/10 text-white' : 'bg-[#FAFBFD] text-[#374151]'
            }`}
          >
            {feature}
          </div>
        ))}
      </div>

      <button
        onClick={onClick}
        className={`mt-6 w-full rounded-full px-5 py-3 text-sm font-semibold transition ${
          highlighted
            ? 'bg-white text-[#111827] hover:opacity-90'
            : 'bg-[#111827] text-white hover:opacity-90'
        }`}
      >
        {actionLabel}
      </button>
    </div>
  );
}

function normalizeInputForValidation(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

function truncateText(value: string, maxLength = 140) {
  const clean = value.replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, maxLength).trimEnd()}…`;
}

function countLettersForValidation(value: string) {
  const matches = value.match(/[A-Za-z\u0600-\u06FF]/g);
  return matches ? matches.length : 0;
}

function looksLikePlaceholder(value: string) {
  const simplified = normalizeInputForValidation(value)
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[^a-z\u0600-\u06FF0-9\s]/g, '')
    .trim();

  if (!simplified) return true;

  const placeholders = new Set([
    '1',
    '11',
    '111',
    'test',
    'testing',
    'demo',
    'none',
    'na',
    'n a',
    'asdf',
    'qwerty',
    'xxx',
    'غير محدد',
    'غير معروف',
    'لا اعرف',
    'لا أعرف',
    'لا يوجد',
    'لايوجد',
    'غير موجود',
    'مافي',
    'ما فيه',
    'بدون',
    'شي',
    'شيء',
    'فكرة',
    'عميل',
    'سوق',
    'نفسه',
  ]);

  if (placeholders.has(simplified)) return true;
  if (/^\d+$/.test(simplified)) return true;

  const compact = simplified.replace(/\s+/g, '');
  if (compact.length >= 2 && new Set(compact).size === 1) return true;

  return false;
}

function looksLikeMeaningfulIdea(value: string) {
  const normalized = normalizeInputForValidation(value);
  if (!normalized) return false;
  if (looksLikePlaceholder(value)) return false;
  if (countLettersForValidation(normalized) < 2) return false;
  return true;
}

function looksLikeValidCustomerDescription(value: string) {
  const normalized = normalizeInputForValidation(value);
  if (!normalized) return false;
  if (looksLikePlaceholder(value)) return false;
  if (countLettersForValidation(normalized) < 2) return false;
  return true;
}

function looksTooGenericForMarket(value: string) {
  if (looksLikePlaceholder(value)) return true;
  if (countLettersForValidation(value) < 2) return true;
  return false;
}

function getFormValidationCopy(language: UiLanguage) {
  if (language === 'ar') {
    return {
      general:
        'أكمل الحقول الثلاثة بشكل واضح حتى يبدأ التحليل.',
      idea:
        'اكتب فكرة واضحة حتى لو كانت قصيرة. مثال: مساعد ذكاء اصطناعي للعيادات، نظام مخزون لسلاسل التجزئة الصغيرة، أو أداة امتثال لفرق الخدمات اللوجستية.',
      market: 'اكتب السوق بشكل واضح، مثل: الولايات المتحدة، الخليج، أوروبا، أو جنوب شرق آسيا.',
      customer:
        'اكتب العميل المستهدف بشكل مختصر وواضح، مثل: مشغلو العيادات، مديرو العمليات، أو الشركات الخدمية متعددة الفروع.',
    };
  }

  return {
    general: 'Complete the three fields clearly to start the analysis.',
    idea:
      'Write the idea clearly, even if it is short. Example: AI receptionist for clinics, compliance tool for logistics teams, inventory software for small retail chains.',
    market: 'Write the market clearly, such as the United States, GCC, Europe, or Southeast Asia.',
    customer:
      'Write the target customer clearly, even in a short way, such as clinic operators, logistics managers, internal sales teams, or multi-location service businesses.',
  };
}

function validateStartForm(
  values: { idea: string; market: string; customer: string },
  language: UiLanguage
) {
  const copy = getFormValidationCopy(language);

  const query = normalizeInputForValidation(values.idea);
  const market = normalizeInputForValidation(values.market);
  const customer = normalizeInputForValidation(values.customer);

  const errors: Partial<Record<'idea' | 'market' | 'customer', string>> = {};

  if (!looksLikeMeaningfulIdea(query)) {
    errors.idea = copy.idea;
  }

  if (!market || looksTooGenericForMarket(market)) {
    errors.market = copy.market;
  }

  if (!looksLikeValidCustomerDescription(customer)) {
    errors.customer = copy.customer;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    message: errors.idea || errors.market || errors.customer || copy.general,
  };
}

const FLASH_NOTICE_KEY = 'madixo_flash_notice_v1';

type HomepageSessionState = 'loading' | 'guest' | 'user';

function buildAnalyzeResultsPath(params: {
  query: string;
  market: string;
  customer: string;
  uiLang: UiLanguage;
}) {
  const search = new URLSearchParams();
  search.set('q', params.query);
  search.set('uiLang', params.uiLang);
  search.set('market', params.market);
  search.set('customer', params.customer);
  return `/results?${search.toString()}`;
}

function buildAnalyzeResumePath(params: {
  idea: string;
  market: string;
  customer: string;
}) {
  const search = new URLSearchParams();
  search.set('idea', params.idea);
  search.set('market', params.market);
  search.set('customer', params.customer);
  search.set('startAnalysis', '1');
  return `/?${search.toString()}`;
}

export default function HomePageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [preferredLanguage, setPreferredLanguage] = useUiLanguageState();
  const [idea, setIdea] = useState('');
  const [market, setMarket] = useState('');
  const [customer, setCustomer] = useState('');
  const [formError, setFormError] = useState('');
  const [flashNotice, setFlashNotice] = useState('');
  const [sessionState, setSessionState] = useState<HomepageSessionState>('loading');
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<'idea' | 'market' | 'customer', string>>>({});
  const formSectionRef = useRef<HTMLDivElement | null>(null);
  const ideaInputRef = useRef<HTMLInputElement | null>(null);
  const hasHydratedDraftFromUrlRef = useRef(false);
  const autoStartedAfterAuthRef = useRef(false);


  const copy = UI_COPY[preferredLanguage];
  const faqCopy = HOME_FAQ_COPY[preferredLanguage];
  const isArabic = preferredLanguage === 'ar';
  const inputAlignClass = isArabic ? 'text-right' : 'text-left';
  const sectionId = 'how-it-works';

  const featuredArticle = BLOG_POSTS.find((post) => post.featured) ?? BLOG_POSTS[0];
  const featuredUseCase = USE_CASES[0];
  const featuredComparison = COMPARISONS[0];

  const dynamicContentCards: DynamicContentCard[] = [
    {
      sectionTitle: copy.articlesTitle,
      itemTitle: localizeText(featuredArticle.title, preferredLanguage),
      itemDescription: truncateText(
        localizeText(featuredArticle.excerpt, preferredLanguage),
        preferredLanguage === 'ar' ? 110 : 130
      ),
      href: `/blog/${featuredArticle.slug}`,
      cta: copy.articlesCta,
      browseLabel: copy.browseAllArticles,
      browseHref: '/blog',
    },
    {
      sectionTitle: copy.useCasesTitle,
      itemTitle: localizeText(featuredUseCase.title, preferredLanguage),
      itemDescription: truncateText(
        localizeText(featuredUseCase.summary, preferredLanguage),
        preferredLanguage === 'ar' ? 110 : 130
      ),
      href: `/use-cases/${featuredUseCase.slug}`,
      cta: copy.useCasesCta,
      browseLabel: copy.browseAllUseCases,
      browseHref: '/use-cases',
    },
    {
      sectionTitle: copy.comparisonsTitle,
      itemTitle: localizeText(featuredComparison.title, preferredLanguage),
      itemDescription: truncateText(
        localizeText(featuredComparison.summary, preferredLanguage),
        preferredLanguage === 'ar' ? 110 : 130
      ),
      href: `/compare-to/${featuredComparison.slug}`,
      cta: copy.comparisonsCta,
      browseLabel: copy.browseAllComparisons,
      browseHref: '/compare-to',
    },
  ];

  const steps = [
    const query = idea.trim();
    const targetMarket = market.trim();
    const targetCustomer = customer.trim();

    const validation = validateStartForm(
      {
        idea: query,
        market: targetMarket,
        customer: targetCustomer,
      },
      preferredLanguage
    );

    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      setFormError(validation.message);
      return;
    }

    setFieldErrors({});
    setFormError('');

    let hasAuthenticatedUser = sessionState === 'user';

    if (!hasAuthenticatedUser) {
      try {
        const supabase = createSupabaseClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        hasAuthenticatedUser = Boolean(user);
        setSessionState(user ? 'user' : 'guest');
      } catch {
        hasAuthenticatedUser = false;
        setSessionState('guest');
      }
    }

    if (!hasAuthenticatedUser) {
      const nextPath = buildAnalyzeResumePath({
        idea: query,
        market: targetMarket,
        customer: targetCustomer,
      });

      const loginParams = new URLSearchParams();
      loginParams.set('mode', 'signup');
      loginParams.set('next', nextPath);
      loginParams.set('message', copy.authRequiredToAnalyze);

      router.push(`/login?${loginParams.toString()}`);
      return;
    }

    router.push(
      buildAnalyzeResultsPath({
        query,
        market: targetMarket,
        customer: targetCustomer,
        uiLang: preferredLanguage,
      })
    );
  };

  const secondaryHref = `#${sectionId}`;

  const scrollToIdeaForm = () => {
    formSectionRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });

    window.setTimeout(() => {
      ideaInputRef.current?.focus();
    }, 250);
  };

  const steps = [
    { number: 1, title: copy.step1Title, description: copy.step1Description },
    { number: 2, title: copy.step2Title, description: copy.step2Description },
    { number: 3, title: copy.step3Title, description: copy.step3Description },
    { number: 4, title: copy.step4Title, description: copy.step4Description },
  ];

  const trustCards = [
    { title: copy.trustCard1Title, description: copy.trustCard1Description },
    { title: copy.trustCard2Title, description: copy.trustCard2Description },
    { title: copy.trustCard3Title, description: copy.trustCard3Description },
  ];

  const fitItems = [copy.builtFor1, copy.builtFor2, copy.builtFor3];

  const valueCards = [
    { title: copy.value1Title, description: copy.value1Description },
    { title: copy.value2Title, description: copy.value2Description },
    { title: copy.value3Title, description: copy.value3Description },
    { title: copy.value4Title, description: copy.value4Description },
  ];

  useEffect(() => {
    if (hasHydratedDraftFromUrlRef.current) return;

    const ideaFromQuery = searchParams.get('idea')?.trim() || '';
    const marketFromQuery = searchParams.get('market')?.trim() || '';
    const customerFromQuery = searchParams.get('customer')?.trim() || '';

    if (ideaFromQuery) setIdea(ideaFromQuery);
    if (marketFromQuery) setMarket(marketFromQuery);
    if (customerFromQuery) setCustomer(customerFromQuery);

    hasHydratedDraftFromUrlRef.current = true;
  }, [searchParams]);

  useEffect(() => {
    const supabase = createSupabaseClient();
    let mounted = true;

    const applyUserState = (hasUser: boolean) => {
      if (!mounted) return;
      setSessionState(hasUser ? 'user' : 'guest');
    };

    supabase.auth
      .getUser()
      .then((result: { data: { user: unknown | null }; error: unknown | null }) => {
        if (!mounted) return;
        applyUserState(!result.error && Boolean(result.data.user));
      })
      .catch(() => {
        if (!mounted) return;
        setSessionState('guest');
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: unknown, session: { user?: unknown } | null) => {
        applyUserState(Boolean(session?.user));
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const shouldStartAnalysis = searchParams.get('startAnalysis') === '1';

    if (!shouldStartAnalysis || sessionState !== 'user' || autoStartedAfterAuthRef.current) {
      return;
    }

    const query = (searchParams.get('idea') || '').trim();
    const targetMarket = (searchParams.get('market') || '').trim();
    const targetCustomer = (searchParams.get('customer') || '').trim();

    if (!query || !targetMarket || !targetCustomer) {
      return;
    }

    autoStartedAfterAuthRef.current = true;

    router.replace(
      buildAnalyzeResultsPath({
        query,
        market: targetMarket,
        customer: targetCustomer,
        uiLang: preferredLanguage,
      })
    );
  }, [preferredLanguage, router, searchParams, sessionState]);


  useEffect(() => {
    const noticeFromQuery = searchParams.get('notice')?.trim() || '';
    const messageFromQuery = searchParams.get('message')?.trim() || '';

    const clearFlashParamsFromUrl = () => {
      try {
        const nextUrl = new URL(window.location.href);
        nextUrl.searchParams.delete('notice');
        nextUrl.searchParams.delete('message');
        const nextSearch = nextUrl.searchParams.toString();
        const nextHref = `${nextUrl.pathname}${nextSearch ? `?${nextSearch}` : ''}${nextUrl.hash}`;
        window.history.replaceState({}, '', nextHref);
      } catch {
        // ignore URL state failures
      }
    };

    if (noticeFromQuery === 'signed_out') {
      setFlashNotice(copy.signedOutNotice);

      try {
        window.sessionStorage.removeItem(FLASH_NOTICE_KEY);
      } catch {
        // ignore storage failures
      }

      clearFlashParamsFromUrl();
      return;
    }

    if (messageFromQuery) {
      setFlashNotice(messageFromQuery);
      clearFlashParamsFromUrl();
      return;
    }

    try {
      const raw = window.sessionStorage.getItem(FLASH_NOTICE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw) as {
        message?: string;
        savedAt?: number;
      };

      const message = typeof parsed.message === 'string' ? parsed.message.trim() : '';
      const savedAt = typeof parsed.savedAt === 'number' ? parsed.savedAt : 0;

      if (!message) {
        window.sessionStorage.removeItem(FLASH_NOTICE_KEY);
        return;
      }

      if (savedAt && Date.now() - savedAt > 1000 * 60 * 3) {
        window.sessionStorage.removeItem(FLASH_NOTICE_KEY);
        return;
      }

      setFlashNotice(message);
      window.sessionStorage.removeItem(FLASH_NOTICE_KEY);
    } catch {
      // ignore storage failures
    }
  }, [copy.signedOutNotice, searchParams]);

  useEffect(() => {
    if (!flashNotice) return;

    const timeout = window.setTimeout(() => {
      setFlashNotice('');
    }, 5000);

    return () => window.clearTimeout(timeout);
  }, [flashNotice]);

  const pricingPlans = [
    {
      name: copy.plan1Name,
      tag: copy.plan1Tag,
      description: copy.plan1Description,
      features: [
        copy.plan1Feature1,
        copy.plan1Feature2,
        copy.plan1Feature3,
        copy.plan1Feature4,
      ],
      highlighted: false,
    },
    {
      name: copy.plan2Name,
      tag: copy.plan2Tag,
      description: copy.plan2Description,
      features: [
        copy.plan2Feature1,
        copy.plan2Feature2,
        copy.plan2Feature3,
        copy.plan2Feature4,
      ],
      highlighted: true,
    },
    {
      name: copy.plan3Name,
      tag: copy.plan3Tag,
      description: copy.plan3Description,
      features: [
        copy.plan3Feature1,
        copy.plan3Feature2,
        copy.plan3Feature3,
        copy.plan3Feature4,
      ],
      highlighted: false,
    },
  ];

  return (
    <main dir={copy.dir} className="min-h-screen bg-[#FAFAFB] text-[#111827]">
      <section className="px-4 pt-4 sm:px-6 sm:pt-6 md:pt-8">
        <SiteHeader
          uiLang={preferredLanguage}
          onLanguageChange={setPreferredLanguage}
          logo={
            <Image
              src="/brand/madixo-logo.png"
              alt="Madixo"
              width={220}
              height={56}
              priority
              className="h-auto w-[170px] md:w-[220px]"
            />
          }
        />
      </section>

      {flashNotice ? (
        <section className="px-4 pt-4 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <div
              className={`flex items-start justify-between gap-3 rounded-[22px] border border-[#BBF7D0] bg-[#F0FDF4] px-5 py-4 text-sm font-medium text-[#166534] shadow-sm ${
                isArabic ? 'text-right' : 'text-left'
              }`}
              role="status"
              aria-live="polite"
            >
              <p className="leading-7">{flashNotice}</p>
              <button
                type="button"
                onClick={() => setFlashNotice('')}
                className="shrink-0 rounded-full border border-[#BBF7D0] bg-white px-3 py-1 text-xs font-semibold text-[#166534] transition hover:bg-[#DCFCE7]"
              >
                {isArabic ? 'إغلاق' : 'Dismiss'}
              </button>
            </div>
          </div>
        </section>
      ) : null}

      <section className="mx-auto flex max-w-6xl flex-col items-center px-4 pb-12 pt-8 text-center sm:px-6 sm:pb-14 sm:pt-10 md:pt-12">
        <span className="rounded-full border border-[#D9E2F0] bg-[#F8FAFD] px-4 py-2 text-sm font-semibold text-[#4B5563] shadow-sm">
          {copy.heroEyebrow}
        </span>

        <h1 className="mt-5 max-w-4xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:mt-6 md:text-6xl">
          {copy.heroTitle}
        </h1>

        <p className="mt-6 max-w-3xl text-base leading-7 text-[#4B5563] md:text-lg md:leading-8">
          {copy.heroDescription}
        </p>

        <div className="mt-8 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-4">
          <button
            onClick={handleAnalyze}
            className="cursor-pointer rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 w-full sm:w-auto"
          >
            {copy.primaryCta}
          </button>

          <a
            href={secondaryHref}
            className="rounded-full border border-[#D9E2F0] bg-[#F8FAFD] px-6 py-3 text-sm font-semibold text-[#111827] transition hover:bg-[#EEF3F9] w-full sm:w-auto"
          >
            {copy.secondaryCta}
          </a>
        </div>
      </section>

        <div
          ref={formSectionRef}
          className="mt-12 w-full max-w-4xl rounded-[24px] border border-[#D9E2F0] bg-[#F7F9FC] p-4 shadow-sm sm:p-6 md:mt-14 md:rounded-[28px] md:p-8"
        >
          <p className="text-sm font-medium text-[#6B7280]">{copy.radarLabel}</p>
          <p className="mt-3 text-sm leading-7 text-[#4B5563]">{copy.radarDescription}</p>

          <div className={`mt-6 grid gap-4 md:grid-cols-1 ${inputAlignClass}`}>
            <div>
              <label className="mb-2 block text-sm font-medium text-[#374151]">
                {copy.businessIdea}
              </label>
              <input
                ref={ideaInputRef}
                type="text"
                value={idea}
                onChange={(e) => {
                  setIdea(e.target.value);
                  if (fieldErrors.idea) {
                    setFieldErrors((current) => ({ ...current, idea: undefined }));
                  }
                  if (formError) setFormError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAnalyze();
                }}
                className={`w-full rounded-xl border bg-white px-4 py-4 text-base text-[#111827] outline-none placeholder:text-[#9CA3AF] ${
                  fieldErrors.idea ? 'border-[#EF4444]' : 'border-[#E5E7EB]'
                } ${inputAlignClass}`}
                placeholder={isArabic ? INPUT_PLACEHOLDERS.ar.idea : INPUT_PLACEHOLDERS.en.idea}
              />
              {fieldErrors.idea ? (
                <p className="mt-2 text-sm text-[#DC2626]">{fieldErrors.idea}</p>
              ) : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#374151]">
                {copy.targetMarket}
              </label>
              <input
                type="text"
                value={market}
                onChange={(e) => {
                  setMarket(e.target.value);
                  if (fieldErrors.market) {
                    setFieldErrors((current) => ({ ...current, market: undefined }));
                  }
                  if (formError) setFormError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAnalyze();
                }}
                className={`w-full rounded-xl border bg-white px-4 py-4 text-base text-[#111827] outline-none placeholder:text-[#9CA3AF] ${
                  fieldErrors.market ? 'border-[#EF4444]' : 'border-[#E5E7EB]'
                } ${inputAlignClass}`}
                placeholder={EXAMPLES[preferredLanguage].market}
              />
              {fieldErrors.market ? (
                <p className="mt-2 text-sm text-[#DC2626]">{fieldErrors.market}</p>
              ) : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#374151]">
                {copy.targetCustomer}
              </label>
              <input
                type="text"
                value={customer}
                onChange={(e) => {
                  setCustomer(e.target.value);
                  if (fieldErrors.customer) {
                    setFieldErrors((current) => ({ ...current, customer: undefined }));
                  }
                  if (formError) setFormError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAnalyze();
                }}
                className={`w-full rounded-xl border bg-white px-4 py-4 text-base text-[#111827] outline-none placeholder:text-[#9CA3AF] ${
                  fieldErrors.customer ? 'border-[#EF4444]' : 'border-[#E5E7EB]'
                } ${inputAlignClass}`}
                placeholder={isArabic ? INPUT_PLACEHOLDERS.ar.customer : INPUT_PLACEHOLDERS.en.customer}
              />
              {fieldErrors.customer ? (
                <p className="mt-2 text-sm text-[#DC2626]">{fieldErrors.customer}</p>
              ) : null}
            </div>
          </div>

          {formError ? (
            <div className="mt-4 rounded-2xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B91C1C]">
              {formError}
            </div>
          ) : null}

          <button
            onClick={handleAnalyze}
            className="mt-6 w-full cursor-pointer rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 sm:w-auto"
          >
            {copy.analyzeOpportunity}
          </button>
        </div>
      </section>


      <section id={sectionId} className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 sm:pb-16">
        <div className="text-center">
          <p className="text-sm font-medium text-[#6B7280]">{copy.howMadixoWorks}</p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#111827] sm:text-3xl md:text-4xl">
            {copy.howMadixoWorks}
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-[#4B5563] md:text-lg md:leading-8">
            {copy.howMadixoWorksDescription}
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {steps.map((step) => (
            <div
              key={step.number}
              className="rounded-2xl border border-[#D9E2F0] bg-[#F7F9FC] p-5 shadow-sm sm:p-6"
            >
              <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#EEF3F9] text-lg font-semibold text-[#111827]">
                {step.number}
              </div>
              <h3 className="text-2xl font-semibold">{step.title}</h3>
              <p className="mt-4 text-base leading-7 text-[#4B5563] sm:text-lg sm:leading-8">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 sm:pb-16">
        <div className="text-center">
          <p className="text-sm font-medium text-[#6B7280]">{copy.trustEyebrow}</p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#111827] sm:text-3xl md:text-4xl">
            {copy.trustTitle}
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-[#4B5563] md:text-lg md:leading-8">
            {copy.trustDescription}
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {trustCards.map((card) => (
            <div
              key={card.title}
              className="rounded-2xl border border-[#D9E2F0] bg-[#F7F9FC] p-5 shadow-sm sm:p-6"
            >
              <h3 className="text-xl font-semibold tracking-tight text-[#111827] sm:text-2xl">
                {card.title}
              </h3>
              <p className="mt-4 text-base leading-8 text-[#4B5563]">
                {card.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-[28px] border border-[#D9E2F0] bg-[#F7F9FC] p-5 shadow-sm sm:p-6">
          <p className="text-sm font-semibold text-[#6B7280]">{copy.builtForTitle}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            {fitItems.map((item) => (
              <span
                key={item}
                className="rounded-full border border-[#D9E2F0] bg-[#F8FAFD] px-4 py-2 text-sm font-medium text-[#374151]"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 sm:pb-16">
        <div className="rounded-[28px] border border-[#111827] bg-[#111827] p-5 shadow-sm sm:p-6 md:p-8">
          <div className="text-center">
            <p className="text-sm font-medium text-white/60">{copy.chatgptEyebrow}</p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">
              {copy.chatgptTitle}
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-white/70 md:text-lg md:leading-8">
              {copy.chatgptDescription}
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {[
              { title: copy.chatgptCard1Title, description: copy.chatgptCard1Description },
              { title: copy.chatgptCard2Title, description: copy.chatgptCard2Description },
              { title: copy.chatgptCard3Title, description: copy.chatgptCard3Description },
            ].map((card) => (
              <div
                key={card.title}
                className="rounded-2xl border border-white/15 bg-white/10 p-5 sm:p-6"
              >
                <h3 className="text-lg font-semibold tracking-tight text-white sm:text-xl">
                  {card.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-white/75 sm:text-base sm:leading-8">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 sm:pb-16">
        <div className="text-center">
          <p className="text-sm font-medium text-[#6B7280]">{copy.pricingEyebrow}</p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#111827] sm:text-3xl md:text-4xl">
            {copy.pricingTitle}
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-[#4B5563] md:text-lg md:leading-8">
            {copy.pricingDescription}
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {pricingPlans.map((plan) => (
            <PricingCard
              key={plan.name}
              name={plan.name}
              tag={plan.tag}
              description={plan.description}
              features={plan.features}
              highlighted={plan.highlighted}
              actionLabel={copy.primaryCta}
              badgeLabel={copy.mostRecommended}
              onClick={scrollToIdeaForm}
            />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 sm:pb-16">
        <div className="text-center">
          <p className="text-sm font-medium text-[#6B7280]">{copy.valueEyebrow}</p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#111827] sm:text-3xl md:text-4xl">
            {copy.valueTitle}
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-[#4B5563] md:text-lg md:leading-8">
            {copy.valueDescription}
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {valueCards.map((card) => (
            <div
              key={card.title}
              className="rounded-2xl border border-[#D9E2F0] bg-[#F7F9FC] p-5 shadow-sm sm:p-6"
            >
              <h3 className="text-xl font-semibold tracking-tight text-[#111827] sm:text-2xl">
                {card.title}
              </h3>
              <p className="mt-4 text-base leading-8 text-[#4B5563]">
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 sm:pb-16">
        <div className="rounded-[24px] border border-[#D9E2F0] bg-[#F8FAFD] p-5 shadow-sm md:p-6">
          <div className="text-center">
            <p className="text-sm font-medium text-[#6B7280]">{copy.contentEyebrow}</p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#111827] md:text-3xl">
              {copy.contentTitle}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[#4B5563] md:text-base">
              {copy.contentDescription}
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {dynamicContentCards.map((item) => (
              <div
                key={item.href}
                className="rounded-2xl border border-[#D9E2F0] bg-white p-5 shadow-sm"
              >
                <p className="text-xs font-semibold text-[#6B7280]">
                  {item.sectionTitle}
                </p>

                <h3 className="mt-3 text-xl font-semibold tracking-tight text-[#111827]">
                  {item.itemTitle}
                </h3>

                <p className="mt-3 text-sm leading-7 text-[#4B5563]">
                  {item.itemDescription}
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href={item.href}
                    className="inline-flex rounded-full border border-[#111827] bg-[#111827] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                  >
                    {item.cta}
                  </Link>

                  <Link
                    href={item.browseHref}
                    className="inline-flex rounded-full border border-[#D9E2F0] bg-[#F8FAFD] px-4 py-2.5 text-sm font-semibold text-[#374151] transition hover:bg-[#EEF3F9]"
                  >
                    {item.browseLabel}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 sm:pb-16">
        <div className="rounded-[28px] border border-[#D9E2F0] bg-[#F7F9FC] p-5 shadow-sm sm:p-6 md:p-8">
          <div className="text-center">
            <p className="text-sm font-medium text-[#6B7280]">{faqCopy.eyebrow}</p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#111827] sm:text-3xl md:text-4xl">
              {faqCopy.title}
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-[#4B5563] md:text-lg md:leading-8">
              {faqCopy.description}
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {faqCopy.items.map((item) => (
              <div
                key={item.question}
                className="rounded-2xl border border-[#D9E2F0] bg-white p-5 shadow-sm sm:p-6"
              >
                <h3 className="text-lg font-semibold tracking-tight text-[#111827] sm:text-xl">
                  {item.question}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[#4B5563] sm:text-base sm:leading-8">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>


      <section className="mx-auto max-w-6xl px-4 pb-20 text-center sm:px-6 sm:pb-24">
        <h2 className="text-3xl font-bold md:text-4xl">{copy.closingTitle}</h2>
        <p className="mt-4 text-lg text-[#4B5563]">{copy.closingDescription}</p>

        <button
          onClick={scrollToIdeaForm}
          className="mt-8 cursor-pointer rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          {copy.primaryCta}
        </button>
      </section>
      <SiteFooter uiLang={preferredLanguage} />
    </main>
  );
}
