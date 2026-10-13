// Checkbox from the Momentum design system (Figma: Checkbox, node 6:138).
// 20px square. Unchecked is white with a grey border, checked is brand with a tick.

function Checkbox({ checked = false, onChange, label, className = '' }) {
  return (
    <label className={`flex cursor-pointer items-start gap-3 ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange?.(event.target.checked)}
        className="sr-only"
      />
      <span
        aria-hidden="true"
        className={`flex size-5 shrink-0 items-center justify-center rounded-sm border text-small
          ${checked ? 'border-brand bg-brand text-white' : 'border-line bg-white'}`}
      >
        {checked ? '✓' : ''}
      </span>
      {label && <span className="text-small text-muted">{label}</span>}
    </label>
  )
}

export default Checkbox
