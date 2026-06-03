import { useFieldArray, useFormContext } from 'react-hook-form'
import { defaultReference } from '../../constants/defaults'
import type { CvFormData } from '../../validation/cvSchema'
import { FormField, SectionHeader } from '../ui/FormField'

export function ReferencesSection() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<CvFormData>()

  const { fields, append, remove } = useFieldArray({ control, name: 'references' })
  const rootError = errors.references?.message ?? errors.references?.root?.message

  return (
    <section className="form-section">
      <SectionHeader
        title="References"
        description="People who can vouch for your work. Contact details are optional."
        action={
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={() => append(defaultReference())}
          >
            Add reference
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
          const itemErrors = errors.references?.[index]
          return (
            <article key={field.id} className="entry-card">
              <div className="entry-card__header">
                <h3 className="entry-card__title">Reference {index + 1}</h3>
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
                  label="Name"
                  required
                  {...register(`references.${index}.name`)}
                  error={itemErrors?.name?.message}
                />
                <FormField
                  label="Job title"
                  {...register(`references.${index}.title`)}
                  error={itemErrors?.title?.message}
                />
                <FormField
                  label="Organization"
                  {...register(`references.${index}.organization`)}
                  error={itemErrors?.organization?.message}
                />
                <FormField
                  label="Email"
                  type="email"
                  hint="Optional"
                  {...register(`references.${index}.email`)}
                  error={itemErrors?.email?.message}
                />
                <FormField
                  label="Phone"
                  type="tel"
                  hint="Optional"
                  {...register(`references.${index}.phone`)}
                  error={itemErrors?.phone?.message}
                />
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
