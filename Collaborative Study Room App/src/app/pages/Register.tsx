import { Link, useNavigate } from "react-router";
import { Video, Mail, Lock, User } from "lucide-react";
import { FormEvent } from "react";

export function Register() {
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20 dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Video className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">EISC Meet</h1>
        </Link>

        {/* Register Card */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-card-foreground mb-2">Create your account</h2>
            <p className="text-sm text-muted-foreground">Join thousands of students studying together</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-card-foreground mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="fullName"
                  type="text"
                  required
                  placeholder="Jane Smith"
                  className="w-full pl-10 pr-4 py-2.5 bg-input-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-card-foreground mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="student@university.edu"
                  className="w-full pl-10 pr-4 py-2.5 bg-input-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-card-foreground mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="Create a strong password"
                  className="w-full pl-10 pr-4 py-2.5 bg-input-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-card-foreground mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  placeholder="Confirm your password"
                  className="w-full pl-10 pr-4 py-2.5 bg-input-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="flex items-start gap-2">
              <input
                id="terms"
                type="checkbox"
                required
                className="mt-1 w-4 h-4 rounded border-input text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0 cursor-pointer"
              />
              <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
                I agree to the Terms of Service and Privacy Policy
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card"
            >
              Create Account
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-card text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              className="w-full py-3 bg-card border border-border rounded-lg font-medium text-card-foreground hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign up with Google
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:text-primary/80 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card rounded">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
