export type BlogLanguage = 'ar' | 'en';

export type LocalizedText = {
  ar: string;
  en: string;
};

export type ContentCategory =
  | 'idea-validation'
  | 'feasibility'
  | 'market-research'
  | 'positioning'
  | 'madixo-guides';

export type BlogBlock =
  | { type: 'paragraph'; text: LocalizedText }
  | { type: 'heading'; text: LocalizedText }
  | { type: 'list'; items: LocalizedText[] };

export type BlogPost = {
  slug: string;
  category: ContentCategory;
  title: LocalizedText;
  excerpt: LocalizedText;
  seoDescription: LocalizedText;
  coverEyebrow: LocalizedText;
  keywords: string[];
  publishedAt: string;
  updatedAt: string;
  readingTimeMinutes: number;
  featured: boolean;
  body: BlogBlock[];
  relatedPosts?: string[];
  relatedUseCases?: string[];
  relatedComparisons?: string[];
};

export type UseCasePage = {
  slug: string;
  title: LocalizedText;
  summary: LocalizedText;
  seoDescription: LocalizedText;
  industry: LocalizedText;
  bestFor: LocalizedText[];
  useMadixoFor: LocalizedText[];
  workflow: LocalizedText[];
  expectedOutcome: LocalizedText;
  relatedPosts?: string[];
};

export type ComparisonPage = {
  slug: string;
  title: LocalizedText;
  summary: LocalizedText;
  seoDescription: LocalizedText;
  compareAgainst: LocalizedText;
  bestWhen: LocalizedText[];
  whyMadixo: LocalizedText[];
  notFor: LocalizedText[];
  relatedPosts?: string[];
};

export function localizeText(value: LocalizedText, language: BlogLanguage) {
  return value[language];
}

export function formatContentDate(value: string, language: BlogLanguage) {
  return new Intl.DateTimeFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(value));
}

export function categoryLabel(category: ContentCategory, language: BlogLanguage) {
  const labels: Record<ContentCategory, LocalizedText> = {
    'idea-validation': { ar: 'اختبار الفكرة', en: 'Idea Validation' },
    feasibility: { ar: 'دراسة الجدوى', en: 'Feasibility' },
    'market-research': { ar: 'فهم السوق', en: 'Market Research' },
    positioning: { ar: 'تموضع المنتج', en: 'Positioning' },
    'madixo-guides': { ar: 'استخدام Madixo', en: 'Using Madixo' },
  };

  return labels[category][language];
}

