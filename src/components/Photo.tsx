import type { PhotoData } from '../content/photos'

type Props = {
  photo: PhotoData
  /** عرض الصورة المتوقع على الشاشة، ليختار المتصفح النسخة المناسبة من srcSet. */
  sizes: string
  className?: string
  /** للصورة الظاهرة عند فتح الصفحة: تُحمَّل فورًا وبأولوية. غيرها يُحمَّل عند الاقتراب منه. */
  priority?: boolean
  reveal?: boolean
}

export function Photo({ photo, sizes, className, priority = false, reveal = false }: Props) {
  return (
    <figure className={className ? `photo ${className}` : 'photo'} data-reveal={reveal || undefined}>
      <img
        src={photo.src}
        srcSet={photo.srcSet}
        sizes={sizes}
        width={photo.width}
        height={photo.height}
        alt={photo.alt}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        decoding="async"
      />
    </figure>
  )
}
