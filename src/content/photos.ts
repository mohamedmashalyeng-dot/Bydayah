/**
 * صور الموقع ونصوصها البديلة.
 *
 * لكل صورة نسختا WebP في src/assets/photos: عرض كبير للشاشات الواسعة وعرض صغير
 * للهاتف، ويختار المتصفح المناسب منهما تلقائيًا. لاستبدال صورة: ضع نسختيها
 * الجديدتين بالاسمين نفسيهما، وحدّث الأبعاد هنا إن تغيّرت.
 */

import coupleLg from '../assets/photos/couple-arch-1600.webp'
import coupleSm from '../assets/photos/couple-arch-960.webp'
import envelopeLg from '../assets/photos/sealed-envelope-1448.webp'
import envelopeSm from '../assets/photos/sealed-envelope-800.webp'
import familyLg from '../assets/photos/family-visit-1448.webp'
import familySm from '../assets/photos/family-visit-800.webp'
import passportsLg from '../assets/photos/passports-travel-1448.webp'
import passportsSm from '../assets/photos/passports-travel-800.webp'
import phoneLg from '../assets/photos/phone-call-1448.webp'
import phoneSm from '../assets/photos/phone-call-800.webp'

export type PhotoData = { src: string; srcSet: string; width: number; height: number; alt: string }

const photo = (small: [string, number], large: string, width: number, height: number, alt: string): PhotoData => ({
  src: large,
  srcSet: `${small[0]} ${small[1]}w, ${large} ${width}w`,
  width,
  height,
  alt,
})

export const photos = {
  /** 16:9 — الصورة العريضة الوحيدة، خلفية الـHero في الصفحة الرئيسية. */
  hero: photo([coupleSm, 960], coupleLg, 1600, 900, 'زوجان يسيران معًا نحو قوس حجري في حديقة هادئة'),
  /** 4:3 — «لماذا بداية؟» في الصفحة الرئيسية. */
  why: photo([envelopeSm, 800], envelopeLg, 1448, 1086, 'ظرف مختوم بالشمع الأخضر وبجانبه خاتما زواج'),
  /** 4:3 — «الزواج بين الدول والجنسيات» في الصفحة الرئيسية. */
  international: photo([passportsSm, 800], passportsLg, 1448, 1086, 'جوازا سفر وخاتما زواج على طاولة أمام نافذة تطل على مطار'),
  /** 4:3 — «رسالتنا ورؤيتنا» في صفحة «من نحن». */
  about: photo([familySm, 800], familyLg, 1448, 1086, 'لقاء تعارف هادئ بين أسرتين في مجلس منزلي'),
  /** 4:3 — عمود التعريف في صفحة «تواصل معنا». */
  contact: photo([phoneSm, 800], phoneLg, 1448, 1086, 'رجل يتحدث في الهاتف مبتسمًا في مكتب هادئ'),
}
