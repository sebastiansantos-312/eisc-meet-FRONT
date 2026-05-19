import { Link, Outlet, useLocation } from "react-router";
import {
  Video,
  Bell,
  Settings,
  LogOut,
  Home,
  User,
  Calendar,
  Users,
} from "lucide-react";

export function DashboardLayout() {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-background dark flex">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
        <div className="p-4 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Video className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-semibold text-sidebar-foreground">EISC Meet</h1>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          <NavItem
            to="/dashboard"
            icon={<Home className="w-5 h-5" />}
            label="Dashboard"
            active={isActive("/dashboard")}
          />
          <NavItem
            to="/sessions"
            icon={<Calendar className="w-5 h-5" />}
            label="My Sessions"
            active={isActive("/sessions")}
          />
          <NavItem
            to="/groups"
            icon={<Users className="w-5 h-5" />}
            label="Study Groups"
            active={isActive("/groups")}
          />
          <NavItem
            to="/profile"
            icon={<User className="w-5 h-5" />}
            label="Profile"
            active={isActive("/profile")}
          />
          <NavItem
            to="/settings"
            icon={<Settings className="w-5 h-5" />}
            label="Settings"
            active={isActive("/settings")}
          />
        </nav>

        <div className="p-3 border-t border-sidebar-border space-y-1">
          <NavItem
            to="/notifications"
            icon={<Bell className="w-5 h-5" />}
            label="Notifications"
            badge={3}
            active={isActive("/notifications")}
          />
          <Link to="/">
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-sidebar-primary text-sidebar-foreground hover:bg-sidebar-accent/50">
              <LogOut className="w-5 h-5" />
              <span className="flex-1 text-left text-sm font-medium">Sign Out</span>
            </button>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  badge?: number;
}

function NavItem({ to, icon, label, active, badge }: NavItemProps) {
  return (
    <Link to={to}>
      <button
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-sidebar-primary ${
          active
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground hover:bg-sidebar-accent/50"
        }`}
      >
        {icon}
        <span className="flex-1 text-left text-sm font-medium">{label}</span>
        {badge && (
          <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
            {badge}
          </span>
        )}
      </button>
    </Link>
  );
}
