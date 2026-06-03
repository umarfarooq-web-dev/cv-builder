import { useFieldArray, useFormContext } from 'react-hook-form'
import { defaultProject } from '../../constants/defaults'
import type { CvFormData } from '../../validation/cvSchema'
import { FormField, SectionHeader } from '../ui/FormField'

export function ProjectsSection() {
  const {
    register,
    control,
    watch,
    formState: { errors },
  } = useFormContext<CvFormData>()

  const { fields, append, remove } = useFieldArray({ control, name: 'projects' })
  const projects = watch('projects')
  const rootError = errors.projects?.message ?? errors.projects?.root?.message

  return (
    <section className="form-section">
      <SectionHeader
        title="Projects"
        description="Portfolio, open-source, or client projects."
        action={
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={() => append(defaultProject())}
          >
            Add project
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
          const current = projects?.[index]?.current
          const hasStart = Boolean(projects?.[index]?.startDate?.trim())
          const itemErrors = errors.projects?.[index]
          return (
            <article key={field.id} className="entry-card">
              <div className="entry-card__header">
                <h3 className="entry-card__title">Project {index + 1}</h3>
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
                  label="Project name"
                  required
                  {...register(`projects.${index}.name`)}
                  error={itemErrors?.name?.message}
                />
                <FormField
                  label="Your role"
                  placeholder="Lead developer, Contributor…"
                  {...register(`projects.${index}.role`)}
                  error={itemErrors?.role?.message}
                />
                <FormField
                  label="URL"
                  type="url"
                  placeholder="https://…"
                  {...register(`projects.${index}.url`)}
                  error={itemErrors?.url?.message}
                />
                <FormField
                  label="Technologies"
                  placeholder="React, Node.js, PostgreSQL"
                  {...register(`projects.${index}.technologies`)}
                  error={itemErrors?.technologies?.message}
                />
                <FormField
                  label="Start date"
                  type="month"
                  hint="Optional"
                  {...register(`projects.${index}.startDate`)}
                  error={itemErrors?.startDate?.message}
                />
                <div className="field field--checkbox">
                  <label className="checkbox-label">
                    <input type="checkbox" {...register(`projects.${index}.current`)} />
                    Ongoing project
                  </label>
                </div>
                {hasStart && !current ? (
                  <FormField
                    label="End date"
                    type="month"
                    {...register(`projects.${index}.endDate`)}
                    error={itemErrors?.endDate?.message}
                  />
                ) : hasStart && current ? (
                  <div className="field">
                    <span className="field-label">End date</span>
                    <p className="field-static">Present</p>
                  </div>
                ) : null}
              </div>
              <FormField
                as="textarea"
                label="Description"
                required
                rows={4}
                {...register(`projects.${index}.description`)}
                error={itemErrors?.description?.message}
              />
            </article>
          )
        })}
      </div>
    </section>
  )
}