export const BLOG_CATEGORIES: ContentCategory[] = [
  'idea-validation',
  'feasibility',
  'market-research',
  'positioning',
  'madixo-guides',
];

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'how-to-validate-a-business-idea-before-building',
    category: 'idea-validation',
    title: {
      ar: 'كيف تختبر فكرة مشروع قبل أن تبدأ في البناء',
      en: 'How to Validate a Business Idea Before You Start Building',
    },
    excerpt: {
      ar: 'طريقة عملية لتقييم الفكرة قبل صرف الوقت والمال: هل المشكلة حقيقية، وهل السوق واضح، وهل توجد إشارة دفع أو اهتمام كافٍ؟',
      en: 'A practical way to evaluate an idea before spending time and money: is the problem real, is the market clear, and is there enough buying intent?',
    },
    seoDescription: {
      ar: 'تعرف على طريقة عملية لاختبار فكرة مشروع قبل البناء، من وضوح المشكلة إلى إشارات السوق الأولى، وكيف يساعدك Madixo على ذلك.',
      en: 'Learn a practical process for validating a business idea before building, from problem clarity to early market signals, and how Madixo supports it.',
    },
    coverEyebrow: { ar: 'اختبار الفكرة', en: 'Idea Validation' },
    keywords: ['اختبار فكرة مشروع', 'business idea validation', 'startup idea'],
    publishedAt: '2026-03-30',
    updatedAt: '2026-03-30',
    readingTimeMinutes: 6,
    featured: true,
    relatedUseCases: ['madixo-for-first-time-founders'],
    relatedComparisons: ['madixo-vs-asking-chatgpt-only'],
    body: [
      {
        type: 'paragraph',
        text: {
          ar: 'الانتقال السريع من الفكرة إلى التنفيذ الكامل غالبًا يستهلك وقتًا ومالًا قبل أن تتأكد أصلًا أن هناك مشكلة حقيقية وسوقًا واضحًا. ما تحتاجه أولًا ليس منتجًا كاملاً، بل قرارًا أوضح.',
          en: 'Moving too quickly from an idea into full execution often burns time and money before you even confirm there is a real problem and a clear market. What you need first is not a full product, but a clearer decision.',
        },
      },
      {
        type: 'heading',
        text: { ar: 'ابدأ بثلاثة أسئلة', en: 'Start with three questions' },
      },
      {
        type: 'list',
        items: [
          {
            ar: 'ما المشكلة التي تحاول حلها، وهل هي متكررة فعلًا؟',
            en: 'What problem are you solving, and does it happen repeatedly?',
          },
          {
            ar: 'من هو العميل الأول الواضح الذي يشعر بهذه المشكلة الآن؟',
            en: 'Who is the first clear customer that feels this problem now?',
          },
          {
            ar: 'هل يمكنك الوصول إليه واختبار رد فعله بدون بناء كامل؟',
            en: 'Can you reach that customer and test the response without full execution?',
          },
        ],
      },
      {
        type: 'paragraph',
        text: {
          ar: 'في هذه المرحلة لا تبحث عن مجاملة أو إعجاب عام. ابحث عن إشارات سلوكية: طلب توضيح، سؤال عن السعر، مقارنة بحل بديل، أو استعداد لتجربة شيء بسيط.',
          en: 'At this stage, do not look for compliments or general enthusiasm. Look for behavioral signals: asking for clarification, asking about price, comparing you to an alternative, or willingness to try something simple.',
        },
      },
      {
        type: 'paragraph',
        text: {
          ar: 'هنا يفيد Madixo لأنه يبدأ بتحليل الفرصة نفسها، ثم يحولها إلى دراسة جدوى أولية ومساحة تحقق وتوثيق أدلة حتى لا يبقى القرار قائمًا على الانطباع فقط.',
          en: 'This is where Madixo helps because it starts with opportunity analysis itself, then extends into early feasibility and validation so the decision does not rely on gut feeling alone.',
        },
      },
    ],
  },
  {
    slug: 'difference-between-opportunity-analysis-and-feasibility-study',
    category: 'feasibility',
    title: {
      ar: 'ما الفرق بين تحليل الفرصة ودراسة الجدوى الأولية',
      en: 'What Is the Difference Between Opportunity Analysis and an Early Feasibility Study',
    },
    excerpt: {
      ar: 'تحليل الفرصة يجيب: هل هذه فرصة تستحق النظر؟ ودراسة الجدوى الأولية تضيف: هل تبدو مجدية ماليًا في البداية؟',
      en: 'Opportunity analysis answers: is this worth exploring? An early feasibility study adds: does it look financially workable at the start?',
    },
    seoDescription: {
      ar: 'تعرف على الفرق العملي بين تحليل الفرصة ودراسة الجدوى الأولية، ولماذا يحتاج المؤسس الاثنين قبل اتخاذ قرار التنفيذ.',
      en: 'Understand the practical difference between opportunity analysis and an early feasibility study, and why founders often need both before execution.',
    },
    coverEyebrow: { ar: 'دراسة الجدوى', en: 'Feasibility' },
    keywords: ['دراسة جدوى أولية', 'opportunity analysis', 'feasibility study'],
    publishedAt: '2026-03-30',
    updatedAt: '2026-03-30',
    readingTimeMinutes: 5,
    featured: true,
    relatedUseCases: ['madixo-for-service-businesses'],
    relatedComparisons: ['madixo-vs-feasibility-template-spreadsheets'],
    body: [
      {
        type: 'paragraph',
        text: {
          ar: 'تحليل الفرصة ليس هو دراسة الجدوى. الأول يركز على جاذبية السوق والمشكلة والعميل والمدخل. الثاني يركز على القراءة المالية الأولية إذا قررت أن تقترب أكثر من التنفيذ.',
          en: 'Opportunity analysis is not the same as feasibility study. The first focuses on market attractiveness, problem clarity, the customer, and the entry point. The second focuses on the early financial picture if you move closer to execution.',
        },
      },
      {
        type: 'list',
        items: [
          {
            ar: 'تحليل الفرصة: الطلب، المنافسة، الربحية، أفضل عميل أول، المخاطر.',
            en: 'Opportunity analysis: demand, competition, monetization, best first customer, and risks.',
          },
          {
            ar: 'دراسة الجدوى الأولية: تكاليف البداية، التكاليف الشهرية، سيناريوهات الإيراد، ونظرة أولية لنقطة التعادل.',
            en: 'Early feasibility: startup costs, monthly costs, revenue scenarios, and an early break-even view.',
          },
        ],
      },
      {
        type: 'paragraph',
        text: {
          ar: 'القرار الأقوى يأتي عندما تجمع بين الاثنين. قد تبدو الفكرة جذابة من ناحية السوق لكن أرقامها الأولية ضعيفة، أو العكس.',
          en: 'The stronger decision comes when you combine both. An idea may look attractive from a market perspective while its early numbers look weak, or the opposite.',
        },
      },
    ],
  },
  {
    slug: 'how-to-know-if-market-demand-is-real',
    category: 'market-research',
    title: {
      ar: 'كيف تعرف أن الطلب في السوق حقيقي وليس مجرد انطباع',
      en: 'How to Tell Whether Market Demand Is Real and Not Just an Impression',
    },
    excerpt: {
      ar: 'الطلب الحقيقي يظهر في السلوك: أسئلة متكررة، اهتمام بالسعر، مقارنة بالبدائل، ومحاولات واضحة للحل.',
      en: 'Real demand shows up in behavior: repeated questions, price interest, comparisons with alternatives, and visible attempts to solve the problem.',
    },
    seoDescription: {
      ar: 'تعرف على الإشارات العملية التي تدل على أن الطلب حقيقي في السوق، وكيف تميز بين الفضول العابر والاهتمام الجاد.',
      en: 'Learn the practical signals that show real market demand and how to separate casual curiosity from serious interest.',
    },
    coverEyebrow: { ar: 'فهم السوق', en: 'Market Research' },
    keywords: ['market demand', 'real demand', 'سوق', 'طلب'],
    publishedAt: '2026-03-30',
    updatedAt: '2026-03-30',
    readingTimeMinutes: 5,
    featured: false,
    relatedUseCases: ['madixo-for-agencies-and-consultants'],
    relatedComparisons: ['madixo-vs-generic-market-research-notes'],
    body: [
      {
        type: 'paragraph',
        text: {
          ar: 'الخطأ الشائع هو اعتبار أي تفاعل إيجابي دليلًا على وجود طلب. لكن السوق لا يثبت نفسه بالكلام الجميل فقط، بل بما يفعله الناس فعلاً.',
          en: 'A common mistake is treating any positive reaction as proof of demand. But markets do not prove themselves through nice words alone, they show themselves through behavior.',
        },
      },
      {
        type: 'list',
        items: [
          { ar: 'يسألون عن السعر أو طريقة البدء.', en: 'They ask about price or how to begin.' },
          { ar: 'يقارنونك بحل آخر أو بديل يدفعون له بالفعل.', en: 'They compare you with another solution they already pay for.' },
          { ar: 'يذكرون مشكلة متكررة بصياغات متشابهة.', en: 'They describe a recurring problem in similar words.' },
          { ar: 'يطلبون أن تتابع معهم أو تعرض شيئًا أوضح.', en: 'They ask you to follow up or show a more concrete offer.' },
        ],
      },
      {
        type: 'paragraph',
        text: {
          ar: 'لهذا السبب تسجيل ملاحظات السوق مهم. إذا جمعت هذه الإشارات في مكان واحد، يصبح القرار أهدأ وأدق من الاعتماد على الذاكرة أو الانطباع.',
          en: 'That is why saving market notes matters. Once you collect these signals in one place, the decision becomes calmer and more accurate than relying on memory or impression.',
        },
      },
    ],
  },
  {
    slug: 'how-to-document-market-notes-that-improve-decisions',
    category: 'madixo-guides',
    title: {
      ar: 'كيف توثق ملاحظات السوق بطريقة تحسن القرار',
      en: 'How to Document Market Notes in a Way That Improves Decisions',
    },
    excerpt: {
      ar: 'توثيق ملاحظات السوق ليس مجرد حفظ تعليقات. الهدف هو بناء صورة أوضح لما يتكرر وما يستحق التعديل.',
      en: 'Documenting market notes is not just saving comments. The goal is to build a clearer picture of what repeats and what deserves adjustment.',
    },
    seoDescription: {
      ar: 'تعرف على طريقة عملية لتوثيق ملاحظات السوق والمقابلات والاعتراضات، بحيث تساعدك فعلًا على اتخاذ قرار أفضل.',
      en: 'Learn a practical method for documenting market notes, interviews, and objections so they actually improve your next decision.',
    },
    coverEyebrow: { ar: 'استخدام Madixo', en: 'Using Madixo' },
    keywords: ['market notes', 'evidence', 'madixo guide'],
    publishedAt: '2026-03-30',
    updatedAt: '2026-03-30',
    readingTimeMinutes: 4,
    featured: false,
    relatedUseCases: ['madixo-for-first-time-founders'],
    relatedComparisons: ['madixo-vs-generic-market-research-notes'],
    body: [
      {
        type: 'paragraph',
        text: {
          ar: 'إذا كانت ملاحظات السوق مبعثرة بين واتساب والملاحظات الذهنية والمحادثات، فإن القرار سيتشتت معها. التوثيق الجيد يجعل التكرار واضحًا، ويحول التعلّم إلى حركة عملية.',
          en: 'If market notes are scattered across WhatsApp, memory, and casual conversations, the decision becomes scattered too. Good documentation makes repetition visible and turns learning into action.',
        },
      },
      {
        type: 'list',
        items: [
          { ar: 'احفظ ما قيل أو حدث فعلًا، لا تفسيرك فقط.', en: 'Save what was actually said or happened, not just your interpretation.' },
          { ar: 'اجعل العنوان قصيرًا وواضحًا.', en: 'Keep the title short and clear.' },
          { ar: 'أضف المصدر وقوة الإشارة.', en: 'Add the source and signal strength.' },
          { ar: 'أعد بناء رؤية القرار بعد تراكم عدة ملاحظات.', en: 'Rebuild the decision view after several notes accumulate.' },
        ],
      },
    ],
  },
  {
    slug: 'when-to-use-madixo-instead-of-asking-chatgpt-only',
    category: 'madixo-guides',
    title: {
      ar: 'متى تستخدم Madixo بدل الاكتفاء بسؤال ChatGPT فقط',
      en: 'When to Use Madixo Instead of Asking ChatGPT Only',
    },
    excerpt: {
      ar: 'سؤال ChatGPT قد يعطيك بداية جيدة، لكن Madixo يصبح أقوى عندما تحتاج مسار قرار وتوثيق أدلة وتدرجًا واضحًا من التحليل إلى التنفيذ.',
      en: 'Asking ChatGPT can be a good starting point, but Madixo becomes stronger when you need a decision workflow, evidence capture, and a clear path from analysis to action.',
    },
    seoDescription: {
      ar: 'تعرف على الفرق بين سؤال ChatGPT بشكل عام وبين استخدام Madixo عندما تحتاج تحليل فرصة ودراسة جدوى أولية ومساحة تحقق وقرار أوضح.',
      en: 'Understand the difference between using ChatGPT generically and using Madixo when you need opportunity analysis, early feasibility, validation, and a clearer decision.',
    },
    coverEyebrow: { ar: 'استخدام Madixo', en: 'Using Madixo' },
    keywords: ['Madixo vs ChatGPT', 'business idea analysis', 'idea validation tool'],
    publishedAt: '2026-03-30',
    updatedAt: '2026-03-30',
    readingTimeMinutes: 5,
    featured: true,
    relatedUseCases: ['madixo-for-first-time-founders'],
    relatedComparisons: ['madixo-vs-asking-chatgpt-only'],
    body: [
      {
        type: 'paragraph',
        text: {
          ar: 'ChatGPT ممتاز للبدايات السريعة: أفكار أولية، زوايا تفكير، وصياغة عامة. لكن عندما تحتاج إلى سير عمل يتدرج من تحليل الفرصة إلى الجدوى الأولية إلى التحقق وتوثيق ما تتعلمه، تصبح الحاجة إلى أداة متخصصة أوضح.',
          en: 'ChatGPT is excellent for quick starts: early ideas, broad thinking angles, and general phrasing. But when you need a workflow that moves from opportunity analysis to early feasibility to validation and evidence capture, the need for a specialized product becomes clearer.',
        },
      },
      {
        type: 'list',
        items: [
          { ar: 'استخدم ChatGPT إذا كنت في مرحلة استكشاف مبكرة جدًا.', en: 'Use ChatGPT when you are at a very early exploration stage.' },
          { ar: 'استخدم Madixo إذا أردت تحليلًا منظمًا ومسار قرار واضحًا.', en: 'Use Madixo when you want structured analysis and a clear decision workflow.' },
          { ar: 'استخدم Madixo إذا كنت تريد حفظ التقارير، ودراسة الجدوى، وملاحظات السوق في مكان واحد.', en: 'Use Madixo if you want saved reports, feasibility, and market notes in one place.' },
        ],
      },
    ],
  },
  {
    slug: 'how-to-choose-your-best-first-customer',
    category: 'positioning',
    title: {
      ar: 'كيف تختار أفضل عميل أول للفكرة الجديدة',
      en: 'How to Choose the Best First Customer for a New Idea',
    },
    excerpt: {
      ar: 'أفضل عميل أول ليس أكبر شريحة في السوق، بل أوضح شريحة تعاني المشكلة ويمكن الوصول إليها بسرعة.',
      en: 'The best first customer is not the biggest market segment. It is the clearest one with the problem and the fastest path to reach.',
    },
    seoDescription: {
      ar: 'تعرف على طريقة عملية لاختيار أفضل عميل أول لفكرتك الجديدة، ولماذا هذه الخطوة تؤثر في سرعة التحقق والقرار.',
      en: 'Learn a practical method for choosing the best first customer for a new idea and why that step shapes validation speed and decision quality.',
    },
    coverEyebrow: { ar: 'تموضع المنتج', en: 'Positioning' },
    keywords: ['best first customer', 'positioning', 'target customer'],
    publishedAt: '2026-03-30',
    updatedAt: '2026-03-30',
    readingTimeMinutes: 4,
    featured: false,
    relatedUseCases: ['madixo-for-service-businesses'],
    relatedComparisons: ['madixo-vs-feasibility-template-spreadsheets'],
    body: [
      {
        type: 'paragraph',
        text: {
          ar: 'من أكبر أسباب ضياع الجهد في البداية أن تكون الشريحة واسعة جدًا. كلما ضاقت الشريحة الأولى وأصبحت أوضح، صار الاختبار أسرع والرسالة أقوى والتعلم أدق.',
          en: 'One of the biggest reasons early effort gets wasted is choosing a segment that is too broad. The narrower and clearer the first segment is, the faster the test and the stronger the message become.',
        },
      },
      {
        type: 'list',
        items: [
          { ar: 'اختر شريحة تشعر بالمشكلة الآن لا لاحقًا.', en: 'Choose a segment that feels the problem now, not later.' },
          { ar: 'اختر شريحة يمكنك الوصول إليها مباشرة.', en: 'Choose a segment you can reach directly.' },
          { ar: 'اختر شريحة تصف المشكلة بلغة واضحة ومتكررة.', en: 'Choose a segment that describes the problem in clear repeated language.' },
        ],
      },
    ],
  },

