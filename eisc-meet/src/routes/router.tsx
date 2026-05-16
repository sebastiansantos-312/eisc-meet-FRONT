import { createBrowserRouter } from 'react-router-dom'
import Home from '../pages/home/Home'
import Login from '../pages/login/Login'
import Register from '../pages/register/Register'
import Dashboard from '../pages/dashboard/Dashboard'
import Room from '../pages/room/Room'
import Profile from '../pages/profile/Profile'
import NotFound from '../pages/not-found/NotFound'

export const router = createBrowserRouter([
  { path: '/',             element: <Home /> },
  { path: '/login',        element: <Login /> },
  { path: '/register',     element: <Register /> },
  { path: '/dashboard',    element: <Dashboard /> },
  { path: '/room/:roomId', element: <Room /> },
  { path: '/profile',      element: <Profile /> },
  { path: '*',             element: <NotFound /> },
])
