import { useFieldArray, useFormContext } from 'react-hook-form'
import { defaultLanguage } from '../../constants/defaults'
import type { CvFormData } from '../../validation/cvSchema'
import { FormField, SectionHeader } from '../ui/FormField'

const PROFICIENCY_LEVELS = [
  'Native',
  'Fluent',
  'Professional',
  'Conversational',
  'Basic',
] as const

export function LanguagesSection() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<CvFormData>()

  const { fields, append, remove } = useFieldArray({ control, name: 'languages' })
  const rootError = errors.languages?.message ?? errors.languages?.root?.message

  return (
    <section className="form-section">
      <SectionHeader
        title="Languages"
        description="Languages you speak and your proficiency level."
        action={
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={() => append(defaultLanguage())}
          >
            Add language
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
          const itemErrors = errors.languages?.[index]
          return (
            <article key={field.id} className="entry-card">
              <div className="entry-card__header">
                <h3 className="entry-card__title">Language {index + 1}</h3>
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
                  label="Language"
                  required
                  {...register(`languages.${index}.language`)}
                  error={itemErrors?.language?.message}
                />
                <div className="field">
                  <label htmlFor={`languages.${index}.proficiency`} className="field-label">
                    Proficiency <span className="field-required">*</span>
                  </label>
                  <select
                    id={`languages.${index}.proficiency`}
                    className={
                      itemErrors?.proficiency ? 'field-input field-input--error' : 'field-input'
                    }
                    {...register(`languages.${index}.proficiency`)}
                    aria-invalid={Boolean(itemErrors?.proficiency)}
                  >
                    {PROFICIENCY_LEVELS.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                  {itemErrors?.proficiency?.message ? (
                    <p className="field-error" role="alert">
                      {itemErrors.proficiency.message}
                    </p>
                  ) : null}
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
