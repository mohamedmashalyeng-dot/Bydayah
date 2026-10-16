/**
 * بنية استمارة طلب الزواج: الخطوات والأسئلة والاختيارات والشروط.
 *
 * ملاحظة تحرير: ملف المحتوى الأصلي (33 سؤالًا + الرسالة الإضافية + الإقرار) لم يصل
 * مع طلب التنفيذ. الأسئلة أدناه مسودة مبنية على أقسام الاستمارة المطلوبة، ويجب
 * استبدال صياغتها واختياراتها بما ورد في الملف حرفيًا. المحرك في src/apply يعمل
 * مع أي أسئلة تُكتب بهذه البنية دون تعديل في الكود.
 *
 * لا تطلب الاستمارة صورًا أو وثائق أو أسماء الأبناء، والحقول النصية الحساسة اختيارية.
 */

export type Value = string | string[] | boolean
export type Values = Record<string, Value | undefined>
export type Condition = (v: Values) => boolean

export type Option = { value: string; label: string; showIf?: Condition }

type Base = {
  id: string
  label: string
  hint?: string
  required?: boolean
  /** إلزامي فقط عند تحقق الشرط (مثل البريد عند اختياره وسيلة للتواصل). */
  requiredIf?: Condition
  showIf?: Condition
  /** يُعرض الحقل بعرض نصف السطر على الشاشات الواسعة. */
  half?: boolean
}

export type Field =
  | (Base & {
      type: 'text' | 'email' | 'tel'
      autoComplete?: string
      maxLength?: number
      ltr?: boolean
    })
  | (Base & { type: 'textarea'; maxLength: number; rows?: number })
  | (Base & { type: 'number'; min: number; max: number })
  | (Base & { type: 'select'; options: Option[]; placeholder?: string })
  | (Base & { type: 'radio' | 'checkboxes'; options: Option[]; columns?: 1 | 2 })
  | (Base & { type: 'ageRange'; min: number; max: number })
  | (Base & { type: 'consent' })

export type Step = { id: string; title: string; description: string; fields: Field[] }

/* ———— قوائم مشتركة ———— */

const ARAB_COUNTRIES = [
  'مصر',
  'السعودية',
  'الإمارات',
  'الكويت',
  'قطر',
  'البحرين',
  'عُمان',
  'اليمن',
  'الأردن',
  'فلسطين',
  'لبنان',
  'سوريا',
  'العراق',
  'السودان',
  'ليبيا',
  'تونس',
  'الجزائر',
  'المغرب',
  'موريتانيا',
]

const OTHER_COUNTRIES = ['تركيا', 'المملكة المتحدة', 'ألمانيا', 'فرنسا', 'الولايات المتحدة', 'كندا', 'أستراليا']

const toOptions = (labels: string[]): Option[] => labels.map((l) => ({ value: l, label: l }))
const OTHER: Option = { value: 'other', label: 'أخرى' }

const is = (id: string, ...values: string[]): Condition => (v) => values.includes(v[id] as string)
const has = (id: string, value: string): Condition => (v) => Array.isArray(v[id]) && (v[id] as string[]).includes(value)

/** حقل «أخرى» المرتبط باختيار سابق؛ يظهر ويصبح مطلوبًا فقط عند اختيار «أخرى». */
const otherDetails = (id: string, label: string, multi = false): Field => {
  const cond = multi ? has(id, 'other') : is(id, 'other')
  return { id: `${id}_other`, type: 'text', label, showIf: cond, required: true, maxLength: 120 }
}

/* ———— الخطوات ———— */

