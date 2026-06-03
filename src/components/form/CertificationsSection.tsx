import { useFieldArray, useFormContext } from 'react-hook-form'
import { defaultCertification } from '../../constants/defaults'
import type { CvFormData } from '../../validation/cvSchema'
import { FormField, SectionHeader } from '../ui/FormField'

export function CertificationsSection() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<CvFormData>()

  const { fields, append, remove } = useFieldArray({ control, name: 'certifications' })
  const rootError = errors.certifications?.message ?? errors.certifications?.root?.message

  return (
    <section className="form-section">
      <SectionHeader
        title="Certifications"
        description="Professional licenses, credentials, and certificates."
        action={
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={() => append(defaultCertification())}
          >
            Add certification
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
          const itemErrors = errors.certifications?.[index]
          return (
            <article key={field.id} className="entry-card">
              <div className="entry-card__header">
                <h3 className="entry-card__title">Certification {index + 1}</h3>
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
                  {...register(`certifications.${index}.name`)}
                  error={itemErrors?.name?.message}
                />
                <FormField
                  label="Issuer"
                  required
                  {...register(`certifications.${index}.issuer`)}
                  error={itemErrors?.issuer?.message}
                />
                <FormField
                  label="Issue date"
                  type="month"
                  hint="Optional"
                  {...register(`certifications.${index}.issueDate`)}
                  error={itemErrors?.issueDate?.message}
                />
                <FormField
                  label="Expiry date"
                  type="month"
                  hint="Optional"
                  {...register(`certifications.${index}.expiryDate`)}
                  error={itemErrors?.expiryDate?.message}
                />
                <FormField
                  label="Credential ID"
                  {...register(`certifications.${index}.credentialId`)}
                  error={itemErrors?.credentialId?.message}
                />
                <FormField
                  label="Verification URL"
                  type="url"
                  {...register(`certifications.${index}.url`)}
                  error={itemErrors?.url?.message}
                />
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
