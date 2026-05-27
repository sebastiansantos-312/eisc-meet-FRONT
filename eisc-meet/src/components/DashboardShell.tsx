import type { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Bell, Calendar, Home, LogOut, Settings, User, Users, Video } from "lucide-react";
import useAuthStore from "../stores/useAuthStore";

type DashboardShellProps = {
  children: ReactNode;
};

type NavItemProps = {
  to: string;
  icon: ReactNode;
  label: string;
  badge?: number;
};

const navItems = [
  { to: "/dashboard", icon: <Home className="h-5 w-5" />, label: "Inicio" },
  { to: "/sessions", icon: <Calendar className="h-5 w-5" />, label: "Sesiones" },
  { to: "/groups", icon: <Users className="h-5 w-5" />, label: "Grupos de estudio" },
  { to: "/profile", icon: <User className="h-5 w-5" />, label: "Perfil" },
];

const secondaryItems = [
  { to: "/settings", icon: <Settings className="h-5 w-5" />, label: "Configuracion" },
  { to: "/notifications", icon: <Bell className="h-5 w-5" />, label: "Notificaciones", badge: 2 },
];

const DashboardShell = ({ children }: DashboardShellProps) => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background text-foreground lg:flex">
      <a href="#contenido-principal" className="skip-link">
        Saltar al contenido principal
      </a>
      <aside className="border-sidebar-border bg-sidebar text-sidebar-foreground lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-64 lg:flex-col lg:border-r">
        <div className="flex items-center justify-between border-b border-sidebar-border p-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary" aria-hidden="true">
              <Video className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">EISC Meet</span>
          </Link>
        </div>

        <nav className="flex gap-2 overflow-x-auto p-3 lg:flex-1 lg:flex-col lg:overflow-visible" aria-label="Navegacion principal">
          {navItems.map((item) => (
            <NavItem key={item.label} {...item} />
          ))}
          <div className="flex gap-2 lg:hidden">
            {secondaryItems.map((item) => (
              <NavItem key={item.label} {...item} />
            ))}
          </div>
        </nav>

        <div className="hidden border-t border-sidebar-border p-3 lg:block">
          <div className="space-y-1">
            {secondaryItems.map((item) => (
              <NavItem key={item.label} {...item} />
            ))}
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent/50 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <LogOut className="h-5 w-5" aria-hidden="true" />
              Cerrar sesion
            </button>
          </div>
        </div>
      </aside>

      <main id="contenido-principal" className="min-h-screen flex-1 lg:pl-64" tabIndex={-1}>{children}</main>
    </div>
  );
};

const NavItem = ({ to, icon, label, badge }: NavItemProps) => {
  const location = useLocation();
  const active = location.pathname === to;

  return (
    <Link
      to={to}
      aria-current={active ? "page" : undefined}
      className={`flex min-w-max items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-accent/50"
      }`}
    >
      <span aria-hidden="true">{icon}</span>
      <span className="flex-1">{label}</span>
      {badge ? <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground" aria-label={`${badge} notificaciones`}>{badge}</span> : null}
    </Link>
  );
};

export default DashboardShell;
