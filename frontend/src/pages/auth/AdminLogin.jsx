import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthFormHeader from '../../components/AuthFormHeader'
import Button from '../../components/Button'
import Checkbox from '../../components/Checkbox'
import Field from '../../components/Field'
import AuthLayout from '../../layouts/AuthLayout'

// US-34 · Administrator sign in. Figma node 8:186.

function AdminLogin() {
  const navigate = useNavigate()
  const [account, setAccount] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)

  function handleSubmit(event) {
    event.preventDefault()
    // The admin console itself arrives in a later sprint.
    navigate('/admin/signing-in')
  }

  return (
    <AuthLayout variant="admin">
      <AuthFormHeader
        eyebrow="ADMIN ACCESS"
        title="Administrator sign in"
        description="Sign in to the secure admin console."
      />

      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
        <Field
          label="Admin email or username *"
          placeholder="admin@momentum.app"
          value={account}
          onChange={(event) => setAccount(event.target.value)}
          required
        />
        <Field
          label="Password *"
          type="password"
          placeholder="••••••••••"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        <div className="flex w-full max-w-[356px] items-center gap-3">
          <Checkbox
            checked={rememberMe}
            onChange={setRememberMe}
            label="Remember me"
            className="flex-1"
          />
          <Link to="/forgot" className="text-small text-brand">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className="w-full">
          Sign in
        </Button>
      </form>

      <Link to="/login" className="text-small text-brand">
        Return to user sign in →
      </Link>
      <p className="w-full text-small text-muted">
        By continuing, you agree to our terms and privacy policy.
      </p>
    </AuthLayout>
  )
}

export default AdminLogin
