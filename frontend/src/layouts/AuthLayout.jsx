import ProgressBar from '../components/ProgressBar'

// The two column layout shared by every sign in / sign up / password screen.
// Left: the brand story panel. Right: the account form.
// Figma: "02 · Account access" (node 8:2 for users, 8:186 for admins).

const brandContent = {
  user: {
    background: 'bg-brand',
    eyebrow: 'SMART TASK ASSISTANT',
    headingLines: ['Less juggling.', 'More progress.'],
    intro: 'Plan your day, turn ideas into action, and make room for what matters.',
    previewTitle: 'Today’s focus',
    previewSubtitle: 'Submit database assignment',
    previewNote: '4 of 6 steps complete. You’re making progress.',
    footer: 'A thoughtful workspace, powered by AI.',
  },
  admin: {
    background: 'bg-navy',
    eyebrow: 'ADMINISTRATION',
    headingLines: ['A clear view.', 'A healthier system.'],
    intro: 'Manage accounts and monitor your system with confidence.',
    previewTitle: 'All services operational',
    previewSubtitle: '99.98% uptime  ·  48 ms latency',
    previewNote: 'Only authorized administrators can sign in.',
    footer: 'Private work stays private.',
  },
}

function BrandStory({ variant }) {
  const content = brandContent[variant]

  return (
    <div
      className={`hidden w-[560px] shrink-0 flex-col gap-8 p-14 lg:flex ${content.background}`}
    >
      <p className="text-h2 whitespace-pre text-white">◈&nbsp;&nbsp;momentum</p>
      <p className="text-tiny text-whitemuted">{content.eyebrow}</p>

      {/* Matches the empty 110px spacer in the Figma frame. */}
      <div className="h-[110px]" />

      <h1 className="text-hero text-white">
        {content.headingLines[0]}
        <br />
        {content.headingLines[1]}
      </h1>
      <p className="w-[448px] text-body text-white">{content.intro}</p>

      <div className="flex w-[448px] flex-col gap-4 rounded-2xl border border-line bg-night p-6">
        <p className="text-h3 text-white">{content.previewTitle}</p>
        <p className="text-label whitespace-pre text-white">{content.previewSubtitle}</p>
        <ProgressBar percent={67} className="w-[400px]" />
        <p className="text-small text-whitemuted">{content.previewNote}</p>
      </div>

      <p className="text-small text-whitemuted">{content.footer}</p>
    </div>
  )
}

function AuthLayout({ variant = 'user', children }) {
  return (
    <div className="flex min-h-screen bg-white">
      <BrandStory variant={variant} />

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 sm:px-10 lg:p-16">
        <div className="flex w-full max-w-[480px] flex-col gap-4">{children}</div>
      </div>
    </div>
  )
}

export default AuthLayout
