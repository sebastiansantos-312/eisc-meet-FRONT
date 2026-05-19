import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Mail, Video } from "lucide-react";
import useAuthStore from "../../stores/useAuthStore";

const Login = () => {
  const navigate = useNavigate();
  const { error, loading, loginWithEmail, loginWithGoogle, clearError } = useAuthStore();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearError();

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    try {
      const profile = await loginWithEmail(email, password);
      navigate(profile.profileCompleted ? "/dashboard" : "/complete-profile");
    } catch {
      // El store expone el mensaje para la UI.
    }
  };

  const handleGoogleLogin = async () => {
    clearError();

    try {
      const profile = await loginWithGoogle();
      navigate(profile.profileCompleted ? "/dashboard" : "/complete-profile");
    } catch {
      // El store expone el mensaje para la UI.
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-accent/20 p-4">
      <section className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary">
            <Video className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-semibold text-foreground">EISC Meet</span>
        </Link>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-lg">
          <div className="mb-6">
            <h1 className="mb-2 text-2xl font-semibold text-card-foreground">Welcome back</h1>
            <p className="text-sm text-muted-foreground">Sign in to continue your study sessions</p>
          </div>

          {error ? (
            <div className="mb-5 rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-card-foreground">Email Address</span>
              <span className="relative block">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="student@university.edu"
                  className="w-full rounded-lg border border-input bg-input-background py-2.5 pl-10 pr-4 text-foreground placeholder:text-muted-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </span>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-card-foreground">Password</span>
              <span className="relative block">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="Enter your password"
                  className="w-full rounded-lg border border-input bg-input-background py-2.5 pl-10 pr-4 text-foreground placeholder:text-muted-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </span>
            </label>

            <div className="flex items-center justify-between text-sm">
              <label className="flex cursor-pointer items-center gap-2 text-muted-foreground">
                <input type="checkbox" className="h-4 w-4 rounded border-input text-primary focus:ring-primary" />
                Remember me
              </label>
              <button type="button" className="text-primary transition-colors hover:text-primary/80">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary py-3 font-medium text-primary-foreground transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <div className="relative py-1">
              <div className="absolute inset-x-0 top-1/2 border-t border-border" />
              <div className="relative flex justify-center text-sm">
                <span className="bg-card px-4 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={handleGoogleLogin}
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-card py-3 font-medium text-card-foreground transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="grid h-5 w-5 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">G</span>
              {loading ? "Connecting..." : "Sign in with Google"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/register" className="font-medium text-primary transition-colors hover:text-primary/80">
              Sign up
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
};

export default Login;
