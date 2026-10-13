import { useNavigate } from 'react-router-dom'
import AuthFormHeader from '../../components/AuthFormHeader'
import Button from '../../components/Button'
import Notice from '../../components/Notice'
import AuthLayout from '../../layouts/AuthLayout'
import currentUser from '../../data/currentUser'

// US-04 · Confirmation that the reset email went out. Figma node 8:70.

function EmailSent() {
  const navigate = useNavigate()

  return (
    <AuthLayout variant="user">
      <AuthFormHeader
        title="Check your inbox"
        description={`A reset link has been sent to ${currentUser.email}.`}
      />

      <Notice
        type="success"
        title="Reset link sent"
        body="The link expires in 30 minutes. Check your spam folder if you don’t see it."
      />

      <Button className="w-full" onClick={() => navigate('/reset')}>
        Open reset preview
      </Button>
      <Button variant="secondary" className="w-full">
        Resend email
      </Button>
      <Button variant="ghost" className="w-full" onClick={() => navigate('/login')}>
        Back to sign in
      </Button>
    </AuthLayout>
  )
}

export default EmailSent
