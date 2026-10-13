import { useNavigate } from 'react-router-dom'
import AuthFormHeader from '../../components/AuthFormHeader'
import Button from '../../components/Button'
import Notice from '../../components/Notice'
import AuthLayout from '../../layouts/AuthLayout'

// US-04 · The password was changed. Figma node 8:136.

function ResetSuccess() {
  const navigate = useNavigate()

  return (
    <AuthLayout variant="user">
      <AuthFormHeader
        title="Password updated"
        description="You can now sign in with your new password."
      />

      <Notice
        type="success"
        title="Your account is secure"
        body="Your previous sessions have been signed out."
      />

      <Button className="w-full" onClick={() => navigate('/login')}>
        Continue to sign in
      </Button>
    </AuthLayout>
  )
}

export default ResetSuccess
