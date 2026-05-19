import { Navigate } from 'react-router-dom'
import useAuthStore from '../../stores/useAuthStore'

const Home = () => {
  const authUser = useAuthStore((state) => state.authUser)
  const loading = useAuthStore((state) => state.loading)
  const profile = useAuthStore((state) => state.profile)

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-background px-4 text-foreground">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading EISC Meet...</p>
        </div>
      </main>
    )
  }

  if (!authUser) {
    return <Navigate to="/login" replace />
  }

  if (!profile?.profileCompleted) {
    return <Navigate to="/complete-profile" replace />
  }

  return <Navigate to="/dashboard" replace />
}

export default Home
