import { createBrowserRouter } from 'react-router-dom'
import Home from '../pages/home/Home'
import Login from '../pages/login/Login'
import Register from '../pages/register/Register'
import Dashboard from '../pages/dashboard/Dashboard'
import Groups from '../pages/dashboard/Groups'
import Room from '../pages/room/Room'
import Profile from '../pages/profile/Profile'
import CompleteProfile from '../pages/complete-profile/CompleteProfile'
import Sessions from '../pages/sessions/Sessions'
import Settings from '../pages/settings/Settings'
import Notifications from '../pages/notifications/Notifications'
import NotFound from '../pages/not-found/NotFound'
import ProtectedRoute from '../components/ProtectedRoute'

export const router = createBrowserRouter([
  { path: '/',             element: <Home /> },
  { path: '/login',        element: <Login /> },
  { path: '/register',     element: <Register /> },
  { path: '/complete-profile', element: <ProtectedRoute requireCompleteProfile={false}><CompleteProfile /></ProtectedRoute> },
  { path: '/dashboard',    element: <ProtectedRoute><Dashboard /></ProtectedRoute> },
  { path: '/groups',       element: <ProtectedRoute><Groups /></ProtectedRoute> },
  { path: '/sessions',     element: <ProtectedRoute><Sessions /></ProtectedRoute> },
  { path: '/settings',     element: <ProtectedRoute><Settings /></ProtectedRoute> },
  { path: '/notifications', element: <ProtectedRoute><Notifications /></ProtectedRoute> },
  { path: '/room/:roomId', element: <ProtectedRoute><Room /></ProtectedRoute> },
  { path: '/profile',      element: <ProtectedRoute><Profile /></ProtectedRoute> },
  { path: '*',             element: <NotFound /> },
])
