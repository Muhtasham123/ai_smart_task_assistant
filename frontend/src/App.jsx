import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import ScreenIndex from './pages/ScreenIndex'
import AdminLogin from './pages/auth/AdminLogin'
import EmailSent from './pages/auth/EmailSent'
import Forgot from './pages/auth/Forgot'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import RegisterValidation from './pages/auth/RegisterValidation'
import Registered from './pages/auth/Registered'
import ResetExpired from './pages/auth/ResetExpired'
import ResetPassword from './pages/auth/ResetPassword'
import ResetSuccess from './pages/auth/ResetSuccess'
import EditProfile from './pages/profile/EditProfile'
import Profile from './pages/profile/Profile'
import StatusScreen from './pages/states/StatusScreen'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ScreenIndex />} />

        {/* Account access — US-01, US-02, US-04, US-34 */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register-validation" element={<RegisterValidation />} />
        <Route path="/registered" element={<Registered />} />
        <Route path="/forgot" element={<Forgot />} />
        <Route path="/email-sent" element={<EmailSent />} />
        <Route path="/reset" element={<ResetPassword />} />
        <Route path="/reset-success" element={<ResetSuccess />} />
        <Route path="/reset-expired" element={<ResetExpired />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Profile — US-05, US-06, US-07, US-08 */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/edit" element={<EditProfile />} />

        {/* Results, errors and loading states */}
        <Route path="/profile-saved" element={<StatusScreen name="profile-saved" />} />
        <Route path="/password-changed" element={<StatusScreen name="password-changed" />} />
        <Route path="/account-deleted" element={<StatusScreen name="account-deleted" />} />
        <Route path="/logged-out" element={<StatusScreen name="logged-out" />} />
        <Route path="/profile-error" element={<StatusScreen name="profile-error" />} />
        <Route path="/login-error" element={<StatusScreen name="login-error" />} />
        <Route path="/account-blocked" element={<StatusScreen name="account-blocked" />} />
        <Route path="/account-inactive" element={<StatusScreen name="account-inactive" />} />
        <Route path="/session-expired" element={<StatusScreen name="session-expired" />} />
        <Route path="/signing-in" element={<StatusScreen name="signing-in" />} />
        <Route path="/admin/login-error" element={<StatusScreen name="admin-login-error" />} />
        <Route path="/admin/signing-in" element={<StatusScreen name="admin-signing-in" />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
