import type { ReactNode } from 'react'
import type { SectionId } from '../../constants/sections'
import { useSectionEnabled } from '../../hooks/useSectionEnabled'

type OptionalSectionProps = {
  sectionId: SectionId
  children: ReactNode
}

export function OptionalSection({ sectionId, children }: OptionalSectionProps) {
  const enabled = useSectionEnabled(sectionId)
  if (!enabled) return null
  return <>{children}</>
}
