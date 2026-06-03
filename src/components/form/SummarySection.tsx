import { useFormContext } from 'react-hook-form'
import type { CvFormData } from '../../validation/cvSchema'
import { FormField, SectionHeader } from '../ui/FormField'

export function SummarySection() {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<CvFormData>()
  const length = watch('summary')?.length ?? 0

  return (
    <section className="form-section" aria-labelledby="summary-heading">
      <SectionHeader
        title="Professional summary"
        description="A concise overview of your experience and goals (50–600 characters)."
      />
      <FormField
        as="textarea"
        label="Summary"
        required
        rows={5}
        maxLength={600}
        {...register('summary')}
        error={errors.summary?.message}
        hint={`${length} / 600 characters`}
      />
    </section>
  )
}
