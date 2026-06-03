import { useState } from 'react'
import type { KeyboardEvent } from 'react'
import { useFormContext } from 'react-hook-form'
import type { CvFormData } from '../../validation/cvSchema'
import { SectionHeader } from '../ui/FormField'

type TagListSectionProps = {
  fieldName: 'skills' | 'interests'
  title: string
  description: string
  itemLabel: string
  placeholder: string
  maxItems: number
  addButtonLabel?: string
}

export function TagListSection({
  fieldName,
  title,
  description,
  itemLabel,
  placeholder,
  maxItems,
  addButtonLabel = 'Add',
}: TagListSectionProps) {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<CvFormData>()

  const items = watch(fieldName) ?? []
  const [draft, setDraft] = useState('')
  const [draftError, setDraftError] = useState<string | null>(null)

  const fieldErrors = errors[fieldName]
  const rootError =
    fieldErrors && 'message' in fieldErrors && typeof fieldErrors.message === 'string'
      ? fieldErrors.message
      : undefined

  function addItem() {
    const trimmed = draft.trim()
    if (!trimmed) {
      setDraftError(`Enter ${itemLabel.toLowerCase()} before adding`)
      return
    }
    if (trimmed.length > 50) {
      setDraftError('Must be 50 characters or fewer')
      return
    }
    if (items.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setDraftError('Already listed')
      return
    }
    if (items.length >= maxItems) {
      setDraftError(`Maximum ${maxItems} items allowed`)
      return
    }
    setValue(fieldName, [...items, trimmed] as CvFormData[typeof fieldName], {
      shouldValidate: true,
      shouldDirty: true,
    })
    setDraft('')
    setDraftError(null)
  }

  function removeItem(index: number) {
    setValue(
      fieldName,
      items.filter((_, i) => i !== index) as CvFormData[typeof fieldName],
      { shouldValidate: true, shouldDirty: true },
    )
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      addItem()
    }
  }

  const inputId = `${fieldName}-draft`

  return (
    <section className="form-section">
      <SectionHeader title={title} description={description} />
      {rootError ? (
        <p className="section-error" role="alert">
          {rootError}
        </p>
      ) : null}
      <div className="skills-input-row">
        <div className={`field${draftError ? ' field--error' : ''}`}>
          <label htmlFor={inputId} className="field-label">
            New {itemLabel.toLowerCase()}
          </label>
          <input
            id={inputId}
            className={draftError ? 'field-input field-input--error' : 'field-input'}
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value)
              if (draftError) setDraftError(null)
            }}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            aria-invalid={Boolean(draftError)}
          />
          {draftError ? (
            <p className="field-error" role="alert">
              {draftError}
            </p>
          ) : null}
        </div>
        <button type="button" className="btn btn--secondary" onClick={addItem}>
          {addButtonLabel}
        </button>
      </div>
      {items.length > 0 ? (
        <ul className="skill-tags" aria-label={`${title} list`}>
          {items.map((item, index) => (
            <li key={`${item}-${index}`} className="skill-tag">
              <span>{item}</span>
              <button
                type="button"
                className="skill-tag__remove"
                onClick={() => removeItem(index)}
                aria-label={`Remove ${item}`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="field-hint">None added yet.</p>
      )}
    </section>
  )
}