{
  slug: 'feasibility-study-vs-business-plan',
  category: 'feasibility',
  title: {
    ar: 'دراسة الجدوى أم خطة العمل: ما الفرق ومتى تحتاج كل واحدة؟',
    en: 'Feasibility Study vs Business Plan: What Is the Difference and When Do You Need Each One',
  },
  excerpt: {
    ar: 'كثير من أصحاب المشاريع يخلطون بين دراسة الجدوى وخطة العمل. هذه المقالة توضح الفرق العملي بينهما، ومتى تبدأ بالأولى قبل أن تنتقل إلى الثانية.',
    en: 'Many founders mix up a feasibility study and a business plan. This guide explains the practical difference and when to start with one before moving to the other.',
  },
  seoDescription: {
    ar: 'تعرف على الفرق بين دراسة الجدوى وخطة العمل، ومتى تحتاج كل واحدة قبل إطلاق مشروعك، وكيف يساعدك Madixo في القراءة الأولية قبل كتابة الخطة الكاملة.',
    en: 'Learn the difference between a feasibility study and a business plan, when you need each one before launch, and how Madixo helps with the early decision before writing a full plan.',
  },
  coverEyebrow: { ar: 'دراسة الجدوى', en: 'Feasibility' },
  keywords: [
    'feasibility study vs business plan',
    'business plan',
    'study feasibility',
    'دراسة الجدوى وخطة العمل',
    'feasibility study',
  ],
  publishedAt: '2026-04-12',
  updatedAt: '2026-04-12',
  readingTimeMinutes: 7,
  featured: true,
  relatedUseCases: ['madixo-for-first-time-founders', 'madixo-for-service-businesses'],
  relatedComparisons: ['madixo-vs-feasibility-template-spreadsheets'],
    relatedPosts: ['how-to-analyze-a-business-idea-before-spending-money', 'how-to-test-business-demand-before-launch'],
  body: [
    {
      type: 'paragraph',
      text: {
        ar: 'الخلط بين دراسة الجدوى وخطة العمل يسبب مشكلة شائعة: بعض المؤسسين يبدأون بكتابة خطة طويلة قبل أن يتأكدوا أصلًا أن الفكرة تستحق التنفيذ. النتيجة تكون مستندًا مرتبًا، لكن القرار نفسه ما زال غير واضح.',
        en: 'Mixing up a feasibility study and a business plan creates a common problem: some founders start writing a long plan before confirming the idea is worth executing at all. The result is a neat document, but the decision is still unclear.',
      },
    },
    {
      type: 'heading',
      text: { ar: 'ما وظيفة دراسة الجدوى؟', en: 'What does a feasibility study do?' },
    },
    {
      type: 'paragraph',
      text: {
        ar: 'دراسة الجدوى تسأل: هل تبدو هذه الفكرة معقولة من ناحية السوق والتكلفة والربحية الأولية والمخاطر؟ هي أداة لاتخاذ قرار مبكر، وليست وثيقة تشغيل نهائية.',
        en: 'A feasibility study asks: does this idea look workable from a market, cost, early profitability, and risk perspective? It is an early decision tool, not a final operating document.',
      },
    },
    {
      type: 'heading',
      text: { ar: 'وما وظيفة خطة العمل؟', en: 'And what does a business plan do?' },
    },
    {
      type: 'paragraph',
      text: {
        ar: 'خطة العمل تأتي بعد أن تقترب أكثر من التنفيذ. هي توضح كيف ستدخل السوق، وكيف ستبيع، وكيف ستشغل المشروع، وما هو النموذج التشغيلي والمالي الذي ستبني عليه.',
        en: 'A business plan comes later, when you are closer to execution. It explains how you will enter the market, sell, operate, and build the operating and financial model around the venture.',
      },
    },
    {
      type: 'list',
      items: [
        {
          ar: 'دراسة الجدوى: هل الفكرة تستحق التقدم أصلًا؟',
          en: 'Feasibility study: is the idea worth moving forward at all?',
        },
        {
          ar: 'خطة العمل: كيف سننفذ الفكرة بعد أن قررنا التقدم؟',
          en: 'Business plan: how will we execute the idea after deciding to move forward?',
        },
        {
          ar: 'دراسة الجدوى: تركز على القراءة الأولية واتخاذ القرار.',
          en: 'Feasibility study: focused on the early read and the decision.',
        },
        {
          ar: 'خطة العمل: تركز على التنفيذ والتشغيل والنمو.',
          en: 'Business plan: focused on execution, operations, and growth.',
        },
      ],
    },
    {
      type: 'paragraph',
      text: {
        ar: 'لهذا من الأفضل في المراحل الأولى أن تبدأ بتحليل الفرصة ثم دراسة جدوى أولية مختصرة، وبعد ذلك فقط تقرر هل يستحق الأمر بناء خطة عمل كاملة أم لا.',
        en: 'That is why, in early stages, it is better to start with opportunity analysis and a short early feasibility read, and only then decide whether a full business plan is justified.',
      },
    },
    {
      type: 'paragraph',
      text: {
        ar: 'في Madixo لا تبدأ من قالب جامد. تبدأ من الفكرة نفسها، ثم تنتقل إلى قراءة أولية للجدوى، ثم إلى مساحة تحقق وجمع أدلة قبل أي التزام كبير.',
        en: 'In Madixo, you do not start from a rigid template. You start from the idea itself, then move into early feasibility, then into validation and evidence capture before making a larger commitment.',
      },
    },
  ],
},
{
  slug: 'how-to-test-business-demand-before-launch',
  category: 'market-research',
  title: {
    ar: 'كيف تختبر الطلب على مشروعك قبل الإطلاق',
    en: 'How to Test Business Demand Before You Launch',
  },
  excerpt: {
    ar: 'قبل أن تطلق المنتج أو الخدمة، تحتاج أن تعرف هل يوجد طلب حقيقي أم لا. هذه المقالة تشرح كيف تختبر الطلب بطريقة عملية وقليلة التكلفة.',
    en: 'Before you launch a product or service, you need to know whether real demand exists. This guide shows how to test demand in a practical, low-cost way.',
  },
  seoDescription: {
    ar: 'تعرف على خطوات عملية لاختبار الطلب قبل إطلاق المشروع، من اختيار الشريحة الأولى إلى جمع الإشارات السلوكية وبناء تجربة سوق صغيرة باستخدام Madixo.',
    en: 'Learn practical steps to test demand before launching, from choosing the first segment to collecting behavioral signals and running a small market test with Madixo.',
  },
  coverEyebrow: { ar: 'فهم السوق', en: 'Market Research' },
  keywords: [
    'test business demand',
    'market demand test',
    'validate demand before launch',
    'اختبار الطلب قبل الإطلاق',
    'business demand',
  ],
  publishedAt: '2026-04-12',
  updatedAt: '2026-04-12',
  readingTimeMinutes: 6,
  featured: true,
  relatedUseCases: ['madixo-for-ecommerce-and-product-ideas', 'madixo-for-service-businesses'],
  relatedComparisons: ['madixo-vs-generic-market-research-notes'],
    relatedPosts: ['how-to-analyze-a-business-idea-before-spending-money', 'how-to-validate-a-business-idea-before-building'],
  body: [
    {
      type: 'paragraph',
      text: {
        ar: 'اختبار الطلب لا يعني أن تطلق مشروعًا كاملًا. المعنى الحقيقي هو أن تصمم تجربة صغيرة تكشف لك: هل السوق مهتم بما يكفي؟ وهل المشكلة أو الرغبة واضحة عند شريحة محددة؟',
        en: 'Testing demand does not mean launching a full venture. It means designing a small experiment that reveals whether the market is interested enough and whether the problem or desire is clear for a defined segment.',
      },
    },
    {
      type: 'heading',
      text: { ar: 'ابدأ بشريحة واحدة واضحة', en: 'Start with one clear segment' },
    },
    {
      type: 'paragraph',
      text: {
        ar: 'أكثر الأخطاء شيوعًا هو محاولة اختبار الفكرة مع الجميع. الأفضل أن تختار أول شريحة محددة، مثل نوع عميل واضح أو سوق محلي واضح أو حالة استخدام واحدة فقط.',
        en: 'One of the most common mistakes is trying to test an idea with everyone. It is better to choose one clear starting segment, such as a specific customer type, a clear local market, or one exact use case.',
      },
    },
    {
      type: 'heading',
      text: { ar: 'لا تبحث عن المجاملة، ابحث عن السلوك', en: 'Do not look for compliments, look for behavior' },
    },
    {
      type: 'list',
      items: [
        {
          ar: 'هل سأل الشخص عن السعر أو طريقة العمل؟',
          en: 'Did the person ask about price or delivery?',
        },
        {
          ar: 'هل طلب تفاصيل أكثر أو مثالًا فعليًا؟',
          en: 'Did they ask for more details or a concrete example?',
        },
        {
          ar: 'هل قارن ما تعرضه ببديل يستخدمه الآن؟',
          en: 'Did they compare your idea with an alternative they already use?',
        },
        {
          ar: 'هل وافق على تجربة صغيرة أو حجز مبدئي؟',
          en: 'Did they agree to a small trial or an early reservation?',
        },
      ],
    },
    {
      type: 'paragraph',
      text: {
        ar: 'هذه الإشارات أهم بكثير من قول: الفكرة جميلة. لأن الإعجاب العام لا يثبت وجود طلب، بينما السلوك يكشف الجدية.',
        en: 'These signals matter much more than hearing “nice idea.” General enthusiasm does not prove demand, while behavior exposes seriousness.',
      },
    },
    {
      type: 'heading',
      text: { ar: 'ابنِ تجربة صغيرة قبل الإطلاق', en: 'Build a small pre-launch test' },
    },
    {
      type: 'paragraph',
      text: {
        ar: 'قد تكون التجربة عبارة عن صفحة بسيطة، عرض أولي، إعلان اختبار، مقابلات مركزة، أو رسالة واضحة ترسلها إلى شريحة محددة. الهدف ليس البيع الكامل، بل جمع أدلة قوية بما يكفي لاتخاذ القرار التالي.',
        en: 'The test can be a simple page, a first offer, a test ad, focused interviews, or a clear message sent to a defined segment. The goal is not full sales yet, but strong enough evidence to guide the next decision.',
      },
    },
    {
      type: 'paragraph',
      text: {
        ar: 'في Madixo يمكنك الانتقال من تحليل الفرصة إلى مساحة تحقق تسجل فيها ما حدث فعلًا، وما تكرر، وما الذي يجب تعديله قبل الإطلاق.',
        en: 'In Madixo, you can move from opportunity analysis into a validation workspace where you record what actually happened, what repeated, and what should change before launch.',
      },
    },
  ],
},
{
  slug: 'how-to-analyze-a-business-idea-before-spending-money',
  category: 'idea-validation',
  title: {
    ar: 'كيف تحلل فكرة مشروع قبل أن تصرف المال عليها',
    en: 'How to Analyze a Business Idea Before Spending Money on It',
  },
  excerpt: {
    ar: 'قبل أن تدفع على التطوير أو المخزون أو التوظيف، تحتاج إلى تحليل الفكرة بشكل منظم. هذه المقالة تشرح ما الذي تنظر إليه أولًا، وما الذي يجعل الفكرة أقوى أو أضعف.',
    en: 'Before spending on development, inventory, or hiring, you need to analyze the idea in a structured way. This article explains what to look at first and what makes an idea stronger or weaker.',
  },
  seoDescription: {
    ar: 'تعرف على طريقة عملية لتحليل فكرة مشروع قبل صرف المال، من المشكلة والسوق إلى المنافسة والربحية الأولية، وكيف يساعدك Madixo على رؤية أوضح قبل التنفيذ.',
    en: 'Learn a practical way to analyze a business idea before spending money, from the problem and market to competition and early monetization, and how Madixo helps you see the opportunity more clearly.',
  },
  coverEyebrow: { ar: 'اختبار الفكرة', en: 'Idea Validation' },
  keywords: [
    'analyze business idea',
    'business idea analysis',
    'evaluate startup idea',
    'تحليل فكرة مشروع',
    'startup idea analysis',
  ],
  publishedAt: '2026-04-12',
  updatedAt: '2026-04-12',
  readingTimeMinutes: 7,
  featured: true,
  relatedUseCases: ['madixo-for-first-time-founders', 'madixo-for-ecommerce-and-product-ideas'],
  relatedComparisons: ['madixo-vs-asking-chatgpt-only'],
    relatedPosts: ['how-to-validate-a-business-idea-before-building', 'feasibility-study-vs-business-plan'],
  body: [
    {
      type: 'paragraph',
      text: {
        ar: 'صرف المال مبكرًا لا يجعل الفكرة أفضل. في كثير من الحالات، المشكلة ليست في غياب التنفيذ، بل في غياب التحليل الواضح قبل التنفيذ.',
        en: 'Spending money early does not make an idea better. In many cases, the problem is not a lack of execution, but a lack of clear analysis before execution.',
      },
    },
    {
      type: 'heading',
      text: { ar: 'حلل الفكرة من خمس زوايا', en: 'Analyze the idea from five angles' },
    },
    {
      type: 'list',
      items: [
        {
          ar: 'المشكلة: هل هي واضحة ومتكررة فعلًا؟',
          en: 'Problem: is it clear and repeated enough?',
        },
        {
          ar: 'العميل: من أول شخص سيشعر بها الآن؟',
          en: 'Customer: who is the first person who feels it now?',
        },
        {
          ar: 'السوق: هل توجد مؤشرات على طلب أو محاولات حل حالية؟',
          en: 'Market: are there signals of demand or visible current attempts to solve it?',
        },
        {
          ar: 'المنافسة: ما البدائل التي يستخدمها الناس اليوم؟',
          en: 'Competition: what alternatives are people using today?',
        },
        {
          ar: 'الربحية الأولية: هل يوجد طريق معقول لتحقيق هامش أو عائد؟',
          en: 'Early monetization: is there a reasonable path toward margin or return?',
        },
      ],
    },
    {
      type: 'paragraph',
      text: {
        ar: 'عندما تكون هذه الصورة غير واضحة، يصبح الإنفاق المبكر على التطوير أو التوريد أو التسويق مخاطرة أكبر مما تتوقع. لهذا نبدأ دائمًا بتحليل الفرصة قبل أي التزام كبير.',
        en: 'When this picture is unclear, early spending on development, sourcing, or marketing becomes riskier than it looks. That is why opportunity analysis should come before large commitments.',
      },
    },
    {
      type: 'heading',
      text: { ar: 'متى تعتبر الفكرة ضعيفة في هذه المرحلة؟', en: 'When does an idea look weak at this stage?' },
    },
    {
      type: 'list',
      items: [
        {
          ar: 'عندما تكون الشريحة الأولى ضبابية جدًا.',
          en: 'When the first target segment is too vague.',
        },
        {
          ar: 'عندما لا تستطيع وصف المشكلة بلغة العميل نفسه.',
          en: 'When you cannot describe the problem in the customer’s own language.',
        },
        {
          ar: 'عندما لا ترى بدائل حالية ولا محاولات حل واضحة.',
          en: 'When you cannot see current alternatives or visible attempts to solve it.',
        },
        {
          ar: 'عندما لا يوجد طريق أولي منطقي للربح أو العرض.',
          en: 'When there is no early logical path to an offer or monetization.',
        },
      ],
    },
    {
      type: 'paragraph',
      text: {
        ar: 'Madixo يساعدك هنا لأنه يحول الفكرة إلى قراءة منظمة: الطلب، المنافسة، العميل الأول، المخاطر، ثم الجدوى الأولية وخطة التحقق التالية.',
        en: 'Madixo helps here by turning the idea into a structured read: demand, competition, first customer, risks, then early feasibility and the next validation move.',
      },
    },
  ],
},

