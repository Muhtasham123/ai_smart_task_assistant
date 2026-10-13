// Badge from the Momentum design system (Figma: Badge, node 6:128).
// Sprint 1 only needs the account-status colours.

const statusClasses = {
  active: 'bg-tealsoft text-teal',
  blocked: 'bg-redsoft text-red',
  inactive: 'bg-graysoft text-muted',
}

function Badge({ status = 'active', children, className = '' }) {
  return (
    <span
      className={`inline-flex h-7 min-w-[94px] items-center justify-center gap-1 rounded-lg px-1
        text-tiny ${statusClasses[status]} ${className}`}
    >
      {children}
    </span>
  )
}

export default Badge
