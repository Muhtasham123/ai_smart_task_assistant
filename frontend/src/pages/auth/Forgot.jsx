import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthFormHeader from '../../components/AuthFormHeader'
import Button from '../../components/Button'
import Field from '../../components/Field'
import AuthLayout from '../../layouts/AuthLayout'

// US-04 · Ask for a password reset link. Figma node 8:42.

function Forgot() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    navigate('/email-sent')
  }

  return (
    <AuthLayout variant="user">
      <AuthFormHeader
        title="Forgot your password?"
        description="Enter your email and we’ll send a secure reset link."
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
        <Button type="submit" className="w-full">
          Send reset link
        </Button>
        <Button variant="ghost" className="w-full" onClick={() => navigate('/login')}>
          Back to sign in
        </Button>
      </form>
    </AuthLayout>
  )
}

export default Forgot
