import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthFormHeader from '../../components/AuthFormHeader'
import Button from '../../components/Button'
import Checkbox from '../../components/Checkbox'
import Field from '../../components/Field'
import AuthLayout from '../../layouts/AuthLayout'

// US-02 · Sign in to the user workspace. Figma node 8:2.

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)

  function handleSubmit(event) {
    event.preventDefault()
    navigate('/profile')
  }

  return (
    <AuthLayout variant="user">
      <AuthFormHeader
        title="Welcome back"
        description="Sign in to your personal workspace."
      />

      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
        <Field
          label="Email *"
          type="email"
          placeholder="saitama@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
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

      <Link to="/register" className="text-body text-brand">
        New here? Create an account →
      </Link>
      <Link to="/admin/login" className="text-small text-muted">
        Administrator sign in →
      </Link>
      <p className="w-full text-small text-muted">
        By continuing, you agree to our terms and privacy policy.
      </p>
    </AuthLayout>
  )
}

export default Login
