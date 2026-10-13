// Every result screen from the Figma page "05 · States & dialogs" that Sprint 1 needs.
// They all share one card layout, so only the words and the kind change.
//
//   success -> green notice, primary button
//   error   -> red notice, primary button
//   loading -> two skeleton blocks, secondary button

const statusScreens = {
  'profile-saved': {
    kind: 'success',
    title: 'Profile updated',
    description: 'Your changes were saved successfully.',
    action: { label: 'View profile', to: '/profile' },
  },
  'password-changed': {
    kind: 'success',
    title: 'Password changed',
    description: 'Your password has been updated securely.',
    action: { label: 'Back to profile', to: '/profile' },
  },
  'account-deleted': {
    kind: 'success',
    title: 'Account deleted',
    description: 'Your data has been removed and your session has ended.',
    action: { label: 'Return to sign in', to: '/login' },
  },
  'logged-out': {
    kind: 'success',
    title: 'You’re signed out',
    description: 'Your session has ended securely.',
    action: { label: 'Sign in again', to: '/login' },
  },
  'login-error': {
    kind: 'error',
    title: 'We couldn’t sign you in',
    description: 'The email or password is incorrect. Check your details and try again.',
    action: { label: 'Return and retry', to: '/login' },
  },
  'admin-login-error': {
    kind: 'error',
    title: 'Admin sign-in failed',
    description: 'The username or password is incorrect.',
    action: { label: 'Return and retry', to: '/admin/login' },
  },
  'account-blocked': {
    kind: 'error',
    title: 'Your account is blocked',
    description: 'Contact your system administrator to restore access.',
    action: { label: 'Return and retry', to: '/login' },
  },
  'account-inactive': {
    kind: 'error',
    title: 'Your account is inactive',
    description: 'Contact support for help reactivating your account.',
    action: { label: 'Return and retry', to: '/login' },
  },
  'session-expired': {
    kind: 'error',
    title: 'Your session has expired',
    description: 'Sign in again to continue. Your saved work is safe.',
    action: { label: 'Return and retry', to: '/login' },
  },
  'profile-error': {
    kind: 'error',
    title: 'Profile update failed',
    description: 'We couldn’t save your changes. Please try again.',
    action: { label: 'Return and retry', to: '/profile/edit' },
  },
  'signing-in': {
    kind: 'loading',
    title: 'Signing you in',
    description: 'Checking your credentials securely…',
    action: { label: 'Continue preview', to: '/profile' },
  },
  'admin-signing-in': {
    kind: 'loading',
    title: 'Opening admin console',
    description: 'Checking administrator access…',
    action: { label: 'Continue preview', to: '/admin/login' },
  },
}

export default statusScreens
