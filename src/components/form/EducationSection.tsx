import { useFieldArray, useFormContext } from 'react-hook-form'
import { defaultEducation } from '../../constants/defaults'
import type { CvFormData } from '../../validation/cvSchema'
import { FormField, SectionHeader } from '../ui/FormField'

export function EducationSection() {
  const {
    register,
    control,
    watch,
    formState: { errors },
  } = useFormContext<CvFormData>()

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'education',
  })

  const education = watch('education')
  const rootError = errors.education?.message ?? errors.education?.root?.message

  return (
    <section className="form-section">
      <SectionHeader
        title="Education"
        description="Degrees, certifications, or relevant training."
        action={
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={() => append(defaultEducation())}
          >
            Add education
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
          const current = education?.[index]?.current
          const itemErrors = errors.education?.[index]

          return (
            <article key={field.id} className="entry-card">
              <div className="entry-card__header">
                <h3 className="entry-card__title">Education {index + 1}</h3>
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
                  label="Institution"
                  required
                  {...register(`education.${index}.institution`)}
                  error={itemErrors?.institution?.message}
                />
                <FormField
                  label="Degree"
                  required
                  placeholder="B.Sc., M.A., etc."
                  {...register(`education.${index}.degree`)}
                  error={itemErrors?.degree?.message}
                />
                <FormField
                  label="Field of study"
                  {...register(`education.${index}.field`)}
                  error={itemErrors?.field?.message}
                />
                <div className="field field--checkbox">
                  <label className="checkbox-label">
                    <input type="checkbox" {...register(`education.${index}.current`)} />
                    Currently studying
                  </label>
                </div>
                <FormField
                  label="Start date"
                  required
                  type="month"
                  {...register(`education.${index}.startDate`)}
                  error={itemErrors?.startDate?.message}
                />
                {!current ? (
                  <FormField
                    label="End date"
                    required
                    type="month"
                    {...register(`education.${index}.endDate`)}
                    error={itemErrors?.endDate?.message}
                  />
                ) : (
                  <div className="field">
                    <span className="field-label">End date</span>
                    <p className="field-static">Present</p>
                  </div>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
