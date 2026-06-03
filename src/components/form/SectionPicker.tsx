import { useFormContext, type FieldPath } from 'react-hook-form'
import {
  SECTION_CATALOG,
  SECTION_FORM_ROOTS,
  type SectionId,
} from '../../constants/sections'
import type { CvFormData } from '../../validation/cvSchema'

export function SectionPicker() {
  const {
    watch,
    setValue,
    clearErrors,
    formState: { errors },
  } = useFormContext<CvFormData>()

  const sections = watch('sections')
  const sectionsError = errors.sections?.message

  function toggleSection(id: SectionId) {
    const next = !sections[id]
    setValue(`sections.${id}`, next, { shouldDirty: true })
    if (!next) {
      clearErrors(SECTION_FORM_ROOTS[id] as FieldPath<CvFormData>)
    }
  }

  const enabledCount = SECTION_CATALOG.filter((s) => sections[s.id]).length

  return (
    <section className="form-section section-picker" aria-labelledby="sections-heading">
      <h2 id="sections-heading" className="section-title">
        CV sections
      </h2>
      <p className="section-desc">
        Choose which sections appear on your CV. Only enabled sections are validated and
        shown in the preview. Personal details are always included.
      </p>
      {sectionsError ? (
        <p className="section-error" role="alert">
          {sectionsError}
        </p>
      ) : null}
      <p className="section-picker__count" aria-live="polite">
        {enabledCount} of {SECTION_CATALOG.length} optional sections enabled
      </p>
      <div className="section-picker__grid" role="group" aria-label="Toggle CV sections">
        {SECTION_CATALOG.map((section) => {
          const enabled = sections[section.id]
          return (
            <label
              key={section.id}
              className={`section-chip${enabled ? ' section-chip--on' : ''}`}
            >
              <input
                type="checkbox"
                className="section-chip__input"
                checked={enabled}
                onChange={() => toggleSection(section.id)}
              />
              <span className="section-chip__label">{section.label}</span>
              <span className="section-chip__hint">{section.description}</span>
            </label>
          )
        })}
      </div>
    </section>
  )
}
