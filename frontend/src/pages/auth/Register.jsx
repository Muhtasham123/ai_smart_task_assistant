import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthFormHeader from '../../components/AuthFormHeader'
import Button from '../../components/Button'
import Checkbox from '../../components/Checkbox'
import Field from '../../components/Field'
import ProgressBar from '../../components/ProgressBar'
import AuthLayout from '../../layouts/AuthLayout'
import { getPasswordStrength } from '../../utils/passwordStrength'

// US-01 · Create a new account. Figma node 8:369.

const emptyForm = {
  firstName: '',
  lastName: '',
  username: '',
  dateOfBirth: '',
  email: '',
  password: '',
  confirmPassword: '',
}

function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState(emptyForm)
  const [agreed, setAgreed] = useState(false)

  const strength = getPasswordStrength(form.password)

  function updateField(name, value) {
    setForm({ ...form, [name]: value })
  }

  function handleSubmit(event) {
    event.preventDefault()
    navigate('/registered')
  }

  return (
    <AuthLayout variant="user">
      <AuthFormHeader
        title="Create your account"
        description="Your tasks, plans and progress—all in one place."
      />

      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <Field
            label="First name *"
            placeholder="Saitama"
            className="flex-1"
            value={form.firstName}
            onChange={(event) => updateField('firstName', event.target.value)}
            required
          />
          <Field
            label="Last name *"
            placeholder="Khan"
            className="flex-1"
            value={form.lastName}
            onChange={(event) => updateField('lastName', event.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Field
            label="Username *"
            placeholder="saitama"
            className="flex-1"
            value={form.username}
            onChange={(event) => updateField('username', event.target.value)}
            required
          />
          <Field
            label="Date of birth *"
            type="date"
            className="flex-1"
            value={form.dateOfBirth}
            onChange={(event) => updateField('dateOfBirth', event.target.value)}
            required
          />
        </div>

        <Field
          label="Email *"
          type="email"
          placeholder="saitama@example.com"
          value={form.email}
          onChange={(event) => updateField('email', event.target.value)}
          required
        />

        <div className="flex flex-col gap-4 sm:flex-row">
          <Field
            label="Password *"
            type="password"
            placeholder="••••••••••••"
            className="flex-1"
            value={form.password}
            onChange={(event) => updateField('password', event.target.value)}
            required
          />
          <Field
            label="Confirm password *"
            type="password"
            placeholder="••••••••••••"
            className="flex-1"
            value={form.confirmPassword}
            onChange={(event) => updateField('confirmPassword', event.target.value)}
            required
          />
        </div>

        <ProgressBar percent={strength.percent} />
        <p className={`w-full text-small ${strength.isStrong ? 'text-teal' : 'text-muted'}`}>
          {strength.isStrong ? 'Strong · ' : ''}At least 8 characters, a number and a symbol
        </p>

        <Checkbox
          checked={agreed}
          onChange={setAgreed}
          label="I agree to the Terms of Service and Privacy Policy."
        />

        <Button type="submit" className="w-full" disabled={!agreed}>
          Create account
        </Button>
      </form>

      <Link to="/login" className="text-body text-brand">
        Already have an account? Sign in →
      </Link>
    </AuthLayout>
  )
}

export default Register
