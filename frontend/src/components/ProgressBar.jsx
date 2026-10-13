// Progress bar used by the password strength meter and the brand panel preview.
// 8px tall track in graysoft, filled in teal.

function ProgressBar({ percent = 0, className = '' }) {
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-graysoft ${className}`}>
      <div className="h-2 rounded-full bg-teal" style={{ width: `${percent}%` }} />
    </div>
  )
}

export default ProgressBar
