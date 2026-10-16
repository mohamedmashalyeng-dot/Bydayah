/**
 * نصوص صفحة «تواصل معنا» وحقول نموذج المراسلة.
 *
 * الحقول تستخدم بنية استمارة الطلب نفسها (src/content/apply.ts)، فيعمل عليها
 * محرك التحقق والعرض نفسه دون كود إضافي.
 */

import type { IconName } from '../components/Icon'
import type { Condition, Field } from './apply'

export const contactIntro = {
  eyebrow: 'تواصل معنا',
  title: 'يسعدنا أن نسمع منك',
  // مسودة
  lead: 'لديك سؤال عن الخدمة أو عن طريقة العمل قبل أن تبدأ طلبك؟ اكتب لنا، وسيقرأ رسالتك أحد أعضاء فريق بداية ويرد عليك.',
}

/**
 * وسائل التواصل المباشر.
 * املأ القيم قبل النشر؛ الوسيلة التي تبقى قيمتها فارغة لا تظهر في الصفحة.
 * واتساب والهاتف: اكتب الرقم كاملًا مع رمز الدولة، مثل ‎+966 5x xxx xxxx.
 */
export const channels: { kind: 'email' | 'whatsapp' | 'phone'; label: string; icon: IconName; value: string }[] = [
  { kind: 'email', label: 'البريد الإلكتروني', icon: 'message', value: '' },
  { kind: 'whatsapp', label: 'واتساب', icon: 'listen', value: '' },
  { kind: 'phone', label: 'الهاتف', icon: 'phone', value: '' },
]

export const channelsTitle = 'وسائل التواصل المباشر'

export const applyNote = {
  title: 'تريد أن تبدأ طلب زواج؟',
  // مسودة
  text: 'لا حاجة لمراسلتنا أولًا. استمارة الطلب هي الطريق المباشر، ويتواصل معك الفريق بعد دراستها.',
}

export const contactForm = {
  title: 'أرسل رسالة',
  description: 'الحقول المعلّمة بـ«مطلوب» ضرورية للرد عليك.',
  // مسودة: يجب أن تتوافق مع سياسة الخصوصية المعتمدة.
  privacyNote: 'نستخدم بيانات هذه الرسالة للرد عليك فقط، ولا نشاركها مع أي طرف.',
  submit: 'إرسال الرسالة',
  submitting: 'جارٍ الإرسال…',
  demoNotice: 'نسخة تجريبية: استقبال الرسائل غير مفعّل حاليًا، ولن تُرسل رسالتك أو تُحفظ.',
  disabledResult: 'استقبال الرسائل غير مفعّل في هذه النسخة التجريبية من الموقع، ولم تُحفظ رسالتك أو تُرسل إلى أي جهة.',
  done: {
    title: 'وصلت رسالتك إلى فريق بداية',
    text: 'سيقرأ الفريق رسالتك ويرد عليك عبر الوسيلة التي اخترتها.',
    back: 'العودة إلى الصفحة الرئيسية',
  },
}

const replyIs = (value: string): Condition => (v) => v.replyVia === value

export const contactFields: Field[] = [
  {
    id: 'name',
    type: 'text',
    label: 'الاسم',
    required: true,
    autoComplete: 'given-name',
    maxLength: 60,
    half: true,
  },
  {
    id: 'topic',
    type: 'select',
    label: 'موضوع الرسالة',
    required: true,
    half: true,
    options: [
      { value: 'service', label: 'سؤال عن الخدمة وطريقة العمل' },
      { value: 'application', label: 'استفسار عن طلب قدّمته' },
      { value: 'privacy', label: 'الخصوصية وبياناتي' },
      { value: 'legal', label: 'المساعدة القانونية' },
      { value: 'feedback', label: 'اقتراح أو ملاحظة' },
      { value: 'other', label: 'موضوع آخر' },
    ],
  },
  {
    id: 'message',
    type: 'textarea',
    label: 'رسالتك',
    hint: 'لا تضع هنا صورًا أو وثائق أو تفاصيل شخصية لا نحتاج إليها للرد عليك.',
    required: true,
    maxLength: 1500,
    rows: 6,
  },
  {
    id: 'replyVia',
    type: 'radio',
    label: 'كيف نرد عليك؟',
    required: true,
    columns: 2,
    options: [
      { value: 'email', label: 'البريد الإلكتروني' },
      { value: 'whatsapp', label: 'رسالة واتساب' },
    ],
  },
  {
    id: 'email',
    type: 'email',
    label: 'البريد الإلكتروني',
    required: true,
    showIf: replyIs('email'),
    autoComplete: 'email',
    maxLength: 120,
    ltr: true,
  },
  {
    id: 'phone',
    type: 'tel',
    label: 'رقم واتساب',
    hint: 'اكتبه مع رمز الدولة.',
    required: true,
    showIf: replyIs('whatsapp'),
    autoComplete: 'tel',
    maxLength: 24,
    ltr: true,
  },
]

// مسودة: الإجابات مأخوذة من مضمون الصفحة الرئيسية، ويجب أن تبقى متسقة معها.
export const faq = {
  eyebrow: 'قبل أن تكتب لنا',
  title: 'أسئلة شائعة',
  items: [
    {
      q: 'هل يظهر طلبي أو بياناتي لأحد؟',
      a: 'لا. لا ننشر ملفات أو صفحات للمتقدمين، ولا تُشارك بيانات تواصلك مع أي طرف إلا بعد موافقتك الصريحة.',
    },
    {
      q: 'هل تضمن بداية إتمام الزواج؟',
      a: 'لا. نعدك بالتعامل الجاد مع طلبك، أما الزواج فرزق وقرار يخص الطرفين وأسرتيهما.',
    },
    {
      q: 'أقيم خارج بلدي، هل يمكنني التقدم؟',
      a: 'نعم. نستقبل طلبات المقيمين في دول مختلفة والراغبين في الزواج بين الجنسيات، ونراعي بلد الإقامة والاستعداد للانتقال عند دراسة كل طلب.',
    },
    {
      q: 'هل تقدمون استشارات قانونية؟',
      a: 'بداية ليست مكتب محاماة. عند الحاجة نساعدك في الاستعانة بمختص قانوني مستقل يوضح لك إجراءات الزواج بين الدول.',
    },
    {
      q: 'كيف أبدأ؟',
      a: 'املأ استمارة الطلب بسرية، وسيتواصل معك الفريق بعد دراستها لفهم ما تبحث عنه.',
    },
  ],
}
