import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import Dialog from '../../components/Dialog'
import Field from '../../components/Field'
import ProgressBar from '../../components/ProgressBar'
import WorkspaceLayout from '../../layouts/WorkspaceLayout'
import currentUser from '../../data/currentUser'
import { getPasswordStrength } from '../../utils/passwordStrength'

// US-05 · View your profile. Figma node 8:2757.
// Also hosts the Change password (US-07) and Delete account (US-08) dialogs.

function DetailRow({ label, value }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:gap-6">
      <p className="w-full text-small text-muted sm:w-[180px] sm:shrink-0">{label}</p>
      <p className="flex-1 text-label text-ink">{value}</p>
    </div>
  )
}

function ChangePasswordDialog({ open, onClose }) {
  const navigate = useNavigate()
  const [newPassword, setNewPassword] = useState('')
  const strength = getPasswordStrength(newPassword)

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Change password"
      description="Use a unique password to protect your account."
    >
      <Field label="Current password *" type="password" placeholder="••••••••••" />
      <Field
        label="New password *"
        type="password"
        placeholder="••••••••••••"
        value={newPassword}
        onChange={(event) => setNewPassword(event.target.value)}
      />

      <ProgressBar percent={strength.percent} />
      <p className={`w-full text-small ${strength.isStrong ? 'text-teal' : 'text-muted'}`}>
        {strength.isStrong ? 'Strong · ' : ''}8+ characters · Uppercase · Number · Symbol
      </p>

      <Field label="Confirm new password *" type="password" placeholder="••••••••••••" />

      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" className="w-full sm:w-[180px]" onClick={onClose}>
          Cancel
        </Button>
        <Button className="w-full sm:w-[240px]" onClick={() => navigate('/password-changed')}>
          Change password
        </Button>
      </div>
    </Dialog>
  )
}

function DeleteAccountDialog({ open, onClose }) {
  const navigate = useNavigate()
  const [confirmation, setConfirmation] = useState('')

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Delete your account?"
      description="This permanently deletes your tasks, drafts, plans, notifications and reports. This action cannot be undone."
    >
      <Field
        label="Type DELETE to confirm *"
        placeholder="DELETE"
        value={confirmation}
        onChange={(event) => setConfirmation(event.target.value)}
      />

      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" className="w-full sm:w-[180px]" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="danger"
          className="w-full sm:w-[260px]"
          disabled={confirmation !== 'DELETE'}
          onClick={() => navigate('/account-deleted')}
        >
          Delete my account
        </Button>
      </div>
    </Dialog>
  )
}

function Profile() {
  const navigate = useNavigate()
  const [isPasswordOpen, setIsPasswordOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  return (
    <WorkspaceLayout activeKey="profile" breadcrumb="Workspace / Your profile">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="flex flex-1 flex-col gap-2">
          <h1 className="text-h1 text-ink">Your profile</h1>
          <p className="text-body text-muted">A personal workspace that feels like you.</p>
        </div>
        <Button className="w-[154px]" onClick={() => navigate('/profile/edit')}>
          Edit profile
        </Button>
      </div>

      <div className="flex flex-col gap-6 xl:flex-row">
        <div className="flex w-full flex-col gap-4 rounded-2xl border border-line bg-white p-6 xl:w-[360px] xl:shrink-0">
          <p className="text-hero text-brand">{currentUser.initials}</p>
          <p className="text-h2 text-ink">{currentUser.fullName}</p>
          <p className="text-body text-muted">@{currentUser.username}</p>
          <Badge status="active">{currentUser.status}</Badge>
          <p className="text-small text-muted">
            {currentUser.profession} · Member since {currentUser.memberSince}
          </p>
        </div>

        <div className="flex w-full flex-col gap-4 rounded-2xl border border-line bg-white p-6 xl:w-[760px]">
          <DetailRow label="User ID" value={currentUser.userId} />
          <DetailRow label="Username" value={currentUser.username} />
          <DetailRow label="First name" value={currentUser.firstName} />
          <DetailRow label="Last name" value={currentUser.lastName} />
          <DetailRow label="Date of birth" value={currentUser.dateOfBirthLabel} />
          <DetailRow label="Email" value={currentUser.email} />
          <DetailRow label="Profession" value={currentUser.profession} />

          <div className="flex flex-wrap gap-3">
            <Button
              variant="secondary"
              className="w-full sm:w-[200px]"
              onClick={() => setIsPasswordOpen(true)}
            >
              Change password
            </Button>
            <Button
              variant="danger"
              className="w-full sm:w-[170px]"
              onClick={() => setIsDeleteOpen(true)}
            >
              Delete account
            </Button>
          </div>
        </div>
      </div>

      <ChangePasswordDialog
        open={isPasswordOpen}
        onClose={() => setIsPasswordOpen(false)}
      />
      <DeleteAccountDialog open={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} />
    </WorkspaceLayout>
  )
}

export default Profile
