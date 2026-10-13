import { useState } from 'react'

// Field from the Momentum design system (Figma: Field, node 6:97).
// Label on top, 44px input box, then a help line. The help line is always
// rendered (even when empty) so fields sitting next to each other line up,
// exactly like the 96px tall field in Figma.

function HelpLine({ text, isError }) {
  return (
    <p className={`w-full text-small ${isError ? 'text-red' : 'text-muted'}`}>
      {text || '​'}
    </p>
  )
}

function boxClasses(hasError, disabled) {
  if (disabled) return 'border border-line bg-graysoft'
  if (hasError) return 'border border-red bg-white'
  return 'border border-line bg-white focus-within:border-2 focus-within:border-brand'
}

function Field({
  label,
  help,
  error,
  type = 'text',
  disabled = false,
  className = '',
  ...rest
}) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const isDate = type === 'date'

  return (
    <div className={`flex flex-col gap-1.5 ${disabled ? 'opacity-50' : ''} ${className}`}>
      {label && <label className="w-full text-label text-ink">{label}</label>}

      <div
        className={`relative flex h-11 items-center gap-2 rounded-lg px-3 ${boxClasses(error, disabled)}`}
      >
        <input
          type={isPassword && showPassword ? 'text' : type}
          disabled={disabled}
          className="min-w-0 flex-1 bg-transparent text-body text-ink outline-none
            placeholder:text-muted disabled:cursor-not-allowed"
          {...rest}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="shrink-0 cursor-pointer text-small text-muted"
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        )}

        {isDate && (
          <span aria-hidden="true" className="shrink-0 text-small text-muted">
            ▦
          </span>
        )}
      </div>

      <HelpLine text={error || help} isError={Boolean(error)} />
    </div>
  )
}

// Same shell as Field, but wrapping a native <select>.
export function SelectField({
  label,
  help,
  error,
  options = [],
  disabled = false,
  className = '',
  ...rest
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${disabled ? 'opacity-50' : ''} ${className}`}>
      {label && <label className="w-full text-label text-ink">{label}</label>}

      <div
        className={`flex h-11 items-center gap-2 rounded-lg px-3 ${boxClasses(error, disabled)}`}
      >
        <select
          disabled={disabled}
          className="min-w-0 flex-1 cursor-pointer appearance-none bg-transparent
            text-body text-ink outline-none disabled:cursor-not-allowed"
          {...rest}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <span aria-hidden="true" className="shrink-0 text-small text-muted">
          ⌄
        </span>
      </div>

      <HelpLine text={error || help} isError={Boolean(error)} />
    </div>
  )
}

export default Field
