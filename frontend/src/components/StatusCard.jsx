// The white card used by every dialog and status screen in Figma
// (page "05 · States & dialogs"): 560px wide, 32px padding, 16px gaps.

function StatusCard({ title, description, children, className = '' }) {
  return (
    <div
      className={`flex w-full max-w-[560px] flex-col gap-4 rounded-2xl border border-line
        bg-white p-6 sm:p-8 ${className}`}
    >
      <h2 className="w-full text-h2 text-ink">{title}</h2>
      {description && <p className="w-full text-body text-muted">{description}</p>}
      {children}
    </div>
  )
}

export default StatusCard
