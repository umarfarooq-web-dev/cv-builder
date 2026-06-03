import { useFieldArray, useFormContext } from 'react-hook-form'
import { defaultAward } from '../../constants/defaults'
import type { CvFormData } from '../../validation/cvSchema'
import { FormField, SectionHeader } from '../ui/FormField'

export function AwardsSection() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<CvFormData>()

  const { fields, append, remove } = useFieldArray({ control, name: 'awards' })
  const rootError = errors.awards?.message ?? errors.awards?.root?.message

  return (
    <section className="form-section">
      <SectionHeader
        title="Awards & honors"
        description="Recognition, scholarships, competitions, or distinctions."
        action={
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={() => append(defaultAward())}
          >
            Add award
          </button>
        }
      />
      {rootError ? (
        <p className="section-error" role="alert">
          {rootError}
        </p>
      ) : null}
      <div className="card-list">
        {fields.map((field, index) => {
          const itemErrors = errors.awards?.[index]
          return (
            <article key={field.id} className="entry-card">
              <div className="entry-card__header">
                <h3 className="entry-card__title">Award {index + 1}</h3>
                {fields.length > 1 ? (
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    onClick={() => remove(index)}
                  >
                    Remove
                  </button>
                ) : null}
              </div>
              <div className="field-grid field-grid--2">
                <FormField
                  label="Title"
                  required
                  {...register(`awards.${index}.title`)}
                  error={itemErrors?.title?.message}
                />
                <FormField
                  label="Issuer"
                  required
                  {...register(`awards.${index}.issuer`)}
                  error={itemErrors?.issuer?.message}
                />
                <FormField
                  label="Date"
                  type="month"
                  hint="Optional"
                  {...register(`awards.${index}.date`)}
                  error={itemErrors?.date?.message}
                />
              </div>
              <FormField
                as="textarea"
                label="Description"
                rows={2}
                hint="Optional"
                {...register(`awards.${index}.description`)}
                error={itemErrors?.description?.message}
              />
            </article>
          )
        })}
      </div>
    </section>
  )
}
