import { useFormContext } from 'react-hook-form'
import type { CvFormData } from '../../validation/cvSchema'
import { FormField, SectionHeader } from '../ui/FormField'

export function PersonalInfoSection() {
  const {
    register,
    formState: { errors },
  } = useFormContext<CvFormData>()
  const personalErrors = errors.personal

  return (
    <section className="form-section" aria-labelledby="personal-heading">
      <SectionHeader
        title="Personal information"
        description="How employers can reach you."
      />
      <div className="field-grid field-grid--2">
        <FormField
          label="First name"
          required
          autoComplete="given-name"
          {...register('personal.firstName')}
          error={personalErrors?.firstName?.message}
        />
        <FormField
          label="Last name"
          required
          autoComplete="family-name"
          {...register('personal.lastName')}
          error={personalErrors?.lastName?.message}
        />
        <FormField
          label="Email"
          required
          type="email"
          autoComplete="email"
          {...register('personal.email')}
          error={personalErrors?.email?.message}
        />
        <FormField
          label="Phone"
          type="tel"
          autoComplete="tel"
          placeholder="+1 555 123 4567"
          {...register('personal.phone')}
          error={personalErrors?.phone?.message}
        />
        <FormField
          label="City"
          autoComplete="address-level2"
          {...register('personal.city')}
          error={personalErrors?.city?.message}
        />
        <FormField
          label="Country"
          autoComplete="country-name"
          {...register('personal.country')}
          error={personalErrors?.country?.message}
        />
        <FormField
          label="LinkedIn"
          type="url"
          placeholder="https://linkedin.com/in/you"
          {...register('personal.linkedIn')}
          error={personalErrors?.linkedIn?.message}
        />
        <FormField
          label="Website"
          type="url"
          placeholder="https://yourportfolio.com"
          {...register('personal.website')}
          error={personalErrors?.website?.message}
        />
      </div>
    </section>
  )
}
