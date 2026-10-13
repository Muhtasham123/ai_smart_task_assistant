import { useNavigate } from 'react-router-dom'
import AuthFormHeader from '../../components/AuthFormHeader'
import Button from '../../components/Button'
import Field from '../../components/Field'
import Notice from '../../components/Notice'
import AuthLayout from '../../layouts/AuthLayout'

// US-01 · The registration form after the server rejects it. Figma node 8:463.
// The values below are the sample entries from the design, so every field
// shows its error message.

function RegisterValidation() {
  const navigate = useNavigate()

  return (
    <AuthLayout variant="user">
      <AuthFormHeader
        title="Let’s check a few details"
        description="Fix the highlighted fields to create your account."
      />

      <Field
        label="Username *"
        defaultValue="saitama"
        error="This username is already taken."
      />
      <Field
        label="Email *"
        defaultValue="saitama@"
        error="Enter a valid email address."
      />
      <Field
        label="Password *"
        type="password"
        defaultValue="abcd"
        error="Use at least 8 characters, including a number and symbol."
      />
      <Field
        label="Confirm password *"
        type="password"
        defaultValue="abcdef"
        error="Passwords do not match."
      />

      <Notice
        type="warning"
        title="Email already registered?"
        body="Sign in or reset your password to recover your account."
      />

      <Button className="w-full" onClick={() => navigate('/register')}>
        Review and retry
      </Button>
    </AuthLayout>
  )
}

export default RegisterValidation
