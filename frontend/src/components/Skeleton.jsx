// Skeleton from the Momentum design system (Figma: Skeleton, node 6:163).
// Two grey bars inside a soft grey card, used on the loading screens.

function Skeleton({ className = '' }) {
  return (
    <div className={`flex flex-col gap-2 rounded-lg bg-graysoft p-4 ${className}`}>
      <div className="h-3 w-full rounded-sm bg-line" />
      <div className="h-3 w-[89%] rounded-sm bg-line" />
    </div>
  )
}

export default Skeleton
