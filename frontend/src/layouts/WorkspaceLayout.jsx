import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import Dialog from '../components/Dialog'
import Notice from '../components/Notice'
import currentUser from '../data/currentUser'

import assistantIcon from '../assets/icons/assistant.svg'
import calendarIcon from '../assets/icons/calendar.svg'
import dashboardIcon from '../assets/icons/dashboard.svg'
import draftsIcon from '../assets/icons/drafts.svg'
import notificationsIcon from '../assets/icons/notifications.svg'
import plansIcon from '../assets/icons/plans.svg'
import profileIcon from '../assets/icons/profile.svg'
import reportsIcon from '../assets/icons/reports.svg'
import settingsIcon from '../assets/icons/settings.svg'
import tasksIcon from '../assets/icons/tasks.svg'

// The signed in shell: sidebar on the left, top bar and page content on the right.
// Figma: node 8:2757 (profile) and 8:2839 (edit profile).

// Only "profile" is built in Sprint 1. The other links stay visible so the
// navigation matches the design, but they do nothing yet.
const navItems = [
  { key: 'dashboard', label: 'Dashboard', icon: dashboardIcon },
  { key: 'tasks', label: 'Tasks', icon: tasksIcon },
  { key: 'calendar', label: 'Calendar', icon: calendarIcon },
  { key: 'assistant', label: 'AI Assistant', icon: assistantIcon },
  { key: 'plans', label: 'AI Plans', icon: plansIcon },
  { key: 'drafts', label: 'Drafts', icon: draftsIcon },
  { key: 'notifications', label: 'Notifications', icon: notificationsIcon },
  { key: 'reports', label: 'Reports', icon: reportsIcon },
  { key: 'profile', label: 'Profile', icon: profileIcon, to: '/profile' },
  { key: 'settings', label: 'Settings', icon: settingsIcon },
]

function NavItem({ item, isActive, onNavigate }) {
  const isAvailable = Boolean(item.to)

  return (
    <button
      type="button"
      title={isAvailable ? undefined : 'Available in a later sprint'}
      onClick={() => isAvailable && onNavigate(item.to)}
      className={`flex w-full items-center gap-2 rounded-lg p-3 text-left outline-none
        focus-visible:border-2 focus-visible:border-brand
        ${isActive ? 'bg-brandsoft' : 'hover:bg-brandsoft'}
        ${isAvailable ? 'cursor-pointer' : 'cursor-default'}`}
    >
      <img src={item.icon} alt="" className="size-5 shrink-0" />
      <span className={`text-label ${isActive ? 'text-brand' : 'text-muted'}`}>
        {item.label}
      </span>
    </button>
  )
}

function Sidebar({ activeKey, onNavigate, onLogout }) {
  return (
    <div className="flex h-full w-[232px] shrink-0 flex-col gap-2 bg-white p-5">
      <p className="text-h2 whitespace-pre text-brand">◈&nbsp;&nbsp;momentum</p>
      <p className="text-tiny text-muted">YOUR WORKSPACE</p>
      <div className="h-px w-full bg-line" />

      {navItems.map((item) => (
        <NavItem
          key={item.key}
          item={item}
          isActive={item.key === activeKey}
          onNavigate={onNavigate}
        />
      ))}

      <div className="flex-1" />

      <Notice
        type="info"
        title="Your AI, your control"
        body="Review every draft before it becomes a task."
      />
      <p className="text-label whitespace-pre text-ink">
        {currentUser.initials}&nbsp;&nbsp;{currentUser.fullName}
      </p>
      <button
        type="button"
        onClick={onLogout}
        className="cursor-pointer text-left text-small text-muted hover:text-ink"
      >
        Log out ↗
      </button>
    </div>
  )
}

function WorkspaceLayout({ activeKey = 'profile', breadcrumb, children }) {
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLogoutOpen, setIsLogoutOpen] = useState(false)

  function handleNavigate(to) {
    setIsMenuOpen(false)
    navigate(to)
  }

  return (
    <div className="flex min-h-screen bg-canvas">
      {/* Sidebar, always visible from large screens up */}
      <div className="hidden lg:block">
        <div className="sticky top-0 h-screen">
          <Sidebar
            activeKey={activeKey}
            onNavigate={handleNavigate}
            onLogout={() => setIsLogoutOpen(true)}
          />
        </div>
      </div>

      {/* Sidebar as a slide over drawer on small screens */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink/40 lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        >
          <div className="h-full w-[232px]" onClick={(event) => event.stopPropagation()}>
            <Sidebar
              activeKey={activeKey}
              onNavigate={handleNavigate}
              onLogout={() => {
                setIsMenuOpen(false)
                setIsLogoutOpen(true)
              }}
            />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-19 items-center gap-4 bg-white p-6">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setIsMenuOpen(true)}
            className="cursor-pointer text-h2 text-ink lg:hidden"
          >
            ☰
          </button>

          <p className="flex-1 truncate text-small text-muted">{breadcrumb}</p>

          <Button variant="ghost" className="hidden sm:flex">
            Search
          </Button>
          <Button variant="secondary" className="hidden sm:flex whitespace-pre">
            Alerts&nbsp;&nbsp;3
          </Button>
          <Button variant="ghost">{currentUser.initials} ▾</Button>
        </div>

        <div className="flex flex-col gap-6 p-6 lg:p-8">{children}</div>
      </div>

      <Dialog
        open={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        title="Log out of Momentum?"
        description="Your saved work will be here when you return."
      >
        <div className="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            className="w-full sm:w-[180px]"
            onClick={() => setIsLogoutOpen(false)}
          >
            Cancel
          </Button>
          <Button
            className="w-full sm:w-[260px]"
            onClick={() => navigate('/logged-out')}
          >
            Confirm logout
          </Button>
        </div>
      </Dialog>
    </div>
  )
}

export default WorkspaceLayout
