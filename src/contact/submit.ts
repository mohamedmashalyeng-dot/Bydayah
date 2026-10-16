/**
 * نقطة ربط نموذج التواصل بالخادم.
 *
 * عند عدم تعريف VITE_CONTACT_ENDPOINT يبقى النموذج في الوضع التجريبي: لا يُرسل أي
 * شيء، ولا يُحفظ أي شيء، وتُبلغ الواجهة المستخدم بذلك بوضوح.
 * عقد الخادم هو عقد استمارة الطلب نفسه (src/lib/submit.ts).
 */

import { postForm, type SubmitResult } from '../lib/submit'

const ENDPOINT = (import.meta.env.VITE_CONTACT_ENDPOINT as string | undefined)?.trim()

export const contactEnabled = Boolean(ENDPOINT)

export async function submitContact(payload: unknown): Promise<SubmitResult> {
  if (!ENDPOINT) return { status: 'disabled' }
  return postForm(ENDPOINT, payload, 'الرسالة')
}