export const steps: Step[] = [
  {
    id: 'basic',
    title: 'المعلومات الأساسية',
    description: 'معلومات عامة تساعد الفريق على فهم طلبك. لا نطلب صورًا أو وثائق رسمية.',
    fields: [
      {
        id: 'name',
        type: 'text',
        label: 'الاسم',
        hint: 'يكفي الاسم الأول أو الاسم الذي تفضّل أن نناديك به.',
        required: true,
        autoComplete: 'given-name',
        maxLength: 60,
      },
      {
        id: 'applicantType',
        type: 'radio',
        label: 'أتقدم بالطلب بصفتي',
        required: true,
        columns: 2,
        options: [
          { value: 'man', label: 'رجل يبحث عن زوجة' },
          { value: 'woman', label: 'امرأة تبحث عن زوج' },
        ],
      },
      { id: 'age', type: 'number', label: 'العمر', required: true, min: 18, max: 80, half: true },
      {
        id: 'nationality',
        type: 'select',
        label: 'الجنسية',
        required: true,
        half: true,
        options: [...toOptions(ARAB_COUNTRIES), OTHER],
      },
      otherDetails('nationality', 'اكتب جنسيتك'),
      {
        id: 'residence',
        type: 'select',
        label: 'بلد الإقامة الحالي',
        required: true,
        half: true,
        options: [...toOptions(ARAB_COUNTRIES), ...toOptions(OTHER_COUNTRIES), OTHER],
      },
      otherDetails('residence', 'اكتب بلد إقامتك'),
      {
        id: 'education',
        type: 'select',
        label: 'المؤهل الدراسي',
        half: true,
        options: [
          { value: 'secondary', label: 'ثانوي أو ما يعادله' },
          { value: 'diploma', label: 'دبلوم' },
          { value: 'bachelor', label: 'بكالوريوس / ليسانس' },
          { value: 'postgrad', label: 'دراسات عليا' },
          OTHER,
        ],
      },
      otherDetails('education', 'اكتب مؤهلك الدراسي'),
      { id: 'occupation', type: 'text', label: 'المهنة أو مجال العمل', maxLength: 80, half: true },
    ],
  },
  {
    id: 'family',
    title: 'الحالة الاجتماعية والأبناء',
    description: 'نسأل عن وضعك الحالي لنراعي ظروفك عند الترشيح. لا نطلب أسماء الأبناء.',
    fields: [
      {
        id: 'maritalStatus',
        type: 'radio',
        label: 'الحالة الاجتماعية',
        required: true,
        columns: 2,
        options: [
          { value: 'single', label: 'لم يسبق لي الزواج' },
          { value: 'divorced', label: 'مطلق / مطلقة' },
          { value: 'widowed', label: 'أرمل / أرملة' },
          { value: 'married', label: 'متزوج', showIf: is('applicantType', 'man') },
          OTHER,
        ],
      },
      otherDetails('maritalStatus', 'اكتب حالتك الاجتماعية'),
      {
        id: 'hasChildren',
        type: 'radio',
        label: 'هل لديك أبناء؟',
        required: true,
        columns: 2,
        options: [
          { value: 'yes', label: 'نعم' },
          { value: 'no', label: 'لا' },
        ],
      },
      {
        id: 'childrenCount',
        type: 'select',
        label: 'عدد الأبناء',
        required: true,
        half: true,
        showIf: is('hasChildren', 'yes'),
        options: [
          { value: '1', label: 'واحد' },
          { value: '2', label: 'اثنان' },
          { value: '3', label: 'ثلاثة' },
          { value: '4', label: 'أربعة' },
          { value: '5+', label: 'خمسة أو أكثر' },
        ],
      },
      {
        id: 'childrenAges',
        type: 'text',
        label: 'أعمار الأبناء',
        hint: 'مثال: 4 سنوات و9 سنوات. لا نحتاج إلى أسمائهم.',
        half: true,
        maxLength: 80,
        showIf: is('hasChildren', 'yes'),
      },
      {
        id: 'childrenLiving',
        type: 'radio',
        label: 'مع من يقيم الأبناء؟',
        columns: 2,
        showIf: is('hasChildren', 'yes'),
        options: [
          { value: 'with-me', label: 'معي' },
          { value: 'other-parent', label: 'مع الطرف الآخر' },
          { value: 'shared', label: 'إقامة مشتركة' },
          { value: 'independent', label: 'مستقلون' },
        ],
      },
    ],
  },
  {
    id: 'partner',
    title: 'مواصفات شريك الحياة',
    description: 'أخبرنا بما يهمك فعلًا. الحقول النصية اختيارية ويمكنك تركها فارغة.',
    fields: [
      { id: 'partnerAge', type: 'ageRange', label: 'الفئة العمرية المفضلة', required: true, min: 18, max: 80 },
      {
        id: 'partnerStatus',
        type: 'checkboxes',
        label: 'الحالة الاجتماعية المقبولة',
        hint: 'يمكنك اختيار أكثر من إجابة.',
        required: true,
        columns: 2,
        options: [
          { value: 'single', label: 'لم يسبق له / لها الزواج' },
          { value: 'divorced', label: 'مطلق / مطلقة' },
          { value: 'widowed', label: 'أرمل / أرملة' },
          { value: 'any', label: 'لا مانع من أي حالة' },
        ],
      },
      {
        id: 'acceptChildren',
        type: 'radio',
        label: 'هل تقبل الارتباط بشخص لديه أبناء؟',
        required: true,
        options: [
          { value: 'yes', label: 'نعم، لا مانع' },
          { value: 'no', label: 'أفضّل ألا يكون لديه أبناء' },
          { value: 'depends', label: 'حسب الظروف' },
        ],
      },
      {
        id: 'partnerEducation',
        type: 'select',
        label: 'المؤهل الدراسي المفضل',
        half: true,
        options: [
          { value: 'any', label: 'لا يُشترط' },
          { value: 'university', label: 'مؤهل جامعي على الأقل' },
          { value: 'postgrad', label: 'دراسات عليا' },
        ],
      },
      { id: 'partnerTraits', type: 'textarea', label: 'أهم الصفات التي تبحث عنها', maxLength: 600 },
      { id: 'dealBreakers', type: 'textarea', label: 'أمور لا يمكنك قبولها', maxLength: 600 },
    ],
  },
  {
    id: 'married-life',
    title: 'الحياة الزوجية',
    description: 'تصورك للحياة بعد الزواج يساعدنا في البحث عن شخص يشاركك التصور نفسه.',
    fields: [
      {
        id: 'timeline',
        type: 'radio',
        label: 'متى تأمل أن يتم الزواج؟',
        required: true,
        columns: 2,
        options: [
          { value: '6m', label: 'خلال ستة أشهر' },
          { value: '1y', label: 'خلال سنة' },
          { value: '1y+', label: 'بعد أكثر من سنة' },
          { value: 'open', label: 'لم أحدد بعد' },
        ],
      },
      {
        id: 'wifeWork',
        type: 'radio',
        label: 'رأيك في عمل الزوجة بعد الزواج',
        options: [
          { value: 'support', label: 'أؤيده' },
          { value: 'home', label: 'أفضّل التفرغ للأسرة' },
          { value: 'agree', label: 'يتحدد بالاتفاق بين الطرفين' },
        ],
      },
      {
        id: 'wantChildren',
        type: 'radio',
        label: 'الرغبة في الإنجاب',
        columns: 2,
        options: [
          { value: 'yes', label: 'نعم' },
          { value: 'no', label: 'لا' },
          { value: 'open', label: 'لم أحدد بعد' },
        ],
      },
      {
        id: 'housing',
        type: 'radio',
        label: 'السكن بعد الزواج',
        options: [
          { value: 'independent', label: 'سكن مستقل' },
          { value: 'family', label: 'لا مانع من السكن مع الأهل' },
          { value: 'agree', label: 'يتحدد بالاتفاق' },
        ],
      },
    ],
  },
  {
    id: 'values',
    title: 'التوافق والقيم',
    description: 'القيم المشتركة من أهم أسس الاستقرار. أجب بما يعبّر عنك.',
    fields: [
      {
        id: 'religiosity',
        type: 'radio',
        label: 'كيف تصف التزامك الديني؟',
        required: true,
        options: [
          { value: 'committed', label: 'ملتزم / ملتزمة' },
          { value: 'moderate', label: 'معتدل / معتدلة' },
          { value: 'growing', label: 'أسعى إلى التحسن' },
        ],
      },
      {
        id: 'partnerReligiosity',
        type: 'radio',
        label: 'ما أهمية الالتزام الديني لدى الطرف الآخر؟',
        required: true,
        options: [
          { value: 'essential', label: 'أساسي' },
          { value: 'important', label: 'مهم' },
          { value: 'flexible', label: 'غير مشترط' },
        ],
      },
      {
        id: 'lifestyle',
        type: 'radio',
        label: 'أقرب وصف لنمط حياتك',
        options: [
          { value: 'calm', label: 'هادئ ومنزلي' },
          { value: 'social', label: 'اجتماعي ونشيط' },
          { value: 'balanced', label: 'متوازن بين الاثنين' },
        ],
      },
      {
        id: 'coreValues',
        type: 'textarea',
        label: 'ما القيم التي تعتبرها أساسية في الحياة الزوجية؟',
        maxLength: 600,
      },
    ],
  },
  {
    id: 'sharia',
    title: 'تفضيلات الزواج الشرعي',
    description: 'نحرص على أن تتم مراحل التعارف بالصورة التي تراها مناسبة ووفق الضوابط الشرعية.',
    fields: [
      {
        id: 'meetingStyle',
        type: 'radio',
        label: 'كيف تفضّل أن تتم مرحلة التعارف؟',
        required: true,
        options: [
          { value: 'family-first', label: 'بحضور الأسرة من البداية' },
          { value: 'staged', label: 'تواصل أولي منظم بموافقة الطرفين، ثم إشراك الأسرة' },
          { value: 'agree', label: 'حسب ما يتفق عليه الطرفان' },
        ],
      },
      {
        id: 'polygamy',
        type: 'radio',
        label: 'موقفك من التعدد',
        options: [
          { value: 'accept', label: 'أقبله' },
          { value: 'refuse', label: 'لا أقبله' },
          { value: 'discuss', label: 'يمكن مناقشته حسب الظروف' },
        ],
      },
      {
        id: 'wedding',
        type: 'radio',
        label: 'تصورك لمراسم الزواج',
        options: [
          { value: 'simple', label: 'عقد قران وحفل عائلي بسيط' },
          { value: 'full', label: 'حفل زفاف كامل' },
          { value: 'agree', label: 'يتحدد بالاتفاق' },
        ],
      },
    ],
  },
  {
    id: 'international',
    title: 'الزواج بين الجنسيات',
    description: 'إن كنت منفتحًا على الارتباط بشخص من جنسية أو دولة أخرى، أخبرنا بتفضيلاتك.',
    fields: [
      {
        id: 'otherNationality',
        type: 'radio',
        label: 'هل تقبل الارتباط بشخص من جنسية أخرى؟',
        required: true,
        options: [
          { value: 'any', label: 'نعم، أي جنسية' },
          { value: 'specific', label: 'نعم، جنسية أو جنسيات محددة' },
          { value: 'same', label: 'أفضّل جنسيتي نفسها' },
        ],
      },
      {
        id: 'preferredNationalities',
        type: 'text',
        label: 'الجنسية أو الجنسيات المفضلة',
        required: true,
        maxLength: 160,
        showIf: is('otherNationality', 'specific'),
      },
      {
        id: 'relocate',
        type: 'radio',
        label: 'هل تقبل الانتقال للعيش في دولة أخرى بعد الزواج؟',
        required: true,
        options: [
          { value: 'yes', label: 'نعم' },
          { value: 'depends', label: 'حسب الظروف' },
          { value: 'no', label: 'لا' },
        ],
      },
      {
        id: 'preferredCountries',
        type: 'checkboxes',
        label: 'الدول المفضلة للإقامة',
        hint: 'اختياري. يمكنك اختيار أكثر من دولة.',
        columns: 2,
        showIf: is('relocate', 'yes', 'depends'),
        options: [...toOptions([...ARAB_COUNTRIES.slice(0, 9), ...OTHER_COUNTRIES]), OTHER],
      },
      otherDetails('preferredCountries', 'اكتب الدول الأخرى', true),
      {
        id: 'legalHelp',
        type: 'radio',
        label: 'هل تحتاج إلى مساعدة في فهم إجراءات الزواج بين دولتين أو جنسيتين؟',
        options: [
          { value: 'yes', label: 'نعم' },
          { value: 'no', label: 'لا' },
          { value: 'unsure', label: 'لست متأكدًا' },
        ],
      },
    ],
  },
  {
    id: 'contact',
    title: 'التواصل والمراجعة والإقرار',
    description: 'كيف نتواصل معك؟ ثم راجع إجاباتك قبل الإرسال.',
    fields: [
      {
        id: 'phone',
        type: 'tel',
        label: 'رقم الهاتف',
        hint: 'اكتبه مع رمز الدولة.',
        required: true,
        autoComplete: 'tel',
        maxLength: 24,
        ltr: true,
        half: true,
      },
      {
        id: 'email',
        type: 'email',
        label: 'البريد الإلكتروني',
        hint: 'مطلوب إذا اخترت التواصل عبر البريد.',
        requiredIf: is('contactMethod', 'email'),
        autoComplete: 'email',
        maxLength: 120,
        ltr: true,
        half: true,
      },
      {
        id: 'contactMethod',
        type: 'radio',
        label: 'وسيلة التواصل المفضلة',
        required: true,
        columns: 2,
        options: [
          { value: 'call', label: 'مكالمة هاتفية' },
          { value: 'whatsapp', label: 'رسالة واتساب' },
          { value: 'email', label: 'البريد الإلكتروني' },
        ],
      },
      {
        id: 'contactTime',
        type: 'radio',
        label: 'أنسب وقت للتواصل',
        columns: 2,
        options: [
          { value: 'morning', label: 'صباحًا' },
          { value: 'afternoon', label: 'بعد الظهر' },
          { value: 'evening', label: 'مساءً' },
          { value: 'any', label: 'أي وقت' },
        ],
      },
      {
        id: 'message',
        type: 'textarea',
        label: 'رسالة إضافية',
        hint: 'هل هناك ما تحب أن يعرفه الفريق قبل التواصل معك؟ (اختياري)',
        maxLength: 1000,
        rows: 4,
      },
    ],
  },
]

