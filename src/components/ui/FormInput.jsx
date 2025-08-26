import { forwardRef, useId, useState } from 'react'
import clsx from 'clsx'
import '@/components/ui/Ui.css'

const FormInput = forwardRef(function FormInput(
  {
    label,
    hint,
    error,
    name,
    value,
    onChange,
    onBlur, // ⬅️ giữ onBlur từ ngoài
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
    errorOnBlur = false, // ⬅️ mới: chỉ hiện lỗi sau blur nếu true
    ...rest
  },
  ref
) {
  const rid = useId()
  const [show, setShow] = useState(false)
  const [touched, setTouched] = useState(false) // ⬅️ mới
  const isPassword = type === 'password'
  const inputType =
    isPassword && passwordToggle ? (show ? 'text' : 'password') : type

  const showErr = Boolean(error) && (!errorOnBlur || touched) // ⬅️ mới

  const handleBlur = (e) => {
    // ⬅️ mới
    setTouched(true)
    onBlur?.(e)
  }

  return (
    <div
      className={clsx(
        'ui-field',
        size === 'lg' && 'ui-field-lg',
        disabled && 'is-disabled',
        showErr && 'is-invalid', // ⬅️ đổi: dùng showErr
        className
      )}
    >
      {label && (
        <label className="ui-label" htmlFor={rid}>
          {label} {required && <span className="req">*</span>}
        </label>
      )}

      <div
        className={clsx(
          'ui-control',
          (left || right || (isPassword && passwordToggle)) && 'with-adorn'
        )}
      >
        {left && <span className="ui-adorn left">{left}</span>}

        <input
          id={rid}
          ref={ref}
          className={clsx('ui-input', inputClassName)}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={handleBlur} // ⬅️ đổi: wrap để set touched
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

      {showErr ? ( // ⬅️ đổi: dùng showErr
        <div className="ui-help error">{error}</div>
      ) : (
        hint && <div className="ui-help">{hint}</div>
      )}
    </div>
  )
})

export default FormInput
