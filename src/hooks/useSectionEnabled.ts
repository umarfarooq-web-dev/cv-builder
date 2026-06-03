import { useFormContext, useWatch } from 'react-hook-form'
import type { SectionId } from '../constants/sections'
import type { CvFormData } from '../validation/cvSchema'

export function useSectionEnabled(sectionId: SectionId): boolean {
  const { control } = useFormContext<CvFormData>()
  return useWatch({ control, name: `sections.${sectionId}` }) ?? false
}

export function useSections(): CvFormData['sections'] {
  const { control } = useFormContext<CvFormData>()
  return useWatch({ control, name: 'sections' }) ?? ({} as CvFormData['sections'])
}
