import { useFieldArray, useFormContext } from 'react-hook-form'
import { defaultExperience } from '../../constants/defaults'
import type { CvFormData } from '../../validation/cvSchema'
import { FormField, SectionHeader } from '../ui/FormField'

export function ExperienceSection() {
  const {
    register,
    control,
    watch,
    formState: { errors },
  } = useFormContext<CvFormData>()

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'experiences',
  })

  const experiences = watch('experiences')
  const rootError = errors.experiences?.message ?? errors.experiences?.root?.message

  return (
    <section className="form-section">
      <SectionHeader
        title="Work experience"
        description="List your roles from most recent first."
        action={
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={() => append(defaultExperience())}
          >
            Add experience
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
          const current = experiences?.[index]?.current
          const itemErrors = errors.experiences?.[index]

          return (
            <article key={field.id} className="entry-card">
              <div className="entry-card__header">
                <h3 className="entry-card__title">Role {index + 1}</h3>
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
                  label="Company"
                  required
                  {...register(`experiences.${index}.company`)}
                  error={itemErrors?.company?.message}
                />
                <FormField
                  label="Job title"
                  required
                  {...register(`experiences.${index}.position`)}
                  error={itemErrors?.position?.message}
                />
                <FormField
                  label="Location"
                  placeholder="City, Country"
                  {...register(`experiences.${index}.location`)}
                  error={itemErrors?.location?.message}
                />
                <div className="field field--checkbox">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      {...register(`experiences.${index}.current`)}
                    />
                    I currently work here
                  </label>
                </div>
                <FormField
                  label="Start date"
                  required
                  type="month"
                  {...register(`experiences.${index}.startDate`)}
                  error={itemErrors?.startDate?.message}
                />
                {!current ? (
                  <FormField
                    label="End date"
                    required
                    type="month"
                    {...register(`experiences.${index}.endDate`)}
                    error={itemErrors?.endDate?.message}
                  />
                ) : (
                  <div className="field">
                    <span className="field-label">End date</span>
                    <p className="field-static">Present</p>
                  </div>
                )}
              </div>
              <FormField
                as="textarea"
                label="Description"
                required
                rows={4}
                placeholder="Key achievements and responsibilities…"
                {...register(`experiences.${index}.description`)}
                error={itemErrors?.description?.message}
              />
            </article>
          )
        })}
      </div>
    </section>
  )
}
