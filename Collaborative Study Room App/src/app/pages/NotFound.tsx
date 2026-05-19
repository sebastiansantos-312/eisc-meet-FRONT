import { Link } from "react-router";
import { Video, Home, Search } from "lucide-react";

export function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20 dark flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <Link to="/" className="inline-flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Video className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">EISC Meet</h1>
        </Link>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <Search className="w-10 h-10 text-primary" />
          </div>

          <h2 className="text-3xl font-semibold text-card-foreground mb-3">Page Not Found</h2>
          <p className="text-muted-foreground mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/dashboard"
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card inline-flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Go to Dashboard
            </Link>
            <Link
              to="/"
              className="px-6 py-3 bg-card border border-border rounded-lg font-medium text-card-foreground hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card"
            >
              Back to Home
            </Link>
          </div>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          Error 404 - This page could not be found
        </p>
      </div>
    </div>
  );
}
