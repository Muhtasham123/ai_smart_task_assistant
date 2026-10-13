// Notice from the Momentum design system (Figma: Notice, node 6:155).
// A soft coloured panel with a title and one line of supporting text.

const typeClasses = {
  info: 'bg-brandsoft text-brand',
  success: 'bg-tealsoft text-teal',
  error: 'bg-redsoft text-red',
  warning: 'bg-ambersoft text-amber',
}

function Notice({ type = 'info', title, body, className = '' }) {
  return (
    <div className={`flex flex-col gap-1 rounded-lg p-4 ${typeClasses[type]} ${className}`}>
      <p className="w-full text-label">{title}</p>
      <p className="w-full text-small">{body}</p>
    </div>
  )
}

export default Notice