{
  slug: 'should-you-do-an-early-feasibility-study-before-launch',
  category: 'feasibility',
  title: {
    ar: 'هل فكرتك تحتاج دراسة جدوى أولية فعلًا قبل الإطلاق؟',
    en: 'Does Your Idea Really Need an Early Feasibility Study Before Launch',
  },
  excerpt: {
    ar: 'ليست كل فكرة تحتاج نموذجًا ماليًا طويلًا من البداية، لكن كثيرًا من الأفكار تحتاج قراءة جدوى أولية قصيرة قبل الالتزام بالتنفيذ أو الصرف.',
    en: 'Not every idea needs a long financial model at the start, but many ideas do need a short early feasibility read before you commit to execution or major spending.',
  },
  seoDescription: {
    ar: 'تعرف على متى تحتاج دراسة جدوى أولية قبل الإطلاق، وما الذي يجب أن تتأكد منه في السوق والتكلفة والهامش قبل أن تمضي أبعد في التنفيذ.',
    en: 'Learn when you need an early feasibility study before launch and what to confirm about the market, costs, and margin before you go further.',
  },
  coverEyebrow: { ar: 'دراسة الجدوى', en: 'Feasibility' },
  keywords: [
    'early feasibility study',
    'idea feasibility before launch',
    'startup feasibility',
    'دراسة جدوى أولية قبل الإطلاق',
    'business idea feasibility',
  ],
  publishedAt: '2026-04-12',
  updatedAt: '2026-04-12',
  readingTimeMinutes: 6,
  featured: true,
  relatedUseCases: ['madixo-for-first-time-founders', 'madixo-for-ecommerce-and-product-ideas'],
  relatedComparisons: ['madixo-vs-feasibility-template-spreadsheets'],
  relatedPosts: ['feasibility-study-vs-business-plan', 'how-to-analyze-a-business-idea-before-spending-money'],
  body: [
    {
      type: 'paragraph',
      text: {
        ar: 'بعض المؤسسين يسمعون كلمة "دراسة جدوى" فيتصورون مباشرة ملفًا معقدًا وجداول طويلة وتوقعات كثيرة. لكن في المراحل المبكرة، ما تحتاجه غالبًا ليس دراسة نهائية، بل قراءة أولية تختبر إن كانت الفكرة تبدو قابلة للمضي أصلًا.',
        en: 'Some founders hear “feasibility study” and immediately imagine a complex file full of long tables and projections. But in early stages, what you usually need is not a final study but an early read that tests whether the idea is workable at all.',
      },
    },
    {
      type: 'heading',
      text: { ar: 'متى تحتاج هذه القراءة الأولية؟', en: 'When do you need this early read?' },
    },
    {
      type: 'list',
      items: [
        {
          ar: 'عندما تكون تكلفة البداية أو التوريد أو التشغيل ليست بسيطة.',
          en: 'When startup, sourcing, or operating costs are not trivial.',
        },
        {
          ar: 'عندما تكون الربحية غير واضحة من أول نظرة.',
          en: 'When margin and monetization are not obvious at first glance.',
        },
        {
          ar: 'عندما تبدو الفكرة جذابة لكنك غير متأكد من واقعية تنفيذها.',
          en: 'When the idea feels attractive but you are not sure it is realistic to execute.',
        },
        {
          ar: 'عندما تحتاج أن تقرر: أستمر، أعدل، أم أتوقف مبكرًا؟',
          en: 'When you need to decide whether to continue, adjust, or stop early.',
        },
      ],
    },
    {
      type: 'paragraph',
      text: {
        ar: 'الهدف هنا ليس بناء ملف مالي نهائي لإقناع جهة خارجية، بل معرفة هل المؤشرات الأولية منطقية بما يكفي لتبرير الخطوة التالية.',
        en: 'The goal is not to build a final financial file for an outside stakeholder, but to know whether the early signals are reasonable enough to justify the next move.',
      },
    },
    {
      type: 'heading',
      text: { ar: 'ما الذي يجب أن يشمله هذا التقييم؟', en: 'What should this assessment include?' },
    },
    {
      type: 'list',
      items: [
        {
          ar: 'وضوح السوق والشريحة الأولى.',
          en: 'Clarity of the market and the first segment.',
        },
        {
          ar: 'تصور أولي للتكلفة والتشغيل.',
          en: 'An early view of costs and operations.',
        },
        {
          ar: 'احتمال وجود هامش أو عائد معقول.',
          en: 'The possibility of a reasonable margin or return.',
        },
        {
          ar: 'أهم المخاطر التي قد تكسر الفكرة مبكرًا.',
          en: 'The main risks that could break the idea early.',
        },
      ],
    },
    {
      type: 'paragraph',
      text: {
        ar: 'لهذا لا تبدأ Madixo من الجداول فقط. تبدأ من تحليل الفرصة أولًا، ثم تضيف دراسة جدوى أولية عندما تكون بحاجة إلى قراءة أقرب للواقع قبل الإطلاق.',
        en: 'That is why Madixo does not start from spreadsheets alone. It starts with opportunity analysis first, then adds early feasibility when you need a more realistic read before launch.',
      },
    },
  ],
},
{
  slug: 'how-to-turn-a-business-idea-into-a-validation-plan',
  category: 'idea-validation',
  title: {
    ar: 'كيف تحول فكرة مشروع إلى خطة تحقق عملية',
    en: 'How to Turn a Business Idea into a Practical Validation Plan',
  },
  excerpt: {
    ar: 'كثير من الأفكار تتوقف عند مرحلة التحليل أو الحماس. هذه المقالة تشرح كيف تحول الفكرة إلى خطوات تحقق واضحة ومحددة بزمن وإشارة نجاح.',
    en: 'Many ideas stop at the analysis or excitement stage. This guide shows how to turn an idea into clear validation steps with timing and success signals.',
  },
  seoDescription: {
    ar: 'تعرف على طريقة عملية لتحويل فكرة مشروع إلى خطة تحقق تشمل الفرضية، التجربة، الإشارة المطلوبة، وكيف تراجع القرار بعد كل جولة.',
    en: 'Learn a practical way to turn a business idea into a validation plan with a hypothesis, an experiment, the signal you need, and how to review the decision after each round.',
  },
  coverEyebrow: { ar: 'اختبار الفكرة', en: 'Idea Validation' },
  keywords: [
    'validation plan',
    'business idea validation plan',
    'test plan for startup idea',
    'خطة تحقق للفكرة',
    'validate business idea',
  ],
  publishedAt: '2026-04-12',
  updatedAt: '2026-04-12',
  readingTimeMinutes: 6,
  featured: true,
  relatedUseCases: ['madixo-for-first-time-founders', 'madixo-for-service-businesses'],
  relatedComparisons: ['madixo-vs-asking-chatgpt-only', 'madixo-vs-generic-market-research-notes'],
  relatedPosts: ['how-to-test-business-demand-before-launch', 'how-to-validate-a-business-idea-before-building'],
  body: [
    {
      type: 'paragraph',
      text: {
        ar: 'بعد تحليل الفكرة تأتي المشكلة التالية: ماذا أفعل الآن عمليًا؟ هنا تضيع كثير من المشاريع بين قراءة جميلة وبين تنفيذ مبكر غير منظم. الحل هو تحويل الفكرة إلى خطة تحقق واضحة، لا إلى قائمة عشوائية من المهام.',
        en: 'After analyzing the idea, the next problem appears: what do I do now in practice? Many projects get lost between a nice report and premature unstructured action. The answer is to turn the idea into a clear validation plan, not a random task list.',
      },
    },
    {
      type: 'heading',
      text: { ar: 'ابدأ بفرضية واحدة واضحة', en: 'Start with one clear hypothesis' },
    },
    {
      type: 'paragraph',
      text: {
        ar: 'لا تبدأ بعشر فرضيات في وقت واحد. اختر أهم نقطة تريد التأكد منها الآن: هل المشكلة متكررة؟ هل الشريحة الأولى مهتمة؟ هل العرض الأول مفهوم؟ هل السعر مقبول؟',
        en: 'Do not start with ten hypotheses at once. Choose the one point you need to confirm now: is the problem repeated, is the first segment interested, is the first offer understandable, or is the price acceptable?',
      },
    },
    {
      type: 'heading',
      text: { ar: 'صمم تجربة قصيرة لاختبارها', en: 'Design a short experiment to test it' },
    },
    {
      type: 'list',
      items: [
        {
          ar: 'مقابلات قصيرة مع شريحة محددة.',
          en: 'Short interviews with a defined segment.',
        },
        {
          ar: 'صفحة بسيطة أو عرض أولي واضح.',
          en: 'A simple page or a clear first offer.',
        },
        {
          ar: 'رسائل مباشرة أو إعلان اختبار صغير.',
          en: 'Direct messages or a small test ad.',
        },
        {
          ar: 'دعوة لتجربة أولية أو حجز مبدئي.',
          en: 'An invitation to a pilot or early reservation.',
        },
      ],
    },
    {
      type: 'paragraph',
      text: {
        ar: 'المهم أن تكون التجربة مرتبطة بفرضية محددة، لا مجرد نشاط يعطيك إحساسًا أنك تتحرك.',
        en: 'What matters is that the experiment is tied to a specific hypothesis, not just activity that makes you feel productive.',
      },
    },
    {
      type: 'heading',
      text: { ar: 'حدد إشارة النجاح مسبقًا', en: 'Define the success signal in advance' },
    },
    {
      type: 'paragraph',
      text: {
        ar: 'قبل أن تبدأ، اسأل نفسك: ما الإشارة التي ستجعلني أقول إن هذه الجولة ناجحة؟ قد تكون عددًا معينًا من الردود الجادة، طلبات متابعة، أسئلة عن السعر، أو موافقات على تجربة صغيرة.',
        en: 'Before you start, ask yourself what signal would make this round successful. It could be a number of serious replies, follow-up requests, pricing questions, or agreements to join a small test.',
      },
    },
    {
      type: 'paragraph',
      text: {
        ar: 'في Madixo تتحول هذه الخطوات إلى مساحة تحقق منظمة: فرضية، تجربة، نتائج، أدلة، ثم خطوة تالية أفضل بدل إعادة البدء من الصفر في كل مرة.',
        en: 'In Madixo, those steps become a structured validation workspace: hypothesis, experiment, outcomes, evidence, and the best next move instead of restarting from zero every time.',
      },
    },
  ],
},
{
  slug: 'signs-your-business-idea-is-not-ready-to-launch-yet',
  category: 'idea-validation',
  title: {
    ar: 'علامات أن فكرتك ليست جاهزة للإطلاق بعد',
    en: 'Signs Your Business Idea Is Not Ready to Launch Yet',
  },
  excerpt: {
    ar: 'أحيانًا يكون التأخير الصحيح أفضل من الإطلاق السريع. هذه المقالة توضح الإشارات التي تعني أن الفكرة ما زالت تحتاج فهمًا أو تحققًا إضافيًا قبل السوق.',
    en: 'Sometimes the right delay is better than a fast launch. This article explains the signals that show your idea still needs more clarity or validation before market launch.',
  },
  seoDescription: {
    ar: 'تعرف على أبرز العلامات التي تعني أن فكرتك ليست جاهزة للإطلاق بعد، من غموض الشريحة إلى ضعف الإشارات السلوكية وعدم وضوح الربحية أو العرض.',
    en: 'Learn the main signs that your idea is not ready to launch yet, from a vague segment to weak behavioral signals and unclear margin or offer structure.',
  },
  coverEyebrow: { ar: 'اختبار الفكرة', en: 'Idea Validation' },
  keywords: [
    'idea not ready to launch',
    'startup launch signs',
    'validate before launch',
    'متى الفكرة ليست جاهزة للإطلاق',
    'launch readiness',
  ],
  publishedAt: '2026-04-12',
  updatedAt: '2026-04-12',
  readingTimeMinutes: 5,
  featured: false,
  relatedUseCases: ['madixo-for-ecommerce-and-product-ideas', 'madixo-for-service-businesses'],
  relatedComparisons: ['madixo-vs-generic-market-research-notes'],
  relatedPosts: ['how-to-know-if-market-demand-is-real', 'how-to-choose-your-best-first-customer'],
  body: [
    {
      type: 'paragraph',
      text: {
        ar: 'الحماس قد يدفعك إلى الإطلاق بسرعة، لكن السرعة ليست دائمًا ميزة. أحيانًا تكون أفضل خطوة هي أن تؤجل الإطلاق قليلًا حتى لا تدخل السوق بعرض غير واضح أو بشريحة غير دقيقة أو بتكلفة لم تفهمها بعد.',
        en: 'Excitement can push you toward a quick launch, but speed is not always an advantage. Sometimes the best move is to delay slightly so you do not enter the market with an unclear offer, a vague segment, or a cost structure you still do not understand.',
      },
    },
    {
      type: 'heading',
      text: { ar: 'أبرز العلامات التحذيرية', en: 'The clearest warning signs' },
    },
    {
      type: 'list',
      items: [
        {
          ar: 'لا تستطيع وصف العميل الأول بجملة واضحة.',
          en: 'You cannot describe the first customer in one clear sentence.',
        },
        {
          ar: 'ردود السوق كانت مجاملات أكثر من سلوك جاد.',
          en: 'Market reactions were more compliments than serious behavior.',
        },
        {
          ar: 'العرض الأول ما زال يتغير كل يوم بلا سبب واضح.',
          en: 'Your first offer keeps changing every day without a clear reason.',
        },
        {
          ar: 'لا يوجد فهم أولي للتكلفة أو الهامش أو نقطة الحساسية في السعر.',
          en: 'There is no early understanding of cost, margin, or pricing sensitivity.',
        },
        {
          ar: 'لا تعرف ما الذي يجب اختباره أولًا في السوق.',
          en: 'You do not know what to test first in the market.',
        },
      ],
    },
    {
      type: 'paragraph',
      text: {
        ar: 'هذه العلامات لا تعني أن الفكرة سيئة بالضرورة، لكنها تعني أن قرار الإطلاق ما زال مبكرًا. الأفضل هنا أن تعود خطوة إلى الوراء: حلل الفكرة، ضيق الشريحة، وابنِ جولة تحقق أقصر وأوضح.',
        en: 'These signs do not necessarily mean the idea is bad, but they do mean the launch decision is still early. The better move is to step back, analyze the idea, narrow the segment, and build a shorter clearer validation round.',
      },
    },
    {
      type: 'paragraph',
      text: {
        ar: 'هذا بالضبط ما يفيد فيه Madixo: لا يدفعك إلى التنفيذ السريع فقط، بل يساعدك على معرفة هل الوقت مناسب للإطلاق أم أن الفكرة تحتاج جولة فهم وتحسين أخرى قبل ذلك.',
        en: 'This is exactly where Madixo helps: it does not only push you toward execution, it helps you decide whether the timing is right for launch or whether the idea still needs another round of learning and improvement.',
      },
    },
  ],
},
];

