import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/Button'
import Dialog from '../../components/Dialog'
import Field, { SelectField } from '../../components/Field'
import Notice from '../../components/Notice'
import WorkspaceLayout from '../../layouts/WorkspaceLayout'
import currentUser, { professions } from '../../data/currentUser'

// US-06 · Update your profile. Figma node 8:2839.
// Cancelling with unsaved edits opens the "Discard profile changes?" dialog.

function EditProfile() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    username: currentUser.username,
    firstName: currentUser.firstName,
    lastName: currentUser.lastName,
    dateOfBirth: currentUser.dateOfBirth,
    profession: currentUser.profession,
  })
  const [isDiscardOpen, setIsDiscardOpen] = useState(false)

  const hasChanges =
    form.username !== currentUser.username ||
    form.firstName !== currentUser.firstName ||
    form.lastName !== currentUser.lastName ||
    form.dateOfBirth !== currentUser.dateOfBirth ||
    form.profession !== currentUser.profession

  function updateField(name, value) {
    setForm({ ...form, [name]: value })
  }

  function handleSubmit(event) {
    event.preventDefault()
    navigate('/profile-saved')
  }

  function handleCancel() {
    if (hasChanges) {
      setIsDiscardOpen(true)
    } else {
      navigate('/profile')
    }
  }

  return (
    <WorkspaceLayout activeKey="profile" breadcrumb="Workspace / Edit your profile">
      <div className="flex flex-col gap-2">
        <h1 className="text-h1 text-ink">Edit your profile</h1>
        <p className="text-body text-muted">Keep your personal information up to date.</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex w-full flex-col gap-4 rounded-2xl border border-line bg-white p-6 xl:w-[800px]"
      >
        <Field
          label="Username *"
          value={form.username}
          onChange={(event) => updateField('username', event.target.value)}
          required
        />

        <div className="flex flex-col gap-4 sm:flex-row">
          <Field
            label="First name *"
            className="flex-1"
            value={form.firstName}
            onChange={(event) => updateField('firstName', event.target.value)}
            required
          />
          <Field
            label="Last name *"
            className="flex-1"
            value={form.lastName}
            onChange={(event) => updateField('lastName', event.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Field
            label="Date of birth"
            type="date"
            className="flex-1"
            value={form.dateOfBirth}
            onChange={(event) => updateField('dateOfBirth', event.target.value)}
          />
          <SelectField
            label="Profession"
            className="flex-1"
            options={professions}
            value={form.profession}
            onChange={(event) => updateField('profession', event.target.value)}
          />
        </div>

        <Notice
          type="info"
          title="Email is managed separately"
          body={`Your account email: ${currentUser.email}`}
        />

        <div className="flex flex-wrap gap-3">
          <Button type="submit" className="w-full sm:w-[170px]">
            Save changes
          </Button>
          <Button
            variant="secondary"
            className="w-full sm:w-[120px]"
            onClick={handleCancel}
          >
            Cancel
          </Button>
        </div>
      </form>

      <Dialog
        open={isDiscardOpen}
        onClose={() => setIsDiscardOpen(false)}
        title="Discard profile changes?"
        description="Your unsaved profile edits will be lost."
      >
        <div className="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            className="w-full sm:w-[180px]"
            onClick={() => setIsDiscardOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            className="w-full sm:w-[260px]"
            onClick={() => navigate('/profile')}
          >
            Discard changes
          </Button>
        </div>
      </Dialog>
    </WorkspaceLayout>
  )
}

export default EditProfile
