import AuthPage from '@/pages/auth/AuthPage'
import ProfilePage from '@/pages/auth/ProfilePage'
import EmptyLayout from '@/components/layout/EmptyLayout.jsx'
import DefaultLayout from '@/components/layout/DefaultLayout.jsx'
import AdminPage from '@/pages/admin/Admin'
import ProtectedRoute from '@/components/ProtectedRoute'
import Forbidden403 from '@/pages/error/Forbidden403'
import HostPage from '@/pages/host/Host'
const routeConfig = [
  { path: '/', element: <div>Home</div>, layout: DefaultLayout },
  { path: '/login', element: <AuthPage />, layout: EmptyLayout },
  // { path: '/activate', element: <Activate /> },
  // { path: '/forgot-password', element: <ForgotPassword />, guestOnly: true },

  // User
  { path: '/profile', element: <ProfilePage />, layout: DefaultLayout },

  // Admin
  {
    path: '/admin',
    element: (
      <ProtectedRoute roles="ADMIN">
        <AdminPage />
      </ProtectedRoute>
    ),
    layout: EmptyLayout,
  },
  // Host
  {
    path: 'host',
    element: (
      <ProtectedRoute roles={['ADMIN', 'HOST']}>
        <HostPage />
      </ProtectedRoute>
    ),
    layout: EmptyLayout,
  },

  // { path: '/host-status', element: <HostStatus />, protected: true },

  { path: '*', element: <div>Not Found</div> },

  // Error
  { path: '/forbidden403', element: <Forbidden403 />, layout: DefaultLayout },
]

export default routeConfig