export const USE_CASES: UseCasePage[] = [
  {
    slug: 'madixo-for-first-time-founders',
    title: { ar: 'Madixo للمؤسسين الجدد', en: 'Madixo for First-Time Founders' },
    summary: {
      ar: 'مناسب لمن لديه فكرة ويريد أن يعرف: هل تستحق التجربة؟ وما الخطوة التالية قبل صرف وقت ومال كبيرين؟',
      en: 'Best for people with an idea who need to know whether it deserves testing and what to do next before spending serious time and money.',
    },
    seoDescription: {
      ar: 'تعرف على كيف يساعد Madixo المؤسسين الجدد على تحليل الفكرة وإنشاء دراسة جدوى أولية وتوثيق ما يتعلمونه من السوق.',
      en: 'See how Madixo helps first-time founders analyze ideas, generate early feasibility, and document what they learn from the market.',
    },
    industry: { ar: 'رواد الأعمال', en: 'Founders' },
    bestFor: [
      { ar: 'من لديه أكثر من فكرة ويريد فرزها', en: 'People comparing more than one idea' },
      { ar: 'من لا يريد البدء بالحدس فقط', en: 'People who do not want to start from instinct alone' },
      { ar: 'من يريد مسارًا أوضح من التحليل إلى القرار', en: 'People who want a clearer path from analysis to decision' },
    ],
    useMadixoFor: [
      { ar: 'تحليل الفرصة بسرعة', en: 'Analyze the opportunity quickly' },
      { ar: 'إنشاء دراسة جدوى أولية', en: 'Generate an early feasibility view' },
      { ar: 'تسجيل ملاحظات السوق', en: 'Capture market notes' },
      { ar: 'تحديد الخطوة التالية', en: 'Define the next move' },
    ],
    workflow: [
      { ar: 'ابدأ بتحليل الفرصة', en: 'Start with opportunity analysis' },
      { ar: 'أضف دراسة جدوى أولية إذا بدت الفرصة واعدة', en: 'Add early feasibility if the opportunity looks promising' },
      { ar: 'ادخل إلى مساحة التحقق وسجّل ما يحدث في السوق', en: 'Move into validation and log what happens in the market' },
      { ar: 'حدّث القرار وأنشئ أفضل خطوة الآن', en: 'Update the decision and generate the best next step' },
    ],
    expectedOutcome: {
      ar: 'قرار أوضح حول الاستمرار أو التعديل أو التوقف بدل الوقوع في تنفيذ مبكر وغير محسوب.',
      en: 'A clearer decision on whether to continue, adjust, or stop instead of drifting into early unstructured execution.',
    },
    relatedPosts: ['how-to-validate-a-business-idea-before-building', 'when-to-use-madixo-instead-of-asking-chatgpt-only', 'how-to-turn-a-business-idea-into-a-validation-plan'],
  },
  {
    slug: 'madixo-for-service-businesses',
    title: { ar: 'Madixo للمشاريع الخدمية', en: 'Madixo for Service Businesses' },
    summary: {
      ar: 'مفيد جدًا للأعمال الخدمية التي تحتاج اختبار الطلب والعرض والسعر قبل التوسع أو التوظيف أو بناء نظام كامل.',
      en: 'A strong fit for service businesses that need to test demand, offer shape, and pricing before scaling, hiring, or building a full system.',
    },
    seoDescription: {
      ar: 'اكتشف كيف يساعد Madixo المشاريع الخدمية على اختبار العرض والسعر والطلب وتحسين القرار قبل التوسع.',
      en: 'See how Madixo helps service businesses test offer, pricing, and demand before scaling.',
    },
    industry: { ar: 'مشاريع خدمية', en: 'Service Businesses' },
    bestFor: [
      { ar: 'الوكالات الصغيرة', en: 'Small agencies' },
      { ar: 'الخدمات المحلية', en: 'Local service businesses' },
      { ar: 'الخدمات الرقمية والاستشارية', en: 'Digital and consulting services' },
    ],
    useMadixoFor: [
      { ar: 'اختيار أفضل عميل أول', en: 'Choose the best first customer' },
      { ar: 'صياغة العرض الأول', en: 'Shape the first offer' },
      { ar: 'تقدير الجدوى الأولية', en: 'Estimate early feasibility' },
      { ar: 'بناء اختبار قصير قبل التوسع', en: 'Build a short validation test before scaling' },
    ],
    workflow: [
      { ar: 'حلل الفرصة والطلب والمنافسة', en: 'Analyze the opportunity, demand, and competition' },
      { ar: 'أنشئ دراسة جدوى أولية لتكلفة البداية والهامش التقريبي', en: 'Generate early feasibility for startup cost and rough margin' },
      { ar: 'اختبر الرسالة والعرض والسعر مع السوق', en: 'Test the message, offer, and price with the market' },
      { ar: 'سجل نتائجك وعدّل الخطوة التالية', en: 'Save the outcomes and adjust the next move' },
    ],
    expectedOutcome: {
      ar: 'خفض مخاطرة التوسع المبكر وبناء عرض أوضح وسعر أقرب للواقع.',
      en: 'Lower the risk of scaling too early and build a clearer offer with more realistic pricing.',
    },
    relatedPosts: ['difference-between-opportunity-analysis-and-feasibility-study', 'how-to-choose-your-best-first-customer', 'how-to-turn-a-business-idea-into-a-validation-plan'],
  },
  {
    slug: 'madixo-for-agencies-and-consultants',
    title: { ar: 'Madixo للوكالات والمستشارين', en: 'Madixo for Agencies and Consultants' },
    summary: {
      ar: 'يمكن استخدام Madixo داخليًا لفحص أفكار الخدمات الجديدة أو مع العملاء لإعطائهم مسار قرار أوضح.',
      en: 'Madixo can be used internally to assess new service ideas or with clients to give them a clearer decision path.',
    },
    seoDescription: {
      ar: 'تعرف على كيف تستفيد الوكالات والمستشارون من Madixo في تحليل الفرص وبناء قرارات أوضح لأنفسهم أو لعملائهم.',
      en: 'Learn how agencies and consultants can use Madixo to analyze opportunities and build clearer decisions for themselves or their clients.',
    },
    industry: { ar: 'وكالات واستشارات', en: 'Agencies and Consulting' },
    bestFor: [
      { ar: 'وكالات تريد تقييم عروض جديدة', en: 'Agencies evaluating new offers' },
      { ar: 'مستشارون يقدمون دراسات أولية للعملاء', en: 'Consultants preparing early assessments for clients' },
      { ar: 'فرق تريد توحيد طريقة التفكير', en: 'Teams that want a more consistent decision workflow' },
    ],
    useMadixoFor: [
      { ar: 'تحليل أفكار داخلية جديدة', en: 'Analyze internal new ideas' },
      { ar: 'إعطاء العميل تقريرًا أوضح', en: 'Give the client a clearer report' },
      { ar: 'بناء مساحة تحقق بدل التوصيات العامة فقط', en: 'Build a validation workspace instead of generic advice' },
      { ar: 'تقديم مخرجات قابلة للمراجعة', en: 'Deliver outputs that are easier to review' },
    ],
    workflow: [
      { ar: 'حلل فكرة العميل أو العرض الجديد', en: 'Analyze the client idea or the new offer' },
      { ar: 'أضف الجدوى الأولية عند الحاجة', en: 'Add early feasibility when relevant' },
      { ar: 'خطط للتجربة وسجل الأدلة', en: 'Plan the validation and capture evidence' },
      { ar: 'حدّد الاتجاه التالي بوضوح', en: 'Clarify the next direction' },
    ],
    expectedOutcome: {
      ar: 'عملية أكثر مهنية من مجرد تقرير جامد أو ملاحظات متفرقة.',
      en: 'A more professional process than a static report or scattered notes.',
    },
    relatedPosts: ['how-to-document-market-notes-that-improve-decisions', 'how-to-turn-a-business-idea-into-a-validation-plan'],
  },
  {
    slug: 'madixo-for-ecommerce-and-product-ideas',
    title: { ar: 'Madixo لأفكار المنتجات والتجارة الإلكترونية', en: 'Madixo for Product Ideas and Ecommerce' },
    summary: {
      ar: 'إذا كنت تفكر في منتج أو براند أو متجر إلكتروني، يساعدك Madixo على فرز الفكرة وقراءة الجدوى الأولية وتحديد أفضل بداية.',
      en: 'If you are exploring a product, a brand, or an ecommerce idea, Madixo helps you sort the idea, read early feasibility, and define the best starting point.',
    },
    seoDescription: {
      ar: 'اكتشف كيف يستخدم Madixo مع أفكار المنتجات والبراندات والمتاجر الإلكترونية قبل البدء بالتوريد أو التصنيع أو التوسع.',
      en: 'See how Madixo can be used with product, brand, and ecommerce ideas before sourcing, manufacturing, or scaling.',
    },
    industry: { ar: 'تجارة إلكترونية ومنتجات', en: 'Ecommerce and Products' },
    bestFor: [
      { ar: 'البراندات الناشئة', en: 'Early-stage brands' },
      { ar: 'أفكار المنتجات الجديدة', en: 'New product ideas' },
      { ar: 'متاجر تبحث عن خطوط جديدة', en: 'Stores exploring new lines' },
    ],
    useMadixoFor: [
      { ar: 'فحص وضوح المشكلة أو الرغبة', en: 'Check whether the desire or problem is clear' },
      { ar: 'قراءة الجدوى الأولية للهامش والتكلفة', en: 'Read early feasibility for margin and cost' },
      { ar: 'اختيار الشريحة الأولى', en: 'Choose the first segment' },
      { ar: 'بناء تجربة سوق قبل الالتزام الكبير', en: 'Build a market test before a bigger commitment' },
    ],
    workflow: [
      { ar: 'حلل السوق والمنافسة والعرض', en: 'Analyze the market, competition, and offer' },
      { ar: 'أنشئ دراسة جدوى أولية للتكلفة والسيناريوهات', en: 'Generate early feasibility for cost and scenarios' },
      { ar: 'خطط لاختبار قصير مع السوق', en: 'Plan a short validation with the market' },
      { ar: 'عدل الاتجاه بناءً على الأدلة', en: 'Adjust direction based on evidence' },
    ],
    expectedOutcome: {
      ar: 'تقليل احتمال الالتزام المبكر في منتج أو مخزون قبل أن تتأكد من وضوح الاتجاه.',
      en: 'Reduce the chance of overcommitting to a product or inventory before the direction is clear.',
    },
    relatedPosts: ['difference-between-opportunity-analysis-and-feasibility-study', 'how-to-know-if-market-demand-is-real', 'signs-your-business-idea-is-not-ready-to-launch-yet'],
  },
];

