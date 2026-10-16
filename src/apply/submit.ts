/**
 * نقطة ربط الاستمارة بالخادم.
 *
 * عند عدم تعريف VITE_APPLY_ENDPOINT تبقى الاستمارة في الوضع التجريبي: لا يُرسل أي
 * شيء، ولا يُحفظ أي شيء، وتُبلغ الواجهة المستخدم بذلك بوضوح.
 * عقد الخادم موضح في src/lib/submit.ts وفي README.
 */

import { postForm, type SubmitResult } from '../lib/submit'

const ENDPOINT = (import.meta.env.VITE_APPLY_ENDPOINT as string | undefined)?.trim()

export const submissionEnabled = Boolean(ENDPOINT)

export async function submitApplication(payload: unknown): Promise<SubmitResult> {
  if (!ENDPOINT) return { status: 'disabled' }
  return postForm(ENDPOINT, payload, 'الطلب')
}
