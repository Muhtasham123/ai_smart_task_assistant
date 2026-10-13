import { useNavigate } from 'react-router-dom'
import AuthFormHeader from '../../components/AuthFormHeader'
import Button from '../../components/Button'
import Notice from '../../components/Notice'
import AuthLayout from '../../layouts/AuthLayout'

// US-01 · Confirmation after the account is created. Figma node 8:439.

function Registered() {
  const navigate = useNavigate()

  return (
    <AuthLayout variant="user">
      <AuthFormHeader
        title="You’re all set"
        description="Your account has been created successfully."
      />

      <Notice
        type="success"
        title="Welcome to Momentum"
        body="Sign in to start organizing your day."
      />

      <Button className="w-full" onClick={() => navigate('/login')}>
        Continue to sign in
      </Button>
    </AuthLayout>
  )
}

export default Registered
