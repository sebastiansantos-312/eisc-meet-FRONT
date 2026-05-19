import { Link } from "react-router";
import { Video, Users, MessageSquare, BookOpen, Monitor, Calendar } from "lucide-react";

export function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20 dark">
      {/* Navigation */}
      <nav className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Video className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-semibold text-foreground">EISC Meet</h1>
            </div>
            <div className="flex gap-3">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-lg"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-5xl font-bold text-foreground mb-6">
            Collaborative Study,
            <br />
            <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
              Reimagined
            </span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Connect with classmates, share knowledge, and achieve academic excellence together in real-time study rooms designed for focused collaboration.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/register"
              className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
            >
              Create Free Account
            </Link>
            <Link
              to="/login"
              className="px-8 py-3 bg-card text-card-foreground border border-border rounded-lg font-medium hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Video className="w-6 h-6" />}
            title="HD Video Calls"
            description="Crystal clear video quality with adaptive streaming for seamless collaboration"
          />
          <FeatureCard
            icon={<MessageSquare className="w-6 h-6" />}
            title="Real-time Chat"
            description="Instant messaging with file sharing and rich text formatting support"
          />
          <FeatureCard
            icon={<Users className="w-6 h-6" />}
            title="Study Groups"
            description="Create and join dedicated study rooms for your courses and subjects"
          />
          <FeatureCard
            icon={<Monitor className="w-6 h-6" />}
            title="Screen Sharing"
            description="Share your screen to explain concepts and work through problems together"
          />
          <FeatureCard
            icon={<BookOpen className="w-6 h-6" />}
            title="Academic Focus"
            description="Purpose-built for students with distraction-free study environment"
          />
          <FeatureCard
            icon={<Calendar className="w-6 h-6" />}
            title="Session History"
            description="Track your study sessions and review past collaborations"
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-sm text-muted-foreground">
            © 2026 EISC Meet. Built for collaborative academic excellence.
          </p>
        </div>
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors group">
      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="font-semibold text-card-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
