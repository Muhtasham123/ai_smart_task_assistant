import { useNavigate } from 'react-router-dom'
import AuthFormHeader from '../../components/AuthFormHeader'
import Button from '../../components/Button'
import Notice from '../../components/Notice'
import AuthLayout from '../../layouts/AuthLayout'

// US-04 · The reset link is no longer valid. Figma node 8:160.

function ResetExpired() {
  const navigate = useNavigate()

  return (
    <AuthLayout variant="user">
      <AuthFormHeader
        title="This link has expired"
        description="Reset links are valid for 30 minutes and can only be used once."
      />

      <Notice
        type="warning"
        title="Request a fresh link"
        body="Your password has not been changed."
      />

      <Button className="w-full" onClick={() => navigate('/forgot')}>
        Send a new link
      </Button>
      <Button variant="ghost" className="w-full" onClick={() => navigate('/login')}>
        Back to sign in
      </Button>
    </AuthLayout>
  )
}

export default ResetExpired
