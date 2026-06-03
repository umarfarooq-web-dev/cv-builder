import { useFieldArray, useFormContext } from 'react-hook-form'
import { defaultBlog } from '../../constants/defaults'
import type { CvFormData } from '../../validation/cvSchema'
import { FormField, SectionHeader } from '../ui/FormField'

export function BlogsSection() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<CvFormData>()

  const { fields, append, remove } = useFieldArray({ control, name: 'blogs' })
  const rootError = errors.blogs?.message ?? errors.blogs?.root?.message

  return (
    <section className="form-section">
      <SectionHeader
        title="Blogs"
        description="Blog posts, newsletters, or personal writing you want to highlight."
        action={
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={() => append(defaultBlog())}
          >
            Add blog post
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
          const itemErrors = errors.blogs?.[index]
          return (
            <article key={field.id} className="entry-card">
              <div className="entry-card__header">
                <h3 className="entry-card__title">Blog post {index + 1}</h3>
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
                  label="Post title"
                  required
                  {...register(`blogs.${index}.title`)}
                  error={itemErrors?.title?.message}
                />
                <FormField
                  label="Blog / platform"
                  required
                  placeholder="Medium, Dev.to, personal site…"
                  {...register(`blogs.${index}.platform`)}
                  error={itemErrors?.platform?.message}
                />
                <FormField
                  label="Published date"
                  type="month"
                  hint="Optional"
                  {...register(`blogs.${index}.publishedDate`)}
                  error={itemErrors?.publishedDate?.message}
                />
                <FormField
                  label="URL"
                  type="url"
                  placeholder="https://…"
                  {...register(`blogs.${index}.url`)}
                  error={itemErrors?.url?.message}
                />
              </div>
              <FormField
                as="textarea"
                label="Excerpt"
                rows={3}
                hint="Optional — short summary of the post"
                {...register(`blogs.${index}.excerpt`)}
                error={itemErrors?.excerpt?.message}
              />
            </article>
          )
        })}
      </div>
    </section>
  )
}
