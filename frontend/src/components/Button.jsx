// Button from the Momentum design system (Figma: Button, node 6:42).
// Four styles, all 44px tall with 8px corners.

const styleClasses = {
  primary: 'bg-brand text-white border-2 border-transparent hover:bg-brand-hover',
  secondary: 'bg-white text-ink border border-line',
  danger: 'bg-red text-white border-2 border-transparent',
  ghost: 'bg-canvas text-brand border-2 border-transparent',
}

function Button({
  variant = 'primary',
  type = 'button',
  disabled = false,
  className = '',
  children,
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg px-3
        text-label whitespace-nowrap outline-none
        focus-visible:border-2 focus-visible:border-brand
        disabled:cursor-not-allowed disabled:opacity-45
        ${styleClasses[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}

export default Button
