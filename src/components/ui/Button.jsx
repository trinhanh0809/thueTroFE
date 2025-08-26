import clsx from 'clsx'
import '@/components/ui/Ui.css'

export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  full = false,
  loading = false,
  disabled = false,
  iconRight,
  className,
  ...rest
}) {
  const isDisabled = disabled || loading
  const rightIcon =
    iconRight === 'arrow' ? (
      <span className="btn-icon-right">→</span>
    ) : (
      iconRight || null
    )

  return (
    <button
      type={type}
      className={clsx(
        'btn',
        `btn-${variant}`,
        size === 'lg' && 'btn-lg',
        full && 'btn-full',
        className
      )}
      disabled={isDisabled}
      {...rest}
    >
      {loading ? 'Processing…' : children}
      {rightIcon && !loading && <span className="btn-right">{rightIcon}</span>}
    </button>
  )
}
