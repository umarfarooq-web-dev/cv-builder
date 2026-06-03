import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'
import { useId } from 'react'

type BaseProps = {
  label: string
  error?: string
  hint?: string
  required?: boolean
}

type InputProps = BaseProps & {
  as?: 'input'
} & InputHTMLAttributes<HTMLInputElement>

type TextareaProps = BaseProps & {
  as: 'textarea'
} & TextareaHTMLAttributes<HTMLTextAreaElement>

type FormFieldProps = InputProps | TextareaProps

export function FormField(props: FormFieldProps) {
  const generatedId = useId()
  const id = props.id ?? generatedId
  const { label, error, hint, required, as = 'input', ...rest } = props
  const errorId = error ? `${id}-error` : undefined
  const hintId = hint ? `${id}-hint` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  const common = {
    id,
    className: error ? 'field-input field-input--error' : 'field-input',
    'aria-invalid': Boolean(error),
    'aria-describedby': describedBy,
  }

  return (
    <div className={`field${error ? ' field--error' : ''}`}>
      <label htmlFor={id} className="field-label">
        {label}
        {required ? <span className="field-required"> *</span> : null}
      </label>
      {as === 'textarea' ? (
        <textarea {...common} {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)} />
      ) : (
        <input {...common} {...(rest as InputHTMLAttributes<HTMLInputElement>)} />
      )}
      {hint ? (
        <p id={hintId} className="field-hint">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="field-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export function SectionHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="section-header">
      <div>
        <h2 className="section-title">{title}</h2>
        {description ? <p className="section-desc">{description}</p> : null}
      </div>
      {action}
    </div>
  )
}
