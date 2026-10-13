// Scores a password against the four rules shown on the design:
// length, an uppercase letter, a number and a symbol.

export function getPasswordStrength(password) {
  const rules = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ]

  const passed = rules.filter(Boolean).length

  return {
    percent: (passed / rules.length) * 100,
    isStrong: passed === rules.length,
  }
}
