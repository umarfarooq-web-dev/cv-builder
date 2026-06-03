import { useFieldArray, useFormContext } from 'react-hook-form'
import { defaultArticle } from '../../constants/defaults'
import type { CvFormData } from '../../validation/cvSchema'
import { FormField, SectionHeader } from '../ui/FormField'

export function ArticlesSection() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<CvFormData>()

  const { fields, append, remove } = useFieldArray({ control, name: 'articles' })
  const rootError = errors.articles?.message ?? errors.articles?.root?.message

  return (
    <section className="form-section">
      <SectionHeader
        title="Articles"
        description="Published articles, research papers, or editorial contributions."
        action={
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={() => append(defaultArticle())}
          >
            Add article
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
          const itemErrors = errors.articles?.[index]
          return (
            <article key={field.id} className="entry-card">
              <div className="entry-card__header">
                <h3 className="entry-card__title">Article {index + 1}</h3>
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
                  {...register(`articles.${index}.title`)}
                  error={itemErrors?.title?.message}
                />
                <FormField
                  label="Publication / outlet"
                  required
                  {...register(`articles.${index}.publication`)}
                  error={itemErrors?.publication?.message}
                />
                <FormField
                  label="Published date"
                  type="month"
                  hint="Optional"
                  {...register(`articles.${index}.publishedDate`)}
                  error={itemErrors?.publishedDate?.message}
                />
                <FormField
                  label="URL"
                  type="url"
                  placeholder="https://…"
                  {...register(`articles.${index}.url`)}
                  error={itemErrors?.url?.message}
                />
              </div>
              <FormField
                as="textarea"
                label="Summary"
                rows={3}
                hint="Optional — brief abstract or key takeaway"
                {...register(`articles.${index}.description`)}
                error={itemErrors?.description?.message}
              />
            </article>
          )
        })}
      </div>
    </section>
  )
}
