import { useFieldArray, useFormContext } from 'react-hook-form'
import { defaultVolunteer } from '../../constants/defaults'
import type { CvFormData } from '../../validation/cvSchema'
import { FormField, SectionHeader } from '../ui/FormField'

export function VolunteerSection() {
  const {
    register,
    control,
    watch,
    formState: { errors },
  } = useFormContext<CvFormData>()

  const { fields, append, remove } = useFieldArray({ control, name: 'volunteer' })
  const volunteer = watch('volunteer')
  const rootError = errors.volunteer?.message ?? errors.volunteer?.root?.message

  return (
    <section className="form-section">
      <SectionHeader
        title="Volunteer work"
        description="Community service, pro bono, or unpaid roles."
        action={
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={() => append(defaultVolunteer())}
          >
            Add volunteer role
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
          const current = volunteer?.[index]?.current
          const itemErrors = errors.volunteer?.[index]
          return (
            <article key={field.id} className="entry-card">
              <div className="entry-card__header">
                <h3 className="entry-card__title">Volunteer {index + 1}</h3>
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
                  label="Organization"
                  required
                  {...register(`volunteer.${index}.organization`)}
                  error={itemErrors?.organization?.message}
                />
                <FormField
                  label="Role"
                  required
                  {...register(`volunteer.${index}.role`)}
                  error={itemErrors?.role?.message}
                />
                <FormField
                  label="Start date"
                  required
                  type="month"
                  {...register(`volunteer.${index}.startDate`)}
                  error={itemErrors?.startDate?.message}
                />
                <div className="field field--checkbox">
                  <label className="checkbox-label">
                    <input type="checkbox" {...register(`volunteer.${index}.current`)} />
                    Ongoing
                  </label>
                </div>
                {!current ? (
                  <FormField
                    label="End date"
                    required
                    type="month"
                    {...register(`volunteer.${index}.endDate`)}
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
                rows={3}
                hint="Optional"
                {...register(`volunteer.${index}.description`)}
                error={itemErrors?.description?.message}
              />
            </article>
          )
        })}
      </div>
    </section>
  )
}