export const COMPARISONS: ComparisonPage[] = [
  {
    slug: 'madixo-vs-asking-chatgpt-only',
    title: { ar: 'Madixo مقابل الاكتفاء بسؤال ChatGPT فقط', en: 'Madixo vs Asking ChatGPT Only' },
    summary: {
      ar: 'ChatGPT مفيد للبداية، لكن Madixo أقوى عندما تحتاج تحليلًا منظمًا ومسار تحقق وتوثيق أدلة وقرارًا لاحقًا.',
      en: 'ChatGPT is useful for getting started, but Madixo is stronger when you need structured analysis, validation, evidence capture, and a later decision.',
    },
    seoDescription: {
      ar: 'قارن بين Madixo وبين الاكتفاء بسؤال ChatGPT فقط عند تقييم فكرة مشروع واتخاذ قرار أوضح.',
      en: 'Compare Madixo with asking ChatGPT only when evaluating a business idea and making a clearer decision.',
    },
    compareAgainst: { ar: 'الاكتفاء بسؤال ChatGPT', en: 'Asking ChatGPT only' },
    bestWhen: [
      { ar: 'تريد تحليلًا منظمًا لا إجابة واحدة فقط', en: 'You want structured analysis rather than a single answer' },
      { ar: 'تحتاج حفظ التقارير ودراسة الجدوى وملاحظات السوق', en: 'You need saved reports, feasibility, and market notes' },
      { ar: 'تريد خطوة تالية مبنية على الأدلة', en: 'You want a next move driven by evidence' },
    ],
    whyMadixo: [
      { ar: 'مسار متدرج من التحليل إلى التحقق', en: 'A staged workflow from analysis to validation' },
      { ar: 'حفظ التقارير ودراسة الجدوى والقرارات', en: 'Saved reports, feasibility, and decisions' },
      { ar: 'مخرجات PDF قابلة للمشاركة', en: 'Shareable PDF exports' },
      { ar: 'رؤية قرار وخطوة تالية', en: 'Decision view and best next step' },
    ],
    notFor: [
      { ar: 'من يريد فقط عصفًا ذهنيًا سريعًا دون حفظ أو متابعة', en: 'People who only want fast brainstorming without persistence' },
    ],
    relatedPosts: ['when-to-use-madixo-instead-of-asking-chatgpt-only', 'how-to-turn-a-business-idea-into-a-validation-plan'],
  },
  {
    slug: 'madixo-vs-feasibility-template-spreadsheets',
    title: { ar: 'Madixo مقابل قوالب الجداول التقليدية للجدوى', en: 'Madixo vs Traditional Feasibility Spreadsheet Templates' },
    summary: {
      ar: 'القوالب التقليدية تفيد في إدخال الأرقام، لكن Madixo يربط بين تحليل الفرصة والجدوى الأولية والتحقق بدل أن يعزل كل شيء في ملف واحد صامت.',
      en: 'Traditional templates help with entering numbers, but Madixo connects opportunity analysis, early feasibility, and validation instead of isolating everything in one silent file.',
    },
    seoDescription: {
      ar: 'قارن بين Madixo وبين قوالب الجداول التقليدية لدراسة الجدوى، ومتى يكون كل خيار مناسبًا.',
      en: 'Compare Madixo with traditional feasibility spreadsheet templates and see when each approach makes sense.',
    },
    compareAgainst: { ar: 'قوالب الجداول التقليدية', en: 'Spreadsheet templates' },
    bestWhen: [
      { ar: 'تريد ربط الأرقام بالسوق لا بالجداول فقط', en: 'You want numbers connected to market learning, not only to sheets' },
      { ar: 'تريد مسارًا يبدأ من الفكرة لا من الجدول مباشرة', en: 'You want a workflow that starts from the idea, not from the spreadsheet' },
      { ar: 'تريد تحويل النتيجة إلى تجربة وقرار', en: 'You want to turn the result into validation and decision' },
    ],
    whyMadixo: [
      { ar: 'تحليل فرصة قبل الجدوى', en: 'Opportunity analysis before feasibility' },
      { ar: 'دراسة جدوى أولية بصياغة أوضح للمؤسس', en: 'Early feasibility with clearer founder-facing outputs' },
      { ar: 'الانتقال إلى التحقق وتسجيل الأدلة', en: 'A direct move into validation and evidence capture' },
    ],
    notFor: [
      { ar: 'من يريد نموذجًا محاسبيًا نهائيًا شديد التفصيل', en: 'People looking for a final highly detailed accounting model' },
    ],
    relatedPosts: ['difference-between-opportunity-analysis-and-feasibility-study', 'feasibility-study-vs-business-plan', 'should-you-do-an-early-feasibility-study-before-launch'],
  },
  {
    slug: 'madixo-vs-generic-market-research-notes',
    title: { ar: 'Madixo مقابل ملاحظات أبحاث السوق العامة', en: 'Madixo vs Generic Market Research Notes' },
    summary: {
      ar: 'الملاحظات العامة مفيدة، لكن Madixo أقوى عندما تريد تحويل الملاحظات إلى رؤية قرار وخطوة عملية تالية.',
      en: 'General notes are useful, but Madixo becomes stronger when you want to turn them into a decision view and a next action.',
    },
    seoDescription: {
      ar: 'تعرف على الفرق بين ملاحظات أبحاث السوق العامة وبين استخدام Madixo لتجميع الأدلة وتحويلها إلى قرار أوضح.',
      en: 'Understand the difference between generic market research notes and using Madixo to turn evidence into a clearer decision.',
    },
    compareAgainst: { ar: 'ملاحظات أبحاث السوق العامة', en: 'Generic market research notes' },
    bestWhen: [
      { ar: 'تريد حفظ الأدلة بطريقة منظمة', en: 'You want evidence stored in a structured way' },
      { ar: 'تريد رؤية ما الذي تكرر وما الذي يستحق التعديل', en: 'You want to see what repeated and what deserves change' },
      { ar: 'تريد خطوة عملية لاحقة لا مجرد أرشيف ملاحظات', en: 'You want a next move, not only an archive of notes' },
    ],
    whyMadixo: [
      { ar: 'تسجيل ملاحظات السوق مع مصدر وقوة إشارة', en: 'Market notes with source and signal strength' },
      { ar: 'خلاصة أدلة مبنية على ما تراكم', en: 'Evidence synthesis based on accumulated notes' },
      { ar: 'قرار حالي وخطوة الآن', en: 'Current decision and best step now' },
    ],
    notFor: [
      { ar: 'من يريد فقط مكانًا خامًا لتجميع النصوص دون تحليل لاحق', en: 'People who only need a raw place to store text without later analysis' },
    ],
    relatedPosts: ['how-to-document-market-notes-that-improve-decisions', 'signs-your-business-idea-is-not-ready-to-launch-yet', 'how-to-test-business-demand-before-launch'],
  },
];

