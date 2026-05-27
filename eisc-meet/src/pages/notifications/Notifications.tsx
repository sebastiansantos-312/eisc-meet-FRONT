import { useMemo, useState } from "react";
import { AlertTriangle, Bell, CheckCheck, DoorOpen, MessageSquare, UserPlus, VideoOff } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardShell from "../../components/DashboardShell";

type ActivityNotification = {
  id: string;
  type: "presence" | "message" | "invite" | "system";
  title: string;
  detail: string;
  time: string;
  unread: boolean;
  actionLabel?: string;
  actionTo?: string;
};

const initialNotifications: ActivityNotification[] = [
  {
    id: "permissions",
    type: "system",
    title: "Verifica permisos de camara",
    detail: "Si el navegador bloquea los dispositivos, puedes reintentarlo desde Configuracion.",
    time: "Ahora",
    unread: true,
    actionLabel: "Abrir configuracion",
    actionTo: "/settings",
  },
  {
    id: "chat",
    type: "message",
    title: "Mensajes recientes en salas",
    detail: "El chat guarda historial y se recupera al volver a una sala.",
    time: "Hoy",
    unread: true,
    actionLabel: "Ver sesiones",
    actionTo: "/sessions",
  },
  {
    id: "presence",
    type: "presence",
    title: "Avisos de entrada y salida activos",
    detail: "Cuando alguien entra o sale de la sala aparece una notificacion temporal.",
    time: "Hoy",
    unread: false,
  },
  {
    id: "invite",
    type: "invite",
    title: "Invitaciones listas para integracion",
    detail: "El centro de actividad queda preparado para invitaciones guardadas en Firestore.",
    time: "Pendiente",
    unread: false,
  },
];

const Notifications = () => {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState<"all" | ActivityNotification["type"]>("all");

  const filteredNotifications = useMemo(() => {
    return filter === "all" ? notifications : notifications.filter((notification) => notification.type === filter);
  }, [filter, notifications]);
  const unreadCount = notifications.filter((notification) => notification.unread).length;

  const markAllRead = () => {
    setNotifications((current) => current.map((notification) => ({ ...notification, unread: false })));
  };

  return (
    <DashboardShell>
      <header className="border-b border-border bg-card px-4 py-5 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Centro de actividad</p>
            <h1 className="mt-1 text-2xl font-semibold text-card-foreground">Notificaciones</h1>
            <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
              Reune avisos de sala, mensajes, permisos e invitaciones sin depender de push notifications reales.
            </p>
          </div>
          <button type="button" onClick={markAllRead} className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 font-semibold transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary">
            <CheckCheck className="h-4 w-4" />
            Marcar leidas
          </button>
        </div>
      </header>

      <section className="grid gap-5 p-4 sm:p-6 xl:grid-cols-[18rem_1fr]">
        <aside className="h-fit rounded-lg border border-border bg-card p-4">
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-card-foreground">
            <Bell className="h-5 w-5 text-primary" />
            {unreadCount} sin leer
          </h2>
          <div className="space-y-2">
            <FilterButton label="Todas" active={filter === "all"} onClick={() => setFilter("all")} />
            <FilterButton label="Sala" active={filter === "presence"} onClick={() => setFilter("presence")} />
            <FilterButton label="Mensajes" active={filter === "message"} onClick={() => setFilter("message")} />
            <FilterButton label="Invitaciones" active={filter === "invite"} onClick={() => setFilter("invite")} />
            <FilterButton label="Sistema" active={filter === "system"} onClick={() => setFilter("system")} />
          </div>
        </aside>

        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <article key={notification.id} className="rounded-lg border border-border bg-card p-5">
              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
                  {iconForType(notification.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-card-foreground">{notification.title}</h2>
                    {notification.unread ? <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">Nuevo</span> : null}
                    <span className="ml-auto text-sm text-muted-foreground">{notification.time}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{notification.detail}</p>
                  {notification.actionTo && notification.actionLabel ? (
                    <Link to={notification.actionTo} className="mt-3 inline-flex rounded-lg bg-primary/10 px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-primary">
                      {notification.actionLabel}
                    </Link>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </DashboardShell>
  );
};

const iconForType = (type: ActivityNotification["type"]) => {
  if (type === "presence") return <DoorOpen className="h-5 w-5" />;
  if (type === "message") return <MessageSquare className="h-5 w-5" />;
  if (type === "invite") return <UserPlus className="h-5 w-5" />;
  return type === "system" ? <VideoOff className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />;
};

const FilterButton = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
      active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-card-foreground hover:bg-accent"
    }`}
  >
    {label}
  </button>
);

export default Notifications;
