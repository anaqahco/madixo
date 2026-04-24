تحديثات Madixo — دليل التطبيق
اسم كل ملف هنا = المسار في مشروعك، مع استبدال `/` بـ `__`.
اللصق بسيط: حوّل `__` إلى `/` في الاسم، وهذا هو مكانه في المشروع.
---
خريطة الملفات
اسم الملف هنا	المسار في مشروعك
`app__api__analyze__route.ts`	`app/api/analyze/route.ts`
`app__api__billing__webhook__route.ts`	`app/api/billing/webhook/route.ts`
`app__results__page.tsx`	`app/results/page.tsx`
`app__globals.css`	`app/globals.css`
`lib__madixo-plan-store.ts`	`lib/madixo-plan-store.ts`
---
ماذا يعمل كل ملف
`app/api/analyze/route.ts`
قراءة آمنة للخطة — يقرأ من `app_metadata` أولاً (لا يمكن تعديله من client)، ثم يرجع لـ `user_metadata` كـ fallback
Rate limiting — حد 5 طلبات في الدقيقة لكل مستخدم (in-memory). يرجع `429` مع `Retry-After` header
TTL على الـ cache — التقارير المحفوظة لا تُعاد استخدامها بعد 30 يوم (الأسواق تتغير)
AbortController + timeout — يلغي استدعاء OpenAI بعد 45 ثانية ويرجع `504` برسالة واضحة
متغيرات بيئة جديدة (اختيارية):
```env
OPENAI_TIMEOUT_MS=45000
```
`app/api/billing/webhook/route.ts`
عند استقبال webhook من Paddle، يكتب الخطة في كلا `app_metadata` (آمن) و `user_metadata` (للتوافق مع الكود القديم)
بعد ترحيل كامل المستخدمين، يمكن إزالة الكتابة لـ `user_metadata`
`lib/madixo-plan-store.ts`
`readPlanFromUserMetadata` الآن يقرأ من `app_metadata` أولاً
هذا يطبق التحسين الأمني على كل الملفات التي تستخدم `getCurrentMadixoPlan()` — أي تلقائياً يحمي كل الـ APIs الأخرى
`app/results/page.tsx`
معالجة خاصة لخطأ `RATE_LIMITED` — رسالة واضحة مع عدد الثواني للانتظار
معالجة خاصة لخطأ `TIMEOUT` / `504` — رسالة بأن التحليل تأخر
إضافة `retryAfter` لنوع `AnalyzeApiPayload`
`app/globals.css`
إزالة `font-family: Arial` الذي كان يتعارض مع Geist المحمّل
استخدام `Cairo` تلقائياً عند `dir="rtl"`
متغيرات CSS إضافية للأسطح والحدود (dark mode تلقائي)
`:focus-visible` واضح للـ accessibility
احترام `prefers-reduced-motion`
---
ما الذي لم يُعدَّل (مقصود)
تحسينات تركت للمرحلة القادمة لأنها تحتاج تغييرات أكبر:
نقل `usage tracking` من cookie إلى Supabase — يحتاج جدول جديد + migration
Streaming AI responses — يحتاج تغيير كامل في الـ client (SSE)
تقسيم `home-page-client.tsx` (1668 سطر) — refactoring كبير
Dark mode كامل في كل components — 42 مكان في home-page-client وحده
---
خطوات التطبيق
1. احفظ نسخة احتياطية
```bash
cd your-madixo-project
cp app/api/analyze/route.ts app/api/analyze/route.ts.backup
cp app/api/billing/webhook/route.ts app/api/billing/webhook/route.ts.backup
cp lib/madixo-plan-store.ts lib/madixo-plan-store.ts.backup
cp app/results/page.tsx app/results/page.tsx.backup
cp app/globals.css app/globals.css.backup
```
2. استبدل الملفات
افتح `app__api__analyze__route.ts` → الصق محتواه في `app/api/analyze/route.ts`
افتح `app__api__billing__webhook__route.ts` → الصق في `app/api/billing/webhook/route.ts`
افتح `app__results__page.tsx` → الصق في `app/results/page.tsx`
افتح `app__globals.css` → الصق في `app/globals.css`
افتح `lib__madixo-plan-store.ts` → الصق في `lib/madixo-plan-store.ts`
3. تحقق من البناء
```bash
npm run lint
npm run build
```
4. اختبر محلياً
```bash
npm run dev
```
اختبر:
أرسل 6 طلبات تحليل متتالية — يجب أن تظهر رسالة rate limit
افتح تقرير قديم (>30 يوم) — يجب أن يُعاد توليده
سجل الدخول بحساب Pro — يجب أن تعمل الخطة كالسابق
في `dir="rtl"` — يجب أن يظهر خط Cairo
---
تحذير مهم قبل النشر
المستخدمون الحاليون عندهم `madixo_plan` في `user_metadata` — الـ fallback يحميهم، لن يتأثروا.
المستخدمون الجدد أو المجددون بعد النشر، الخطة ستُكتب في `app_metadata` — أكثر أماناً.
لترحيل المستخدمين الحاليين (اختياري)، نفذ في Supabase SQL Editor بعد اختباره على حساب واحد:
```sql
-- اختبر أولاً على حساب واحد:
UPDATE auth.users
SET raw_app_meta_data = jsonb_set(
  COALESCE(raw_app_meta_data, '{}'::jsonb),
  '{madixo_plan}',
  raw_user_meta_data->'madixo_plan'
)
WHERE raw_user_meta_data ? 'madixo_plan'
  AND NOT (raw_app_meta_data ? 'madixo_plan')
  AND email = 'your-test@email.com';  -- احذف هذا السطر بعد التحقق

-- بعد التأكد، نفذه بدون الـ email filter لترحيل الجميع
```
---
الخطوة التالية
بعد تطبيق هذه الدفعة، أفضل تحسين تالي هو نقل usage tracking إلى جدول Supabase.
هذا يسد الثغرة الأكبر في نموذج الربح (حالياً أي شخص يقدر يتجاوز الـ 5 تحليلات بحذف cookies).
قل لي لو تبغى أجهز هذا.