export function getAllBlogPosts() {
  return [...BLOG_POSTS].sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));
}

export function getFeaturedBlogPosts() {
  return getAllBlogPosts().filter((post) => post.featured);
}

export function getBlogPostBySlug(slug: string) {
  return BLOG_POSTS.find((post) => post.slug === slug) ?? null;
}

export function getBlogPostsByCategory(category: ContentCategory | 'all') {
  if (category === 'all') return getAllBlogPosts();
  return getAllBlogPosts().filter((post) => post.category === category);
}

export function getUseCases() {
  return [...USE_CASES];
}

export function getUseCaseBySlug(slug: string) {
  return USE_CASES.find((item) => item.slug === slug) ?? null;
}

export function getComparisons() {
  return [...COMPARISONS];
}

export function getComparisonBySlug(slug: string) {
  return COMPARISONS.find((item) => item.slug === slug) ?? null;
}

export function getPostsBySlugs(slugs: string[] = []) {
  const set = new Set(slugs);
  return getAllBlogPosts().filter((post) => set.has(post.slug));
}

export function getUseCasesBySlugs(slugs: string[] = []) {
  const set = new Set(slugs);
  return getUseCases().filter((item) => set.has(item.slug));
}

export function getComparisonsBySlugs(slugs: string[] = []) {
  const set = new Set(slugs);
  return getComparisons().filter((item) => set.has(item.slug));
}
