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
    en: 'Should You Do an Early Feasibility Study Before Launch?',
  },
  excerpt: {
    ar: 'ليست كل فكرة تحتاج خطة طويلة من البداية. هذه المقالة تساعدك أن تعرف متى تحتاج دراسة جدوى أولية، ومتى يكفي تحليل الفرصة أولًا.',
    en: 'Not every idea needs a long plan from day one. This article helps you decide when an early feasibility study is useful and when opportunity analysis alone should come first.',
  },
  seoDescription: {
    ar: 'تعرف متى تحتاج فكرتك إلى دراسة جدوى أولية قبل الإطلاق، وما الفرق بين هذه المرحلة وبين تحليل الفرصة الأولي داخل Madixo.',
    en: 'Learn when your idea actually needs an early feasibility study before launch and how that stage differs from first-pass opportunity analysis inside Madixo.',
  },
  coverEyebrow: { ar: 'دراسة الجدوى', en: 'Feasibility' },
  keywords: [
    'early feasibility study',
    'should I do a feasibility study',
    'دراسة جدوى أولية',
    'متى أحتاج دراسة جدوى',
    'feasibility before launch',
  ],
  publishedAt: '2026-04-12T20:10:00.000Z',
  updatedAt: '2026-04-12T20:10:00.000Z',
  readingTimeMinutes: 6,
  featured: false,
  relatedUseCases: ['madixo-for-first-time-founders', 'madixo-for-service-businesses'],
  relatedComparisons: ['madixo-vs-feasibility-template-spreadsheets'],
  relatedPosts: ['feasibility-study-vs-business-plan', 'how-to-analyze-a-business-idea-before-spending-money'],
  body: [
    {
      type: 'paragraph',
      text: {
        ar: 'السؤال ليس: هل دراسة الجدوى شيء مهم دائمًا؟ بل: هل هذه الفكرة وصلت إلى مرحلة تحتاج فيها قراءة مالية وتشغيلية أولية؟ بعض الأفكار ما زالت تحتاج فقط إلى فهم أوضح للمشكلة والسوق قبل أن تنتقل إلى أي تقدير رقمي.',
        en: 'The real question is not whether feasibility is always important. It is whether the idea has reached a stage where it needs an early financial and operational read. Some ideas still need clearer problem and market understanding before any numerical estimation makes sense.',
      },
    },
    {
      type: 'heading',
      text: { ar: 'متى تكون دراسة الجدوى الأولية مفيدة؟', en: 'When is an early feasibility study useful?' },
    },
    {
      type: 'list',
      items: [
        {
          ar: 'عندما أصبحت الشريحة الأولى أوضح، ولم تعد الفكرة عامة جدًا.',
          en: 'When the first target segment is clearer and the idea is no longer too broad.',
        },
        {
          ar: 'عندما بدأت ترى عرضًا أوليًا يمكن تسعيره أو اختباره.',
          en: 'When you can already see an early offer that can be priced or tested.',
        },
        {
          ar: 'عندما تحتاج أن تفهم تكاليف البداية والحد الأدنى المعقول للدخول.',
          en: 'When you need to understand startup costs and the minimum sensible way to enter the market.',
        },
        {
          ar: 'عندما تريد مقارنة أكثر من سيناريو قبل الالتزام بالتنفيذ.',
          en: 'When you want to compare more than one scenario before committing to execution.',
        },
      ],
    },
    {
      type: 'heading',
      text: { ar: 'ومتى لا تزال مبكرًا على هذه المرحلة؟', en: 'And when is it still too early?' },
    },
    {
      type: 'paragraph',
      text: {
        ar: 'إذا كنت لا تزال غير قادر على وصف العميل الأول بوضوح، أو لم تر إشارات طلب كافية، أو لم يتضح بعد ما الذي ستبيعه تحديدًا، فالأفضل أن تبدأ بتحليل الفرصة والتحقق بدلًا من القفز مباشرة إلى أرقام تبدو دقيقة وهي مبنية على افتراضات ضبابية.',
        en: 'If you still cannot clearly describe the first customer, have not seen enough demand signals, or do not yet know exactly what you would sell, it is better to start with opportunity analysis and validation instead of jumping into numbers that look precise but are built on fuzzy assumptions.',
      },
    },
    {
      type: 'paragraph',
      text: {
        ar: 'لهذا المسار العملي في Madixo غالبًا يكون: تحليل الفرصة أولًا، ثم دراسة جدوى أولية مختصرة عندما تصبح الصورة أوضح، ثم مساحة تحقق تجمع الأدلة قبل أي توسع جاد.',
        en: 'That is why the practical path in Madixo is often: opportunity analysis first, then a short early feasibility read once the picture is clearer, then a validation workspace to capture evidence before any serious expansion.',
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
    ar: 'الفكرة وحدها لا تكفي. هذه المقالة تشرح كيف تنتقل من وصف عام للفكرة إلى خطوات تحقق واضحة: ماذا تختبر، ومع من، وما الإشارة التي تبحث عنها.',
    en: 'An idea by itself is not enough. This article shows how to move from a broad concept into a clear validation plan: what to test, with whom, and which signal matters.',
  },
  seoDescription: {
    ar: 'تعرف على طريقة عملية لتحويل فكرة مشروع إلى خطة تحقق واضحة تشمل الفرضيات والأسئلة والتجربة الأولى وكيف يساعدك Madixo على تنظيم ذلك.',
    en: 'Learn a practical way to turn a business idea into a clear validation plan, including assumptions, questions, the first test, and how Madixo helps organize it.',
  },
  coverEyebrow: { ar: 'اختبار الفكرة', en: 'Idea Validation' },
  keywords: [
    'validation plan',
    'business idea validation plan',
    'خطة تحقق',
    'تحويل الفكرة إلى خطة',
    'idea testing plan',
  ],
  publishedAt: '2026-04-12T20:20:00.000Z',
  updatedAt: '2026-04-12T20:20:00.000Z',
  readingTimeMinutes: 6,
  featured: false,
  relatedUseCases: ['madixo-for-first-time-founders', 'madixo-for-agencies-and-consultants'],
  relatedComparisons: ['madixo-vs-asking-chatgpt-only'],
  relatedPosts: ['how-to-test-business-demand-before-launch', 'how-to-validate-a-business-idea-before-building'],
  body: [
    {
      type: 'paragraph',
      text: {
        ar: 'كثير من المؤسسين يقولون: سنختبر الفكرة. لكن عندما تسألهم كيف بالضبط، تكون الإجابة عامة جدًا. خطة التحقق الجيدة لا تبدأ من الحماس، بل من فرضية واضحة وسؤال واضح وتجربة صغيرة قابلة للتنفيذ.',
        en: 'Many founders say they will validate the idea. But when you ask how exactly, the answer is often too vague. A good validation plan starts not with excitement, but with a clear assumption, a clear question, and a small executable test.',
      },
    },
    {
      type: 'heading',
      text: { ar: 'ابدأ بالفرضية الأساسية', en: 'Start with the core assumption' },
    },
    {
      type: 'list',
      items: [
        {
          ar: 'ما الذي تعتقد أنه صحيح في السوق أو العميل أو العرض؟',
          en: 'What do you believe is true about the market, customer, or offer?',
        },
        {
          ar: 'ما السؤال الذي سيؤكد هذه الفرضية أو يضعفها؟',
          en: 'What question would confirm or weaken that assumption?',
        },
        {
          ar: 'ما أصغر تجربة يمكن أن تكشف الجواب؟',
          en: 'What is the smallest experiment that can reveal the answer?',
        },
      ],
    },
    {
      type: 'heading',
      text: { ar: 'حدد نوع الإشارة التي تبحث عنها', en: 'Define the signal you are looking for' },
    },
    {
      type: 'paragraph',
      text: {
        ar: 'ليست كل نتيجة مفيدة. أحيانًا تجمع آراء كثيرة لكن لا تعرف ماذا تعني. لذلك حدد مسبقًا: هل تبحث عن حجز؟ طلب متابعة؟ سؤال عن السعر؟ تكرار نفس الاعتراض؟ كل هذا أهم من انطباع عام مثل: الفكرة جميلة.',
        en: 'Not every result is useful. Sometimes you collect many opinions but still do not know what they mean. So define in advance whether you are looking for bookings, follow-up requests, price questions, or repeated objections. All of these matter more than a broad impression like “nice idea.”',
      },
    },
    {
      type: 'paragraph',
      text: {
        ar: 'داخل Madixo، تتحول هذه الخطوات إلى مساحة تحقق منظمة: الفرضية، التجربة، الأدلة، وما الذي يجب فعله في الجولة التالية بدل تكرار نفس المحاولة بشكل عشوائي.',
        en: 'Inside Madixo, these steps turn into a structured validation workspace: the assumption, the experiment, the evidence, and what to do in the next round instead of repeating the same attempt randomly.',
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
    ar: 'أحيانًا لا تكون المشكلة في قلة الحماس، بل في أن الفكرة ما زالت ضبابية. هذه المقالة تجمع إشارات مبكرة تدل على أن الوقت لم يحن للإطلاق الكامل بعد.',
    en: 'Sometimes the issue is not lack of excitement, but that the idea is still too blurry. This article gathers early signs that it is not time for a full launch yet.',
  },
  seoDescription: {
    ar: 'تعرف على العلامات التي تدل على أن فكرة مشروعك ليست جاهزة للإطلاق بعد، ومتى تحتاج إلى مزيد من التحليل أو التحقق قبل صرف الوقت والمال.',
    en: 'Learn the signs that a business idea is not ready to launch yet and when you need more analysis or validation before committing time and money.',
  },
  coverEyebrow: { ar: 'اختبار الفكرة', en: 'Idea Validation' },
  keywords: [
    'not ready to launch',
    'business idea red flags',
    'علامات ضعف الفكرة',
    'متى لا أطلق المشروع',
    'idea validation warning signs',
  ],
  publishedAt: '2026-04-12T20:30:00.000Z',
  updatedAt: '2026-04-12T20:30:00.000Z',
  readingTimeMinutes: 5,
  featured: false,
  relatedUseCases: ['madixo-for-first-time-founders'],
  relatedComparisons: ['madixo-vs-asking-chatgpt-only', 'madixo-vs-generic-market-research-notes'],
  relatedPosts: ['how-to-analyze-a-business-idea-before-spending-money', 'how-to-know-if-market-demand-is-real'],
  body: [
    {
      type: 'paragraph',
      text: {
        ar: 'الإطلاق المبكر ليس شجاعة دائمًا. أحيانًا يكون مجرد هروب من الأسئلة الصعبة. إذا كانت الصورة ما تزال ضبابية، فالتسرع قد يجعلك تنفق على شيء لم يتضح بعد لمن هو، وما مشكلته، ولماذا سيدفع له أحد.',
        en: 'Launching early is not always courage. Sometimes it is just an escape from hard questions. If the picture is still blurry, rushing forward can make you spend on something that is still unclear: who it is for, what problem it solves, and why anyone would pay for it.',
      },
    },
    {
      type: 'heading',
      text: { ar: 'إشارات تستحق أن تتوقف عندها', en: 'Signals worth stopping for' },
    },
    {
      type: 'list',
      items: [
        {
          ar: 'لا تستطيع وصف العميل الأول في جملة واضحة.',
          en: 'You cannot describe the first customer in one clear sentence.',
        },
        {
          ar: 'ما زالت الفكرة تتغير كل مرة تشرحها فيها.',
          en: 'The idea keeps changing every time you explain it.',
        },
        {
          ar: 'لا ترى إشارات طلب حقيقية، فقط مجاملات أو إعجاب عام.',
          en: 'You see no real demand signals, only compliments or general enthusiasm.',
        },
        {
          ar: 'لا تعرف ما هو العرض الأول البسيط الذي يمكنك اختباره.',
          en: 'You do not know what simple first offer you could test.',
        },
        {
          ar: 'لا توجد رؤية أولية معقولة للتكلفة أو الهامش أو طريقة الدخول.',
          en: 'There is no sensible early view of cost, margin, or market entry.',
        },
      ],
    },
    {
      type: 'paragraph',
      text: {
        ar: 'هذه العلامات لا تعني أن الفكرة سيئة نهائيًا، لكنها تعني أن المرحلة الصحيحة الآن ليست الإطلاق، بل مزيد من التحليل والتحقق. القرار الجيد أحيانًا هو تأخير التنفيذ أسبوعين أو شهرًا لتوضيح ما سيختصر عليك شهورًا من الدوران لاحقًا.',
        en: 'These signs do not mean the idea is permanently bad. They mean the right stage right now is not launch, but more analysis and validation. Sometimes the best decision is delaying execution by two weeks or a month to clarify what could save you months of wasted motion later.',
      },
    },
    {
      type: 'paragraph',
      text: {
        ar: 'Madixo مفيد هنا لأنه لا يدفعك إلى قرار متسرع، بل يساعدك على رؤية نقاط الضعف مبكرًا ثم تحويلها إلى أسئلة وخطوات تحقق أوضح قبل أن تتورط في تنفيذ أكبر من المرحلة.',
        en: 'Madixo is useful here because it does not push you into a rushed decision. It helps you spot weak points early, then turn them into clearer questions and validation steps before you commit to execution that is too large for the stage.',
      },
    },
  ],
},

{
  slug: 'when-to-stop-collecting-opinions-and-start-validating',
  category: 'idea-validation',
  title: {
    ar: 'متى تتوقف عن جمع الآراء وتبدأ التحقق العملي',
    en: 'When to Stop Collecting Opinions and Start Validating',
  },
  excerpt: {
    ar: 'الاستماع مهم، لكن كثرة الآراء قد تربكك أكثر مما تفيدك. هذه المقالة تساعدك على معرفة اللحظة التي تنتقل فيها من السماع إلى تجربة عملية تكشف القرار.',
    en: 'Listening matters, but too many opinions can confuse you more than help you. This article helps you see when to move from listening into a practical validation step.',
  },
  seoDescription: {
    ar: 'تعرف على الوقت المناسب للتوقف عن جمع الآراء العامة والبدء في التحقق العملي من الفكرة بخطوة صغيرة تكشف وجود الطلب أو ضعفه.',
    en: 'Learn when to stop collecting general opinions and begin practical validation with a small step that reveals whether demand is real or weak.',
  },
  coverEyebrow: { ar: 'اختبار الفكرة', en: 'Idea Validation' },
  keywords: [
    'متى أبدأ اختبار الفكرة',
    'stop collecting opinions',
    'idea validation steps',
    'business idea feedback',
    'validate instead of asking',
  ],
  publishedAt: '2026-04-12T21:15:00.000Z',
  updatedAt: '2026-04-12T21:15:00.000Z',
  readingTimeMinutes: 5,
  featured: false,
  relatedUseCases: ['madixo-for-first-time-founders', 'madixo-for-service-businesses'],
  relatedComparisons: ['madixo-vs-asking-chatgpt-only'],
  relatedPosts: ['how-to-test-business-demand-before-launch', 'signs-your-business-idea-is-not-ready-to-launch-yet'],
  body: [
    {
      type: 'paragraph',
      text: {
        ar: 'في البداية تحتاج أن تسمع. لكن هناك نقطة تتحول فيها الآراء الكثيرة إلى ضباب. كل شخص يعطيك رأيًا مختلفًا، وأنت لا تقترب من القرار بل تبتعد عنه. هنا يجب أن يتغير السؤال من: ماذا يظن الناس؟ إلى: ماذا سيفعل الناس فعلاً؟',
        en: 'At the beginning, you do need to listen. But there is a point where too many opinions turn into fog. Everyone gives you a different take, and instead of getting closer to a decision, you move further away. At that point, the question must change from “what do people think?” to “what will people actually do?”',
      },
    },
    {
      type: 'heading',
      text: { ar: 'متى يكون الوقت مناسبًا للانتقال؟', en: 'When is it time to move on?' },
    },
    {
      type: 'list',
      items: [
        {
          ar: 'عندما تبدأ تسمع نفس المشكلة أو نفس الاعتراض أكثر من مرة.',
          en: 'When you keep hearing the same problem or objection more than once.',
        },
        {
          ar: 'عندما تصبح الآراء عامة جدًا ولا تضيف قرارًا جديدًا.',
          en: 'When the feedback becomes too general and no longer adds a better decision.',
        },
        {
          ar: 'عندما يمكنك صياغة فرضية واضحة يمكن اختبارها بخطوة صغيرة.',
          en: 'When you can write a clear assumption that can be tested with one small step.',
        },
      ],
    },
    {
      type: 'paragraph',
      text: {
        ar: 'التحقق العملي لا يعني بناء المنتج كاملًا. قد يعني عرضًا أوليًا، صفحة بسيطة، رسالة موجهة لشريحة محددة، أو تجربة حجز مبدئي. الهدف ليس الإقناع، بل كشف السلوك الحقيقي.',
        en: 'Practical validation does not mean building the full product. It may mean a first offer, a simple page, a targeted message to one segment, or a lightweight pre-booking test. The goal is not persuasion. The goal is to reveal real behavior.',
      },
    },
    {
      type: 'paragraph',
      text: {
        ar: 'في Madixo يمكنك أخذ الفكرة أو الملاحظة وتحويلها إلى سؤال أوضح، ثم ربطها بخطوة تحقق بدلاً من البقاء في دائرة آراء لا تنتهي.',
        en: 'In Madixo, you can turn the idea or the market note into a clearer question, then connect it to a validation step instead of staying stuck in an endless loop of opinions.',
      },
    },
  ],
},
{
  slug: 'how-to-choose-the-best-market-to-start-with',
  category: 'market-research',
  title: {
    ar: 'كيف تختار السوق الأول الذي تبدأ به',
    en: 'How to Choose the Best Market to Start With',
  },
  excerpt: {
    ar: 'ليس كل سوق مناسبًا للبداية حتى لو كانت الفكرة جيدة. هذه المقالة تساعدك على اختيار السوق الأول الأسهل دخولًا والأوضح طلبًا.',
    en: 'Not every market is the right starting point even when the idea is good. This article helps you choose the first market that is easiest to enter and clearest in demand.',
  },
  seoDescription: {
    ar: 'تعرف على كيف تختار السوق الأول لمشروعك الجديد، من وضوح المشكلة وسهولة الوصول إلى العميل إلى سرعة اختبار الطلب وتكلفة الدخول.',
    en: 'Learn how to choose the first market for a new business, from problem clarity and customer access to demand testing speed and cost of entry.',
  },
  coverEyebrow: { ar: 'فهم السوق', en: 'Market Research' },
  keywords: [
    'اختيار السوق الأول',
    'go to market first segment',
    'best market to start with',
    'market entry',
    'first customer segment',
  ],
  publishedAt: '2026-04-12T21:25:00.000Z',
  updatedAt: '2026-04-12T21:25:00.000Z',
  readingTimeMinutes: 5,
  featured: false,
  relatedUseCases: ['madixo-for-agencies-and-consultants', 'madixo-for-service-businesses'],
  relatedComparisons: ['madixo-vs-generic-market-research-notes'],
  relatedPosts: ['how-to-know-if-market-demand-is-real', 'how-to-choose-your-best-first-customer'],
  body: [
    {
      type: 'paragraph',
      text: {
        ar: 'أحد أسباب تعثر البداية هو محاولة دخول سوق واسع جدًا من أول يوم. الفكرة قد تكون مناسبة، لكن اختيار سوق البداية الخاطئ يجعل الاختبار أبطأ، والوصول أصعب، والرسالة أقل وضوحًا.',
        en: 'One reason early execution stalls is trying to enter a market that is too broad on day one. The idea itself may be fine, but a poor starting market makes testing slower, access harder, and messaging less clear.',
      },
    },
    {
      type: 'heading',
      text: { ar: 'ما الذي يجعل سوق البداية جيدًا؟', en: 'What makes a strong starting market?' },
    },
    {
      type: 'list',
      items: [
        {
          ar: 'مشكلة واضحة ومتكررة عند شريحة محددة.',
          en: 'A clear, repeated problem for a specific segment.',
        },
        {
          ar: 'سهولة الوصول إلى العميل الأول بدون دورة بيع طويلة جدًا.',
          en: 'An easy path to reach the first customer without an overly long sales cycle.',
        },
        {
          ar: 'إمكانية تجربة عرض صغير واستخراج إشارة سريعة من السوق.',
          en: 'The ability to test a small offer and get a quick market signal.',
        },
        {
          ar: 'تكلفة دخول معقولة مقارنة بحجم التعلم المتوقع.',
          en: 'A sensible cost of entry relative to how much you will learn.',
        },
      ],
    },
    {
      type: 'paragraph',
      text: {
        ar: 'لا تبحث في البداية عن أكبر سوق، بل عن أوضح سوق. السوق الأول الجيد هو الذي يعطيك تعلمًا سريعًا ويكشف هل الفكرة قابلة للتقدم أو تحتاج تعديلًا قبل التوسع.',
        en: 'At the start, do not chase the biggest market. Chase the clearest one. A strong first market is the one that gives you fast learning and shows whether the idea is worth pushing forward or needs adjustment before expansion.',
      },
    },
    {
      type: 'paragraph',
      text: {
        ar: 'Madixo يساعدك هنا لأنه لا يكتفي بوصف السوق بشكل عام، بل يدفعك إلى اختيار نقطة دخول أوضح: من هو العميل الأول، وما أفضل عرض أول، وما المخاطر التي قد تبطئ البداية.',
        en: 'Madixo helps here because it does not just describe the market in broad terms. It pushes you toward a clearer entry point: who the first customer is, what the best first offer looks like, and what risks could slow the start.',
      },
    },
  ],
},
{
  slug: 'what-a-good-first-offer-looks-like',
  category: 'positioning',
  title: {
    ar: 'كيف يبدو العرض الأول الجيد لفكرة جديدة',
    en: 'What a Good First Offer Looks Like for a New Idea',
  },
  excerpt: {
    ar: 'العرض الأول ليس النسخة الكاملة من المشروع. هو صياغة بسيطة وواضحة تسمح لك باختبار القيمة قبل التوسع. هذه المقالة تشرح شكله العملي.',
    en: 'A first offer is not the full version of the business. It is a simple, clear framing that lets you test value before scaling. This article explains what that looks like in practice.',
  },
  seoDescription: {
    ar: 'تعرف على شكل العرض الأول الجيد لفكرة مشروع جديدة، وكيف تصنع عرضًا بسيطًا وواضحًا يساعدك على اختبار القيمة قبل بناء شيء أكبر.',
    en: 'Learn what a strong first offer looks like for a new business idea and how to shape a simple, clear offer that tests value before you build something bigger.',
  },
  coverEyebrow: { ar: 'تموضع المنتج', en: 'Positioning' },
  keywords: [
    'first offer',
    'عرض أول للمشروع',
    'offer testing',
    'MVP offer',
    'how to position a new idea',
  ],
  publishedAt: '2026-04-12T21:35:00.000Z',
  updatedAt: '2026-04-12T21:35:00.000Z',
  readingTimeMinutes: 5,
  featured: false,
  relatedUseCases: ['madixo-for-ecommerce-and-product-ideas', 'madixo-for-service-businesses'],
  relatedComparisons: ['madixo-vs-feasibility-template-spreadsheets', 'madixo-vs-asking-chatgpt-only'],
  relatedPosts: ['how-to-turn-a-business-idea-into-a-validation-plan', 'how-to-choose-your-best-first-customer'],
  body: [
    {
      type: 'paragraph',
      text: {
        ar: 'كثير من الأفكار تتعثر ليس لأن الفكرة ضعيفة، بل لأن أول عرض لها كان واسعًا ومبهماً. العميل لا يحتاج في البداية إلى كل شيء. يحتاج أن يفهم بسرعة: ماذا ستفعل له، ولماذا الآن، وما الخطوة التالية.',
        en: 'Many ideas stall not because the idea is weak, but because the first offer is too broad and vague. At the beginning, the customer does not need everything. They need to quickly understand what you will do for them, why now, and what the next step is.',
      },
    },
    {
      type: 'heading',
      text: { ar: 'مكونات العرض الأول الجيد', en: 'The parts of a strong first offer' },
    },
    {
      type: 'list',
      items: [
        {
          ar: 'شريحة عميل واضحة وليست السوق كله.',
          en: 'A clear customer segment instead of “everyone.”',
        },
        {
          ar: 'مشكلة واحدة أو نتيجة واحدة يفهمها العميل بسرعة.',
          en: 'One problem or one outcome the customer understands quickly.',
        },
        {
          ar: 'صيغة تنفيذ بسيطة يمكن تجربتها بدون بناء معقد.',
          en: 'A simple delivery format you can test without heavy execution.',
        },
        {
          ar: 'دعوة واضحة للفعل: تواصل، تجربة، حجز، أو طلب متابعة.',
          en: 'A clear call to action: contact, trial, booking, or follow-up request.',
        },
      ],
    },
    {
      type: 'paragraph',
      text: {
        ar: 'العرض الأول ليس غاية نهائية، بل أداة تعلم. إذا كان واضحًا ومحددًا، ستفهم من السوق بسرعة: هل الناس مهتمون بالفعل؟ ما الذي يربكهم؟ وما الذي يجب تغييره قبل التوسع؟',
        en: 'The first offer is not the final destination. It is a learning tool. If it is clear and specific, the market will tell you quickly whether people are truly interested, what confuses them, and what must change before expansion.',
      },
    },
    {
      type: 'paragraph',
      text: {
        ar: 'داخل Madixo، يخرج لك أفضل عميل أول وأول عرض مناسب ونقطة الدخول الأقرب، وهذا يجعل الانتقال من الفكرة إلى الاختبار أسرع وأقل عشوائية.',
        en: 'Inside Madixo, you get a clearer best first customer, first offer, and entry point, which makes the move from idea to testing faster and less random.',
      },
    },
  ],
},

{
  slug: 'how-to-validate-your-business-idea-step-by-step',
  category: 'idea-validation',
  title: {
    ar: 'كيف تبدأ التحقق من فكرتك خطوة بخطوة',
    en: 'How to Validate Your Business Idea Step by Step',
  },
  excerpt: {
    ar: 'إذا كانت الفكرة ما زالت واسعة أو ضبابية، فهذه المقالة تعطيك مسارًا عمليًا واضحًا: من تعريف المشكلة إلى أول تجربة صغيرة تكشف القرار.',
    en: 'If the idea still feels broad or blurry, this article gives you a practical path from defining the problem to running the first small test that reveals the decision.',
  },
  seoDescription: {
    ar: 'تعرف على طريقة عملية للتحقق من فكرة مشروع خطوة بخطوة، من صياغة المشكلة واختيار العميل الأول إلى بناء اختبار صغير وتسجيل الأدلة.',
    en: 'Learn a practical step-by-step method to validate a business idea, from defining the problem and choosing the first customer to running a small test and documenting evidence.',
  },
  coverEyebrow: { ar: 'اختبار الفكرة', en: 'Idea Validation' },
  keywords: [
    'خطوات التحقق من الفكرة',
    'validate business idea step by step',
    'idea validation process',
    'how to test a business idea',
    'business idea validation checklist',
  ],
  publishedAt: '2026-04-14T09:00:00.000Z',
  updatedAt: '2026-04-14T09:00:00.000Z',
  readingTimeMinutes: 6,
  featured: false,
  relatedUseCases: ['madixo-for-first-time-founders', 'madixo-for-service-businesses'],
  relatedComparisons: ['madixo-vs-asking-chatgpt-only', 'madixo-vs-feasibility-template-spreadsheets'],
  relatedPosts: ['how-to-validate-a-business-idea-before-building', 'how-to-turn-a-business-idea-into-a-validation-plan'],
  body: [
    {
      type: 'paragraph',
      text: {
        ar: 'كثير من الناس يعرفون أنهم يجب أن "يتحققوا من الفكرة"، لكنهم لا يعرفون من أين يبدأون. النتيجة أن التحقق يتحول إلى كلام عام أو تأجيل طويل. الأفضل أن تنظر إليه كسلسلة خطوات صغيرة، لا كمرحلة غامضة.',
        en: 'Many people know they should “validate the idea,” but they do not know where to begin. The result is that validation turns into vague conversation or long delays. It is better to treat it as a series of small steps, not as a fuzzy stage.',
      },
    },
    {
      type: 'heading',
      text: { ar: 'المسار العملي المختصر', en: 'A simple practical sequence' },
    },
    {
      type: 'list',
      items: [
        {
          ar: 'حدد المشكلة بصياغة واضحة ومحددة بدل وصف عام للفكرة.',
          en: 'Define the problem clearly instead of describing the idea in broad terms.',
        },
        {
          ar: 'اختر شريحة عميل أولى واضحة يمكن الوصول إليها الآن.',
          en: 'Choose a clear first customer segment you can reach now.',
        },
        {
          ar: 'اكتب فرضية واحدة: ما الذي تتوقع أن يفعله العميل إذا كان الطلب حقيقيًا؟',
          en: 'Write one assumption: what do you expect the customer to do if demand is real?',
        },
        {
          ar: 'صمم خطوة اختبار صغيرة: رسالة، عرض أولي، صفحة، أو تجربة حجز.',
          en: 'Design one small test: a message, first offer, page, or booking experiment.',
        },
        {
          ar: 'سجل ما حدث فعلاً: الأسئلة، الاعتراضات، الإشارات، وقرارك التالي.',
          en: 'Record what actually happened: questions, objections, signals, and your next decision.',
        },
      ],
    },
    {
      type: 'paragraph',
      text: {
        ar: 'الهدف من هذه الخطوات ليس إثبات أن الفكرة ممتازة بأي طريقة، بل كشف الصورة بسرعة وبأقل تكلفة ممكنة. إذا ظهرت إشارات جيدة، تكمل. وإذا ظهرت نقاط ضعف مبكرًا، تعدل قبل أن يكبر الالتزام.',
        en: 'The goal of these steps is not to prove the idea is great by any means necessary. It is to reveal the picture quickly and with the lowest reasonable cost. If good signals appear, you continue. If weak points show up early, you adjust before the commitment grows.',
      },
    },
    {
      type: 'paragraph',
      text: {
        ar: 'في Madixo، هذا المسار أسهل لأنك لا تبدأ من فراغ: تحليل الفرصة، ثم نقطة دخول أوضح، ثم مساحة تحقق وأدلة تدعم القرار بدل أن تضيع بين ملفات وملاحظات متفرقة.',
        en: 'In Madixo, this sequence becomes easier because you are not starting from zero: opportunity analysis, then a clearer entry point, then a validation workspace and evidence that support the decision instead of scattered notes and disconnected files.',
      },
    },
  ],
},
{
  slug: 'how-to-identify-the-right-first-customer',
  category: 'positioning',
  title: {
    ar: 'كيف تعرف من هو أول عميل يجب أن تستهدفه',
    en: 'How to Identify the Right First Customer',
  },
  excerpt: {
    ar: 'أول عميل لا يعني أي شخص قد يشتري. هذه المقالة تساعدك على اختيار الشريحة الأولى التي تعطيك أوضح تعلم وأسرع إشارة من السوق.',
    en: 'The first customer does not mean anyone who might buy. This article helps you choose the first segment that gives you the clearest learning and the fastest market signal.',
  },
  seoDescription: {
    ar: 'تعرف على كيف تحدد أول عميل مناسب لفكرة مشروعك، ولماذا اختيار الشريحة الأولى الصحيحة يجعل التحقق أسرع والرسالة أوضح.',
    en: 'Learn how to identify the right first customer for your business idea and why the right first segment makes validation faster and messaging clearer.',
  },
  coverEyebrow: { ar: 'تموضع المنتج', en: 'Positioning' },
  keywords: [
    'أول عميل',
    'first customer',
    'target first customer',
    'customer segment for startup',
    'best first customer',
  ],
  publishedAt: '2026-04-14T09:10:00.000Z',
  updatedAt: '2026-04-14T09:10:00.000Z',
  readingTimeMinutes: 5,
  featured: false,
  relatedUseCases: ['madixo-for-ecommerce-and-product-ideas', 'madixo-for-agencies-and-consultants'],
  relatedComparisons: ['madixo-vs-asking-chatgpt-only'],
  relatedPosts: ['how-to-choose-your-best-first-customer', 'how-to-choose-the-best-market-to-start-with'],
  body: [
    {
      type: 'paragraph',
      text: {
        ar: 'من أكبر أسباب بطء البداية أن الرسالة تُوجَّه إلى جمهور واسع جدًا. عندما تحاول التحدث إلى الجميع، يصبح عرضك أخف وأقل إقناعًا. البداية الأقوى غالبًا تأتي من شريحة أولى أصغر لكنها أوضح.',
        en: 'One of the biggest reasons early execution moves slowly is that the message is aimed at a market that is far too broad. When you try to speak to everyone, your offer becomes lighter and less convincing. A stronger start often comes from a smaller but clearer first segment.',
      },
    },
    {
      type: 'heading',
      text: { ar: 'ما الذي يميز أول عميل جيد؟', en: 'What makes a strong first customer?' },
    },
    {
      type: 'list',
      items: [
        {
          ar: 'يشعر بالمشكلة الآن وليس لاحقًا فقط.',
          en: 'They feel the problem now, not only someday later.',
        },
        {
          ar: 'يمكن الوصول إليه بدون تعقيد أو دورة بيع طويلة جدًا.',
          en: 'You can reach them without heavy complexity or an extremely long sales cycle.',
        },
        {
          ar: 'يفهم النتيجة التي تعرضها بسرعة.',
          en: 'They understand the outcome you offer quickly.',
        },
        {
          ar: 'يمكنه إعطاء إشارة واضحة: اهتمام، تجربة، حجز، أو سؤال جاد.',
          en: 'They can give a clear signal: interest, trial, booking, or a serious question.',
        },
      ],
    },
    {
      type: 'paragraph',
      text: {
        ar: 'لا تبحث في البداية عن أكبر شريحة. ابحث عن أوضح شريحة. العميل الأول الجيد ليس فقط من يشتري، بل من يساعدك على فهم أين تنجح الفكرة وأين تحتاج تعديلًا.',
        en: 'At the start, do not chase the largest segment. Chase the clearest segment. The right first customer is not only the one who may buy, but the one who helps you understand where the idea works and where it needs adjustment.',
      },
    },
    {
      type: 'paragraph',
      text: {
        ar: 'Madixo يفيد هنا لأنه يخرج لك أفضل عميل أول ضمن التحليل نفسه، ثم يربطه بأول عرض مناسب والمخاطر والاعتراضات التي قد تظهر في السوق.',
        en: 'Madixo helps here because it surfaces the best first customer inside the analysis itself, then connects that segment to a fitting first offer and the risks and objections that may appear in the market.',
      },
    },
  ],
},
{
  slug: 'how-to-know-if-your-idea-is-worth-executing',
  category: 'feasibility',
  title: {
    ar: 'كيف تعرف أن فكرتك تستحق التنفيذ فعلًا',
    en: 'How to Know If Your Idea Is Actually Worth Executing',
  },
  excerpt: {
    ar: 'ليست كل فكرة جيدة تستحق التنفيذ الآن. هذه المقالة تساعدك على التمييز بين فكرة مثيرة للاهتمام وفكرة تستحق وقتك ومالك وخطوتك التالية.',
    en: 'Not every good idea deserves execution right now. This article helps you separate an interesting idea from one that truly deserves your time, money, and next move.',
  },
  seoDescription: {
    ar: 'تعرف على العلامات التي تدل على أن فكرة مشروعك تستحق التنفيذ فعلًا، من وضوح المشكلة والطلب الأولي إلى إمكانية الربحية والمخاطر العملية.',
    en: 'Learn the signals that show a business idea is truly worth executing, from problem clarity and early demand to monetization potential and practical risk.',
  },
  coverEyebrow: { ar: 'دراسة الجدوى', en: 'Feasibility' },
  keywords: [
    'هل الفكرة تستحق التنفيذ',
    'is this idea worth executing',
    'idea feasibility',
    'should I build this business idea',
    'early feasibility signals',
  ],
  publishedAt: '2026-04-14T09:20:00.000Z',
  updatedAt: '2026-04-14T09:20:00.000Z',
  readingTimeMinutes: 6,
  featured: false,
  relatedUseCases: ['madixo-for-first-time-founders', 'madixo-for-service-businesses'],
  relatedComparisons: ['madixo-vs-feasibility-template-spreadsheets', 'madixo-vs-generic-market-research-notes'],
  relatedPosts: ['difference-between-opportunity-analysis-and-feasibility-study', 'should-you-do-an-early-feasibility-study-before-launch'],
  body: [
    {
      type: 'paragraph',
      text: {
        ar: 'بعض الأفكار تبدو ممتازة في الحديث، لكنها لا تتحول إلى مشروع قوي عند النظر العملي. السبب ليس دائمًا ضعف الفكرة، بل أن شروط التنفيذ نفسها لم تتضح بعد: هل المشكلة واضحة؟ هل يوجد طلب أولي؟ هل الربحية ممكنة؟ وهل المخاطر مقبولة في هذه المرحلة؟',
        en: 'Some ideas sound excellent in conversation, but they do not become strong businesses when viewed practically. The reason is not always that the idea is weak. Often the execution conditions themselves are still unclear: is the problem clear, is there early demand, is monetization plausible, and are the risks acceptable at this stage?',
      },
    },
    {
      type: 'heading',
      text: { ar: 'أربع إشارات مهمة', en: 'Four important signals' },
    },
    {
      type: 'list',
      items: [
        {
          ar: 'المشكلة متكررة وواضحة عند شريحة محددة.',
          en: 'The problem is repeated and clear for a specific segment.',
        },
        {
          ar: 'هناك إشارات سلوكية من السوق، لا مجرد مجاملة أو إعجاب عام.',
          en: 'There are behavioral market signals, not just compliments or general enthusiasm.',
        },
        {
          ar: 'يمكن تصور عرض أول بسيط يختبر القيمة بسرعة.',
          en: 'You can picture a simple first offer that tests value quickly.',
        },
        {
          ar: 'الأرقام الأولية والمخاطر لا تبدو منفصلة عن الواقع.',
          en: 'The early numbers and risks do not look detached from reality.',
        },
      ],
    },
    {
      type: 'paragraph',
      text: {
        ar: 'إذا غابت هذه الإشارات، فهذا لا يعني أن الفكرة ميتة. لكنه يعني غالبًا أن الوقت لم يحن للتنفيذ الكامل بعد، وأنك تحتاج تحليلًا أوضح أو تحققًا إضافيًا قبل التزام أكبر.',
        en: 'If these signals are missing, it does not necessarily mean the idea is dead. It usually means the time for full execution has not arrived yet, and you need clearer analysis or more validation before a bigger commitment.',
      },
    },
    {
      type: 'paragraph',
      text: {
        ar: 'Madixo يجمع هذه الزوايا في مسار واحد: تحليل الفرصة، قراءة أولية للجدوى، ثم مساحة تحقق وأدلة. وهذا يجعل سؤال "هل تستحق التنفيذ؟" سؤالًا عمليًا يمكن الإجابة عنه، لا مجرد إحساس عام.',
        en: 'Madixo brings these angles into one path: opportunity analysis, early feasibility, then validation and evidence. That makes the question “is it worth executing?” practical and answerable rather than a vague feeling.',
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
    relatedPosts: ['how-to-validate-a-business-idea-before-building', 'when-to-use-madixo-instead-of-asking-chatgpt-only'],
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
    relatedPosts: ['difference-between-opportunity-analysis-and-feasibility-study', 'how-to-choose-your-best-first-customer'],
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
    relatedPosts: ['how-to-document-market-notes-that-improve-decisions'],
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
    relatedPosts: ['difference-between-opportunity-analysis-and-feasibility-study', 'how-to-know-if-market-demand-is-real'],
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
    relatedPosts: ['when-to-use-madixo-instead-of-asking-chatgpt-only'],
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
    relatedPosts: ['difference-between-opportunity-analysis-and-feasibility-study'],
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
    relatedPosts: ['how-to-document-market-notes-that-improve-decisions'],
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
