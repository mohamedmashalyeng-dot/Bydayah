/**
 * إرسال نموذج إلى الخادم، مشترك بين استمارة الطلب ونموذج التواصل.
 *
 * العقد المتوقع من الخادم (انظر README):
 *   POST <endpoint>  Content-Type: application/json  — الجسم: { formVersion, answers }
 *   2xx  → تم الاستلام.
 *   422  → { fieldErrors: { [fieldId]: "رسالة عربية" } } عند فشل التحقق على الخادم.
 *   غير ذلك → خطأ عام.
 * يجب أن يعيد الخادم التحقق من كل الحقول بنفسه، وألا يعتمد على تحقق المتصفح.
 */

export type SubmitResult =
  | { status: 'disabled' }
  | { status: 'ok' }
  | { status: 'invalid'; fieldErrors: Record<string, string> }
  | { status: 'error'; message: string }

/** `noun` اسم ما يُرسل كما يظهر في رسائل الخطأ: «الطلب» أو «الرسالة». */
export async function postForm(endpoint: string, payload: unknown, noun: string): Promise<SubmitResult> {
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), 20000)
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'omit',
      signal: controller.signal,
    })
    if (res.ok) return { status: 'ok' }
    if (res.status === 422) {
      const body = (await res.json().catch(() => null)) as { fieldErrors?: Record<string, string> } | null
      if (body?.fieldErrors && Object.keys(body.fieldErrors).length) {
        return { status: 'invalid', fieldErrors: body.fieldErrors }
      }
    }
    if (res.status === 429) {
      return { status: 'error', message: 'وصلت طلبات كثيرة في وقت قصير. انتظر قليلًا ثم حاول مرة أخرى.' }
    }
    return { status: 'error', message: `تعذّر استلام ${noun} بسبب خطأ في الخادم. حاول مرة أخرى بعد قليل.` }
  } catch {
    return {
      status: 'error',
      message: `تعذّر إرسال ${noun} بسبب مشكلة في الاتصال. تحقق من اتصالك بالإنترنت ثم حاول مرة أخرى.`,
    }
  } finally {
    window.clearTimeout(timer)
  }
}