/** الإقرار: يُعرض بعد المراجعة في الخطوة الأخيرة، وغير محدد مسبقًا. */
export const consentField: Field = {
  id: 'consent',
  type: 'consent',
  required: true,
  label:
    'أقر بأن المعلومات التي قدمتها صحيحة، وأن هدفي من هذا الطلب هو الزواج الشرعي، وأوافق على أن يتواصل معي فريق بداية بخصوص طلبي، مع العلم بأن بيانات تواصلي لن تُشارك مع أي طرف دون موافقتي.',
}

/** مسودة سياسة الخصوصية — تحتاج مراجعة قانونية وتشغيلية قبل تفعيل جمع البيانات. */
export const privacyDraft = {
  title: 'كيف نتعامل مع بياناتك؟',
  badge: 'مسودة قيد المراجعة',
  points: [
    'تُستخدم بيانات الطلب لدراسته والبحث عن ترشيح مناسب والتواصل معك فقط.',
    'لا تُعرض بياناتك علنًا، ولا تُشارك بيانات تواصلك مع أي طرف دون موافقتك.',
    'لا تطلب الاستمارة صورًا أو وثائق رسمية أو أسماء الأبناء.',
    'مدة الاحتفاظ بالبيانات، وطريقة طلب حذفها، والجهة المسؤولة عنها ستُحدَّد قبل تفعيل استقبال الطلبات.',
  ],
  note: 'هذا النص مسودة لم تُعتمد بعد، ويحتاج إلى مراجعة قانونية وتشغيلية.',
}
