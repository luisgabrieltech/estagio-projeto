import Image from 'next/image'
import { BarChart3 } from 'lucide-react'
import { brand } from '@/lib/config/brand'
import { getImageUrl } from '@/lib/utils/api-utils'

export function ProductBrand() {
  return (
    <span className="inline-flex min-w-0 items-center gap-2 font-semibold tracking-tight">
      {brand.logoPath ? (
        <Image src={getImageUrl(brand.logoPath)} alt="" width={32} height={32} className="size-8 object-contain" />
      ) : (
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-teal-700 text-white">
          <BarChart3 aria-hidden="true" className="size-5" />
        </span>
      )}
      <span className="truncate">{brand.name}</span>
    </span>
  )
}
