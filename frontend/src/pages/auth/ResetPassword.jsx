import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthFormHeader from '../../components/AuthFormHeader'
import Button from '../../components/Button'
import Field from '../../components/Field'
import ProgressBar from '../../components/ProgressBar'
import AuthLayout from '../../layouts/AuthLayout'
import { getPasswordStrength } from '../../utils/passwordStrength'

// US-04 · Choose the new password. Figma node 8:98.

function ResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const strength = getPasswordStrength(password)

  function handleSubmit(event) {
    event.preventDefault()
    navigate('/reset-success')
  }

  return (
    <AuthLayout variant="user">
      <AuthFormHeader
        title="Set a new password"
        description="Choose a strong password you haven’t used before."
      />

      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
        <Field
          label="New password *"
          type="password"
          placeholder="••••••••••••"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        <ProgressBar percent={strength.percent} />
        <p className={`w-full text-small ${strength.isStrong ? 'text-teal' : 'text-muted'}`}>
          {strength.isStrong ? 'Strong · ' : ''}
          12 characters, uppercase, lowercase, number and symbol
        </p>

        <Field
          label="Confirm password *"
          type="password"
          placeholder="••••••••••••"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          error={
            confirmPassword && confirmPassword !== password
              ? 'Passwords do not match.'
              : ''
          }
          required
        />

        <Button type="submit" className="w-full">
          Reset password
        </Button>
        <Button variant="ghost" className="w-full" onClick={() => navigate('/login')}>
          Back to sign in
        </Button>
      </form>
    </AuthLayout>
  )
}

export default ResetPassword
