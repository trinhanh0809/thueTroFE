import { forwardRef, useId, useState } from 'react'
import clsx from 'clsx'
import '@/pages/ui/Ui.css'

/**
 * Reusable Input
 * Props:
 * - label, hint, error
 * - name, value, onChange, onBlur, type, placeholder
 * - required, disabled
 * - left, right: ReactNode (icon/text)
 * - passwordToggle: boolean (hiện/ẩn mật khẩu)
 * - size: 'md' | 'lg'
 */
const FormInput = forwardRef(function FormInput(
  {
    label,
    hint,
    error,
    name,
    value,
    onChange,
    onBlur,
    type = 'text',
    placeholder,
    required = false,
    disabled = false,
    left,
    right,
    passwordToggle = false,
    size = 'md',
    className,
    inputClassName,
    ...rest
  },
  ref
) {
  const rid = useId()
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword && passwordToggle ? (show ? 'text' : 'password') : type

  return (
    <div
      className={clsx(
        'ui-field',
        size === 'lg' && 'ui-field-lg',
        disabled && 'is-disabled',
        error && 'is-invalid',
        className
      )}
    >
      {label && (
        <label className="ui-label" htmlFor={rid}>
          {label} {required && <span className="req">*</span>}
        </label>
      )}

      <div className={clsx('ui-control', (left || right || (isPassword && passwordToggle)) && 'with-adorn')}>
        {left && <span className="ui-adorn left">{left}</span>}

        <input
          id={rid}
          ref={ref}
          className={clsx('ui-input', inputClassName)}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          type={inputType}
          placeholder={placeholder}
          disabled={disabled}
          {...rest}
        />

        {isPassword && passwordToggle ? (
          <button
            type="button"
            className="ui-adorn right ui-eye"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {show ? '🙈' : '👁️'}
          </button>
        ) : (
          right && <span className="ui-adorn right">{right}</span>
        )}
      </div>

      {error ? <div className="ui-help error">{error}</div> : hint && <div className="ui-help">{hint}</div>}
    </div>
  )
})

export default FormInput
