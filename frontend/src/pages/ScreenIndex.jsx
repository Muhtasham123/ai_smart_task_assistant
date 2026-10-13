import { Link } from 'react-router-dom'

// A plain index of everything built in Sprint 1, so the screens are easy to
// open and compare against Figma. This is a development helper, not a
// screen from the design.

const groups = [
  {
    title: 'Account access',
    story: 'US-01 · US-02 · US-04 · US-34',
    links: [
      { to: '/login', label: 'login · Welcome back' },
      { to: '/register', label: 'register · Create your account' },
      { to: '/register-validation', label: 'register-validation · Let’s check a few details' },
      { to: '/registered', label: 'registered · You’re all set' },
      { to: '/forgot', label: 'forgot · Forgot your password?' },
      { to: '/email-sent', label: 'email-sent · Check your inbox' },
      { to: '/reset', label: 'reset · Set a new password' },
      { to: '/reset-success', label: 'reset-success · Password updated' },
      { to: '/reset-expired', label: 'reset-expired · This link has expired' },
      { to: '/admin/login', label: 'admin-login · Administrator sign in' },
    ],
  },
  {
    title: 'Profile',
    story: 'US-05 · US-06 · US-07 · US-08',
    links: [
      { to: '/profile', label: 'profile · Your profile' },
      { to: '/profile/edit', label: 'edit-profile · Edit your profile' },
    ],
  },
  {
    title: 'Results and errors',
    story: 'US-03 · US-06 · US-07 · US-08',
    links: [
      { to: '/profile-saved', label: 'profile-saved · Profile updated' },
      { to: '/password-changed', label: 'password-changed · Password changed' },
      { to: '/account-deleted', label: 'account-deleted · Account deleted' },
      { to: '/logged-out', label: 'logged-out · You’re signed out' },
      { to: '/profile-error', label: 'profile-error · Profile update failed' },
      { to: '/login-error', label: 'login-error · We couldn’t sign you in' },
      { to: '/admin/login-error', label: 'admin-login-error · Admin sign-in failed' },
      { to: '/account-blocked', label: 'account-blocked · Your account is blocked' },
      { to: '/account-inactive', label: 'account-inactive · Your account is inactive' },
      { to: '/session-expired', label: 'session-expired · Your session has expired' },
      { to: '/signing-in', label: 'login-loading · Signing you in' },
      { to: '/admin/signing-in', label: 'admin-login-loading · Opening admin console' },
    ],
  },
]

function ScreenIndex() {
  return (
    <div className="min-h-screen bg-navy p-6 lg:p-16">
      <p className="text-h2 whitespace-pre text-white">◈&nbsp;&nbsp;momentum</p>
      <p className="mt-6 text-tiny text-whitemuted">SPRINT 1 · AUTHENTICATION &amp; PROFILE</p>
      <h1 className="mt-4 text-hero text-white">
        Less juggling.
        <br />
        More progress.
      </h1>
      <p className="mt-6 max-w-[640px] text-body text-whitemuted">
        Every screen built for Sprint 1. The confirm dialogs (log out, change password,
        delete account, discard edits) open from the profile screens.
      </p>

      <div className="mt-10 flex flex-col gap-6 xl:flex-row">
        {groups.map((group) => (
          <div
            key={group.title}
            className="flex flex-1 flex-col gap-3 rounded-2xl border border-line bg-night p-6"
          >
            <p className="text-h3 text-white">{group.title}</p>
            <p className="text-tiny text-whitemuted">{group.story}</p>
            <div className="mt-2 flex flex-col gap-2">
              {group.links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="rounded-lg bg-white px-3 py-2 text-small text-ink hover:bg-brandsoft"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ScreenIndex
