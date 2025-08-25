import Activate from '@/pages/auth/Activate'
import Profile from '@/pages/auth/Profile'
import HostStatus from '@/pages/auth/HostStatus'
import ForgotPassword from '@/pages/auth/ForgotPassword'
import ProtectedRoute from '@/components/ProtectedRoute'
import AuthPage from '@/pages/auth/AuthPage'

// Mảng route config
const routeConfig = [
  { path: '/', element: <div>Home</div> },

  { path: '/login', element: <AuthPage />, guestOnly: true },
  { path: '/activate', element: <Activate /> },
  { path: '/forgot-password', element: <ForgotPassword />, guestOnly: true },

  // User
  { path: '/profile', element: <Profile />, protected: true },
  { path: '/host-status', element: <HostStatus />, protected: true },

  { path: '*', element: <div>Not Found</div> },
]

export default routeConfig
